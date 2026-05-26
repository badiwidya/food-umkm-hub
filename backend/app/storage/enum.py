from enum import StrEnum


class UploadContext(StrEnum):
    STORE_PHOTO = "store_photo"
    QRIS_IMAGE = "qris_image"
    PRODUCT_PHOTO = "product_photo"
    AVATAR = "avatar"
    PAYMENT_PROOF = "payment_proof"
