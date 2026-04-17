from fastapi import APIRouter
from pydantic import BaseModel
from ml.clusterer import run_clustering

router = APIRouter()

class ClusterRequest(BaseModel):
    csv_path: str
    n_clusters: int = 3

@router.post("/run")
def cluster(request: ClusterRequest):
    try:
        result = run_clustering(request.csv_path, request.n_clusters)
        return {"success": True, **result}
    except Exception as e:
        return {"success": False, "error": str(e)}
