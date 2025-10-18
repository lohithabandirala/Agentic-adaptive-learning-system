# Agentic Adaptive Learning System - Setup Guide

## 🚀 Quick Setup Instructions

Follow these steps to get the project running on your local machine.

---

## Prerequisites Checklist

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Git installed
- [ ] MongoDB Atlas account ([Sign up free](https://www.mongodb.com/cloud/atlas/register))
- [ ] Google Gemini API key ([Get here](https://aistudio.google.com/app/apikey))
- [ ] Code editor (VS Code recommended)

---

## Step-by-Step Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/lohithabandirala/Agentic-adaptive-learning-system.git
cd Agentic-adaptive-learning-system
```

---

### 2️⃣ Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Create Environment File
Create a `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=4000

# Database Configuration (MongoDB Atlas)
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Authentication
JWT_SECRET=your_secure_jwt_secret_here

# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Environment
NODE_ENV=development
```

#### Get MongoDB Connection String
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster (if you haven't)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<database_name>` with `vibathon` or your preferred name

#### Get Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

#### Test Backend Setup
```bash
# Test database connection
node test-db.js

# Expected output:
# ✅ SUCCESS! MongoDB Atlas connection established!
# ✅ Database is responding to ping!
```

#### Start Backend Server
```bash
npm run dev

# Expected output:
# ✅ Server listening on 4000
# 🌐 API available at: http://localhost:4000/api
```

**Keep this terminal open!**

---

### 3️⃣ Frontend Setup

Open a **new terminal** window:

```bash
cd frontend
npm install
```

#### Start Frontend Server
```bash
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
```

---

### 4️⃣ Access the Application

Open your browser and go to:
```
http://localhost:5173
```

---

## 🎯 Test the System

### Login Options
The system supports three roles:
- **Teacher** - Create classes and generate tests
- **Student** - Join classes and take tests
- **Admin** - View platform analytics

### Test Workflow

#### As a Teacher:
1. Click "Teacher" on login page
2. Create a new class
3. Note the 6-character class code (e.g., `ABC123`)
4. Upload a material or enter a topic
5. Click "Generate Questions with AI"
6. Wait for AI to generate questions
7. Share the class code with students

#### As a Student:
1. Click "Student" on login page
2. Click "Join Class"
3. Enter the teacher's class code
4. Select the class
5. Start a test
6. Answer questions (30 seconds each)
7. View your performance analytics

---

## 🐛 Troubleshooting

### Backend won't start

**Problem:** `Cannot find module` errors
```bash
cd backend
rm -rf node_modules
npm install
```

**Problem:** `GEMINI_API_KEY not configured`
- Check if `.env` file exists in `backend` folder
- Verify API key is correct (no spaces)
- Restart the backend server

**Problem:** `MongoDB connection failed`
- Check if IP address is whitelisted in MongoDB Atlas
- Verify connection string is correct
- Check username/password

### Frontend won't start

**Problem:** Port 5173 already in use
```bash
# Kill the process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Or change the port in vite.config.ts
```

**Problem:** `Failed to fetch` errors
- Ensure backend is running on port 4000
- Check browser console for errors
- Verify API baseURL in `frontend/src/services/api.ts`

---

## 🔧 Development Commands

### Backend
```bash
cd backend
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production build
```

### Frontend
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 📁 Project Structure at a Glance

```
Agentic-adaptive-learning-system/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Server entry
│   │   ├── adaptiveLogic.ts      # Core algorithm
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # AI & business logic
│   │   └── db/                   # Database models
│   ├── .env                      # Environment variables (create this)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Main app
│   │   ├── pages/                # Teacher, Student, Admin
│   │   └── services/             # API client
│   └── package.json
│
└── docs/                         # Documentation
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend running on http://localhost:4000
- [ ] Frontend running on http://localhost:5173
- [ ] Can access login page
- [ ] MongoDB connection successful
- [ ] Can create a class as teacher
- [ ] Can generate AI questions
- [ ] Can join class as student
- [ ] Can take a test
- [ ] Analytics display correctly

---

## 🎓 Next Steps

1. **Customize the UI:** Edit `frontend/src/styles.css`
2. **Add Features:** Explore `backend/src/routes/`
3. **Deploy:** See `DEPLOYMENT.md` for deployment guides
4. **Contribute:** Check `CONTRIBUTING.md` for guidelines

---

## 📚 Additional Resources

- [Project README](PROJECT_README.md) - Complete project overview
- [Adaptive System Guide](ADAPTIVE_SYSTEM.md) - Algorithm details
- [API Documentation](API_DOCS.md) - Complete API reference
- [Deployment Guide](DEPLOYMENT.md) - Production deployment

---

## 💡 Tips

### For Development
- Use two terminals (one for backend, one for frontend)
- Check browser console for errors
- Use MongoDB Compass to view database
- Test with different roles (teacher/student/admin)

### For Production
- Use environment-specific `.env` files
- Enable HTTPS/SSL
- Add rate limiting
- Set up monitoring (Sentry, DataDog)
- Use PM2 for process management

---

## 🆘 Need Help?

- **GitHub Issues:** Report bugs or request features
- **Documentation:** Check the docs folder
- **Community:** Join discussions on GitHub

---

**Happy Coding! 🚀**

Built with ❤️ for education
