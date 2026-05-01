from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager

from app.students.entity import Student
from app.students.model import StudentModel
from app.users.model import UserModel
from app.users.repository import UserRepository


class StudentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_user_id(self, user_id: UUID) -> Student | None:
        model = await self._session.scalar(
            select(StudentModel)
            .join(StudentModel.user)
            .options(contains_eager(StudentModel.user))
            .where(StudentModel.user_id == user_id, UserModel.deleted_at.is_(None))
        )

        if model is None:
            return None

        return self._to_entity(model)

    async def save(self, student: Student) -> None:
        model = self._to_model(student)
        self._session.add(model)

    async def update(self, student: Student) -> None:
        await self._session.execute(
            update(StudentModel)
            .where(StudentModel.user_id == student.user.id)
            .values(
                nim=student.nim,
                faculty=student.faculty,
                department=student.department,
                updated_at=student.updated_at,
            )
        )

    @staticmethod
    def _to_entity(model: StudentModel) -> Student:
        return Student(
            user=UserRepository.to_entity(model.user),
            nim=model.nim,
            faculty=model.faculty,
            department=model.department,
            updated_at=model.updated_at,
            created_at=model.created_at,
        )

    @staticmethod
    def _to_model(student: Student) -> StudentModel:
        return StudentModel(
            user_id=student.user.id,
            nim=student.nim,
            faculty=student.faculty,
            department=student.department,
            updated_at=student.updated_at,
            created_at=student.created_at,
        )
