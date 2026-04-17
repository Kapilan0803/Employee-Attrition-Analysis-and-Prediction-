from fastapi import APIRouter
from pydantic import BaseModel
from ml.forecaster import forecast_attrition, cohort_analysis

router = APIRouter()


class DatasetRequest(BaseModel):
    csv_path: str = ""
    periods: int = 12


@router.post("/forecast")
def get_forecast(request: DatasetRequest):
    try:
        return forecast_attrition(request.csv_path, request.periods)
    except Exception as e:
        return {"error": str(e)}


@router.post("/cohort")
def get_cohort(request: DatasetRequest):
    try:
        return cohort_analysis(request.csv_path)
    except Exception as e:
        return {"error": str(e)}
