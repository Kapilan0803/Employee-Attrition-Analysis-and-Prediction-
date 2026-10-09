import os
from fastapi import APIRouter
from pydantic import BaseModel
from ml.forecaster import forecast_attrition, cohort_analysis

router = APIRouter()

DEFAULT_CSV = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "ibm_hr_attrition.csv")
)


def get_resolved_path(path: str) -> str:
    if path and os.path.exists(path):
        return path
    if os.path.exists(DEFAULT_CSV):
        return DEFAULT_CSV
    return path


class DatasetRequest(BaseModel):
    csv_path: str = ""
    periods: int = 12


@router.post("/forecast")
def get_forecast(request: DatasetRequest):
    try:
        path = get_resolved_path(request.csv_path)
        return forecast_attrition(path, request.periods)
    except Exception as e:
        return {"error": str(e)}


@router.post("/cohort")
def get_cohort(request: DatasetRequest):
    try:
        path = get_resolved_path(request.csv_path)
        return cohort_analysis(path)
    except Exception as e:
        return {"error": str(e)}
