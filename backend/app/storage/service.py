from dataclasses import dataclass
from typing import Any
from uuid import uuid4

from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings
from app.domains.user import User, UserRole
from app.exception import DomainException, NotAllowedException
from app.storage.enum import UploadContext
from app.storage.exceptions import StorageException
from app.storage.schema import SignUploadResponse

CONTENT_TYPE_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


@dataclass(frozen=True)
class UploadRule:
    prefix: str
    content_types: set[str]
    roles: set[UserRole] | None = None

    def allows_role(self, role: UserRole) -> bool:
        return self.roles is None or role in self.roles


UPLOAD_RULES = {
    UploadContext.STORE_PHOTO: UploadRule(
        prefix="stores/photos/",
        content_types={"image/jpeg", "image/png", "image/webp"},
        roles={UserRole.SELLER},
    ),
    UploadContext.QRIS_IMAGE: UploadRule(
        prefix="stores/qris/",
        content_types={"image/jpeg", "image/png"},
        roles={UserRole.SELLER},
    ),
    UploadContext.PRODUCT_PHOTO: UploadRule(
        prefix="products/photos/",
        content_types={"image/jpeg", "image/png", "image/webp"},
        roles={UserRole.SELLER},
    ),
    UploadContext.AVATAR: UploadRule(
        prefix="users/avatars/",
        content_types={"image/jpeg", "image/png", "image/webp"},
    ),
}


class StorageService:
    def __init__(
        self,
        client: Any,
        bucket_name: str = settings.R2_BUCKET_NAME,
        public_base_url: str = settings.R2_PUBLIC_BASE_URL,
        expires_in: int = settings.R2_PRESIGNED_EXPIRY,
    ) -> None:
        self.client = client
        self.bucket_name = bucket_name
        self.public_base_url = public_base_url.rstrip("/")
        self.expires_in = expires_in

    def sign_upload(
        self, *, user: User, context: UploadContext, content_type: str
    ) -> SignUploadResponse:
        rule = self._get_upload_rule(context, user.role)
        normalized_content_type = content_type.strip().lower()
        if normalized_content_type not in rule.content_types:
            raise DomainException("Tipe file tidak didukung", "unsupported_file_type")

        extension = CONTENT_TYPE_EXTENSIONS[normalized_content_type]
        file_key = f"{rule.prefix}{uuid4()}{extension}"

        try:
            upload_url = self.client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": file_key,
                    "ContentType": normalized_content_type,
                },
                ExpiresIn=self.expires_in,
            )
        except (BotoCoreError, ClientError) as exc:
            raise StorageException("Gagal membuat URL unggah") from exc

        return SignUploadResponse(
            upload_url=upload_url,
            file_key=file_key,
            public_url=f"{self.public_base_url}/{file_key}",
            expires_in=self.expires_in,
        )

    def delete_object(self, file_key: str) -> None:
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=file_key)
        except (BotoCoreError, ClientError) as exc:
            raise StorageException("Gagal menghapus file") from exc

    def _get_upload_rule(self, context: UploadContext, role: UserRole) -> UploadRule:
        rule = UPLOAD_RULES[context]
        if not rule.allows_role(role):
            raise NotAllowedException("Aksi dilarang")
        return rule
