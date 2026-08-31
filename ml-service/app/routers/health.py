from fastapi import APIRouter
from app.services import disease_service

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "smart-farming-ml",
        "models": {"disease": disease_service.get_status()},
    }
