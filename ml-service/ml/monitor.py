import joblib
import os
import json
import datetime
import numpy as np

MODEL_DIR = "./models"
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.joblib")
PREDICTIONS_LOG = os.path.join(MODEL_DIR, "predictions_log.jsonl")
MONITOR_PATH = os.path.join(MODEL_DIR, "monitor.joblib")


def get_model_health():
    """Return current model health status."""
    if not os.path.exists(METRICS_PATH):
        return {
            "status": "UNTRAINED",
            "message": "No model has been trained yet.",
            "accuracy": 0,
            "drift_score": 0,
            "predictions_count": 0,
            "last_trained": None,
        }

    metrics = joblib.load(METRICS_PATH)
    accuracy = metrics.get("accuracy", 0)

    # Count predictions from log
    predictions_count = 0
    recent_probs = []
    if os.path.exists(PREDICTIONS_LOG):
        with open(PREDICTIONS_LOG, "r") as f:
            lines = f.readlines()
        predictions_count = len(lines)
        # Parse last 50
        for line in lines[-50:]:
            try:
                r = json.loads(line)
                recent_probs.append(r.get("probability", 0.5))
            except Exception:
                pass

    # Drift: compare recent avg probability vs training expected
    drift_score = 0.0
    if recent_probs:
        recent_avg = np.mean(recent_probs)
        training_avg = metrics.get("training_attrition_rate", 0.16)
        drift_score = round(abs(recent_avg - training_avg), 4)

    # Health classification
    if accuracy >= 0.8 and drift_score < 0.1:
        status = "HEALTHY"
    elif accuracy >= 0.65 or drift_score < 0.2:
        status = "WARNING"
    else:
        status = "DEGRADED"

    # Last trained timestamp (from monitor store)
    last_trained = None
    if os.path.exists(MONITOR_PATH):
        mon = joblib.load(MONITOR_PATH)
        last_trained = mon.get("trained_at")

    return {
        "status": status,
        "accuracy": accuracy,
        "precision": metrics.get("precision", 0),
        "recall": metrics.get("recall", 0),
        "f1_score": metrics.get("f1_score", 0),
        "drift_score": drift_score,
        "predictions_count": predictions_count,
        "last_trained": last_trained,
        "message": _status_message(status, accuracy, drift_score),
        "retrain_recommended": status in ("WARNING", "DEGRADED"),
    }


def _status_message(status, accuracy, drift):
    if status == "HEALTHY":
        return f"Model is performing well with {accuracy*100:.1f}% accuracy."
    elif status == "WARNING":
        return f"Model shows signs of drift (score: {drift:.3f}). Consider retraining."
    else:
        return f"Model performance degraded. Retraining is recommended."


def record_training(metrics: dict):
    """Called after training to store monitor metadata."""
    os.makedirs(MODEL_DIR, exist_ok=True)
    monitor_data = {
        "trained_at": datetime.datetime.now().isoformat(),
        "accuracy": metrics.get("accuracy"),
        "f1_score": metrics.get("f1_score"),
        "training_attrition_rate": 0.16,  # IBM HR baseline
    }
    joblib.dump(monitor_data, MONITOR_PATH)


def record_prediction(result: dict):
    """Append a prediction result to the log file."""
    os.makedirs(MODEL_DIR, exist_ok=True)
    entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "probability": result.get("probability", 0),
        "prediction": result.get("prediction", 0),
        "risk_level": result.get("risk_level", "LOW"),
        "risk_score": result.get("risk_score", 0),
    }
    with open(PREDICTIONS_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")


def get_prediction_history():
    """Return last 100 prediction records for charts."""
    if not os.path.exists(PREDICTIONS_LOG):
        return {"records": [], "count": 0}

    records = []
    with open(PREDICTIONS_LOG, "r") as f:
        lines = f.readlines()

    for line in lines[-100:]:
        try:
            records.append(json.loads(line))
        except Exception:
            pass

    # Aggregate by day
    from collections import defaultdict
    daily = defaultdict(lambda: {"high": 0, "medium": 0, "low": 0, "total": 0})
    for r in records:
        day = r["timestamp"][:10]
        rl = r.get("risk_level", "LOW").upper()
        daily[day]["total"] += 1
        if rl == "HIGH":
            daily[day]["high"] += 1
        elif rl == "MEDIUM":
            daily[day]["medium"] += 1
        else:
            daily[day]["low"] += 1

    timeline = [{"date": k, **v} for k, v in sorted(daily.items())]

    # Risk distribution
    total = len(records)
    high = sum(1 for r in records if r.get("risk_level", "").upper() == "HIGH")
    medium = sum(1 for r in records if r.get("risk_level", "").upper() == "MEDIUM")
    low = total - high - medium

    return {
        "records": records[-20:],
        "count": total,
        "timeline": timeline,
        "risk_distribution": {"HIGH": high, "MEDIUM": medium, "LOW": low},
    }
