# EAAP — Employee Attrition Analysis & Prediction

A full-stack AI-powered HR analytics platform.

## 🏗️ Architecture

```
Frontend (React/Vite) :5173
      ↓ REST API + JWT
Backend (Spring Boot) :8080
      ↓ HTTP Proxy
ML Service (Python FastAPI) :8000
```

## 🚀 Quick Start

**Prerequisites:**
- Java 17+ (check: `java -version`)
- Python 3.9+ (check: `python --version`)
- Node.js 18+ (check: `node --version`)
- Maven (bundled via `mvnw`)

**Run everything:**
```bash
start.bat
```

**Or manually:**
```bash
# Terminal 1 — ML Service
cd ml-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Terminal 2 — Spring Boot Backend
cd backend
mvnw spring-boot:run

# Terminal 3 — React Frontend
cd frontend
npm install
npm run dev
```

## 🔑 Default Credentials

| Username | Password | Role |
|---|---|---|
| admin | admin123 | ADMIN (full access) |
| hr_manager | hr123 | HR (analysis + prediction) |
| viewer | view123 | VIEWER (read-only) |

## 📋 First-Time Workflow

1. Login at `http://localhost:5173`
2. Go to **Data Management** → Upload `sample_data/ibm_hr_attrition.csv`
3. Click **Activate** on the uploaded dataset
4. Explore the **Dashboard** — metrics load automatically
5. Go to **ML Models** → Click **Train Model**
6. Use **Prediction** → Fill employee form → See result + XAI
7. Run **Segmentation** → View employee clusters
8. Generate **Reports** → Download PDF

## 🌐 URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| ML Service | http://localhost:8000 |
| H2 Console | http://localhost:8080/api/h2-console |
| ML API Docs | http://localhost:8000/docs |

## 📁 Project Structure

```
EAAP/
├── backend/          ← Java Spring Boot
├── ml-service/       ← Python FastAPI
├── frontend/         ← React + Vite
├── sample_data/      ← IBM HR Attrition CSV
└── start.bat         ← One-click launcher
```
