@echo off
echo ========================================
echo SESSION-BASED SYSTEM - COMPREHENSIVE TEST
echo ========================================
echo.

echo Step 1: Starting all services...
echo.
echo This will open 3 terminals:
echo   1. Python Emotion Service (Port 5001)
echo   2. Backend API (Port 5000)
echo   3. Frontend React App (Port 3000)
echo.

cd scripts
call start-all.bat

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo Wait 30-60 seconds for all services to start, then:
echo.
echo 1. Open browser: http://localhost:3000
echo 2. Follow the testing steps in TESTING_SESSION_BASED_SYSTEM.md
echo.
echo Quick Test Path:
echo   - Login as Teacher (teacher1 / password123)
echo   - Create Class (note the 6-char code)
echo   - Create Test (20 questions, 5 per session)
echo   - Open incognito window
echo   - Login as Student (student1 / password123)
echo   - Join class with code
echo   - Start Test
echo   - Answer 5 questions (batch)
echo   - Submit session
echo   - See AI analysis popup
echo   - Continue with next session
echo.
echo ========================================
echo IMPORTANT: Check these during test:
echo ========================================
echo   Backend Terminal: Should show "SESSION-BASED TEST" logs
echo   Frontend Console: Press F12 to see session logs
echo   MongoDB: Check 'attempts' collection for sessionAnalytics
echo.
echo Press any key to see backend logs...
pause > nul

echo.
echo Opening backend logs in new window...
start cmd /k "cd ..\backend-webapp && echo Watching backend logs... && timeout /t 3 > nul"

echo.
echo Test is running! Follow the steps above.
echo.
pause
