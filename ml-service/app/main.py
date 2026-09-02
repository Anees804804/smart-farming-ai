import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

from app.routers import health, disease
from app.models.disease_model import load_model

logger = logging.getLogger("startup")


async def _warm_up_model():
    """Load the disease model in the background so the first real request is fast."""
    loop = asyncio.get_event_loop()
    # Run the blocking pipeline() call in a thread so we don't stall the event loop.
    await loop.run_in_executor(None, load_model)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: kick off model loading in the background (non-blocking).
    logger.info("Scheduling disease model warm-up in background...")
    task = asyncio.create_task(_warm_up_model())
    yield
    # Shutdown: cancel the warm-up if it's still running.
    task.cancel()


app = FastAPI(
    title="Smart Farming ML Service",
    description="ML inference service for Smart Farming AI Pakistan",
    version="2.0.0",
    lifespan=lifespan,
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
