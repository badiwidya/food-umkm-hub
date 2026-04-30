from dataclasses import dataclass, field
from datetime import UTC, datetime

from app.sentinel import UNSET, TUnset
from app.users.entity import User


@dataclass(kw_only=True)
class Student:
    user: User
    nim: str
    faculty: str
    department: str
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @classmethod
    def create(cls, user: User, nim: str, faculty: str, department: str) -> Student:
        return cls(
            user=user,
            nim=nim.strip().upper(),
            faculty=faculty.strip(),
            department=department.strip(),
        )

    def change_academic_informations(
        self,
        nim: str | TUnset = UNSET,
        faculty: str | TUnset = UNSET,
        department: str | TUnset = UNSET,
    ) -> None:
        has_changed = False

        if not isinstance(nim, TUnset):
            if nim.strip().upper() != self.nim:
                self.nim = nim.strip().upper()
                has_changed = True

        if not isinstance(faculty, TUnset):
            if faculty.strip() != self.faculty:
                self.faculty = faculty.strip()
                has_changed = True

        if not isinstance(department, TUnset):
            if department.strip() != self.department:
                self.department = department.strip()
                has_changed = True

        if has_changed:
            self.updated_at = datetime.now(UTC)
