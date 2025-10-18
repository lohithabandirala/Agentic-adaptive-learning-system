# 🎓 Agentic Adaptive Learning System

An AI-powered adaptive learning platform that personalizes education through intelligent question generation and real-time difficulty adjustment based on student performance and stress levels.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/cloud/atlas)

---

## 🌟 Overview

This project implements an **agentic adaptive learning system** that uses AI to create personalized learning experiences. The system dynamically adjusts question difficulty based on student performance, incorporates stress level monitoring, and generates questions using Google's Gemini AI.

### Key Features

- 🤖 **AI-Powered Question Generation** - Uses Google Gemini 1.5 Pro for intelligent question creation
- 📊 **Adaptive Difficulty System** - Real-time adjustment based on performance and stress
- 👥 **Multi-Role System** - Teacher, Student, and Admin dashboards
- 🎓 **Class Management** - Easy class creation with shareable codes
- 📈 **Performance Analytics** - Detailed insights with interactive charts
- 🔄 **Real-time Feedback** - Immediate response to student answers
- 🌐 **Cloud Database** - MongoDB Atlas for persistent data storage

---

## 🏗️ Project Structure

```
Agentic-adaptive-learning-system/
│
├── backend/                          # Node.js + Express Backend
│   ├── src/
│   │   ├── index.ts                  # Server entry point
│   │   ├── adaptiveLogic.ts          # 🧠 Core adaptive algorithm
│   │   │
│   │   ├── db/
│   │   │   ├── connection.ts         # MongoDB connection
│   │   │   └── models/               # Database schemas
│   │   │       ├── User.ts           # User model (teacher/student/admin)
│   │   │       ├── Class.ts          # Class with unique codes
│   │   │       ├── Test.ts           # Test metadata
│   │   │       ├── Attempt.ts        # Student test attempts
│   │   │       └── Material.ts       # Learning materials
│   │   │
│   │   ├── routes/                   # API endpoints
│   │   │   ├── auth.ts               # Authentication
│   │   │   ├── classes.ts            # Class CRUD operations
│   │   │   ├── materials.ts          # File upload/management
│   │   │   ├── tests.ts              # Test generation & taking
│   │   │   └── admin.ts              # Analytics & monitoring
│   │   │
│   │   ├── services/
│   │   │   ├── geminiClient.ts       # 🤖 AI integration
│   │   │   └── advancedQuestionGenerator.ts  # Question logic
│   │   │
│   │   └── middleware/
│   │       └── auth.ts               # JWT middleware
│   │
│   ├── uploads/                      # Uploaded learning materials
│   ├── .env.example                  # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # React + TypeScript Frontend
│   ├── src/
│   │   ├── App.tsx                   # Main app with routing
│   │   ├── main.tsx                  # Entry point
│   │   │
│   │   ├── pages/                    # Main views
│   │   │   ├── Login.tsx             # 🔑 Role selection
│   │   │   ├── Teacher.tsx           # 👨‍🏫 Teacher dashboard
│   │   │   ├── Student.tsx           # 👨‍🎓 Student portal
│   │   │   └── Admin.tsx             # 👨‍💼 Admin analytics
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                # API client (Axios)
│   │   │
│   │   └── store/
│   │       └── useStore.ts           # State management (Zustand)
│   │
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js            # TailwindCSS config
│   └── vite.config.ts                # Vite build config
│
├── docs/                             # 📚 Documentation
│   ├── ADAPTIVE_SYSTEM.md
│   ├── CLASS_SYSTEM.md
│   ├── DEPLOYMENT.md
│   └── TESTING_GUIDE.md
│
└── README.md                         # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/lohithabandirala/Agentic-adaptive-learning-system.git
cd Agentic-adaptive-learning-system
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` file:
```env
PORT=4000
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

**Get your Gemini API key:** https://aistudio.google.com/app/apikey

Start backend:
```bash
npm run dev
```

✅ Backend running on http://localhost:4000

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

✅ Frontend running on http://localhost:5173

---

## 🎯 How It Works

### 1. **Teacher Workflow**

```mermaid
graph LR
A[Create Class] --> B[Get Class Code]
B --> C[Upload Materials]
C --> D[Generate AI Questions]
D --> E[Share Code with Students]
```

1. Login as Teacher
2. Create a new class → Receive unique 6-character code (e.g., `ABC123`)
3. Upload learning materials (PDF, DOC, TXT, images)
4. Generate questions using AI or from text topics
5. Share class code with students

### 2. **Student Workflow**

```mermaid
graph LR
A[Join Class] --> B[Enter Code]
B --> C[Select Test]
C --> D[Take Adaptive Test]
D --> E[View Analytics]
```

1. Login as Student
2. Join class using teacher's code
3. Select available test
4. Take adaptive test (30s per question)
5. View performance analytics and insights

### 3. **Adaptive Algorithm**

```typescript
// Core logic in backend/src/adaptiveLogic.ts
function getNextDifficulty(current, isCorrect, stress) {
  // Increase difficulty if correct answer + low stress
  if (isCorrect && stress < 0.5) {
    return increaseDifficulty(current);
  }
  
  // Decrease difficulty if incorrect + high stress
  if (!isCorrect && stress > 0.7) {
    return decreaseDifficulty(current);
  }
  
  // Maintain current difficulty
  return current;
}
```

**Factors Considered:**
- ✅ Answer correctness
- ⏱️ Response time
- 😰 Simulated stress level (0-1 scale)
- 📈 Historical performance

---

## 🧠 AI Question Generation

### Powered by Google Gemini 1.5 Pro

The system generates contextually relevant questions based on:

- **Topic/Subject:** User-provided text or extracted from materials
- **Difficulty Levels:** Easy, Medium, Hard
- **Question Types:** Multiple choice, True/False, Problem-solving
- **Bloom's Taxonomy:** Remember, Understand, Apply, Analyze, Evaluate, Create

Example API call:
```typescript
const response = await geminiClient.generateQuestions({
  topic: "Photosynthesis in plants",
  numQuestions: 10,
  difficulty: "mixed"
});
```

---

## 📊 Database Schema

### MongoDB Collections

#### Users
```typescript
{
  username: string,
  email: string,
  password: string (hashed),
  role: 'teacher' | 'student' | 'admin',
  createdAt: Date
}
```

#### Classes
```typescript
{
  name: string,
  classCode: string (unique 6-char),
  teacherId: string,
  students: string[],
  tests: string[],
  createdAt: Date
}
```

#### Tests
```typescript
{
  testId: string,
  testName: string,
  classId: string,
  topic: string,
  numQuestions: number,
  createdBy: string,
  createdAt: Date
}
```

#### Attempts
```typescript
{
  attemptId: string,
  testId: string,
  studentId: string,
  answers: Answer[],
  score: number,
  completedAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Classes
- `POST /api/classes/create` - Create new class
- `POST /api/classes/join` - Join class with code
- `GET /api/classes/teacher/:id` - Get teacher's classes
- `GET /api/classes/student/:id` - Get student's classes

### Materials
- `POST /api/materials/upload` - Upload learning material
- `GET /api/materials` - List all materials

### Tests
- `POST /api/tests/generate` - Generate AI questions
- `GET /api/tests?classId=xxx` - Get tests for class
- `POST /api/tests/start` - Start test attempt
- `POST /api/tests/answer` - Submit answer (triggers adaptive logic)
- `GET /api/tests/insights/:attemptId` - Get performance analytics

### Admin
- `GET /api/admin/analytics` - Platform statistics

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript 5+
- **Database:** MongoDB Atlas (Mongoose ODM)
- **AI Service:** Google Gemini 1.5 Pro
- **File Upload:** Multer
- **Authentication:** JWT (jsonwebtoken)

### Frontend
- **Framework:** React 18
- **Language:** TypeScript 5+
- **Build Tool:** Vite 5
- **Styling:** TailwindCSS 3
- **State Management:** Zustand
- **Routing:** React Router 6
- **Charts:** Recharts
- **HTTP Client:** Axios

### DevOps
- **Version Control:** Git
- **CI/CD Ready:** GitHub Actions compatible
- **Deployment:** Vercel (frontend) + Railway/Render (backend)

---

## 🔒 Security Features

- ✅ Environment variables for sensitive data
- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt ready)
- ✅ CORS configuration
- ✅ Input validation
- ✅ File upload restrictions
- ⚠️ Rate limiting (recommended for production)

---

## 📈 Performance & Analytics

### Student Dashboard
- Accuracy percentage
- Average response time
- Stress level trends
- Question difficulty distribution
- Performance over time (charts)

### Teacher Dashboard
- Class performance overview
- Individual student insights
- Question effectiveness metrics
- Material usage statistics

### Admin Dashboard
- Total users (teachers/students/admins)
- Active classes count
- Tests generated
- System health monitoring

---

## 🚢 Deployment

### Option 1: Vercel + Railway

**Frontend (Vercel):**
```bash
cd frontend
vercel deploy
```

**Backend (Railway):**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Option 2: Docker

See `DEPLOYMENT.md` for complete Docker setup.

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Test Database Connection
```bash
node test-db.js
```

See `TESTING_GUIDE.md` for comprehensive testing instructions.

---

## 📚 Documentation

- [Adaptive System Guide](ADAPTIVE_SYSTEM.md) - How the adaptive algorithm works
- [Class System Guide](CLASS_SYSTEM.md) - Class management and codes
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Testing Guide](TESTING_GUIDE.md) - How to test the system
- [API Documentation](API_DOCS.md) - Complete API reference

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Future Enhancements

- [ ] Real-time collaboration features
- [ ] Advanced analytics with ML insights
- [ ] Mobile app (React Native)
- [ ] Video/audio question support
- [ ] Integration with LMS platforms
- [ ] Gamification (badges, leaderboards)
- [ ] Multi-language support
- [ ] Offline mode capability

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Development Team** - [GitHub](https://github.com/lohithabandirala)

---

## 🙏 Acknowledgments

- Google Gemini AI for question generation
- MongoDB Atlas for cloud database
- React community for amazing tools
- All contributors and testers

---

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues:** [Report a bug](https://github.com/lohithabandirala/Agentic-adaptive-learning-system/issues)
- **Discussions:** [Community Forum](https://github.com/lohithabandirala/Agentic-adaptive-learning-system/discussions)

---

## 🎉 Status

✅ **Production Ready** - The system is fully functional and ready for deployment!

**Last Updated:** October 18, 2025

---

Built with ❤️ using React, Node.js, TypeScript, MongoDB, and Google Gemini AI
