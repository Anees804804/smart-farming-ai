"""Plant disease detection service layer."""
import logging
from app.models import disease_model
from app.preprocessing.image import validate_image

logger = logging.getLogger("disease_service")


def detect_disease(file_bytes: bytes, content_type: str | None = None) -> dict:
    """Validate image and run disease detection."""
    img, error = validate_image(file_bytes, content_type)
    if error:
        raise ValueError(error)

    result = disease_model.predict(img)
    return result


def get_status() -> str:
    """Return model status for health endpoint."""
    if disease_model.is_loaded():
        return "loaded"
    if disease_model.is_available():
        return "not_loaded"
    return "unavailable"
