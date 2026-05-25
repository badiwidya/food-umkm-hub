from fastapi import FastAPI

from app.admin_router import admin_router
from app.auth.router import auth_router
from app.exception_handler import register_exception_handlers
from app.favorites.router import favorite_router
from app.orders.router import order_router, store_order_router
from app.products.router import product_router, store_product_router
from app.promos.router import promo_router, store_promo_router
from app.reviews.router import review_router
from app.storage.router import storage_router
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
app.include_router(promo_router)
app.include_router(store_promo_router)
app.include_router(order_router)
app.include_router(store_order_router)
app.include_router(review_router)
app.include_router(favorite_router)
app.include_router(storage_router)

app.include_router(admin_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Selamat datang di IPB Food & UMKM Hub API",
        "status": "running",
        "docs": "/docs",
    }
