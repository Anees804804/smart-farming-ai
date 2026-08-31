"""Plant disease detection model — lazy loading + cached inference."""
import os
import logging
import torch
from PIL import Image

logger = logging.getLogger("disease_model")

# Module-level cache
_pipeline = None

# HuggingFace model identifier
HF_MODEL_ID = "Kathir56/plant-disease-tamilnadu"
CONFIDENCE_THRESHOLD = float(os.environ.get("DISEASE_CONFIDENCE_THRESHOLD", "0.6"))


def load_model():
    """Load the HuggingFace image classification pipeline (cached)."""
    global _pipeline
    if _pipeline is not None:
        return _pipeline

    logger.info(f"Loading disease detection model: {HF_MODEL_ID}")
    try:
        from transformers import pipeline

        _pipeline = pipeline(
            "image-classification",
            model=HF_MODEL_ID,
            device=-1,  # CPU
        )
        logger.info("Disease detection model loaded successfully")
        return _pipeline
    except Exception as e:
        logger.error(f"Failed to load disease model: {e}")
        raise RuntimeError(f"Failed to load disease detection model: {e}")


def is_loaded() -> bool:
    return _pipeline is not None


def is_available() -> bool:
    """Check if the model can potentially be loaded (transformers installed)."""
    try:
        import transformers  # noqa: F401
        return True
    except ImportError:
        return False


def _clean_label(label: str) -> str:
    """Preserve the label emitted by the model configuration."""
    return label


def predict(image: Image.Image, top_k: int = 5) -> dict:
    """
    Run inference on a preprocessed PIL image.
    Returns: {disease, confidence, topPredictions}
    """
    pipe = load_model()
    results = pipe(image, top_k=top_k)

    if not results:
        raise RuntimeError("Model returned no predictions")

    top = results[0]
    top_label = _clean_label(top["label"])
    top_confidence = round(float(top["score"]) * 100, 1)

    top_predictions = []
    for r in results:
        top_predictions.append({
            "label": _clean_label(r["label"]),
            "confidence": round(float(r["score"]) * 100, 1),
        })

    return {
        "disease": top_label,
        "confidence": top_confidence,
        "topPredictions": top_predictions,
    }
