from typing import Any
from uuid import UUID

from app.sentinel import UNSET
from app.students.entity import Student
from app.students.repository import StudentRepository


class StudentService:
    def __init__(self, student_repo: StudentRepository) -> None:
        self._student_repo = student_repo

    async def get_by_user_id(self, user_id: UUID) -> Student | None:
        return await self._student_repo.get_by_user_id(user_id)

    async def update_information(
        self, student: Student, updates: dict[str, Any]
    ) -> Student:
        student.change_academic_info(
            updates.get("nim", UNSET),
            updates.get("faculty", UNSET),
            updates.get("department", UNSET),
        )

        await self._student_repo.update(student)
        return student
