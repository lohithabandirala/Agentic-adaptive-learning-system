# 🧪 Quick Test Guide - FULL ADK Integration

## ✅ What to Verify

### 1. Backend Logs - ADK Function Calling

When you click "Start Test", look for these logs in the **backend terminal**:

```
🤖 FULL ADK AGENT: Generating 5 questions
   Topic: polynomials, Student: [student-id]

🔧 Agent Tool Call: query_student_performance
📥 Arguments: {"studentId": "[id]"}
📊 Querying performance for student: [id]
📤 Tool Result Summary: ✅ Success

🔧 Agent Tool Call: query_emotion_patterns
📥 Arguments: {"studentId": "[id]"}
😊 Querying emotion patterns for student: [id]
📤 Tool Result Summary: ✅ Success

🔧 Agent Tool Call: query_recent_attempts
📥 Arguments: {"studentId": "[id]", "limit": 5}
📝 Querying recent attempts for student: [id]
📤 Tool Result Summary: ✅ Success

✅ Agent completed reasoning
✅ Generated 5 personalized questions using 4 iterations
```

**What This Means:**
- ✅ ADK is querying your database
- ✅ ADK is getting performance history
- ✅ ADK is getting emotion patterns
- ✅ ADK is reasoning using this data

### 2. Questions Generated

After agent completes, you should see:
```
✅ Session 1/2 ready - 5 questions generated
```

**Frontend should show:**
- 5 questions displayed at once
- Webcam for emotion tracking
- Progress indicator (Session 1 of 2)

### 3. During Test - Emotion Tracking

**Python service logs** (Terminal 1):
```
INFO:werkzeug:127.0.0.1 - - [timestamp] "POST /detect-emotion HTTP/1.1" 200 -
```

**Backend logs** (Terminal 2):
```
📊 Emotion tracked: happy (stress: 0.23)
```

**MongoDB - Check `emotiontrackings` collection:**
```json
{
  "studentId": "...",
  "attemptId": "...",
  "emotions": {
    "happy": 45,
    "sad": 10,
    "angry": 5,
    "fear": 8,
    "neutral": 30,
    "surprise": 2,
    "disgust": 0
  },
  "dominantEmotion": "happy",
  "stressLevel": 0.23,
  "questionNumber": 1
}
```

### 4. Session Submission - ADK Analysis

After submitting 5 answers, backend logs:

```
📊 SESSION SUBMISSION: Session 1
   📝 Answers received: 5
   😊 Emotion data: Yes

🤖 Using FULL ADK Agent for session analysis (with emotion + performance data)...

🔧 Agent Tool Call: query_student_performance
📤 Tool Result Summary: ✅ Success

🔧 Agent Tool Call: query_emotion_patterns
📥 Arguments: {"studentId": "[id]", "attemptId": "[id]"}
📤 Tool Result Summary: ✅ Success

✅ Analysis complete
✅ ADK Analysis: Student performed well on basics, needs practice on advanced topics
```

**Frontend should show:**
- ✅ AI analysis popup with recommendations
- ✅ Accuracy percentage
- ✅ Next difficulty level
- ✅ Specific feedback

### 5. Next Session Generation

Backend logs:
```
🤖 Generating Session 2 with FULL ADK Agent (personalized)...
   Using analysis: Accuracy 80%, Difficulty: medium
   Emotional state: Stress 0.35, Emotion: happy

🔧 Agent Tool Call: query_student_performance
🔧 Agent Tool Call: query_emotion_patterns
🔧 Agent Tool Call: query_recent_attempts

✅ Generated 5 personalized questions using 4 iterations
✅ Session 2/2 ready - 5 personalized questions
```

**Frontend should show:**
- ✅ Blue banner with previous session analysis
- ✅ New 5 questions (different from session 1)
- ✅ Appropriate difficulty based on performance

### 6. MongoDB Verification

After completing test, check MongoDB collections:

**`attempts` collection:**
```json
{
  "attemptId": "attempt_xxx",
  "studentId": "student_xxx",
  "testId": "test_xxx",
  "currentSession": 2,
  "sessionAnalytics": [
    {
      "sessionNumber": 1,
      "accuracy": 0.8,
      "recommendation": "Good progress...",
      "nextDifficulty": "medium"
    },
    {
      "sessionNumber": 2,
      "accuracy": 0.6,
      "recommendation": "Practice more...",
      "nextDifficulty": "easy"
    }
  ],
  "results": [ /* 10 question results */ ],
  "completed": true
}
```

**`emotiontrackings` collection:**
```json
[
  {
    "studentId": "...",
    "attemptId": "...",
    "questionNumber": 1,
    "dominantEmotion": "happy",
    "stressLevel": 0.23
  },
  {
    "studentId": "...",
    "attemptId": "...",
    "questionNumber": 2,
    "dominantEmotion": "neutral",
    "stressLevel": 0.15
  },
  // ... 10 total records
]
```

## 🚨 Common Issues

### Issue 1: No Agent Function Calls
**Symptom:** Logs don't show "Agent Tool Call"
**Cause:** Not using `generateQuestionsWithFullADK()`
**Fix:** Check `routes/tests.ts` uses `generateQuestionsWithFullADK` not `generateQuestionsWithADK`

### Issue 2: Empty Database Queries
**Symptom:** "No previous attempts found"
**Cause:** New student, no historical data
**Expected:** This is normal for first test! Agent will still work.

### Issue 3: No Emotion Data
**Symptom:** "No emotion data available"
**Cause:** 
- Webcam not enabled
- Python service not running
- EmotionTracker not sending data
**Fix:** 
- Check Python service on port 5001
- Allow webcam permissions in browser
- Check frontend EmotionTracker component

### Issue 4: Questions Not Personalized
**Symptom:** All questions same difficulty
**Cause:** Agent not receiving data or API error
**Check:** 
- Backend logs for "Tool Result Summary: ✅ Success"
- MongoDB has data in attempts and emotiontrackings collections

## ✅ Success Checklist

After one complete test, verify:

- [ ] Backend shows ADK function calling (3 tool calls per generation)
- [ ] MongoDB has attempt record with sessionAnalytics
- [ ] MongoDB has 10 emotion tracking records (one per question)
- [ ] Frontend showed AI analysis popup between sessions
- [ ] Questions in session 2 different from session 1
- [ ] Difficulty adapted based on performance
- [ ] Webcam captured emotions during test

## 🎯 Expected Agent Behavior Examples

### Example 1: High Performance
**Session 1 Results:**
- Accuracy: 100%
- Stress: 0.15 (low)
- Dominant emotion: Happy

**Agent Decision:**
```
"Student performing excellently with low stress. 
Safe to increase difficulty to build skills.
Next batch: 5 HARD questions."
```

### Example 2: Struggling Student
**Session 1 Results:**
- Accuracy: 40%
- Stress: 0.75 (high)
- Dominant emotion: Fear

**Agent Decision:**
```
"Student struggling with high stress and fear.
Need to rebuild confidence with easier material.
Next batch: 5 EASY questions on basics."
```

### Example 3: Moderate Progress
**Session 1 Results:**
- Accuracy: 70%
- Stress: 0.35 (moderate)
- Dominant emotion: Neutral

**Agent Decision:**
```
"Decent performance with manageable stress.
Continue with current difficulty level.
Next batch: 5 MEDIUM questions, slightly easier than session 1."
```

---

## 🎉 If All Checks Pass:

**CONGRATULATIONS!** 🎊

You have successfully integrated:
- ✅ Google ADK Agent with function calling
- ✅ Database querying (performance + emotions)
- ✅ Emotion detection from webcam
- ✅ Personalized question generation
- ✅ Adaptive session analysis
- ✅ Full agentic learning system

**Your AI agent is now making intelligent, data-driven decisions to personalize each student's learning experience!** 🤖🧠✨
