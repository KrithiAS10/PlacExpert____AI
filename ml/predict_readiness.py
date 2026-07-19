"""
predict_readiness.py — Step 2: Readiness Prediction Interface
=============================================================
Accepts student profiling answers as JSON via CLI or function call,
loads the trained XGBoost model, and returns readiness prediction
with confidence probabilities.

Usage (CLI):
  python predict_readiness.py '{"Academic_Year":"3rd Year","Domain_Interest":"AI/ML",...}'

Returns JSON:
  {
    "readiness": "Intermediate",
    "confidence": {"Beginner": 0.12, "Intermediate": 0.75, "Advanced": 0.13},
    "model_used": "XGBoost",
    "best_params": {...}
  }
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "readiness_model.pkl")

# Feature columns expected by the model
ML_FEATURES = [
    "Academic_Year",
    "Domain_Interest",
    "Target_Company",
    "DSA_Count",
    "Projects",
    "Core_CS_Strength",
    "Coding_Platform",
    "Aptitude",
    "Communication",
    "Mock_Interview_Experience",
    "Coding_Confidence",
]


def load_model():
    """Load the trained readiness model artifact from disk."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. Run train_readiness.py first."
        )
    return joblib.load(MODEL_PATH)


def predict(input_data: dict) -> dict:
    """
    Predict readiness level from student profiling answers.

    Args:
        input_data: Dictionary with keys matching ML_FEATURES.

    Returns:
        Dictionary with readiness prediction, confidence scores, and metadata.
    """
    artifact = load_model()
    model = artifact["model"]
    ordinal_encoder = artifact["ordinal_encoder"]
    ordinal_cols = artifact["ordinal_cols"]
    label_encoders = artifact["label_encoders"]
    nominal_cols = artifact["nominal_cols"]
    target_encoder = artifact["target_encoder"]

    # Build input DataFrame with correct column order
    input_df = pd.DataFrame([{col: input_data.get(col, "None") for col in ML_FEATURES}])

    # Apply ordinal encoding for ordered features
    try:
        input_df[ordinal_cols] = ordinal_encoder.transform(input_df[ordinal_cols])
    except Exception:
        # Fallback: encode unknown values as -1 (handled by encoder config)
        for col in ordinal_cols:
            try:
                input_df[[col]] = ordinal_encoder.transform(input_df[[col]])
            except Exception:
                input_df[col] = -1

    # Apply label encoding for nominal features
    for col in nominal_cols:
        le = label_encoders[col]
        val = str(input_df[col].iloc[0])
        if val in le.classes_:
            input_df[col] = le.transform([val])[0]
        else:
            # Unknown category fallback — use most frequent class index
            input_df[col] = 0

    # Predict
    pred_idx = model.predict(input_df)[0]
    readiness = target_encoder.inverse_transform([pred_idx])[0]

    # Confidence probabilities
    probs = model.predict_proba(input_df)[0]
    confidence = {
        target_encoder.inverse_transform([i])[0]: round(float(probs[i]), 4)
        for i in range(len(probs))
    }

    return {
        "readiness": readiness,
        "confidence": confidence,
        "model_used": "XGBoost",
        "best_params": artifact.get("best_params", {}),
    }


# ---------------------------------------------------------------------------
# CLI Entrypoint
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1:
        raw = sys.argv[1]
        # Strip surrounding quotes if present
        if raw.startswith("'") and raw.endswith("'"):
            raw = raw[1:-1]
        input_json = json.loads(raw)
        result = predict(input_json)
        print(json.dumps(result))
    else:
        print(
            json.dumps({"error": "No input provided. Pass JSON as CLI argument."})
        )
