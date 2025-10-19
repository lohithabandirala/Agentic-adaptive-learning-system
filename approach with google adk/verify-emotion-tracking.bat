@echo off
echo ========================================
echo   Emotion Tracking Verification
echo ========================================
echo.

echo [1/4] Checking Python Service (Port 5001)...
curl -s http://localhost:5001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python service is running
) else (
    echo [FAIL] Python service not responding
    echo       Start with: cd python-emotion-service ^&^& start.bat
)
echo.

echo [2/4] Checking Backend (Port 4000)...
curl -s http://localhost:4000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend is running
) else (
    echo [FAIL] Backend not responding
    echo       Start with: cd backend-webapp ^&^& npm run dev
)
echo.

echo [3/4] Checking Frontend (Port 5173)...
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is running
) else (
    echo [FAIL] Frontend not responding
    echo       Start with: cd frontend-webapp ^&^& npm run dev
)
echo.

echo [4/4] Checking if EmotionTracker fixes are loaded...
echo.
echo To verify the fix is working:
echo   1. Open browser at http://localhost:5173
echo   2. Press F12 to open DevTools
echo   3. Go to Console tab
echo   4. Start a test and allow camera
echo   5. Look for these logs every 3 seconds:
echo.
echo      [CHECK] Emotion detected: happy Stress: 25.3%%
echo      [CHECK] Emotion saved to backend: happy stress: 25.3%%
echo.
echo   6. Check Network tab for:
echo      POST http://localhost:4000/api/emotions/track
echo      Status: 201 Created (SUCCESS!)
echo.

echo ========================================
echo   Quick Fix Summary
echo ========================================
echo.
echo Fixed 3 critical bugs in EmotionTracker.tsx:
echo   [FIX 1] emotion -^> dominantEmotion (field name)
echo   [FIX 2] Added questionNumber: 0 (required field)
echo   [FIX 3] Added Authorization header (JWT token)
echo.
echo If emotions still show 0.00:
echo   - Make sure Frontend was restarted after fix
echo   - Check if camera permission is granted
echo   - Verify JWT token exists in localStorage
echo.

echo ========================================
echo   Real-Time Display Check
echo ========================================
echo.
echo In the test page, bottom-right corner should show:
echo   [CHECK] Webcam preview (video feed)
echo   [CHECK] Emoji changing (smiling face, sad, angry, neutral)
echo   [CHECK] Emotion name (happy, sad, angry, neutral)
echo   [CHECK] Stress percentage (0-100%%)
echo   [CHECK] Green pulsing dot (tracking active)
echo.

pause
