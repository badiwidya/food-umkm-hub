class AppException(Exception):
    def __init__(self, message: str, type: str | None = None):
        self.message = message
        self.type = type
        super().__init__(message)


class DomainException(AppException):
    pass
