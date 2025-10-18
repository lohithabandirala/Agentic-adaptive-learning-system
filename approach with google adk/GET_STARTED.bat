@echo off
echo ============================================================
echo ADAPTIVE AI LEARNING SYSTEM - FIRST RUN GUIDE
echo ============================================================
echo.
echo Welcome! This script will help you get started.
echo.
echo ============================================================
echo STEP 1: VERIFY PREREQUISITES
echo ============================================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ Node.js is installed
    node --version
) else (
    echo   ❌ Node.js NOT found
    echo   📥 Download from: https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo.

echo Checking Python...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✅ Python is installed
    python --version
) else (
    echo   ❌ Python NOT found
    echo   📥 Download from: https://python.org
    echo.
    pause
    exit /b 1
)
echo.

echo ============================================================
echo STEP 2: INSTALL DEPENDENCIES
echo ============================================================
echo.
echo This will install all required packages...
echo Press any key to continue or Ctrl+C to cancel
pause >nul

cd scripts
call install.bat

if %errorlevel% neq 0 (
    echo.
    echo ❌ Installation failed!
    pause
    exit /b 1
)

echo.
echo ============================================================
echo STEP 3: CONFIGURATION REQUIRED
echo ============================================================
echo.
echo 📝 Before you can run the system, you MUST configure:
echo.
echo 1. Get Google Gemini API Key:
echo    👉 https://makersuite.google.com/app/apikey
echo.
echo 2. Setup MongoDB:
echo    Option A: Local MongoDB
echo      👉 https://www.mongodb.com/try/download/community
echo.
echo    Option B: MongoDB Atlas (Cloud - Recommended)
echo      👉 https://cloud.mongodb.com (Free tier available)
echo.
echo 3. Edit backend\.env file with your credentials:
echo    - GOOGLE_API_KEY=your_key_here
echo    - MONGODB_URI=your_connection_string
echo.
echo ============================================================
echo.

set /p configured="Have you configured backend\.env? (y/n): "

if /i "%configured%"=="y" (
    echo.
    echo ✅ Great! Ready to start the system.
    echo.
    echo ============================================================
    echo STEP 4: START THE SYSTEM
    echo ============================================================
    echo.
    echo The system will start in 5 seconds...
    echo.
    echo Two windows will open:
    echo   1. Backend Server - Keep this running
    echo   2. Assessment Client - Interact here
    echo.
    timeout /t 5
    
    call start-complete-system.bat
) else (
    echo.
    echo 📋 TO DO LIST:
    echo.
    echo [ ] Get Google Gemini API key
    echo [ ] Setup MongoDB (local or Atlas)
    echo [ ] Edit backend\.env with your credentials
    echo [ ] Run this script again
    echo.
    echo 📖 For detailed help, see: docs\SETUP.md
    echo.
    pause
)
