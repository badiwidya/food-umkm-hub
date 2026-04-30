from dataclasses import asdict

from fastapi import APIRouter, status

from app.auth.dependency import CurrentStudentDep
from app.students.dependency import StudentServiceDep
from app.students.schema import StudentResponse, UpdateStudentRequest

student_router = APIRouter(prefix="/students", tags=["Students"])


@student_router.get(
    "/me",
    summary="Mendapatkan data mahasiswa yang sedang login",
    status_code=status.HTTP_200_OK,
    response_model=StudentResponse,
)
async def get_me(student: CurrentStudentDep) -> dict:
    return {**asdict(student.user), **asdict(student)}


@student_router.patch(
    "/me",
    summary="Memperbarui informasi akademik mahasiswa yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def update(
    payload: UpdateStudentRequest,
    student: CurrentStudentDep,
    student_service: StudentServiceDep,
) -> None:
    await student_service.change_academic_informations(
        student, payload.model_dump(exclude_unset=True)
    )
