from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependency import get_db_session
from app.students.repository import StudentRepository
from app.students.service import StudentService


def get_student_repo(
    session: Annotated[AsyncSession, Depends(get_db_session)],
) -> StudentRepository:
    return StudentRepository(session=session)


def get_student_service(
    student_repo: Annotated[StudentRepository, Depends(get_student_repo)],
) -> StudentService:
    return StudentService(student_repo=student_repo)
