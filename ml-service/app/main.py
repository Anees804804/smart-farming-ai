from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, disease

app = FastAPI(
    title="Smart Farming ML Service",
    description="ML inference service for Smart Farming AI Pakistan",
    version="2.0.0",
)

# CORS — allow requests from the Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, tags=["health"])
app.include_router(disease.router, tags=["disease"])


@app.get("/")
async def root():
    return {
        "service": "smart-farming-ml",
        "status": "running",
        "docs": "/docs",
    }
