import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer

CATEGORICAL_COLS = [
    'BusinessTravel', 'Department', 'EducationField',
    'Gender', 'JobRole', 'MaritalStatus', 'Over18', 'OverTime'
]

DROP_COLS = ['EmployeeCount', 'EmployeeNumber', 'StandardHours']

TARGET_COL = 'Attrition'


def load_and_preprocess(csv_path: str):
    df = pd.read_csv(csv_path)
    df.columns = df.columns.str.strip()

    # Drop useless columns
    df.drop(columns=[c for c in DROP_COLS if c in df.columns], inplace=True)

    # Encode target
    if TARGET_COL in df.columns:
        df[TARGET_COL] = df[TARGET_COL].map({'Yes': 1, 'No': 0})

    # Encode categoricals
    label_encoders = {}
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = df[col].astype(str)
            df[col] = le.fit_transform(df[col])
            label_encoders[col] = le

    # Impute missing values
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    imputer = SimpleImputer(strategy='median')
    df[num_cols] = imputer.fit_transform(df[num_cols])

    return df, label_encoders


def prepare_features(df: pd.DataFrame):
    if TARGET_COL in df.columns:
        X = df.drop(columns=[TARGET_COL])
        y = df[TARGET_COL]
        return X, y
    return df, None


def preprocess_single(employee: dict, feature_columns: list):
    """Preprocess a single employee record for prediction."""
    df = pd.DataFrame([employee])

    for col in CATEGORICAL_COLS:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))

    # Add missing columns with 0
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0

    df = df[feature_columns]

    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    imputer = SimpleImputer(strategy='median')
    df[num_cols] = imputer.fit_transform(df[num_cols])

    return df
