@echo off
echo ============================================================
echo 🚀 PUSHING TO GITHUB: Agentic-adaptive-learning-system
echo ============================================================
echo.

REM Configure Git user
echo 📝 Configuring Git user...
git config --global user.name "narendar"
git config --global user.email "gollanarendar2004@gmail.com"
echo ✅ Git user configured
echo.

REM Check if git is initialized
echo 🔍 Checking Git repository...
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Initializing Git repository...
    git init
    echo ✅ Git initialized
) else (
    echo ✅ Git already initialized
)
echo.

REM Add remote repository
echo 🔗 Setting up remote repository...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/lohithabandirala/Agentic-adaptive-learning-system.git
echo ✅ Remote repository configured
echo.

REM Create .gitignore
echo 📋 Creating .gitignore...
(
echo node_modules/
echo .env
echo .env.adk
echo .venv/
echo __pycache__/
echo *.pyc
echo .DS_Store
echo *.log
echo scenic-shift-473208-u2-61802cf35017.json
echo .vscode/
echo *.swp
echo *.swo
echo .idea/
) > .gitignore
echo ✅ .gitignore created
echo.

REM Stage all files
echo 📦 Staging files...
git add .
echo ✅ Files staged
echo.

REM Show what will be committed
echo 📄 Files to be committed:
git status --short
echo.

REM Commit changes
echo 💾 Committing changes...
git commit -m "feat: Complete Adaptive AI Learning System with Comprehensive Metrics

- Implemented Google ADK Agent with function calling (Gemini API)
- Added comprehensive student metrics service (performance, emotions, preferences)
- Question-set generation (5 questions at once with varied difficulty)
- Parallel emotion detection during question answering (DeepFace + OpenCV)
- Real-time emotion tracking with background threading
- Batch adaptation after every 5 questions
- MongoDB integration for student data persistence
- RESTful API endpoints for sessions, questions, and analytics
- Python test client with emotion tracker
- Comprehensive documentation (setup guides, flow diagrams, API docs)

Features:
✅ Agent-based question generation with reasoning
✅ Emotion-aware difficulty adaptation
✅ Topic-wise performance tracking
✅ Learning preferences inference
✅ Performance trend analysis (improving/stable/declining)
✅ Stress level monitoring and focus scoring
✅ Automatic weak topic identification"

if %errorlevel% neq 0 (
    echo ⚠️ Nothing to commit or commit failed
    echo.
)
echo.

REM Pull latest changes (if any)
echo 🔄 Pulling latest changes from remote...
git pull origin main --allow-unrelated-histories
echo.

REM Push to GitHub
echo 🚀 Pushing to GitHub...
echo.
echo ⚠️ IMPORTANT: If prompted for password, use your GitHub Personal Access Token
echo    (NOT your GitHub password)
echo.
echo 📖 To create a Personal Access Token:
echo    1. Go to: https://github.com/settings/tokens
echo    2. Click "Generate new token (classic)"
echo    3. Select scope: repo (all permissions)
echo    4. Generate and copy the token
echo.
pause

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo ✅ SUCCESS! Code pushed to GitHub
    echo ============================================================
    echo.
    echo 🌐 View your repository at:
    echo    https://github.com/lohithabandirala/Agentic-adaptive-learning-system
    echo.
) else (
    echo.
    echo ============================================================
    echo ❌ PUSH FAILED
    echo ============================================================
    echo.
    echo 💡 Possible solutions:
    echo    1. Make sure you have access to the repository
    echo    2. Use Personal Access Token instead of password
    echo    3. Check if the remote URL is correct
    echo    4. Try pushing to a different branch:
    echo       git push -u origin feature/adaptive-learning
    echo.
)

echo.
echo Press any key to exit...
pause >nul
