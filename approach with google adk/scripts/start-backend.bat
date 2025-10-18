@echo off
REM Start backend server

echo ============================================================
echo STARTING ADAPTIVE AI BACKEND
echo MongoDB + Google Gemini
echo ============================================================
echo.

cd "..\backend"

REM Check if .env exists
if not exist .env (
    echo ❌ ERROR: .env file not found!
    echo.
    echo Please create backend\.env from .env.example and configure:
    echo   - GOOGLE_API_KEY
    echo   - MONGODB_URI
    echo.
    pause
    exit /b 1
)

echo Starting Node.js server...
echo.
npm start

pause
