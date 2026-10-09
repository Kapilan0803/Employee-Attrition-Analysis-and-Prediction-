import os
from fastapi import APIRouter
from pydantic import BaseModel
from ml.trainer import train_models, get_metrics, get_feature_importance

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

class TrainRequest(BaseModel):
    csv_path: str = ""

@router.post("/train")
def train(request: TrainRequest):
    try:
        path = get_resolved_path(request.csv_path)
        metrics = train_models(path)
        return {"success": True, "metrics": metrics}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/metrics")
def metrics():
    return get_metrics()

@router.get("/feature-importance")
def feature_importance():
    return get_feature_importance()
