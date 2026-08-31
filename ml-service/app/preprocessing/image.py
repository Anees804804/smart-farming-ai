"""Image preprocessing and validation for disease detection."""
import io
from PIL import Image

SUPPORTED_FORMATS = {"JPEG", "PNG", "WEBP"}
MAX_SIZE_MB = 5
TARGET_SIZE = (224, 224)


def validate_image(file_bytes: bytes, content_type: str | None = None) -> tuple[Image.Image | None, str | None]:
    """
    Validate that the uploaded file is a real image.
    Returns (PIL Image, None) on success or (None, error_message) on failure.
    """
    if len(file_bytes) == 0:
        return None, "Uploaded file is empty"

    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        return None, f"Image exceeds maximum size of {MAX_SIZE_MB}MB ({size_mb:.1f}MB)"

    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.load()  # Force full decode to catch corrupt files
    except Exception:
        return None, "File is not a valid image"

    if img.format not in SUPPORTED_FORMATS:
        return None, f"Unsupported image format '{img.format}'. Supported: {', '.join(SUPPORTED_FORMATS)}"

    # Convert to RGB (handles RGBA, grayscale, palette, etc.)
    img = img.convert("RGB")
    return img, None


def preprocess_for_model(img: Image.Image, target_size: tuple = TARGET_SIZE) -> Image.Image:
    """Resize image for model input."""
    return img.resize(target_size, Image.LANCZOS)
