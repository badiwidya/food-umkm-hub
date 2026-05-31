from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )


class PaginatedResponse[T](BaseSchema):
    page: int
    page_size: int
    total: int
    data: T


class ErrorResponse(BaseSchema):
    message: str
    type: str | None


class ValidationErrorItem(BaseSchema):
    field: str
    message: str


class ValidationErrorResponse(BaseSchema):
    message: str
    type: Literal["validation_error"] = "validation_error"
    errors: list[ValidationErrorItem]
