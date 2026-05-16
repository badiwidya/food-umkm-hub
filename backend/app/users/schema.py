from datetime import datetime
from typing import Annotated
from uuid import UUID

import phonenumbers
from pydantic import EmailStr, Field, field_validator
from pydantic_extra_types.phone_numbers import PhoneNumberValidator

from app.domains.user import UserRole, UserStatus
from app.schema import BaseSchema, PaginatedResponse

IDPhoneNumber = Annotated[
    str | phonenumbers.PhoneNumber,
    PhoneNumberValidator(
        supported_regions=["ID"], default_region="ID", number_format="E164"
    ),
]


class UserResponse(BaseSchema):
    id: UUID
    full_name: str
    avatar_url: str | None
    email: str
    phone_number: IDPhoneNumber
    role: UserRole
    status: UserStatus
    email_verified_at: datetime | None
    phone_verified_at: datetime | None


UserListResponse = PaginatedResponse[list[UserResponse]]


class UpdateProfileRequest(BaseSchema):
    full_name: Annotated[str | None, Field(min_length=3)] = None
    avatar_url: str | None = None

    @field_validator("full_name", mode="after")
    @classmethod
    def is_null(cls, v: str | None) -> str | None:
        if not v:
            raise ValueError("nama tidak boleh kosong")
        return v


class EmailChangeRequest(BaseSchema):
    email: EmailStr


class NumberChangeRequest(BaseSchema):
    phone_number: IDPhoneNumber


class ChangePasswordRequest(BaseSchema):
    old_password: Annotated[str, Field(min_length=8)]
    new_password: Annotated[str, Field(min_length=8)]


class VerifyPhoneRequest(BaseSchema):
    otp: str
