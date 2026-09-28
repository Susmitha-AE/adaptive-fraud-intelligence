import numpy as np
import pandas as pd
from typing import Dict, Any, List

class TemporalTracker:
    """Tracks time deltas and temporal statistics over rolling windows."""

    def __init__(self, window_size_seconds: float = 300.0):
        self.window_size_seconds = window_size_seconds
        self.timestamps: List[float] = []
        self.amounts: List[float] = []

    def add_transaction(self, timestamp: float, amount: float) -> Dict[str, Any]:
        """Adds transaction and calculates temporal metrics."""
        self.timestamps.append(timestamp)
        self.amounts.append(amount)

        # Keep only transactions within current rolling window
        cutoff = timestamp - self.window_size_seconds
        valid_indices = [i for i, t in enumerate(self.timestamps) if t >= cutoff]

        self.timestamps = [self.timestamps[i] for i in valid_indices]
        self.amounts = [self.amounts[i] for i in valid_indices]

        count = len(self.timestamps)

        if count > 1:
            time_deltas = np.diff(self.timestamps)
            mean_time_delta = float(np.mean(time_deltas))
        else:
            mean_time_delta = 0.0

        amounts_arr = np.array(self.amounts) if self.amounts else np.array([0.0])
        rolling_mean_amount = float(np.mean(amounts_arr))
        rolling_std_amount = float(np.std(amounts_arr)) if len(amounts_arr) > 1 else 0.0

        return {
            "window_count": count,
            "mean_time_delta": round(mean_time_delta, 2),
            "rolling_mean_amount": round(rolling_mean_amount, 2),
            "rolling_std_amount": round(rolling_std_amount, 2)
        }
