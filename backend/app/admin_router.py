from fastapi import APIRouter

from app.auth.dependency import EnsureAdminDep
from app.users.admin_router import user_admin_router

admin_router = APIRouter(prefix="/admin", dependencies=[EnsureAdminDep])

admin_router.include_router(user_admin_router, prefix="/users", tags=["Admin: Users"])
