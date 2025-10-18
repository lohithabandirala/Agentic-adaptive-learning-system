# 🎯 Real-Time Adaptive Question Generation System

## Overview
The system has been **completely restructured** to generate questions **adaptively in real-time** based on student performance during the test, instead of pre-generating all questions when the teacher creates the test.

---

## 🔄 How It Works

### 1. **Teacher Creates Test Template** (No Pre-generation)

**What Teacher Does:**
- Enters test name (e.g., "Java Arrays Quiz")
- Enters topic as text (e.g., "arrays in java")
- Selects number of questions (5-50)
- Assigns to a class

**What Happens:**
- ✅ Test template is saved to database with:
  - `topic`: The text topic for AI generation
  - `numQuestions`: Total questions to generate
  - `classId`: Which class it belongs to
  - `createdBy`: Teacher ID
- ❌ **NO questions are generated yet!**
- ✅ Test appears in student's available tests list

**API Endpoint:** `POST /api/tests/create`
```json
{
  "testName": "Java Arrays Quiz",
  "textInput": "arrays in java",
  "numQuestions": 10,
  "classId": "class_123"
}
```

---

### 2. **Student Starts Test** (First Question Generated)

**What Student Does:**
- Clicks "Start Test" button

**What Happens:**
1. Backend creates a new `Attempt` record
2. **AI generates the FIRST question** (always EASY difficulty to start)
3. Question is returned to frontend
4. Timer starts (30 seconds)

**API Endpoint:** `POST /api/tests/start`
```json
Request: { "testId": "test_123" }

Response: {
  "attemptId": "attempt_456",
  "question": {
    "id": "q1",
    "text": "What is an array in Java?",
    "options": ["A) A variable", "B) A data structure", "C) A function", "D) A class"],
    "correctAnswer": "B) A data structure",
    "difficulty": "easy"
  },
  "questionNumber": 1,
  "totalQuestions": 10
}
```

---

### 3. **Student Answers Question** (Next Question Generated Adaptively)

**What Student Does:**
- Selects an option (A, B, C, or D)
- Clicks "Submit Answer"

**What Happens:**
1. Frontend calculates:
   - `isCorrect`: Did they select the right answer?
   - `timeTaken`: How long did they take (30 - remaining time)
   - `stress`: Simulated based on correctness + time
2. Backend receives answer data
3. Backend saves result to `Attempt.results[]` array
4. **Adaptive Logic Runs:**
   - If CORRECT + LOW STRESS → increase difficulty (easy → medium → hard)
   - If INCORRECT + HIGH STRESS → decrease difficulty (hard → medium → easy)
   - Otherwise → keep same difficulty
5. **AI generates NEXT question** with calculated difficulty
6. New question returned to frontend
7. Repeat until `numQuestions` reached

**API Endpoint:** `POST /api/tests/answer`
```json
Request: {
  "testId": "test_123",
  "attemptId": "attempt_456",
  "questionId": "q1",
  "questionText": "What is an array in Java?",
  "selectedAnswer": "B) A data structure",
  "correctAnswer": "B) A data structure",
  "isCorrect": true,
  "stress": 0.2,
  "timeTaken": 12
}

Response: {
  "nextDifficulty": "medium",
  "question": {
    "id": "q2",
    "text": "How do you declare an array in Java?",
    "options": ["A) int arr[]", "B) array int arr", "C) int[] arr", "D) Both A and C"],
    "correctAnswer": "D) Both A and C",
    "difficulty": "medium"
  },
  "questionNumber": 2,
  "totalQuestions": 10,
  "done": false
}
```

---

### 4. **Test Completion**

**What Happens:**
- When student answers the last question (e.g., question #10)
- Backend returns `done: true` with no question
- Frontend fetches insights/results
- Student sees performance analytics

**API Endpoint:** `GET /api/tests/insights/:attemptId`
```json
Response: {
  "accuracy": 0.7,
  "avgStress": 0.35,
  "totalQuestions": 10,
  "correctAnswers": 7,
  "completed": true,
  "results": [
    {
      "questionId": "q1",
      "questionText": "What is an array?",
      "selectedAnswer": "B",
      "correctAnswer": "B",
      "isCorrect": true,
      "stress": 0.2,
      "timeTaken": 12,
      "difficulty": "easy"
    },
    // ... 9 more results
  ]
}
```

---

## 📊 Database Schema Changes

### Before (Old System - Pre-generated Questions)
```typescript
interface ITest {
  testId: string;
  testName: string;
  classId: string;
  questions: IQuestion[]; // ❌ All questions stored here
  createdBy: string;
}

interface IAttempt {
  attemptId: string;
  testId: string;
  studentId: string;
  results: {
    questionId: string; // ❌ Just reference to pre-generated question
    isCorrect: boolean;
    stress: number;
  }[];
}
```

### After (New System - Adaptive Generation)
```typescript
interface ITest {
  testId: string;
  testName: string;
  classId: string;
  topic: string; // ✅ Topic for AI generation
  numQuestions: number; // ✅ How many to generate
  createdBy: string;
  // ❌ No questions array!
}

interface IAttempt {
  attemptId: string;
  testId: string;
  studentId: string;
  results: {
    questionId: string;
    questionText: string; // ✅ Full question stored
    selectedAnswer: string; // ✅ What student selected
    correctAnswer: string; // ✅ Right answer
    isCorrect: boolean;
    stress: number;
    timeTaken: number;
    difficulty: 'easy' | 'medium' | 'hard'; // ✅ Question difficulty
  }[];
  currentDifficulty: 'easy' | 'medium' | 'hard'; // ✅ Current adaptive level
}
```

---

## 🧠 Adaptive Algorithm (From `adaptiveLogic.ts`)

```typescript
function getNextDifficulty(
  current: 'easy' | 'medium' | 'hard',
  isCorrect: boolean,
  stress: number
): 'easy' | 'medium' | 'hard' {
  
  // HIGH STRESS = nervous/struggling
  if (stress > 0.6) {
    if (current === 'hard') return 'medium'; // Make easier
    if (current === 'medium') return 'easy';
    return 'easy'; // Stay easy
  }
  
  // CORRECT + LOW STRESS = confident
  if (isCorrect && stress < 0.3) {
    if (current === 'easy') return 'medium'; // Make harder
    if (current === 'medium') return 'hard';
    return 'hard'; // Stay hard
  }
  
  // INCORRECT = make easier
  if (!isCorrect) {
    if (current === 'hard') return 'medium';
    if (current === 'medium') return 'easy';
    return 'easy';
  }
  
  // Default: stay same
  return current;
}
```

---

## 🎨 Frontend Changes

### Teacher Dashboard
- ❌ Removed "Difficulty Level" dropdown
- ❌ Removed "Questions Preview" after creation
- ✅ Added message: "Questions will be generated adaptively based on student performance"
- ✅ Shows test template info (name, topic, count)

### Student Portal
- ❌ Removed "Correct/Incorrect" buttons
- ✅ Added proper MCQ interface with A/B/C/D options
- ✅ Shows question number (e.g., "Question 3/10")
- ✅ Shows current difficulty badge (EASY/MEDIUM/HARD)
- ✅ Disables submit until option selected
- ✅ Loading state while AI generates next question

---

## 🚀 Key Benefits

### 1. **Truly Personalized Learning**
- Each student gets different questions based on their performance
- Struggling students get easier questions (not overwhelmed)
- Advanced students get harder questions (stay challenged)

### 2. **No Question Pool Limitations**
- Old system: Limited to pre-generated questions
- New system: Infinite unique questions from AI

### 3. **Real-Time Adaptation**
- Difficulty adjusts DURING the test
- Based on ACTUAL performance (not pre-set)

### 4. **Better Data Collection**
- Full question text stored in results
- Student's selected answer stored
- Difficulty level tracked per question
- Time taken per question recorded

### 5. **Scalability**
- No need to store thousands of questions in database
- Reduces storage costs
- Questions generated on-demand

---

## 🔧 Technical Implementation

### Backend Routes Updated:
1. `POST /api/tests/create` - Create test template (new endpoint)
2. `POST /api/tests/start` - Start test + generate first question
3. `POST /api/tests/answer` - Submit answer + generate next question
4. `GET /api/tests/insights/:attemptId` - Get results (unchanged)

### AI Integration (`geminiClient.ts`):
- ✅ Fixed to use `gemini-pro` model (stable)
- ✅ Generates 1 question at a time
- ✅ Difficulty specified in prompt
- ✅ Robust JSON parsing with fallbacks

### Models Updated:
- `Test.ts` - Changed from storing questions to storing topic/count
- `Attempt.ts` - Enhanced to store full question data in results

---

## 📝 Example Flow

```
Teacher:
  1. Create "Java Basics Test" with topic "arrays in java", 10 questions
  2. Assign to "CS101" class
  ✅ Test template saved

Student:
  1. See "Java Basics Test" in available tests
  2. Click "Start Test"
     → Backend generates Question 1 (EASY)
     → "What is an array?"
  3. Select answer "B) Data structure" (CORRECT, took 10s)
  4. Click "Submit Answer"
     → Backend: correct + fast = increase difficulty
     → AI generates Question 2 (MEDIUM)
     → "How to declare array?"
  5. Select answer "A) int arr[]" (INCORRECT, took 25s)
  6. Click "Submit Answer"
     → Backend: incorrect + slow = decrease difficulty
     → AI generates Question 3 (EASY)
     → "Arrays store multiple..."
  7. ... continues for 10 questions
  8. See results: 7/10 correct, avg stress 0.35
```

---

## ✅ Testing Steps

### 1. Create Test as Teacher
```bash
# Login as teacher
POST /api/auth/login
{ "email": "teacher@test.com", "password": "password123" }

# Create class
POST /api/classes/create
{ "name": "CS101", "description": "Computer Science" }
# Response: { "code": "ABC123" }

# Create test template
POST /api/tests/create
{
  "testName": "Java Arrays Quiz",
  "textInput": "arrays in java",
  "numQuestions": 5,
  "classId": "class_123"
}
# ✅ Should return test info, NO questions
```

### 2. Take Test as Student
```bash
# Login as student
POST /api/auth/login
{ "email": "student@test.com", "password": "password123" }

# Join class
POST /api/classes/join
{ "code": "ABC123" }

# Start test
POST /api/tests/start
{ "testId": "test_123" }
# ✅ Should return FIRST question (easy)

# Answer question
POST /api/tests/answer
{
  "testId": "test_123",
  "attemptId": "attempt_456",
  "questionId": "q1",
  "questionText": "What is an array?",
  "selectedAnswer": "B",
  "correctAnswer": "B",
  "isCorrect": true,
  "stress": 0.2,
  "timeTaken": 12
}
# ✅ Should return NEXT question (medium if correct)
```

---

## 🎉 Summary

**Before:** Teacher pre-generates all questions → Student sees same questions in order
**After:** Teacher sets topic/count → AI generates questions ONE BY ONE based on student's real-time performance

This is **TRUE adaptive learning**! 🚀
