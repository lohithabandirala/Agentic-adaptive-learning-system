# Emotion Detection Troubleshooting Guide

## ✅ ISSUE FIXED: Missing Props

**Problem**: EmotionTracker wasn't receiving `attemptId` and `studentId` props
**Solution**: Updated Student.tsx to pass these props

```tsx
<EmotionTracker 
  isActive={true}
  attemptId={attemptId || undefined}
  studentId={localStorage.getItem('userId') || undefined}
  onEmotionDetected={handleEmotionDetected}
/>
```

## 🔍 Complete Emotion Detection Flow

### 1. **Python Service** (Port 5001)
- **File**: `python-emotion-service/app.py`
- **Endpoint**: `POST /detect-emotion`
- **Input**: Base64 image from webcam
- **Output**: 
  ```json
  {
    "success": true,
    "emotions": {
      "happy": 45.2,
      "sad": 10.3,
      "angry": 5.1,
      "fear": 3.2,
      "neutral": 30.5,
      "surprise": 4.2,
      "disgust": 1.5
    },
    "dominantEmotion": "happy",
    "stressLevel": 0.25
  }
  ```

### 2. **Frontend EmotionTracker** (React Component)
- **File**: `frontend-webapp/src/components/EmotionTracker.tsx`
- **Captures**: Webcam frame every 3 seconds
- **Sends**: Image to Python service
- **Receives**: Emotion data
- **Saves**: To backend API

### 3. **Backend API** (Port 4000)
- **Endpoint**: `POST /api/emotions/track`
- **Stores**: Emotion data in MongoDB
- **Used by**: ADK agent for adaptive difficulty

## ⚠️ Common Issues & Solutions

### Issue 1: "Emotion detection not starting"

**Symptoms**:
- No webcam access prompt
- EmotionTracker not visible

**Check**:
1. Is the test active?
   ```tsx
   <EmotionTracker isActive={true} /> // Should be true during test
   ```

2. Browser console errors?
   - Press F12
   - Look for camera permission errors

**Solution**:
- Allow camera access in browser
- Check if EmotionTracker component is rendered

### Issue 2: "Python service not responding"

**Symptoms**:
- Console error: `Failed to analyze emotion: Network Error`
- Backend logs: No emotion data

**Check**:
```bash
# Test if Python service is running
curl http://localhost:5001/health
```

**Expected Response**:
```json
{"status": "healthy"}
```

**Solution**:
```bash
cd python-emotion-service
start.bat
```

**Verify**:
Look for:
```
INFO:__main__:🚀 Starting Python Emotion Detection Service...
INFO:__main__:📍 Service will run on http://127.0.0.1:5001
* Running on http://127.0.0.1:5001
```

### Issue 3: "Camera access denied"

**Symptoms**:
- Error: "NotAllowedError: Permission denied"
- No webcam feed

**Solution**:
1. **Chrome**: Click camera icon in address bar → Allow
2. **Edge**: Settings → Site permissions → Camera → Allow
3. **Firefox**: Click camera icon → Allow

**Test**:
- Open browser console (F12)
- Should see: `✅ Webcam started successfully`

### Issue 4: "Emotions showing 0.00 in backend"

**Symptoms**:
Backend logs show:
```
✓ Avg Stress: 3.8 (Emotion: 0.00)
```

**Reasons**:
1. **Test already completed** - Emotions only captured during active test
2. **Camera not accessed** - User didn't allow camera
3. **Props not passed** - Fixed now! (see top of document)

**Solution**:
1. Start a **NEW** test (not completed one)
2. Allow camera access
3. Check browser console for:
   ```
   ✅ Emotion detected: happy Stress: 25.3%
   ✅ Emotion saved to backend
   ```

### Issue 5: "Wrong port or endpoint"

**Symptoms**:
- 404 Not Found
- CORS errors

**Check Frontend** (`EmotionTracker.tsx` line 125):
```typescript
await axios.post('http://localhost:5001/detect-emotion', {
  image: imageData
});
```

✅ Should be: Port **5001**, Endpoint **/detect-emotion**
❌ NOT: Port 5000, Endpoint /analyze

**Check Backend** (`EmotionTracker.tsx` line 141):
```typescript
await axios.post('http://localhost:4000/api/emotions/track', {
  attemptId, studentId, emotion, stressLevel
});
```

✅ Should be: Port **4000**, Endpoint **/api/emotions/track**

## 🧪 Step-by-Step Testing

### Test 1: Python Service Health
```bash
curl http://localhost:5001/health
```
**Expected**: `{"status": "healthy"}`

### Test 2: Simple Emotion Detection
```bash
curl -X POST http://localhost:5001/detect-emotion-simple
```
**Expected**: Mock emotion data

### Test 3: Frontend to Python
1. Open browser console (F12)
2. Start a test
3. Allow camera
4. Look for:
   ```
   POST http://localhost:5001/detect-emotion 200 OK
   ✅ Emotion detected: happy Stress: 25.3%
   ```

### Test 4: Frontend to Backend
Check backend terminal for:
```
POST /api/emotions/track 201
```

### Test 5: Database Storage
Check if emotions are saved:
```javascript
// MongoDB query
db.emotiontrackings.find().sort({timestamp: -1}).limit(5)
```

## 📊 Expected Console Logs

### **Browser Console** (During Test):
```
Webcam started successfully
Capturing frame for emotion analysis...
✅ Emotion detected: happy Stress: 25.3%
✅ Emotion saved to backend
Capturing frame for emotion analysis...
✅ Emotion detected: neutral Stress: 18.5%
✅ Emotion saved to backend
```

### **Python Terminal**:
```
INFO:werkzeug:127.0.0.1 - - [18/Oct/2025 10:45:23] "POST /detect-emotion HTTP/1.1" 200 -
INFO:__main__:Emotion detected: happy, Stress: 0.25
INFO:werkzeug:127.0.0.1 - - [18/Oct/2025 10:45:26] "POST /detect-emotion HTTP/1.1" 200 -
INFO:__main__:Emotion detected: neutral, Stress: 0.18
```

### **Backend Terminal**:
```
POST /api/emotions/track 201
😊 Emotion saved: happy, stress: 0.25
POST /api/emotions/track 201
😊 Emotion saved: neutral, stress: 0.18
```

## 🔧 Quick Fixes

### Fix 1: Restart Python Service
```bash
# Stop current service (Ctrl+C)
cd python-emotion-service
start.bat
```

### Fix 2: Clear Browser Cache
```
Ctrl + Shift + Delete → Clear cache → Reload page
```

### Fix 3: Check All Services Running
```bash
# Test backend
curl http://localhost:4000/api/health

# Test frontend
curl http://localhost:5173

# Test python
curl http://localhost:5001/health
```

### Fix 4: Verify Props Passed (ALREADY FIXED)
```tsx
// Student.tsx should have:
<EmotionTracker 
  isActive={true}
  attemptId={attemptId || undefined}  // ✅ NOW INCLUDED
  studentId={localStorage.getItem('userId') || undefined}  // ✅ NOW INCLUDED
  onEmotionDetected={handleEmotionDetected}
/>
```

## 📝 Debugging Checklist

- [ ] Python service running on port 5001
- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] Camera permission granted in browser
- [ ] Test is active (not completed)
- [ ] Browser console shows no errors
- [ ] EmotionTracker component visible
- [ ] Props (attemptId, studentId) are passed ✅ FIXED
- [ ] Backend logs show emotion saves
- [ ] Python logs show emotion detection

## 🎯 Verification Steps

### Step 1: Start New Test
1. Login as student
2. Click "Start Test" on any test
3. You should see EmotionTracker in bottom-right

### Step 2: Grant Camera Access
1. Browser prompts for camera
2. Click "Allow"
3. You should see live webcam feed

### Step 3: Verify Detection
1. Open browser console (F12)
2. Wait 3 seconds
3. Should see: `✅ Emotion detected`

### Step 4: Check Backend
1. Look at backend terminal
2. Should see: `POST /api/emotions/track 201`

### Step 5: Check Results
1. Complete test
2. View results
3. Emotion data should show >0%

## 💡 Pro Tips

1. **Camera takes 3 seconds** to start capturing
2. **Emotions captured every 3 seconds** during test
3. **Stress level is 0-1 scale**, displayed as 0-100%
4. **Dominant emotion** is the highest percentage
5. **Progress tracked** even if camera fails (uses fallback)

## 🚨 Emergency Fallback

If emotion detection still doesn't work, the system will:
- ✅ Continue the test normally
- ✅ Use default stress values (0.25)
- ✅ Track answers and progress
- ✅ Generate results

**Your test won't break!** Emotion detection is an enhancement, not required.

## 📞 Still Having Issues?

Check these files in order:
1. `python-emotion-service/app.py` - Python service
2. `frontend-webapp/src/components/EmotionTracker.tsx` - Frontend component
3. `backend-webapp/src/routes/emotions.ts` - Backend API
4. Browser console (F12) - Error messages
5. Backend terminal - API logs
6. Python terminal - Service logs

**Most Recent Fix**: Added `attemptId` and `studentId` props to EmotionTracker in Student.tsx ✅

Your emotion detection should now work perfectly! 🎉
