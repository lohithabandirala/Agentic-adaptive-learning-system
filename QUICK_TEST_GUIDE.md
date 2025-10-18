# 🧪 QUICK TEST GUIDE

## Test the AI Question Generation in 5 Minutes

### Step 1: Login as Teacher
1. Open: http://localhost:5173
2. Select **"Teacher"** from role dropdown
3. Click **Login**

---

### Step 2: Create a Class
1. Click **"+ Create Class"** button
2. Enter:
   - Class Name: `Biology 101`
   - Description: `Introduction to Biology`
3. Click **Create**
4. **COPY THE CLASS CODE** (e.g., ABC123) - you'll need this for student login

---

### Step 3: Generate AI Test from Text
1. Make sure `Biology 101` is selected (click on it if not)
2. Scroll to **"Create Test from Text"** section
3. Click **"+ Create Test"** to expand the form
4. Fill in:
   ```
   Test Name: Photosynthesis Quiz
   
   Topic/Content:
   Photosynthesis is the process by which plants convert sunlight, 
   water, and carbon dioxide into glucose and oxygen. This occurs 
   in the chloroplasts of plant cells, specifically in the thylakoid 
   membranes where chlorophyll captures light energy. The process 
   has two stages: light-dependent reactions and light-independent 
   reactions (Calvin cycle).
   
   Number of Questions: 10
   Difficulty: Mixed (Adaptive)
   ```
5. Click **"🤖 Generate Test with AI"**

---

### Step 4: Watch the Magic Happen ✨
You should see:
1. **Loading Spinner:** Button shows rotating spinner
2. **Progress Card:** Blue card appears saying "Generating Questions..."
3. **Wait:** 10-30 seconds (AI is working!)
4. **Success Alert:** Popup shows "✅ Test 'Photosynthesis Quiz' created!"
5. **Preview Card:** Green card appears with all 10 questions

---

### Step 5: Review the Questions
In the green preview card, you'll see:
- ✅ Question number badges (1, 2, 3...)
- ✅ Difficulty badges (EASY/MEDIUM/HARD)
- ✅ Full question text
- ✅ Multiple choice options (A, B, C, D)
- ✅ Correct answer highlighted

**Sample Expected Question:**
```
Q1: [MEDIUM]
What is the primary pigment responsible for capturing light energy during photosynthesis?

A. Carotene
B. Chlorophyll
C. Xanthophyll
D. Anthocyanin

✓ Correct Answer: B
```

---

### Step 6: Test as Student (Optional)
1. Open new incognito/private window
2. Go to http://localhost:5173
3. Select **"Student"**
4. Click **Login**
5. Enter the class code from Step 2
6. Click **Join Class**
7. Click on **"Photosynthesis Quiz"**
8. Click **Start Test**
9. Answer questions (30s timer per question)
10. See results with stress graph!

---

## 🎯 What to Look For

### ✅ **SUCCESS Indicators:**
- Questions are relevant to photosynthesis
- Each question has 4 options
- Difficulty varies (not all same)
- Questions are educational and accurate
- No generic "Question 1", "Question 2" placeholders
- Timer works on student side
- Results show accurate graph

### ❌ **FAILURE Indicators:**
- Questions about random topics (math, history)
- Generic placeholders like "Question text here"
- Error alert appears
- Backend console shows errors
- Questions don't load
- Preview card doesn't appear

---

## 🐛 Troubleshooting

### **If you get "Failed to create test":**
1. Check backend console for error details
2. Verify API key in `backend/.env`
3. Try simpler topic: "Basic addition in mathematics"
4. Reduce to 5 questions
5. Check internet connection

### **If questions seem random:**
1. Check backend console logs
2. Verify prompt is being sent correctly
3. Try more specific topic text
4. Add more context in the topic field

### **If loading never finishes:**
1. Wait 60 seconds (sometimes API is slow)
2. Check backend console for errors
3. Restart backend: `taskkill /F /IM node.exe` then `npm run dev`
4. Check Gemini API quota/limits

---

## 📝 More Test Topics to Try

### Easy Topics:
- "Basic arithmetic: addition and subtraction of single-digit numbers"
- "Colors of the rainbow in order"
- "Days of the week and months of the year"

### Medium Topics:
- "Water cycle: evaporation, condensation, precipitation, collection"
- "Three branches of US government: Executive, Legislative, Judicial"
- "Basics of computer programming: variables, loops, functions"

### Hard Topics:
- "Quantum mechanics: wave-particle duality, uncertainty principle, quantum entanglement"
- "Advanced calculus: derivatives, integrals, differential equations"
- "Machine learning algorithms: supervised vs unsupervised learning, neural networks"

---

## 🎨 UI Features to Notice

1. **Animated Spinner:** Rotates smoothly during generation
2. **Progress Card:** Blue background with info icon
3. **Success Card:** Green background with checkmark
4. **Difficulty Badges:** 
   - Green = Easy
   - Yellow = Medium
   - Red = Hard
5. **Scrollable Preview:** If 20+ questions, preview scrolls
6. **Close Button:** X button to hide preview
7. **Disabled State:** Button grays out during generation

---

## ⏱️ Expected Timing

- **Fast:** 5 questions, easy topic → 5-10 seconds
- **Normal:** 10 questions, mixed difficulty → 10-20 seconds
- **Slow:** 50 questions, complex topic → 20-40 seconds
- **Very Slow:** 50 questions + API server load → up to 60 seconds

**Note:** First generation might be slower as API warms up.

---

## 🔄 Testing Multiple Scenarios

### Scenario 1: Multiple Tests in Same Class
1. Generate first test on "Photosynthesis"
2. Generate second test on "Cell Division"
3. Verify both appear in tests list
4. Verify student sees both tests

### Scenario 2: Different Difficulties
1. Generate test with "easy" difficulty
2. Generate test with "hard" difficulty
3. Compare question complexity

### Scenario 3: Different Question Counts
1. Generate 5 questions → Should be quick
2. Generate 50 questions → Should take longer
3. Verify all questions appear in preview

### Scenario 4: File Upload Generation
1. Upload a PDF file
2. Click "Generate Test" on uploaded material
3. Follow prompts
4. Verify questions match file content

---

## 📊 Backend Console Should Show

When generation starts:
```
Calling Gemini API with prompt...
```

When response received:
```
Gemini response received: {...}
Parsing JSON response...
Successfully extracted X questions
```

If errors occur:
```
Error calling Gemini: [error details]
```

---

## 💡 Pro Tips

1. **Be Specific:** More detailed topics = better questions
2. **Add Context:** Include definitions, examples in topic
3. **Start Small:** Test with 5 questions first
4. **Check Preview:** Review questions before students see them
5. **Mixed Difficulty:** Gives best adaptive experience
6. **Save Class Code:** Write it down for student testing
7. **Use Real Content:** Real textbook paragraphs work great
8. **Watch Console:** Backend logs help debug issues

---

## ✅ Checklist Before Deployment

- [ ] Generated at least 3 different tests
- [ ] Questions are relevant to topics
- [ ] Progress indicator works
- [ ] Preview shows all questions
- [ ] Student can join class
- [ ] Student can take test
- [ ] Timer counts down correctly
- [ ] Results show after completion
- [ ] Graphs display properly
- [ ] No console errors
- [ ] Backend logs look clean
- [ ] All flows tested end-to-end

---

**Ready to test? Open http://localhost:5173 and follow the steps!**

**Need help?** Check `DEPLOYMENT_READY.md` for full documentation.
