from typing import Annotated
from uuid import UUID

from fastapi import Depends

from app.dependency import SessionDep
from app.exception import NotFoundException
from app.users.entity import User
from app.users.repository import UserRepository, VerificationTokenRepository
from app.users.service import UserService


def get_user_repo(
    session: SessionDep,
) -> UserRepository:
    return UserRepository(session)


def get_token_repo(
    session: SessionDep,
) -> VerificationTokenRepository:
    return VerificationTokenRepository(session)


def get_user_service(
    user_repo: Annotated[UserRepository, Depends(get_user_repo)],
    token_repo: Annotated[VerificationTokenRepository, Depends(get_token_repo)],
) -> UserService:
    return UserService(user_repo=user_repo, token_repo=token_repo)


UserServiceDep = Annotated[UserService, Depends(get_user_service)]


async def user_target_from_path(
    id: UUID,
    user_service: UserServiceDep,
) -> User:
    user = await user_service.get_by_id(id)
    if user is None:
        raise NotFoundException("User tidak ada.")
    return user


UserTargetDep = Annotated[User, Depends(user_target_from_path)]
