# Database Design - Adaptive AI Learning System

## 📊 Overview

**Database Type**: MongoDB (NoSQL Document Database)  
**Connection**: MongoDB Atlas (Cloud)  
**Database Name**: `vibathon`

The system uses a **document-based** database design optimized for:
- Real-time emotion tracking during assessments
- Adaptive question generation based on student performance
- Historical analysis for personalized learning paths
- Session-based test delivery with AI-powered analytics

---

## 🗄️ Collections Schema

### **1. User Collection** 👤

**Purpose**: Store user accounts (students and teachers)

**Collection Name**: `users`

**Schema**:
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  username: String,                 // Unique username (indexed)
  password: String,                 // Hashed password (bcrypt)
  role: String,                     // "student" | "teacher"
  enrolledClasses: [ObjectId],      // Array of Class IDs (for students)
  createdAt: Date,                  // Account creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

**Indexes**:
- `username`: Unique index for fast login lookup
- `role`: Index for role-based queries

**Example Document**:
```json
{
  "_id": "68f2d7288240fded57c71a25",
  "username": "student_test",
  "password": "$2b$10$hashed...",
  "role": "student",
  "enrolledClasses": ["68f2d7288240fded57c71a20"],
  "createdAt": "2025-10-18T00:00:00.000Z",
  "updatedAt": "2025-10-18T00:00:00.000Z"
}
```

---

### **2. Class Collection** 🎓

**Purpose**: Organize students into classes/courses

**Collection Name**: `classes`

**Schema**:
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  classId: String,                  // Custom class identifier
  className: String,                // Class name (e.g., "Math 101")
  description: String,              // Class description
  teacherId: ObjectId,              // Reference to teacher User
  students: [ObjectId],             // Array of student User IDs
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `classId`: Unique index
- `teacherId`: Index for teacher's classes
- `students`: Index for student enrollment queries

**Example Document**:
```json
{
  "_id": "68f2d7288240fded57c71a20",
  "classId": "class_polynomials_2025",
  "className": "polynomials",
  "description": "No description",
  "teacherId": "68f2d7288240fded57c71a26",
  "students": ["68f2d7288240fded57c71a25"],
  "createdAt": "2025-10-18T00:00:00.000Z",
  "updatedAt": "2025-10-18T00:00:00.000Z"
}
```

---

### **3. Test Collection** 📝

**Purpose**: Store test templates created by teachers

**Collection Name**: `tests`

**Schema**:
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  testId: String,                   // Custom test identifier
  testName: String,                 // Test name
  topic: String,                    // Test topic (used by AI for question generation)
  classId: ObjectId,                // Reference to Class
  teacherId: ObjectId,              // Reference to teacher User
  numQuestions: Number,             // Total questions in test (default: 10)
  questionsPerSession: Number,      // Questions per session (default: 5)
  isActive: Boolean,                // Test availability status
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `testId`: Unique index
- `classId`: Index for class's tests
- `teacherId`: Index for teacher's tests
- `isActive`: Index for active tests queries

**Key Features**:
- **Session-Based**: Tests divided into multiple sessions (e.g., 10 questions = 2 sessions of 5)
- **No Pre-Generated Questions**: Questions generated dynamically by ADK Agent
- **Topic-Driven**: AI generates questions based on the `topic` field

**Example Document**:
```json
{
  "_id": "68f2d7288240fded57c71a21",
  "testId": "test_polynomials_1760757600000",
  "testName": "polynomials",
  "topic": "polynomials basics",
  "classId": "68f2d7288240fded57c71a20",
  "teacherId": "68f2d7288240fded57c71a26",
  "numQuestions": 10,
  "questionsPerSession": 5,
  "isActive": true,
  "createdAt": "2025-10-18T00:00:00.000Z",
  "updatedAt": "2025-10-18T00:00:00.000Z"
}
```

---

### **4. Attempt Collection** 📊

**Purpose**: Track student test attempts with performance data

**Collection Name**: `attempts`

**Schema**:
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  attemptId: String,                // Custom attempt ID (e.g., "attempt_1760757798500_eykwx85io")
  testId: ObjectId,                 // Reference to Test
  studentId: ObjectId,              // Reference to student User
  
  // Session Management
  currentSession: Number,           // Current session number (1, 2, 3...)
  totalSessions: Number,            // Total sessions in test
  currentSessionQuestions: [        // Questions for current session
    {
      id: String,                   // Question ID
      text: String,                 // Question text
      difficulty: String,           // "easy" | "medium" | "hard"
      options: [String],            // Answer options
      correctAnswer: String,        // Correct answer
      explanation: String,          // Explanation
      topic: String                 // Question topic
    }
  ],
  
  // Performance Tracking
  index: Number,                    // Current question index (0-based)
  results: [                        // All answers submitted
    {
      questionId: String,
      questionText: String,
      selectedAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
      stress: Number,               // Stress level (0-10)
      timeTaken: Number,            // Time in seconds
      difficulty: String
    }
  ],
  
  // Session Analytics (AI-generated)
  sessionAnalytics: [               // Analysis per session
    {
      sessionNumber: Number,
      accuracy: Number,             // 0-1 (percentage)
      averageStress: Number,        // Average stress level
      dominantEmotion: String,      // Most common emotion
      recommendation: String,       // AI recommendation
      nextDifficulty: String,       // Suggested next difficulty
      timestamp: Date
    }
  ],
  
  // Adaptive Logic
  currentDifficulty: String,        // Current question difficulty
  
  // Status
  completed: Boolean,               // Test completion status
  completedAt: Date,                // Completion timestamp
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `attemptId`: Unique index
- `testId`: Index for test attempts
- `studentId`: Index for student attempts
- `completed`: Index for completion queries
- Compound index: `{studentId: 1, createdAt: -1}` for recent attempts

**Key Features**:
- **Session-Based Flow**: Questions delivered in batches
- **Real-Time Tracking**: Tracks each answer with emotion and time
- **AI Analytics**: Each session analyzed by ADK Agent
- **Adaptive Difficulty**: Adjusts based on performance

**Example Document**:
```json
{
  "_id": "68f2d7288240fded57c71a22",
  "attemptId": "attempt_1760757798500_eykwx85io",
  "testId": "68f2d7288240fded57c71a21",
  "studentId": "68f2d7288240fded57c71a25",
  "currentSession": 1,
  "totalSessions": 2,
  "currentSessionQuestions": [
    {
      "id": "q_1760757798600_abc123",
      "text": "What is a polynomial?",
      "difficulty": "easy",
      "options": ["A function", "An equation", "An expression", "A number"],
      "correctAnswer": "An expression",
      "explanation": "A polynomial is an algebraic expression...",
      "topic": "polynomials basics"
    }
  ],
  "index": 5,
  "results": [
    {
      "questionId": "q_1760757798600_abc123",
      "questionText": "What is a polynomial?",
      "selectedAnswer": "An expression",
      "correctAnswer": "An expression",
      "isCorrect": true,
      "stress": 3.5,
      "timeTaken": 45,
      "difficulty": "easy"
    }
  ],
  "sessionAnalytics": [
    {
      "sessionNumber": 1,
      "accuracy": 0.8,
      "averageStress": 4.2,
      "dominantEmotion": "neutral",
      "recommendation": "Continue with medium difficulty questions",
      "nextDifficulty": "medium",
      "timestamp": "2025-10-18T08:30:00.000Z"
    }
  ],
  "currentDifficulty": "medium",
  "completed": false,
  "createdAt": "2025-10-18T08:00:00.000Z",
  "updatedAt": "2025-10-18T08:30:00.000Z"
}
```

---

### **5. EmotionTracking Collection** 😊

**Purpose**: Store real-time emotion data captured during tests

**Collection Name**: `emotiontrackings`

**Schema**:
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  studentId: ObjectId,              // Reference to student User
  attemptId: String,                // Custom attempt ID (STRING, not ObjectId!)
  timestamp: Date,                  // When emotion was captured
  
  // Emotion Scores (0-100 for each)
  emotions: {
    happy: Number,                  // Happiness score (0-100)
    sad: Number,                    // Sadness score (0-100)
    angry: Number,                  // Anger score (0-100)
    fear: Number,                   // Fear score (0-100)
    neutral: Number,                // Neutral score (0-100)
    surprise: Number,               // Surprise score (0-100)
    disgust: Number                 // Disgust score (0-100)
  },
  
  // Analyzed Data
  dominantEmotion: String,          // Primary emotion detected
  stressLevel: Number,              // Calculated stress (0-1)
  questionNumber: Number,           // Which question this emotion was for
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- Compound: `{studentId: 1, timestamp: -1}` for chronological queries
- Compound: `{attemptId: 1, questionNumber: 1}` for question-specific emotions
- `studentId`: Index for student emotion history

**Key Features**:
- **Real-Time Capture**: Webcam captures emotion every few seconds
- **Per-Question Tracking**: Links emotion to specific questions
- **Stress Calculation**: Derives stress level from emotion mix
- **Historical Analysis**: Used by ADK Agent to personalize questions

**Stress Level Calculation**:
```
stressLevel = (fear + angry + sad) / 3 / 100
Range: 0.0 (calm) to 1.0 (highly stressed)
```

**Example Document**:
```json
{
  "_id": "68f2d7288240fded57c71a23",
  "studentId": "68f2d7288240fded57c71a25",
  "attemptId": "attempt_1760757798500_eykwx85io",
  "timestamp": "2025-10-18T08:15:30.000Z",
  "emotions": {
    "happy": 10,
    "sad": 5,
    "angry": 2,
    "fear": 15,
    "neutral": 68,
    "surprise": 0,
    "disgust": 0
  },
  "dominantEmotion": "neutral",
  "stressLevel": 0.073,
  "questionNumber": 3,
  "createdAt": "2025-10-18T08:15:30.000Z",
  "updatedAt": "2025-10-18T08:15:30.000Z"
}
```

---

### **6. Material Collection** 📚

**Purpose**: Store learning materials shared by teachers

**Collection Name**: `materials`

**Schema**:
```typescript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  materialId: String,               // Custom material identifier
  title: String,                    // Material title
  content: String,                  // Material content/description
  classId: ObjectId,                // Reference to Class
  teacherId: ObjectId,              // Reference to teacher User
  fileUrl: String,                  // URL to uploaded file (if any)
  type: String,                     // "document" | "video" | "link" | "text"
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `materialId`: Unique index
- `classId`: Index for class materials
- `teacherId`: Index for teacher materials

**Example Document**:
```json
{
  "_id": "68f2d7288240fded57c71a24",
  "materialId": "material_polynomials_notes",
  "title": "Polynomial Basics - Study Guide",
  "content": "Introduction to polynomials, degree, coefficients...",
  "classId": "68f2d7288240fded57c71a20",
  "teacherId": "68f2d7288240fded57c71a26",
  "fileUrl": "https://storage.example.com/polynomials.pdf",
  "type": "document",
  "createdAt": "2025-10-18T00:00:00.000Z",
  "updatedAt": "2025-10-18T00:00:00.000Z"
}
```

---

## 🔗 Relationships

### **Entity Relationship Diagram**

```
┌─────────────┐
│    User     │
│  (Student/  │
│  Teacher)   │
└──────┬──────┘
       │
       │ enrolledClasses / teaches
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│    Class    │    │   Attempt   │◄──┐
└──────┬──────┘    └──────┬──────┘   │
       │                  │           │
       │ contains         │ tracks    │ references
       │                  │           │
       ▼                  ▼           │
┌─────────────┐    ┌─────────────┐   │
│    Test     │───►│   Results   │   │
└─────────────┘    └─────────────┘   │
                          │           │
                          │ linked to │
                          │           │
                          ▼           │
                   ┌─────────────┐   │
                   │  Emotion    │───┘
                   │  Tracking   │
                   └─────────────┘
```

### **Relationship Details**

1. **User → Class** (Many-to-Many)
   - Students can enroll in multiple classes
   - Classes can have multiple students
   - Teachers can teach multiple classes

2. **Class → Test** (One-to-Many)
   - One class can have multiple tests
   - Each test belongs to one class

3. **User (Student) → Attempt** (One-to-Many)
   - One student can have multiple attempts
   - Each attempt belongs to one student

4. **Test → Attempt** (One-to-Many)
   - One test can have multiple attempts (by different students)
   - Each attempt is for one test

5. **Attempt → EmotionTracking** (One-to-Many)
   - One attempt has multiple emotion records (one per question)
   - Each emotion record belongs to one attempt

6. **User (Student) → EmotionTracking** (One-to-Many)
   - One student has emotion history across all attempts
   - Each emotion record belongs to one student

---

## 🔍 Query Patterns

### **ADK Agent Database Queries**

The Google ADK Agent uses these query patterns to personalize learning:

#### **1. Query Student Performance**
```javascript
// Find recent attempts for a student
const attempts = await Attempt.find({ studentId })
  .sort({ createdAt: -1 })
  .limit(10);

// Calculate metrics:
// - Overall accuracy
// - Total tests taken
// - Average difficulty level
// - Performance trend
```

**Purpose**: Understand student's historical performance to adapt question difficulty

---

#### **2. Query Emotion Patterns**
```javascript
// Find emotions for specific attempt
const emotions = await EmotionTracking.find({ 
  studentId,
  attemptId 
})
  .sort({ timestamp: 1 });

// Or find all emotions for student
const allEmotions = await EmotionTracking.find({ studentId })
  .sort({ timestamp: -1 })
  .limit(100);

// Calculate:
// - Average stress level
// - Dominant emotion
// - Emotional stability
// - Stress patterns
```

**Purpose**: Detect emotional state and adjust question difficulty to reduce stress

---

#### **3. Query Recent Attempts**
```javascript
// Find recent test attempts
const recentAttempts = await Attempt.find({ studentId })
  .sort({ createdAt: -1 })
  .limit(5)
  .select('testId results currentDifficulty createdAt');

// Extract:
// - Topics covered
// - Question difficulties
// - Performance per topic
```

**Purpose**: Avoid repetition and build on previous learning

---

### **Common Application Queries**

#### **Student Dashboard**
```javascript
// Get enrolled classes
const classes = await Class.find({ students: studentId });

// Get available tests
const tests = await Test.find({ 
  classId: { $in: classIds },
  isActive: true 
});

// Get attempt history
const attempts = await Attempt.find({ studentId })
  .populate('testId')
  .sort({ createdAt: -1 });
```

#### **Teacher Dashboard**
```javascript
// Get created tests
const tests = await Test.find({ teacherId });

// Get class students
const classData = await Class.findById(classId)
  .populate('students');

// Get student attempts for a test
const attempts = await Attempt.find({ testId })
  .populate('studentId')
  .sort({ createdAt: -1 });
```

---

## 📈 Data Flow

### **Test Taking Flow**

```
1. Student clicks "Start Test"
   ↓
2. Backend creates Attempt document
   ↓
3. ADK Agent queries:
   - Student performance history
   - Emotion patterns
   - Recent attempts
   ↓
4. Agent generates 5 personalized questions
   ↓
5. Questions stored in currentSessionQuestions
   ↓
6. Frontend displays questions
   ↓
7. Webcam captures emotions
   ↓
8. EmotionTracking documents created (one per question)
   ↓
9. Student submits answers
   ↓
10. Results stored in Attempt.results
    ↓
11. ADK Agent analyzes session
    ↓
12. Analysis stored in sessionAnalytics
    ↓
13. If more sessions: Generate next batch
    Otherwise: Mark attempt as completed
```

---

## 🎯 Key Design Decisions

### **1. Custom IDs vs MongoDB ObjectIds**

**Custom IDs Used**:
- `attemptId`: String format `attempt_timestamp_randomid`
- `testId`: String format `test_name_timestamp`
- `classId`: String format `class_name_year`

**Why?**
- Human-readable identifiers
- Easier debugging and logging
- Consistent across different systems

**MongoDB ObjectIds Used**:
- Internal references between documents
- Efficient indexing and joins
- Auto-generated for `_id` fields

---

### **2. Session-Based Architecture**

**Why Sessions?**
- **Cognitive Load**: Breaking tests into smaller chunks
- **AI Analysis**: Analyze performance mid-test for adaptation
- **Real-Time Feedback**: Provide recommendations between sessions
- **Better Engagement**: Students see progress incrementally

**Implementation**:
- `questionsPerSession` in Test model
- `currentSession` tracker in Attempt
- `sessionAnalytics` array for each session's analysis

---

### **3. Embedded vs Referenced Data**

**Embedded** (Stored within document):
- `results` in Attempt: Fast access, always needed together
- `sessionAnalytics` in Attempt: Part of attempt lifecycle
- `currentSessionQuestions` in Attempt: Temporary, session-specific
- `emotions` in EmotionTracking: Logically grouped data

**Referenced** (Separate collection):
- User, Class, Test: Reused across multiple documents
- EmotionTracking: Large volume, queried independently
- Attempt: Independent lifecycle, complex queries

---

### **4. No Pre-Generated Questions**

**Traditional Approach**:
```
Test → [Questions stored in DB]
```

**Our Approach**:
```
Test → {topic} → ADK Agent → [Generated questions]
```

**Why?**
- **Infinite Variety**: Never repeat same questions
- **Personalization**: Questions adapt to each student
- **Dynamic Difficulty**: Real-time adjustment
- **Storage Efficiency**: No need to store thousands of questions

---

## 🔒 Data Integrity

### **Constraints**

1. **Unique Constraints**:
   - `User.username`
   - `Class.classId`
   - `Test.testId`
   - `Attempt.attemptId`

2. **Required Fields**:
   - All collections: `_id`, `createdAt`, `updatedAt`
   - EmotionTracking: `studentId`, `attemptId`, `dominantEmotion`, `stressLevel`
   - Attempt: `testId`, `studentId`, `completed`

3. **Referential Integrity**:
   - `Attempt.testId` → `Test._id`
   - `Attempt.studentId` → `User._id`
   - `EmotionTracking.studentId` → `User._id`
   - **Note**: `EmotionTracking.attemptId` is String (not referenced)

---

## 📊 Performance Optimization

### **Indexes Created**

```javascript
// User
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Class
db.classes.createIndex({ classId: 1 }, { unique: true });
db.classes.createIndex({ teacherId: 1 });

// Test
db.tests.createIndex({ testId: 1 }, { unique: true });
db.tests.createIndex({ classId: 1 });
db.tests.createIndex({ isActive: 1 });

// Attempt
db.attempts.createIndex({ attemptId: 1 }, { unique: true });
db.attempts.createIndex({ studentId: 1, createdAt: -1 });
db.attempts.createIndex({ testId: 1 });
db.attempts.createIndex({ completed: 1 });

// EmotionTracking
db.emotiontrackings.createIndex({ studentId: 1, timestamp: -1 });
db.emotiontrackings.createIndex({ attemptId: 1, questionNumber: 1 });
```

### **Query Optimization Tips**

1. **Use Projections**: Only fetch needed fields
   ```javascript
   .select('testId results currentDifficulty')
   ```

2. **Limit Results**: Don't fetch entire history
   ```javascript
   .limit(10)
   ```

3. **Sort with Index**: Use indexed fields for sorting
   ```javascript
   .sort({ createdAt: -1 })  // Uses index
   ```

4. **Compound Queries**: Leverage compound indexes
   ```javascript
   { studentId: 1, createdAt: -1 }  // Efficient
   ```

---

## 🚀 Scalability Considerations

### **Current Design (MVP)**
- Single MongoDB Atlas cluster
- ~1000 concurrent users
- Real-time emotion tracking
- AI-powered question generation

### **Future Scaling**

1. **Sharding Strategy**:
   - Shard by `studentId` for Attempt and EmotionTracking
   - Distribute student data across multiple servers

2. **Data Archiving**:
   - Move old attempts to archive collection after 1 year
   - Keep recent data for fast queries

3. **Caching Layer**:
   - Redis cache for frequently accessed data
   - Cache student performance metrics
   - Cache recent emotion patterns

4. **Read Replicas**:
   - Use MongoDB read replicas for analytics queries
   - Keep primary for writes only

---

## 📝 Summary

### **Total Collections**: 6
1. **User** - Authentication and roles
2. **Class** - Course organization
3. **Test** - Test templates with topics
4. **Attempt** - Student test attempts with session tracking
5. **EmotionTracking** - Real-time emotion data
6. **Material** - Learning resources

### **Key Features**:
- ✅ Session-based test delivery
- ✅ Real-time emotion tracking
- ✅ AI-powered adaptive learning
- ✅ Historical performance analysis
- ✅ Personalized question generation
- ✅ Stress-aware difficulty adjustment

### **Database Size Estimates** (per 1000 students):
- Users: ~100 KB
- Classes: ~50 KB
- Tests: ~200 KB
- Attempts: ~50 MB (with results)
- EmotionTrackings: ~500 MB (detailed tracking)
- Materials: ~10 MB

**Total**: ~560 MB per 1000 students

---

## 🔧 Database Setup Commands

### **MongoDB Atlas Setup**
```bash
# Already configured in .env:
DB_URL=mongodb+srv://rahuldusa37:dusarahul@cluster0.dcnzaca.mongodb.net/vibathon
```

### **Local MongoDB Setup** (Alternative)
```bash
# Install MongoDB
# Start MongoDB server
mongod --dbpath /data/db

# Connect
mongo

# Create database
use vibathon

# Create collections (auto-created on first insert)
```

### **Seed Data** (Initial setup)
```javascript
// Run in backend startup
// Creates test users and classes
// See: backend-webapp/src/index.ts
```

---

**Database Design Complete! 🎉**

This design supports:
- ✅ Real-time emotion tracking
- ✅ AI-powered personalization
- ✅ Session-based adaptive testing
- ✅ Historical performance analysis
- ✅ Scalable architecture
