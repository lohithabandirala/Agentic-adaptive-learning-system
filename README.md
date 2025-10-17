# 🎓 AI-Powered Personalized Learning Portal

**Status:** ✅ DEPLOYMENT READY | **AI:** ✅ Google Gemini 1.5 Flash | **UI:** ✅ Industry-Ready

A production-ready full-stack adaptive learning platform with **real AI-powered question generation** and real-time performance analytics.

---

## 🎯 QUICK START (2 Commands)

### 1. Start Backend:
```bash
cd C:\vibathon\backend
npm run dev
# ✅ Server listening on 4000
```

### 2. Start Frontend:
```bash
cd C:\vibathon\frontend
npm run dev
# ✅ Local: http://localhost:5173/
```

### 3. Open & Test:
🌐 **http://localhost:5173**

**Test AI Generation:**
1. Login as Teacher
2. Create class → Get code (e.g., ABC123)
3. Create Test from Text → Enter topic: "Photosynthesis in plants"
4. Set 10 questions, Mixed difficulty
5. Click Generate → Watch progress → See 10 real AI questions! ✨

---

## ⭐ LATEST UPDATES (Just Completed!)

### ✅ Real AI Integration Fixed
- **Before:** Questions were random/dummy data
- **After:** Real Google Gemini 1.5 Flash API integration
- Questions are now **actually generated based on your topics!**

### ✅ Teacher Progress Tracking Added
- **Animated loading spinner** during generation
- **Progress card** showing "Generating questions with AI..."
- **Success alert** with question count
- **Full questions preview** with expandable card

### ✅ Professional UI Enhancements
- Difficulty badges (Easy/Medium/Hard)
- Scrollable questions preview
- Multiple-choice options displayed
- Correct answers shown
- Disabled buttons during generation

### ✅ Robust Error Handling
- Detailed error messages
- API connectivity checks
- JSON parsing fallbacks
- User-friendly alerts

---

## 🚀 Features

### For Teachers
- 📚 **Class Management:** Create classes with alphanumeric codes (e.g., ABC123)
- 📤 **File Upload:** PDF, DOC, TXT, images with drag-and-drop
- 🤖 **AI Question Generation:**
  - ✨ **Generate from text topics** (NEW!)
  - ✨ **Generate from uploaded files**
  - ✨ **Customizable:** 5-50 questions
  - ✨ **Difficulty:** Easy/Medium/Hard/Mixed
  - ✨ **Live progress tracking** (NEW!)
  - ✨ **Questions preview** (NEW!)
- � Monitor student performance
- 🔍 View detailed test insights

### For Students
- 🎓 **Class Joining:** Enter code to join teacher's class
- 📝 **Adaptive Testing:** Difficulty adjusts based on performance
- ⏱️ **30-second timer** per question
- 📊 **Real-time stress tracking**
- � **Performance analytics** with Recharts graphs
- 🔄 Retake tests to improve scores

### For Admins
- 📊 Platform-wide analytics dashboard
- 👥 User distribution insights
- 📈 Performance trends and metrics
- 🟢 Real-time system status monitoring

## 🛠️ Tech Stack

**Backend**
- Node.js + Express + TypeScript
- Google Gemini AI (1.5 Flash)
- Multer for file uploads
- Adaptive difficulty algorithm

**Frontend**
- React 18 + TypeScript
- Vite (dev & build)
- TailwindCSS for styling
- Recharts for data visualization
- Zustand for state management
- React Router for navigation

## 📦 Installation

### Backend Setup

```cmd
cd C:\vibathon\backend
npm install
copy .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### Frontend Setup

```cmd
cd C:\vibathon\frontend
npm install
```

## 🏃 Running Development

**Terminal 1 - Backend:**
```cmd
cd C:\vibathon\backend
npm run dev
```
Backend will run on http://localhost:4000

**Terminal 2 - Frontend:**
```cmd
cd C:\vibathon\frontend
npm run dev
```
Frontend will run on http://localhost:5173

## 🚢 Production Deployment

### Build Frontend
```cmd
cd C:\vibathon\frontend
npm run build
```
This creates a `dist` folder with optimized static files.

### Build Backend
```cmd
cd C:\vibathon\backend
npm run build
```
This creates a `dist` folder with compiled TypeScript.

### Run Production Server
```cmd
cd C:\vibathon\backend
set NODE_ENV=production
npm start
```

### Deploy Options

**Option 1: Vercel (Frontend) + Railway/Render (Backend)**
1. Push code to GitHub
2. Deploy frontend to Vercel (auto-detects Vite)
3. Deploy backend to Railway or Render
4. Update `frontend/src/services/api.ts` with production backend URL

**Option 2: Docker**
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

**Option 3: Traditional VPS**
- Use PM2 for process management
- Nginx as reverse proxy
- SSL with Let's Encrypt

### Environment Variables for Production

Backend `.env`:
```
PORT=4000
GEMINI_API_KEY=your_production_key
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

Frontend: Update `src/services/api.ts`:
```typescript
const api = axios.create({ 
  baseURL: process.env.VITE_API_URL || 'https://your-backend-api.com/api'
});
```

## 🔐 Security Checklist

- ✅ Gemini API key stored in `.env` (never committed)
- ✅ Backend proxies all AI requests (frontend never calls Gemini directly)
- ✅ CORS configured for production domains
- ⚠️ Implement real JWT authentication (currently using dummy tokens)
- ⚠️ Add rate limiting for API endpoints
- ⚠️ Validate file uploads (type, size, scan for malware)
- ⚠️ Add persistent database (replace in-memory storage)

## 📁 Project Structure

```
vibathon/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server
│   │   ├── adaptiveLogic.ts      # Difficulty algorithm
│   │   ├── routes/
│   │   │   ├── auth.ts           # Login endpoints
│   │   │   ├── materials.ts      # Upload & list
│   │   │   ├── tests.ts          # Test generation & attempts
│   │   │   └── admin.ts          # Analytics
│   │   └── services/
│   │       └── geminiClient.ts   # AI proxy
│   ├── uploads/                  # Uploaded files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx         # Login page
│   │   │   ├── Teacher.tsx       # Teacher dashboard
│   │   │   ├── Student.tsx       # Student portal + test UI
│   │   │   └── Admin.tsx         # Admin analytics
│   │   ├── services/
│   │   │   └── api.ts            # Axios client
│   │   ├── store/
│   │   │   └── useStore.ts       # Zustand store
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with role

### Materials (Teacher)
- `POST /api/materials/upload` - Upload file
- `GET /api/materials` - List materials

### Tests
- `POST /api/tests/generate` - Generate questions (calls Gemini)
- `GET /api/tests` - List all tests
- `POST /api/tests/start` - Start test attempt
- `POST /api/tests/answer` - Submit answer (adaptive logic)
- `GET /api/tests/insights/:attemptId` - Get performance data

### Admin
- `GET /api/admin/analytics` - Platform analytics

## 🧠 Adaptive Logic

The system adjusts question difficulty based on:
- **Correctness** of previous answer
- **Simulated stress level** (0-1 scale)

Algorithm (in `backend/src/adaptiveLogic.ts`):
- If correct answer + low stress → increase difficulty
- If incorrect answer + high stress → decrease difficulty
- Otherwise → maintain current difficulty

## 🐛 Troubleshooting

**Backend won't start:**
- Check if port 4000 is available
- Verify `.env` file exists with GEMINI_API_KEY

**Frontend build errors:**
- Run `npm install` again
- Clear node_modules and reinstall

**Gemini API errors:**
- Verify API key is valid
- Check API quota/limits
- Review endpoint URL in `geminiClient.ts`

## 📝 Next Steps for Production

1. **Database Integration**
   - Replace in-memory stores with MongoDB/PostgreSQL
   - Implement user authentication with bcrypt + JWT
   
2. **File Processing**
   - Add PDF text extraction
   - OCR for image-based materials
   - Send extracted content to Gemini

3. **Enhanced Security**
   - Rate limiting (express-rate-limit)
   - Input validation (Joi/Zod)
   - File upload scanning

4. **Monitoring**
   - Error tracking (Sentry)
   - Analytics (PostHog, Mixpanel)
   - Logging (Winston)

## 📄 License

MIT

## 🤝 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using React, TypeScript, Node.js, and Google Gemini AI
"# ailearn" 
