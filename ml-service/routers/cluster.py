import os
from fastapi import APIRouter
from pydantic import BaseModel
from ml.clusterer import run_clustering

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


class ClusterRequest(BaseModel):
    csv_path: str = ""
    n_clusters: int = 3


@router.post("/run")
def cluster(request: ClusterRequest):
    try:
        path = get_resolved_path(request.csv_path)
        result = run_clustering(path, request.n_clusters)
        return {"success": True, **result}
    except Exception as e:
        return {"success": False, "error": str(e)}
