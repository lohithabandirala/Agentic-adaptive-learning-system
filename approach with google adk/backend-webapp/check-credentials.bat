@echo off
echo ========================================
echo   Google Cloud Credentials Check
echo ========================================
echo.

echo [Checking credentials file...]
if exist "..\scenic-shift-473208-u2-8b283be6b382.json" (
    echo [OK] Credentials file found
    echo      Location: scenic-shift-473208-u2-8b283be6b382.json
    echo.
    echo [INFO] Service Account Details:
    echo      Project: scenic-shift-473208-u2
    echo      Account: adk-agent-service@scenic-shift-473208-u2.iam.gserviceaccount.com
    echo      Type: ADK Agent Service Account (Dedicated AI workload)
    echo.
) else (
    echo [ERROR] Credentials file not found!
    echo         Expected: ..\scenic-shift-473208-u2-8b283be6b382.json
    echo.
    pause
    exit /b 1
)

echo [Checking .env configuration...]
findstr /C:"scenic-shift-473208-u2-8b283be6b382.json" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend .env is configured correctly
    echo.
) else (
    echo [ERROR] Backend .env is not updated!
    echo         Run: Update .env with new credentials path
    echo.
    pause
    exit /b 1
)

echo ========================================
echo   Configuration Status: READY!
echo ========================================
echo.
echo Your backend is configured to use the new credentials.
echo.
echo [NEXT STEP] Restart backend to load new credentials:
echo.
echo   1. Stop backend (Ctrl+C if running)
echo   2. Run: npm run dev
echo   3. Check logs for:
echo      - GOOGLE_CLOUD_PROJECT: scenic-shift-473208-u2
echo      - Using ADK Agent Service Account
echo.

echo ========================================
echo   Benefits of New Credentials
echo ========================================
echo.
echo [+] Dedicated ADK Agent Service Account
echo [+] Better quota management for AI workloads
echo [+] Proper IAM permissions for Vertex AI
echo [+] Production-ready configuration
echo [+] Higher API limits than free tier
echo.

echo ========================================
echo   Testing After Restart
echo ========================================
echo.
echo 1. Start a test as student
echo 2. Backend should show:
echo    - [OK] API calls today: 1/45
echo    - [OK] Using Google Gemini with new credentials
echo    - [OK] No quota exceeded errors
echo.
echo 3. AI features should work:
echo    - [OK] Question generation
echo    - [OK] Session analysis
echo    - [OK] Personalized feedback
echo.

pause
