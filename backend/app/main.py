from fastapi import FastAPI

from app.users.router import user_router

app = FastAPI(title="IPB Food & UMKM Hub API", version="0.1.0")

app.include_router(user_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Selamat datang di IPB Food & UMKM Hub API",
        "status": "running",
        "docs": "/docs",
    }
