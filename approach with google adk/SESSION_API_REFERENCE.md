# 🔌 Session-Based Test API - Quick Reference

## Overview
Two new endpoints enable **batch-based question generation** with **AI re-analysis** between sessions.

---

## 1️⃣ Start Session

### Endpoint
```
POST /api/tests/start-session
```

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body
```json
{
  "testId": "test_1737028800000_abc123"
}
```

### Success Response (200)
```json
{
  "attemptId": "attempt_1737028900000_xyz789",
  "sessionNumber": 1,
  "totalSessions": 4,
  "questions": [
    {
      "id": "q_1",
      "text": "What is the capital of France?",
      "difficulty": "easy",
      "options": ["Berlin", "Paris", "London", "Madrid"],
      "correctAnswer": "Paris",
      "bloomLevel": "Remember",
      "type": "multiple-choice"
    },
    {
      "id": "q_2",
      "text": "Calculate 15% of 200",
      "difficulty": "easy",
      "options": ["20", "25", "30", "35"],
      "correctAnswer": "30",
      "bloomLevel": "Apply",
      "type": "multiple-choice"
    }
    // ... 3 more questions (total 5)
  ],
  "questionsInSession": 5,
  "totalQuestions": 20
}
```

### Error Response (400)
```json
{
  "error": "Test not found"
}
```

### Error Response (500)
```json
{
  "error": "Failed to generate first session questions"
}
```

---

## 2️⃣ Submit Session

### Endpoint
```
POST /api/tests/submit-session
```

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body
```json
{
  "testId": "test_1737028800000_abc123",
  "attemptId": "attempt_1737028900000_xyz789",
  "sessionAnswers": [
    {
      "questionId": "q_1",
      "questionText": "What is the capital of France?",
      "selectedAnswer": "Paris",
      "correctAnswer": "Paris",
      "isCorrect": true,
      "timeTaken": 15,
      "stress": 2,
      "stressLevel": 0.2,
      "dominantEmotion": "neutral"
    },
    {
      "questionId": "q_2",
      "questionText": "Calculate 15% of 200",
      "selectedAnswer": "25",
      "correctAnswer": "30",
      "isCorrect": false,
      "timeTaken": 35,
      "stress": 6,
      "stressLevel": 0.6,
      "dominantEmotion": "confused"
    },
    {
      "questionId": "q_3",
      "questionText": "What is 2 + 2?",
      "selectedAnswer": "4",
      "correctAnswer": "4",
      "isCorrect": true,
      "timeTaken": 10,
      "stress": 1,
      "stressLevel": 0.1,
      "dominantEmotion": "happy"
    },
    {
      "questionId": "q_4",
      "questionText": "Define photosynthesis",
      "selectedAnswer": "Process of converting light to energy",
      "correctAnswer": "Process of converting light to energy",
      "isCorrect": true,
      "timeTaken": 25,
      "stress": 3,
      "stressLevel": 0.3,
      "dominantEmotion": "focused"
    },
    {
      "questionId": "q_5",
      "questionText": "What is the square root of 144?",
      "selectedAnswer": "12",
      "correctAnswer": "12",
      "isCorrect": true,
      "timeTaken": 18,
      "stress": 2,
      "stressLevel": 0.2,
      "dominantEmotion": "neutral"
    }
  ],
  "emotionData": [
    {
      "dominantEmotion": "neutral",
      "stressLevel": 0.2,
      "timestamp": "2024-01-15T10:25:15Z"
    },
    {
      "dominantEmotion": "confused",
      "stressLevel": 0.6,
      "timestamp": "2024-01-15T10:25:50Z"
    },
    {
      "dominantEmotion": "happy",
      "stressLevel": 0.1,
      "timestamp": "2024-01-15T10:26:00Z"
    },
    {
      "dominantEmotion": "focused",
      "stressLevel": 0.3,
      "timestamp": "2024-01-15T10:26:25Z"
    },
    {
      "dominantEmotion": "neutral",
      "stressLevel": 0.2,
      "timestamp": "2024-01-15T10:26:43Z"
    }
  ]
}
```

### Success Response - More Sessions (200)
```json
{
  "done": false,
  "sessionAnalysis": {
    "sessionNumber": 1,
    "questionsAnswered": 5,
    "correctAnswers": 4,
    "accuracy": 0.8,
    "avgStress": 2.8,
    "avgEmotionStress": 0.28,
    "avgTime": 20.6,
    "dominantEmotions": ["neutral", "confused", "happy", "focused", "neutral"],
    "recommendation": "Excellent performance! Increasing difficulty.",
    "nextDifficulty": "medium"
  },
  "nextSession": {
    "sessionNumber": 2,
    "questions": [
      {
        "id": "q_6",
        "text": "Explain Newton's First Law of Motion",
        "difficulty": "medium",
        "options": [
          "Object at rest stays at rest",
          "Force equals mass times acceleration",
          "Every action has equal reaction",
          "Energy cannot be created or destroyed"
        ],
        "correctAnswer": "Object at rest stays at rest",
        "bloomLevel": "Understand",
        "type": "multiple-choice"
      }
      // ... 4 more medium questions
    ],
    "questionsInSession": 5
  },
  "progress": {
    "questionsAnswered": 5,
    "totalQuestions": 20,
    "percentComplete": "25"
  }
}
```

### Success Response - Test Complete (200)
```json
{
  "done": true,
  "sessionAnalysis": {
    "sessionNumber": 4,
    "questionsAnswered": 5,
    "correctAnswers": 3,
    "accuracy": 0.6,
    "avgStress": 4.2,
    "avgEmotionStress": 0.42,
    "avgTime": 28.4,
    "dominantEmotions": ["neutral", "focused", "stressed", "happy", "neutral"],
    "recommendation": "Good progress. Maintaining current difficulty.",
    "nextDifficulty": "medium"
  },
  "totalCorrect": 16,
  "totalQuestions": 20,
  "finalAccuracy": 0.8
}
```

### Error Response (400)
```json
{
  "error": "Test not found"
}
// or
{
  "error": "Attempt not found"
}
```

### Error Response (500)
```json
{
  "error": "Failed to submit session"
}
```

---

## 🔄 Complete Flow Example

### Step 1: Login
```bash
POST /api/auth/login
{
  "username": "student1",
  "password": "password123"
}

Response: { "token": "eyJhbGc..." }
```

### Step 2: Start Test
```bash
POST /api/tests/start-session
Authorization: Bearer eyJhbGc...
{
  "testId": "test_123"
}

Response: {
  "attemptId": "attempt_xyz",
  "questions": [q1, q2, q3, q4, q5]
}
```

### Step 3: Submit Session 1
```bash
POST /api/tests/submit-session
{
  "testId": "test_123",
  "attemptId": "attempt_xyz",
  "sessionAnswers": [/* 5 answers */],
  "emotionData": [/* emotion snapshots */]
}

Response: {
  "done": false,
  "sessionAnalysis": { ... },
  "nextSession": {
    "questions": [q6, q7, q8, q9, q10]
  }
}
```

### Step 4: Submit Session 2
```bash
POST /api/tests/submit-session
{
  "testId": "test_123",
  "attemptId": "attempt_xyz",
  "sessionAnswers": [/* 5 more answers */],
  "emotionData": [/* emotion snapshots */]
}

Response: {
  "done": false,
  "sessionAnalysis": { ... },
  "nextSession": {
    "questions": [q11, q12, q13, q14, q15]
  }
}
```

### Step 5: Submit Final Session
```bash
POST /api/tests/submit-session
{
  "testId": "test_123",
  "attemptId": "attempt_xyz",
  "sessionAnswers": [/* final 5 answers */],
  "emotionData": [/* emotion snapshots */]
}

Response: {
  "done": true,
  "sessionAnalysis": { ... },
  "totalCorrect": 16,
  "totalQuestions": 20,
  "finalAccuracy": 0.8
}
```

---

## 📊 Field Descriptions

### sessionAnswers Array
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `questionId` | string | Unique question identifier | `"q_1"` |
| `questionText` | string | The question text | `"What is 2+2?"` |
| `selectedAnswer` | string | Student's answer | `"4"` |
| `correctAnswer` | string | The correct answer | `"4"` |
| `isCorrect` | boolean | Whether answer was correct | `true` |
| `timeTaken` | number | Seconds to answer | `25` |
| `stress` | number | Traditional stress (0-10) | `5` |
| `stressLevel` | number | Emotion-based stress (0-1) | `0.5` |
| `dominantEmotion` | string | Primary emotion | `"neutral"` |

### emotionData Array
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `dominantEmotion` | string | Primary emotion detected | `"happy"` |
| `stressLevel` | number | Stress level (0-1) | `0.3` |
| `timestamp` | string | ISO 8601 timestamp | `"2024-01-15T10:25:15Z"` |

### sessionAnalysis Object
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `sessionNumber` | number | Current session (1-indexed) | `2` |
| `questionsAnswered` | number | Questions in this session | `5` |
| `correctAnswers` | number | Correct answers | `4` |
| `accuracy` | number | Accuracy rate (0-1) | `0.8` |
| `avgStress` | number | Average traditional stress | `3.2` |
| `avgEmotionStress` | number | Average emotion stress | `0.35` |
| `avgTime` | number | Average seconds per question | `28.5` |
| `dominantEmotions` | string[] | Emotions during session | `["neutral", "happy"]` |
| `recommendation` | string | AI recommendation | `"Excellent! Increasing difficulty"` |
| `nextDifficulty` | string | Next difficulty level | `"medium"` |

---

## 🎯 AI Recommendation Logic

### High Performance
- **Condition**: Accuracy ≥ 80% AND avgStress < 5 AND emotionStress < 0.4
- **Action**: Increase difficulty
- **Message**: "Excellent performance! Increasing difficulty."

### Struggling
- **Condition**: Accuracy < 40% OR avgStress > 7 OR emotionStress > 0.7
- **Action**: Decrease difficulty
- **Message**: "Struggling detected. Reducing difficulty and reviewing concepts."

### Steady Progress
- **Condition**: Everything else
- **Action**: Maintain difficulty
- **Message**: "Good progress. Maintaining current difficulty."

---

## 🧪 Testing with curl

### Test 1: Start Session
```bash
curl -X POST http://localhost:5000/api/tests/start-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testId": "test_123"
  }'
```

### Test 2: Submit Session
```bash
curl -X POST http://localhost:5000/api/tests/submit-session \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testId": "test_123",
    "attemptId": "attempt_xyz",
    "sessionAnswers": [
      {
        "questionId": "q1",
        "questionText": "Test question",
        "selectedAnswer": "A",
        "correctAnswer": "A",
        "isCorrect": true,
        "timeTaken": 20,
        "stress": 3,
        "stressLevel": 0.3,
        "dominantEmotion": "neutral"
      }
    ],
    "emotionData": [
      {
        "dominantEmotion": "neutral",
        "stressLevel": 0.3,
        "timestamp": "2024-01-15T10:25:00Z"
      }
    ]
  }'
```

---

## 💡 Frontend Integration Tips

### React State Structure
```typescript
interface SessionState {
  attemptId: string;
  sessionNumber: number;
  currentQuestions: Question[];
  sessionAnswers: Answer[];
  emotionSnapshots: Emotion[];
  isComplete: boolean;
}
```

### Collecting Emotion Data
```typescript
// Every 5 seconds during session
setInterval(() => {
  const emotion = detectEmotion(); // From webcam
  emotionSnapshots.push({
    dominantEmotion: emotion.dominant,
    stressLevel: emotion.stress,
    timestamp: new Date().toISOString()
  });
}, 5000);
```

### Submitting Session
```typescript
const submitSession = async () => {
  const response = await fetch('/api/tests/submit-session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      testId,
      attemptId,
      sessionAnswers,
      emotionData: emotionSnapshots
    })
  });
  
  const result = await response.json();
  
  if (result.done) {
    // Show final results
    showResults(result);
  } else {
    // Load next session
    setCurrentQuestions(result.nextSession.questions);
    setSessionAnswers([]);
    setEmotionSnapshots([]);
  }
};
```

---

## 🔐 Authentication

All endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

Token obtained from:
```
POST /api/auth/login
```

---

## ⚙️ Configuration

### Change Questions Per Session
Modify in Test creation:
```javascript
const test = new Test({
  testName: "Math Test",
  topic: "Algebra",
  numQuestions: 20,
  questionsPerSession: 10  // Change from default 5 to 10
});
```

This will generate batches of 10 instead of 5.

---

## 📝 Notes

1. **Emotion Data is Optional**: If not provided, only traditional stress is used
2. **Batch Size**: Default is 5, configurable per test
3. **Difficulty Levels**: `easy`, `medium`, `hard`
4. **Session Analytics**: Stored in `attempt.sessionAnalytics` array
5. **Question Storage**: Current batch in `attempt.currentSessionQuestions`

---

**Status**: ✅ Ready for integration
