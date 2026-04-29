from dataclasses import asdict
from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.auth.dependency import get_current_student
from app.students.dependency import get_student_service
from app.students.entity import Student
from app.students.schema import StudentResponse, UpdateStudentRequest
from app.students.service import StudentService

student_router = APIRouter(prefix="/students", tags=["Students"])

CurrentStudentDep = Annotated[Student, Depends(get_current_student)]


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
    student_service: Annotated[StudentService, Depends(get_student_service)],
) -> None:
    await student_service.change_academic_informations(
        student, payload.model_dump(exclude_unset=True)
    )
