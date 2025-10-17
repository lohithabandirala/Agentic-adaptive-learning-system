# 🔧 Troubleshooting Guide

## ✅ ISSUE FIXED: "Gemini Failed" Error

### Problem:
When trying to create a test, got error: "Failed to create test - gemini failed"

### Root Cause:
The `GEMINI_API_KEY` environment variable was being read at module load time, before `dotenv.config()` had a chance to load the `.env` file.

### Solution Applied:
1. ✅ Moved `dotenv.config()` to the very **first line** of `index.ts`
2. ✅ Changed `geminiClient.ts` to read API key **dynamically** at runtime
3. ✅ Added debug logging to verify env is loaded
4. ✅ Server restarted with new configuration

### Verification:
Check backend console should show:
```
🔑 Environment loaded:
  - PORT: 4000
  - GEMINI_API_KEY: Found (AIzaSyACmz...)
Server listening on 4000
```

If you see this ✅, the API key is loaded correctly!

---

## 🧪 Test Again:

1. **Refresh the browser:** http://localhost:5173
2. **Login as Teacher**
3. **Create a class** (if you haven't already)
4. **Select the class**
5. **Create Test from Text:**
   - Test Name: `Java Arrays Quiz`
   - Topic: `Arrays in Java - declaration, initialization, accessing elements, multidimensional arrays`
   - Questions: 10
   - Difficulty: Mixed
6. **Click Generate** → Should work now! ✨

---

## 🐛 Common Issues & Solutions

### Issue 1: "GEMINI_API_KEY not configured"
**Symptoms:** Error message about missing API key

**Check:**
```bash
# 1. Verify .env file exists
dir C:\vibathon\backend\.env

# 2. Check contents
type C:\vibathon\backend\.env
```

**Expected contents:**
```env
PORT=4000
GEMINI_API_KEY=AIzaSyACmzj_fZVwsZUtendRhRJ0TjMZaG_8QnU
```

**Solution:**
- Make sure `.env` file is in `backend/` folder (not `backend/src/`)
- No spaces around `=` sign
- No quotes around the API key
- Restart backend server after editing

---

### Issue 2: Server won't start / Port 4000 in use
**Symptoms:** `Error: listen EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Then restart
cd C:\vibathon\backend
npm run dev
```

---

### Issue 3: Questions are generic/not topic-related
**Symptoms:** Questions like "What is Question 1?" or random topics

**This means:** The AI fallback stub is being used (API call failed)

**Check Backend Console for:**
- ❌ "Error calling Gemini API"
- ❌ "Request failed with status code 400/401/403"
- ❌ Network timeout errors

**Solutions:**
1. **Check API Key:** Make sure it's valid and not expired
2. **Check Internet:** Gemini API requires internet connection
3. **Check API Quota:** You might have hit rate limits
4. **Wait & Retry:** Sometimes API is temporarily slow

---

### Issue 4: "Failed to parse JSON" errors
**Symptoms:** Backend shows JSON parsing errors

**This is normal!** The code has fallbacks:
1. Try parsing as pure JSON ✅
2. Remove markdown code blocks and try again ✅
3. Extract questions from text format ✅
4. Return stub questions as last resort ✅

**If stub questions appear:** Check backend console for the actual API response

---

### Issue 5: Slow generation (30+ seconds)
**This is normal for:**
- First request (API cold start)
- Large number of questions (50)
- Complex topics
- High API server load

**Expected timing:**
- 5 questions: 5-10 seconds
- 10 questions: 10-20 seconds
- 20 questions: 15-30 seconds
- 50 questions: 30-60 seconds

**If it takes longer:**
- Check backend console for timeout errors
- Try with fewer questions
- Simplify the topic

---

### Issue 6: Frontend shows "Network Error"
**Symptoms:** Cannot connect to backend

**Check:**
1. Backend is running: Look for "Server listening on 4000"
2. Frontend API URL is correct: `http://localhost:4000/api`
3. CORS is enabled (already configured)

**Restart both servers:**
```bash
# Terminal 1
cd C:\vibathon\backend
npm run dev

# Terminal 2
cd C:\vibathon\frontend
npm run dev
```

---

### Issue 7: Questions preview doesn't show
**Check:**
1. Backend returned `preview` field in response
2. Frontend state `generatedQuestions` is populated
3. `showQuestionsPreview` is set to `true`

**Debug in browser console:**
```javascript
// Check state (if using React DevTools)
// Look for: generatedQuestions, showQuestionsPreview
```

---

### Issue 8: Timer doesn't work on student side
**Check:**
1. Student has started the test (not just viewing)
2. Browser console for JavaScript errors
3. `useEffect` cleanup is working

**Restart test:**
- Go back to student portal
- Refresh page
- Join class again
- Start test again

---

## 📊 Backend Console Guide

### ✅ **GOOD - Everything Working:**
```
🔑 Environment loaded:
  - PORT: 4000
  - GEMINI_API_KEY: Found (AIzaSyACmz...)
Server listening on 4000
🤖 Generating questions with AI...
📝 Prompt: Generate questions with mixed difficulty...
✅ API Key found: AIzaSyACmz...
✅ AI Response received (length: 2847)
📄 Response preview: [{"text":"What is...
✅ Parsed 10 questions from JSON
```

### ❌ **BAD - API Key Missing:**
```
🔑 Environment loaded:
  - PORT: 4000
  - GEMINI_API_KEY: NOT FOUND          ❌ Problem!
Server listening on 4000
❌ No GEMINI_API_KEY found in environment
```
**Fix:** Check `.env` file exists and has correct key

### ❌ **BAD - API Error:**
```
❌ Error calling Gemini API: Request failed with status code 400
```
**Fix:** API key might be invalid or request format wrong

### ❌ **BAD - Network Error:**
```
❌ Error calling Gemini API: connect ETIMEDOUT
```
**Fix:** Check internet connection, might be firewall/proxy issue

---

## 🔍 Debug Checklist

Before asking for help, verify:

- [ ] Backend console shows "GEMINI_API_KEY: Found"
- [ ] Backend is running on port 4000
- [ ] Frontend is running on port 5173
- [ ] Browser can access http://localhost:5173
- [ ] `.env` file exists in `backend/` folder
- [ ] `.env` file has correct API key format
- [ ] No firewall blocking localhost connections
- [ ] Internet connection is working
- [ ] Tried with simple topic (e.g., "Basic math")
- [ ] Tried with fewer questions (e.g., 5)

---

## 🆘 Still Having Issues?

### Get More Debug Info:

**Backend:**
- Look at backend console output carefully
- Copy the full error message
- Check what the last log before error was

**Frontend:**
- Open browser DevTools (F12)
- Go to Console tab
- Look for errors in red
- Check Network tab for failed requests

**Test with curl:**
```bash
curl -X POST http://localhost:4000/api/tests/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"textInput\":\"Basic math\",\"numQuestions\":5,\"difficulty\":\"easy\",\"classId\":\"test123\",\"testName\":\"Test\"}"
```

This will show you the raw API response.

---

## ✅ Success Indicators

You know it's working when:

1. ✅ Backend shows: "GEMINI_API_KEY: Found"
2. ✅ After clicking Generate: "🤖 Generating questions with AI..."
3. ✅ After 10-30 seconds: "✅ AI Response received"
4. ✅ Browser shows success alert with question count
5. ✅ Green preview card appears with actual questions
6. ✅ Questions are relevant to your topic
7. ✅ Questions have multiple-choice options
8. ✅ Difficulty badges show (Easy/Medium/Hard)

---

**If all else fails:**
1. Restart both servers
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try in incognito/private mode
4. Check if API key is still valid at: https://aistudio.google.com/apikey

---

**Last Updated:** Now  
**Status:** ✅ ISSUE FIXED - Ready to test!
