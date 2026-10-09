@echo off
setlocal
echo =====================================================
echo   EAAP - Stopping all running services...
echo =====================================================
echo.

echo Stopping ML Service (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo Stopping Backend (Port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo Stopping Frontend (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo.
echo All EAAP services have been stopped.
echo =====================================================
pause
