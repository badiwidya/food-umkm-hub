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
)
async def get_me(student: CurrentStudentDep) -> StudentResponse:
    return StudentResponse.model_validate({**asdict(student.user), **asdict(student)})


@student_router.patch(
    "/me",
    summary="Memperbarui informasi akademik mahasiswa yang sedang login.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def update(
    student_service: StudentServiceDep,
    student: CurrentStudentDep,
    payload: UpdateStudentRequest,
) -> None:
    await student_service.update_information(
        student, payload.model_dump(exclude_unset=True)
    )
