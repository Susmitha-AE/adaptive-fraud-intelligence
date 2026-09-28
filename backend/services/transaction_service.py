import os
import pandas as pd
from typing import List, Dict, Any
from backend.schemas import PredictionOutput, RiskConfig, AnalyticsSummary
from ml.predict import predict_fraud, get_model_metrics
from intelligence.surge_detection import SurgeDetector
from backend.decision_engine import RiskDecisionEngine

class TransactionService:
    """Manages live streaming transactions, analytics state, and scenario feeds."""

    def __init__(self, dataset_path: str = None):
        self.dataset_path = dataset_path or os.getenv("DATASET_PATH", "data/sample_transactions.csv")
        self.config = RiskConfig()
        self.surge_detector = SurgeDetector(historical_baseline_rate_per_min=self.config.baseline_rate_per_min)
        self.decision_engine = RiskDecisionEngine(config=self.config)

        self.history: List[PredictionOutput] = []
        self.total_processed = 0
        self.legitimate_count = 0
        self.fraudulent_count = 0
        self.high_risk_count = 0

    def update_config(self, new_config: RiskConfig):
        self.config = new_config
        self.surge_detector.set_baseline_rate(new_config.baseline_rate_per_min)
        self.decision_engine.update_config(new_config)

    def process_transaction(self, tx_dict: Dict[str, Any]) -> PredictionOutput:
        """Processes transaction through ML -> Temporal -> Fusion -> Decision."""
        ml_res = predict_fraud(tx_dict)
        temp_res = self.surge_detector.analyze_transaction(
            timestamp=float(tx_dict.get("Time", 0.0)),
            amount=float(tx_dict.get("Amount", 0.0))
        )

        output = self.decision_engine.evaluate(
            transaction_dict=tx_dict,
            ml_result=ml_res,
            temporal_result=temp_res
        )
        output.transaction_id = f"tx_{self.total_processed + 1}"

        self.history.append(output)
        self.total_processed += 1

        if output.decision == "BLOCK" or output.risk_score >= 70.0:
            self.high_risk_count += 1

        if output.fraud_probability > 0.5:
            self.fraudulent_count += 1
        else:
            self.legitimate_count += 1

        return output

    def get_analytics(self) -> AnalyticsSummary:
        model_metrics = get_model_metrics()

        is_sample = "sample" in os.path.basename(self.dataset_path).lower()
        dataset_source = "development_sample" if is_sample else "full_dataset"

        last_tx = self.history[-1] if self.history else None
        current_vel = last_tx.velocity_score * 60.0 if last_tx else 0.0
        surge_mult = last_tx.surge_multiplier if last_tx else 1.0

        avg_risk = sum(t.risk_score for t in self.history) / len(self.history) if self.history else 0.0
        if avg_risk >= 60.0:
            risk_level = "CRITICAL"
        elif avg_risk >= 30.0:
            risk_level = "ELEVATED"
        else:
            risk_level = "NORMAL"

        return AnalyticsSummary(
            total_transactions=self.total_processed,
            legitimate_count=self.legitimate_count,
            fraudulent_count=self.fraudulent_count,
            high_risk_count=self.high_risk_count,
            fraud_rate=round(self.fraudulent_count / max(1, self.total_processed), 4),
            current_velocity=round(current_vel, 2),
            surge_multiplier=round(surge_mult, 2),
            current_risk_level=risk_level,
            model_metrics=model_metrics,
            dataset_source=dataset_source
        )

    def get_scenarios(self, scenario_id: str) -> List[Dict[str, Any]]:
        """Generates realistic simulation streams for the 3 key hackathon scenarios."""
        df = pd.read_csv(self.dataset_path) if os.path.exists(self.dataset_path) else None

        if scenario_id == "1":
            # Normal transaction activity
            if df is not None and len(df) >= 30:
                sample_df = df[df["Class"] == 0].head(30) if "Class" in df.columns else df.head(30)
                records = sample_df.to_dict(orient="records")
            else:
                records = [{"Time": i * 30.0, "Amount": 45.0 + (i % 10)} for i in range(30)]
            for r in records:
                r["scenario_tag"] = "Normal Transaction Activity"
            return records

        elif scenario_id == "2":
            # High-volume legitimate surge (e.g. flash sale)
            if df is not None and len(df) >= 50:
                sample_df = df[df["Class"] == 0].iloc[100:180] if len(df) > 180 else df.head(50)
                records = sample_df.to_dict(orient="records")
            else:
                records = [{"Time": 3600.0 + i * 2.0, "Amount": 80.0 + (i % 20)} for i in range(50)]
            # Compress timestamps to simulate sudden volume surge
            start_t = 3600.0
            for i, r in enumerate(records):
                r["Time"] = start_t + (i * 2.5) # rapid incoming txs
                r["scenario_tag"] = "Legitimate High-Volume Surge"
            return records

        elif scenario_id == "3":
            # Suspicious high-velocity surge
            if df is not None and "Class" in df.columns and (df["Class"] == 1).sum() > 0:
                fraud_df = df[df["Class"] == 1].head(15)
                clean_df = df[df["Class"] == 0].head(25)
                combined = pd.concat([fraud_df, clean_df]).sample(frac=1, random_state=42)
                records = combined.to_dict(orient="records")
            else:
                records = [{"Time": 7200.0 + i * 1.5, "Amount": 999.0 if i % 3 == 0 else 50.0, "V14": -5.0 if i % 3 == 0 else 0.0} for i in range(40)]

            start_t = 7200.0
            for i, r in enumerate(records):
                r["Time"] = start_t + (i * 1.8)
                r["scenario_tag"] = "Suspicious High-Velocity Activity"
            return records

        return []
