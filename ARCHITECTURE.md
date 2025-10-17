# System Integration Overview

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     INTEGRATED SYSTEM FLOW                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   STUDENT    │
│  (Webcam)    │
└──────┬───────┘
       │ Video Stream
       ▼
┌──────────────────────────────────────┐
│  EMOTION DETECTION                   │
│  (integrated_emotion_assessment.py)  │
│                                      │
│  - OpenCV: Face Detection            │
│  - DeepFace: Emotion Analysis        │
│  - Duration: 20 seconds              │
└──────────────┬───────────────────────┘
               │
               │ Emotion Data
               │ {
               │   dominant_emotion: "happy",
               │   stress_level: 2,
               │   emotion_percentages: {...}
               │ }
               ▼
┌──────────────────────────────────────┐
│  STRESS CALCULATION                  │
│                                      │
│  Algorithm:                          │
│  - Stress = Σ(negative emotions)    │
│  - Positive = Σ(positive emotions)   │
│  - Scale: 1-5                        │
└──────────────┬───────────────────────┘
               │
               │ HTTP POST Request
               │ localhost:3000/api/generate-questions-with-emotion
               ▼
┌──────────────────────────────────────┐
│  AI SERVICE (Node.js + Express)      │
│  (api.js)                            │
│                                      │
│  Port: 3000                          │
│  Endpoints:                          │
│  - /api/generate-questions-with-     │
│    emotion                           │
└──────────────┬───────────────────────┘
               │
               │ Enhanced Student Data
               │ {
               │   topic: "Photosynthesis",
               │   emotionalState: {...},
               │   stressLevel: 2
               │ }
               ▼
┌──────────────────────────────────────┐
│  QUESTION GENERATOR                  │
│  (questionGenerator.js)              │
│                                      │
│  Google Gemini AI                    │
│  - Analyzes emotion data             │
│  - Adapts difficulty                 │
│  - Generates questions               │
└──────────────┬───────────────────────┘
               │
               │ Adaptive Questions
               │ [
               │   {
               │     difficulty: 2,
               │     bloomLevel: "Understand",
               │     questionText: "...",
               │     ...
               │   }
               │ ]
               ▼
┌──────────────────────────────────────┐
│  RESPONSE HANDLER                    │
│                                      │
│  - Formats output                    │
│  - Saves to JSON files               │
│  - Displays to console               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  OUTPUT FILES                        │
│                                      │
│  1. emotion_summary_*.json           │
│  2. integrated_output_*.json         │
│                                      │
│  + Console display                   │
└──────────────────────────────────────┘
```

## 🔄 Component Interaction

```
┌─────────────────────┐         ┌─────────────────────┐
│   Python Script     │◄───────►│    Node.js API      │
│   (Client/Frontend) │  HTTP   │   (Server/Backend)  │
└─────────────────────┘         └─────────────────────┘
         │                                │
         │                                │
         ▼                                ▼
┌─────────────────────┐         ┌─────────────────────┐
│   OpenCV/DeepFace   │         │   Google Gemini     │
│   (ML Libraries)    │         │   (AI Service)      │
└─────────────────────┘         └─────────────────────┘
```

## 📝 Request/Response Format

### Request (Python → Node.js):
```json
POST http://localhost:3000/api/generate-questions-with-emotion

{
  "topic": "Photosynthesis",
  "studentData": {
    "studentId": "student_001",
    "grade": "10",
    "emotionalState": {
      "overallEmotion": "happy",
      "stressLevel": 2,
      "emotionBreakdown": {
        "happy": 65.5,
        "neutral": 20.3,
        "surprise": 10.2
      }
    }
  },
  "emotionData": {
    "overall_dominant_emotion": "happy",
    "stress_level": 2,
    "average_emotion_scores": {...}
  },
  "questionCount": 5
}
```

### Response (Node.js → Python):
```json
{
  "success": true,
  "data": {
    "totalQuestions": 5,
    "questions": [
      {
        "questionId": "q1",
        "topic": "Photosynthesis",
        "difficulty": 2,
        "bloomLevel": "Understand",
        "type": "MCQ",
        "questionText": "What is the primary purpose of photosynthesis?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "B",
        "explanation": "..."
      }
    ]
  }
}
```

## 🎯 Adaptation Logic

### Stress Level → Question Difficulty Mapping:

```
Stress Level 1 (Very Low):
  ├─ Difficulty: 3-5 (Moderate to Hard)
  ├─ Bloom Levels: Apply, Analyze, Evaluate
  └─ Question Types: Problem-solving, Creative

Stress Level 2 (Low):
  ├─ Difficulty: 2-4 (Easy to Moderate)
  ├─ Bloom Levels: Understand, Apply
  └─ Question Types: Mixed, Engaging

Stress Level 3 (Moderate):
  ├─ Difficulty: 2-3 (Easy to Moderate)
  ├─ Bloom Levels: Remember, Understand
  └─ Question Types: Straightforward

Stress Level 4 (High):
  ├─ Difficulty: 1-2 (Very Easy to Easy)
  ├─ Bloom Levels: Remember, Understand
  └─ Question Types: Supportive, Clear

Stress Level 5 (Very High):
  ├─ Difficulty: 1 (Very Easy)
  ├─ Bloom Levels: Remember
  └─ Question Types: Confidence-building
```

## 🔐 Security & Configuration

```
┌─────────────────────┐
│   .env File         │
│   (ai service/)     │
├─────────────────────┤
│ GOOGLE_CLOUD_API_   │
│ KEY=xxxxxxxx        │
│                     │
│ PORT=3000           │
└─────────────────────┘
         │
         │ Loaded at startup
         ▼
┌─────────────────────┐
│   API Server        │
│   (api.js)          │
└─────────────────────┘
```

## 📦 File Structure

```
vibethon/
│
├── integrated_emotion_assessment.py  ← Main integration script
├── test_integration.py               ← Test suite
├── integrated_requirements.txt       ← Python dependencies
│
├── setup-integrated-system.bat       ← Setup script
├── start-ai-service.bat             ← Start AI service
├── run-integrated-system.bat        ← Run main script
│
├── INTEGRATION_README.md            ← Detailed documentation
├── QUICKSTART.md                    ← Quick start guide
├── ARCHITECTURE.md                  ← This file
│
├── Facial-Emotion-Recognition.../
│   ├── emotion.py                   ← Original emotion detection
│   ├── requirements.txt             ← Original dependencies
│   └── haarcascade_...xml          ← Face detection model
│
└── ai service/
    ├── api.js                       ← Express API server
    ├── questionGenerator.js         ← Gemini integration
    ├── package.json                 ← Node dependencies
    └── .env                         ← API configuration
```

## 🚀 Deployment Considerations

### Local Development:
- Python script + Node.js server on same machine
- Communication via localhost:3000

### Production Ready:
```
┌─────────────────┐
│  Web Frontend   │
│  (React/Vue)    │
└────────┬────────┘
         │ WebSocket/HTTP
         ▼
┌─────────────────┐      ┌─────────────────┐
│  Emotion API    │◄────►│  Question API   │
│  (Python/Flask) │      │  (Node.js)      │
└─────────────────┘      └─────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌─────────────────┐
│  OpenCV/ML      │      │  Google Gemini  │
└─────────────────┘      └─────────────────┘
```

## 📊 Performance Metrics

### Emotion Detection:
- Processing Time: ~0.1-0.2s per frame
- Total Duration: 20 seconds
- Frames Analyzed: 100-200 frames
- Accuracy: Depends on lighting/face position

### Question Generation:
- API Call Time: 5-15 seconds
- Questions Generated: 5 (configurable)
- Token Usage: ~1000-2000 tokens
- Cost: ~$0.001-0.005 per request

### Total Workflow:
- End-to-End Time: ~25-40 seconds
- User Interaction: 20 seconds (emotion detection)
- Backend Processing: 5-20 seconds (AI generation)

---

**This architecture enables real-time emotion-adaptive assessment for personalized learning experiences!** 🎓✨
