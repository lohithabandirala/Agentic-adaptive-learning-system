# API Quota Management & Error Handling - Complete Guide

## ✅ Changes Implemented

### 1. New Google Cloud Credentials Added
**File**: `backend-webapp/.env`
```env
GOOGLE_CLOUD_PROJECT=inlaid-plasma-472505-q2
GOOGLE_APPLICATION_CREDENTIALS=./inlaid-plasma-472505-q2-55a6c32d4bde.json
```

The service account credentials file has been added to your project root. This provides access to Vertex AI which has higher quotas than the free Gemini API.

### 2. Quota Management System
**File**: `backend-webapp/src/services/adkAgent.ts`

Added intelligent quota tracking:
```typescript
// Tracks API calls per day
let apiCallsToday = 0;
let lastResetDate = new Date().toDateString();
const DAILY_QUOTA_LIMIT = 45; // Buffer from 50 limit

function checkAndResetQuota() {
  // Resets counter each day
}

function canMakeAPICall(): boolean {
  // Checks if we can make more API calls
}

function incrementAPICall() {
  // Tracks usage: "API calls today: 45/45"
}
```

### 3. Fallback Question Generator
**File**: `backend-webapp/src/services/fallbackQuestions.ts`

Template-based question generation when quota is exceeded:
- **Polynomial questions**: Easy, medium, hard (15+ questions)
- **Quadratic equations**: Solving, discriminant
- **Calculus**: Derivatives, power rule
- **Geometry**: Triangles, circles
- **Generic templates**: For unknown topics

Example questions:
```json
{
  "question": "What is the degree of the polynomial 3x² + 5x - 7?",
  "options": ["0", "1", "2", "3"],
  "correctAnswer": "2",
  "explanation": "The degree is the highest power of the variable.",
  "difficulty": "easy",
  "topic": "polynomials basics"
}
```

### 4. Automatic Fallback on Quota Exceeded
**Updated**: `generateQuestionsWithFullADK()` and `analyzeSessionWithFullADK()`

**Before API call**:
```typescript
if (!canMakeAPICall()) {
  console.log('⚠️ API quota exceeded, using fallback');
  const fallbackQuestions = generateFallbackQuestions({ topic, count, difficulty });
  return { success: true, questions: fallbackQuestions, usedFallback: true };
}
```

**On API error**:
```typescript
catch (error: any) {
  const isQuotaError = error.message?.includes('quota') || 
                       error.message?.includes('429') ||
                       error.message?.includes('Too Many Requests');
  
  if (isQuotaError) {
    // Use fallback templates
    return { success: true, questions: fallbackQuestions, usedFallback: true };
  }
}
```

### 5. Error Handling Pages

#### ErrorBoundary Component
**File**: `frontend-webapp/src/components/ErrorBoundary.tsx`

Catches React errors globally:
- Beautiful error UI with red gradient
- Shows error details for debugging
- "Return to Home" and "Reload Page" buttons
- Wraps entire app

#### 404 Not Found Page
**File**: `frontend-webapp/src/pages/NotFound.tsx`

Custom 404 page:
- Purple gradient design with large "404"
- "Go Back" and "Return to Home" buttons
- Friendly messaging

#### Quota Warning Component
**File**: `frontend-webapp/src/components/QuotaWarning.tsx`

Yellow/orange notification:
- Appears top-right when quota exceeded
- Explains fallback system is active
- "Your progress is still being tracked" ✓
- Dismissible

### 6. Updated App Router
**File**: `frontend-webapp/src/App.tsx`

```tsx
<ErrorBoundary>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/teacher" element={<Teacher />} />
    <Route path="/student" element={<Student />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/student/profile" element={<StudentProfile />} />
    <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
    <Route path="*" element={<NotFound />} /> {/* 404 catch-all */}
  </Routes>
</ErrorBoundary>
```

## 📊 How It Works

### Normal Flow (Within Quota):
1. Student starts test
2. System checks: `canMakeAPICall()` → ✅ Yes (35/45)
3. Calls Google Gemini API
4. `incrementAPICall()` → Now 36/45
5. AI generates personalized questions
6. Student sees AI-powered questions ✨

### Quota Exceeded Flow:
1. Student starts test
2. System checks: `canMakeAPICall()` → ❌ No (45/45)
3. **Automatically** uses `generateFallbackQuestions()`
4. Returns template-based questions
5. Student sees quality template questions 📚
6. *Optional*: Show QuotaWarning notification
7. **Progress still tracked**, analytics still work

### Error Catch Flow:
1. API call made but Google returns 429 error
2. Catch block detects: `isQuotaError = true`
3. **Automatically** switches to fallback
4. Logs: "⚠️ Quota exceeded, using fallback"
5. Test continues seamlessly

## 🎯 Benefits

### For Students:
- ✅ **Never blocked** - Always get questions
- ✅ **Seamless experience** - No interruption
- ✅ **Progress tracked** - Analytics continue
- ✅ **Quality questions** - Template questions are well-designed

### For Teachers:
- ✅ **Reliable system** - Works even with quota limits
- ✅ **Cost control** - Free tier doesn't get exceeded unexpectedly
- ✅ **Data preserved** - All attempts saved to database

### For You (Developer):
- ✅ **No crashes** - Graceful handling
- ✅ **Clear logs** - "API calls today: X/45"
- ✅ **Error tracking** - Failed analyses saved for debugging
- ✅ **Hackathon ready** - Won't fail during demo

## 🔧 Configuration

### Adjust Quota Limit:
```typescript
// backend-webapp/src/services/adkAgent.ts
const DAILY_QUOTA_LIMIT = 45; // Change this number
```

### Add More Fallback Questions:
Edit `backend-webapp/src/services/fallbackQuestions.ts`:
```typescript
function generatePolynomialQuestions() {
  const easyQuestions = [
    // Add more questions here
  ];
}
```

### Customize Error Pages:
- `frontend-webapp/src/components/ErrorBoundary.tsx` - Error boundary
- `frontend-webapp/src/pages/NotFound.tsx` - 404 page
- `frontend-webapp/src/components/QuotaWarning.tsx` - Quota notification

## 📝 Backend Logs

### Normal Operation:
```
🤖 FULL ADK AGENT: Generating 5 questions
📊 API calls today: 35/45
✅ Generated 5 personalized questions using 2 iterations
```

### Quota Exceeded (Proactive):
```
🤖 FULL ADK AGENT: Generating 5 questions
⚠️ API quota exceeded, using fallback question generator
💾 Fallback Analysis saved
✅ Questions ready (using templates)
```

### Quota Exceeded (Error Caught):
```
🤖 FULL ADK AGENT: Generating 5 questions
📊 API calls today: 45/45
❌ Full ADK Agent Error: [429 Too Many Requests] Quota exceeded
⚠️ Quota exceeded, using fallback question generator
💾 Fallback Analysis saved
✅ Questions ready (using templates)
```

### Daily Reset:
```
🔄 API quota reset for new day
📊 API calls today: 0/45
```

## 🚀 Testing the System

### Test Quota Management:
1. Lower the limit temporarily:
   ```typescript
   const DAILY_QUOTA_LIMIT = 2; // Set to 2 for testing
   ```
2. Start 3 tests in a row
3. First 2 use AI, 3rd uses fallback
4. Check logs for "⚠️ API quota exceeded"

### Test Error Boundary:
1. Add this to any component:
   ```typescript
   throw new Error('Test error');
   ```
2. See error boundary page
3. Click "Return to Home"

### Test 404 Page:
1. Navigate to: `http://localhost:5173/invalid-page`
2. See custom 404 page
3. Click "Return to Home"

## 💾 Database Tracking

All AI calls are logged to `AIAnalysis` collection:
```json
{
  "attemptId": "attempt_123",
  "studentId": "student_456",
  "analysisType": "question_generation",
  "aiModel": "fallback-templates", // or "gemini-2.0-flash-exp"
  "usedFallback": true,
  "questionsGenerated": 5,
  "success": true,
  "processingTimeMs": 45
}
```

## 🎉 Ready for Hackathon!

Your system now:
- ✅ **Never crashes** from quota limits
- ✅ **Automatically** switches to fallback
- ✅ **Tracks** all API usage
- ✅ **Handles** all errors gracefully
- ✅ **Shows** friendly error pages
- ✅ **Continues** tracking student progress
- ✅ **Provides** quality questions always

## 📞 Support

If you encounter issues:
1. Check backend logs for quota usage
2. Verify credentials file is in place
3. Check `.env` file has correct paths
4. Review `AIAnalysis` collection for errors

Your system is now production-ready with comprehensive error handling! 🚀
