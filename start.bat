@echo off
setlocal
echo =====================================================
echo   EAAP - Employee Attrition Analysis & Prediction
echo =====================================================
echo.

rem Configure tools paths (OpenJDK & Node.js)
if exist "E:\tools\jdk" (
    set "JAVA_HOME=E:\tools\jdk"
    set "PATH=E:\tools\jdk\bin;E:\tools\node;%PATH%"
)

echo Starting all 3 services...
echo.

echo [1/3] Starting ML Service (Python FastAPI) on port 8000...
start "EAAP ML Service" cmd /k "cd /d %~dp0ml-service && python -m uvicorn main:app --reload --port 8000"

echo Waiting 5 seconds for ML service...
timeout /t 5 /nobreak >nul

echo [2/3] Starting Backend (Spring Boot) on port 8080...
start "EAAP Backend" cmd /k "cd /d %~dp0backend && set JAVA_HOME=E:\tools\jdk&& set PATH=E:\tools\jdk\bin;E:\tools\node;%%PATH%%&& mvnw.cmd spring-boot:run"

echo Waiting 10 seconds for backend...
timeout /t 10 /nobreak >nul

echo [3/3] Starting Frontend (React) on port 5173...
start "EAAP Frontend" cmd /k "cd /d %~dp0frontend && set PATH=E:\tools\node;%%PATH%%&& npm.cmd run dev"

echo.
echo =====================================================
echo   All services started!
echo.
echo   Frontend:    http://localhost:5173
echo   Backend:     http://localhost:8080/api
echo   ML Service:  http://localhost:8000
echo   H2 Console:  http://localhost:8080/api/h2-console
echo   ML Swagger:  http://localhost:8000/docs
echo.
echo   Default Credentials:
echo   - admin / admin123      (Full Access)
echo   - hr_manager / hr123    (HR Access)
echo   - viewer / view123      (Read Only)
echo =====================================================
echo.
pause
