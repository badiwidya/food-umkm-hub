from dataclasses import dataclass


# TODO: add more fields for mahasiswa and umkm
@dataclass(kw_only=True)
class RegisterStudentDTO:
    full_name: str
    email: str
    phone_number: str
    password: str


@dataclass(kw_only=True)
class RegisterUMKMDTO:
    full_name: str
    email: str
    phone_number: str
    password: str
