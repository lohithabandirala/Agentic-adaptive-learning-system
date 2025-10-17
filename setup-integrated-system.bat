@echo off
echo ====================================
echo INTEGRATED SYSTEM - COMPLETE SETUP
echo ====================================
echo.
echo This will install all dependencies for the integrated system.
echo Please ensure you have Python and Node.js installed.
echo.
pause

echo.
echo ====================================
echo STEP 1: Installing Python Dependencies
echo ====================================
echo.
pip install -r integrated_requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Python dependencies
    echo Please check if Python and pip are installed correctly
    pause
    exit /b 1
)

echo.
echo ====================================
echo STEP 2: Installing Node.js Dependencies
echo ====================================
echo.
cd "ai service"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install Node.js dependencies
    echo Please check if Node.js and npm are installed correctly
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ====================================
echo STEP 3: Checking API Key Configuration
echo ====================================
echo.
if exist "ai service\.env" (
    echo Found .env file
    echo Please verify it contains your GOOGLE_CLOUD_API_KEY
) else (
    echo WARNING: .env file not found!
    echo.
    echo Please create "ai service\.env" with the following content:
    echo GOOGLE_CLOUD_API_KEY=your_api_key_here
    echo PORT=3000
    echo.
)

echo.
echo ====================================
echo SETUP COMPLETE!
echo ====================================
echo.
echo Next steps:
echo 1. Ensure .env file exists in "ai service" folder with your API key
echo 2. Run start-ai-service.bat to start the AI service
echo 3. Run run-integrated-system.bat to use the integrated system
echo.
echo Or test the integration:
echo    python test_integration.py
echo.
pause
