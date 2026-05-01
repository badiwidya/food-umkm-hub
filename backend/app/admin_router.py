from fastapi import APIRouter

from app.auth.dependency import EnsureAdminDep
from app.stores.admin_router import store_admin_router
from app.users.admin_router import user_admin_router

admin_router = APIRouter(prefix="/admin", dependencies=[EnsureAdminDep])

admin_router.include_router(user_admin_router, prefix="/users", tags=["Admin: Users"])
admin_router.include_router(
    store_admin_router, prefix="/stores", tags=["Admin: Stores"]
)
