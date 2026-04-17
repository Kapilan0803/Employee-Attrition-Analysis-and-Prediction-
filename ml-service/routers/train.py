from fastapi import APIRouter
from pydantic import BaseModel
from ml.trainer import train_models, get_metrics, get_feature_importance

router = APIRouter()

class TrainRequest(BaseModel):
    csv_path: str

@router.post("/train")
def train(request: TrainRequest):
    try:
        metrics = train_models(request.csv_path)
        return {"success": True, "metrics": metrics}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/metrics")
def metrics():
    return get_metrics()

@router.get("/feature-importance")
def feature_importance():
    return get_feature_importance()
