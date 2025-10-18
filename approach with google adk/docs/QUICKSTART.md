# 🎯 Quick Start Guide

Get up and running in **5 minutes**!

---

## 🚀 Super Quick Start

```bash
# 1. Install everything
cd "approach with google adk\scripts"
install.bat

# 2. Configure (IMPORTANT!)
# Edit backend\.env with your credentials:
#   - GOOGLE_API_KEY
#   - MONGODB_URI

# 3. Start system
start-complete-system.bat

# 4. Follow assessment prompts
# Enter topic, student ID, etc.
```

Done! 🎉

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ Node.js 16+ (https://nodejs.org)
- ✅ Python 3.8+ (https://python.org)
- ✅ MongoDB (local or Atlas account)
- ✅ Google Gemini API key
- ✅ Working webcam

---

## 🔧 Detailed Steps

### 1. Get API Keys

**Google Gemini API:**
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIzaSy...`)

**MongoDB Atlas (if using cloud):**
1. Visit: https://cloud.mongodb.com
2. Sign up (free)
3. Create cluster (M0 free tier)
4. Get connection string

---

### 2. Install

```bash
cd "approach with google adk\scripts"
install.bat
```

Wait for installation to complete (~2-5 minutes).

---

### 3. Configure

Edit `backend\.env`:

```env
GOOGLE_API_KEY=AIzaSyC_your_actual_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adaptive-learning
PORT=3000
```

**Replace:**
- `AIzaSyC_your_actual_key_here` with your real API key
- `username:password@cluster` with your MongoDB credentials

---

### 4. Start MongoDB

**If using local MongoDB:**
```bash
mongod --dbpath C:\data\db
```

**If using MongoDB Atlas:**
- No action needed! It's already running in cloud

---

### 5. Run System

```bash
cd scripts
start-complete-system.bat
```

You'll see two windows:
1. Backend server (don't close!)
2. Assessment client (interact here)

---

### 6. Complete Assessment

Follow the prompts:

```
📚 Enter topic: Python Programming
👤 Student ID: 315
👤 Student Name: John Doe
📊 Grade: 10
❓ Number of questions: 3
```

The system will:
1. ✅ Check all systems
2. 📡 Generate AI questions
3. 📹 Monitor emotions (silently)
4. 💬 Provide instant feedback
5. 📊 Generate session summary
6. 💾 Save to MongoDB

---

## 🎓 What Happens Next?

### First Assessment:
- System creates student profile
- Generates baseline questions
- Records performance & emotions
- Saves to database

### Second Assessment (same student ID):
- Loads previous history
- AI adapts questions based on:
  - Past performance
  - Weak areas
  - Current emotions
- Provides personalized feedback
- Tracks improvement

---

## 📊 Check Results

### View in Browser:

**API Health:**
```
http://localhost:3000/api/health
```

**Student Profile:**
```
http://localhost:3000/api/students/315/profile
```

### View in MongoDB:

**MongoDB Compass:**
1. Download: https://www.mongodb.com/try/download/compass
2. Connect to your database
3. Explore collections

**Command Line:**
```bash
mongosh
use adaptive-learning
db.students.find()
db.assessmentsessions.find()
```

---

## 🔥 Common Issues

### "MongoDB connection failed"
```bash
# Check MongoDB is running
mongod --version

# For Atlas, verify connection string in .env
```

### "AI Service is NOT running"
```bash
# Start backend manually
cd backend
npm start
```

### "Camera not accessible"
```bash
# Check Windows camera permissions
# Close other apps using camera
```

---

## 🎯 Test the System

### Quick Test:
1. Run assessment with student ID "TEST_001"
2. Answer 3 questions on any topic
3. Check MongoDB for saved data
4. Run second assessment with same ID
5. Notice how questions adapt!

### Advanced Test:
1. Use same student ID for multiple topics
2. Intentionally answer some questions wrong
3. On next session, AI focuses on weak areas
4. Check emotion patterns in database

---

## 📈 Understanding the Flow

```
1. Student enters info
   ↓
2. System checks: API ✓ Camera ✓ DeepFace ✓
   ↓
3. Session starts → MongoDB creates record
   ↓
4. For each question:
   ├─ AI generates based on history + emotion
   ├─ Question displayed
   ├─ Camera monitors emotions (silent)
   ├─ Student answers
   ├─ AI provides feedback
   └─ Data saved to MongoDB
   ↓
5. Session completes
   ├─ AI generates summary
   ├─ Performance analysis
   └─ Recommendations for next session
   ↓
6. Next session uses this data!
```

---

## 🚀 Ready for More?

### Explore Analytics:

**Get Student Analysis:**
```bash
curl http://localhost:3000/api/analytics/student/315
```

**Get Topic Recommendations:**
```bash
curl http://localhost:3000/api/analytics/topic/315/Mathematics
```

**Check Emotion Patterns:**
```bash
curl http://localhost:3000/api/emotions/patterns/315
```

---

## 💡 Pro Tips

1. **Use consistent student IDs** - Better history tracking
2. **Try different topics** - System adapts per topic
3. **Run multiple sessions** - See adaptation in action
4. **Check MongoDB** - Understand data structure
5. **Read AI reasoning** - See why questions were chosen

---

## 🎉 Success Indicators

You're successful when you see:

- ✅ Backend server running (port 3000)
- ✅ MongoDB connected
- ✅ System readiness check passes
- ✅ Questions generated by AI
- ✅ Emotions detected during answers
- ✅ AI feedback after each question
- ✅ Session summary generated
- ✅ Data saved in MongoDB

---

## 📞 Need Help?

1. Check `SETUP.md` for detailed troubleshooting
2. Review `ARCHITECTURE.md` to understand system design
3. Check error messages in terminal
4. Verify all credentials in `.env`
5. Test each component individually

---

**🎓 You're all set! Start your adaptive learning journey!** 🚀

---

**Estimated Time:**
- Installation: 5 minutes
- Configuration: 2 minutes
- First assessment: 3-5 minutes
- **Total: ~12 minutes** ⏱️
