# 📋 Phase 4 Completion Guide - Backend Integration

## ✅ Already Completed

I've created the following files in the correct location:

1. **EmotionTracking Model**: `c:\Users\NARENDAR\Documents\Hackathons\vibethon\backend\src\db\models\EmotionTracking.ts`
   - Mongoose schema for emotion tracking data
   - Indexes for efficient queries
   - Fields: studentId, attemptId, emotions, dominantEmotion, stressLevel, questionNumber

2. **Emotion Routes**: `c:\Users\NARENDAR\Documents\Hackathons\vibethon\backend\src\routes\emotions.ts`
   - POST /track - Save emotion data during test
   - GET /history/:attemptId - Get emotion history
   - GET /summary/:attemptId - Get emotion analytics
   - GET /student/:studentId - Teacher/admin access to student emotions

---

## 🔧 Manual Steps Needed

You need to complete these 2 manual edits:

### Step 1: Update Backend Server (index.ts)

**File**: `c:\Users\NARENDAR\Documents\Hackathons\vibethon\backend\src\index.ts`

**Action**: Add emotion routes to the Express server

**Where to add**: Near the other route imports at the top of the file

```typescript
// Add this import with other route imports
import emotionRoutes from './routes/emotions';
```

**Where to add**: Near the other `app.use()` route registrations

```typescript
// Add this line with other route registrations
app.use('/api/emotions', emotionRoutes);
```

**Example of what it should look like**:

```typescript
// Other imports...
import authRoutes from './routes/auth';
import classRoutes from './routes/classes';
import testRoutes from './routes/tests';
import materialRoutes from './routes/materials';
import emotionRoutes from './routes/emotions';  // ← ADD THIS

// ... middleware setup ...

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/emotions', emotionRoutes);  // ← ADD THIS
```

---

### Step 2: Update Attempt Model

**File**: `c:\Users\NARENDAR\Documents\Hackathons\vibethon\backend\src\db\models\Attempt.ts`

**Action**: Add emotion tracking fields to the answers array

**Find this section** (around line 20-30):

```typescript
answers: [{
  questionId: { type: String, required: true },
  answer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number, required: true }
}]
```

**Replace with** (add 2 new fields):

```typescript
answers: [{
  questionId: { type: String, required: true },
  answer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number, required: true },
  stressLevel: { type: Number, min: 0, max: 1 },        // ← ADD THIS
  dominantEmotion: { type: String }                      // ← ADD THIS
}]
```

---

## ✅ Verification

After making these changes, verify Phase 4 is complete:

1. Open `c:\Users\NARENDAR\Documents\Hackathons\vibethon\backend\src\index.ts`
   - Should have `import emotionRoutes from './routes/emotions';`
   - Should have `app.use('/api/emotions', emotionRoutes);`

2. Open `c:\Users\NARENDAR\Documents\Hackathons\vibethon\backend\src\db\models\Attempt.ts`
   - Should have `stressLevel` and `dominantEmotion` fields in answers array

3. Check that these files exist:
   - `c:\Users\NARENDAR\Documents\Hackathons\vibethon\backend\src\db\models\EmotionTracking.ts` ✅
   - `c:\Users\NARENDAR\Documents\Hackathons\vibethon\backend\src\routes\emotions.ts` ✅

---

## 🎯 What This Achieves

After Phase 4 completion, your backend will:
- ✅ Save emotion data to MongoDB during tests
- ✅ Provide emotion history API for students
- ✅ Provide emotion analytics API for teachers
- ✅ Store stress level and emotion with each answer
- ✅ Enable emotion-based adaptive learning

---

## ⏭️ Next: Phase 5

Once you've made these 2 manual edits, we can proceed to **Phase 5** (Frontend Webcam Integration):
- Create EmotionTracker.tsx component
- Integrate with Student test-taking page
- Add emotion display UI

Let me know when you're ready to continue! 🚀
