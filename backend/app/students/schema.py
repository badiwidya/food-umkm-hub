from pydantic import field_validator

from app.schema import BaseSchema
from app.users.schema import UserResponse


class StudentResponse(UserResponse):
    nim: str
    faculty: str
    department: str


class UpdateStudentRequest(BaseSchema):
    nim: str | None = None
    faculty: str | None = None
    department: str | None = None

    @field_validator("nim", "faculty", "department", mode="after")
    @classmethod
    def is_null(cls, v: str | None, info) -> str | None:
        if not v:
            raise ValueError(f"{info.field_name} tidak boleh kosong.")
        return v
