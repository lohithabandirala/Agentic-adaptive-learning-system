import express from 'express';
import mongoose from 'mongoose';
import { StudentAnalytics, AIAnalysis } from '../db/models';

const router = express.Router();

// ==================== STUDENT ANALYTICS ====================

/**
 * GET /api/analytics/student/:studentId
 * Get comprehensive analytics for a student
 */
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Convert string to ObjectId
    const objectId = new mongoose.Types.ObjectId(studentId);
    
    const analytics = await StudentAnalytics
      .findOne({ studentId: objectId })
      .populate('studentId', 'username email role');
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'No analytics found for this student'
      });
    }
    
    res.json({
      success: true,
      data: {
        overview: {
          studentId: analytics.studentId,
          overallAccuracy: Math.round(analytics.overallAccuracy * 100),
          testsCompleted: analytics.testsCompleted,
          totalQuestions: analytics.totalQuestions,
          averageStress: analytics.averageStress.toFixed(2),
          lastUpdated: analytics.lastUpdated
        },
        performance: {
          topicPerformance: analytics.topicPerformance.map(tp => ({
            topic: tp.topic,
            accuracy: Math.round(tp.accuracy * 100),
            testsCount: tp.testsCount,
            averageStress: tp.averageStress.toFixed(2),
            lastAttempted: tp.lastAttempted
          })),
          difficultyProgression: analytics.difficultyProgression.slice(-10).map(dp => ({
            timestamp: dp.timestamp,
            difficulty: dp.difficulty,
            accuracy: Math.round(dp.accuracy * 100)
          }))
        },
        insights: {
          strengths: analytics.strengths,
          weaknesses: analytics.weaknesses
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student analytics',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/leaderboard
 * Get top performing students
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const topStudents = await StudentAnalytics
      .find({ testsCompleted: { $gt: 0 } })
      .sort({ overallAccuracy: -1, testsCompleted: -1 })
      .limit(limit)
      .select('studentId overallAccuracy testsCompleted totalQuestions strengths');
    
    const leaderboard = topStudents.map((student, index) => ({
      rank: index + 1,
      studentId: student.studentId,
      overallAccuracy: Math.round(student.overallAccuracy * 100),
      testsCompleted: student.testsCompleted,
      totalQuestions: student.totalQuestions,
      strengths: student.strengths
    }));
    
    res.json({
      success: true,
      data: leaderboard,
      count: leaderboard.length
    });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/topic-performance
 * Get aggregated performance across all students for a topic
 */
router.get('/topic-performance/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    
    const students = await StudentAnalytics.find({
      'topicPerformance.topic': topic
    });
    
    const topicData = students
      .map(s => s.topicPerformance.find(tp => tp.topic === topic))
      .filter(Boolean);
    
    if (topicData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No data found for this topic'
      });
    }
    
    const avgAccuracy = topicData.reduce((sum, tp) => sum + (tp?.accuracy || 0), 0) / topicData.length;
    const totalTests = topicData.reduce((sum, tp) => sum + (tp?.testsCount || 0), 0);
    const avgStress = topicData.reduce((sum, tp) => sum + (tp?.averageStress || 0), 0) / topicData.length;
    
    res.json({
      success: true,
      data: {
        topic,
        studentsAttempted: topicData.length,
        averageAccuracy: Math.round(avgAccuracy * 100),
        totalTests,
        averageStress: avgStress.toFixed(2),
        distribution: {
          excellent: topicData.filter(tp => (tp?.accuracy || 0) >= 0.8).length,
          good: topicData.filter(tp => (tp?.accuracy || 0) >= 0.6 && (tp?.accuracy || 0) < 0.8).length,
          needsImprovement: topicData.filter(tp => (tp?.accuracy || 0) < 0.6).length
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching topic performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topic performance',
      message: error.message
    });
  }
});

// ==================== AI ANALYSIS ====================

/**
 * GET /api/analytics/ai/attempt/:attemptId
 * Get all AI interactions for a specific test attempt
 */
router.get('/ai/attempt/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const analyses = await AIAnalysis
      .find({ attemptId })
      .sort({ timestamp: 1 })
      .select('-__v');
    
    if (analyses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No AI analysis found for this attempt'
      });
    }
    
    // Calculate summary statistics
    const totalProcessingTime = analyses.reduce((sum, a) => sum + a.processingTimeMs, 0);
    const successRate = (analyses.filter(a => a.success).length / analyses.length) * 100;
    
    const toolUsage: { [key: string]: number } = {};
    analyses.forEach(a => {
      a.toolCallsUsed.forEach(tc => {
        toolUsage[tc.toolName] = (toolUsage[tc.toolName] || 0) + 1;
      });
    });
    
    res.json({
      success: true,
      data: {
        attemptId,
        summary: {
          totalInteractions: analyses.length,
          successRate: Math.round(successRate),
          totalProcessingTime,
          averageProcessingTime: Math.round(totalProcessingTime / analyses.length),
          toolUsage
        },
        interactions: analyses.map(a => ({
          id: a._id,
          timestamp: a.timestamp,
          analysisType: a.analysisType,
          session: a.session,
          success: a.success,
          processingTimeMs: a.processingTimeMs,
          toolCallsUsed: a.toolCallsUsed.map(tc => tc.toolName),
          iterations: a.iterations,
          recommendation: a.recommendation,
          nextDifficulty: a.nextDifficulty,
          questionsGenerated: a.questionsGenerated,
          error: a.error
        }))
      }
    });
  } catch (error: any) {
    console.error('Error fetching AI analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI analysis',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/ai/student/:studentId
 * Get AI interaction history for a student
 */
router.get('/ai/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Convert string to ObjectId
    const objectId = new mongoose.Types.ObjectId(studentId);
    
    const analyses = await AIAnalysis
      .find({ studentId: objectId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-prompt -response -inputData -__v')
      .populate('studentId', 'username email');
    
    if (analyses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No AI analysis found for this student'
      });
    }
    
    // Calculate statistics
    const avgProcessingTime = analyses.reduce((sum, a) => sum + a.processingTimeMs, 0) / analyses.length;
    const successRate = (analyses.filter(a => a.success).length / analyses.length) * 100;
    
    const typeDistribution = {
      question_generation: analyses.filter(a => a.analysisType === 'question_generation').length,
      session_analysis: analyses.filter(a => a.analysisType === 'session_analysis').length
    };
    
    res.json({
      success: true,
      data: {
        studentId,
        summary: {
          totalInteractions: analyses.length,
          averageProcessingTime: Math.round(avgProcessingTime),
          successRate: Math.round(successRate),
          typeDistribution
        },
        recentInteractions: analyses.slice(0, 10).map(a => ({
          id: a._id,
          timestamp: a.timestamp,
          analysisType: a.analysisType,
          success: a.success,
          processingTimeMs: a.processingTimeMs,
          toolCallsUsed: a.toolCallsUsed.map(tc => tc.toolName),
          iterations: a.iterations,
          recommendation: a.recommendation,
          error: a.error
        }))
      }
    });
  } catch (error: any) {
    console.error('Error fetching student AI history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student AI history',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/ai/performance
 * Get overall AI agent performance metrics
 */
router.get('/ai/performance', async (req, res) => {
  try {
    const timeRange = parseInt(req.query.hours as string) || 24;
    const since = new Date(Date.now() - timeRange * 60 * 60 * 1000);
    
    const analyses = await AIAnalysis
      .find({ timestamp: { $gte: since } })
      .select('analysisType processingTimeMs success toolCallsUsed iterations');
    
    if (analyses.length === 0) {
      return res.json({
        success: true,
        data: {
          message: `No AI interactions in the last ${timeRange} hours`,
          summary: null
        }
      });
    }
    
    // Calculate metrics
    const totalInteractions = analyses.length;
    const successCount = analyses.filter(a => a.success).length;
    const failureCount = totalInteractions - successCount;
    const successRate = (successCount / totalInteractions) * 100;
    
    const avgProcessingTime = analyses.reduce((sum, a) => sum + a.processingTimeMs, 0) / totalInteractions;
    const maxProcessingTime = Math.max(...analyses.map(a => a.processingTimeMs));
    const minProcessingTime = Math.min(...analyses.map(a => a.processingTimeMs));
    
    // Tool usage statistics
    const toolUsage: { [key: string]: { count: number; avgTime: number } } = {};
    analyses.forEach(a => {
      a.toolCallsUsed.forEach(tc => {
        if (!toolUsage[tc.toolName]) {
          toolUsage[tc.toolName] = { count: 0, avgTime: 0 };
        }
        toolUsage[tc.toolName].count++;
        if (tc.executionTimeMs) {
          toolUsage[tc.toolName].avgTime += tc.executionTimeMs;
        }
      });
    });
    
    // Calculate averages for tool execution times
    Object.keys(toolUsage).forEach(tool => {
      if (toolUsage[tool].count > 0) {
        toolUsage[tool].avgTime = Math.round(toolUsage[tool].avgTime / toolUsage[tool].count);
      }
    });
    
    // Type distribution
    const typeDistribution = {
      question_generation: analyses.filter(a => a.analysisType === 'question_generation').length,
      session_analysis: analyses.filter(a => a.analysisType === 'session_analysis').length
    };
    
    // Iterations statistics
    const avgIterations = analyses.reduce((sum, a) => sum + a.iterations, 0) / totalInteractions;
    const maxIterations = Math.max(...analyses.map(a => a.iterations));
    
    res.json({
      success: true,
      data: {
        timeRange: `Last ${timeRange} hours`,
        summary: {
          totalInteractions,
          successCount,
          failureCount,
          successRate: Math.round(successRate),
          performance: {
            avgProcessingTime: Math.round(avgProcessingTime),
            maxProcessingTime,
            minProcessingTime,
            avgIterations: avgIterations.toFixed(1),
            maxIterations
          }
        },
        typeDistribution,
        toolUsage: Object.entries(toolUsage).map(([tool, stats]) => ({
          tool,
          callCount: stats.count,
          avgExecutionTime: stats.avgTime
        })).sort((a, b) => b.callCount - a.callCount)
      }
    });
  } catch (error: any) {
    console.error('Error fetching AI performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI performance metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/ai/failures
 * Get recent AI failures for debugging
 */
router.get('/ai/failures', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const failures = await AIAnalysis
      .find({ success: false })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('timestamp attemptId studentId analysisType error processingTimeMs toolCallsUsed');
    
    res.json({
      success: true,
      data: {
        count: failures.length,
        failures: failures.map(f => ({
          timestamp: f.timestamp,
          attemptId: f.attemptId,
          studentId: f.studentId,
          analysisType: f.analysisType,
          error: f.error,
          processingTimeMs: f.processingTimeMs,
          toolCallsAttempted: f.toolCallsUsed.map(tc => tc.toolName)
        }))
      }
    });
  } catch (error: any) {
    console.error('Error fetching AI failures:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI failures',
      message: error.message
    });
  }
});

/**
 * GET /api/analytics/ai/detail/:id
 * Get full details of a specific AI interaction (for debugging)
 */
router.get('/ai/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const analysis = await AIAnalysis.findById(id);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'AI analysis not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: analysis._id,
        attemptId: analysis.attemptId,
        studentId: analysis.studentId,
        session: analysis.session,
        timestamp: analysis.timestamp,
        analysisType: analysis.analysisType,
        model: analysis.model,
        prompt: analysis.prompt.substring(0, 500) + '...', // Truncate for display
        inputData: analysis.inputData,
        toolCallsUsed: analysis.toolCallsUsed,
        iterations: analysis.iterations,
        response: typeof analysis.response === 'string' 
          ? analysis.response.substring(0, 500) + '...'
          : analysis.response,
        recommendation: analysis.recommendation,
        nextDifficulty: analysis.nextDifficulty,
        questionsGenerated: analysis.questionsGenerated,
        processingTimeMs: analysis.processingTimeMs,
        success: analysis.success,
        error: analysis.error
      }
    });
  } catch (error: any) {
    console.error('Error fetching AI detail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI detail',
      message: error.message
    });
  }
});

// ==================== COMBINED ANALYTICS ====================

/**
 * GET /api/analytics/dashboard/:studentId
 * Get combined dashboard data for a student
 */
router.get('/dashboard/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Convert string to ObjectId
    const objectId = new mongoose.Types.ObjectId(studentId);
    
    // Get student analytics
    const studentAnalytics = await StudentAnalytics
      .findOne({ studentId: objectId })
      .populate('studentId', 'username email role');
    
    // Get recent AI interactions
    const recentAI = await AIAnalysis
      .find({ studentId: objectId })
      .sort({ timestamp: -1 })
      .limit(5)
      .select('-prompt -response -inputData -__v');
    
    if (!studentAnalytics) {
      return res.status(404).json({
        success: false,
        error: 'No analytics found for this student'
      });
    }
    
    res.json({
      success: true,
      data: {
        student: {
          studentId,
          overallAccuracy: Math.round(studentAnalytics.overallAccuracy * 100),
          testsCompleted: studentAnalytics.testsCompleted,
          strengths: studentAnalytics.strengths,
          weaknesses: studentAnalytics.weaknesses
        },
        recentTopics: studentAnalytics.topicPerformance
          .sort((a, b) => b.lastAttempted.getTime() - a.lastAttempted.getTime())
          .slice(0, 5)
          .map(tp => ({
            topic: tp.topic,
            accuracy: Math.round(tp.accuracy * 100),
            testsCount: tp.testsCount
          })),
        difficultyTrend: studentAnalytics.difficultyProgression
          .slice(-5)
          .map(dp => ({
            difficulty: dp.difficulty,
            accuracy: Math.round(dp.accuracy * 100),
            timestamp: dp.timestamp
          })),
        aiInsights: {
          totalInteractions: recentAI.length,
          averageProcessingTime: recentAI.length > 0
            ? Math.round(recentAI.reduce((sum, a) => sum + a.processingTimeMs, 0) / recentAI.length)
            : 0
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

export default router;
