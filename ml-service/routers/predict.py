from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Dict
from ml.predictor import predict_employee

router = APIRouter()

class PredictRequest(BaseModel):
    Age: int = 35
    BusinessTravel: str = "Travel_Rarely"
    DailyRate: int = 800
    Department: str = "Research & Development"
    DistanceFromHome: int = 5
    Education: int = 3
    EducationField: str = "Life Sciences"
    EnvironmentSatisfaction: int = 3
    Gender: str = "Male"
    HourlyRate: int = 65
    JobInvolvement: int = 3
    JobLevel: int = 2
    JobRole: str = "Research Scientist"
    JobSatisfaction: int = 3
    MaritalStatus: str = "Single"
    MonthlyIncome: int = 5000
    MonthlyRate: int = 15000
    NumCompaniesWorked: int = 2
    Over18: str = "Y"
    OverTime: str = "No"
    PercentSalaryHike: int = 12
    PerformanceRating: int = 3
    RelationshipSatisfaction: int = 3
    StockOptionLevel: int = 1
    TotalWorkingYears: int = 8
    TrainingTimesLastYear: int = 3
    WorkLifeBalance: int = 3
    YearsAtCompany: int = 5
    YearsInCurrentRole: int = 3
    YearsSinceLastPromotion: int = 1
    YearsWithCurrManager: int = 3

@router.post("/predict")
def predict(request: PredictRequest):
    employee_data = request.dict()
    result = predict_employee(employee_data)
    return result
