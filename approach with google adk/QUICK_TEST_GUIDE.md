# 🚀 QUICK START TESTING GUIDE

## Step 1: Start All Services

### Option A: Using the Script (Recommended)
1. Open File Explorer
2. Navigate to: `c:\Users\NARENDAR\Documents\Hackathons\vibethon\approach with google adk\scripts`
3. **Double-click** `start-all.bat`
4. Three terminal windows will open:
   - Window 1: Python Emotion Service (port 5001)
   - Window 2: Backend API (port 5000)
   - Window 3: Frontend React App (port 3000)
5. Wait 30-60 seconds for all services to start

### Option B: Start Manually
**Terminal 1 - Python Emotion Service:**
```bash
cd "c:\Users\NARENDAR\Documents\Hackathons\vibethon\approach with google adk\python-emotion-service"
python app.py
```
Wait for: `* Running on http://127.0.0.1:5001`

**Terminal 2 - Backend API:**
```bash
cd "c:\Users\NARENDAR\Documents\Hackathons\vibethon\approach with google adk\backend-webapp"
npm run dev
```
Wait for: `Server running on port 5000`

**Terminal 3 - Frontend:**
```bash
cd "c:\Users\NARENDAR\Documents\Hackathons\vibethon\approach with google adk\frontend-webapp"
npm start
```
Wait for: Browser opens automatically to `http://localhost:3000`

---

## Step 2: Verify Services Are Running

Open these URLs in your browser:
1. ✅ Python Service: http://localhost:5001/health  
   Should show: `Emotion Service is running`

2. ✅ Backend API: http://localhost:5000/api/health  
   Should show: `{"status":"ok"}` or similar

3. ✅ Frontend: http://localhost:3000  
   Should show: Login page with "Teacher Login" and "Student Login" buttons

**If any service fails, don't proceed! Fix it first.**

---

## Step 3: Teacher Creates Class & Test

### 3.1 Login as Teacher
1. Go to: http://localhost:3000
2. Click **"Teacher Login"**
3. Username: `teacher1`
4. Password: `password123`
5. Click **"Login"**
6. Should see Teacher Dashboard

### 3.2 Create Class
1. Click **"+ Create Class"**
2. Name: `Session Test Class`
3. Description: `Testing session-based questions`
4. Click **"Create"**
5. **IMPORTANT**: Note the **6-character code** (e.g., `XYZ789`)
6. **Write it down**: _______________

### 3.3 Create Session-Based Test
1. Select "Session Test Class" (click on it)
2. Click **"+ Create Test"**
3. Fill in:
   - **Test Name**: `Algebra Session Test`
   - **Topic**: `Basic Algebra`
   - **Number of Questions**: `20`
   - **Questions Per Session**: `5` ← **This is the NEW field!**
4. Click **"Create Test"**
5. Should see: "Algebra Session Test" in list
6. Should show: "20 questions"

---

## Step 4: Student Takes Session-Based Test

### 4.1 Open Incognito Window
1. Press **Ctrl+Shift+N** (Chrome) or **Ctrl+Shift+P** (Firefox)
2. Go to: http://localhost:3000
3. This lets you test as student while staying logged in as teacher

### 4.2 Login as Student
1. Click **"Student Login"**
2. Username: `student1`
3. Password: `password123`
4. Click **"Login"**
5. Should see Student Portal

### 4.3 Join Class
1. Click **"+ Join Class"**
2. Enter the 6-character code: _______________
3. Click **"Join Class"**
4. Should see success message
5. "Session Test Class" appears in list

### 4.4 Start Test
1. Select "Session Test Class"
2. Should see "Algebra Session Test"
3. Click **"Start Test"** button
4. **Wait 3-5 seconds** for questions to generate

---

## Step 5: CRITICAL - Verify Session Display

### ✅ What You MUST See:
- [ ] Header says: **"Session 1 of 4"**
- [ ] Shows: **"Answered: 0/5 questions"**
- [ ] **5 QUESTIONS VISIBLE AT ONCE** (scroll to see all)
- [ ] Each question has:
  - Difficulty badge (EASY/MEDIUM/HARD)
  - Question text
  - 4 option buttons
  - "Question X of 5" label
- [ ] Bottom shows: **"Submit & Continue"** button (DISABLED)
- [ ] Webcam permission requested
- [ ] Small video window (bottom-right) with emotion tracking

### ❌ PROBLEM if you see:
- Only 1 question showing
- No "Session 1 of 4" header
- No webcam/emotion tracker

**If problems, STOP and check:**
- Frontend terminal for errors
- Browser console (F12) for errors
- Backend terminal for API errors

---

## Step 6: Answer Session 1 Questions

### 6.1 Answer Each Question (Any Order)
1. **Question 1**: Click any option
   - ✅ Green border appears around question
   - ✅ Checkmark icon shows "✓ Answered"
   - ✅ Header updates: "Answered: 1/5 questions"

2. **Question 2**: Click any option
   - ✅ Green border appears
   - ✅ Header updates: "Answered: 2/5 questions"

3. Continue for **Questions 3, 4, and 5**
4. After all 5 answered:
   - ✅ Header shows: "Answered: 5/5 questions"
   - ✅ Bottom shows: "✓ All questions answered!"
   - ✅ **"Submit & Continue" button is now ENABLED**

---

## Step 7: Submit Session 1 & See AI Analysis

### 7.1 Submit
1. Click **"Submit & Continue"** button
2. Should show: **"⏳ Analyzing..."**
3. **Wait 2-5 seconds** (AI is analyzing)

### 7.2 AI Analysis Popup
**You MUST see a popup like this:**

```
┌─────────────────────────────────────┐
│     Session 1 Complete!             │
│                                     │
│  ✓ Accuracy: 80%                   │
│  ✓ Correct: 4/5                    │
│                                     │
│  Excellent performance!             │
│  Increasing difficulty.             │
│                                     │
│  Next difficulty: MEDIUM            │
│                                     │
│           [ OK ]                    │
└─────────────────────────────────────┘
```

**Verify:**
- [ ] Popup appears
- [ ] Shows accuracy percentage
- [ ] Shows correct count (X/5)
- [ ] Shows AI recommendation
- [ ] Shows next difficulty
- [ ] Click OK to close

---

## Step 8: Verify Session 2 Loads

### After closing popup:
- [ ] Header updates to: **"Session 2 of 4"**
- [ ] Shows: **"Answered: 0/5 questions"**
- [ ] **NEW 5 questions appear** (different from Session 1!)
- [ ] **Blue banner** at top shows:
  ```
  Previous Session Analysis
  [AI recommendation from Session 1]
  Next difficulty: MEDIUM
  ```
- [ ] Submit button is DISABLED again

**This proves the session-based system is working!**

---

## Step 9: Check Backend Logs

### Switch to Backend Terminal Window
Look for logs like this:

```
🎯 SESSION-BASED TEST: Student student1 started "Algebra Session Test"
   📊 Config: 20 questions, 5 per session
   🤖 Generating first batch of 5 questions...
✅ Session 1/4 ready - 5 questions generated

📊 SESSION SUBMISSION: Session 1
   📝 Answers received: 5
   😊 Emotion data: Yes
🤖 AI ANALYSIS:
   ✓ Accuracy: 80%
   ✓ Avg Stress: 3.2 (Emotion: 0.35)
   ✓ Avg Time: 28.5s
   → Excellent performance! Increasing difficulty.
   → Next Difficulty: medium
🤖 Generating Session 2 - 5 questions...
   Using AI analysis from previous session:
   - Accuracy: 80%
   - Difficulty: medium
   - Emotional State: Calm
✅ Session 2 ready - 5 personalized questions
```

**Verify:**
- [ ] Logs show "SESSION-BASED TEST"
- [ ] Logs show "SESSION SUBMISSION"
- [ ] Logs show "AI ANALYSIS" with metrics
- [ ] Logs show difficulty decision
- [ ] Logs show "Generating Session 2"

---

## Step 10: Complete the Test

### 10.1 Continue Through All Sessions
1. Answer all 5 questions in Session 2
2. Submit → See AI analysis popup
3. Session 3 loads (5 new questions)
4. Answer all 5 questions in Session 3
5. Submit → See AI analysis popup
6. Session 4 loads (5 new questions - final session)
7. Answer all 5 questions in Session 4
8. Submit → Button says **"✓ Complete Test"**

### 10.2 Results Page
After final submission:
- [ ] Redirects to **Results Page**
- [ ] Shows: "🎉 Test Completed!" with checkmark
- [ ] Shows: **Accuracy percentage** (e.g., 75%)
- [ ] Shows: **Average Stress Level**
- [ ] Shows: **Total Questions: 20**
- [ ] Shows: **Line graph** with stress over all 20 questions
- [ ] Can see stress fluctuations

---

## Step 11: Verify in MongoDB

### 11.1 Open MongoDB Compass
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `ailearn` (or your database name)

### 11.2 Check Attempts Collection
1. Open `attempts` collection
2. Find your latest attempt (sort by `_id` descending)
3. Click to expand

**Look for these NEW fields:**

```javascript
{
  attemptId: "attempt_xxx",
  studentId: "student1",
  testId: "test_xxx",
  
  // ✅ NEW FIELDS:
  currentSession: 4,           
  currentSessionQuestions: [], 
  sessionAnalytics: [          
    {
      sessionNumber: 1,
      accuracy: 0.8,
      avgStress: 3.2,
      avgEmotionStress: 0.35,
      recommendation: "Excellent performance! Increasing difficulty.",
      nextDifficulty: "medium"
    },
    // ... 3 more session objects
  ],
  
  // All 20 answers:
  results: [
    { questionId: "q1", isCorrect: true, stress: 3, stressLevel: 0.3, dominantEmotion: "neutral" },
    // ... 19 more
  ],
  
  completed: true
}
```

**Verify:**
- [ ] `currentSession` field exists (value: 4)
- [ ] `currentSessionQuestions` field exists (empty array)
- [ ] `sessionAnalytics` array has **4 objects** (one per session)
- [ ] Each session has: accuracy, recommendation, nextDifficulty
- [ ] `results` array has **20 objects** (all answers)

---

## ✅ SUCCESS CHECKLIST

If you can check ALL these boxes, the system works perfectly:

### Critical (Must Work):
- [ ] 5 questions display at once (not 1!)
- [ ] Can answer questions in any order
- [ ] Visual feedback (green borders, checkmarks)
- [ ] AI analysis popup after each session
- [ ] Next session loads with new questions
- [ ] Difficulty adapts (increases/decreases based on performance)
- [ ] Test completes after all 4 sessions
- [ ] Results page displays
- [ ] MongoDB has sessionAnalytics array

### Important (Should Work):
- [ ] Backend logs show session details
- [ ] Webcam emotion tracking active
- [ ] Blue banner shows previous analysis
- [ ] Progress tracking works
- [ ] No console errors

---

## 🐛 Common Problems & Solutions

### Problem 1: Only 1 question shows
**Fix:**
1. Hard refresh: Ctrl+Shift+R
2. Check frontend terminal for errors
3. Verify Student.tsx was updated

### Problem 2: No AI popup
**Fix:**
1. Check backend terminal for errors
2. Verify `.env` has `GEMINI_API_KEY`
3. Check internet connection

### Problem 3: Services won't start
**Fix:**
```bash
# Kill existing processes
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Restart services
cd scripts
start-all.bat
```

### Problem 4: MongoDB errors
**Fix:**
```bash
# Start MongoDB service
net start MongoDB
```

---

## 📊 Test Results

**Date**: _______________  
**Tester**: _______________

**Results**:
- [ ] ✅ All tests PASSED - System working perfectly!
- [ ] ⚠️ Most tests passed - Minor issues
- [ ] ❌ Major issues - Needs fixing

**Issues Found**:
1. ________________________________
2. ________________________________
3. ________________________________

**Screenshots**:
- [ ] Session 1 (5 questions visible)
- [ ] AI analysis popup
- [ ] Session 2 with blue banner
- [ ] Results page
- [ ] MongoDB sessionAnalytics

---

## 🎉 Next Steps

If tests pass:
1. ✅ Mark Phase 7 as complete in todo list
2. 📝 Document any minor issues
3. 🚀 Proceed to Phase 8: Push to GitHub

If tests fail:
1. 📋 Document all failing tests
2. 🐛 Debug and fix issues
3. 🔄 Retest until passing

---

**Need Help?**
- Check `TESTING_CHECKLIST.md` for detailed tests
- Check `TESTING_SESSION_BASED_SYSTEM.md` for troubleshooting
- Check backend logs for error messages
- Check browser console (F12) for errors

**Good luck with testing!** 🚀
