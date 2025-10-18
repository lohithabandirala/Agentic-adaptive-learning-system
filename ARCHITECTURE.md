# 🏗️ System Architecture

## Overview

The Agentic Adaptive Learning System follows a **modern full-stack architecture** with separated frontend and backend services, cloud database, and AI integration.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│  👨‍🏫 Teachers    👨‍🎓 Students    👨‍💼 Admins                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Pages: Login, Teacher, Student, Admin                   │   │
│  │  State: Zustand Store                                    │   │
│  │  Routing: React Router                                   │   │
│  │  UI: TailwindCSS + Recharts                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                  Port: 5173 (Development)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ REST API (Axios)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routes Layer                                            │   │
│  │  ├─ /api/auth        - Authentication                   │   │
│  │  ├─ /api/classes     - Class Management                 │   │
│  │  ├─ /api/materials   - File Uploads                     │   │
│  │  ├─ /api/tests       - Test Generation & Taking         │   │
│  │  └─ /api/admin       - Analytics                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services Layer                                          │   │
│  │  ├─ Gemini Client    - AI Integration                   │   │
│  │  ├─ Adaptive Logic   - Difficulty Algorithm             │   │
│  │  └─ Auth Middleware  - JWT Validation                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                  Port: 4000 (Development)                        │
└────────┬──────────────────────────────┬─────────────────────────┘
         │                              │
         │ Mongoose ODM                 │ HTTPS API
         ▼                              ▼
┌─────────────────────┐      ┌──────────────────────┐
│  MongoDB Atlas      │      │  Google Gemini AI    │
│  (Cloud Database)   │      │  (Question Gen)      │
│                     │      │                      │
│  Collections:       │      │  Model: 1.5 Pro      │
│  - Users            │      │  Features:           │
│  - Classes          │      │  - Topic-based gen   │
│  - Tests            │      │  - Difficulty mix    │
│  - Attempts         │      │  - Bloom's taxonomy  │
│  - Materials        │      │                      │
└─────────────────────┘      └──────────────────────┘
```

---

## Data Flow

### 1. Teacher Creates Test

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Teacher  │───▶│ Frontend │───▶│ Backend  │───▶│ Gemini   │
│ Dashboard│    │ API Call │    │ /tests/  │    │ AI API   │
└──────────┘    └──────────┘    │ generate │    └──────────┘
                                 └─────┬────┘
                                       │
                                       ▼
                                 ┌──────────┐
                                 │ MongoDB  │
                                 │ (Store)  │
                                 └──────────┘
```

**Steps:**
1. Teacher uploads material or enters topic
2. Frontend sends POST request to `/api/tests/generate`
3. Backend calls Gemini AI with prompt
4. AI generates questions with difficulty levels
5. Backend stores test metadata in MongoDB
6. Frontend displays generated questions

---

### 2. Student Takes Adaptive Test

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Student  │───▶│ Frontend │───▶│ Backend  │───▶│ Adaptive │
│ Portal   │    │          │    │ /tests/  │    │ Logic    │
└──────────┘    └──────────┘    │ answer   │    └─────┬────┘
     ▲                           └─────┬────┘          │
     │                                 │               │
     │                                 ▼               │
     │                           ┌──────────┐          │
     └───────────────────────────│ MongoDB  │◀─────────┘
                                 │ (Store)  │
                                 └──────────┘
```

**Steps:**
1. Student selects test and starts attempt
2. Backend fetches first question
3. Student answers within 30 seconds
4. Frontend sends answer to `/api/tests/answer`
5. Backend runs adaptive algorithm:
   - Check if answer is correct
   - Calculate stress level
   - Determine next difficulty
6. Store answer in attempt record
7. Return next question with adjusted difficulty
8. Repeat until all questions answered
9. Generate performance analytics

---

## Component Architecture

### Frontend Components

```
App.tsx (Root)
├── Router
│   ├── Login.tsx
│   │   └── Role Selection (Teacher/Student/Admin)
│   │
│   ├── Teacher.tsx
│   │   ├── Class Management
│   │   │   ├── Create Class
│   │   │   └── View Classes
│   │   ├── Material Upload
│   │   │   └── Drag & Drop
│   │   └── Test Generation
│   │       ├── AI Generation Form
│   │       ├── Progress Tracker
│   │       └── Questions Preview
│   │
│   ├── Student.tsx
│   │   ├── Class Join (Code Entry)
│   │   ├── Test Selection
│   │   ├── Adaptive Test UI
│   │   │   ├── Question Display
│   │   │   ├── Timer (30s)
│   │   │   ├── Answer Options
│   │   │   └── Progress Bar
│   │   └── Analytics Dashboard
│   │       ├── Score Card
│   │       ├── Stress Chart
│   │       └── Performance Trends
│   │
│   └── Admin.tsx
│       ├── User Statistics
│       ├── Class Overview
│       ├── Test Metrics
│       └── System Health
│
├── Services
│   └── api.ts (Axios Client)
│
└── Store
    └── useStore.ts (Zustand)
        ├── Auth State
        ├── User Info
        └── Token Management
```

---

### Backend Routes

```
Express Server (index.ts)
├── Middleware
│   ├── cors()
│   ├── express.json()
│   └── auth middleware (JWT)
│
├── Routes
│   ├── /api/auth
│   │   └── POST /login
│   │
│   ├── /api/classes
│   │   ├── POST /create
│   │   ├── POST /join
│   │   ├── GET /teacher/:id
│   │   └── GET /student/:id
│   │
│   ├── /api/materials
│   │   ├── POST /upload (Multer)
│   │   └── GET /
│   │
│   ├── /api/tests
│   │   ├── POST /generate
│   │   ├── GET /?classId=xxx
│   │   ├── POST /start
│   │   ├── POST /answer
│   │   └── GET /insights/:id
│   │
│   └── /api/admin
│       └── GET /analytics
│
├── Services
│   ├── geminiClient.ts
│   │   └── generateQuestions()
│   │
│   └── adaptiveLogic.ts
│       └── getNextDifficulty(current, isCorrect, stress)
│
└── Database Models (Mongoose)
    ├── User.ts
    ├── Class.ts
    ├── Test.ts
    ├── Attempt.ts
    └── Material.ts
```

---

## Adaptive Algorithm Flow

```
┌─────────────────────────────────────────────┐
│         Student Answers Question             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │  Calculate Metrics     │
    │  - Is Correct?         │
    │  - Response Time       │
    │  - Previous Performance│
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │  Compute Stress Level  │
    │  stress = f(time, acc) │
    │  Range: 0.0 - 1.0      │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │   Adaptive Logic Decision  │
    │                            │
    │  IF correct && stress<0.5  │
    │    → Increase Difficulty   │
    │                            │
    │  ELSE IF wrong && stress>0.7│
    │    → Decrease Difficulty   │
    │                            │
    │  ELSE                      │
    │    → Maintain Difficulty   │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────┐
    │  Select Next Question  │
    │  with new difficulty   │
    └────────┬───────────────┘
             │
             ▼
    ┌────────────────────────┐
    │  Return to Student     │
    └────────────────────────┘
```

---

## Database Schema Relationships

```
┌──────────────┐
│    Users     │
│ ─────────────│
│ _id          │◀────────┐
│ username     │         │
│ email        │         │
│ password     │         │
│ role         │         │
└──────────────┘         │
       ▲                 │
       │                 │
       │ teacherId       │ createdBy
       │                 │
┌──────────────┐         │
│   Classes    │         │
│ ─────────────│         │
│ _id          │         │
│ name         │         │
│ classCode    │         │
│ teacherId    │─────────┘
│ students[]   │◀────────┐
│ tests[]      │─┐       │
└──────────────┘ │       │
                 │       │
                 │       │ studentId
         testId  │       │
                 │       │
                 ▼       │
        ┌──────────────┐ │
        │    Tests     │ │
        │ ─────────────│ │
        │ _id          │ │
        │ testName     │ │
        │ classId      │ │
        │ topic        │ │
        │ numQuestions │ │
        └──────────────┘ │
               ▲         │
               │         │
               │ testId  │
               │         │
        ┌──────────────┐ │
        │  Attempts    │ │
        │ ─────────────│ │
        │ _id          │ │
        │ testId       │─┘
        │ studentId    │──┘
        │ answers[]    │
        │ score        │
        │ completedAt  │
        └──────────────┘
```

---

## Security Architecture

```
┌──────────────────────────────────────────┐
│             Security Layers               │
└──────────────────────────────────────────┘

1. Environment Variables (.env)
   ├── GEMINI_API_KEY (Never in code)
   ├── JWT_SECRET (Secure random string)
   ├── DB_URL (Connection string)
   └── .gitignore (Prevents commits)

2. Authentication (JWT)
   ├── Login → Generate token
   ├── Token in header: Authorization: Bearer <token>
   ├── Middleware validates token
   └── Decode to get user info

3. CORS Configuration
   ├── Allowed origins
   ├── Allowed methods
   └── Credentials handling

4. Input Validation
   ├── Express validator
   ├── Type checking (TypeScript)
   └── Sanitization

5. File Upload Security
   ├── File type restrictions
   ├── Size limits (Multer)
   └── Path sanitization

6. Database Security
   ├── Mongoose schema validation
   ├── No SQL injection (parameterized)
   └── Encrypted connections (SSL/TLS)
```

---

## Deployment Architecture

### Development
```
localhost:5173 (Frontend) ──▶ localhost:4000 (Backend)
                                      │
                                      ▼
                              MongoDB Atlas (Cloud)
```

### Production
```
┌─────────────────┐
│  Vercel (CDN)   │
│  Frontend Build │
│  (Static Files) │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Railway/Render │
│  Backend API    │
│  (Node Server)  │
└────────┬────────┘
         │
         ├──▶ MongoDB Atlas (Database)
         └──▶ Google Gemini (AI API)
```

**Infrastructure:**
- Frontend: Vercel (Global CDN)
- Backend: Railway/Render (Container)
- Database: MongoDB Atlas (Multi-region)
- AI: Google Cloud (Gemini API)

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI Framework |
| | TypeScript | Type Safety |
| | Vite | Build Tool |
| | TailwindCSS | Styling |
| | Zustand | State Management |
| | React Router | Navigation |
| | Recharts | Data Visualization |
| | Axios | HTTP Client |
| **Backend** | Node.js 18+ | Runtime |
| | Express | Web Framework |
| | TypeScript | Type Safety |
| | Mongoose | MongoDB ODM |
| | Multer | File Uploads |
| | JWT | Authentication |
| **Database** | MongoDB Atlas | Cloud Database |
| **AI** | Google Gemini | Question Generation |
| **DevOps** | Git | Version Control |
| | GitHub | Repository |
| | npm | Package Manager |

---

## Performance Optimizations

### Frontend
- ⚡ Vite for fast HMR (Hot Module Replacement)
- 🎨 TailwindCSS purging for small CSS bundles
- 📦 Code splitting with React.lazy()
- 🖼️ Optimized assets (images, fonts)
- 💾 Local storage for auth tokens

### Backend
- ⚡ Async/await for non-blocking I/O
- 🔄 Connection pooling (MongoDB)
- 📦 Efficient JSON parsing
- 🗜️ Response compression (gzip)
- 🚀 Caching strategies (Redis ready)

### Database
- 📊 Indexed fields (classCode, testId, etc.)
- 🔍 Efficient queries (projection, limit)
- 📈 Aggregation pipelines for analytics
- 💾 Connection reuse

---

**This architecture supports scalability, maintainability, and security while providing an excellent user experience!** 🚀
