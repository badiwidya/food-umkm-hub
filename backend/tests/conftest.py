import pytest


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def password() -> str:
    return "password123"
