class AppException(Exception):
    def __init__(self, message: str, type: str | None = None):
        self.message = message
        self.type = type
        super().__init__(message)


class DomainException(AppException):
    pass


class AuthenticationException(AppException):
    pass


class NotAllowedException(AppException):
    pass


class NotFoundException(AppException):
    pass
