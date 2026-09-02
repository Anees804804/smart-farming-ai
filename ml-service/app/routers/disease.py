"""Plant disease detection router."""
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.services import disease_service
from app.models.disease_model import CONFIDENCE_THRESHOLD

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/predict/disease")
async def predict_disease(image: UploadFile = File(...)):
    # Quick content-type check (not trusted alone — real validation in service)
    if image.content_type and image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{image.content_type}'. Allowed: JPEG, PNG, WEBP",
        )

    try:
        file_bytes = await image.read()
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read uploaded file")

    if not file_bytes:
        raise HTTPException(status_code=400, detail="No image data received")

    try:
        result = disease_service.detect_disease(file_bytes, image.content_type)
        confidence = result["confidence"]
        if confidence > 1:
            confidence = confidence / 100
        if confidence < CONFIDENCE_THRESHOLD:
            return {
                "status": "low_confidence",
                "message": "The model is not confident enough to identify this disease reliably. Please upload a clearer image of the affected leaf.",
                "data": result,
            }
        return {"status": "ok", "data": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail="Disease detection model is not available. Please contact the administrator.",
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Disease detection model error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Disease prediction failed: {str(e)}",
        )
