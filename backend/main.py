import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from backend.schemas import (
    TransactionInput, PredictionOutput, HealthResponse,
    AnalyticsSummary, RiskConfig
)
from backend.services.transaction_service import TransactionService

app = FastAPI(
    title="Adaptive Fraud Intelligence API",
    description="Real-time adaptive fraud detection system distinguishing transaction surges from suspicious activity.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

service = TransactionService()

@app.get("/health", response_model=HealthResponse)
def health_check():
    metrics = service.get_analytics().model_metrics
    model_loaded = metrics.get("status") != "unavailable"
    return HealthResponse(
        status="healthy",
        model_loaded=model_loaded,
        dataset_source=service.get_analytics().dataset_source,
        version="1.0.0"
    )

@app.post("/predict", response_model=PredictionOutput)
def predict(transaction: TransactionInput):
    try:
        tx_dict = transaction.model_dump()
        return service.process_transaction(tx_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/analytics", response_model=AnalyticsSummary)
def get_analytics():
    return service.get_analytics()

@app.get("/transactions", response_model=List[PredictionOutput])
def get_transactions(limit: int = 100):
    return service.history[-limit:]

@app.get("/config", response_model=RiskConfig)
def get_config():
    return service.config

@app.post("/config", response_model=RiskConfig)
def update_config(config: RiskConfig):
    service.update_config(config)
    return service.config

@app.get("/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    if scenario_id not in ["1", "2", "3"]:
        raise HTTPException(status_code=400, detail="Invalid scenario_id. Must be 1, 2, or 3.")
    return service.get_scenarios(scenario_id)

@app.get("/dataset/summary")
def get_dataset_summary():
    path = service.dataset_path
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail=f"Dataset not found at {path}")
    df = pd.read_csv(path)
    is_sample = "sample" in os.path.basename(path).lower()

    amount_stats = df['Amount'].describe().to_dict()
    class_counts = df['Class'].value_counts().to_dict() if 'Class' in df.columns else {}

    return {
        "dataset_path": path,
        "dataset_source": "development_sample" if is_sample else "full_dataset",
        "total_rows": len(df),
        "amount_stats": amount_stats,
        "class_distribution": {
            "legitimate_class_0": int(class_counts.get(0, 0)),
            "fraud_class_1": int(class_counts.get(1, 0))
        }
    }
