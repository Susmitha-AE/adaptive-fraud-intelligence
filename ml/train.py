import os
import json
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from ml.preprocessing import validate_data, check_data_quality, prepare_features_and_target
from ml.evaluate import evaluate_predictions

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, "model.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")

def train_models(data_path: str = None) -> dict:
    """Trains classification models, evaluates performance, and saves model artifacts."""
    if data_path is None:
        data_path = os.getenv("DATASET_PATH", "data/sample_transactions.csv")

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    is_sample = "sample" in os.path.basename(data_path).lower()
    dataset_source = "development_sample" if is_sample else "full_dataset"

    df = pd.read_csv(data_path)

    valid, msg = validate_data(df, is_training=True)
    if not valid:
        raise ValueError(f"Invalid dataset: {msg}")

    quality_info = check_data_quality(df)

    X, y = prepare_features_and_target(df, is_training=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )

    # Train Random Forest with class weighting for imbalanced data
    model = RandomForestClassifier(
        n_estimators=100,
        class_weight="balanced",
        random_state=42,
        max_depth=12,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    eval_metrics = evaluate_predictions(y_test.values, y_pred, y_prob)

    # Feature importances
    feature_names = list(X.columns)
    importances = model.feature_importances_.tolist()
    top_features = sorted(
        [{"feature": name, "importance": round(imp, 4)} for name, imp in zip(feature_names, importances)],
        key=lambda x: x["importance"],
        reverse=True
    )[:10]

    results = {
        "dataset_source": dataset_source,
        "dataset_path": data_path,
        "dataset_summary": quality_info,
        "metrics": eval_metrics,
        "top_features": top_features,
        "model_type": "RandomForestClassifier (Balanced)"
    }

    # Save model and metrics
    joblib.dump(model, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(results, f, indent=2)

    print(f"Model successfully saved to {MODEL_PATH}")
    print(f"Metrics saved to {METRICS_PATH} (Source: {dataset_source})")
    return results

if __name__ == "__main__":
    import sys
    path_arg = sys.argv[1] if len(sys.argv) > 1 else None
    train_models(path_arg)
