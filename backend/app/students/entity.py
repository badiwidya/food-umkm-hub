from dataclasses import dataclass, field
from datetime import UTC, datetime

from app.exception import DomainException
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
        normalized_nim = nim.strip().upper()
        if not normalized_nim:
            raise DomainException("NIM tidak boleh kosong")

        normalized_faculty = faculty.strip()
        if not normalized_faculty:
            raise DomainException("Fakultas tidak boleh kosong")

        normalized_department = department.strip()
        if not normalized_department:
            raise DomainException("Departemen tidak boleh kosong.")

        return cls(
            user=user,
            nim=normalized_nim,
            faculty=normalized_faculty,
            department=normalized_department,
        )

    def change_academic_info(
        self,
        nim: str | TUnset = UNSET,
        faculty: str | TUnset = UNSET,
        department: str | TUnset = UNSET,
    ) -> None:
        has_changed = False

        if not isinstance(nim, TUnset):
            normalized_nim = nim.strip().upper()
            if not normalized_nim:
                raise DomainException("NIM tidak boleh kosong")
            if normalized_nim != self.nim:
                self.nim = normalized_nim
                has_changed = True

        if not isinstance(faculty, TUnset):
            normalized_faculty = faculty.strip()
            if not normalized_faculty:
                raise DomainException("Fakultas tidak boleh kosong")
            if normalized_faculty != self.faculty:
                self.faculty = normalized_faculty
                has_changed = True

        if not isinstance(department, TUnset):
            normalized_department = department.strip()
            if not normalized_department:
                raise DomainException("Departemen tidak boleh kosong")
            if normalized_department != self.department:
                self.department = normalized_department
                has_changed = True

        if has_changed:
            self.updated_at = datetime.now(UTC)
