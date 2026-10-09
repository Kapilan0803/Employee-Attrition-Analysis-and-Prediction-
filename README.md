# EAAP — Employee Attrition Analysis & Prediction

An enterprise-grade, full-stack AI-powered HR analytics and retention intelligence platform.

---

## 🏗️ Architecture

```
Frontend (React 19 / Vite / Chart.js) :5173
      ↓ REST API + JWT
Backend (Spring Boot 3.2.5 / Java 17 / H2 DB) :8080
      ↓ HTTP Proxy
ML Service (Python 3.13 / FastAPI / Scikit-Learn / SHAP) :8000
```

---

## 🌟 Modules & Core Features

### 1. 📊 Executive HR Dashboard (`/dashboard`)
- **Key Performance Indicators (KPIs)**: Total Employees, Attrition Rate, Departures Count, Average Tenure, Average Monthly Income, Average Age.
- **Workforce Visualizations**: Department-wise attrition vs retained bar chart, Gender breakdown doughnut, Age distribution histogram, Salary bands distribution.
- **Department Summary Matrix**: Tabular breakdown of headcount, retention count, and attrition percentage per business unit.

### 2. 📁 Data Management (`/data`)
- **Dataset Ingestion**: Support for CSV and XLSX employee datasets with automated header parsing and validation.
- **Dataset Registry & Activation**: Switch active datasets with a single click.
- **Interactive Dataset Preview**: Paginated preview table showing all rows and columns with exact counts.

### 3. 🔍 Exploratory Data Analysis (`/eda`)
- **Correlation Heatmap**: Dynamic numerical correlation matrix with color-coded positive and negative correlation intensities.
- **Statistical Feature Distributions**: Histograms with calculated mean, median, and standard deviation for key attributes.
- **Comparative Attrition Rates**: Group-by analysis for Department, Gender, Job Role, Marital Status, Business Travel, and Education Field.

### 4. 🤖 Machine Learning & XAI Studio (`/ml`)
- **Multi-Model Training**: Parallel training of Random Forest Classifier and Logistic Regression with SMOTE (Synthetic Minority Over-sampling Technique) for imbalanced classes.
- **Evaluation Metrics**: Precision, Recall, F1-Score, Overall Accuracy, and Confusion Matrix (True Positives, False Positives, False Negatives, True Negatives).
- **Algorithm Comparison Table**: Benchmark table showing side-by-side performance of Random Forest vs Logistic Regression.
- **SHAP Global Explainability**: TreeExplainer game-theoretic Shapley values measuring true feature impact on model output.
- **Model Health & Drift Monitor**: Real-time drift tracking score, live prediction counter, health status (`HEALTHY`, `WARNING`, `DEGRADED`), and automatic retraining advisory.
- **Prediction History Timeline**: Historical chart tracking daily High, Medium, and Low flight-risk predictions.

### 5. 🎯 Attrition Prediction Studio (`/prediction`)
- **Individual Employee Inference**: Comprehensive 30-factor input form covering demographics, compensation, role, satisfaction, and tenure.
- **Risk Assessment**: Clear departure probability score, risk level badge (`HIGH`, `MEDIUM`, `LOW`), and confidence meter.
- **🎛️ Interactive What-If Simulator**: Real-time sliders allowing HR to simulate salary hikes (+5% to +35%), removing overtime, and boosting role satisfaction to immediately observe risk reduction before taking action.
- **Attribution Drivers**: Positive and negative feature force breakdown explaining why the prediction was made.
- **Actionable HR Playbook**: Prioritized retention recommendations (High, Medium, Low priority) tailored to the specific employee distress factors.
- **📋 Batch Workforce Screening**: One-click batch inference across all employees in the active dataset with sortable risk roster and department filters.

### 6. 📈 Forecasting & Cohort Analysis (`/forecasting`)
- **12-Month Headcount Projections**: Monte Carlo simulation projecting monthly departures with 95% Poisson confidence intervals.
- **Trend Classification**: Directional trend detection (`INCREASING`, `STABLE`, `DECREASING`).
- **Departmental Cohort Retention Curves**: Retention milestone tracking across tenure buckets (`<1yr`, `1-3yr`, `3-5yr`, `5-10yr`, `10+yr`).

### 7. 🧩 Employee Segmentation (`/segmentation`)
- **K-Means Clustering**: Unsupervised behavioral grouping into `High-Risk`, `Stable`, and `High-Performer` clusters.
- **Cluster Profiles**: Comparative statistics on average income, age, tenure, satisfaction, and attrition rate.
- **2D Cluster Scatter Plot**: Tenure vs Monthly Income distribution visualization.

### 8. 🔔 Proactive Alerts & Notifications (`/alerts`)
- **Workforce Risk Scanner**: Automated rule-based engine scanning active datasets for high overtime burden, compensation gaps, promotion stagnation, and survey dissatisfaction.
- **Curated Alert Feed**: Severity tagging (`HIGH`, `MEDIUM`, `LOW`), unread notification badge, and recommended action steps.

### 9. 📄 Automated PDF Reporting (`/reports`)
- **Executive PDF Generation**: Powered by ReportLab, compiling executive summaries, department attrition tables, and ML performance metrics.
- **Direct PDF Download**: Reliable server-side file resolution and direct browser downloads.

### 10. 👥 User Management & Security (`/users`, `/login`)
- **Role-Based Access Control (RBAC)**: Enforced via Spring Security and JWT:
  - `ADMIN`: Complete system access, user management, dataset upload, model training, prediction, reports.
  - `HR`: Dataset upload, analysis, model training, prediction, reports, alerts.
  - `VIEWER`: Read-only access to dashboard, EDA, and alerts.

---

## 🔑 Default Credentials

| Username | Password | Role | Access Level |
|---|---|---|---|
| `admin` | `admin123` | `ADMIN` | Full System Access |
| `hr_manager` | `hr123` | `HR` | Analytics, Training, Prediction, Reports |
| `viewer` | `view123` | `VIEWER` | Read-only Dashboards & EDA |

---

## 🚀 Quick Start

### 1. Automatic One-Click Launch
Double-click:
```bash
start.bat
```
*(Configured with portable Node.js and OpenJDK 17 automatically)*

### 2. Manual Startup

**Terminal 1 — ML Service (Python FastAPI):**
```bash
cd ml-service
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Backend (Spring Boot):**
```bash
cd backend
mvnw.cmd spring-boot:run
```

**Terminal 3 — Frontend (React Vite):**
```bash
cd frontend
npm.cmd run dev
```

---

## 🌐 URLs

| Service | URL |
|---|---|
| Frontend Web App | http://localhost:5173 |
| Backend REST API | http://localhost:8080/api |
| ML Service | http://localhost:8000 |
| ML OpenAPI Docs (Swagger) | http://localhost:8000/docs |
| H2 Database Console | http://localhost:8080/api/h2-console |
