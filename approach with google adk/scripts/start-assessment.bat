@echo off
REM Start assessment client

echo ============================================================
echo ADAPTIVE AI ASSESSMENT CLIENT
echo ============================================================
echo.

cd "..\python-client"

echo Make sure the backend is running in another terminal!
echo.
echo Press any key to start assessment...
pause >nul
echo.

python assessment_client.py

pause
