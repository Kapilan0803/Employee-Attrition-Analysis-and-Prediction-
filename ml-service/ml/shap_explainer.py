import joblib
import os
import numpy as np
import pandas as pd

MODEL_DIR = "./models"
RF_MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_columns.joblib")


def _load_model():
    if not os.path.exists(RF_MODEL_PATH):
        raise FileNotFoundError("Model not trained yet")
    rf = joblib.load(RF_MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    feature_columns = joblib.load(FEATURES_PATH)
    return rf, scaler, feature_columns


def global_shap(csv_path: str, max_samples: int = 200):
    """Compute global SHAP feature importance from a dataset sample."""
    try:
        import shap
        from utils.preprocessor import load_and_preprocess, prepare_features

        rf, scaler, feature_columns = _load_model()

        df, _ = load_and_preprocess(csv_path)
        X, _ = prepare_features(df)

        # Use a sample to keep it fast
        if len(X) > max_samples:
            X = X.sample(max_samples, random_state=42)

        X_scaled = scaler.transform(X[feature_columns])

        explainer = shap.TreeExplainer(rf)
        shap_values = explainer.shap_values(X_scaled)

        # For binary classification, shap_values is a list [class0, class1]
        # We want class 1 (attrition = Yes)
        if isinstance(shap_values, list):
            sv = shap_values[1]
        else:
            sv = shap_values

        mean_abs = np.abs(sv).mean(axis=0)
        importance = dict(zip(feature_columns, mean_abs.tolist()))
        top = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:15]

        return {
            "feature_importance": [{"feature": k, "shap_value": round(v, 5)} for k, v in top],
            "summary": f"Top driver: {top[0][0]}" if top else "",
            "sample_size": len(X),
        }
    except ImportError:
        return {"error": "SHAP library not installed. Run: pip install shap"}
    except Exception as e:
        return {"error": str(e)}


def local_shap(employee_data: dict, csv_path: str):
    """Compute SHAP values for a single employee prediction."""
    try:
        import shap
        from utils.preprocessor import preprocess_single, load_and_preprocess

        rf, scaler, feature_columns = _load_model()

        # Build background data from CSV (small sample)
        df, _ = load_and_preprocess(csv_path)
        from utils.preprocessor import prepare_features
        X_bg, _ = prepare_features(df)
        sample_size = min(50, len(X_bg))
        X_bg_scaled = scaler.transform(X_bg[feature_columns].sample(sample_size, random_state=42))

        # Prepare instance
        employee_data.pop("Attrition", None)
        X_inst = preprocess_single(employee_data, feature_columns)
        X_inst_scaled = scaler.transform(X_inst)

        explainer = shap.TreeExplainer(rf, X_bg_scaled)
        shap_values = explainer.shap_values(X_inst_scaled)

        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0]

        contributions = [
            {"feature": col, "shap_value": round(float(sv[i]), 5)}
            for i, col in enumerate(feature_columns)
        ]
        contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        top = contributions[:10]

        # Build textual explanation
        risk_factors = [c["feature"] for c in top if c["shap_value"] > 0][:3]
        protect_factors = [c["feature"] for c in top if c["shap_value"] < 0][:2]
        explanation_text = ""
        if risk_factors:
            explanation_text = f"Top attrition risk factors: {', '.join(risk_factors)}."
        if protect_factors:
            explanation_text += f" Protective factors: {', '.join(protect_factors)}."

        return {
            "shap_values": top,
            "explanation_text": explanation_text,
            "base_value": round(float(explainer.expected_value[1] if isinstance(explainer.expected_value, list) else explainer.expected_value), 4),
        }
    except ImportError:
        return {"error": "SHAP library not installed. Run: pip install shap"}
    except Exception as e:
        return {"error": str(e)}
