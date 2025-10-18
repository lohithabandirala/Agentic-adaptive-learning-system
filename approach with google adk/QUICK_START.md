# 🚀 Quick Start Guide - Unified AI Learning System

## ✅ Phases Complete: 6/8

### What's Ready:
- ✅ Backend with emotion tracking API
- ✅ Frontend with webcam emotion detection
- ✅ Python emotion analysis service
- ✅ Automated installation scripts
- ✅ Automated startup scripts
- ✅ Complete integration documentation

---

## 🎯 Quick Commands

### First Time Setup (Run Once):
```batch
cd "c:\Users\NARENDAR\Documents\Hackathons\vibethon\approach with google adk"
scripts\install-all.bat
```
⏱️ Takes: ~10-15 minutes (downloads Python + Node packages)

### Start Everything:
```batch
scripts\start-all.bat
```
Opens 3 terminals:
1. Python Emotion Service (Port 5000)
2. Backend API (Port 4000)
3. Frontend Web App (Port 5173)

### Access Application:
**Open browser:** http://localhost:5173

---

## 📋 Testing Checklist

### As Teacher:
- [ ] Login with teacher account
- [ ] Create a new class
- [ ] Note the 6-character class code
- [ ] Create a test using AI generation
- [ ] Verify test questions generated

### As Student:
- [ ] Login with student account
- [ ] Join class using code
- [ ] Start a test
- [ ] **Allow webcam access** when prompted
- [ ] Verify EmotionTracker appears (bottom-right)
- [ ] Answer questions
- [ ] Watch emotion emoji update every ~3 seconds
- [ ] Complete test
- [ ] View results with analytics

### Verification:
- [ ] Check browser console for emotion logs
- [ ] Verify Python service logs emotion analysis
- [ ] Check MongoDB `emotiontrackings` collection
- [ ] Verify backend logs show POST /api/emotions/track

---

## 🔍 Troubleshooting

### Webcam Not Working:
- Browser needs camera permission
- Only works on HTTPS or localhost
- Check if another app is using webcam

### Python Service Not Starting:
```batch
cd python-emotion-service
.venv\Scripts\activate
python emotion_server.py
```
If error, reinstall:
```batch
pip install -r requirements.txt --force-reinstall
```

### Backend Not Starting:
Check `.env` file exists in `backend-webapp/`:
```env
PORT=4000
DB_URL=mongodb+srv://your-connection-string
GEMINI_API_KEY=your-api-key
```

### Frontend Not Starting:
```batch
cd frontend-webapp
npm install --force
npm run dev
```

### Port Already in Use:
Kill processes on ports 4000, 5000, 5173:
```batch
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

---

## 📂 Key Files Modified/Created

### Backend (backend-webapp/):
- ✅ `src/db/models/EmotionTracking.ts` - NEW
- ✅ `src/routes/emotions.ts` - NEW
- ✅ `src/index.ts` - UPDATED (added emotion routes)
- ✅ `src/db/models/Attempt.ts` - UPDATED (added emotion fields)

### Frontend (frontend-webapp/):
- ✅ `src/components/EmotionTracker.tsx` - NEW
- ✅ `src/pages/Student.tsx` - UPDATED (webcam integration)

### Python Service (python-emotion-service/):
- ✅ `emotion_server.py` - Flask server
- ✅ `emotion_detector.py` - DeepFace logic
- ✅ `requirements.txt` - Dependencies
- ✅ `start-emotion-service.bat` - Startup script

### Scripts (scripts/):
- ✅ `install-all.bat` - NEW
- ✅ `start-all.bat` - NEW

---

## 🎯 Next Steps

### Phase 7: Complete System Testing
1. Run install-all.bat
2. Run start-all.bat
3. Test teacher flow
4. Test student flow with webcam
5. Verify MongoDB data
6. Document any issues

### Phase 8: Push to GitHub
```batch
cd "approach with google adk"
git add .
git commit -m "feat: Complete integration with emotion tracking"
git push origin main
```

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Student Browser                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │         React Frontend (Port 5173)                │  │
│  │  ┌──────────────────────────────────────────┐   │  │
│  │  │      EmotionTracker Component            │   │  │
│  │  │  - Webcam capture every 3s               │   │  │
│  │  │  - Base64 image encoding                 │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
           │                              │
           │ Axios POST                   │ Axios POST
           │ /analyze                     │ /api/emotions/track
           ↓                              ↓
┌──────────────────────┐    ┌──────────────────────────────┐
│  Python Service      │    │  Backend API (Port 4000)     │
│  (Port 5000)         │    │  - Express + TypeScript      │
│  - Flask             │    │  - Emotion routes            │
│  - DeepFace          │    │  - Auth middleware           │
│  - OpenCV            │    │  - MongoDB connection        │
│  - TensorFlow        │    └──────────────────────────────┘
└──────────────────────┘                  │
           │                              │ Mongoose
           │ Returns:                     │ Save
           │ {emotions, stress}           ↓
           └─────────────────────→  ┌──────────────────────┐
                                    │  MongoDB Atlas       │
                                    │  - emotiontrackings  │
                                    │  - attempts          │
                                    │  - users, classes    │
                                    └──────────────────────┘
```

---

## 💡 Tips

- **First Run**: Python package installation takes longest
- **Webcam**: Works best in good lighting
- **Emotion Updates**: Takes ~3-5 seconds between updates
- **Performance**: Close other applications for best results
- **Privacy**: Video frames processed locally, not stored

---

## 📞 Support

If you encounter issues:
1. Check console logs in browser (F12)
2. Check terminal output for errors
3. Verify all 3 services are running
4. Check MongoDB connection
5. Review PHASE_5_COMPLETE.md for details

---

## 🎉 Success Metrics

You'll know it's working when:
- ✅ All 3 terminal windows open successfully
- ✅ Frontend loads at localhost:5173
- ✅ Webcam activates during test
- ✅ Emotion emoji updates every few seconds
- ✅ Stress percentage displays
- ✅ Backend logs show emotion tracking
- ✅ MongoDB contains emotion data

---

**Ready to start?** Run `scripts\install-all.bat` now! 🚀
