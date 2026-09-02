from app.models.disease_model import normalize_gemini_result


def test_normalize_gemini_result_schema():
    payload = {
        "disease": "Early blight",
        "confidence": 0.92,
        "topPredictions": [
            {"label": "Early blight", "score": 0.92},
            {"label": "Healthy", "score": 0.08},
        ],
    }

    result = normalize_gemini_result(payload)

    assert set(result.keys()) == {"disease", "confidence", "topPredictions"}
    assert isinstance(result["disease"], str)
    assert 0.0 <= result["confidence"] <= 1.0
    assert isinstance(result["topPredictions"], list)
    assert all(set(item.keys()) >= {"label", "score"} for item in result["topPredictions"])
    assert all(0.0 <= item["score"] <= 1.0 for item in result["topPredictions"])
    print("SCHEMA_OK")
