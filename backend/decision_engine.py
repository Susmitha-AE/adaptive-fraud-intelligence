from typing import Dict, Any, List
from backend.schemas import RiskConfig, PredictionOutput

class RiskDecisionEngine:
    """
    Fuses ML fraud probabilities with temporal/surge intelligence signals
    and generates automated decisions (ALLOW, REVIEW, BLOCK) with clear explainability.
    """

    def __init__(self, config: RiskConfig = None):
        self.config = config or RiskConfig()

    def update_config(self, config: RiskConfig):
        self.config = config

    def evaluate(
        self,
        transaction_dict: Dict[str, Any],
        ml_result: Dict[str, Any],
        temporal_result: Dict[str, Any]
    ) -> PredictionOutput:

        fraud_prob = float(ml_result.get("fraud_probability", 0.0))
        velocity_score = float(temporal_result.get("velocity_score", 0.0))
        surge_score = float(temporal_result.get("surge_score", 0.0))
        surge_multiplier = float(temporal_result.get("surge_multiplier", 1.0))
        temporal_anomaly = float(temporal_result.get("temporal_anomaly_score", 0.0))
        is_surge = bool(temporal_result.get("is_surge", False))

        amount = float(transaction_dict.get("Amount", 0.0))
        time_val = float(transaction_dict.get("Time", 0.0))

        # Risk Fusion calculation (0 to 100)
        # Note key directive: HIGH TRANSACTION VOLUME DOES NOT AUTOMATICALLY MEAN FRAUD.
        # If ML fraud probability is low, high surge alone won't force a BLOCK unless ML probability is elevated or anomaly is severe.
        ml_component = fraud_prob * 100.0
        temporal_component = temporal_anomaly * 100.0

        w_ml = self.config.ml_weight
        w_temp = self.config.temporal_weight
        total_w = w_ml + w_temp
        if total_w <= 0:
            total_w = 1.0

        raw_risk_score = (w_ml * ml_component + w_temp * temporal_component) / total_w

        # Dampen risk if it's a high volume surge but ML model indicates clean legitimate features
        if is_surge and fraud_prob < 0.15:
            # High-volume legitimate surge scenario
            raw_risk_score = min(raw_risk_score, 35.0)

        risk_score = round(min(100.0, max(0.0, raw_risk_score)), 1)

        # Decision Threshold Logic
        if risk_score >= self.config.block_threshold:
            decision = "BLOCK"
        elif risk_score >= self.config.allow_threshold:
            decision = "REVIEW"
        else:
            decision = "ALLOW"

        # Explainable Reasons (only show reasons supported by actual calculated signals)
        reasons: List[str] = []
        if fraud_prob >= 0.4:
            reasons.append(f"High ML fraud probability ({round(fraud_prob * 100, 1)}%)")
        elif fraud_prob >= 0.2:
            reasons.append(f"Elevated ML fraud probability ({round(fraud_prob * 100, 1)}%)")

        if surge_multiplier >= 3.0:
            reasons.append(f"Significant transaction volume surge ({surge_multiplier}x baseline)")
        elif surge_multiplier >= 1.8:
            reasons.append(f"Moderate transaction surge ({surge_multiplier}x baseline)")

        if velocity_score >= 0.6:
            reasons.append("Abnormal transaction velocity")

        if temporal_anomaly >= 0.5:
            reasons.append("Significant temporal deviation from historical baseline")

        if amount > 1000.0:
            reasons.append(f"Unusual high transaction amount (${amount:,.2f})")

        if not reasons:
            reasons.append("Normal transaction parameters and baseline activity")

        # Extract raw features V1..V28
        raw_features = {
            f"V{i}": float(transaction_dict.get(f"V{i}", 0.0)) for i in range(1, 29)
        }
        raw_features["Time"] = time_val
        raw_features["Amount"] = amount

        return PredictionOutput(
            Time=time_val,
            Amount=amount,
            fraud_probability=round(fraud_prob, 4),
            velocity_score=round(velocity_score, 4),
            surge_score=round(surge_score, 4),
            surge_multiplier=round(surge_multiplier, 2),
            temporal_anomaly_score=round(temporal_anomaly, 4),
            risk_score=risk_score,
            decision=decision,
            reasons=reasons,
            is_surge=is_surge,
            raw_features=raw_features
        )
