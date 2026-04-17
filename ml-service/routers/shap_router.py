from fastapi import APIRouter
from pydantic import BaseModel
from ml.shap_explainer import global_shap, local_shap
from repository import get_active_csv_path

router = APIRouter()


class DatasetRequest(BaseModel):
    csv_path: str = ""


class LocalShapRequest(BaseModel):
    csv_path: str = ""
    employee_data: dict = {}


@router.post("/global")
def shap_global(request: DatasetRequest):
    try:
        path = request.csv_path or get_active_csv_path()
        return global_shap(path)
    except Exception as e:
        return {"error": str(e)}


@router.post("/local")
def shap_local(request: LocalShapRequest):
    try:
        path = request.csv_path or get_active_csv_path()
        return local_shap(request.employee_data, path)
    except Exception as e:
        return {"error": str(e)}
