@echo off
echo ========================================
echo   Installing All Dependencies
echo ========================================
echo.

echo [1/3] Installing Python Emotion Service Dependencies...
echo --------------------------------------------------------
cd python-emotion-service
if not exist ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..
echo.

echo [2/3] Installing Backend Dependencies...
echo --------------------------------------------------------
cd backend-webapp
call npm install
cd ..
echo.

echo [3/3] Installing Frontend Dependencies...
echo --------------------------------------------------------
cd frontend-webapp
call npm install
cd ..
echo.

echo ========================================
echo   ✅ All Dependencies Installed!
echo ========================================
echo.
echo Next step: Run start-all.bat to start all services
echo.
pause
