import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { generateQuestions } from './questionGenerator.js';
import { readPdfAsBase64 } from './pdfUtils.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * POST /api/generate-questions
 * Generate questions from topic and/or student data
 * 
 * Body:
 * {
 *   "topic": "Photosynthesis",
 *   "studentData": { ... },
 *   "questionCount": 5
 * }
 */
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { topic, studentData, questionCount = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    const result = await generateQuestions({
      topic,
      studentData,
      questionCount
    });

    res.json(result);
  } catch (error) {
    console.error('Error in /api/generate-questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/generate-questions-with-pdf
 * Generate questions from PDF with optional topic and student data
 * 
 * Multipart form data:
 * - pdf: PDF file
 * - topic: (optional) Topic string
 * - studentData: (optional) JSON string
 * - questionCount: (optional) Number
 */
app.post('/api/generate-questions-with-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'PDF file is required'
      });
    }

    const pdfContent = req.file.buffer.toString('base64');
    const topic = req.body.topic || null;
    const studentData = req.body.studentData ? JSON.parse(req.body.studentData) : null;
    const questionCount = parseInt(req.body.questionCount) || 5;

    const result = await generateQuestions({
      topic,
      studentData,
      pdfContent,
      pdfMimeType: 'application/pdf',
      questionCount
    });

    res.json(result);
  } catch (error) {
    console.error('Error in /api/generate-questions-with-pdf:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/generate-questions-with-emotion
 * Generate questions from topic, student data, and emotion analysis
 * 
 * Body:
 * {
 *   "topic": "Photosynthesis",
 *   "studentData": { ... },
 *   "emotionData": { ... },
 *   "questionCount": 5
 * }
 */
app.post('/api/generate-questions-with-emotion', async (req, res) => {
  try {
    const { topic, studentData, emotionData, questionCount = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required'
      });
    }

    // Enhance student data with emotion insights if provided
    let enhancedStudentData = studentData;
    if (emotionData) {
      enhancedStudentData = {
        ...studentData,
        emotionalState: {
          overallEmotion: emotionData.overall_dominant_emotion,
          emotionBreakdown: emotionData.dominant_emotion_percentages,
          stressLevel: emotionData.stress_level,
          analysisTimestamp: emotionData.end_time
        }
      };
    }

    const result = await generateQuestions({
      topic,
      studentData: enhancedStudentData,
      questionCount
    });

    res.json(result);
  } catch (error) {
    console.error('Error in /api/generate-questions-with-emotion:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Question Generator API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /
 * Welcome message
 */
app.get('/', (req, res) => {
  res.json({
    message: 'AI Question Generator API',
    version: '1.0.0',
    endpoints: {
      'POST /api/generate-questions': 'Generate questions from topic and student data',
      'POST /api/generate-questions-with-pdf': 'Generate questions from PDF file',
      'POST /api/generate-questions-with-emotion': 'Generate questions with emotion analysis integration',
      'GET /api/health': 'Health check'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Question Generator API running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   - POST http://localhost:${PORT}/api/generate-questions`);
  console.log(`   - POST http://localhost:${PORT}/api/generate-questions-with-pdf`);
  console.log(`   - POST http://localhost:${PORT}/api/generate-questions-with-emotion`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
});

export default app;
