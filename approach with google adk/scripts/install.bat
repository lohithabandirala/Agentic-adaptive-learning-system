@echo off
REM Installation script for Adaptive AI Learning System

echo ============================================================
echo ADAPTIVE AI LEARNING SYSTEM - INSTALLATION
echo MongoDB + Google Gemini + Emotion Detection
echo ============================================================
echo.

echo Step 1: Installing Backend Dependencies (Node.js)...
echo.
cd "..\backend"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Node.js dependencies!
    echo Make sure Node.js is installed: https://nodejs.org
    pause
    exit /b 1
)
echo.
echo ✅ Backend dependencies installed successfully
echo.

echo Step 2: Installing Python Client Dependencies...
echo.
cd "..\python-client"
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Python dependencies!
    echo Make sure Python 3.8+ is installed: https://python.org
    pause
    exit /b 1
)
echo.
echo ✅ Python dependencies installed successfully
echo.

echo Step 3: Setting up environment configuration...
echo.
cd "..\backend"
if not exist .env (
    copy .env.example .env
    echo ⚠️  Created .env file from .env.example
    echo 📝 IMPORTANT: Edit backend\.env and add your:
    echo    - GOOGLE_API_KEY
    echo    - MONGODB_URI
    echo.
) else (
    echo ✅ .env file already exists
    echo.
)

echo ============================================================
echo INSTALLATION COMPLETE!
echo ============================================================
echo.
echo Next steps:
echo.
echo 1. Configure backend\.env file with your API keys:
echo    - GOOGLE_API_KEY=your_gemini_api_key
echo    - MONGODB_URI=your_mongodb_connection_string
echo.
echo 2. Start MongoDB:
echo    - Local: Run mongod.exe
echo    - Cloud: Use MongoDB Atlas (free tier available)
echo.
echo 3. Start the backend:
echo    cd "approach with google adk\scripts"
echo    start-backend.bat
echo.
echo 4. Run assessment:
echo    start-assessment.bat
echo.
pause
