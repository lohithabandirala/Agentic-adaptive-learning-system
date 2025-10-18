# 📚 Complete Setup Guide

## 🎯 Overview

This guide will help you set up the **Adaptive AI Learning System** with:
- Google Gemini AI for intelligent question generation & analysis
- MongoDB for scalable data storage
- Real-time emotion detection with OpenCV & DeepFace

---

## ✅ Prerequisites

### Required Software:

1. **Node.js 16+**
   - Download: https://nodejs.org
   - Check: `node --version`

2. **Python 3.8+**
   - Download: https://python.org
   - Check: `python --version`

3. **MongoDB**
   - Option A: Local MongoDB Community Server
     - Download: https://www.mongodb.com/try/download/community
   - Option B: MongoDB Atlas (Cloud - Recommended for beginners)
     - Sign up: https://cloud.mongodb.com (Free tier available)

4. **Google Gemini API Key**
   - Get free API key: https://makersuite.google.com/app/apikey
   - Or: https://ai.google.dev

5. **Webcam**
   - Built-in laptop camera OR external USB camera

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

Open terminal in `approach with google adk` folder:

```bash
cd "approach with google adk\scripts"
install.bat
```

This will:
- Install Node.js packages (Express, Mongoose, Google AI, etc.)
- Install Python packages (OpenCV, DeepFace, etc.)
- Create `.env` configuration file

---

### Step 2: Configure MongoDB

#### Option A: Local MongoDB

1. Install MongoDB Community Server
2. Start MongoDB service:
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   
   # Or manually:
   mongod --dbpath C:\data\db
   ```

3. Your connection string:
   ```
   mongodb://localhost:27017/adaptive-learning
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create free account at https://cloud.mongodb.com
2. Create new cluster (free M0 tier)
3. Create database user:
   - Username: `admin`
   - Password: (your choice)
4. Whitelist IP: Add `0.0.0.0/0` (allow all) for development
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/adaptive-learning?retryWrites=true&w=majority
   ```

**Replace `username` and `password` with your credentials!**

---

### Step 3: Configure Environment Variables

1. Navigate to `backend` folder
2. Open `.env` file in text editor
3. Add your credentials:

```env
# Google Gemini API Key
GOOGLE_API_KEY=AIzaSyC...your_actual_key_here

# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/adaptive-learning

# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adaptive-learning?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important:** 
- Don't share your API keys!
- Replace example values with real credentials
- For MongoDB Atlas, replace `username` and `password`

---

### Step 4: Verify Installation

Test each component:

#### Test Node.js:
```bash
cd backend
node --version
npm --version
```

#### Test Python:
```bash
cd python-client
python --version
pip --version
```

#### Test MongoDB Connection:
```bash
# For local MongoDB
mongosh

# For MongoDB Atlas
mongosh "mongodb+srv://cluster.mongodb.net" --username yourUsername
```

---

## 🎮 Running the System

### Method 1: Automatic (Recommended)

Run everything with one command:

```bash
cd "approach with google adk\scripts"
start-complete-system.bat
```

This will:
1. Start backend server in new window
2. Wait 5 seconds for initialization
3. Start assessment client

---

### Method 2: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd "approach with google adk\scripts"
start-backend.bat
```

Wait for:
```
✅ MongoDB connected successfully
🚀 Server running on: http://localhost:3000
✅ System ready! Waiting for requests...
```

**Terminal 2 - Assessment:**
```bash
cd "approach with google adk\scripts"
start-assessment.bat
```

---

## 🧪 Testing

### 1. Test API Endpoint

Open browser: http://localhost:3000

You should see API documentation with all endpoints.

### 2. Test API Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Adaptive AI Learning System - MongoDB + Google Gemini",
  "database": "MongoDB",
  "ai": "Google Gemini"
}
```

### 3. Run First Assessment

Follow the prompts:
```
📚 Enter topic: Mathematics
👤 Student ID: 315
👤 Student Name: John Doe
📊 Grade: 10
❓ Number of questions: 3
```

The system will:
- Generate personalized questions using AI
- Monitor emotions during answering
- Provide immediate feedback
- Save all data to MongoDB
- Generate AI-powered session summary

---

## 🔧 Troubleshooting

### Issue: MongoDB Connection Failed

**Error:**
```
❌ MongoDB connection failed
```

**Solutions:**

1. **For Local MongoDB:**
   ```bash
   # Check if MongoDB is running
   tasklist | find "mongod"
   
   # Start MongoDB
   net start MongoDB
   ```

2. **For MongoDB Atlas:**
   - Verify connection string in `.env`
   - Check username/password are correct
   - Ensure IP is whitelisted (0.0.0.0/0)
   - Test connection:
     ```bash
     mongosh "your_connection_string"
     ```

---

### Issue: Google API Error

**Error:**
```
AI generation failed: 400 Bad Request
```

**Solutions:**

1. Verify API key in `.env`:
   ```env
   GOOGLE_API_KEY=AIzaSyC...your_key_here
   ```

2. Check API key is active:
   - Visit: https://makersuite.google.com/app/apikey
   - Verify key exists and is enabled

3. Check quota:
   - Visit: https://console.cloud.google.com
   - Gemini API has free tier limits
   - Upgrade if needed

---

### Issue: Camera Not Working

**Error:**
```
❌ Camera not accessible
```

**Solutions:**

1. **Check Camera Permissions:**
   - Windows Settings → Privacy → Camera
   - Allow desktop apps to access camera

2. **Close Other Apps:**
   - Close Zoom, Teams, Skype
   - Only one app can use camera at a time

3. **Test Camera:**
   ```python
   import cv2
   cap = cv2.VideoCapture(0)
   print(cap.isOpened())  # Should print True
   ```

4. **Try Different Camera Index:**
   Edit `python-client/config.py`:
   ```python
   CAMERA_INDEX = 1  # Try 1, 2, etc.
   ```

---

### Issue: DeepFace Loading Slow

**First run is slow (normal):**
- DeepFace downloads ML models (~100MB)
- Takes 30-60 seconds first time
- Subsequent runs are fast

**Speed up:**
- Models cached in `~/.deepface/weights/`
- Keep this folder between runs

---

### Issue: Port 3000 Already in Use

**Error:**
```
Port 3000 is already in use
```

**Solution:**

1. Find process using port:
   ```bash
   netstat -ano | findstr :3000
   ```

2. Kill process:
   ```bash
   taskkill /PID <process_id> /F
   ```

3. Or change port in `.env`:
   ```env
   PORT=3001
   ```
   
   Update `python-client/config.py`:
   ```python
   API_BASE_URL = "http://localhost:3001/api"
   ```

---

## 📊 Database Management

### View Database

**Using MongoDB Compass (GUI):**
1. Download: https://www.mongodb.com/try/download/compass
2. Connect to your MongoDB
3. Explore collections:
   - `students`
   - `assessmentsessions`
   - `questionattempts`
   - `emotiontrackings`
   - `aianalyses`

**Using mongosh (CLI):**
```bash
mongosh

use adaptive-learning
show collections
db.students.find()
db.assessmentsessions.find()
```

---

### Backup Database

```bash
# Local MongoDB
mongodump --db adaptive-learning --out C:\backup

# MongoDB Atlas
mongodump --uri "mongodb+srv://..." --out C:\backup
```

---

### Clear Database

**Warning: This deletes all data!**

```bash
mongosh

use adaptive-learning
db.dropDatabase()
```

---

## 🎓 Next Steps

After successful installation:

1. **Run Test Assessment:**
   - Use test student ID: "TEST_001"
   - Try different topics
   - Check MongoDB for saved data

2. **Test Multiple Sessions:**
   - Run 2-3 assessments with same student ID
   - Notice how questions adapt based on history

3. **Explore Analytics:**
   - Use API to get student analysis
   - Check emotion patterns
   - View topic performance

4. **Customize:**
   - Modify prompts in `backend/services/`
   - Adjust stress calculation
   - Add new question types

---

## 📞 Support

### Quick Diagnostics

Run this command to check everything:

```bash
cd "approach with google adk"

# Check Node.js
node --version

# Check Python
python --version

# Check MongoDB
mongosh --version

# Check backend packages
cd backend
npm list

# Check Python packages
cd ../python-client
pip list
```

---

## 🚀 Production Deployment

For deploying to production:

1. **Backend:**
   - Deploy to Heroku, Railway, or Render
   - Use environment variables for secrets
   - Enable MongoDB Atlas connection

2. **Database:**
   - Use MongoDB Atlas production cluster
   - Set up backups
   - Configure security rules

3. **Security:**
   - Never commit `.env` file
   - Use strong passwords
   - Enable MongoDB authentication
   - Add rate limiting to API

---

## ✅ Installation Checklist

- [ ] Node.js 16+ installed
- [ ] Python 3.8+ installed
- [ ] MongoDB setup (local or Atlas)
- [ ] Google Gemini API key obtained
- [ ] Dependencies installed (`install.bat`)
- [ ] `.env` file configured
- [ ] MongoDB connection tested
- [ ] Backend starts successfully
- [ ] Camera permissions granted
- [ ] First assessment completed successfully
- [ ] Data visible in MongoDB

---

**🎉 If all checklist items are complete, you're ready to go!**

For detailed API documentation, see `API.md`
For architecture details, see `ARCHITECTURE.md`
