# 🚀 Complete Project Startup Guide

## Quick Start (Recommended)

### **Option 1: One-Click Startup** ⚡
```bash
# From project root directory:
START_COMPLETE_PROJECT.bat
```
This will:
1. Check prerequisites (Node.js, Python)
2. Check/create configuration files
3. Install all dependencies automatically
4. Start all three services in separate windows

---

## Manual Step-by-Step Guide

### **Prerequisites** ✅

1. **Node.js** (v16 or higher)
   - Download: https://nodejs.org
   - Check: `node --version`

2. **Python** (3.8 or higher)
   - Download: https://python.org
   - Check: `python --version`

3. **MongoDB** (Local or Cloud)
   - **Option A - Local:**
     - Download: https://www.mongodb.com/try/download/community
     - Default: `mongodb://localhost:27017`
   
   - **Option B - Cloud (Recommended):**
     - MongoDB Atlas: https://cloud.mongodb.com
     - Free tier available
     - Get connection string

4. **Google Gemini API Key** 🔑
   - Get key: https://makersuite.google.com/app/apikey
   - Free tier: 15 requests/minute

---

### **Step 1: Configuration** 📝

#### **Backend Configuration:**

Create/Edit `backend-webapp\.env`:

```env
# Google Gemini API Key (REQUIRED)
GOOGLE_API_KEY=your_google_api_key_here

# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/ai-learning
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-learning

# Server Configuration
PORT=4000
JWT_SECRET=your_secret_key_here_change_in_production

# Node Environment
NODE_ENV=development
```

**Important:** Replace placeholder values with your actual credentials!

---

### **Step 2: Install Dependencies** 📦

#### **Method A: Automatic Installation**
```bash
cd scripts
install-all.bat
```

#### **Method B: Manual Installation**

1. **Backend (Node.js):**
```bash
cd backend-webapp
npm install
cd ..
```

2. **Frontend (React):**
```bash
cd frontend-webapp
npm install
cd ..
```

3. **Python Emotion Service:**
```bash
cd python-emotion-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
deactivate
cd ..
```

---

### **Step 3: Start Services** 🚀

You need to run **THREE services** simultaneously:

#### **Terminal 1: Backend API Server**
```bash
cd backend-webapp
npm run dev
```
**Expected Output:**
```
🔑 Environment loaded:
  - PORT: 4000
  - GOOGLE_API_KEY: Found (AIzaSyC...)
  - DB_URL: Found (MongoDB Atlas)
✅ Connected to MongoDB
✅ Server listening on 4000
🌐 API available at: http://localhost:4000/api
```

#### **Terminal 2: Frontend Web App**
```bash
cd frontend-webapp
npm run dev
```
**Expected Output:**
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### **Terminal 3: Python Emotion Service**
```bash
cd python-emotion-service
.venv\Scripts\activate
python emotion_service.py
```
**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Emotion detection service started
```

---

### **Step 4: Access the Application** 🌐

Open your browser and go to:
```
http://localhost:5173
```

---

## 🎯 Using the System

### **First Time Setup:**

1. **Login Page** will appear
2. **Default Credentials:**
   - **Student Account:**
     - Username: `student1`
     - Password: `password`
   
   - **Teacher Account:**
     - Username: `teacher1`
     - Password: `password`

### **For Students:**

1. **Login** → Student Dashboard
2. **Join a Class:**
   - Click "Join Class" button
   - Enter class code from teacher
   - Click "Join"

3. **Take a Test:**
   - Select your class
   - Click on available test
   - Click "Start Test"
   - Allow camera access for emotion tracking
   - Answer questions
   - Submit test

4. **View Your Profile:**
   - Click "📊 My Profile" button in header
   - Explore tabs:
     - **Overview:** Recent activity
     - **Topics:** Performance by subject
     - **Emotions:** Stress and emotion analysis
     - **AI:** AI interaction history

### **For Teachers:**

1. **Login** → Teacher Dashboard
2. **Create a Class:**
   - Click "Create Class" button
   - Enter class name and description
   - Click "Create"
   - **Share the 6-character code** with students

3. **Create a Test:**
   - Select a class
   - Click "Create Test"
   - Enter test name and topic
   - Choose number of questions (5-20)
   - Click "Generate Questions" (AI-powered!)
   - Preview and create test

4. **View Student Analytics:**
   - Click "📊 Student Analytics" button in header
   - **Search/select a student** from the list
   - View comprehensive analytics:
     - Performance metrics
     - Topic mastery
     - Strengths & weaknesses
     - Emotion patterns
     - AI interactions

---

## 🔧 Troubleshooting

### **Issue 1: Backend won't start**

**Error:** "GOOGLE_API_KEY not found"
```bash
Solution:
1. Check backend-webapp\.env exists
2. Verify GOOGLE_API_KEY is set correctly
3. No spaces around = sign
4. Remove any quotes around the key
```

**Error:** "Failed to connect to MongoDB"
```bash
Solution:
1. If using local MongoDB, ensure it's running:
   - Windows: Check Services (MongoDB Server)
   - Or start: mongod

2. If using MongoDB Atlas:
   - Verify connection string is correct
   - Check IP whitelist (allow your IP or 0.0.0.0/0)
   - Verify username/password
```

### **Issue 2: Frontend won't load**

**Error:** "Cannot connect to backend"
```bash
Solution:
1. Verify backend is running on port 4000
2. Check browser console for errors
3. Ensure CORS is not blocking requests
```

### **Issue 3: Emotion Service won't start**

**Error:** "No module named 'cv2'"
```bash
Solution:
cd python-emotion-service
.venv\Scripts\activate
pip install opencv-python
```

**Error:** "Camera not accessible"
```bash
Solution:
1. Check browser permissions (allow camera)
2. Ensure no other app is using camera
3. Try different browser (Chrome recommended)
```

### **Issue 4: Profile/Analytics pages show no data**

```bash
Solution:
1. Complete at least one test as student
2. Analytics are generated after test completion
3. Refresh the page
4. Check browser console for errors
```

---

## 📊 Available Pages

### **Student Pages:**
- `/` - Login page
- `/student` - Student dashboard (tests, classes)
- `/student/profile` - Student profile with analytics ⭐ NEW

### **Teacher Pages:**
- `/` - Login page
- `/teacher` - Teacher dashboard (create tests, manage classes)
- `/teacher/analytics` - View all student analytics ⭐ NEW

### **Admin Pages:**
- `/admin` - Admin dashboard (system overview)

---

## 🔌 API Endpoints

### **Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### **Tests:**
- `GET /api/tests` - Get all tests
- `POST /api/tests/start` - Start a test
- `POST /api/tests/submit` - Submit answers

### **Classes:**
- `GET /api/classes` - Get user's classes
- `POST /api/classes/create` - Create class (teacher)
- `POST /api/classes/join` - Join class (student)

### **Analytics:**
- `GET /api/analytics/student/:studentId` - Student analytics
- `GET /api/analytics/leaderboard` - Top performers
- `GET /api/analytics/ai/student/:studentId` - AI interactions

### **Profile (NEW):**
- `GET /api/profile/me` - My profile ⭐
- `GET /api/profile/student/:studentId` - Student profile (teacher) ⭐
- `GET /api/profile/students` - All students (teacher) ⭐
- `PUT /api/profile/update` - Update profile ⭐

### **Emotions:**
- `POST /api/emotions/track` - Track emotion snapshot
- `GET /api/emotions/summary/:attemptId` - Get emotion summary

---

## 💾 Database Collections

Your MongoDB will have these collections:

1. **users** - Student, teacher, admin accounts
2. **classes** - Class information with codes
3. **tests** - Test definitions
4. **attempts** - Test attempts by students
5. **studentanalytics** - Aggregate student performance ⭐ NEW
6. **aianalyses** - AI interaction logs ⭐ NEW
7. **emotiontrackings** - Emotion snapshots during tests

---

## 🎨 Features Overview

### **✅ Core Features:**
- ✅ User authentication (JWT)
- ✅ Role-based access (Student, Teacher, Admin)
- ✅ Class management with codes
- ✅ AI-powered question generation (Gemini)
- ✅ Adaptive difficulty based on performance
- ✅ Real-time emotion tracking (OpenCV + DeepFace)
- ✅ Session-based testing (3 sessions per test)

### **⭐ NEW Features:**
- ✅ Student profile with comprehensive analytics
- ✅ Teacher analytics dashboard
- ✅ Topic performance tracking
- ✅ Emotion distribution charts
- ✅ AI interaction history
- ✅ Strengths and weaknesses identification
- ✅ Proper MongoDB ObjectId relationships

---

## 🛑 Stopping the Services

To stop all services:
1. **Close all three terminal windows**
2. Or press `Ctrl+C` in each terminal

**Note:** Closing the startup script window does NOT stop the services!

---

## 🔄 Restarting the Services

```bash
# Quick restart:
START_COMPLETE_PROJECT.bat

# Or manually restart each:
# Terminal 1:
cd backend-webapp && npm run dev

# Terminal 2:
cd frontend-webapp && npm run dev

# Terminal 3:
cd python-emotion-service && .venv\Scripts\activate && python emotion_service.py
```

---

## 📝 Development Tips

### **Hot Reload is Active:**
- Backend: Changes auto-reload (nodemon)
- Frontend: Changes auto-update (Vite HMR)
- Python: Restart service for changes

### **View Logs:**
- Backend: Check terminal 1
- Frontend: Check browser console (F12)
- Python: Check terminal 3

### **Database Access:**
- Use MongoDB Compass for GUI
- Or: `mongosh` for CLI

---

## 📚 Documentation Files

- `PROFILE_ANALYTICS_GUIDE.md` - Profile & analytics features ⭐
- `ANALYTICS_README.md` - Analytics system overview
- `DATABASE_RELATIONSHIPS_FIX.md` - DB schema fixes
- `COMPLETE_SETUP.md` - Detailed setup guide
- `QUICK_START.md` - Quick reference

---

## 🆘 Getting Help

### **Check Documentation:**
1. Read error messages carefully
2. Check relevant .md files
3. Verify all prerequisites installed
4. Ensure all .env variables set

### **Common Commands:**
```bash
# Check Node version
node --version

# Check Python version
python --version

# Check if MongoDB is running (local)
mongosh

# Check if port is in use
netstat -ano | findstr :4000
netstat -ano | findstr :5173
netstat -ano | findstr :5000

# Clear npm cache (if installation fails)
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Success Checklist

Before running, ensure:
- [ ] Node.js installed (v16+)
- [ ] Python installed (3.8+)
- [ ] MongoDB accessible (local or Atlas)
- [ ] Google Gemini API key obtained
- [ ] `backend-webapp\.env` configured correctly
- [ ] All dependencies installed
- [ ] Camera available for emotion tracking
- [ ] Ports 4000, 5173, 5000 available

---

## 🎉 You're Ready!

Once all three services are running and you see the login page at `http://localhost:5173`, you're all set!

**Enjoy your AI-powered adaptive learning system with comprehensive student analytics!** 🚀

---

**Last Updated:** October 18, 2025  
**Version:** 2.0 (with Profile & Analytics)
