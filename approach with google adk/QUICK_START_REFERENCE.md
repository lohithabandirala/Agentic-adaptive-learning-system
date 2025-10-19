# ⚡ QUICK START - One Page Guide

## 🚀 Start in 3 Steps

### 1️⃣ **Configure** (First Time Only)
Edit `backend-webapp\.env`:
```env
GOOGLE_API_KEY=your_key_from_makersuite.google.com
MONGODB_URI=mongodb://localhost:27017/ai-learning
```

### 2️⃣ **Run Startup Script**
```bash
START_COMPLETE_PROJECT.bat
```

### 3️⃣ **Open Browser**
```
http://localhost:5173
```

---

## 🎯 Quick Access

| Service | URL | What It Does |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend API** | http://localhost:4000/api | REST API server |
| **Emotion Service** | http://localhost:5000 | Face emotion tracking |

---

## 🔑 Default Logins

| Role | Username | Password |
|------|----------|----------|
| **Student** | student1 | password |
| **Teacher** | teacher1 | password |

---

## 📊 NEW Features Quick Access

### **For Students:**
```
Login → Dashboard → Click "📊 My Profile" → View Analytics
```

### **For Teachers:**
```
Login → Dashboard → Click "📊 Student Analytics" → Select Student
```

---

## 🛠️ Manual Start (If Script Fails)

Open **3 separate terminals**:

**Terminal 1 - Backend:**
```bash
cd backend-webapp
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend-webapp
npm run dev
```

**Terminal 3 - Python:**
```bash
cd python-emotion-service
.venv\Scripts\activate
python emotion_service.py
```

---

## ❌ Quick Fixes

| Problem | Solution |
|---------|----------|
| **Backend won't start** | Check `backend-webapp\.env` has GOOGLE_API_KEY |
| **MongoDB error** | Start MongoDB service or check Atlas connection |
| **Camera not working** | Allow camera permission in browser |
| **Port already in use** | Close other apps using ports 4000, 5173, 5000 |
| **No data in profile** | Complete at least one test first |

---

## 📝 First Test Flow

1. **Login as Teacher** → Create Class → Get class code
2. **Login as Student** → Join Class (enter code)
3. **Select Class** → Start Test
4. **Allow Camera** → Answer questions → Submit
5. **View Profile** → See your analytics! 📊

---

## 🔌 Key API Endpoints

```
POST /api/auth/login        - Login
GET  /api/profile/me        - My profile (NEW)
GET  /api/profile/students  - All students (Teacher, NEW)
GET  /api/analytics/student/:id - Student analytics
```

---

## 📚 Full Documentation

- **HOW_TO_RUN.md** - Complete startup guide
- **PROFILE_ANALYTICS_GUIDE.md** - Profile & analytics features
- **COMPLETE_SETUP.md** - Detailed setup instructions

---

## ✅ Success Indicators

✅ Backend: `Server listening on 4000`  
✅ Frontend: `Local: http://localhost:5173/`  
✅ Python: `Running on http://127.0.0.1:5000`  
✅ Browser: Login page loads  

---

**Need Help?** Check `HOW_TO_RUN.md` for detailed troubleshooting!
