@echo off
echo ============================================================
echo 🚀 COMPLETE AI LEARNING SYSTEM - STARTUP GUIDE
echo ============================================================
echo.
echo Starting the complete system with:
echo   ✅ Backend API (Node.js + TypeScript)
echo   ✅ Frontend Web App (React + TypeScript)
echo   ✅ Python Emotion Service (OpenCV + DeepFace)
echo   ✅ Student Profile Pages
echo   ✅ Teacher Analytics Dashboard
echo.
echo ============================================================
echo 📋 PREREQUISITES CHECK
echo ============================================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js NOT found! Download from: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js: 
node --version
echo.

echo Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python NOT found! Download from: https://python.org
    pause
    exit /b 1
)
echo ✅ Python:
python --version
echo.

echo ============================================================
echo 📝 CONFIGURATION CHECK
echo ============================================================
echo.

if not exist "backend-webapp\.env" (
    echo ❌ backend-webapp\.env NOT found!
    echo.
    echo Creating sample .env file...
    (
        echo # Google Gemini API Key
        echo GOOGLE_API_KEY=your_google_api_key_here
        echo.
        echo # MongoDB Connection
        echo MONGODB_URI=mongodb://localhost:27017/ai-learning
        echo # Or use MongoDB Atlas:
        echo # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-learning
        echo.
        echo # Server Configuration
        echo PORT=4000
        echo JWT_SECRET=your_secret_key_here_change_in_production
        echo.
        echo # Node Environment
        echo NODE_ENV=development
    ) > backend-webapp\.env
    
    echo ✅ Created backend-webapp\.env
    echo.
    echo ⚠️  IMPORTANT: Edit backend-webapp\.env and add your:
    echo    1. GOOGLE_API_KEY from https://makersuite.google.com/app/apikey
    echo    2. MONGODB_URI connection string
    echo.
    set /p continue="Press Enter after configuring .env or Ctrl+C to exit..."
)

echo ✅ Configuration file found
echo.

echo ============================================================
echo 📦 INSTALLING DEPENDENCIES
echo ============================================================
echo.

echo [1/3] Installing Backend dependencies...
cd backend-webapp
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Backend installation failed!
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo ✅ Backend dependencies ready
echo.

echo [2/3] Installing Frontend dependencies...
cd frontend-webapp
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Frontend installation failed!
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo ✅ Frontend dependencies ready
echo.

echo [3/3] Installing Python dependencies...
cd python-emotion-service
if not exist ".venv" (
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ❌ Python installation failed!
        cd ..
        pause
        exit /b 1
    )
    deactivate
) else (
    echo ✅ Python virtual environment exists
)
cd ..
echo ✅ Python dependencies ready
echo.

echo ============================================================
echo 🚀 STARTING SERVICES
echo ============================================================
echo.

echo Starting all services in separate windows...
echo.

echo [1/3] Starting Backend API Server...
start "Backend API Server" cmd /k "cd backend-webapp && npm run dev"
timeout /t 3 >nul
echo ✅ Backend started on http://localhost:4000
echo.

echo [2/3] Starting Frontend Web App...
start "Frontend Web App" cmd /k "cd frontend-webapp && npm run dev"
timeout /t 3 >nul
echo ✅ Frontend started on http://localhost:5173
echo.

echo [3/3] Starting Python Emotion Service...
start "Python Emotion Service" cmd /k "cd python-emotion-service && .venv\Scripts\activate && python emotion_service.py"
timeout /t 3 >nul
echo ✅ Emotion Service started on http://localhost:5000
echo.

echo ============================================================
echo ✅ ALL SERVICES RUNNING!
echo ============================================================
echo.
echo 🌐 Open your browser and go to:
echo    👉 http://localhost:5173
echo.
echo 📊 Available Features:
echo    ✅ Student Portal - Take adaptive tests
echo    ✅ Teacher Dashboard - Create tests and manage classes
echo    ✅ Student Profile - View personal analytics
echo    ✅ Teacher Analytics - Monitor all students
echo    ✅ Emotion Tracking - Real-time emotion analysis
echo    ✅ AI-Generated Questions - Personalized content
echo.
echo 🔑 Default Login Credentials:
echo    Student: username=student1, password=password
echo    Teacher: username=teacher1, password=password
echo.
echo 📝 Three terminal windows are now open:
echo    1. Backend Server (Port 4000) - Keep running
echo    2. Frontend App (Port 5173) - Keep running  
echo    3. Emotion Service (Port 5000) - Keep running
echo.
echo ⚠️  Do NOT close these windows while using the system!
echo.
echo Press any key to exit this window (services will keep running)...
pause >nul
