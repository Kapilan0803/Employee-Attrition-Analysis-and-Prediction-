import joblib
import os
import numpy as np
import pandas as pd
from utils.preprocessor import preprocess_single, CATEGORICAL_COLS, DROP_COLS, load_and_preprocess, prepare_features
from ml.monitor import record_prediction

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
    emp_clean = dict(employee_data)
    emp_clean.pop("Attrition", None)

    # Preprocess
    X = preprocess_single(emp_clean, feature_columns)
    X_scaled = scaler.transform(X)

    # Predict
    prediction = int(rf.predict(X_scaled)[0])
    probability = float(rf.predict_proba(X_scaled)[0][1])

    label = "Likely to Leave" if prediction == 1 else "Likely to Stay"
    risk_level = "HIGH" if probability > 0.65 else "MEDIUM" if probability > 0.35 else "LOW"

    # Explain: top features contributing to this prediction
    explanation = explain_prediction(rf, X, feature_columns, prediction)

    # Retention strategies
    strategies = get_retention_strategies(emp_clean, probability)

    result = {
        "prediction": prediction,
        "label": label,
        "probability": round(probability, 4),
        "probability_percent": round(probability * 100, 1),
        "risk_level": risk_level,
        "risk_score": round(probability * 100, 1),
        "explanation": explanation,
        "retention_strategies": strategies
    }

    # Record in monitoring history
    try:
        record_prediction(result)
    except Exception as e:
        print(f"Warning: could not record prediction: {e}")

    return result


def predict_batch(csv_path: str):
    """Run prediction over an entire dataset to find at-risk employees."""
    if not os.path.exists(RF_MODEL_PATH):
        return {"error": "Model not trained yet. Please train the model first."}

    rf = joblib.load(RF_MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    feature_columns = joblib.load(FEATURES_PATH)

    df_raw = pd.read_csv(csv_path)
    df_raw.columns = df_raw.columns.str.strip()

    df_proc, _ = load_and_preprocess(csv_path)
    X, _ = prepare_features(df_proc)

    # Align columns
    for col in feature_columns:
        if col not in X.columns:
            X[col] = 0
    X = X[feature_columns]

    X_scaled = scaler.transform(X)
    preds = rf.predict(X_scaled)
    probs = rf.predict_proba(X_scaled)[:, 1]

    results = []
    for i, row in df_raw.iterrows():
        prob = float(probs[i])
        pred = int(preds[i])
        rl = "HIGH" if prob > 0.65 else "MEDIUM" if prob > 0.35 else "LOW"
        emp_id = row.get("EmployeeNumber", f"EMP-{i+1}")
        results.append({
            "employee_id": str(emp_id),
            "age": int(row.get("Age", 0)),
            "department": str(row.get("Department", "")),
            "job_role": str(row.get("JobRole", "")),
            "monthly_income": float(row.get("MonthlyIncome", 0)),
            "years_at_company": float(row.get("YearsAtCompany", 0)),
            "overtime": str(row.get("OverTime", "No")),
            "probability": round(prob, 4),
            "probability_percent": round(prob * 100, 1),
            "prediction": pred,
            "risk_level": rl
        })

    # Sort descending by attrition risk
    results.sort(key=lambda x: x["probability"], reverse=True)

    high_count = sum(1 for r in results if r["risk_level"] == "HIGH")
    med_count = sum(1 for r in results if r["risk_level"] == "MEDIUM")
    low_count = sum(1 for r in results if r["risk_level"] == "LOW")

    return {
        "total_employees": len(results),
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count,
        "at_risk_employees": results
    }


def explain_prediction(model, X: pd.DataFrame, feature_columns: list, prediction: int):
    """Generate top contributing factors using feature importance and feature deviation."""
    importances = model.feature_importances_
    feature_values = X.iloc[0].to_dict()

    contributions = []
    for i, col in enumerate(feature_columns):
        value = feature_values.get(col, 0)
        importance = float(importances[i])
        
        # Risk factor direction heuristic
        is_risk = False
        if col in ['OverTime', 'DistanceFromHome', 'NumCompaniesWorked', 'YearsSinceLastPromotion'] and value > 0:
            is_risk = True
        elif col in ['MonthlyIncome', 'JobSatisfaction', 'WorkLifeBalance', 'EnvironmentSatisfaction', 'StockOptionLevel'] and value < 3:
            is_risk = True
        elif importance > 0.05:
            is_risk = True

        contributions.append({
            "feature": col,
            "value": round(float(value), 2),
            "importance": round(importance, 4),
            "direction": "risk" if is_risk else "protective"
        })

    # Sort by importance
    contributions.sort(key=lambda x: x["importance"], reverse=True)
    return contributions[:10]


def get_retention_strategies(employee_data: dict, probability: float):
    strategies = []

    overtime = str(employee_data.get("OverTime", "")).lower()
    income = float(employee_data.get("MonthlyIncome", 0))
    years_at_company = float(employee_data.get("YearsAtCompany", 0))
    job_satisfaction = float(employee_data.get("JobSatisfaction", 3))
    work_life = float(employee_data.get("WorkLifeBalance", 3))
    years_since_promotion = float(employee_data.get("YearsSinceLastPromotion", 0))
    env_satisfaction = float(employee_data.get("EnvironmentSatisfaction", 3))
    stock_option = float(employee_data.get("StockOptionLevel", 0))

    if overtime in ["yes", "1", "true"]:
        strategies.append({
            "issue": "Excessive Overtime Burden",
            "suggestion": "Cap overtime hours immediately. Offer compensatory off days or time-and-a-half overtime allowance.",
            "priority": "HIGH"
        })

    if income < 3500:
        strategies.append({
            "issue": "Below-Market Compensation",
            "suggestion": "Conduct a compensation review. A targeted market-rate salary adjustment (15-20%) can drastically lower flight risk.",
            "priority": "HIGH"
        })

    if years_since_promotion >= 3 and years_at_company >= 2:
        strategies.append({
            "issue": "Promotion Stagnation (>3 Years)",
            "suggestion": "Employee is experiencing role plateau. Schedule an immediate career progression review and promotion roadmap.",
            "priority": "HIGH"
        })

    if job_satisfaction <= 2:
        strategies.append({
            "issue": "Low Job & Role Satisfaction",
            "suggestion": "Hold a confidential 1:1 stay interview. Explore role adjustments, new responsibilities, or cross-functional transfers.",
            "priority": "MEDIUM"
        })

    if work_life <= 2:
        strategies.append({
            "issue": "Poor Work-Life Balance Rating",
            "suggestion": "Provide hybrid/remote work flexibility and encourage strict boundary setting for off-hours communications.",
            "priority": "MEDIUM"
        })

    if stock_option == 0:
        strategies.append({
            "issue": "No Equity / Stock Incentives",
            "suggestion": "Introduce an equity grant or retention-tied bonus to boost long-term alignment with company goals.",
            "priority": "MEDIUM"
        })

    if env_satisfaction <= 2:
        strategies.append({
            "issue": "Low Workplace Environment Satisfaction",
            "suggestion": "Assess team health, peer collaboration, and manager feedback. Implement team culture improvements.",
            "priority": "LOW"
        })

    if not strategies:
        strategies.append({
            "issue": "Healthy Employee Profile",
            "suggestion": "Maintain ongoing engagement through mentorship, regular check-ins, and performance recognition.",
            "priority": "LOW"
        })

    return strategies
