from typing import Annotated

from fastapi import Depends

from app.dependency import SessionDep
from app.students.repository import StudentRepository
from app.students.service import StudentService


def get_student_repo(
    session: SessionDep,
) -> StudentRepository:
    return StudentRepository(session=session)


StudentRepoDep = Annotated[StudentRepository, Depends(get_student_repo)]


def get_student_service(
    student_repo: StudentRepoDep,
) -> StudentService:
    return StudentService(student_repo=student_repo)


StudentServiceDep = Annotated[StudentService, Depends(get_student_service)]
