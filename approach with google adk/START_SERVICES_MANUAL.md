# 🚀 START SERVICES MANUALLY - Step by Step

## ✅ Python Emotion Service Created!

The `python-emotion-service` folder has been created with:
- `app.py` - Flask emotion detection server
- `requirements.txt` - Python dependencies
- `start.bat` - Startup script

---

## 📋 Manual Startup Instructions

### Terminal 1: Python Emotion Service

```bash
# Navigate to directory
cd "c:\Users\NARENDAR\Documents\Hackathons\vibethon\approach with google adk\python-emotion-service"

# Install dependencies (first time only)
pip install flask flask-cors deepface opencv-python numpy pillow

# Start service
python app.py
```

**Expected Output:**
```
🚀 Starting Python Emotion Detection Service...
📍 Service will run on http://127.0.0.1:5001
🔍 Endpoints:
   - GET  /health              - Health check
   - POST /detect-emotion      - Emotion detection (DeepFace)
   - POST /detect-emotion-simple - Simple detection (fallback)
 * Running on http://127.0.0.1:5001
```

**Test it:**
- Open browser: http://localhost:5001/health
- Should see: `{"status":"ok","message":"Emotion Service is running"}`

---

### Terminal 2: Backend API

```bash
# Navigate to backend
cd "c:\Users\NARENDAR\Documents\Hackathons\vibethon\approach with google adk\backend-webapp"

# Install dependencies (first time only)
npm install

# Start backend
npm run dev
```

**Expected Output:**
```
🚀 Starting Backend API Server...
📍 MongoDB connected successfully
📍 Server running on port 5000
📍 Environment: development
```

**Test it:**
- Open browser: http://localhost:5000/api/health
- Should see: Health status JSON

---

### Terminal 3: Frontend React App

```bash
# Navigate to frontend
cd "c:\Users\NARENDAR\Documents\Hackathons\vibethon\approach with google adk\frontend-webapp"

# Install dependencies (first time only)
npm install

# Start frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view the app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Browser will auto-open to:** http://localhost:3000

---

## ✅ Verification Checklist

Once all 3 terminals are running:

- [ ] Terminal 1 shows: "Running on http://127.0.0.1:5001"
- [ ] Terminal 2 shows: "Server running on port 5000"
- [ ] Terminal 3 shows: "Compiled successfully"
- [ ] Browser opened to http://localhost:3000
- [ ] http://localhost:5001/health returns OK
- [ ] http://localhost:5000/api/health returns OK
- [ ] http://localhost:3000 shows login page

---

## 🐛 Common Issues

### Issue 1: Port already in use
**Error:** `Port 5000 is already in use`

**Fix:**
```bash
# Windows - Kill processes
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Then restart services
```

### Issue 2: Python packages not found
**Error:** `ModuleNotFoundError: No module named 'flask'`

**Fix:**
```bash
cd "c:\Users\NARENDAR\Documents\Hackathons\vibethon\approach with google adk\python-emotion-service"
pip install -r requirements.txt
```

### Issue 3: MongoDB not running
**Error:** `MongooseServerSelectionError`

**Fix:**
```bash
# Start MongoDB service
net start MongoDB

# Or check if MongoDB is installed
mongod --version
```

### Issue 4: npm dependencies missing
**Error:** `Cannot find module`

**Fix:**
```bash
# In backend-webapp
npm install

# In frontend-webapp
npm install
```

---

## 🎯 After All Services Start

Follow these steps to test the session-based system:

### 1. Open Browser
- Go to: http://localhost:3000

### 2. Test as Teacher
1. Click "Teacher Login"
2. Username: `teacher1`, Password: `password123`
3. Create class (note the 6-character code)
4. Create test:
   - Name: "Math Test"
   - Topic: "Algebra"
   - Questions: 20
   - **Questions Per Session: 5** ← NEW FIELD!

### 3. Test as Student (Incognito Window)
1. Press Ctrl+Shift+N (new incognito window)
2. Go to: http://localhost:3000
3. Click "Student Login"
4. Username: `student1`, Password: `password123`
5. Join class with the 6-character code
6. Start test

### 4. Verify Session-Based Flow
**You MUST see:**
- ✅ Header: "Session 1 of 4"
- ✅ **5 questions displayed at once** (NOT one at a time!)
- ✅ Can answer in any order
- ✅ Green borders when answered
- ✅ Checkmarks on answered questions
- ✅ "Submit & Continue" button (disabled until all 5 answered)

**After submitting Session 1:**
- ✅ Popup shows AI analysis
- ✅ Shows accuracy, recommendation, next difficulty
- ✅ Session 2 loads with NEW 5 questions
- ✅ Blue banner shows "Previous Session Analysis"

**Continue through all 4 sessions** (20 questions total)

**Results page shows:**
- ✅ Final accuracy
- ✅ Stress chart
- ✅ 20 questions completed

---

## 📊 What to Check in Terminals

### Terminal 1 (Python):
```
Should see requests like:
127.0.0.1 - - [timestamp] "POST /detect-emotion HTTP/1.1" 200 -
```

### Terminal 2 (Backend):
```
Should see logs like:
🎯 SESSION-BASED TEST: Student student1 started "Math Test"
   📊 Config: 20 questions, 5 per session
   🤖 Generating first batch of 5 questions...
✅ Session 1/4 ready - 5 questions generated

📊 SESSION SUBMISSION: Session 1
   📝 Answers received: 5
   😊 Emotion data: Yes
🤖 AI ANALYSIS:
   ✓ Accuracy: 80%
   ✓ Avg Stress: 3.2 (Emotion: 0.35)
   → Excellent performance! Increasing difficulty.
   → Next Difficulty: medium
```

### Terminal 3 (Frontend):
```
Should not show errors
Check browser console (F12) for:
🎯 Starting session-based test
✅ Session started
📊 Submitting session
🤖 AI Analysis
```

---

## 🎉 Success Criteria

**System is working if:**
- ✅ All 3 services start without errors
- ✅ Can login as teacher and student
- ✅ Test shows 5 questions at once
- ✅ AI analysis popup appears after each session
- ✅ Questions adapt based on performance
- ✅ Test completes after 4 sessions
- ✅ Results page displays correctly

---

## 📝 Next Steps

Once testing is complete:
1. Document any issues found
2. Take screenshots of:
   - Session 1 (5 questions)
   - AI analysis popup
   - Session 2 with previous analysis
   - Results page
3. Verify MongoDB has `sessionAnalytics` data
4. Proceed to Phase 8: Push to GitHub

---

**Need help?** 
- Check terminal outputs for errors
- Press F12 in browser to see console logs
- Check MongoDB Compass for data
- Review `QUICK_TEST_GUIDE.md` for detailed steps

**Good luck!** 🚀
