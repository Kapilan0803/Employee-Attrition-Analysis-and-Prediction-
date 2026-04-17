import joblib
import os
import numpy as np
import pandas as pd
from utils.preprocessor import preprocess_single, CATEGORICAL_COLS, DROP_COLS

MODEL_DIR = "./models"
RF_MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_columns.joblib")


def predict_employee(employee_data: dict):
    if not os.path.exists(RF_MODEL_PATH):
        return {"error": "Model not trained yet. Please train the model first."}

    rf = joblib.load(RF_MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    feature_columns = joblib.load(FEATURES_PATH)

    # Remove target if accidentally included
    employee_data.pop("Attrition", None)

    # Preprocess
    X = preprocess_single(employee_data, feature_columns)
    X_scaled = scaler.transform(X)

    # Predict
    prediction = int(rf.predict(X_scaled)[0])
    probability = float(rf.predict_proba(X_scaled)[0][1])

    label = "Likely to Leave" if prediction == 1 else "Likely to Stay"
    risk_level = "HIGH" if probability > 0.7 else "MEDIUM" if probability > 0.4 else "LOW"

    # Explain: top features contributing to this prediction
    explanation = explain_prediction(rf, X, feature_columns, prediction)

    # Retention strategies
    strategies = get_retention_strategies(employee_data, probability)

    return {
        "prediction": prediction,
        "label": label,
        "probability": round(probability, 4),
        "probability_percent": round(probability * 100, 1),
        "risk_level": risk_level,
        "explanation": explanation,
        "retention_strategies": strategies
    }


def explain_prediction(model, X: pd.DataFrame, feature_columns: list, prediction: int):
    """Generate top contributing factors using feature importance."""
    importances = model.feature_importances_
    feature_values = X.iloc[0].to_dict()

    contributions = []
    for i, col in enumerate(feature_columns):
        value = feature_values.get(col, 0)
        importance = float(importances[i])
        contributions.append({
            "feature": col,
            "value": round(float(value), 2),
            "importance": round(importance, 4),
            "direction": "risk" if importance > 0.03 else "neutral"
        })

    # Sort by importance
    contributions.sort(key=lambda x: x["importance"], reverse=True)
    return contributions[:8]


def get_retention_strategies(employee_data: dict, probability: float):
    strategies = []

    overtime = str(employee_data.get("OverTime", "")).lower()
    income = float(employee_data.get("MonthlyIncome", 0))
    years_at_company = float(employee_data.get("YearsAtCompany", 0))
    job_satisfaction = float(employee_data.get("JobSatisfaction", 3))
    work_life = float(employee_data.get("WorkLifeBalance", 3))
    years_since_promotion = float(employee_data.get("YearsSinceLastPromotion", 0))
    env_satisfaction = float(employee_data.get("EnvironmentSatisfaction", 3))

    if overtime in ["yes", "1", "true"]:
        strategies.append({
            "issue": "Excessive Overtime",
            "suggestion": "Consider reducing overtime requirements or offering overtime compensation/flex time.",
            "priority": "HIGH"
        })

    if income < 3000:
        strategies.append({
            "issue": "Below-average Salary",
            "suggestion": "Review compensation — a salary hike of 15-20% could significantly reduce attrition risk.",
            "priority": "HIGH"
        })

    if years_since_promotion > 3 and years_at_company > 2:
        strategies.append({
            "issue": "No Recent Promotion",
            "suggestion": "Employee hasn't been promoted in over 3 years. Consider a performance review and career advancement discussion.",
            "priority": "HIGH"
        })

    if job_satisfaction <= 2:
        strategies.append({
            "issue": "Low Job Satisfaction",
            "suggestion": "Conduct 1:1 meetings to identify pain points. Consider role enrichment or project rotation.",
            "priority": "MEDIUM"
        })

    if work_life <= 2:
        strategies.append({
            "issue": "Poor Work-Life Balance",
            "suggestion": "Offer flexible working hours or remote work options to improve work-life balance.",
            "priority": "MEDIUM"
        })

    if env_satisfaction <= 2:
        strategies.append({
            "issue": "Low Environment Satisfaction",
            "suggestion": "Improve workplace culture and team dynamics. Consider team-building activities.",
            "priority": "MEDIUM"
        })

    if not strategies:
        strategies.append({
            "issue": "General Retention",
            "suggestion": "Keep the employee engaged with recognition programs and regular career development conversations.",
            "priority": "LOW"
        })

    return strategies
