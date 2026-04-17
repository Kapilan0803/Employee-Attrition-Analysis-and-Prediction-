import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report
)
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
from utils.preprocessor import load_and_preprocess, prepare_features

MODEL_DIR = "./models"
RF_MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.joblib")
LR_MODEL_PATH = os.path.join(MODEL_DIR, "lr_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_columns.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.joblib")


def train_models(csv_path: str):
    os.makedirs(MODEL_DIR, exist_ok=True)

    df, label_encoders = load_and_preprocess(csv_path)
    X, y = prepare_features(df)

    if y is None:
        raise ValueError("Target column 'Attrition' not found in dataset")

    feature_columns = list(X.columns)
    joblib.dump(feature_columns, FEATURES_PATH)

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    joblib.dump(scaler, SCALER_PATH)

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    # SMOTE for class imbalance
    try:
        smote = SMOTE(random_state=42)
        X_train_sm, y_train_sm = smote.fit_resample(X_train, y_train)
    except Exception:
        X_train_sm, y_train_sm = X_train, y_train

    # Train Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    rf.fit(X_train_sm, y_train_sm)
    joblib.dump(rf, RF_MODEL_PATH)

    # Train Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_train_sm, y_train_sm)
    joblib.dump(lr, LR_MODEL_PATH)

    # Evaluate (use RF as primary)
    y_pred = rf.predict(X_test)
    y_pred_proba = rf.predict_proba(X_test)[:, 1]

    cm = confusion_matrix(y_test, y_pred).tolist()
    acc = round(float(accuracy_score(y_test, y_pred)), 4)
    prec = round(float(precision_score(y_test, y_pred, zero_division=0)), 4)
    rec = round(float(recall_score(y_test, y_pred, zero_division=0)), 4)
    f1 = round(float(f1_score(y_test, y_pred, zero_division=0)), 4)

    # Feature importance
    feature_importance = dict(
        zip(feature_columns, rf.feature_importances_.tolist())
    )
    top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:15]

    metrics = {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "confusion_matrix": cm,
        "confusion_matrix_labels": ["Stayed", "Left"],
        "feature_importance": dict(top_features),
        "train_size": len(X_train_sm),
        "test_size": len(X_test),
        "total_samples": len(X),
        "model": "Random Forest + Logistic Regression"
    }
    joblib.dump(metrics, METRICS_PATH)

    return metrics


def get_metrics():
    if not os.path.exists(METRICS_PATH):
        return {"error": "Model not trained yet. Please train the model first."}
    return joblib.load(METRICS_PATH)


def get_feature_importance():
    if not os.path.exists(METRICS_PATH):
        return {"error": "Model not trained yet."}
    metrics = joblib.load(METRICS_PATH)
    return {"feature_importance": metrics.get("feature_importance", {})}
