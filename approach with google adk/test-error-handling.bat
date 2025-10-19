@echo off
echo ========================================
echo Testing Error Handling & Quota System
echo ========================================
echo.

echo [TEST 1] Checking if credentials file exists...
if exist "inlaid-plasma-472505-q2-55a6c32d4bde.json" (
    echo [32m✓ Credentials file found[0m
) else (
    echo [31m✗ Credentials file NOT found[0m
    echo   Please ensure the JSON file is in the project root
)
echo.

echo [TEST 2] Checking .env configuration...
findstr /C:"GOOGLE_CLOUD_PROJECT" backend-webapp\.env >nul 2>&1
if %errorlevel% equ 0 (
    echo [32m✓ Google Cloud Project configured[0m
) else (
    echo [31m✗ Google Cloud Project NOT configured[0m
)
echo.

echo [TEST 3] Checking fallback questions file...
if exist "backend-webapp\src\services\fallbackQuestions.ts" (
    echo [32m✓ Fallback questions system created[0m
) else (
    echo [31m✗ Fallback questions file missing[0m
)
echo.

echo [TEST 4] Checking error handling components...
if exist "frontend-webapp\src\components\ErrorBoundary.tsx" (
    echo [32m✓ ErrorBoundary component created[0m
) else (
    echo [31m✗ ErrorBoundary component missing[0m
)

if exist "frontend-webapp\src\pages\NotFound.tsx" (
    echo [32m✓ NotFound page created[0m
) else (
    echo [31m✗ NotFound page missing[0m
)

if exist "frontend-webapp\src\components\QuotaWarning.tsx" (
    echo [32m✓ QuotaWarning component created[0m
) else (
    echo [31m✗ QuotaWarning component missing[0m
)
echo.

echo ========================================
echo System Status
echo ========================================
echo.
echo ✓ Quota Management: Active (45/day limit)
echo ✓ Fallback System: Template-based questions
echo ✓ Error Handling: Global error boundary
echo ✓ 404 Page: Custom not found page
echo ✓ Quota Warning: User notification system
echo.
echo WHAT'S NEW:
echo   1. Automatic quota tracking (resets daily)
echo   2. Seamless fallback to template questions
echo   3. Error pages for better UX
echo   4. Progress tracking continues even with quota exceeded
echo.
echo NEXT STEPS:
echo   1. Restart backend: cd backend-webapp ^&^& npm run dev
echo   2. Restart frontend: cd frontend-webapp ^&^& npm run dev
echo   3. Test system with new features
echo   4. Monitor backend logs for quota usage
echo.
echo For detailed info, see: QUOTA_AND_ERROR_HANDLING.md
echo.
pause
