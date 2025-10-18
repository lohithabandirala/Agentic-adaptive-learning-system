# 🧪 TESTING CHECKLIST - Session-Based System

## ✅ Pre-Test Setup

### 1. Verify File Structure
```
✓ backend-webapp/ exists
✓ frontend-webapp/ exists
✓ python-emotion-service/ exists
✓ scripts/start-all.bat exists
```

### 2. Check Environment Files
- [ ] `backend-webapp/.env` has MongoDB URI
- [ ] `backend-webapp/.env` has GEMINI_API_KEY
- [ ] `python-emotion-service/.env` or config has settings

### 3. Install Dependencies (if not done)
```bash
cd backend-webapp
npm install

cd ../frontend-webapp
npm install

cd ../python-emotion-service
pip install -r requirements.txt
```

---

## 🚀 PHASE 1: Start Services

### Test 1.1: Start All Services
- [ ] Run `TEST_SESSION_SYSTEM.bat` OR `scripts\start-all.bat`
- [ ] 3 terminal windows open
- [ ] Python service shows: "Flask app running on port 5001"
- [ ] Backend shows: "Server running on port 5000"
- [ ] Frontend shows: "Compiled successfully" and opens browser

### Test 1.2: Verify Services Running
- [ ] Open: http://localhost:5001/health → Should return "Emotion Service is running"
- [ ] Open: http://localhost:5000/api/health → Should return health status
- [ ] Open: http://localhost:3000 → Should show login page

**If any service fails, stop here and fix before continuing!**

---

## 👨‍🏫 PHASE 2: Teacher Workflow

### Test 2.1: Teacher Login
- [ ] Open browser: http://localhost:3000
- [ ] Click "Teacher Login"
- [ ] Enter username: `teacher1`
- [ ] Enter password: `password123`
- [ ] Click "Login"
- [ ] Should redirect to Teacher Dashboard

### Test 2.2: Create Class
- [ ] Click "+ Create Class" button
- [ ] Enter name: `Test Class Session-Based`
- [ ] Enter description: `Testing session-based question generation`
- [ ] Click "Create"
- [ ] Should see success message
- [ ] **IMPORTANT: Note the 6-character class code** (e.g., ABC123)
- [ ] Write it here: ________________

### Test 2.3: Create Test (Session-Based)
- [ ] Select "Test Class Session-Based"
- [ ] Click "+ Create Test"
- [ ] Fill in form:
  - Test Name: `Math Session Test`
  - Topic: `Basic Algebra`
  - Number of Questions: `20`
  - **Questions Per Session: `5`** ← This is NEW!
- [ ] Click "Create Test"
- [ ] Should see test appear in list
- [ ] Test should show: "20 questions • 5 per session"

---

## 🧑‍🎓 PHASE 3: Student Workflow - Session 1

### Test 3.1: Student Login (Incognito Window)
- [ ] Open **new incognito/private window** (Ctrl+Shift+N)
- [ ] Go to: http://localhost:3000
- [ ] Click "Student Login"
- [ ] Enter username: `student1`
- [ ] Enter password: `password123`
- [ ] Click "Login"
- [ ] Should redirect to Student Portal

### Test 3.2: Join Class
- [ ] Click "+ Join Class"
- [ ] Enter the 6-character code: ________________
- [ ] Click "Join Class"
- [ ] Should see success message
- [ ] "Test Class Session-Based" should appear in list

### Test 3.3: Start Session-Based Test
- [ ] Select "Test Class Session-Based"
- [ ] Should see "Math Session Test"
- [ ] Click "Start Test" button
- [ ] **CRITICAL: Wait 3-5 seconds for questions to generate**

### Test 3.4: Verify Session 1 Display
**Check these carefully:**
- [ ] Header shows: "Session 1 of 4"
- [ ] Shows: "Answered: 0/5 questions"
- [ ] **5 QUESTIONS VISIBLE AT ONCE** (not just 1!)
- [ ] All questions have difficulty badges (EASY/MEDIUM/HARD)
- [ ] Each question has 4 option buttons
- [ ] Submit button at bottom is DISABLED
- [ ] Webcam permission requested
- [ ] Emotion tracker appears (bottom-right corner)

**If only 1 question shows, STOP! Frontend not using session endpoints.**

### Test 3.5: Answer Session 1 Questions
**Answer each question (any order):**
- [ ] Click option for Question 1
  - Should see: Green border appears
  - Should see: Checkmark icon "✓ Answered"
- [ ] Click option for Question 2
  - Should see: Green border appears
- [ ] Click option for Question 3
- [ ] Click option for Question 4
- [ ] Click option for Question 5
- [ ] Header should show: "Answered: 5/5 questions"
- [ ] Bottom shows: "✓ All questions answered!"
- [ ] Submit button is now ENABLED

### Test 3.6: Check Emotion Tracking
- [ ] Webcam video should be visible (small window, bottom-right)
- [ ] Should show detected emotion (e.g., "Neutral", "Happy")
- [ ] Should show stress level (e.g., "Low", "Medium")
- [ ] Face detection working (green box around face)

### Test 3.7: Submit Session 1
- [ ] Click "Submit & Continue" button
- [ ] Should see: Loading indicator (⏳ Analyzing...)
- [ ] **Wait 2-5 seconds for AI analysis**
- [ ] Should see: **POPUP with AI Analysis**

**Verify popup shows:**
```
Session 1 Complete!

✓ Accuracy: XX%
✓ Correct: X/5

[AI Recommendation text]

Next difficulty: [EASY/MEDIUM/HARD]
```

- [ ] Popup appears
- [ ] Shows accuracy percentage
- [ ] Shows recommendation
- [ ] Shows next difficulty
- [ ] Click OK to close popup

---

## 🧑‍🎓 PHASE 4: Student Workflow - Session 2

### Test 4.1: Verify Session 2 Loaded
**After closing popup:**
- [ ] Header shows: "Session 2 of 4"
- [ ] Shows: "Answered: 0/5 questions"
- [ ] **NEW 5 questions appear** (not same as Session 1!)
- [ ] Blue banner at top shows: "Previous Session Analysis"
- [ ] Banner shows AI recommendation from Session 1
- [ ] Submit button is DISABLED again

### Test 4.2: Check Backend Logs
**Switch to backend terminal:**
```
Should see logs like:
📊 SESSION SUBMISSION: Session 1
   📝 Answers received: 5
   😊 Emotion data: Yes
🤖 AI ANALYSIS:
   ✓ Accuracy: 80%
   ✓ Avg Stress: 3.2 (Emotion: 0.35)
   ✓ Avg Time: 28.5s
   → [Recommendation]
   → Next Difficulty: medium
🤖 Generating Session 2 - 5 questions...
   Using AI analysis from previous session:
   - Accuracy: 80%
   - Difficulty: medium
   - Emotional State: Calm
✅ Session 2 ready - 5 personalized questions
```

- [ ] Logs show "SESSION SUBMISSION"
- [ ] Logs show "AI ANALYSIS"
- [ ] Logs show accuracy calculation
- [ ] Logs show next difficulty decision
- [ ] Logs show "Generating Session 2"
- [ ] Logs show personalization data

### Test 4.3: Answer Session 2 Questions
**Test adaptive difficulty:**

**Scenario A: If Session 2 is HARDER:**
- [ ] Answer intentionally mix correct and wrong
- [ ] Answer 2 correct, 3 wrong (40% accuracy)
- [ ] Submit session
- [ ] AI should say: "Struggling detected. Reducing difficulty"
- [ ] Session 3 should be EASIER

**Scenario B: If Session 2 is SAME/EASIER:**
- [ ] Answer all 5 correct (100% accuracy)
- [ ] Submit session
- [ ] AI should say: "Excellent! Increasing difficulty"
- [ ] Session 3 should be HARDER

- [ ] Submit Session 2
- [ ] Wait for AI analysis popup
- [ ] Verify difficulty change makes sense

---

## 🧑‍🎓 PHASE 5: Complete Test

### Test 5.1: Continue Through All Sessions
- [ ] Complete Session 3 (5 questions)
- [ ] Submit and see AI analysis
- [ ] Complete Session 4 (5 questions - final session)
- [ ] Submit final session
- [ ] Should see: Loading then redirect to results

### Test 5.2: Verify Results Page
**Check results display:**
- [ ] Shows: "Test Completed!" with checkmark
- [ ] Shows: Accuracy percentage (e.g., 75%)
- [ ] Shows: Average Stress Level
- [ ] Shows: Total Questions (20)
- [ ] Shows: Stress chart (line graph with 20 data points)
- [ ] Chart shows stress fluctuation over questions
- [ ] Can see which questions had high/low stress

### Test 5.3: Check Frontend Console Logs
- [ ] Press F12 to open DevTools
- [ ] Go to Console tab
- [ ] Should see logs:
```
🎯 Starting session-based test: test_xxx
✅ Session started: { session: 1, totalSessions: 4, questions: 5 }
✓ Question answered: { questionId: 'q1', isCorrect: true }
📸 Emotion snapshot saved
📊 Submitting session: { sessionNumber: 1, answersCount: 5 }
🤖 AI Analysis: { accuracy: 0.8, recommendation: "..." }
📝 Loading next session: { sessionNumber: 2, questions: 5 }
```

- [ ] Logs show session start
- [ ] Logs show question answers
- [ ] Logs show emotion snapshots
- [ ] Logs show session submission
- [ ] Logs show AI analysis
- [ ] Logs show next session loading

---

## 💾 PHASE 6: Database Verification

### Test 6.1: Open MongoDB
- [ ] Open MongoDB Compass
- [ ] Connect to: `mongodb://localhost:27017`
- [ ] Select database: `ailearn` (or your database name)

### Test 6.2: Check Tests Collection
- [ ] Open `tests` collection
- [ ] Find "Math Session Test"
- [ ] Verify fields:
```javascript
{
  testName: "Math Session Test",
  topic: "Basic Algebra",
  numQuestions: 20,
  questionsPerSession: 5,  // ← NEW FIELD
  // ... other fields
}
```

- [ ] `questionsPerSession` field exists
- [ ] Value is 5

### Test 6.3: Check Attempts Collection
- [ ] Open `attempts` collection
- [ ] Find the attempt you just completed
- [ ] Verify structure:
```javascript
{
  attemptId: "attempt_xxx",
  studentId: "student1",
  testId: "test_xxx",
  currentSession: 4,           // ← NEW: Final session
  currentSessionQuestions: [], // ← NEW: Empty after complete
  sessionAnalytics: [          // ← NEW: Array of 4 session analyses
    {
      sessionNumber: 1,
      questionsAnswered: 5,
      correctAnswers: 4,
      accuracy: 0.8,
      avgStress: 3.2,
      avgEmotionStress: 0.35,
      avgTime: 28.5,
      dominantEmotions: ["neutral", "happy", ...],
      recommendation: "Excellent performance! Increasing difficulty.",
      nextDifficulty: "medium"
    },
    {
      sessionNumber: 2,
      // ... Session 2 analytics
    },
    {
      sessionNumber: 3,
      // ... Session 3 analytics
    },
    {
      sessionNumber: 4,
      // ... Session 4 analytics
    }
  ],
  results: [                   // All 20 answers
    { questionId: "q1", isCorrect: true, stress: 3, ... },
    { questionId: "q2", isCorrect: false, stress: 6, ... },
    // ... 18 more
  ],
  completed: true,
  completedAt: "2024-01-15T..."
}
```

**Verify:**
- [ ] `currentSession` field exists
- [ ] `currentSessionQuestions` field exists
- [ ] `sessionAnalytics` array exists
- [ ] `sessionAnalytics` has 4 objects (one per session)
- [ ] Each session has: accuracy, avgStress, recommendation, nextDifficulty
- [ ] `results` array has 20 objects (all answers)
- [ ] Each answer has: stress, stressLevel, dominantEmotion

---

## 🧪 PHASE 7: Advanced Testing

### Test 7.1: Test Difficulty Adaptation

**Create new test and intentionally fail:**
- [ ] Teacher creates another test: "Math Test 2" (20 questions, 5 per session)
- [ ] Student starts test
- [ ] Session 1: Answer all 5 WRONG (0% accuracy)
- [ ] Submit session
- [ ] AI should say: "Struggling detected. Reducing difficulty" OR "Maintaining EASY"
- [ ] Session 2: Should be EASY questions
- [ ] Answer all 5 CORRECT (100% accuracy)
- [ ] Submit session
- [ ] AI should say: "Excellent! Increasing difficulty"
- [ ] Session 3: Should be MEDIUM questions

**Verify:**
- [ ] AI correctly reduces difficulty when struggling
- [ ] AI correctly increases difficulty when excelling
- [ ] Difficulty changes are logical

### Test 7.2: Test Edge Cases

**Test with different question counts:**
- [ ] Create test with 10 questions, 5 per session (2 sessions)
- [ ] Complete both sessions
- [ ] Verify 2 session analytics in database

- [ ] Create test with 15 questions, 5 per session (3 sessions)
- [ ] Complete all sessions
- [ ] Verify 3 session analytics

### Test 7.3: Test Emotion Integration

**Monitor emotion tracking:**
- [ ] Start test
- [ ] Make exaggerated facial expressions during Session 1:
  - Happy face → Check if detected as "Happy"
  - Stressed face → Check if stress level increases
  - Neutral face → Check if detected as "Neutral"
- [ ] Submit session
- [ ] Check if AI analysis mentions emotion data
- [ ] Check backend logs for emotion stress values

---

## 📊 PHASE 8: Performance Testing

### Test 8.1: API Response Times
**Measure response times:**
- [ ] Open browser DevTools → Network tab
- [ ] Start test
- [ ] Check: `POST /api/tests/start-session`
  - Time: Should be < 5 seconds
- [ ] Submit session
- [ ] Check: `POST /api/tests/submit-session`
  - Time: Should be < 3 seconds

### Test 8.2: Question Generation Quality
- [ ] Review generated questions
- [ ] Are questions relevant to topic?
- [ ] Are difficulty levels appropriate?
- [ ] Are options reasonable?
- [ ] Do questions make sense?

---

## ✅ SUCCESS CRITERIA

### Must Pass (Critical):
- [x] All 3 services start successfully
- [x] Teacher can create class and test
- [x] Student can join class and start test
- [x] **5 questions display at once** (not 1!)
- [x] Can answer questions in any order
- [x] Visual feedback works (green borders, checkmarks)
- [x] Can submit entire session together
- [x] AI analysis popup appears after each session
- [x] Next session loads with new questions
- [x] Difficulty adapts based on performance
- [x] Test completes after all sessions
- [x] Results page displays correctly
- [x] Database has session tracking fields
- [x] sessionAnalytics array populated

### Should Pass (Important):
- [ ] Backend logs show detailed session info
- [ ] Frontend console shows session logs
- [ ] Emotion tracking works
- [ ] Emotion data influences AI decisions
- [ ] Progress bars update correctly
- [ ] Session analysis banner displays
- [ ] Response times are acceptable (< 5s)

### Nice to Have (Optional):
- [ ] Questions are high quality
- [ ] UI is smooth and responsive
- [ ] No console errors
- [ ] Webcam detection is accurate
- [ ] Charts display correctly

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Only 1 question shows
**Problem**: Frontend not using new endpoints
**Check**: 
- View page source → Should see "Session 1 of X"
- If not, frontend not updated
**Fix**: Restart frontend: `npm start` in frontend-webapp

### Issue 2: Submit button always disabled
**Problem**: Not all questions answered
**Check**: Look for green borders on all 5 questions
**Fix**: Click option for each question

### Issue 3: No AI popup
**Problem**: Backend not returning sessionAnalysis
**Check**: Backend terminal for "AI ANALYSIS" logs
**Fix**: 
- Check Gemini API key in .env
- Check backend logs for errors

### Issue 4: Services don't start
**Problem**: Port already in use
**Fix**:
```bash
# Kill processes on ports
taskkill /F /IM node.exe
taskkill /F /IM python.exe
# Then restart
```

### Issue 5: MongoDB connection fails
**Problem**: MongoDB not running
**Fix**:
```bash
# Start MongoDB
net start MongoDB
# Or start MongoDB service from Services app
```

---

## 📝 TEST RESULTS LOG

### Test Date: _______________
### Tester: _______________

### Overall Results:
- [ ] ✅ All tests passed
- [ ] ⚠️ Some tests passed (specify which failed below)
- [ ] ❌ Major failures (stop and debug)

### Failed Tests:
1. ________________________________
2. ________________________________
3. ________________________________

### Notes:
_________________________________________________
_________________________________________________
_________________________________________________

### Screenshots Taken:
- [ ] Session 1 display (5 questions)
- [ ] AI analysis popup
- [ ] Session 2 with previous analysis banner
- [ ] Results page
- [ ] MongoDB sessionAnalytics

---

## 🎉 COMPLETION

If all critical tests pass, the session-based system is working correctly!

**Next Steps:**
1. Document any issues found
2. Fix critical bugs
3. Proceed to Phase 8: Push to GitHub

**Status**: 
- [ ] ✅ System fully tested and working
- [ ] 🔄 Needs fixes before deployment
- [ ] ❌ Major issues, needs significant work

**Tested by**: _______________  
**Date**: _______________  
**Time spent**: _______________
