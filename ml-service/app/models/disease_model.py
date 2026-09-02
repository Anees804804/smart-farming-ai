"""Plant disease detection model — Gemini Vision API inference."""
import base64
import io
import json
import logging
import os
import re
from pathlib import Path

import requests
from dotenv import load_dotenv
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(PROJECT_ROOT / ".env")

logger = logging.getLogger("disease_model")

_client = None

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
CONFIDENCE_THRESHOLD = float(os.environ.get("DISEASE_CONFIDENCE_THRESHOLD", "0.6"))


def load_model():
    """Resolve and cache the Gemini API key and model configuration."""
    global _client
    if _client is not None:
        return _client

    load_dotenv(PROJECT_ROOT / ".env")
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable is not set in ml-service/.env")

    _client = {"api_key": api_key, "model": GEMINI_MODEL}
    logger.info("Disease detection model configured for Gemini Vision API: %s", GEMINI_MODEL)
    return _client


def is_loaded() -> bool:
    return _client is not None


def is_available() -> bool:
    """Check whether the Gemini API key is configured and usable."""
    try:
        load_model()
        return True
    except Exception:
        return False


def _coerce_probability(value, *, field_name: str) -> float:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        raise RuntimeError(f"Invalid numeric value for {field_name}: {value!r}")

    if 0.0 <= numeric <= 1.0:
        return numeric

    if 0.0 <= numeric <= 100.0:
        return numeric / 100.0

    raise RuntimeError(f"{field_name} outside expected range: {value!r}")


def normalize_gemini_result(raw: dict) -> dict:
    """Normalize Gemini JSON into the service contract: disease/confidence/topPredictions."""
    if not isinstance(raw, dict):
        raise RuntimeError(f"Unexpected model response format: {raw!r}")

    disease = str(raw.get("disease") or "").strip()
    if not disease:
        raise RuntimeError("Gemini response missing 'disease'")

    confidence = _coerce_probability(raw.get("confidence", 0.0), field_name="confidence")
    top_predictions = raw.get("topPredictions") or []
    if not isinstance(top_predictions, list):
        raise RuntimeError("Gemini response field 'topPredictions' must be a list")

    normalized_predictions = []
    for item in top_predictions:
        if not isinstance(item, dict):
            continue
        label = str(item.get("label") or item.get("disease") or "").strip()
        if not label:
            continue
        score = _coerce_probability(item.get("score", 0.0), field_name="topPredictions[].score")
        normalized_predictions.append({"label": label, "score": score})

    if not normalized_predictions:
        normalized_predictions = [{"label": disease, "score": confidence}]

    normalized_predictions.sort(key=lambda item: item["score"], reverse=True)
    normalized_predictions = [
        {"label": str(pred["label"]).strip(), "score": float(pred["score"])}
        for pred in normalized_predictions[:5]
    ]

    top_label = normalized_predictions[0]["label"]
    if not disease:
        disease = top_label

    return {
        "disease": disease,
        "confidence": float(min(max(confidence, 0.0), 1.0)),
        "topPredictions": normalized_predictions,
    }


def _extract_json_object(raw_text: str) -> dict:
    if not raw_text:
        raise RuntimeError("Gemini response was empty")

    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_text, flags=re.IGNORECASE | re.DOTALL)
    if match:
        raw_text = match.group(1)

    start_idx = raw_text.find("{")
    end_idx = raw_text.rfind("}")
    if start_idx != -1 and end_idx > start_idx:
        raw_text = raw_text[start_idx : end_idx + 1]

    try:
        payload = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Could not parse Gemini JSON response: {raw_text[:500]}") from exc

    if not isinstance(payload, dict):
        raise RuntimeError(f"Unexpected JSON payload type from Gemini: {type(payload).__name__}")
    return payload


def predict(image: Image.Image, top_k: int = 5) -> dict:
    """Send the uploaded image to Gemini Vision for disease classification."""
    try:
        config = load_model()
        api_key = config["api_key"]
        model = config["model"]

        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")

        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": (
                                "Classify the plant disease in this image. "
                                "Return ONLY strict JSON with keys: 'disease' (str), "
                                "'confidence' (float between 0 and 1), and 'topPredictions' "
                                "(list of dicts each with 'label' and 'score'). "
                                "Scores must be decimal probabilities between 0 and 1. "
                                "Use the best diagnosis with topPredictions sorted descending by score."
                            )
                        },
                        {
                            "inline_data": {
                                "mime_type": "image/png",
                                "data": encoded,
                            }
                        },
                    ]
                }
            ],
            "generationConfig": {"responseMimeType": "application/json"},
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        response = requests.post(url, json=payload, timeout=120)

        if response.status_code != 200:
            details = response.text
            raise RuntimeError(f"Gemini request failed: {response.status_code} {details}")

        body = response.json()
        candidates = body.get("candidates", [])
        if not candidates:
            raise RuntimeError(f"Gemini returned no candidates: {body}")

        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            raise RuntimeError(f"Gemini returned no content parts: {body}")

        raw_text = ""
        for part in parts:
            if isinstance(part, dict) and part.get("text"):
                raw_text += part["text"]

        parsed = _extract_json_object(raw_text)
        result = normalize_gemini_result(parsed)
    except Exception as exc:
        logger.error("Failed to run Gemini disease model inference: %s", exc)
        raise RuntimeError(f"Failed to run disease detection model: {exc}") from exc

    result["topPredictions"] = result["topPredictions"][: max(1, top_k)]
    return result
