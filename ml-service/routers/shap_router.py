import os
from fastapi import APIRouter
from pydantic import BaseModel
from ml.shap_explainer import global_shap, local_shap

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


class LocalShapRequest(BaseModel):
    csv_path: str = ""
    employee_data: dict = {}


@router.post("/global")
def shap_global(request: DatasetRequest):
    try:
        path = get_resolved_path(request.csv_path)
        return global_shap(path)
    except Exception as e:
        return {"error": str(e)}


@router.post("/local")
def shap_local(request: LocalShapRequest):
    try:
        path = get_resolved_path(request.csv_path)
        return local_shap(request.employee_data, path)
    except Exception as e:
        return {"error": str(e)}
