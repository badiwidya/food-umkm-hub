from pydantic import BaseModel

from app.users.schema import UserResponse


class StudentResponse(UserResponse):
    nim: str
    faculty: str
    department: str


class UpdateStudentRequest(BaseModel):
    nim: str | None = None
    faculty: str | None = None
    department: str | None = None
