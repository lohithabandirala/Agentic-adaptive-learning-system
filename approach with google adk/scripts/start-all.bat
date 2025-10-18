@echo off
echo ========================================
echo   Starting Unified AI Learning System
echo ========================================
echo.
echo Services:
echo   1. Python Emotion Service (Port 5000)
echo   2. Backend API (Port 4000)
echo   3. Frontend Web App (Port 5173)
echo.
echo ========================================
echo.

REM Get the current directory
set "PROJECT_DIR=%~dp0.."

echo [1/3] Starting Python Emotion Service...
start "Python Emotion Service" cmd /k "cd /d "%PROJECT_DIR%\python-emotion-service" && call .venv\Scripts\activate.bat && python emotion_server.py"
echo ✓ Python Emotion Service starting on port 5000
echo   Waiting 3 seconds for service to initialize...
timeout /t 3 /nobreak >nul
echo.

echo [2/3] Starting Backend API...
start "Backend API" cmd /k "cd /d "%PROJECT_DIR%\backend-webapp" && npm run dev"
echo ✓ Backend API starting on port 4000
echo   Waiting 5 seconds for API to initialize...
timeout /t 5 /nobreak >nul
echo.

echo [3/3] Starting Frontend Web App...
start "Frontend Web App" cmd /k "cd /d "%PROJECT_DIR%\frontend-webapp" && npm run dev"
echo ✓ Frontend Web App starting on port 5173
echo.

echo ========================================
echo   ✅ All Services Started!
echo ========================================
echo.
echo 📱 Access Points:
echo   - Frontend:  http://localhost:5173
echo   - Backend:   http://localhost:4000/api
echo   - Emotions:  http://localhost:5000/health
echo.
echo 💡 Three terminal windows will open:
echo   1. Python Emotion Service (Flask)
echo   2. Backend API (Node.js + TypeScript)
echo   3. Frontend Web App (React + Vite)
echo.
echo ⚠️  Do NOT close this window or the services will stop!
echo.
echo Press Ctrl+C to stop all services
pause
