import express from 'express';
import { EmotionTracking } from '../db/models/EmotionTracking'; // Named import
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Track emotion data during test
router.post('/track', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { attemptId, questionNumber, emotions, dominantEmotion, stressLevel } = req.body;
    const studentId = req.user?.userId;

    // Validate required fields
    if (!attemptId || !questionNumber || !emotions || !dominantEmotion || stressLevel === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: attemptId, questionNumber, emotions, dominantEmotion, stressLevel' 
      });
    }

    // Create emotion tracking record
    const emotionRecord = new EmotionTracking({
      studentId,
      attemptId,
      questionNumber,
      emotions,
      dominantEmotion,
      stressLevel,
      timestamp: new Date()
    });

    await emotionRecord.save();

    res.status(201).json({
      message: 'Emotion tracked successfully',
      data: emotionRecord
    });
  } catch (error) {
    console.error('Error tracking emotion:', error);
    res.status(500).json({ error: 'Failed to track emotion' });
  }
});

// Get emotion history for a specific attempt
router.get('/history/:attemptId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user?.userId;

    const emotionHistory = await EmotionTracking.find({
      attemptId,
      studentId
    })
      .sort({ timestamp: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: emotionHistory,
      count: emotionHistory.length
    });
  } catch (error) {
    console.error('Error fetching emotion history:', error);
    res.status(500).json({ error: 'Failed to fetch emotion history' });
  }
});

// Get emotion summary for an attempt (for analytics)
router.get('/summary/:attemptId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user?.userId;

    const emotions = await EmotionTracking.find({
      attemptId,
      studentId
    });

    if (emotions.length === 0) {
      return res.json({
        success: true,
        data: {
          averageStress: 0,
          emotionDistribution: {},
          totalRecords: 0
        }
      });
    }

    // Calculate average stress level
    const averageStress = emotions.reduce((sum, e) => sum + e.stressLevel, 0) / emotions.length;

    // Calculate emotion distribution
    const emotionDistribution: { [key: string]: number } = {};
    emotions.forEach(e => {
      emotionDistribution[e.dominantEmotion] = (emotionDistribution[e.dominantEmotion] || 0) + 1;
    });

    // Calculate average for each emotion type
    const emotionAverages: { [key: string]: number } = {};
    const emotionTypes = ['happy', 'sad', 'angry', 'fear', 'neutral', 'surprise', 'disgust'];
    
    emotionTypes.forEach(type => {
      const sum = emotions.reduce((acc, e) => acc + (e.emotions as any)[type], 0);
      emotionAverages[type] = sum / emotions.length;
    });

    res.json({
      success: true,
      data: {
        averageStress: Math.round(averageStress * 100) / 100,
        emotionDistribution,
        emotionAverages,
        totalRecords: emotions.length,
        timeline: emotions.map(e => ({
          questionNumber: e.questionNumber,
          stressLevel: e.stressLevel,
          dominantEmotion: e.dominantEmotion,
          timestamp: e.timestamp
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching emotion summary:', error);
    res.status(500).json({ error: 'Failed to fetch emotion summary' });
  }
});

// Get all emotion records for a student (admin/teacher only)
router.get('/student/:studentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if user is teacher or admin
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Teacher or Admin access required' });
    }

    const { studentId } = req.params;

    const emotionRecords = await EmotionTracking.find({ studentId })
      .sort({ timestamp: -1 })
      .limit(100)
      .select('-__v');

    res.json({
      success: true,
      data: emotionRecords,
      count: emotionRecords.length
    });
  } catch (error) {
    console.error('Error fetching student emotions:', error);
    res.status(500).json({ error: 'Failed to fetch student emotions' });
  }
});

export default router;
