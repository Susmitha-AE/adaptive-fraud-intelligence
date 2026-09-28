import os
import json
import joblib
import pandas as pd
from typing import Dict, Any, Union
from ml.preprocessing import prepare_features_and_target

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, "model.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")

_cached_model = None

def load_model():
    global _cached_model
    if _cached_model is None:
        if os.path.exists(MODEL_PATH):
            _cached_model = joblib.load(MODEL_PATH)
        else:
            return None
    return _cached_model

def get_model_metrics() -> Dict[str, Any]:
    """Returns stored training metrics if available, else indicates training hasn't occurred."""
    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "status": "unavailable",
        "message": "Model metrics unavailable. Training has not been performed on this environment."
    }

def predict_fraud(transaction: Union[Dict[str, Any], pd.Series, pd.DataFrame]) -> Dict[str, Any]:
    """
    Main prediction interface.
    Accepts transaction dict or row with keys: Time, V1..V28, Amount.
    Returns fraud_probability and feature details.
    """
    model = load_model()

    if isinstance(transaction, dict):
        df = pd.DataFrame([transaction])
    elif isinstance(transaction, pd.Series):
        df = pd.DataFrame([transaction.to_dict()])
    else:
        df = transaction.copy()

    X, _ = prepare_features_and_target(df, is_training=False)

    if model is not None:
        fraud_prob = float(model.predict_proba(X)[0, 1])
    else:
        # Fallback rule-based heuristic if model artifact is not loaded yet
        # Uses known features like V12, V14, V17 anomalies
        v12 = float(df.get("V12", [0])[0] if isinstance(df.get("V12"), pd.Series) else df.get("V12", 0))
        v14 = float(df.get("V14", [0])[0] if isinstance(df.get("V14"), pd.Series) else df.get("V14", 0))
        v17 = float(df.get("V17", [0])[0] if isinstance(df.get("V17"), pd.Series) else df.get("V17", 0))

        score = 0.02
        if v12 < -3.0 or v14 < -3.5 or v17 < -3.0:
            score += 0.8
        fraud_prob = float(min(1.0, max(0.0, score)))

    return {
        "fraud_probability": round(fraud_prob, 4),
        "is_model_loaded": model is not None
    }
