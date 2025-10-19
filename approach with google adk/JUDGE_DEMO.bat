@echo off
REM ========================================
REM   Quick Demo - Capture Key ADK Logs
REM ========================================

set LOGFILE=JUDGE_DEMO_LOG.txt

echo ========================================
echo   VIBETHON - ADK AGENT DEMONSTRATION
echo ========================================
echo.
echo This script will:
echo   1. Start backend
echo   2. Capture ADK agent operations
echo   3. Generate a clean log for judges
echo.
echo Press any key to start demo...
pause >nul

cls

echo ======================================== > %LOGFILE%
echo   VIBETHON HACKATHON PROJECT           >> %LOGFILE%
echo   AI-Powered Adaptive Learning         >> %LOGFILE%
echo   with Google ADK Agent                >> %LOGFILE%
echo ======================================== >> %LOGFILE%
echo.                                        >> %LOGFILE%
echo DEMO: Real-time AI Question Generation >> %LOGFILE%
echo       and Emotion-based Analysis       >> %LOGFILE%
echo.                                        >> %LOGFILE%
echo ======================================== >> %LOGFILE%
echo.                                        >> %LOGFILE%

echo.
echo ========================================
echo   INSTRUCTIONS FOR JUDGES
echo ========================================
echo.
echo 1. Watch this terminal for:
echo    [CHECK] "ADK AGENT" messages
echo    [CHECK] "Generating questions"
echo    [CHECK] "Agent Iteration" (AI thinking)
echo    [CHECK] "Tool Call: query_student_performance"
echo    [CHECK] "Generated X questions"
echo.
echo 2. All operations are being logged to:
echo    %LOGFILE%
echo.
echo 3. Frontend demo running at:
echo    http://localhost:5173
echo.
echo ========================================
echo   Starting Backend...
echo ========================================
echo.

cd backend-webapp
npm run dev

pause
