# ADK Agent Demo - What Judges Will See

## 🎯 Real Terminal Output (Actual Logs)

When you run `JUDGE_DEMO.bat` or `demo-live.bat`, judges will see:

---

### **1. Student Starts Test:**

```
🎯 SESSION-BASED TEST: Student student_test started "polynomials"
   📊 Config: 10 questions, 5 per session
   🤖 Generating first batch with FULL ADK Agent (with data querying)...

🤖 FULL ADK AGENT: Generating 5 questions
   Topic: polynomials basics, Student: 68f2d7288240fded57c71a25
📊 API calls today: 1/45
```

**⭐ Point this out:** "The system is using Google's ADK Agent framework"

---

### **2. Agent Reasoning (Multi-step Process):**

```
🔄 Agent Iteration 1: Querying data...

🔧 Agent Tool Call: query_student_performance
📥 Arguments: {
  "studentId": "68f2d7288240fded57c71a25"
}
📊 Querying performance for student: 68f2d7288240fded57c71a25
📤 Tool Result Summary: ✅ Success

🔧 Agent Tool Call: query_emotion_patterns
📥 Arguments: {
  "attemptId": "attempt_1760764041409_g0exqsapv",
  "studentId": "68f2d7288240fded57c71a25"
}
😊 Querying emotion patterns for student: 68f2d7288240fded57c71a25
📤 Tool Result Summary: ✅ Success

🔧 Agent Tool Call: query_recent_attempts
📥 Arguments: {
  "studentId": "68f2d7288240fded57c71a25"
}
📝 Querying recent attempts for student: 68f2d7288240fded57c71a25
📤 Tool Result Summary: ✅ Success

✅ Agent completed reasoning
```

**⭐ Point this out:** "The AI agent is making intelligent decisions about what data it needs. It's querying past performance, emotions, and recent attempts - just like ChatGPT with function calling!"

---

### **3. Questions Generated:**

```
📄 Agent Response (first 300 chars): ```json
[
  {
    "question": "What is the degree of the polynomial 3x^2 + 5x - 7?",
    "options": ["0", "1", "2", "3"],
    "correctAnswer": "2",
    "explanation": "The degree of a polynomial is the highest power...",
    "difficulty": "easy",
    "topic": "polynomials basics"
  },
  ...
]
```

✅ Generated 5 personalized questions using 2 iterations
💾 AI Analysis saved: 68f3209272cf7376147229e6
✅ Session 1/2 ready - 5 questions generated
```

**⭐ Point this out:** "Based on the student data, the AI generated 5 personalized questions with explanations"

---

### **4. Student Submits Session:**

```
📊 SESSION SUBMISSION: Session 1
   📝 Answers received: 5
   😊 Emotion data: Yes
🤖 Using FULL ADK Agent for session analysis (with emotion + performance data)...

🤖 FULL ADK AGENT: Analyzing session performance
   Student: 68f2d7288240fded57c71a25, Questions: 5
📊 API calls today: 2/45

🔄 Analysis Iteration 1: Querying data...

🔧 Agent Tool Call: query_student_performance
📤 Tool Result Summary: ✅ Success

🔧 Agent Tool Call: query_emotion_patterns
📤 Tool Result Summary: ✅ Success

✅ Agent completed reasoning
```

**⭐ Point this out:** "After each session, the agent analyzes both academic performance AND emotions"

---

### **5. AI Analysis Result:**

```
🤖 AI ANALYSIS:
   ✓ Accuracy: 80%
   ✓ Avg Stress: 3.8 (Emotion: 0.25)
   ✓ Avg Time: 13.2s
   → Good progress. Maintaining current difficulty.
   → Next Difficulty: medium
```

**⭐ Point this out:** "The system combines test scores with real-time stress levels detected from the camera"

---

### **6. Next Session Generated:**

```
🤖 Generating Session 2 with FULL ADK Agent (personalized)...
   Using analysis: Accuracy 80%, Difficulty: medium
   Emotional state: Stress 0.25, Emotion: neutral

🤖 FULL ADK AGENT: Generating 5 questions
   Topic: polynomials basics, Student: 68f2d7288240fded57c71a25
📊 API calls today: 3/45
```

**⭐ Point this out:** "Notice it's now generating MEDIUM questions because the student did well (80% accuracy)"

---

### **7. Emotion Detection (Parallel Terminal):**

```
INFO:werkzeug:127.0.0.1 - - [18/Oct/2025 11:16:23] "POST /detect-emotion HTTP/1.1" 200 -
😊 Detected emotion: happy (confidence: 87.3%)
📊 Stress level: 0.25 (25.3%)
```

**⭐ Point this out:** "Python AI service using DeepFace for real-time emotion detection"

---

## 🎬 Demo Flow Summary

### **Minute 0:00 - Start Demo**
```bash
JUDGE_DEMO.bat
```
Shows initialization and setup

### **Minute 0:30 - Student Starts Test**
- Browser: Click "Start Test"
- Terminal shows: ADK Agent starting, querying data

### **Minute 1:00 - Answer Questions**
- Browser: Answer 2-3 questions
- Terminal shows: Emotion detection logs
- Point to: Webcam in bottom-right

### **Minute 2:00 - Submit Session**
- Browser: Click "Next Session"
- Terminal shows: AI Analysis with emotion data

### **Minute 2:30 - Show Results**
- Browser: View results page
- Point to: Emotion timeline graph
- Terminal shows: Next session with adjusted difficulty

---

## 📸 Screenshots to Take

1. **ADK Agent Starting** (Terminal)
2. **Agent Iterations** (Terminal - showing tool calls)
3. **Generated Questions JSON** (Terminal)
4. **Test Interface** (Browser - with webcam)
5. **Emotion Detection** (Browser - bottom-right corner)
6. **AI Analysis** (Terminal - showing accuracy + stress)
7. **Results Page** (Browser - emotion graph)

---

## 🎤 What to Say

### **Opening (10 seconds):**
```
"Our platform uses Google's ADK framework to create an AI agent 
that generates personalized questions in real-time."
```

### **During Test (30 seconds):**
```
"Watch the terminal. The agent is querying our database to understand 
this student's performance history and current emotional state from 
the camera. Based on this analysis, it generates personalized questions."
```

### **After Session (20 seconds):**
```
"The agent analyzes both academic performance—80% accuracy—and 
emotional state—25% stress level. Then it adjusts the difficulty 
to medium for the next session."
```

### **Closing (10 seconds):**
```
"This helps teachers identify struggling students early by combining 
test scores with emotion detection."
```

---

## ✅ Pre-Demo Checklist

- [ ] Backend restarted with new credentials
- [ ] Frontend restarted with emotion fixes
- [ ] Python service running
- [ ] `JUDGE_DEMO.bat` tested
- [ ] Demo student account ready
- [ ] Browser at localhost:5173
- [ ] Terminal visible to judges
- [ ] Sound bites memorized

---

**You're ready to impress the judges! 🚀**
