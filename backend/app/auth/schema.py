from typing import Annotated
from uuid import UUID

from pydantic import EmailStr, Field

from app.schema import BaseSchema
from app.users.schema import IDPhoneNumber


class RegisterBaseRequest(BaseSchema):
    full_name: str
    email: EmailStr
    phone_number: IDPhoneNumber
    password: Annotated[str, Field(min_length=8)]


class RegisterStudentRequest(RegisterBaseRequest):
    nim: str
    faculty: str
    department: str


class RegisterStoreRequest(BaseSchema):
    name: str
    description: str
    address: str
    maps_link: str | None = None
    photo_url: str | None = None
    qris_image_url: str | None = None


class RegisterSellerRequest(RegisterBaseRequest):
    store: RegisterStoreRequest


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class LoginResponse(BaseSchema):
    access_token: str


class VerifyTokenRequest(BaseSchema):
    token_id: UUID
    token: str


class ResendEmailVerificationRequest(BaseSchema):
    email: EmailStr


class ResetPasswordRequest(BaseSchema):
    email: EmailStr


class ConfirmResetPasswordRequest(BaseSchema):
    token_id: UUID
    token: str
    new_password: Annotated[str, Field(min_length=8)]
