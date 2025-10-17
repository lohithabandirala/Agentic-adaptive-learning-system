@echo off
echo.
echo ============================================================
echo    INTEGRATED EMOTION-BASED ADAPTIVE ASSESSMENT SYSTEM
echo ============================================================
echo.
echo This system combines:
echo   - Facial Emotion Recognition (OpenCV + DeepFace)
echo   - AI Question Generation (Google Gemini)
echo.
echo What you'll get:
echo   1. Real-time emotion analysis (20 seconds)
echo   2. Stress level calculation (1-5 scale)
echo   3. Personalized adaptive questions
echo   4. Complete JSON output for analysis
echo.
echo ============================================================
echo                    MAIN MENU
echo ============================================================
echo.
echo 1. Setup System (First Time Only)
echo 2. Test Integration (No Webcam Required)
echo 3. Start AI Service
echo 4. Run Integrated System (Full Workflow)
echo 5. View Documentation
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto test
if "%choice%"=="3" goto startai
if "%choice%"=="4" goto runfull
if "%choice%"=="5" goto docs
if "%choice%"=="6" goto end

echo Invalid choice. Please try again.
pause
cls
goto menu

:setup
echo.
echo Starting setup...
call setup-integrated-system.bat
pause
cls
goto menu

:test
echo.
echo Running integration tests...
python test_integration.py
pause
cls
goto menu

:startai
echo.
echo Starting AI Service...
call start-ai-service.bat
pause
cls
goto menu

:runfull
echo.
echo Make sure AI Service is running first!
echo Press any key to continue or Ctrl+C to cancel...
pause
python integrated_emotion_assessment.py
pause
cls
goto menu

:docs
cls
echo.
echo ============================================================
echo                   AVAILABLE DOCUMENTATION
echo ============================================================
echo.
echo 1. QUICKSTART.md          - 5-minute quick start guide
echo 2. INTEGRATION_README.md  - Complete documentation
echo 3. ARCHITECTURE.md        - System architecture
echo 4. PROJECT_SUMMARY.md     - Overview and summary
echo.
echo You can open these files in any text editor.
echo.
pause
cls
goto menu

:menu
cls
echo.
echo ============================================================
echo    INTEGRATED EMOTION-BASED ADAPTIVE ASSESSMENT SYSTEM
echo ============================================================
echo.
echo This system combines:
echo   - Facial Emotion Recognition (OpenCV + DeepFace)
echo   - AI Question Generation (Google Gemini)
echo.
echo What you'll get:
echo   1. Real-time emotion analysis (20 seconds)
echo   2. Stress level calculation (1-5 scale)
echo   3. Personalized adaptive questions
echo   4. Complete JSON output for analysis
echo.
echo ============================================================
echo                    MAIN MENU
echo ============================================================
echo.
echo 1. Setup System (First Time Only)
echo 2. Test Integration (No Webcam Required)
echo 3. Start AI Service
echo 4. Run Integrated System (Full Workflow)
echo 5. View Documentation
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto test
if "%choice%"=="3" goto startai
if "%choice%"=="4" goto runfull
if "%choice%"=="5" goto docs
if "%choice%"=="6" goto end

echo Invalid choice. Please try again.
pause
cls
goto menu

:end
echo.
echo Thank you for using the Integrated Emotion Assessment System!
echo.
pause
exit
