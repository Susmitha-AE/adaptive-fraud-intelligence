from typing import Dict, Any, List

class VelocityTracker:
    """Tracks transaction velocity (rates per window/sec)."""

    def __init__(self, window_size_seconds: float = 300.0):
        self.window_size_seconds = window_size_seconds
        self.timestamps: List[float] = []

    def update(self, timestamp: float) -> Dict[str, Any]:
        """Updates rolling velocity given a new transaction timestamp."""
        self.timestamps.append(timestamp)

        # Purge old timestamps
        cutoff = timestamp - self.window_size_seconds
        self.timestamps = [t for t in self.timestamps if t >= cutoff]

        tx_count = len(self.timestamps)
        rate_per_sec = tx_count / self.window_size_seconds
        rate_per_min = rate_per_sec * 60.0

        return {
            "window_size_seconds": self.window_size_seconds,
            "window_count": tx_count,
            "rate_per_sec": round(rate_per_sec, 4),
            "rate_per_min": round(rate_per_min, 2)
        }
