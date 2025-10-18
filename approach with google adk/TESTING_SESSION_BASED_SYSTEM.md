# 🧪 Session-Based Testing Guide

## ✅ What's Ready

### Backend ✅
- Session-based endpoints implemented
- POST `/tests/start-session` - Generate first batch
- POST `/tests/submit-session` - Submit batch + AI analysis
- AI recommendation engine
- Personalized question generation

### Frontend ✅
- Session UI updated
- Batch display (5 questions at once)
- Answer collection (any order)
- Session submission
- AI feedback display

---

## 🚀 Quick Start

### 1. Start All Services

#### Option A: Use Start Scripts
```bash
# From project root
cd scripts
start-all.bat
```

This will start:
1. Python emotion service (port 5001)
2. Backend API (port 5000)
3. Frontend React app (port 3000)

#### Option B: Manual Start

**Terminal 1 - Python Emotion Service:**
```bash
cd python-emotion-service
python app.py
```

**Terminal 2 - Backend:**
```bash
cd backend-webapp
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend-webapp
npm start
```

---

## 🧪 Testing Steps

### Step 1: Login as Teacher
1. Open browser: `http://localhost:3000`
2. Click "Teacher Login"
3. Username: `teacher1`
4. Password: `password123`

### Step 2: Create Class
1. Click "+ Create Class"
2. Name: "Test Class"
3. Description: "Session-based testing"
4. Note the **6-character class code** (e.g., `ABC123`)

### Step 3: Create Test
1. Select "Test Class"
2. Click "+ Create Test"
3. Fill in:
   - Test Name: "Math Test"
   - Topic: "Algebra"
   - Number of Questions: **20**
   - Questions Per Session: **5** (This is NEW!)
4. Click "Create Test"

### Step 4: Login as Student
1. **Open new incognito window** (to test simultaneously)
2. Go to: `http://localhost:3000`
3. Click "Student Login"
4. Username: `student1`
5. Password: `password123`

### Step 5: Join Class
1. Click "+ Join Class"
2. Enter class code: `ABC123`
3. Click "Join Class"
4. Should see "Test Class" appear

### Step 6: Start Session-Based Test
1. Select "Test Class"
2. Click "Start Test" on "Math Test"

**What should happen:**
```
✅ Session 1/4 displays
✅ 5 questions appear at once (not one at a time!)
✅ All questions visible on page
✅ Webcam activates (emotion tracking)
✅ "Submit & Continue" button disabled
```

### Step 7: Answer Session 1
1. Click option for Question 1
   - ✅ Green border should appear
   - ✅ Checkmark icon shows "Answered"
2. Click option for Question 2
   - ✅ Same visual feedback
3. Continue for all 5 questions
4. When all 5 answered:
   - ✅ Submit button becomes enabled
   - ✅ Shows "✓ All questions answered!"

### Step 8: Submit Session 1
1. Click "Submit & Continue"
2. **Wait for AI analysis** (1-2 seconds)

**Expected popup:**
```
Session 1 Complete!

✓ Accuracy: 80%
✓ Correct: 4/5

Excellent performance! Increasing difficulty.

Next difficulty: MEDIUM
```

**What should happen next:**
```
✅ Popup closes
✅ Session 2/4 displays
✅ NEW 5 questions appear (MEDIUM difficulty)
✅ Blue banner shows: "Previous Session Analysis"
✅ Questions are personalized based on Session 1 performance
```

### Step 9: Continue Testing
1. Answer Session 2 questions (5 MEDIUM questions)
2. Submit Session 2
3. Get AI analysis (may increase to HARD or decrease to EASY)
4. Continue for Session 3 and 4

### Step 10: Complete Test
1. Answer final session (Session 4)
2. Click "✓ Complete Test"
3. **Results page** should show:
   - Final accuracy percentage
   - Average stress level
   - Stress chart (line graph)
   - Total: 20 questions answered

---

## 🔍 What to Verify

### Backend Logs (Terminal 2)
Should see:
```
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

### Frontend Console (Browser DevTools)
Should see:
```
🎯 Starting session-based test: test_xxx
✅ Session started: { session: 1, totalSessions: 4, questions: 5 }
✓ Question answered: { questionId: 'q1', isCorrect: true, ... }
📸 Emotion snapshot saved
📊 Submitting session: { sessionNumber: 1, answersCount: 5, ... }
🤖 AI Analysis: { accuracy: 0.8, recommendation: "Excellent!", ... }
📝 Loading next session: { sessionNumber: 2, questions: 5 }
```

### Database (MongoDB Compass)
Check `attempts` collection:
```javascript
{
  attemptId: "attempt_xxx",
  testId: "test_xxx",
  studentId: "student1",
  currentSession: 2,           // ✅ NEW: Session tracking
  currentSessionQuestions: [   // ✅ NEW: Current batch
    { id: "q6", text: "...", ... },
    // ... 4 more
  ],
  sessionAnalytics: [          // ✅ NEW: Analytics per session
    {
      sessionNumber: 1,
      accuracy: 0.8,
      avgStress: 3.2,
      recommendation: "Excellent!",
      nextDifficulty: "medium"
    }
  ],
  results: [                   // All 5 answers from Session 1
    { questionId: "q1", isCorrect: true, ... },
    // ... 4 more
  ]
}
```

---

## 🎯 AI Adaptation Examples

### Example 1: Excellent Performance
```
Session 1: 5 EASY questions
Student: 5/5 correct, low stress
AI: "Excellent! Increasing difficulty"
Session 2: 5 MEDIUM questions ⬆️
```

### Example 2: Struggling
```
Session 1: 5 EASY questions
Student: 4/5 correct, low stress
AI: "Great! Increasing difficulty"
Session 2: 5 MEDIUM questions
Student: 2/5 correct, high stress ⚠️
AI: "Struggling detected. Reducing difficulty"
Session 3: 5 EASY questions ⬇️
```

### Example 3: Steady Progress
```
Session 1: 5 EASY questions
Student: 3/5 correct, medium stress
AI: "Good progress. Maintaining difficulty"
Session 2: 5 EASY questions ➡️
```

---

## 🐛 Troubleshooting

### Issue 1: Only 1 question showing
**Problem**: Frontend not updated or backend returning old format
**Solution**: 
1. Refresh browser (Ctrl+R)
2. Check backend endpoint: `POST /tests/start-session` (not `/tests/start`)
3. Verify frontend uses `sessionQuestions` state

### Issue 2: Submit button always disabled
**Problem**: Not all questions answered
**Solution**: Click an option for ALL 5 questions
**Check**: Browser console should show: `totalAnswered: 5, totalQuestions: 5`

### Issue 3: No AI popup between sessions
**Problem**: Backend not returning sessionAnalysis
**Solution**: 
1. Check backend logs for "🤖 AI ANALYSIS"
2. Verify response includes `sessionAnalysis` object
3. Check frontend alert logic in `submitSession()`

### Issue 4: Questions not personalized
**Problem**: AI generation failing
**Solution**: 
1. Check Gemini API key in backend `.env`
2. Backend logs should show: "Using AI analysis from previous session"
3. Verify `advancedGenerator.generateQuestions()` receives studentData

### Issue 5: Emotion data not collected
**Problem**: Webcam not enabled
**Solution**: 
1. Allow webcam permissions in browser
2. Check EmotionTracker component is rendering
3. Verify Python emotion service running on port 5001

---

## 📊 Success Indicators

### ✅ Backend Working:
- Generates 5 questions per session
- Analyzes accuracy, stress, emotions after each session
- Adjusts difficulty based on comprehensive analysis
- Personalizes next batch using AI

### ✅ Frontend Working:
- Displays all 5 questions at once
- Collects answers in any order
- Visual feedback (green borders, checkmarks)
- Shows AI analysis between sessions
- Smooth transitions between sessions

### ✅ Integration Working:
- Session flow: Start → Answer 5 → Submit → Analyze → Next 5
- Emotion snapshots collected throughout
- Progress tracking (session and overall)
- Final results display correctly

---

## 📝 Test Scenarios

### Scenario 1: Perfect Student
```
Session 1: 5/5 correct, low stress
→ AI increases to MEDIUM
Session 2: 5/5 correct, low stress
→ AI increases to HARD
Session 3: 4/5 correct, medium stress
→ AI maintains HARD
Session 4: 3/5 correct, medium stress
→ Test complete: 17/20 (85%)
```

### Scenario 2: Struggling Student
```
Session 1: 2/5 correct, high stress
→ AI maintains EASY
Session 2: 1/5 correct, very high stress
→ AI maintains EASY (can't go lower)
Session 3: 3/5 correct, medium stress
→ AI maintains EASY
Session 4: 4/5 correct, low stress
→ Test complete: 10/20 (50%)
```

### Scenario 3: Recovering Student
```
Session 1: 4/5 correct, low stress
→ AI increases to MEDIUM
Session 2: 1/5 correct, high stress
→ AI decreases to EASY
Session 3: 5/5 correct, low stress
→ AI increases back to MEDIUM
Session 4: 4/5 correct, low stress
→ Test complete: 14/20 (70%)
```

---

## 🎥 Demo Walkthrough

### Recommended Demo Flow:
1. **Setup** (2 min):
   - Start all services
   - Create class as teacher
   - Login as student

2. **Session 1** (3 min):
   - Show 5 questions displayed together
   - Answer questions (some correct, some wrong)
   - Show webcam/emotion tracking
   - Submit session

3. **AI Analysis** (1 min):
   - Highlight popup with recommendation
   - Show next batch loaded
   - Point out difficulty change

4. **Complete Test** (5 min):
   - Continue through remaining sessions
   - Show adaptive difficulty in action
   - Complete final session
   - Show results page

5. **Backend Review** (2 min):
   - Show MongoDB: sessionAnalytics array
   - Show backend logs: AI decisions
   - Highlight personalization logic

**Total demo time**: ~13 minutes

---

## 📈 Metrics to Track

During testing, monitor:

1. **API Response Times**:
   - `start-session`: Should be < 5s
   - `submit-session`: Should be < 3s

2. **Question Quality**:
   - Are questions relevant to topic?
   - Are difficulties appropriate?
   - Are next questions personalized?

3. **AI Decisions**:
   - Do difficulty changes make sense?
   - Are recommendations accurate?
   - Does personalization work?

4. **User Experience**:
   - Can answer questions in any order?
   - Visual feedback clear?
   - Transitions smooth?
   - Emotion tracking non-intrusive?

---

## ✅ Acceptance Criteria

### Must Work:
- ✅ Batch of 5 questions displays
- ✅ All questions can be answered (any order)
- ✅ Submit entire batch together
- ✅ AI analyzes after each session
- ✅ Next batch personalized based on analysis
- ✅ Difficulty adapts appropriately
- ✅ Test completes after all sessions
- ✅ Results page shows final data

### Should Work:
- ✅ Emotion tracking active
- ✅ Emotion data influences AI decisions
- ✅ Visual indicators (borders, checkmarks)
- ✅ Progress tracking (session + overall)
- ✅ AI recommendations displayed
- ✅ Backend logs detailed information

### Nice to Have:
- Session review before submit
- Undo answer selection
- Timer per session
- Pause/resume functionality

---

**Status**: 🎯 **READY FOR TESTING**

**Next Action**: Run through testing steps above and verify all functionality works as expected! 🚀
