from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TransactionInput(BaseModel):
    Time: float = Field(..., description="Transaction timestamp or elapsed time in seconds")
    V1: Optional[float] = 0.0
    V2: Optional[float] = 0.0
    V3: Optional[float] = 0.0
    V4: Optional[float] = 0.0
    V5: Optional[float] = 0.0
    V6: Optional[float] = 0.0
    V7: Optional[float] = 0.0
    V8: Optional[float] = 0.0
    V9: Optional[float] = 0.0
    V10: Optional[float] = 0.0
    V11: Optional[float] = 0.0
    V12: Optional[float] = 0.0
    V13: Optional[float] = 0.0
    V14: Optional[float] = 0.0
    V15: Optional[float] = 0.0
    V16: Optional[float] = 0.0
    V17: Optional[float] = 0.0
    V18: Optional[float] = 0.0
    V19: Optional[float] = 0.0
    V20: Optional[float] = 0.0
    V21: Optional[float] = 0.0
    V22: Optional[float] = 0.0
    V23: Optional[float] = 0.0
    V24: Optional[float] = 0.0
    V25: Optional[float] = 0.0
    V26: Optional[float] = 0.0
    V27: Optional[float] = 0.0
    V28: Optional[float] = 0.0
    Amount: float = Field(..., description="Transaction monetary amount")

class RiskConfig(BaseModel):
    allow_threshold: float = Field(30.0, description="Risk score below this is ALLOW")
    block_threshold: float = Field(70.0, description="Risk score above this is BLOCK")
    ml_weight: float = Field(0.6, description="Weight of ML fraud score in risk fusion (0 to 1)")
    temporal_weight: float = Field(0.4, description="Weight of temporal anomaly score in risk fusion (0 to 1)")
    baseline_rate_per_min: float = Field(15.0, description="Historical baseline transaction rate per minute")

class PredictionOutput(BaseModel):
    transaction_id: Optional[str] = None
    Time: float
    Amount: float
    fraud_probability: float
    velocity_score: float
    surge_score: float
    surge_multiplier: float
    temporal_anomaly_score: float
    risk_score: float
    decision: str  # ALLOW | REVIEW | BLOCK
    reasons: List[str]
    is_surge: bool
    scenario_type: Optional[str] = None
    raw_features: Dict[str, float]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    dataset_source: str
    version: str

class AnalyticsSummary(BaseModel):
    total_transactions: int
    legitimate_count: int
    fraudulent_count: int
    high_risk_count: int
    fraud_rate: float
    current_velocity: float
    surge_multiplier: float
    current_risk_level: str
    model_metrics: Dict[str, Any]
    dataset_source: str
