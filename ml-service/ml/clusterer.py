import pandas as pd
import numpy as np
import joblib
import os
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from utils.preprocessor import load_and_preprocess

CLUSTER_NUMERIC_COLS = [
    'Age', 'MonthlyIncome', 'YearsAtCompany', 'JobSatisfaction',
    'WorkLifeBalance', 'EnvironmentSatisfaction', 'PerformanceRating',
    'YearsSinceLastPromotion', 'TotalWorkingYears', 'NumCompaniesWorked'
]


def run_clustering(csv_path: str, n_clusters: int = 3):
    df_raw = pd.read_csv(csv_path)
    df_raw.columns = df_raw.columns.str.strip()

    # Use only available numeric columns
    available_cols = [c for c in CLUSTER_NUMERIC_COLS if c in df_raw.columns]
    df_cluster = df_raw[available_cols].copy()

    # Fill missing
    df_cluster.fillna(df_cluster.median(numeric_only=True), inplace=True)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df_cluster)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    df_raw['Cluster'] = labels

    # Build cluster profiles
    profiles = []
    cluster_names = {0: "High-Risk", 1: "Stable", 2: "High-Performer"}

    for i in range(n_clusters):
        mask = df_raw['Cluster'] == i
        cluster_df = df_raw[mask]
        size = int(mask.sum())

        avg_income = round(float(cluster_df['MonthlyIncome'].mean()), 0) if 'MonthlyIncome' in cluster_df else 0
        avg_age = round(float(cluster_df['Age'].mean()), 1) if 'Age' in cluster_df else 0
        avg_tenure = round(float(cluster_df['YearsAtCompany'].mean()), 1) if 'YearsAtCompany' in cluster_df else 0
        avg_satisfaction = round(float(cluster_df['JobSatisfaction'].mean()), 2) if 'JobSatisfaction' in cluster_df else 0

        attrition_rate = 0
        if 'Attrition' in cluster_df.columns:
            att_vals = cluster_df['Attrition'].astype(str).str.lower()
            attrition_rate = round(float((att_vals == 'yes').sum() / size * 100), 1)

        dept_counts = {}
        if 'Department' in cluster_df.columns:
            dept_counts = cluster_df['Department'].value_counts().head(3).to_dict()

        # Determine cluster label by characteristics
        if attrition_rate > 20:
            cluster_label = "High-Risk"
            risk_level = "HIGH"
            color = "#ef4444"
        elif avg_satisfaction >= 3 and avg_income > 5000:
            cluster_label = "High-Performer"
            risk_level = "LOW"
            color = "#22c55e"
        else:
            cluster_label = "Stable"
            risk_level = "MEDIUM"
            color = "#f59e0b"

        profiles.append({
            "cluster_id": i,
            "label": cluster_label,
            "risk_level": risk_level,
            "color": color,
            "size": size,
            "percentage": round(size / len(df_raw) * 100, 1),
            "avg_monthly_income": avg_income,
            "avg_age": avg_age,
            "avg_tenure": avg_tenure,
            "avg_job_satisfaction": avg_satisfaction,
            "attrition_rate": attrition_rate,
            "top_departments": dept_counts
        })

    # Build scatter data (use first 2 PCA-like features for visualization)
    scatter_data = []
    for _, row in df_raw.iterrows():
        scatter_data.append({
            "x": float(row.get("YearsAtCompany", 0)),
            "y": float(row.get("MonthlyIncome", 0)),
            "cluster": int(row["Cluster"]),
            "department": str(row.get("Department", ""))
        })

    return {
        "profiles": profiles,
        "scatter_data": scatter_data[:500],  # cap for performance
        "total_employees": len(df_raw),
        "n_clusters": n_clusters
    }
