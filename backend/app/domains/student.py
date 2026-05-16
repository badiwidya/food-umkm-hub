from dataclasses import dataclass
from datetime import UTC, datetime

from app.domains.user import User, UserRole
from app.exception import DomainException
from app.sentinel import UNSET, TUnset


@dataclass(kw_only=True)
class Student(User):
    role = UserRole.STUDENT
    nim: str
    faculty: str
    department: str

    @classmethod
    def register(
        cls,
        full_name: str,
        email: str,
        phone_number: str,
        password_hash: str,
        nim: str,
        faculty: str,
        department: str,
    ) -> Student:
        normalized_user_fields = cls._register_validate(full_name, email, phone_number)

        normalized_nim = nim.strip().upper()
        if not normalized_nim:
            raise DomainException("NIM tidak boleh kosong")

        normalized_faculty = faculty.strip()
        if not normalized_faculty:
            raise DomainException("Fakultas tidak boleh kosong")

        normalized_department = department.strip()
        if not normalized_department:
            raise DomainException("Departemen tidak boleh kosong")

        return cls(
            full_name=normalized_user_fields.get("full_name", full_name),
            email=normalized_user_fields.get("email", email),
            phone_number=normalized_user_fields.get("phone_number", phone_number),
            password_hash=password_hash,
            nim=normalized_nim,
            faculty=normalized_faculty,
            department=normalized_department,
            role=UserRole.STUDENT,
        )

    def change_profile_information(
        self,
        full_name: str | TUnset = UNSET,
        avatar_url: str | None | TUnset = UNSET,
        nim: str | TUnset = UNSET,
        faculty: str | TUnset = UNSET,
        department: str | TUnset = UNSET,
    ) -> None:
        super().change_profile_information(full_name, avatar_url)

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
