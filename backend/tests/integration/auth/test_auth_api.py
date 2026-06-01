from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.students.repository import StudentRepository
from app.users.repository import UserRepository


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def test_register_student_creates_student_and_queues_verification_email(
    client: AsyncClient,
    db_session: AsyncSession,
    celery_delay_calls: dict,
) -> None:
    response = await client.post(
        "/auth/student/register",
        json={
            "fullName": "Demo Student",
            "email": "new-student@example.com",
            "phoneNumber": "+6281234567800",
            "password": "password123",
            "nim": "g64000099",
            "faculty": "FMIPA",
            "department": "Ilmu Komputer",
        },
    )

    assert response.status_code == 201
    user = await UserRepository(db_session).get_by_email("new-student@example.com")
    assert user is not None
    student = await StudentRepository(db_session).get_by_user_id(user.id)
    assert student is not None
    assert student.nim == "G64000099"
    assert celery_delay_calls["send_verification_email"][0]["kwargs"]["to"] == (
        "new-student@example.com"
    )


async def test_login_verified_user_returns_access_token(
    client: AsyncClient,
    verified_student_user,
    password: str,
) -> None:
    response = await client.post(
        "/auth/login",
        json={"email": verified_student_user.email, "password": password},
    )

    assert response.status_code == 200
    assert response.json()["accessToken"]


async def test_login_unverified_registered_user_is_rejected(
    client: AsyncClient,
    celery_delay_calls: dict,
) -> None:
    await client.post(
        "/auth/student/register",
        json={
            "fullName": "Unverified Student",
            "email": "unverified@example.com",
            "phoneNumber": "+6281234567801",
            "password": "password123",
            "nim": "G64000100",
            "faculty": "FMIPA",
            "department": "Ilmu Komputer",
        },
    )

    response = await client.post(
        "/auth/login",
        json={"email": "unverified@example.com", "password": "password123"},
    )

    assert response.status_code == 401
    assert response.json()["type"] == "email_unverified"
    assert len(celery_delay_calls["send_verification_email"]) == 1


async def test_register_student_rejects_duplicate_email(
    client: AsyncClient,
    verified_student_user,
) -> None:
    response = await client.post(
        "/auth/student/register",
        json={
            "fullName": "Duplicate Student",
            "email": verified_student_user.email,
            "phoneNumber": "+6281234567802",
            "password": "password123",
            "nim": "G64000101",
            "faculty": "FMIPA",
            "department": "Ilmu Komputer",
        },
    )

    assert response.status_code == 400
    assert response.json()["type"] == "email_taken"
