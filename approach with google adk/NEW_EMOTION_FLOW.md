# 🔄 UPDATED EMOTION + ADK AGENT FLOW

## ✅ NEW ARCHITECTURE: Question-First with Parallel Emotion Detection

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Generate FIRST Question Set (Based on Available Data)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    🎯 ADK Agent generates 5 questions
    📊 Based on: Student history, topic mastery, past performance
    ⚠️  NO emotion data yet (first time)
    
    Question Set 1:
    - Question 1: easy (Cell Biology)
    - Question 2: medium (Cell Biology)
    - Question 3: hard (Cell Biology)
    - Question 4: medium (Genetics)
    - Question 5: easy (Genetics)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Display Question 1 + Start Timer + Start Emotion        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    📺 Question displayed to user
    ⏱️  Timer starts (e.g., 60 seconds)
    📹 Webcam emotion detection starts SIMULTANEOUSLY
    
    Parallel processes:
    ┌─────────────────┐         ┌─────────────────┐
    │   User reads    │         │  OpenCV captures│
    │   and thinks    │         │  facial emotions│
    │   about answer  │         │  every frame    │
    └─────────────────┘         └─────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: User Submits Answer → Stop Timer + Stop Emotion         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    ✅ User clicks submit
    ⏱️  Timer stops → time_taken = 45 seconds
    📹 Emotion detection stops → emotion_data collected
    
    Collected Data:
    {
      "answer": "A",
      "timeTaken": 45,
      "emotionDuringQuestion": {
        "startEmotion": "neutral",
        "endEmotion": "focused",
        "averageStress": 2.8,
        "emotionChanges": ["neutral", "confused", "focused"],
        "peakStress": 4,
        "emotionalStability": "moderate"
      }
    }
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Repeat for Questions 2-5 (Same Question Set)            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    Question 2 displayed → emotion detection → submit → save
    Question 3 displayed → emotion detection → submit → save
    Question 4 displayed → emotion detection → submit → save
    Question 5 displayed → emotion detection → submit → save
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: After 5 Questions → ADK Agent Analyzes ALL Data         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    🤖 ADK Agent Reasoning:
    "Student answered 3/5 correctly (60% accuracy)
     Stress increased from 2 to 4 on hard questions
     Struggled with Genetics (0/2 correct)
     Strong in Cell Biology (3/3 correct)
     
     NEXT SET:
     - Focus on Genetics (weak area)
     - Start with medium difficulty
     - Mix Cell Biology for confidence"
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Generate NEXT Question Set Based on Analytics           │
└─────────────────────────────────────────────────────────────────┘
```

This creates a **batch adaptation** system where emotions are tracked during question-solving, and the agent adapts every 5 questions!

**Would you like me to implement this new flow?**
