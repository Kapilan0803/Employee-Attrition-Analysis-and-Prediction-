import pandas as pd
import numpy as np
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class DatasetRequest(BaseModel):
    csv_path: str
    group_by: str = "Department"

@router.post("/correlation")
def get_correlation(request: DatasetRequest):
    try:
        df = pd.read_csv(request.csv_path)
        df.columns = df.columns.str.strip()

        # Encode Attrition
        if 'Attrition' in df.columns:
            df['Attrition'] = df['Attrition'].map({'Yes': 1, 'No': 0})

        # Keep only numeric
        num_df = df.select_dtypes(include=[np.number])
        corr_matrix = num_df.corr().round(3)

        # Replace NaN with 0
        corr_matrix = corr_matrix.fillna(0)

        return {
            "columns": list(corr_matrix.columns),
            "matrix": corr_matrix.values.tolist()
        }
    except Exception as e:
        return {"error": str(e)}

@router.post("/distributions")
def get_distributions(request: DatasetRequest):
    try:
        df = pd.read_csv(request.csv_path)
        df.columns = df.columns.str.strip()

        numeric_cols = ['Age', 'MonthlyIncome', 'YearsAtCompany', 'TotalWorkingYears',
                        'DistanceFromHome', 'PercentSalaryHike', 'NumCompaniesWorked']
        available = [c for c in numeric_cols if c in df.columns]

        distributions = {}
        for col in available:
            values = df[col].dropna()
            hist, bin_edges = np.histogram(values, bins=10)
            distributions[col] = {
                "labels": [f"{round(bin_edges[i], 1)}-{round(bin_edges[i+1], 1)}"
                           for i in range(len(bin_edges) - 1)],
                "values": hist.tolist(),
                "mean": round(float(values.mean()), 2),
                "median": round(float(values.median()), 2),
                "std": round(float(values.std()), 2)
            }

        return {"distributions": distributions}
    except Exception as e:
        return {"error": str(e)}

@router.post("/attrition-by")
def get_attrition_by(request: DatasetRequest):
    try:
        df = pd.read_csv(request.csv_path)
        df.columns = df.columns.str.strip()

        if 'Attrition' not in df.columns:
            return {"error": "Attrition column not found"}

        group_col = request.group_by
        if group_col not in df.columns:
            group_col = 'Department'

        groups = df.groupby(group_col)['Attrition'].value_counts().unstack(fill_value=0)

        result = {}
        for group_name, row in groups.iterrows():
            yes = int(row.get('Yes', 0))
            no = int(row.get('No', 0))
            total = yes + no
            result[str(group_name)] = {
                "attrition": yes,
                "staying": no,
                "total": total,
                "attrition_rate": round(yes / total * 100, 1) if total > 0 else 0
            }

        return {
            "group_by": group_col,
            "data": result,
            "labels": list(result.keys()),
            "attrition_counts": [v["attrition"] for v in result.values()],
            "staying_counts": [v["staying"] for v in result.values()],
            "attrition_rates": [v["attrition_rate"] for v in result.values()]
        }
    except Exception as e:
        return {"error": str(e)}
