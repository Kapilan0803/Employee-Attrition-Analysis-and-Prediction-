from fastapi import APIRouter
from ml.monitor import get_model_health, get_prediction_history

router = APIRouter()


@router.get("/health")
def model_health():
    return get_model_health()


@router.get("/history")
def prediction_history():
    return get_prediction_history()
