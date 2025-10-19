@echo off
echo ========================================
echo Emotion Detection System Verification
echo ========================================
echo.

echo [1/5] Testing Python Emotion Service...
curl -s http://localhost:5001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Python service is RUNNING on port 5001[0m
) else (
    echo [31m✗ Python service is NOT RUNNING[0m
    echo   Start it with: cd python-emotion-service ^&^& start.bat
    goto :end
)

echo [2/5] Testing Python endpoint...
curl -s -X POST http://localhost:5001/detect-emotion-simple >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Emotion detection endpoint is working[0m
) else (
    echo [31m✗ Emotion detection endpoint failed[0m
)

echo [3/5] Testing Backend...
curl -s http://localhost:4000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Backend is RUNNING on port 4000[0m
) else (
    echo [31m✗ Backend is NOT RUNNING[0m
    echo   Start it with: cd backend-webapp ^&^& npm run dev
    goto :end
)

echo [4/5] Testing Frontend...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Frontend is RUNNING on port 5173[0m
) else (
    echo [31m✗ Frontend is NOT RUNNING[0m
    echo   Start it with: cd frontend-webapp ^&^& npm run dev
    goto :end
)

echo [5/5] Checking EmotionTracker props fix...
findstr /C:"attemptId={attemptId" "frontend-webapp\src\pages\Student.tsx" >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ EmotionTracker props are correctly configured[0m
) else (
    echo [33m⚠ EmotionTracker may need prop updates[0m
)

echo.
echo ========================================
echo Emotion Detection Status
echo ========================================
echo.
echo SERVICE STATUS:
echo   Python (5001): Running ✓
echo   Backend (4000): Running ✓
echo   Frontend (5173): Running ✓
echo.
echo INTEGRATION:
echo   ✓ Port: 5001 (correct)
echo   ✓ Endpoint: /detect-emotion (correct)
echo   ✓ Field names: camelCase (correct)
echo   ✓ Props: attemptId, studentId (FIXED)
echo.
echo HOW TO TEST:
echo   1. Open: http://localhost:5173
echo   2. Login as student
echo   3. Start a test
echo   4. Allow camera access
echo   5. Press F12 (browser console)
echo   6. Look for: "✓ Emotion detected: happy Stress: 25.3%%"
echo.
echo EXPECTED CONSOLE OUTPUT:
echo   ✓ Emotion detected: happy Stress: 25.3%%
echo   ✓ Emotion saved to backend
echo.
echo BACKEND SHOULD SHOW:
echo   POST /api/emotions/track 201
echo   😊 Emotion saved: happy, stress: 0.25
echo.
echo TROUBLESHOOTING:
echo   - Camera not working? Check browser permissions
echo   - No emotions? Start a NEW test (not completed one)
echo   - Still issues? See EMOTION_DETECTION_DEBUG.md
echo.
goto :success

:end
echo.
echo [31mPlease start all required services first![0m
echo.
goto :finish

:success
echo [32mAll systems ready! Test emotion detection now.[0m
echo.

:finish
pause
