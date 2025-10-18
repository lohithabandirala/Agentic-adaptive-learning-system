@echo off
echo ========================================
echo Python Emotion Detection Service
echo ========================================
echo.
echo Installing dependencies (if needed)...
pip install -r requirements.txt
echo.
echo Starting Flask server on port 5001...
echo.
python app.py
pause
