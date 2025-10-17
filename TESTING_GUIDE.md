# 🧪 Testing the Advanced Question Generation Integration

## Quick Start Test

### 1. Verify Backend is Running
```
Backend should show:
✅ MongoDB connected successfully!
📦 Database: vibathon
✅ Server listening on 4000
```

### 2. Create a Test (as Teacher)
1. Login as a teacher
2. Go to "Create Test" page
3. Fill in:
   - **Test Name**: "Photosynthesis Quiz"
   - **Topic**: "Photosynthesis in plants - process, chlorophyll, light reactions"
   - **Number of Questions**: 5
   - **Class**: Select a class
4. Click "Create Test"

### 3. Take the Test (as Student)
1. Login as a student
2. Go to "Available Tests"
3. Click "Start Test" on "Photosynthesis Quiz"

### 4. Watch the Console Logs

**First Question (Expected logs):**
```
🎯 Student [username] started test: Photosynthesis Quiz
   Generating first question (difficulty: easy)...
🤖 Generating questions with Advanced AI...
📝 Prompt: Generate 1 educational questions on the topic: "Photosynthesis..."
✅ AI Response received (length: 1234)
📄 Response preview: [{"questionId":"q_...
✅ Successfully generated 1 questions
✅ First question generated (advanced): What is the primary...
   Bloom Level: Remember, Difficulty: 2/5
```

**If Advanced Generator Fails:**
```
⚠️ Advanced generator failed, using legacy...
🤖 Generating questions with AI...
✅ First question generated (legacy): What is the primary...
```

### 5. Answer Questions and Observe Adaptation

**Correct Answer with Low Stress:**
```
📊 Student answer: correct=true, stress=2, time=15s
🎯 Next difficulty: easy → medium
🤖 Generating question 2/5 (difficulty: medium)...
   Bloom Level: Understand, Difficulty: 3/5
```

**Incorrect Answer with High Stress:**
```
📊 Student answer: correct=false, stress=8, time=45s
🎯 Next difficulty: medium → easy
🤖 Generating question 3/5 (difficulty: easy)...
   Bloom Level: Remember, Difficulty: 2/5
```

## Expected Behavior

### ✅ Advanced Mode (Default)
- Questions include Bloom's taxonomy levels
- Difficulty shows as 1-5 in logs (converted to easy/medium/hard for frontend)
- Questions are more contextual and pedagogically sound
- Explanations are generated (visible in console)

### ✅ Fallback Mode (If Advanced Fails)
- Automatically switches to legacy generator
- No error shown to student
- Questions still generate successfully
- Log shows "using legacy" message

## Feature Checklist

- [ ] Questions generate successfully
- [ ] Difficulty adapts based on student performance
- [ ] Stress level affects next question difficulty
- [ ] Console shows Bloom's taxonomy levels
- [ ] Questions are relevant to the topic
- [ ] No errors during test flow
- [ ] Test completes successfully
- [ ] Results show correct/incorrect answers

## Advanced Features to Test Later

### PDF Upload (Code Ready, UI Pending)
```typescript
// Backend ready for:
const result = await advancedGenerator.generateQuestions({
  topic: "Physics",
  pdfContent: base64String, // Upload study material
  questionCount: 5
});
```

### Student Profiling (Active)
```typescript
// Already working:
studentData: {
  knowledgeLevel: 2,
  previousPerformance: {
    averageScore: 75,
    recentScores: [80, 70, 85, 65, 90]
  },
  emotionalState: {
    stressLevel: 'medium'
  }
}
```

## Troubleshooting

### Issue: "AI service not configured"
**Solution**: Check `.env` file has `GEMINI_API_KEY`

### Issue: Questions not generating
**Check**: 
1. Backend console logs
2. MongoDB connection status
3. GEMINI_API_KEY validity

### Issue: Fallback mode activating
**Possible Causes**:
1. API rate limit reached
2. Network connectivity issue
3. Malformed prompt
**Action**: Check backend logs for specific error

## API Response Format

### Question Object (Returned to Frontend)
```json
{
  "id": "q_1234567890_0",
  "text": "What is the primary function of chlorophyll?",
  "difficulty": "easy",
  "options": [
    "A. To absorb light energy",
    "B. To store glucose",
    "C. To release oxygen",
    "D. To produce ATP"
  ],
  "correctAnswer": "A",
  "bloomLevel": "Remember",
  "type": "MCQ",
  "explanation": "Chlorophyll absorbs light energy from the sun..."
}
```

### New Fields (Optional, for Future UI)
- `bloomLevel`: Cognitive level (Remember, Understand, Apply, etc.)
- `type`: Question type (MCQ, TrueFalse, ShortAnswer, ProblemSolving)
- `explanation`: Why the answer is correct

## Performance Metrics

### Expected Generation Time
- **Advanced**: 3-8 seconds per question
- **Legacy**: 2-5 seconds per question

### Token Usage
- **Advanced**: ~2000-4000 tokens per question (higher quality)
- **Legacy**: ~500-1000 tokens per question

## Success Criteria

✅ **Basic**: Questions generate without errors
✅ **Adaptive**: Difficulty changes based on performance
✅ **Quality**: Questions are pedagogically appropriate
✅ **Fallback**: System never crashes, always generates
✅ **Logs**: Clear console output for debugging

## Next Steps After Testing

1. **Collect Data**: Run 10 test attempts, note quality
2. **Adjust Prompts**: Fine-tune system instruction if needed
3. **UI Updates**: Display Bloom levels and explanations
4. **PDF Feature**: Implement upload interface
5. **Analytics**: Build dashboard for Bloom taxonomy insights

---

**Happy Testing! 🚀**
