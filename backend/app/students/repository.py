from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import contains_eager

from app.domains.student import Student
from app.students.model import StudentModel
from app.users.model import UserModel


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
        # TODO: double db trip
        student_id = await self._session.scalar(
            select(StudentModel.id)
            .select_from(StudentModel)
            .where(StudentModel.user_id == student.id)
        )
        # TODO: Bad error handling
        if student_id is None:
            raise Exception()
        model = self._to_model(student)
        model.id = student_id
        await self._session.merge(model)

    @staticmethod
    def _to_entity(model: StudentModel) -> Student:
        return Student(
            id=model.user.id,
            full_name=model.user.full_name,
            avatar_url=model.user.avatar_url,
            email=model.user.email,
            pending_email=model.user.pending_email,
            phone_number=model.user.phone_number,
            password_hash=model.user.password_hash,
            status=model.user.status,
            role=model.user.role,
            email_verified_at=model.user.email_verified_at,
            phone_verified_at=model.user.phone_verified_at,
            nim=model.nim,
            faculty=model.faculty,
            department=model.department,
            updated_at=model.user.updated_at,
            created_at=model.user.created_at,
            deleted_at=model.user.deleted_at,
        )

    @staticmethod
    def _to_model(student: Student) -> StudentModel:
        return StudentModel(
            user_id=student.id,
            nim=student.nim,
            faculty=student.faculty,
            department=student.department,
            user=UserModel(
                id=student.id,
                full_name=student.full_name,
                avatar_url=student.avatar_url,
                email=student.email,
                pending_email=student.pending_email,
                phone_number=student.phone_number,
                password_hash=student.password_hash,
                role=student.role,
                status=student.status,
                email_verified_at=student.email_verified_at,
                phone_verified_at=student.phone_verified_at,
                updated_at=student.updated_at,
                created_at=student.created_at,
                deleted_at=student.deleted_at,
            ),
        )
