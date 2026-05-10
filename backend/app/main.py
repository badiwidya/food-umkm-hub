from fastapi import FastAPI

from app.admin_router import admin_router
from app.auth.router import auth_router
from app.exception_handler import register_exception_handlers
from app.products.router import product_router, store_product_router
from app.stores.router import store_router
from app.students.router import student_router
from app.users.router import user_router

app = FastAPI(title="IPB Food & UMKM Hub API", version="0.1.0")

register_exception_handlers(app)

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(store_router)
app.include_router(product_router)
app.include_router(store_product_router)

app.include_router(admin_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Selamat datang di IPB Food & UMKM Hub API",
        "status": "running",
        "docs": "/docs",
    }
