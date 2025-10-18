# NEW FLOW IMPLEMENTATION - Question Sets with Parallel Emotion Detection

## 🎯 Architecture Overview

The new flow generates questions in **SETS of 5**, tracks emotions **IN PARALLEL** during problem-solving, and adapts **AFTER each set** based on combined analytics.

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  1. GENERATE QUESTION SET (5 Questions)                    │
│     - ADK Agent analyzes student data                      │
│     - Generates 5 questions with varied difficulty         │
│     - All questions prepared before showing to student     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. FOR EACH QUESTION (Q1 to Q5)                           │
│                                                             │
│     a) Display Question + Start Timer                      │
│        ├─ Show question text                               │
│        ├─ Show options (A/B/C/D)                           │
│        └─ Start countdown timer                            │
│                                                             │
│     b) Start Emotion Detection (PARALLEL with timer)       │
│        ├─ Background thread                                │
│        ├─ Capture webcam frames every 2 seconds            │
│        ├─ DeepFace emotion analysis                        │
│        └─ Calculate stress levels                          │
│                                                             │
│     c) User Answers Question                               │
│        └─ Input answer (A/B/C/D)                           │
│                                                             │
│     d) Stop Timer + Emotion Detection                      │
│        ├─ Calculate time spent                             │
│        └─ Get emotion analytics                            │
│                                                             │
│     e) Submit Answer + Emotion Data                        │
│        ├─ Send to backend                                  │
│        ├─ Save to MongoDB                                  │
│        └─ Show feedback                                    │
│                                                             │
│     f) Repeat for next question                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. AFTER 5 QUESTIONS                                       │
│     - ADK Agent analyzes all 5 attempts                    │
│     - Analyzes emotion patterns                            │
│     - Identifies strengths/weaknesses                      │
│     - Calculates next difficulty level                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. GENERATE NEXT QUESTION SET (Adapted)                   │
│     - Agent uses analytics from previous 5 questions       │
│     - Adjusts difficulty based on performance + emotions   │
│     - Generates next 5 questions                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
                        REPEAT
```

---

## 🚀 Implementation Components

### 1. Backend API Endpoint

**File:** `backend/routes/api.js`

**Endpoint:** `POST /api/sessions/questionset/generate`

```javascript
{
  "session_id": "session_123",
  "student_id": "student_456",
  "topic": "Cell Biology",
  "count": 5
}
```

**Response:**
```javascript
{
  "success": true,
  "questionSet": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "A",
      "explanation": "...",
      "difficulty": "easy",
      "topic": "Cell Biology"
    },
    // ... 4 more questions
  ],
  "setNumber": 1,
  "totalQuestions": 5,
  "reasoning": "Agent reasoning here...",
  "adk_agent": true
}
```

---

### 2. ADK Agent Service

**File:** `backend/services/adkAgentService.js`

**Function:** `generateQuestionSetWithAgent(studentId, sessionId, subject, count=5)`

**Features:**
- ✅ Generates 5 questions in one agent session
- ✅ Uses all 6 ADK tools (query performance, emotions, mastery, attempts)
- ✅ Creates varied difficulty levels (easy → medium → hard)
- ✅ Returns full question set with agent reasoning
- ✅ Validates response has exactly 5 questions

---

### 3. Emotion Tracker (Python)

**File:** `python-client/emotion_tracker.py`

**Classes:**

#### `EmotionTracker`
Tracks emotions in **background thread** during question answering.

**Methods:**
- `start()` - Start background emotion tracking
- `stop()` - Stop tracking and return analytics
- `_tracking_loop()` - Background thread (captures + analyzes frames)
- `_calculate_analytics()` - Calculate summary statistics

**Analytics Returned:**
```python
{
  'success': True,
  'duration': 45.2,
  'samples_count': 23,
  'dominant_emotion': 'neutral',
  'emotion_distribution': {'neutral': 15, 'happy': 5, 'fear': 3},
  'average_stress': 0.234,
  'peak_stress': 0.456,
  'min_stress': 0.123,
  'stress_stability': 0.089,
  'timeline': [...]
}
```

#### `QuestionSetTracker`
Tracks emotions across entire question set (5 questions).

**Methods:**
- `start_set()` - Initialize set tracking
- `add_question_analytics(question_num, analytics)` - Add data for one question
- `complete_set()` - Return set-level summary

---

### 4. Python Test Client

**File:** `python-client/test_new_flow.py`

**Class:** `NewFlowTestClient`

**Key Methods:**

1. **`generate_question_set(topic, count=5)`**
   - Calls backend endpoint
   - Gets 5 questions at once
   
2. **`ask_question_with_emotion_tracking(question, question_num)`**
   - Displays question
   - Starts timer + emotion tracker (parallel)
   - Gets user answer
   - Stops timer + tracker
   - Returns answer + emotion analytics

3. **`submit_answer(question, user_answer, emotion_analytics, time_spent)`**
   - Sends answer + emotion data to backend
   - Saves to MongoDB
   - Shows feedback

4. **`run_question_set(topic, set_number)`**
   - Complete flow for 5 questions
   - Generate → Loop → Submit → Summarize

5. **`run_full_test(name, grade, subject, topic, num_sets=2)`**
   - Full test with multiple sets (10 questions)

---

## 🔧 How to Run

### 1. Start Backend
```bash
cd backend
node server.js
```

### 2. Activate Python Environment
```bash
cd python-client
.venv\Scripts\activate
```

### 3. Run New Flow Test
```bash
python test_new_flow.py
```

---

## ✅ What Happens

1. **Student registers** → Creates student record in MongoDB
2. **Session starts** → Creates session record
3. **Agent generates 5 questions** → Based on student data (first time: baseline)
4. **Question 1 displayed** → Timer starts + Emotion tracking starts (parallel background thread)
5. **User answers Q1** → Timer stops + Emotion tracking stops
6. **Submit answer + emotions** → Saved to MongoDB
7. **Repeat for Q2, Q3, Q4, Q5**
8. **After Q5 completed** → Agent analyzes all 5 attempts + emotions
9. **Agent generates next 5 questions** → Adapted based on performance + stress patterns
10. **Repeat for next set**
11. **Session completes** → Agent provides final summary

---

## 📊 Data Flow

```
┌──────────────┐
│   Student    │
│   Answers    │
│   Question   │
└──────┬───────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│   Answer    │   │   Emotion    │
│     +       │   │   Analytics  │
│  Time Spent │   │   (stress,   │
└──────┬──────┘   │   emotions)  │
       │          └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
       ┌────────────────┐
       │   Submit to    │
       │    Backend     │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │   Save to      │
       │   MongoDB      │
       │  - QuestionAttempt
       │  - EmotionTracking
       │  - AIAnalysis
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │  After 5 Q's   │
       │  ADK Agent     │
       │  Analyzes All  │
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │  Generate Next │
       │   5 Questions  │
       │   (Adapted)    │
       └────────────────┘
```

---

## 🔑 Key Differences from Old Flow

| Aspect | Old Flow | NEW Flow |
|--------|----------|----------|
| **Question Generation** | One question at a time | **5 questions at once** |
| **Emotion Timing** | Before question (pre-assessment) | **During answering (parallel)** |
| **Emotion Threading** | Blocking (waits for completion) | **Background thread (non-blocking)** |
| **Adaptation** | After every question | **After every 5 questions (batch)** |
| **User Experience** | Stop → Emotion capture → Question | **Question → Timer + Emotions parallel** |
| **Agent Reasoning** | Per question | **Per question set (more context)** |

---

## 🧪 Testing Checklist

- [ ] Backend server running on port 3000
- [ ] MongoDB connected
- [ ] Student registration works
- [ ] Session starts successfully
- [ ] Question set endpoint returns 5 questions
- [ ] Agent reasoning includes tool calls
- [ ] Questions have varied difficulty
- [ ] Emotion tracker starts in background
- [ ] Webcam opens and captures frames
- [ ] DeepFace analyzes emotions
- [ ] User can answer question while emotions track
- [ ] Emotion tracker stops and returns analytics
- [ ] Answer + emotions submitted together
- [ ] Data saved to MongoDB (QuestionAttempt + EmotionTracking)
- [ ] After 5 questions, agent generates next set
- [ ] Next set difficulty adapts based on performance + emotions
- [ ] Session completes with ADK agent summary

---

## 🎓 Benefits of New Flow

1. **More Natural Emotion Tracking**
   - Captures emotions during actual problem-solving
   - Reflects true cognitive + emotional state
   - Parallel processing doesn't interrupt user

2. **Better Agent Reasoning**
   - More context (5 questions + emotions together)
   - Identifies patterns across multiple questions
   - Smarter adaptation decisions

3. **Improved User Experience**
   - No awkward "wait for emotion capture" before questions
   - Smoother flow (question → answer → next)
   - Background processing feels seamless

4. **Richer Analytics**
   - Stress patterns during problem-solving
   - Emotion changes during question set
   - Correlation between stress and performance

---

## 🔮 Future Enhancements

- [ ] Real-time stress alerts (if stress > 0.7)
- [ ] Adaptive timer based on difficulty
- [ ] Voice input for answers (hands-free)
- [ ] Facial expression feedback ("You seem confused, want a hint?")
- [ ] Multi-modal emotion tracking (voice + face)
- [ ] Gamification (streaks, badges)
- [ ] Teacher dashboard (view student stress patterns)

---

## 📝 Files Modified/Created

### Backend
- ✅ `backend/services/adkAgentService.js` - Added `generateQuestionSetWithAgent()`
- ✅ `backend/routes/api.js` - Added `POST /api/sessions/questionset/generate`

### Python
- ✅ `python-client/emotion_tracker.py` - Created `EmotionTracker` and `QuestionSetTracker`
- ✅ `python-client/test_new_flow.py` - Created `NewFlowTestClient`

### Documentation
- ✅ `docs/NEW_FLOW_IMPLEMENTATION.md` - This file

---

## 🚨 Important Notes

1. **Restart Backend** after code changes
   ```bash
   # Stop current server (Ctrl+C)
   node server.js
   ```

2. **Webcam Required** for emotion tracking
   - Make sure webcam is not used by other apps
   - Grant permission when prompted

3. **Python Dependencies**
   ```bash
   pip install deepface opencv-python tensorflow==2.20.0
   ```

4. **Test with Smaller Sets First**
   - Start with 1 set (5 questions)
   - Verify everything works
   - Then try 2 sets (10 questions)

5. **MongoDB Connection**
   - Ensure MongoDB Atlas is accessible
   - Check `.env` file has correct URI

---

## 🎉 Ready to Test!

Run the complete new flow:

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Python Client
cd python-client
.venv\Scripts\activate
python test_new_flow.py
```

**Expected Output:**
- Student registration ✅
- Session start ✅
- Agent generates 5 questions ✅
- Question 1 displays + timer starts + emotions track ✅
- User answers → Emotions stop → Submit ✅
- Repeat Q2-Q5 ✅
- Agent analyzes all 5 ✅
- Agent generates next 5 (adapted) ✅
- Session completes with summary ✅

---

**Status:** ✅ Implementation Complete - Ready for Testing
