# 🚀 Quick Start Guide - Integrated Emotion Assessment System

## ⚡ 5-Minute Setup

### Prerequisites Check
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Webcam connected
- [ ] Google Cloud API Key ready

---

## 📦 Installation (One-time Setup)

### 1. Install Python Dependencies
```bash
pip install -r integrated_requirements.txt
```

### 2. Install Node.js Dependencies
```bash
cd "ai service"
npm install
cd ..
```

### 3. Configure API Key
Create `ai service\.env` file:
```env
GOOGLE_CLOUD_API_KEY=your_api_key_here
PORT=3000
```

---

## 🎯 Running the System (Windows)

### Option A: Using Batch Files (Easiest)

**Step 1:** Double-click `start-ai-service.bat`
- This opens a new window with the AI service running
- Keep this window open

**Step 2:** Double-click `run-integrated-system.bat`
- Enter topic when prompted
- Look at camera for 20 seconds
- Get personalized questions!

### Option B: Manual (Two Terminals)

**Terminal 1 (AI Service):**
```bash
cd "ai service"
npm start
```

**Terminal 2 (Emotion Detection):**
```bash
python integrated_emotion_assessment.py
```

---

## 🎮 Usage Flow

1. **Start AI Service** ✅
   ```
   🚀 AI Question Generator API running on http://localhost:3000
   ```

2. **Run Python Script** ✅
   ```
   python integrated_emotion_assessment.py
   ```

3. **Enter Topic** ✅
   ```
   Enter the topic for questions: Photosynthesis
   ```

4. **Face Camera** ✅
   - Look at camera for 20 seconds
   - Maintain natural expression
   - Press 'q' to stop early

5. **Review Results** ✅
   - Emotion analysis summary
   - Personalized adaptive questions
   - Saved JSON files

---

## 📊 Expected Output

### Console Output:
```
==========================================
EMOTION ANALYSIS SUMMARY
==========================================
Dominant Emotion: happy
Stress Level: 2/5
Frames Analyzed: 156
==========================================

🤖 Generating adaptive questions...

==========================================
ADAPTIVE QUESTIONS GENERATED
==========================================
Total Questions: 5

Question 1:
  Topic: Photosynthesis
  Difficulty: 2/5
  Bloom Level: Understand
  ...
```

### Generated Files:
```
emotion_summary_20251017_143025.json
integrated_output_20251017_143045.json
```

---

## 🔍 Verification Steps

### Check AI Service is Running:
Visit: http://localhost:3000/api/health

Expected response:
```json
{
  "success": true,
  "message": "AI Question Generator API is running"
}
```

### Check Webcam:
- Camera light should turn on when script runs
- Window shows live video feed with emotion labels

---

## ⚠️ Common Issues & Quick Fixes

### 1. "Cannot connect to AI service"
**Fix:** Make sure AI service is running (npm start in "ai service" folder)

### 2. "Camera not found"
**Fix:** 
- Check webcam connection
- Close other apps using camera
- Try changing camera index in code

### 3. "Module not found" errors
**Fix:**
```bash
pip install -r integrated_requirements.txt
cd "ai service"
npm install
```

### 4. "Invalid API key"
**Fix:** Check `.env` file in "ai service" folder has valid Google Cloud API key

---

## 🎨 Demo Topics to Try

- **Science**: "Photosynthesis", "Newton's Laws", "Chemical Reactions"
- **Math**: "Quadratic Equations", "Trigonometry", "Calculus"
- **Programming**: "Python Programming", "JavaScript Basics", "Data Structures"
- **General**: "World History", "Geography", "Literature"

---

## 📱 Sample Session

```
$ python integrated_emotion_assessment.py

Enter the topic for questions: Python Programming
Enter student ID (press Enter for default): 
Enter grade level (press Enter for default): 

📊 Starting emotion detection for 20 seconds...
💡 Tip: Maintain natural expression while looking at camera

[Camera window opens - analyze for 20 seconds]

==========================================
EMOTION ANALYSIS SUMMARY
==========================================
Dominant Emotion: happy
Stress Level: 2/5
Frames Analyzed: 145
==========================================

🤖 Generating adaptive questions based on emotional state...

==========================================
ADAPTIVE QUESTIONS GENERATED
==========================================
Total Questions: 5

[Questions displayed here...]

✅ Complete output saved to: integrated_output_20251017_143045.json
```

---

## 🎯 Next Steps

1. ✅ Run the system with different topics
2. ✅ Try different emotional states (practice being calm vs stressed)
3. ✅ Review the generated JSON files
4. ✅ Analyze how questions adapt to your emotional state
5. ✅ Integrate into your application/platform

---

## 📞 Need Help?

1. Check `INTEGRATION_README.md` for detailed documentation
2. Review individual component READMEs
3. Check console output for error messages
4. Verify all prerequisites are installed

---

**Ready to start? Run `start-ai-service.bat` followed by `run-integrated-system.bat`!** 🚀
