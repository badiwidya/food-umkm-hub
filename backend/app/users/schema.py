from datetime import datetime
from typing import Annotated
from uuid import UUID

import phonenumbers
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic_extra_types.phone_numbers import PhoneNumberValidator

from app.users.enum import UserRole, UserStatus

IDPhoneNumber = Annotated[
    str | phonenumbers.PhoneNumber,
    PhoneNumberValidator(
        supported_regions=["ID"], default_region="ID", number_format="E164"
    ),
]


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    avatar_url: str | None
    email: str
    phone_number: IDPhoneNumber
    role: UserRole
    status: UserStatus
    email_verified_at: datetime | None
    phone_verified_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class Pagination(BaseModel):
    total: int
    page: int
    page_size: int


class UserListResponse(BaseModel):
    metadata: Pagination
    data: list[UserResponse]


class UpdateProfileRequest(BaseModel):
    full_name: Annotated[str | None, Field(min_length=3)] = None
    avatar_url: str | None = None


class EmailChangeRequest(BaseModel):
    email: EmailStr


class NumberChangeRequest(BaseModel):
    phone_number: IDPhoneNumber


class ChangePasswordRequest(BaseModel):
    old_password: Annotated[str, Field(min_length=8)]
    new_password: Annotated[str, Field(min_length=8)]
