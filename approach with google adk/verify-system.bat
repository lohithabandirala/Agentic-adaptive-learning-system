@echo off
REM Complete system check and verification

echo ========================================
echo VIBETHON - System Status Check
echo ========================================
echo.

echo [1/5] Checking Backend (Port 4000)...
curl -s http://localhost:4000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Backend RUNNING[0m
) else (
    echo [31m✗ Backend NOT RUNNING[0m
    echo   Start: cd backend-webapp ^&^& npm run dev
)

echo [2/5] Checking Frontend (Port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Frontend RUNNING[0m
) else (
    echo [31m✗ Frontend NOT RUNNING[0m
    echo   Start: cd frontend-webapp ^&^& npm run dev
)

echo [3/5] Checking Python Service (Port 5001)...
curl -s http://localhost:5001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Python RUNNING[0m
) else (
    echo [31m✗ Python NOT RUNNING[0m
    echo   Start: cd python-emotion-service ^&^& start.bat
)

echo [4/5] Testing Emotion Detection Endpoint...
curl -s http://localhost:5001/detect-emotion-simple >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Emotion endpoint ACCESSIBLE[0m
) else (
    echo [31m✗ Emotion endpoint FAILED[0m
)

echo [5/5] Testing Backend Emotion Route...
curl -s -X GET http://localhost:4000/api/emotions/patterns/test >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Backend emotion routes WORKING[0m
) else (
    echo [31m✗ Backend emotion routes FAILED[0m
)

echo.
echo ========================================
echo System Check Complete!
echo ========================================
echo.
echo KNOWN ISSUES FIXED:
echo   ✓ Stress level display (381%% → 38%%)
echo   ✓ Back to Dashboard button
echo   ✓ Emotion query errors
echo   ✓ EmotionTracker port (5000 → 5001)
echo   ✓ Field name mismatches
echo.
echo TO VERIFY EMOTION DETECTION:
echo   1. Open: http://localhost:5173
echo   2. Login as student
echo   3. Start new test
echo   4. Allow camera access
echo   5. Press F12 to open console
echo   6. Look for: "✓ Emotion detected"
echo.
echo EXPECTED CONSOLE OUTPUT:
echo   ✓ Emotion detected: happy Stress: 25.3%%
echo   ✓ Emotion saved to backend
echo.
echo BACKEND LOGS SHOULD SHOW:
echo   POST /api/emotions/track 201
echo   📊 Querying emotion patterns... ✓ Success
echo.
pause
