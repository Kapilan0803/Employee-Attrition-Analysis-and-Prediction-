from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import eda, train, predict, cluster, reports

app = FastAPI(
    title="EAAP ML Service",
    description="Employee Attrition Analysis & Prediction — ML Microservice",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(eda.router, prefix="/eda", tags=["EDA"])
app.include_router(train.router, prefix="/ml", tags=["ML Training"])
app.include_router(predict.router, prefix="/ml", tags=["ML Prediction"])
app.include_router(cluster.router, prefix="/cluster", tags=["Segmentation"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "EAAP ML Service"}
