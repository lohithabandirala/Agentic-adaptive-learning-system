import express from 'express';
import mongoose from 'mongoose';
import { User, StudentAnalytics, AIAnalysis, EmotionTracking } from '../db/models';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/profile/me
 * Get current user's profile with analytics (for students)
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    // Get user details
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // If student, get their analytics
    let analytics = null;
    let recentAI = null;
    let emotionSummary = null;
    
    if (user.role === 'student') {
      // Get student analytics
      analytics = await StudentAnalytics.findOne({ studentId: userId });
      
      // Get recent AI interactions
      recentAI = await AIAnalysis
        .find({ studentId: userId })
        .sort({ timestamp: -1 })
        .limit(10)
        .select('analysisType success processingTimeMs questionsGenerated timestamp');
      
      // Get emotion summary
      const emotions = await EmotionTracking.find({ studentId: userId })
        .sort({ timestamp: -1 })
        .limit(50);
      
      if (emotions.length > 0) {
        const avgStress = emotions.reduce((sum, e) => sum + (e.stressLevel || 0), 0) / emotions.length;
        const dominantEmotions = emotions.reduce((acc: any, e) => {
          acc[e.dominantEmotion] = (acc[e.dominantEmotion] || 0) + 1;
          return acc;
        }, {});
        
        emotionSummary = {
          averageStress: avgStress.toFixed(2),
          dominantEmotions,
          totalSnapshots: emotions.length
        };
      }
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        },
        analytics: analytics ? {
          overallAccuracy: Math.round(analytics.overallAccuracy * 100),
          testsCompleted: analytics.testsCompleted,
          totalQuestions: analytics.totalQuestions,
          averageStress: analytics.averageStress.toFixed(2),
          topicPerformance: analytics.topicPerformance,
          difficultyProgression: analytics.difficultyProgression.slice(0, 5),
          lastUpdated: analytics.lastUpdated
        } : null,
        recentAI: recentAI?.map(ai => ({
          type: ai.analysisType,
          success: ai.success,
          processingTime: ai.processingTimeMs,
          questionsGenerated: ai.questionsGenerated,
          timestamp: ai.timestamp
        })),
        emotionSummary
      }
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

/**
 * GET /api/profile/student/:studentId
 * Get specific student's profile (for teachers)
 */
router.get('/student/:studentId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Only teachers can view other student profiles
    const currentUser = await User.findById(req.user!.userId);
    if (currentUser?.role !== 'teacher' && currentUser?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only teachers can view student profiles'
      });
    }
    
    const { studentId } = req.params;
    const objectId = new mongoose.Types.ObjectId(studentId);
    
    // Get student user details
    const student = await User.findById(objectId).select('-password');
    
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Get analytics
    const analytics = await StudentAnalytics.findOne({ studentId: objectId });
    
    // Get AI interaction stats
    const aiAnalyses = await AIAnalysis
      .find({ studentId: objectId })
      .sort({ timestamp: -1 })
      .limit(20);
    
    const aiStats = {
      total: aiAnalyses.length,
      successful: aiAnalyses.filter(a => a.success).length,
      failed: aiAnalyses.filter(a => !a.success).length,
      avgProcessingTime: aiAnalyses.length > 0 
        ? (aiAnalyses.reduce((sum, a) => sum + a.processingTimeMs, 0) / aiAnalyses.length).toFixed(0)
        : 0,
      byType: {
        questionGeneration: aiAnalyses.filter(a => a.analysisType === 'question_generation').length,
        sessionAnalysis: aiAnalyses.filter(a => a.analysisType === 'session_analysis').length
      }
    };
    
    // Get emotion tracking data
    const emotions = await EmotionTracking
      .find({ studentId: objectId })
      .sort({ timestamp: -1 })
      .limit(100);
    
    let emotionStats = null;
    if (emotions.length > 0) {
      const avgStress = emotions.reduce((sum, e) => sum + (e.stressLevel || 0), 0) / emotions.length;
      const emotionCounts = emotions.reduce((acc: any, e) => {
        acc[e.dominantEmotion] = (acc[e.dominantEmotion] || 0) + 1;
        return acc;
      }, {});
      
      emotionStats = {
        averageStress: avgStress.toFixed(2),
        emotionDistribution: emotionCounts,
        totalSnapshots: emotions.length,
        recentEmotions: emotions.slice(0, 10).map(e => ({
          emotion: e.dominantEmotion,
          stress: e.stressLevel,
          timestamp: e.timestamp
        }))
      };
    }
    
    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          username: student.username,
          email: student.email,
          createdAt: student.createdAt
        },
        analytics: analytics ? {
          overallAccuracy: Math.round(analytics.overallAccuracy * 100),
          testsCompleted: analytics.testsCompleted,
          totalQuestions: analytics.totalQuestions,
          averageStress: analytics.averageStress.toFixed(2),
          topicPerformance: analytics.topicPerformance.map(tp => ({
            topic: tp.topic,
            accuracy: Math.round(tp.accuracy * 100),
            testsCount: tp.testsCount,
            averageStress: tp.averageStress.toFixed(2),
            lastAttempted: tp.lastAttempted
          })),
          difficultyProgression: analytics.difficultyProgression,
          strengths: analytics.strengths,
          weaknesses: analytics.weaknesses,
          lastUpdated: analytics.lastUpdated
        } : null,
        aiStats,
        emotionStats
      }
    });
  } catch (error: any) {
    console.error('Student profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student profile'
    });
  }
});

/**
 * GET /api/profile/students
 * Get all students' profiles (for teachers)
 */
router.get('/students', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Only teachers and admins can view all students
    const currentUser = await User.findById(req.user!.userId);
    if (currentUser?.role !== 'teacher' && currentUser?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only teachers can view all student profiles'
      });
    }
    
    // Get all students
    const students = await User.find({ role: 'student' }).select('-password');
    
    // Get analytics for each student
    const studentProfiles = await Promise.all(
      students.map(async (student) => {
        const analytics = await StudentAnalytics.findOne({ studentId: student._id });
        const aiCount = await AIAnalysis.countDocuments({ studentId: student._id });
        const emotionCount = await EmotionTracking.countDocuments({ studentId: student._id });
        
        return {
          id: student._id,
          username: student.username,
          email: student.email,
          createdAt: student.createdAt,
          analytics: analytics ? {
            overallAccuracy: Math.round(analytics.overallAccuracy * 100),
            testsCompleted: analytics.testsCompleted,
            totalQuestions: analytics.totalQuestions,
            averageStress: analytics.averageStress.toFixed(2),
            lastUpdated: analytics.lastUpdated
          } : null,
          aiInteractions: aiCount,
          emotionSnapshots: emotionCount
        };
      })
    );
    
    // Sort by overall accuracy (descending)
    studentProfiles.sort((a, b) => {
      const accA = a.analytics?.overallAccuracy || 0;
      const accB = b.analytics?.overallAccuracy || 0;
      return accB - accA;
    });
    
    res.json({
      success: true,
      data: {
        students: studentProfiles,
        totalStudents: studentProfiles.length,
        withAnalytics: studentProfiles.filter(s => s.analytics !== null).length
      }
    });
  } catch (error: any) {
    console.error('Students fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    });
  }
});

/**
 * PUT /api/profile/update
 * Update current user's profile
 */
router.put('/update', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { username, email } = req.body;
    
    const updateData: any = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

export default router;
