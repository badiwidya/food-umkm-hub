import logging
import traceback

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.exception import (
    AppException,
    AuthenticationException,
    DomainException,
    NotAllowedException,
    NotFoundException,
)

EXCEPTION_STATUS_MAP = {
    DomainException: status.HTTP_400_BAD_REQUEST,
    NotFoundException: status.HTTP_404_NOT_FOUND,
    NotAllowedException: status.HTTP_403_FORBIDDEN,
}

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.error(
            "Unhandled exception on %s %s: %s\n%s",
            request.url,
            request.method,
            exc,
            traceback.format_exc(),
        )
        return JSONResponse(
            status_code=500,
            content={
                "message": "Terjadi kesalahan pada server.",
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _request: Request, exc: RequestValidationError
    ):
        errors = [
            {
                "field": ".".join(str(loc) for loc in err["loc"] if loc != "body"),
                "message": err["msg"],
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content={"message": "Validasi gagal.", "errors": errors},
        )

    @app.exception_handler(AppException)
    async def app_exception_handler(_request: Request, exc: AppException):
        status_code = EXCEPTION_STATUS_MAP.get(
            type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        content = {"message": exc.message}
        if exc.type is not None:
            content["type"] = exc.type
        return JSONResponse(status_code=status_code, content=content)

    @app.exception_handler(AuthenticationException)
    async def authentication_exception_handler(
        _request: Request, exc: AuthenticationException
    ):
        content = {"message": exc.message}
        if exc.type is not None:
            content["type"] = exc.type
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=content,
            headers={"WWW-Authenticate": "Bearer"},
        )
