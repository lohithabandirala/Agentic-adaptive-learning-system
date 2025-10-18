import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Adaptive AI Learning System',
    version: '1.0.0',
    database: 'MongoDB',
    ai: 'Google Gemini',
    endpoints: {
      health: 'GET /api/health',
      students: {
        register: 'POST /api/students/register',
        profile: 'GET /api/students/:studentId/profile'
      },
      sessions: {
        start: 'POST /api/sessions/start',
        nextQuestion: 'POST /api/sessions/question/next',
        submitAnswer: 'POST /api/sessions/answer/submit',
        complete: 'POST /api/sessions/complete'
      },
      analytics: {
        student: 'GET /api/analytics/student/:studentId',
        topic: 'GET /api/analytics/topic/:studentId/:topic'
      },
      emotions: {
        patterns: 'GET /api/emotions/patterns/:studentId'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 ADAPTIVE AI LEARNING SYSTEM');
      console.log('='.repeat(60));
      console.log(`\n📡 Server running on: http://localhost:${PORT}`);
      console.log(`📊 Database: MongoDB (${process.env.MONGODB_URI ? 'Connected' : 'Local'})`);
      console.log(`🤖 AI Engine: Google Gemini`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n' + '='.repeat(60));
      console.log('📚 API ENDPOINTS');
      console.log('='.repeat(60));
      console.log('\n🏥 Health & Info:');
      console.log(`   GET  /api/health`);
      console.log('\n👥 Student Management:');
      console.log(`   POST /api/students/register`);
      console.log(`   GET  /api/students/:studentId/profile`);
      console.log('\n📝 Assessment Sessions:');
      console.log(`   POST /api/sessions/start`);
      console.log(`   POST /api/sessions/question/next`);
      console.log(`   POST /api/sessions/answer/submit`);
      console.log(`   POST /api/sessions/complete`);
      console.log('\n📊 Analytics:');
      console.log(`   GET  /api/analytics/student/:studentId`);
      console.log(`   GET  /api/analytics/topic/:studentId/:topic`);
      console.log('\n😊 Emotion Tracking:');
      console.log(`   GET  /api/emotions/patterns/:studentId`);
      console.log('\n' + '='.repeat(60));
      console.log('✅ System ready! Waiting for requests...');
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
