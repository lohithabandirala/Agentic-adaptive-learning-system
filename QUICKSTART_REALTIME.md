# 🎯 Quick Start - Real-Time Adaptive Assessment

## ⚡ Two Modes Available

### Mode 1: Batch Assessment (Original)
**File:** `integrated_emotion_assessment.py`
- ✅ Single emotion detection (20 seconds)
- ✅ Generate all questions at once
- ✅ Quick assessment
- ⏱️ Time: ~1-2 minutes total

### Mode 2: Real-Time Adaptive Assessment (NEW) ⭐
**File:** `realtime_adaptive_assessment.py`
- ✅ Emotion detection per question (10 seconds each)
- ✅ One question at a time
- ✅ Immediate feedback
- ✅ Dynamic adaptation
- ⏱️ Time: ~2-3 minutes per question

---

## 🚀 Run Real-Time Assessment (Recommended)

### Step 1: Ensure AI Service is Running

Check if running:
```bash
curl http://localhost:3000/api/health
```

If not running, start it:
```bash
cd "ai service"
npm start
```

### Step 2: Run the Assessment

```bash
python realtime_adaptive_assessment.py
```

### Step 3: Follow Prompts

1. **Enter topic** (e.g., "Mathematics", "Science")
2. **Enter student ID** (or press Enter)
3. **Enter grade** (or press Enter)
4. **Enter number of questions** (or press Enter for 5)

### Step 4: For Each Question

1. 📹 **Camera opens** - Look at it for 10 seconds
2. 😊 **Your emotion is analyzed**
3. ❓ **Question appears** - Adapted to your stress level
4. ⌨️ **Type your answer**
5. ✅ **Get immediate feedback**
6. 🔁 **Repeat** for next question

**Press SPACE during emotion detection to skip to answering!**

---

## 📊 Example Run

```bash
PS C:\Users\NARENDAR\Documents\Hackathons\vibethon> python realtime_adaptive_assessment.py

============================================================
REAL-TIME ADAPTIVE ASSESSMENT SYSTEM
Emotion-Based Question Generation
============================================================

📚 Enter the topic for assessment: Science
👤 Enter student ID (press Enter for default): john_123
📊 Enter grade level (press Enter for default '10'): 8
❓ Number of questions (press Enter for default 5): 3

============================================================
📋 ASSESSMENT OVERVIEW
============================================================
Topic: Science
Student ID: john_123
Grade: 8
Total Questions: 3

🎯 How it works:
  1. Your emotions are analyzed before each question
  2. Questions adapt to your stress level in real-time
  3. Answer each question when ready
  4. Get immediate feedback
============================================================

🚀 Press Enter to begin assessment...

============================================================
QUESTION 1 OF 3
============================================================

👀 Analyzing your emotions for 10 seconds...
💡 Look at the camera while you think about the question
============================================================

[Camera window opens showing your face with emotion labels]

📊 Your emotional state:
   Emotion: happy
   Stress: 2/5

📡 Requesting Question #1 from AI...
============================================================
📊 Current Emotional State:
   Dominant Emotion: happy
   Stress Level: 2/5
============================================================

============================================================
QUESTION #1
============================================================
📚 Topic: Science
🎯 Difficulty: 3/5
🧠 Bloom Level: Understand
📝 Type: MCQ
------------------------------------------------------------
❓ What is the process by which plants make their own food?
------------------------------------------------------------

Options:
  1. Respiration
  2. Photosynthesis
  3. Digestion
  4. Transpiration

============================================================

⏰ Take your time to think and answer...

Enter your answer (1-4): 2

============================================================
📊 FEEDBACK
============================================================
✅ Correct! Well done!

📖 Explanation:
   Photosynthesis is the process by which plants convert 
   light energy into chemical energy (glucose) using 
   carbon dioxide and water.
============================================================

⏸️  Take a short break. Next question in 3 seconds...

[Process repeats for questions 2 and 3...]

============================================================
🎉 ASSESSMENT COMPLETE!
============================================================
📊 Final Score: 2/3 (66.67%)
✅ Correct: 2
❌ Incorrect: 1
============================================================

💾 Results saved to: realtime_assessment_20251017_163045.json

============================================================

📈 EMOTION TRENDS THROUGHOUT ASSESSMENT:
============================================================
Q1: Happy (Stress: 2/5) → Difficulty: 3/5 ✅
Q2: Neutral (Stress: 3/5) → Difficulty: 2/5 ✅
Q3: Fear (Stress: 4/5) → Difficulty: 1/5 ❌
============================================================
```

---

## 🎮 Controls During Assessment

### Emotion Detection Phase:
- **SPACE** - Skip to answering immediately
- **Q** - Skip to answering immediately
- **Wait 10 seconds** - Auto-advances to question

### Answering Phase:
- **Type number (1-4)** - For multiple choice
- **Type text** - For open-ended questions
- **Press Enter** - Submit answer

---

## 📊 What You Get

### Console Output:
- Real-time emotion analysis
- Adapted questions
- Immediate feedback
- Final score and trends

### JSON File:
Complete assessment data including:
- Each question with difficulty
- Emotion state for each question
- Student answers
- Correctness
- Timestamps
- Overall performance

---

## 🆚 When to Use Which Mode?

### Use Batch Assessment (`integrated_emotion_assessment.py`) when:
- ❓ Need quick question generation
- 📊 Want overview of topic coverage
- ⏱️ Limited time (1-2 minutes)
- 📋 Generating question bank

### Use Real-Time Assessment (`realtime_adaptive_assessment.py`) when:
- ✅ Conducting actual exam/quiz
- 🎯 Need true adaptive behavior
- 📈 Want emotion tracking per question
- 💯 Need immediate feedback
- 🧪 Testing or tutoring scenario

---

## 🎯 Tips for Success

### Before Starting:
1. ✅ AI service running (`npm start` in ai service folder)
2. ✅ Camera connected and working
3. ✅ Good lighting on your face
4. ✅ Quiet environment

### During Assessment:
1. 😊 Maintain natural expressions
2. 👀 Look at camera during detection
3. 🤔 Think before answering
4. ⌨️ Type carefully
5. 📚 Read feedback to learn

---

## 🚨 Troubleshooting

### AI Service Not Connected
```bash
# Terminal 1: Start AI service
cd "ai service"
npm start

# Terminal 2: Run assessment
python realtime_adaptive_assessment.py
```

### Camera Issues
- Close Zoom, Teams, etc.
- Check Device Manager
- Try different camera (change 0 to 1 in code)

### Emotion Not Detected
- Improve lighting
- Face camera directly
- Remove glasses/mask
- Get closer to camera

---

## 📞 Quick Reference

| Command | Purpose |
|---------|---------|
| `python realtime_adaptive_assessment.py` | Run real-time adaptive assessment |
| `python integrated_emotion_assessment.py` | Run batch assessment |
| `python test_integration.py` | Test without webcam |
| `cd "ai service" && npm start` | Start AI backend |

---

**Ready for a truly adaptive assessment experience? Let's go!** 🚀

```bash
python realtime_adaptive_assessment.py
```
