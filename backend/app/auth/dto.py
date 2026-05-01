from dataclasses import dataclass


@dataclass(kw_only=True)
class RegisterStudentDTO:
    full_name: str
    email: str
    phone_number: str
    password: str
    nim: str
    faculty: str
    department: str


@dataclass(kw_only=True)
class RegisterStoreDTO:
    name: str
    description: str
    address: str
    maps_link: str | None
    photo_url: str | None
    qris_image_url: str | None


@dataclass(kw_only=True)
class RegisterSellerDTO:
    full_name: str
    email: str
    phone_number: str
    password: str
    store: RegisterStoreDTO
