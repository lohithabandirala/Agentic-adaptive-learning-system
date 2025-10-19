@echo off
REM ========================================
REM   ADK Agent Demo Logger
REM   Captures backend logs to show judges
REM ========================================

set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set LOGFILE=demo_logs\adk_demo_%TIMESTAMP%.log

echo ========================================
echo   Starting ADK Agent Demo Logger
echo ========================================
echo.
echo This will capture all backend logs to show:
echo   - ADK Agent in action
echo   - Question generation
echo   - AI analysis
echo   - Quota management
echo   - Real-time processing
echo.
echo Log file: %LOGFILE%
echo.

REM Create logs directory
if not exist "demo_logs" mkdir demo_logs

echo ========================================  > %LOGFILE%
echo   ADK AGENT DEMONSTRATION               >> %LOGFILE%
echo   Vibethon Hackathon Project            >> %LOGFILE%
echo   Date: %date% %time%                   >> %LOGFILE%
echo ========================================  >> %LOGFILE%
echo.                                         >> %LOGFILE%
echo [SYSTEM] Starting backend with ADK Agent...  >> %LOGFILE%
echo.                                         >> %LOGFILE%

echo [INFO] Starting backend with full logging...
echo [INFO] All ADK operations will be captured
echo [INFO] Press Ctrl+C to stop and save logs
echo.

REM Start backend with logging
cd backend-webapp
npm run dev 2>&1 | tee -a ..\%LOGFILE%

echo.
echo ========================================
echo   Demo Complete!
echo ========================================
echo.
echo Logs saved to: %LOGFILE%
echo.
echo To show judges:
echo   1. Open %LOGFILE%
echo   2. Search for these keywords:
echo      - "ADK AGENT"
echo      - "Generating questions"
echo      - "AI Analysis"
echo      - "Agent Iteration"
echo.
pause
