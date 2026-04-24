from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "admin"
    MAHASISWA = "mahasiswa"
    UMKM = "umkm"


class UserStatus(StrEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class TokenType(StrEnum):
    EMAIL_VERIFICATION = "email_verification"
    EMAIL_CHANGE_VERIFICATION = "email_change_verification"
    PASSWORD_RESET = "password_reset"
    PHONE_OTP = "phone_otp"
