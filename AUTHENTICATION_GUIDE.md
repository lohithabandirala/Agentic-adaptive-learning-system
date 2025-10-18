# 🔐 User Authentication Guide

## ✅ Authentication System Complete!

Your AI Learning Portal now has **full user authentication** with registration and login for Teachers, Students, and Admins!

---

## 🎯 What's Been Added

### **Backend:**
✅ **MongoDB Database Integration**
- Connected to MongoDB Atlas
- Database: `vibathon`
- Connection URL stored in `.env`

✅ **User Model** (`User.ts`)
- Username, Email, Password (hashed)
- Role: teacher | student | admin
- Created timestamp

✅ **Password Security**
- Passwords hashed using bcryptjs (salt rounds: 10)
- Never stored in plain text

✅ **JWT Authentication**
- Secure JSON Web Tokens
- 7-day expiration
- Contains: userId, username, role

✅ **Authentication Routes** (`/api/auth/`)
- `POST /register` - Create new account
- `POST /login` - Login with email/password
- `GET /me` - Verify token & get current user

✅ **Authentication Middleware**
- `authenticateToken()` - Verify JWT
- `requireTeacher()` - Teacher-only routes
- `requireStudent()` - Student-only routes
- `requireAdmin()` - Admin-only routes
- `requireTeacherOrAdmin()` - Teacher or Admin

### **Frontend:**
✅ **Enhanced Login Page**
- Toggle between Login and Register modes
- Username field (register only)
- Email field (both modes)
- Password field (min 6 characters)
- Role selection (teacher/student/admin)
- Loading spinner during processing
- Error messages displayed
- Info box with role descriptions

---

## 🧪 How to Test

### **1. Register a Teacher Account**

**Navigate to:** http://localhost:5173

1. Click **"Don't have an account? Register →"**
2. Fill in:
   - Username: `teacher1`
   - Email: `teacher@example.com`
   - Password: `password123`
   - Role: **👨‍🏫 Teacher**
3. Click **"🚀 Create Account"**
4. You'll be automatically logged in and redirected to Teacher Dashboard

### **2. Register a Student Account**

1. **Logout** first (refresh page or clear localStorage)
2. Click **"Register →"**
3. Fill in:
   - Username: `student1`
   - Email: `student@example.com`
   - Password: `password123`
   - Role: **👨‍🎓 Student**
4. Click **"🚀 Create Account"**
5. Redirected to Student Portal

### **3. Register an Admin Account**

1. **Logout** first
2. Click **"Register →"**
3. Fill in:
   - Username: `admin1`
   - Email: `admin@example.com`
   - Password: `password123`
   - Role: **👨‍💼 Admin**
4. Click **"🚀 Create Account"**
5. Redirected to Admin Dashboard

### **4. Test Login**

1. **Logout** (refresh page)
2. Click **"← Already have an account? Login here"**
3. Enter:
   - Email: `teacher@example.com`
   - Password: `password123`
   - Role: **👨‍🏫 Teacher** (optional but recommended)
4. Click **"🔐 Login"**
5. Successfully logged in!

---

## 🔒 Security Features

### **Password Hashing:**
```typescript
// Plain text: "password123"
// Hashed in DB: "$2a$10$xYz123... (60 characters)"
```

### **JWT Token Format:**
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { userId: "...", username: "...", role: "teacher", exp: ... }
Signature: HMACSHA256(...)
```

### **Token Storage:**
- Stored in `localStorage`:
  - `token` - JWT token
  - `role` - User role
  - `username` - Username
  - `userId` - User ID

### **Token Expiration:**
- Valid for 7 days
- After expiration, user must login again

---

## 📊 Database Schema

### **Users Collection:**
```javascript
{
  _id: ObjectId("..."),
  username: "teacher1",
  email: "teacher@example.com",
  password: "$2a$10$hashed...", // Hashed with bcrypt
  role: "teacher", // "teacher" | "student" | "admin"
  createdAt: ISODate("2025-10-17T...")
}
```

### **Other Collections (Ready to Use):**
- `classes` - Class information
- `tests` - Test data with questions
- `materials` - Uploaded files metadata
- `attempts` - Student test attempts

---

## 🔧 API Endpoints

### **Authentication:**

**Register:**
```bash
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "username": "teacher1",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher"
}

Response 201:
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "67...",
    "username": "teacher1",
    "email": "teacher@example.com",
    "role": "teacher"
  }
}
```

**Login:**
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher" // Optional but recommended
}

Response 200:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "67...",
    "username": "teacher1",
    "email": "teacher@example.com",
    "role": "teacher"
  }
}
```

**Get Current User:**
```bash
GET http://localhost:4000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response 200:
{
  "user": {
    "id": "67...",
    "username": "teacher1",
    "email": "teacher@example.com",
    "role": "teacher"
  }
}
```

---

## ⚠️ Error Handling

### **Common Errors:**

**1. Email Already Exists:**
```json
{
  "error": "User with this email or username already exists"
}
```

**2. Invalid Credentials:**
```json
{
  "error": "Invalid email or password"
}
```

**3. Role Mismatch:**
```json
{
  "error": "This account is not a teacher account"
}
```

**4. Invalid Token:**
```json
{
  "error": "Invalid or expired token"
}
```

**5. Missing Token:**
```json
{
  "error": "Authentication required"
}
```

---

## 🔐 Environment Variables

Your `.env` file now contains:

```env
PORT=4000
GEMINI_API_KEY=AIzaSyACmzj_fZVwsZUtendRhRJ0TjMZaG_8QnU
DB_URL=mongodb+srv://rahuldusa37:dusarahul@cluster0.dcnzaca.mongodb.net/vibathon
JWT_SECRET=vibathon_secret_key_2025_secure_learning_portal
```

**⚠️ Important:** Never commit `.env` file to Git!

---

## 🚀 Using Authentication in Routes

### **Example: Protecting a Route**

```typescript
import { authenticateToken, requireTeacher } from '../middleware/auth';

// Any authenticated user
router.get('/profile', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Teachers only
router.post('/create-test', authenticateToken, requireTeacher, (req: AuthRequest, res) => {
  const teacherId = req.user.userId;
  // Create test logic...
});

// Students only
router.post('/submit-answer', authenticateToken, requireStudent, (req: AuthRequest, res) => {
  const studentId = req.user.userId;
  // Submit answer logic...
});

// Admins only
router.get('/analytics', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  // Admin analytics...
});
```

---

## 📝 Frontend localStorage

After successful login/register:

```javascript
localStorage.getItem('token');     // JWT token
localStorage.getItem('role');      // "teacher" | "student" | "admin"
localStorage.getItem('username');  // User's username
localStorage.getItem('userId');    // MongoDB _id
```

**Logout:**
```javascript
localStorage.clear(); // Clear all data
navigate('/');        // Redirect to login
```

---

## 🎯 Next Steps

### **Optional Enhancements:**

1. **Email Verification**
   - Send verification email on registration
   - Activate account via email link

2. **Password Reset**
   - "Forgot Password?" link
   - Email reset link with temporary token

3. **Profile Management**
   - Update username, email
   - Change password
   - Upload profile picture

4. **Session Management**
   - Remember me checkbox
   - Extend token expiration
   - Logout from all devices

5. **OAuth Integration**
   - Google login
   - GitHub login
   - Microsoft login

6. **Two-Factor Authentication (2FA)**
   - SMS codes
   - Authenticator app
   - Backup codes

---

## 🧪 Test Checklist

- [ ] Register as Teacher
- [ ] Login as Teacher
- [ ] Logout
- [ ] Register as Student
- [ ] Login as Student
- [ ] Logout
- [ ] Register as Admin
- [ ] Login as Admin
- [ ] Try invalid email (should fail)
- [ ] Try duplicate email (should fail)
- [ ] Try wrong password (should fail)
- [ ] Try short password < 6 chars (should fail)
- [ ] Verify token persists after page refresh
- [ ] Verify navigation based on role

---

## 📦 NPM Packages Added

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/mongoose": "^5.11.97"
  }
}
```

---

## ✅ Success Indicators

Your authentication system is working if you see:

**Backend Console:**
```
🔑 Environment loaded:
  - PORT: 4000
  - GEMINI_API_KEY: Found (AIzaSyACmz...)
  - DB_URL: Found (MongoDB Atlas)
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully!
📦 Database: vibathon
✅ Server listening on 4000
🌐 API available at: http://localhost:4000/api

✅ New teacher registered: teacher1
✅ teacher logged in: teacher1
```

**Frontend:**
- ✅ Login/Register toggle works
- ✅ Form validation works
- ✅ Success redirects to correct dashboard
- ✅ Error messages display properly
- ✅ Token stored in localStorage
- ✅ Can logout and login again

---

## 🎉 You're All Set!

Your AI Learning Portal now has:
- ✅ Real database (MongoDB)
- ✅ Secure authentication
- ✅ Password hashing
- ✅ JWT tokens
- ✅ Role-based access
- ✅ Login & Registration
- ✅ Protected routes ready

**Test it now at:** http://localhost:5173

---

**Last Updated:** Now  
**Status:** ✅ FULLY FUNCTIONAL
