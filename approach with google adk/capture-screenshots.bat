@echo off
REM ========================================
REM   Screenshot Helper for Demo
REM   Captures key moments
REM ========================================

if not exist "demo_screenshots" mkdir demo_screenshots

echo ========================================
echo   Demo Screenshot Guide
echo ========================================
echo.
echo Take screenshots of these key moments:
echo.
echo [1] Backend Terminal - ADK Agent Starting
echo     Look for: "FULL ADK AGENT: Generating 5 questions"
echo     Press ENTER when ready to capture...
pause >nul
echo     [OK] Capture now! (Use Windows + Shift + S)
timeout /t 3 >nul
echo.

echo [2] Backend Terminal - Agent Iterations
echo     Look for: "Agent Iteration 1: Querying data..."
echo              "Tool Call: query_student_performance"
echo     Press ENTER when ready to capture...
pause >nul
echo     [OK] Capture now!
timeout /t 3 >nul
echo.

echo [3] Backend Terminal - Generated Questions
echo     Look for: "Generated 5 personalized questions"
echo              JSON with question content
echo     Press ENTER when ready to capture...
pause >nul
echo     [OK] Capture now!
timeout /t 3 >nul
echo.

echo [4] Frontend - Test Interface
echo     Show: Student taking test with webcam visible
echo     Press ENTER when ready to capture...
pause >nul
echo     [OK] Capture now!
timeout /t 3 >nul
echo.

echo [5] Frontend - Emotion Tracker
echo     Show: Bottom-right corner with emotion display
echo     Press ENTER when ready to capture...
pause >nul
echo     [OK] Capture now!
timeout /t 3 >nul
echo.

echo [6] Backend Terminal - Session Analysis
echo     Look for: "AI ANALYSIS:"
echo              "Accuracy: X%"
echo              "Avg Stress: X"
echo     Press ENTER when ready to capture...
pause >nul
echo     [OK] Capture now!
timeout /t 3 >nul
echo.

echo [7] Frontend - Results Page
echo     Show: Test results with emotion graph
echo     Press ENTER when ready to capture...
pause >nul
echo     [OK] Capture now!
timeout /t 3 >nul
echo.

echo ========================================
echo   Screenshot Capture Complete!
echo ========================================
echo.
echo Save screenshots to: demo_screenshots\
echo.
echo Recommended filenames:
echo   - 01_adk_agent_starting.png
echo   - 02_agent_iterations.png
echo   - 03_generated_questions.png
echo   - 04_test_interface.png
echo   - 05_emotion_tracker.png
echo   - 06_session_analysis.png
echo   - 07_results_page.png
echo.

pause
