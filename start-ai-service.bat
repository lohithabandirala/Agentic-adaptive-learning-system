@echo off
echo ====================================
echo Starting AI Service...
echo ====================================
cd "ai service"
start cmd /k "npm start"
cd ..
timeout /t 5
echo.
echo ====================================
echo AI Service started in separate window
echo ====================================
echo.
pause
