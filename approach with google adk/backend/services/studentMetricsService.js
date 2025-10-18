/**
 * Student Metrics Service
 * Generates comprehensive student performance metrics and analytics
 */

import Student from '../models/Student.js';
import AssessmentSession from '../models/AssessmentSession.js';
import QuestionAttempt from '../models/QuestionAttempt.js';
import EmotionTracking from '../models/EmotionTracking.js';

/**
 * Generate comprehensive student metrics
 * Returns detailed analytics similar to the sample format
 */
export async function generateStudentMetrics(studentId) {
  try {
    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      throw new Error('Student not found');
    }

    // Get all student data
    const sessions = await AssessmentSession.find({ student_id: studentId }).sort({ createdAt: -1 });
    const attempts = await QuestionAttempt.find({ student_id: studentId }).sort({ attemptedAt: -1 });
    const emotions = await EmotionTracking.find({ student_id: studentId }).sort({ timestamp: -1 });

    // Recent Activity Metrics
    const recentActivity = {
      lastLogin: sessions.length > 0 ? sessions[0].createdAt : null,
      totalTestsTaken: sessions.length,
      averageCompletionTimeSec: calculateAverageCompletionTime(sessions)
    };

    // Overall Performance Summary
    const performanceSummary = {
      overallAccuracy: calculateOverallAccuracy(attempts),
      averageSpeedSec: calculateAverageSpeed(attempts),
      averageDifficultyLevel: calculateAverageDifficulty(attempts),
      trend: calculatePerformanceTrend(attempts)
    };

    // Topic-wise Performance
    const topicWisePerformance = calculateTopicWisePerformance(attempts);

    // Emotion Tracking Summary
    const emotionTracking = {
      averageFocusScore: calculateFocusScore(emotions),
      averageConfidenceScore: calculateConfidenceScore(emotions, attempts),
      stressLevel: calculateStressLevel(emotions),
      notes: generateEmotionNotes(emotions)
    };

    // Learning Preferences (inferred from data)
    const learningPreferences = {
      preferredDifficulty: inferPreferredDifficulty(attempts),
      preferredQuestionType: "MCQ", // Default, can be extended
      preferredMode: "Visual", // Default, can be extended
      studyTime: inferStudyTime(sessions)
    };

    // Goals and Focus Areas
    const goals = {
      targetAccuracy: 0.85, // Can be customized per student
      focusTopics: identifyWeakTopics(topicWisePerformance),
      examDate: null // Can be set by student
    };

    // Get unique subjects
    const subjects = [...new Set(attempts.map(a => a.subject).filter(s => s))];

    return {
      studentId: student.student_id,
      name: student.name,
      grade: student.grade,
      subjects: subjects.length > 0 ? subjects : ["Not specified"],
      recentActivity,
      performanceSummary,
      topicWisePerformance,
      emotionTracking,
      learningPreferences,
      goals,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating student metrics:', error);
    throw error;
  }
}

/**
 * Calculate average session completion time
 */
function calculateAverageCompletionTime(sessions) {
  if (sessions.length === 0) return 0;
  
  const completedSessions = sessions.filter(s => s.completedAt && s.createdAt);
  if (completedSessions.length === 0) return 0;
  
  const totalTime = completedSessions.reduce((sum, session) => {
    const duration = (new Date(session.completedAt) - new Date(session.createdAt)) / 1000;
    return sum + duration;
  }, 0);
  
  return Math.round(totalTime / completedSessions.length);
}

/**
 * Calculate overall accuracy
 */
function calculateOverallAccuracy(attempts) {
  if (attempts.length === 0) return 0;
  const correct = attempts.filter(a => a.isCorrect).length;
  return parseFloat((correct / attempts.length).toFixed(2));
}

/**
 * Calculate average time per question
 */
function calculateAverageSpeed(attempts) {
  if (attempts.length === 0) return 0;
  const totalTime = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
  return Math.round(totalTime / attempts.length);
}

/**
 * Calculate average difficulty level
 */
function calculateAverageDifficulty(attempts) {
  if (attempts.length === 0) return 2;
  
  const difficultyMap = { easy: 1, medium: 2, hard: 3 };
  const totalDifficulty = attempts.reduce((sum, a) => {
    return sum + (difficultyMap[a.difficulty] || 2);
  }, 0);
  
  return Math.round(totalDifficulty / attempts.length);
}

/**
 * Calculate performance trend
 */
function calculatePerformanceTrend(attempts) {
  if (attempts.length < 5) return "insufficient_data";
  
  // Compare recent 25% vs older 25%
  const recentCount = Math.floor(attempts.length * 0.25);
  const recentAttempts = attempts.slice(0, recentCount);
  const olderAttempts = attempts.slice(-recentCount);
  
  const recentAccuracy = recentAttempts.filter(a => a.isCorrect).length / recentAttempts.length;
  const olderAccuracy = olderAttempts.filter(a => a.isCorrect).length / olderAttempts.length;
  
  if (recentAccuracy > olderAccuracy + 0.1) return "improving";
  if (recentAccuracy < olderAccuracy - 0.1) return "declining";
  return "stable";
}

/**
 * Calculate topic-wise performance
 */
function calculateTopicWisePerformance(attempts) {
  const topicData = {};
  
  attempts.forEach(attempt => {
    const topic = attempt.topic || "General";
    
    if (!topicData[topic]) {
      topicData[topic] = {
        total: 0,
        correct: 0,
        difficulties: [],
        errors: []
      };
    }
    
    topicData[topic].total++;
    if (attempt.isCorrect) {
      topicData[topic].correct++;
    } else {
      // Track question as error (simplified)
      if (attempt.question_text) {
        topicData[topic].errors.push(attempt.question_text.substring(0, 50));
      }
    }
    
    const diffMap = { easy: 1, medium: 2, hard: 3 };
    topicData[topic].difficulties.push(diffMap[attempt.difficulty] || 2);
  });
  
  // Format the output
  const result = {};
  Object.keys(topicData).forEach(topic => {
    const data = topicData[topic];
    result[topic] = {
      accuracy: parseFloat((data.correct / data.total).toFixed(2)),
      avgDifficulty: Math.round(data.difficulties.reduce((a, b) => a + b, 0) / data.difficulties.length),
      recentErrors: data.errors.slice(0, 3) // Most recent 3 errors
    };
  });
  
  return result;
}

/**
 * Calculate focus score from emotion data
 */
function calculateFocusScore(emotions) {
  if (emotions.length === 0) return 0.5;
  
  // Focus score based on emotion stability and stress levels
  const avgStress = emotions.reduce((sum, e) => sum + (e.stressLevel || 0), 0) / emotions.length;
  
  // Lower stress = higher focus (inverse relationship)
  // Map stress (0-1) to focus (1-0)
  const focusScore = Math.max(0, Math.min(1, 1 - avgStress));
  
  return parseFloat(focusScore.toFixed(2));
}

/**
 * Calculate confidence score
 */
function calculateConfidenceScore(emotions, attempts) {
  if (attempts.length === 0) return 0.5;
  
  // Confidence based on accuracy and emotional state
  const accuracy = calculateOverallAccuracy(attempts);
  const avgStress = emotions.length > 0 
    ? emotions.reduce((sum, e) => sum + (e.stressLevel || 0), 0) / emotions.length 
    : 0.3;
  
  // Higher accuracy and lower stress = higher confidence
  const confidence = (accuracy * 0.7) + ((1 - avgStress) * 0.3);
  
  return parseFloat(confidence.toFixed(2));
}

/**
 * Calculate stress level category
 */
function calculateStressLevel(emotions) {
  if (emotions.length === 0) return "unknown";
  
  const avgStress = emotions.reduce((sum, e) => sum + (e.stressLevel || 0), 0) / emotions.length;
  
  if (avgStress < 0.3) return "low";
  if (avgStress < 0.6) return "medium";
  return "high";
}

/**
 * Generate emotion notes
 */
function generateEmotionNotes(emotions) {
  if (emotions.length === 0) return "No emotion data available.";
  
  const avgStress = emotions.reduce((sum, e) => sum + (e.stressLevel || 0), 0) / emotions.length;
  
  // Count dominant emotions
  const emotionCounts = {};
  emotions.forEach(e => {
    const emotion = e.dominantEmotion || 'neutral';
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  
  const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) => 
    emotionCounts[a] > emotionCounts[b] ? a : b
  );
  
  if (avgStress > 0.6) {
    return `Shows high stress levels. Predominantly ${dominantEmotion} during assessments.`;
  } else if (avgStress > 0.3) {
    return `Shows moderate stress on challenging problems. Generally ${dominantEmotion}.`;
  } else {
    return `Maintains calm demeanor. Predominantly ${dominantEmotion} during assessments.`;
  }
}

/**
 * Infer preferred difficulty
 */
function inferPreferredDifficulty(attempts) {
  if (attempts.length === 0) return 2;
  
  // Calculate success rate at each difficulty
  const difficultyStats = { easy: { total: 0, correct: 0 }, medium: { total: 0, correct: 0 }, hard: { total: 0, correct: 0 } };
  
  attempts.forEach(a => {
    const diff = a.difficulty || 'medium';
    difficultyStats[diff].total++;
    if (a.isCorrect) difficultyStats[diff].correct++;
  });
  
  // Find difficulty with best balance of volume and success
  const diffMap = { easy: 1, medium: 2, hard: 3 };
  let bestDiff = 'medium';
  let bestScore = 0;
  
  Object.keys(difficultyStats).forEach(diff => {
    const stats = difficultyStats[diff];
    if (stats.total > 0) {
      const accuracy = stats.correct / stats.total;
      const score = accuracy * stats.total; // Balance accuracy and volume
      if (score > bestScore) {
        bestScore = score;
        bestDiff = diff;
      }
    }
  });
  
  return diffMap[bestDiff] || 2;
}

/**
 * Infer study time preference
 */
function inferStudyTime(sessions) {
  if (sessions.length === 0) return "Not enough data";
  
  const timeSlots = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
  
  sessions.forEach(session => {
    const hour = new Date(session.createdAt).getHours();
    
    if (hour >= 5 && hour < 12) timeSlots.Morning++;
    else if (hour >= 12 && hour < 17) timeSlots.Afternoon++;
    else if (hour >= 17 && hour < 21) timeSlots.Evening++;
    else timeSlots.Night++;
  });
  
  return Object.keys(timeSlots).reduce((a, b) => timeSlots[a] > timeSlots[b] ? a : b);
}

/**
 * Identify weak topics that need focus
 */
function identifyWeakTopics(topicWisePerformance) {
  const topics = Object.keys(topicWisePerformance);
  if (topics.length === 0) return [];
  
  // Sort by accuracy (ascending)
  const sortedTopics = topics.sort((a, b) => 
    topicWisePerformance[a].accuracy - topicWisePerformance[b].accuracy
  );
  
  // Return bottom 2 topics (weakest areas)
  return sortedTopics.slice(0, Math.min(2, sortedTopics.length));
}

export default {
  generateStudentMetrics
};
