from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.users.schema import IDPhoneNumber


class RegisterBaseRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: IDPhoneNumber
    password: Annotated[str, Field(min_length=8)]


class RegisterStudentRequest(RegisterBaseRequest):
    nim: str
    faculty: str
    department: str


class RegisterStoreRequest(BaseModel):
    name: str
    description: str
    address: str
    maps_link: str | None = None
    photo_url: str | None = None
    qris_image_url: str | None = None


class RegisterSellerRequest(RegisterBaseRequest):
    store: RegisterStoreRequest


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str


class VerifyTokenRequest(BaseModel):
    token_id: UUID
    token: str


class ResendEmailVerificationRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr


class ConfirmResetPasswordRequest(BaseModel):
    token_id: UUID
    token: str
    new_password: Annotated[str, Field(min_length=8)]
