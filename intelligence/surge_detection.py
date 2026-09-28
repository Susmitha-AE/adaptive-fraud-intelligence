import numpy as np
from typing import Dict, Any
from intelligence.temporal import TemporalTracker
from intelligence.velocity import VelocityTracker

class SurgeDetector:
    """
    Detects transaction volume surges compared to a baseline.
    Produces velocity_score, surge_score, and temporal_anomaly_score.
    """

    def __init__(self, historical_baseline_rate_per_min: float = 15.0, window_seconds: float = 300.0):
        self.baseline_rate = max(0.1, historical_baseline_rate_per_min)
        self.temporal_tracker = TemporalTracker(window_size_seconds=window_seconds)
        self.velocity_tracker = VelocityTracker(window_size_seconds=window_seconds)
        self.historical_amounts: list = []

    def set_baseline_rate(self, rate_per_min: float):
        if rate_per_min > 0:
            self.baseline_rate = rate_per_min

    def analyze_transaction(self, timestamp: float, amount: float) -> Dict[str, Any]:
        """Analyzes a single transaction timestamp & amount for surge & temporal signals."""
        temp_stats = self.temporal_tracker.add_transaction(timestamp, amount)
        vel_stats = self.velocity_tracker.update(timestamp)

        current_rate_per_min = vel_stats["rate_per_min"]

        # Surge multiplier: ratio of current rate to baseline rate
        surge_multiplier = round(current_rate_per_min / self.baseline_rate, 2)

        # Surge score (normalized 0 to 1)
        # 1x or less -> 0.0, 5x+ -> ~0.8, 10x+ -> 1.0
        surge_score = min(1.0, max(0.0, (surge_multiplier - 1.0) / 9.0))

        # Velocity score (normalized 0 to 1 based on absolute frequency)
        # e.g., 60 tx/min = 1.0
        velocity_score = min(1.0, max(0.0, current_rate_per_min / 60.0))

        # Amount deviation signal
        self.historical_amounts.append(amount)
        if len(self.historical_amounts) > 10:
            hist_mean = np.mean(self.historical_amounts)
            hist_std = np.std(self.historical_amounts) + 1e-5
            amount_z_score = abs(amount - hist_mean) / hist_std
        else:
            amount_z_score = 0.0

        amount_anomaly = min(1.0, amount_z_score / 4.0)

        # Temporal anomaly score combines surge score, velocity score, and amount anomaly
        temporal_anomaly_score = min(1.0, (0.5 * surge_score) + (0.3 * velocity_score) + (0.2 * amount_anomaly))

        is_surge = surge_multiplier >= 2.0

        return {
            "current_rate_per_min": current_rate_per_min,
            "historical_baseline_per_min": round(self.baseline_rate, 2),
            "surge_multiplier": surge_multiplier,
            "is_surge": is_surge,
            "surge_score": round(surge_score, 4),
            "velocity_score": round(velocity_score, 4),
            "temporal_anomaly_score": round(temporal_anomaly_score, 4),
            "window_details": temp_stats
        }
