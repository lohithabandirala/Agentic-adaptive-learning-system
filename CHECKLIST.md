# ✅ Integration Setup Checklist

Use this checklist to ensure everything is properly configured before running the integrated system.

---

## 📋 Pre-Installation Checklist

### System Requirements
- [ ] Python 3.8 or higher installed
  - Check: `python --version`
- [ ] Node.js 16 or higher installed
  - Check: `node --version`
- [ ] npm installed
  - Check: `npm --version`
- [ ] Webcam connected and functional
- [ ] Stable internet connection (for API calls)

### Account Setup
- [ ] Google Cloud account created
- [ ] Google Gemini API key obtained
  - Get it from: https://ai.google.dev/

---

## 🔧 Installation Checklist

### Python Dependencies
- [ ] Run: `pip install -r integrated_requirements.txt`
- [ ] Verify installation:
  - [ ] `python -c "import cv2; print('OpenCV OK')"`
  - [ ] `python -c "import deepface; print('DeepFace OK')"`
  - [ ] `python -c "import requests; print('Requests OK')"`

### Node.js Dependencies
- [ ] Navigate to `ai service` folder
- [ ] Run: `npm install`
- [ ] Check for errors in installation
- [ ] Verify `node_modules` folder exists

### Configuration
- [ ] Create `.env` file in `ai service` folder
- [ ] Add `GOOGLE_CLOUD_API_KEY=your_key_here` to `.env`
- [ ] Add `PORT=3000` to `.env` (optional)
- [ ] Verify `.env` file is not committed to git (check `.gitignore`)

---

## 🧪 Testing Checklist

### AI Service Test
- [ ] Open terminal/cmd in `ai service` folder
- [ ] Run: `npm start`
- [ ] Check for: "🚀 AI Question Generator API running on http://localhost:3000"
- [ ] Open browser to: http://localhost:3000/api/health
- [ ] Verify response shows: `{"success": true, ...}`
- [ ] Keep this terminal open

### Integration Test (No Webcam)
- [ ] Open new terminal/cmd in project root
- [ ] Run: `python test_integration.py`
- [ ] Verify all 3 tests pass:
  - [ ] AI Service Connection ✅
  - [ ] Question Generation (Low Stress) ✅
  - [ ] Question Generation (High Stress) ✅
- [ ] Check for generated `test_output_*.json` file

---

## 🎥 Webcam Test

### Camera Access
- [ ] Camera is not being used by other applications
- [ ] Camera permissions are granted
- [ ] Test camera with Windows Camera app (or equivalent)
- [ ] Camera LED light turns on when accessed

---

## 🚀 Full System Run Checklist

### Before Running
- [ ] AI Service is running (Terminal 1)
- [ ] Camera is connected and free
- [ ] Good lighting conditions for face detection
- [ ] Face camera directly (not at angle)

### During Run
- [ ] Window opens showing camera feed
- [ ] Face rectangle appears (green box)
- [ ] Emotion labels appear on screen
- [ ] Countdown timer is visible
- [ ] Frame count increases

### After Run
- [ ] Emotion analysis summary displayed
- [ ] Questions are generated and shown
- [ ] Files are created:
  - [ ] `emotion_summary_*.json`
  - [ ] `integrated_output_*.json`

---

## 🔍 Troubleshooting Checklist

### If AI Service Won't Start
- [ ] Check if port 3000 is already in use
  - Windows: `netstat -ano | findstr :3000`
- [ ] Verify `.env` file exists and has valid API key
- [ ] Check `npm install` completed without errors
- [ ] Try: `npm install` again

### If Camera Won't Open
- [ ] Close other apps using camera (Zoom, Teams, etc.)
- [ ] Check Device Manager for camera status
- [ ] Try different camera index (change `0` to `1` in code)
- [ ] Restart computer if camera is stuck

### If Emotions Not Detected
- [ ] Ensure face is well-lit
- [ ] Face camera directly
- [ ] Remove glasses/masks if possible
- [ ] Get closer to camera
- [ ] Check for error messages in console

### If Questions Not Generated
- [ ] Verify AI service is running
- [ ] Check console for error messages
- [ ] Verify API key is valid
- [ ] Check internet connection
- [ ] Look for quota/billing issues on Google Cloud

### If Getting Import Errors
- [ ] Activate Python virtual environment (if using)
- [ ] Re-run: `pip install -r integrated_requirements.txt`
- [ ] Check Python version: `python --version`
- [ ] Try: `pip install --upgrade pip`

---

## 📊 Expected Output Verification

### Console Output Should Include:
```
✅ Starting 20-second emotion detection...
✅ Emotion detection completed!
✅ Emotion analysis summary (dominant emotion, stress level)
✅ Sending request to AI service
✅ Questions generated successfully!
✅ Question details (difficulty, bloom level, etc.)
✅ Files saved confirmation
```

### Files Should Be Created:
```
vibethon/
├── emotion_summary_YYYYMMDD_HHMMSS.json
└── integrated_output_YYYYMMDD_HHMMSS.json
```

### JSON Structure Verification:
- [ ] `emotion_summary_*.json` contains:
  - [ ] `overall_dominant_emotion`
  - [ ] `stress_level` (1-5)
  - [ ] `dominant_emotion_percentages`
  - [ ] `detailed_timeline`

- [ ] `integrated_output_*.json` contains:
  - [ ] `emotionData` object
  - [ ] `questions` object with `success: true`
  - [ ] Array of question objects

---

## 🎯 Performance Benchmarks

### Normal Performance:
- [ ] Emotion detection: ~20 seconds
- [ ] Frame processing: 100-200 frames total
- [ ] API request: 5-15 seconds
- [ ] Total workflow: 25-40 seconds
- [ ] Question count: Matches requested count (default 5)

### If Performance is Slow:
- [ ] Check internet speed
- [ ] Close unnecessary applications
- [ ] Reduce video quality (lower FPS)
- [ ] Ensure computer meets minimum specs

---

## 📱 Quick Test Commands

Copy and paste these to quickly verify:

```bash
# Test Python installation
python --version
python -c "import cv2, deepface, requests; print('All Python packages OK')"

# Test Node.js installation
node --version
npm --version

# Test AI Service (in ai service folder)
cd "ai service"
npm start

# Test Integration (in new terminal)
python test_integration.py

# Run Full System
python integrated_emotion_assessment.py
```

---

## ✨ Final Verification

Before presenting/demoing:
- [ ] Run complete workflow end-to-end
- [ ] Verify all output files are created
- [ ] Check JSON files are valid (open in text editor)
- [ ] Test with different topics
- [ ] Test with different stress levels (try to look calm vs. anxious)
- [ ] Prepare sample outputs to show

---

## 🎓 Ready to Demo

When all checkboxes are complete:
- [ ] System runs without errors
- [ ] Emotion detection works
- [ ] Questions are generated
- [ ] Output files are created
- [ ] You understand the workflow

**You're ready to present! 🎉**

---

## 📝 Notes Section

Use this space to track any issues or configurations specific to your setup:

```
Date: ___________
Issue: ___________________________________________________________
Solution: ________________________________________________________
_________________________________________________________________

Date: ___________
Issue: ___________________________________________________________
Solution: ________________________________________________________
_________________________________________________________________

Date: ___________
Issue: ___________________________________________________________
Solution: ________________________________________________________
_________________________________________________________________
```

---

## 🆘 Emergency Quick Fixes

### If everything breaks:
1. Close all terminals
2. Restart computer
3. Run: `setup-integrated-system.bat`
4. Verify `.env` file
5. Run: `python test_integration.py`
6. If tests pass, try full system again

### If still not working:
1. Check all items in this checklist
2. Review error messages carefully
3. Check `INTEGRATION_README.md` troubleshooting section
4. Verify internet connection
5. Check Google Cloud API quota

---

**Keep this checklist handy during setup and demo! 📋✅**
