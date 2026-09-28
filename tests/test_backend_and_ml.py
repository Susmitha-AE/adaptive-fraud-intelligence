import pytest
from fastapi.testclient import TestClient
from backend.main import app
from ml.predict import predict_fraud
from intelligence.surge_detection import SurgeDetector
from backend.decision_engine import RiskDecisionEngine, RiskConfig

client = TestClient(app)

def test_api_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data

def test_valid_prediction():
    payload = {
        "Time": 1000.0,
        "Amount": 150.0,
        "V1": -1.2,
        "V2": 0.5,
        "V12": -0.1
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "fraud_probability" in data
    assert "risk_score" in data
    assert data["decision"] in ["ALLOW", "REVIEW", "BLOCK"]
    assert isinstance(data["reasons"], list)

def test_invalid_prediction_missing_required():
    # Missing Amount
    payload = {
        "Time": 1000.0,
        "V1": -1.2
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422  # Validation error

def test_ml_predictor_interface():
    sample_tx = {"Time": 500, "Amount": 20.0, "V1": 0.0}
    res = predict_fraud(sample_tx)
    assert "fraud_probability" in res
    assert 0.0 <= res["fraud_probability"] <= 1.0

def test_temporal_surge_intelligence():
    sd = SurgeDetector(historical_baseline_rate_per_min=10.0)
    # Simulate high frequency
    res = sd.analyze_transaction(100.0, 50.0)
    assert "surge_multiplier" in res
    assert "velocity_score" in res

def test_decision_engine_logic():
    engine = RiskDecisionEngine(config=RiskConfig(allow_threshold=30.0, block_threshold=70.0))
    tx = {"Time": 100, "Amount": 500.0}

    # Low fraud prob, normal temporal -> ALLOW
    output_clean = engine.evaluate(tx, {"fraud_probability": 0.02}, {"surge_multiplier": 1.0, "velocity_score": 0.1, "temporal_anomaly_score": 0.1})
    assert output_clean.decision == "ALLOW"

    # High fraud prob + high temporal anomaly -> BLOCK
    output_fraud = engine.evaluate(tx, {"fraud_probability": 0.95}, {"surge_multiplier": 2.0, "velocity_score": 0.8, "temporal_anomaly_score": 0.8})
    assert output_fraud.decision == "BLOCK"
    assert any("High ML fraud probability" in r for r in output_fraud.reasons)

def test_analytics_endpoint():
    res = client.get("/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "total_transactions" in data
    assert "dataset_source" in data

def test_scenario_endpoints():
    res1 = client.get("/scenarios/1")
    assert res1.status_code == 200
    assert isinstance(res1.json(), list)

    res_invalid = client.get("/scenarios/99")
    assert res_invalid.status_code == 400
