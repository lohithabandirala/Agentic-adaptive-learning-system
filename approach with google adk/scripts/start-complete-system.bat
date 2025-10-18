@echo off
REM Complete system startup

echo ============================================================
echo ADAPTIVE AI LEARNING SYSTEM - COMPLETE STARTUP
echo ============================================================
echo.

echo Starting backend server in new window...
start "Adaptive AI Backend" cmd /k "cd /d "%~dp0" && start-backend.bat"

echo.
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting assessment client...
call start-assessment.bat
