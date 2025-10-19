@echo off
REM Quick test script to verify emotion detection is working

echo ========================================
echo Emotion Detection System Test
echo ========================================
echo.

echo [1/4] Testing Backend (Port 4000)...
curl -s http://localhost:4000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 4000
) else (
    echo [ERROR] Backend is NOT running on port 4000
    echo Please start: cd backend-webapp ^&^& npm run dev
)
echo.

echo [2/4] Testing Frontend (Port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is running on port 5173
) else (
    echo [ERROR] Frontend is NOT running on port 5173
    echo Please start: cd frontend-webapp ^&^& npm run dev
)
echo.

echo [3/4] Testing Python Emotion Service (Port 5001)...
curl -s http://localhost:5001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python service is running on port 5001
) else (
    echo [ERROR] Python service is NOT running on port 5001
    echo Please start: cd python-emotion-service ^&^& start.bat
)
echo.

echo [4/4] Testing Emotion Detection Endpoint...
curl -s http://localhost:5001/detect-emotion-simple >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Emotion detection endpoint is accessible
) else (
    echo [ERROR] Emotion detection endpoint failed
)
echo.

echo ========================================
echo Test Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Open browser: http://localhost:5173
echo 2. Login as student
echo 3. Start a test
echo 4. Allow camera access
echo 5. Check console for emotion detection logs
echo.
echo Expected Console Output:
echo   ^✅ Emotion detected: happy Stress: 25.3%%
echo   ^✅ Emotion saved to backend
echo.
pause
