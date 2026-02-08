from fastapi import FastAPI

app = FastAPI(title="IPB Food & UMKM Hub API", version="0.1.0")


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Selamat datang di IPB Food & UMKM Hub API",
        "status": "running",
        "docs": "/docs",
    }
