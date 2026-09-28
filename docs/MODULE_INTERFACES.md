# Module Interfaces & Integration Protocol

This document details the clean contracts and interfaces between the four core project modules.

---

## 1. ML Fraud Detection Interface (`ml/`)

**Module Entrypoint**: `ml.predict.predict_fraud(transaction)`

### Input Schema
```python
{
    "Time": float,
    "Amount": float,
    "V1": float, # ... up to V28
}
```

### Output Schema
```python
{
    "fraud_probability": float,  # Value between 0.0 and 1.0
    "is_model_loaded": bool
}
```

---

## 2. Temporal & Surge Intelligence Interface (`intelligence/`)

**Module Entrypoint**: `intelligence.surge_detection.SurgeDetector`

```python
detector = SurgeDetector(historical_baseline_rate_per_min=15.0)
result = detector.analyze_transaction(timestamp=Time, amount=Amount)
```

### Output Schema
```python
{
    "current_rate_per_min": float,
    "historical_baseline_per_min": float,
    "surge_multiplier": float,
    "is_surge": bool,
    "surge_score": float,            # 0.0 to 1.0
    "velocity_score": float,         # 0.0 to 1.0
    "temporal_anomaly_score": float  # 0.0 to 1.0
}
```

---

## 3. Backend & Decision Engine Interface (`backend/`)

**Endpoint**: `POST /predict`

### Risk Fusion Formula
```text
risk_score = (w_ml * (fraud_probability * 100) + w_temporal * (temporal_anomaly * 100)) / (w_ml + w_temporal)
```
* If `is_surge == True` and `fraud_probability < 0.15`, risk score is capped to prevent false positive blocking during legitimate surges.

### Decision Rules
* `risk_score >= block_threshold` (Default: 70.0) → `BLOCK`
* `risk_score >= allow_threshold` (Default: 30.0) → `REVIEW`
* `risk_score < allow_threshold` → `ALLOW`

---

## 4. REST API Documentation

* `POST /predict`: Submit single transaction for evaluation.
* `GET /analytics`: Fetch aggregate volume, velocity, fraud counts, and model metrics.
* `GET /health`: System health and model load state.
* `GET /scenarios/{id}`: Stream historical simulation records for Scenario 1, 2, or 3.
