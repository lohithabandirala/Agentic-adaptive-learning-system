# 🎯 Real-Time Adaptive Assessment System

## Overview

This is an **enhanced version** of the integrated emotion assessment that provides:
- ✅ **One question at a time** (not all at once)
- ✅ **Emotion detection before each question**
- ✅ **Real-time adaptation** based on current stress level
- ✅ **Interactive answering** with immediate feedback
- ✅ **Progressive difficulty** adjustment

---

## 🔄 How It Works

### Workflow for Each Question:

```
1. 👀 Emotion Detection (10 seconds)
   ↓
2. 📊 Stress Level Calculation
   ↓
3. 🤖 AI Generates Adaptive Question
   ↓
4. ❓ Question Displayed
   ↓
5. ⌨️ Student Answers
   ↓
6. ✅ Immediate Feedback
   ↓
7. 🔁 Repeat for next question
```

### Key Features:

- **Continuous Monitoring**: Emotions are analyzed fresh for each question
- **Adaptive Difficulty**: If stress increases, questions get easier
- **Immediate Feedback**: Know if you're correct right away
- **Progress Tracking**: See how emotions affected your performance

---

## 🚀 How to Run

### Prerequisites:
1. AI Service must be running:
   ```bash
   cd "ai service"
   npm start
   ```

2. Python dependencies installed:
   ```bash
   pip install -r integrated_requirements.txt
   ```

### Run the Assessment:

```bash
python realtime_adaptive_assessment.py
```

### During Assessment:

1. **Enter topic** (e.g., "Mathematics", "Science", "Programming")
2. **Enter student details** (or press Enter for defaults)
3. **Specify number of questions** (default: 5)

For each question:
- 📹 **Camera opens** - Look at it for 10 seconds
- 😊 **Emotions analyzed** - Your stress level is calculated
- 🤖 **Question generated** - Adapted to your emotional state
- ⌨️ **Answer the question** - Type your response
- ✅ **Get feedback** - See if you're correct with explanation
- **Press SPACE** anytime during emotion detection to skip to answering

---

## 📊 Example Session

```
============================================================
REAL-TIME ADAPTIVE ASSESSMENT SYSTEM
============================================================

📚 Enter the topic: Python Programming
👤 Student ID: student_123
📊 Grade: 10
❓ Number of questions: 3

============================================================
QUESTION 1 OF 3
============================================================

👀 Analyzing your emotions for 10 seconds...
[Camera opens - shows your face with emotion label]

📊 Your emotional state:
   Emotion: happy
   Stress: 2/5

📡 Requesting Question #1 from AI...

============================================================
QUESTION #1
============================================================
📚 Topic: Python Programming
🎯 Difficulty: 3/5
🧠 Bloom Level: Apply
📝 Type: MCQ

❓ What will be the output of: print(type([]))

Options:
  1. <class 'tuple'>
  2. <class 'list'>
  3. <class 'dict'>
  4. <class 'set'>

Enter your answer (1-4): 2

============================================================
📊 FEEDBACK
============================================================
✅ Correct! Well done!

📖 Explanation:
   The type() function returns the type of an object. 
   [] creates an empty list, so type([]) returns <class 'list'>
============================================================

⏸️  Take a short break. Next question in 3 seconds...

============================================================
QUESTION 2 OF 3
============================================================
[Process repeats...]
```

---

## 📈 Adaptation Logic

### How Questions Adapt:

| Student State | Stress Level | Question Difficulty | Question Type |
|---------------|--------------|---------------------|---------------|
| 😊 Happy, Calm | 1-2 | 3-5 (Moderate-Hard) | Challenging, Problem-solving |
| 😐 Neutral | 3 | 2-3 (Easy-Moderate) | Straightforward |
| 😰 Anxious | 4-5 | 1-2 (Very Easy) | Confidence-building |

### Example Progression:

```
Question 1: Happy (Stress 2) → Difficulty 4 → Correct ✅
Question 2: Neutral (Stress 3) → Difficulty 3 → Correct ✅
Question 3: Stressed (Stress 4) → Difficulty 2 → Incorrect ❌
Question 4: Stressed (Stress 5) → Difficulty 1 → Correct ✅
Question 5: Happy (Stress 2) → Difficulty 3 → Correct ✅
```

---

## 🎯 Output Files

### Generated File Structure:

**`realtime_assessment_YYYYMMDD_HHMMSS.json`**

```json
{
  "topic": "Python Programming",
  "student_id": "student_123",
  "grade": "10",
  "start_time": "2025-10-17T16:30:00",
  "end_time": "2025-10-17T16:45:00",
  "total_questions": 5,
  "correct_answers": 4,
  "score_percentage": 80.0,
  "questions_and_answers": [
    {
      "question_number": 1,
      "emotion_data": {
        "overall_dominant_emotion": "happy",
        "stress_level": 2,
        "dominant_emotion_percentages": {...}
      },
      "question": {
        "questionText": "...",
        "difficulty": 3,
        "options": [...],
        "correctAnswer": "..."
      },
      "student_answer": {
        "answer": "...",
        "timestamp": "..."
      },
      "is_correct": true
    }
  ]
}
```

---

## 🎮 Controls

### During Emotion Detection:
- **SPACE** - Skip detection, ready to answer now
- **Q** - Skip detection, ready to answer now

### During Answer Input:
- **Type answer** - For MCQ, enter number (1-4)
- **Type answer** - For text questions, enter your response

---

## 📊 Final Summary

At the end, you'll see:

```
============================================================
🎉 ASSESSMENT COMPLETE!
============================================================
📊 Final Score: 4/5 (80.0%)
✅ Correct: 4
❌ Incorrect: 1
============================================================

📈 EMOTION TRENDS THROUGHOUT ASSESSMENT:
============================================================
Q1: Happy (Stress: 2/5) → Difficulty: 3/5 ✅
Q2: Neutral (Stress: 3/5) → Difficulty: 2/5 ✅
Q3: Fear (Stress: 5/5) → Difficulty: 1/5 ✅
Q4: Sad (Stress: 4/5) → Difficulty: 1/5 ❌
Q5: Happy (Stress: 2/5) → Difficulty: 3/5 ✅
============================================================
```

---

## 🆚 Comparison with Original Integration

| Feature | Original | Real-Time |
|---------|----------|-----------|
| Emotion Detection | Once (20 sec) | Per question (10 sec) |
| Question Generation | All at once | One at a time |
| Adaptation | Based on initial state | Based on current state |
| Feedback | None | Immediate |
| Interaction | Passive | Active |
| Use Case | Quick assessment | Full adaptive test |

---

## 🎓 Use Cases

### 1. **Real Exams**
- Detect test anxiety during actual tests
- Adjust difficulty to reduce stress
- Improve student performance

### 2. **Practice Sessions**
- Build confidence progressively
- Identify stress triggers
- Track emotional learning patterns

### 3. **Tutoring**
- Personalized one-on-one sessions
- Adjust teaching pace based on emotions
- Maximize learning effectiveness

### 4. **Research**
- Study emotion-performance correlation
- Analyze stress patterns during learning
- Validate adaptive learning theories

---

## 🔧 Configuration

### Modify These Variables:

```python
# In realtime_adaptive_assessment.py

EMOTION_DETECTION_DURATION = 10  # Seconds per question
TOTAL_QUESTIONS = 5              # Default number of questions
AI_SERVICE_URL = "http://localhost:3000/api/generate-questions-with-emotion"
```

---

## 💡 Tips for Best Results

### For Students:
1. **Good Lighting** - Ensure face is well-lit
2. **Face Camera** - Look directly at camera
3. **Natural Expression** - Don't force emotions
4. **Take Time** - Think before answering
5. **Stay Calm** - System adapts to help you

### For Administrators:
1. **Test Connection** - Verify AI service is running
2. **Check Camera** - Ensure webcam works
3. **Monitor First Run** - Watch initial assessment
4. **Review Data** - Analyze emotion trends
5. **Adjust Settings** - Modify duration/questions as needed

---

## 🚨 Troubleshooting

### "Cannot connect to AI service"
```bash
# Start AI service in separate terminal:
cd "ai service"
npm start
```

### "Camera not found"
- Close other apps using camera
- Check camera permissions
- Try different camera index (change 0 to 1 in code)

### "No emotion detected"
- Improve lighting
- Face camera directly
- Move closer to camera
- Remove glasses/masks

---

## 📞 Support

For issues, check:
1. AI service is running
2. Camera is connected
3. Python packages installed
4. Good lighting conditions

---

**This is the future of adaptive assessment - truly personalized, emotionally intelligent testing!** 🚀🎓
