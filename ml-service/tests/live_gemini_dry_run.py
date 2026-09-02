import json
import os
from pathlib import Path

from PIL import Image, ImageDraw

from app.models.disease_model import predict


def make_dummy_leaf_image(path: Path) -> None:
    img = Image.new("RGB", (512, 512), color=(120, 180, 80))
    draw = ImageDraw.Draw(img)
    draw.rectangle((120, 120, 392, 392), fill=(110, 150, 70))
    draw.ellipse((170, 150, 330, 340), fill=(200, 220, 180))
    draw.line((250, 90, 250, 420), fill=(90, 110, 40), width=18)
    draw.line((110, 250, 390, 250), fill=(90, 110, 40), width=18)
    draw.line((150, 130, 350, 130), fill=(120, 150, 80), width=12)
    draw.line((150, 370, 350, 370), fill=(120, 150, 80), width=12)
    img.save(path)


if __name__ == "__main__":
    print("GEMINI_API_KEY present:", bool(os.getenv("GEMINI_API_KEY")))
    image_path = Path(__file__).resolve().parent / "dummy_leaf_test.png"
    make_dummy_leaf_image(image_path)
    img = Image.open(image_path).convert("RGB")

    result = predict(img)
    print(json.dumps(result, ensure_ascii=False, indent=2))

    ok = (
        isinstance(result, dict)
        and isinstance(result.get("disease"), str)
        and bool(result["disease"].strip())
        and isinstance(result.get("confidence"), (int, float))
        and 0.0 <= float(result["confidence"]) <= 1.0
        and isinstance(result.get("topPredictions"), list)
        and all(isinstance(item, dict) and "label" in item and "score" in item for item in result["topPredictions"])
    )
    print("SCHEMA_OK" if ok else "SCHEMA_FAIL")
    if not ok:
        raise SystemExit(1)
