# 🚀 Adaptive AI Learning System with Google ADK & MongoDB

## 🎯 Complete Integration Approach

This folder contains a **production-ready adaptive learning system** with:

- ✅ **Google Gemini AI** (via ADK) - All AI operations
- ✅ **MongoDB** - Scalable, cloud-ready database
- ✅ **Real-time Emotion Detection** - OpenCV + DeepFace
- ✅ **REST API** - Node.js Express backend
- ✅ **Python Client** - Emotion detection & assessment interface

---

## 📁 Project Structure

```
approach with google adk/
├── backend/                    # Node.js API Server
│   ├── config/                 # Configuration files
│   │   └── database.js         # MongoDB connection
│   ├── models/                 # MongoDB schemas
│   │   ├── Student.js
│   │   ├── AssessmentSession.js
│   │   ├── QuestionAttempt.js
│   │   └── EmotionTracking.js
│   ├── services/               # Business logic
│   │   ├── aiService.js        # Google Gemini AI
│   │   ├── questionService.js  # Question generation
│   │   ├── analysisService.js  # Performance analysis
│   │   └── emotionService.js   # Emotion analytics
│   ├── routes/                 # API routes
│   │   └── api.js
│   ├── server.js               # Main server file
│   ├── package.json
│   └── .env.example
│
├── python-client/              # Python Assessment Client
│   ├── emotion_detector.py     # Camera & emotion detection
│   ├── assessment_client.py    # Main assessment interface
│   ├── requirements.txt
│   └── config.py
│
├── docs/                       # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── ARCHITECTURE.md
│
├── scripts/                    # Utility scripts
│   ├── install.bat
│   ├── start-backend.bat
│   └── start-assessment.bat
│
└── README.md                   # This file
```

---

## 🚀 Quick Start

### 1️⃣ Prerequisites
- Node.js 16+ (https://nodejs.org)
- Python 3.8+ (https://python.org)
- MongoDB (Local or Atlas cloud)
- Google Gemini API Key

### 2️⃣ Installation

```bash
# Install everything
cd "approach with google adk"
scripts\install.bat
```

### 3️⃣ Configuration

1. **MongoDB Setup:**
   - Local: Install MongoDB Community Server
   - Cloud: Create free cluster at https://cloud.mongodb.com

2. **Environment Variables:**
   ```bash
   cd backend
   copy .env.example .env
   # Edit .env with your credentials
   ```

3. **Add credentials to `.env`:**
   ```
   GOOGLE_API_KEY=your_gemini_api_key_here
   MONGODB_URI=mongodb://localhost:27017/adaptive-learning
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adaptive-learning
   PORT=3000
   ```

### 4️⃣ Run the System

**Terminal 1 - Start Backend:**
```bash
scripts\start-backend.bat
```

**Terminal 2 - Run Assessment:**
```bash
scripts\start-assessment.bat
```

---

## 🎓 Features

### 🧠 AI-Powered Intelligence
- **Question Generation** - Context-aware, adaptive questions
- **Performance Analysis** - Deep insights using Google Gemini
- **Personalized Feedback** - Encouraging, specific responses
- **Learning Path** - AI-recommended next steps

### 📊 MongoDB Database
- **Scalable** - Handles millions of records
- **Cloud-Ready** - Works with MongoDB Atlas
- **Flexible Schema** - Easy to extend
- **Real-time Queries** - Fast performance analytics

### 😊 Emotion Detection
- **Real-time** - Background emotion monitoring
- **Silent Mode** - No camera window distraction
- **7 Emotions** - Happy, sad, angry, fear, surprise, disgust, neutral
- **Stress Tracking** - 1-5 stress level calculation

### 📈 Analytics & Insights
- **Student Profiles** - Complete learning history
- **Topic Performance** - Strengths & weaknesses
- **Emotion Patterns** - How emotions affect learning
- **Progress Tracking** - Long-term improvement trends

---

## 🔧 Technology Stack

### Backend
- **Runtime:** Node.js 16+
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose ODM
- **AI:** Google Generative AI (Gemini)
- **Auth:** JWT (optional, for future)

### Frontend (Python Client)
- **Language:** Python 3.8+
- **CV:** OpenCV
- **Emotion AI:** DeepFace
- **HTTP:** Requests library

### DevOps
- **Database:** MongoDB Atlas (cloud) or local
- **Environment:** dotenv
- **Package Manager:** npm (Node), pip (Python)

---

## 📚 API Endpoints

### Health & Status
```http
GET /api/health
```

### Student Management
```http
POST /api/students/register
GET /api/students/:studentId
GET /api/students/:studentId/profile
```

### Assessment Flow
```http
POST /api/sessions/start
POST /api/sessions/question/next
POST /api/sessions/answer/submit
POST /api/sessions/complete
```

### Analytics
```http
GET /api/analytics/student/:studentId
GET /api/analytics/topic/:studentId/:topic
POST /api/analytics/session/:sessionId/summary
```

### Emotion Tracking
```http
POST /api/emotions/track
GET /api/emotions/patterns/:studentId
```

---

## 🎯 Workflow

### First-Time Student
```
1. Register student → MongoDB creates profile
2. Start session → Session ID generated
3. For each question:
   - AI generates baseline question
   - Camera monitors emotions (silent)
   - Student answers
   - AI provides feedback
   - Data saved to MongoDB
4. Complete session → AI generates summary
5. Profile updated with learnings
```

### Returning Student
```
1. Load student profile from MongoDB
2. AI analyzes historical performance
3. Start adaptive session
4. For each question:
   - AI considers: past performance + current emotion + weak areas
   - Generates personalized question
   - Adapts difficulty dynamically
   - Tracks improvement patterns
5. AI compares with previous sessions
6. Provides growth insights
```

---

## 🗄️ MongoDB Collections

### students
- `student_id` (String, unique)
- `name` (String)
- `grade` (Number)
- `created_at`, `updated_at` (Timestamp)

### assessment_sessions
- `session_id` (String, unique)
- `student_id` (Reference)
- `topic` (String)
- `start_time`, `end_time` (Timestamp)
- `average_stress` (Number)
- `dominant_emotion` (String)
- `completion_status` (String)

### question_attempts
- `session_id` (Reference)
- `student_id` (Reference)
- `question_number` (Number)
- `question_text`, `question_type` (String)
- `difficulty_level`, `bloom_level` (String)
- `student_answer`, `correct_answer` (String)
- `is_correct` (Boolean)
- `emotion_during_answer` (String)
- `stress_level` (Number)
- `time_taken_seconds` (Number)

### emotion_tracking
- `session_id` (Reference)
- `student_id` (Reference)
- `timestamp` (Timestamp)
- `emotion` (String)
- `stress_level` (Number)
- `frame_data` (Object)

### ai_analysis
- `student_id` (Reference)
- `session_id` (Reference)
- `analysis_type` (String)
- `insights` (Object)
- `recommendations` (Array)
- `created_at` (Timestamp)

### topic_performance
- `student_id` (Reference)
- `topic` (String)
- `accuracy` (Number)
- `total_attempts` (Number)
- `weak_areas`, `strong_areas` (Array)
- `last_attempt_date` (Timestamp)

---

## 🎨 Key Improvements Over Previous Approach

### 1. MongoDB vs SQLite
| Feature | SQLite | MongoDB |
|---------|--------|---------|
| Scalability | Limited | Unlimited |
| Cloud Support | Poor | Excellent |
| Query Speed | Good | Excellent |
| JSON Storage | Limited | Native |
| Concurrent Users | Poor | Excellent |

### 2. Better Organization
- ✅ Modular architecture (MVC pattern)
- ✅ Separate services for AI, DB, analysis
- ✅ Clean API routes
- ✅ Mongoose schemas with validation

### 3. Production Ready
- ✅ Environment-based config
- ✅ Error handling & logging
- ✅ Database connection pooling
- ✅ Scalable to thousands of users

### 4. Google ADK Integration
- ✅ Latest Gemini models
- ✅ Structured outputs
- ✅ Streaming support (optional)
- ✅ Better prompt engineering

---

## 🔒 Security Best Practices

1. **API Keys** - Never commit `.env` file
2. **MongoDB** - Use authentication in production
3. **Input Validation** - Mongoose schemas validate data
4. **CORS** - Configure allowed origins
5. **Rate Limiting** - Add in production (optional)

---

## 📊 Sample Student Journey

### Session 1: Baseline Assessment
```json
{
  "topic": "Algebra",
  "questions": 5,
  "accuracy": 60%,
  "avg_stress": 4/5,
  "insights": "Struggles with word problems under stress"
}
```

### Session 2: Adaptive Learning
```json
{
  "topic": "Algebra",
  "questions": 5,
  "accuracy": 75%,
  "avg_stress": 3/5,
  "insights": "Improvement in basic concepts, reduce stress on complex problems"
}
```

### Session 3: Mastery Building
```json
{
  "topic": "Algebra",
  "questions": 5,
  "accuracy": 85%,
  "avg_stress": 2/5,
  "insights": "Consistent progress, ready for advanced topics"
}
```

---

## 🚀 Deployment Options

### Local Development
```bash
# MongoDB local
mongod --dbpath C:\data\db

# Backend
cd backend
npm start

# Python client
cd python-client
python assessment_client.py
```

### Cloud Deployment (Production)

**Option 1: MongoDB Atlas + Heroku**
- MongoDB: Free tier on Atlas
- Backend: Deploy to Heroku/Railway/Render
- Python: Run locally or package as desktop app

**Option 2: Full Cloud**
- MongoDB: Atlas
- Backend: AWS Lambda / Google Cloud Functions
- Frontend: Web-based React/Vue app (future)

---

## 📖 Documentation

- **API Reference:** `docs/API.md`
- **Setup Guide:** `docs/SETUP.md`
- **Architecture:** `docs/ARCHITECTURE.md`

---

## 🤝 Contributing

This is a hackathon project. Feel free to:
- Add features
- Improve AI prompts
- Enhance emotion detection
- Build web interface

---

## 📝 License

MIT License - Free to use and modify

---

## 🎓 Credits

Built for Vibethon Hackathon 2025
- **AI:** Google Gemini
- **Database:** MongoDB
- **Emotion Detection:** DeepFace + OpenCV
- **Team:** Adaptive AI Learning Team

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
mongod --version

# Or use MongoDB Atlas cloud
# Get connection string from cloud.mongodb.com
```

### Google API Error
```bash
# Verify API key in .env
# Check quota at console.cloud.google.com
```

### Camera Not Working
```bash
# Install camera drivers
# Check antivirus/firewall settings
# Ensure no other app is using camera
```

---

## 📞 Support

For issues or questions:
1. Check `docs/` folder
2. Review error logs in `backend/logs/`
3. Check MongoDB connection status
4. Verify API keys are correct

---

**🎉 Ready to build the future of adaptive learning!** 🚀

---

Last Updated: October 17, 2025
