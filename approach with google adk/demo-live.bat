@echo off
REM ========================================
REM   ADK Agent Log Highlighter
REM   Makes key operations stand out
REM ========================================

echo ========================================
echo   ADK AGENT LIVE DEMO
echo   Vibethon Hackathon
echo ========================================
echo.
echo Watch for these key indicators:
echo.
echo [ADK AGENT] = AI Agent in action
echo [Tool Call] = Agent querying database
echo [Generated] = Questions created
echo [AI ANALYSIS] = Session analyzed
echo.
echo ========================================
echo   Starting Backend...
echo ========================================
echo.

cd backend-webapp

REM Start backend with colored output (if possible)
npm run dev

pause
