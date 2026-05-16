from uuid import UUID

from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.user import User, UserRole, UserStatus
from app.domains.verification_token import VerificationToken, VerificationTokenType
from app.users.model import UserModel, VerificationTokenModel


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, id: UUID) -> User | None:
        model = await self._session.scalar(
            select(UserModel).where(UserModel.id == id, UserModel.deleted_at.is_(None))
        )

        if model is None:
            return None

        return self._to_entity(model)

    async def get_by_email(self, email: str) -> User | None:
        model = await self._session.scalar(
            select(UserModel).where(
                UserModel.email == email, UserModel.deleted_at.is_(None)
            )
        )

        if model is None:
            return None

        return self._to_entity(model)

    async def get_by_phone_number(self, phone_number: str) -> User | None:
        model = await self._session.scalar(
            select(UserModel).where(
                UserModel.phone_number == phone_number, UserModel.deleted_at.is_(None)
            )
        )

        if model is None:
            return None

        return self._to_entity(model)

    async def get_by_email_or_phone(self, email: str, phone_number: str) -> User | None:
        model = await self._session.scalar(
            select(UserModel).where(
                or_(UserModel.email == email, UserModel.phone_number == phone_number),
                UserModel.deleted_at.is_(None),
            )
        )

        if model is None:
            return None

        return self._to_entity(model)

    async def get_all(
        self,
        offset: int,
        limit: int,
        status: UserStatus | None,
        role: UserRole | None,
    ) -> tuple[list[User], int]:
        filters = []
        if status is not None:
            filters.append(UserModel.status == status)
        if role is not None:
            filters.append(UserModel.role == role)
        filters.append(UserModel.deleted_at.is_(None))

        stmt = (
            select(UserModel)
            .where(*filters)
            .order_by(UserModel.created_at.desc(), UserModel.id.asc())
            .offset(offset)
            .limit(limit)
        )
        count_stmt = select(func.count()).select_from(UserModel).where(*filters)

        models = (await self._session.scalars(stmt)).all()
        count = await self._session.scalar(count_stmt)

        return [self._to_entity(model) for model in models], (count or 0)

    async def save(self, user: User) -> None:
        model = self._to_model(user)
        self._session.add(model)

    async def update(self, user: User) -> None:
        model = self._to_model(user)
        await self._session.merge(model)

    @staticmethod
    def _to_entity(model: UserModel) -> User:
        return User(
            id=model.id,
            full_name=model.full_name,
            avatar_url=model.avatar_url,
            email=model.email,
            pending_email=model.pending_email,
            phone_number=model.phone_number,
            password_hash=model.password_hash,
            email_verified_at=model.email_verified_at,
            phone_verified_at=model.phone_verified_at,
            role=model.role,
            status=model.status,
            deleted_at=model.deleted_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(user: User) -> UserModel:
        return UserModel(
            id=user.id,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            email=user.email,
            pending_email=user.pending_email,
            phone_number=user.phone_number,
            password_hash=user.password_hash,
            email_verified_at=user.email_verified_at,
            phone_verified_at=user.phone_verified_at,
            role=user.role,
            status=user.status,
            deleted_at=user.deleted_at,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )


class VerificationTokenRepository:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_by_id(self, id: UUID) -> VerificationToken | None:
        model = await self._session.get(VerificationTokenModel, id)

        if model is None:
            return None

        return self._to_entity(model)

    async def get_by_user_and_type(
        self, user_id: UUID, type: VerificationTokenType
    ) -> VerificationToken | None:
        model = await self._session.scalar(
            select(VerificationTokenModel)
            .where(VerificationTokenModel.user_id == user_id)
            .where(VerificationTokenModel.token_type == type)
        )

        if model is None:
            return None

        return self._to_entity(model)

    async def save(self, token: VerificationToken) -> None:
        model = self._to_model(token)
        self._session.add(model)

    async def delete_by_id(self, token_id: UUID) -> None:
        await self._session.execute(
            delete(VerificationTokenModel).where(VerificationTokenModel.id == token_id)
        )

    async def delete_by_user_and_type(
        self, user_id: UUID, token_type: VerificationTokenType
    ) -> None:
        await self._session.execute(
            delete(VerificationTokenModel)
            .where(VerificationTokenModel.user_id == user_id)
            .where(VerificationTokenModel.token_type == token_type)
        )

    @staticmethod
    def _to_entity(model: VerificationTokenModel) -> VerificationToken:
        return VerificationToken(
            id=model.id,
            user_id=model.user_id,
            token_type=model.token_type,
            token_hash=model.token_hash,
            expires_at=model.expires_at,
        )

    @staticmethod
    def _to_model(token: VerificationToken) -> VerificationTokenModel:
        return VerificationTokenModel(
            id=token.id,
            user_id=token.user_id,
            token_type=token.token_type,
            token_hash=token.token_hash,
            expires_at=token.expires_at,
        )
