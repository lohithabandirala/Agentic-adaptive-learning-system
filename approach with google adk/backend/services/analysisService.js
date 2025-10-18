import { generateStructuredContent } from './aiService.js';
import Student from '../models/Student.js';
import AssessmentSession from '../models/AssessmentSession.js';
import QuestionAttempt from '../models/QuestionAttempt.js';
import EmotionTracking from '../models/EmotionTracking.js';
import AIAnalysis from '../models/AIAnalysis.js';

/**
 * Analyze student performance comprehensively
 */
export async function analyzeStudentPerformance(studentId) {
  try {
    // Gather all student data
    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      throw new Error('Student not found');
    }

    const sessions = await AssessmentSession.find({ student_id: studentId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const attempts = await QuestionAttempt.find({ student_id: studentId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const emotions = await EmotionTracking.find({ student_id: studentId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Calculate statistics
    const totalQuestions = attempts.length;
    const correctAnswers = attempts.filter(a => a.is_correct).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100) : 0;

    const prompt = `
You are an expert educational psychologist and data analyst.

Analyze this student's complete learning profile:

STUDENT INFORMATION:
- ID: ${student.student_id}
- Name: ${student.name}
- Grade: ${student.grade}
- Total Sessions: ${sessions.length}

PERFORMANCE DATA:
- Total Questions Answered: ${totalQuestions}
- Correct Answers: ${correctAnswers}
- Overall Accuracy: ${accuracy.toFixed(1)}%

RECENT ATTEMPTS:
${JSON.stringify(attempts.slice(0, 10).map(a => ({
  topic: a.topic,
  difficulty: a.difficulty_level,
  correct: a.is_correct,
  emotion: a.emotion_during_answer,
  stress: a.stress_level
})), null, 2)}

EMOTION PATTERNS:
${JSON.stringify(emotions.slice(0, 10).map(e => ({
  emotion: e.emotion,
  stress: e.stress_level,
  questionNum: e.question_number
})), null, 2)}

RECENT SESSIONS:
${JSON.stringify(sessions.slice(0, 5).map(s => ({
  topic: s.topic,
  completed: s.completion_status,
  avgStress: s.average_stress,
  dominantEmotion: s.dominant_emotion
})), null, 2)}

ANALYSIS REQUIREMENTS:
1. Overall Performance Summary
2. Strengths and Weaknesses
3. Emotional Patterns & Learning Connection
4. Topic-Specific Insights
5. Personalized Recommendations

OUTPUT FORMAT (JSON only):
{
  "overallSummary": "Comprehensive summary of student's learning profile",
  "strengths": ["Specific strength 1", "Specific strength 2", "..."],
  "weaknesses": ["Specific weakness 1", "Specific weakness 2", "..."],
  "emotionalInsights": {
    "patterns": "How emotions affect learning",
    "triggers": ["Stress trigger 1", "Stress trigger 2"],
    "recommendations": ["Emotion management tip 1", "Emotion management tip 2"]
  },
  "topicInsights": [
    {
      "topic": "Topic name",
      "performance": "Performance description",
      "recommendation": "Specific recommendation"
    }
  ],
  "recommendations": {
    "immediate": ["Action item 1", "Action item 2"],
    "shortTerm": ["Goal 1", "Goal 2"],
    "longTerm": ["Objective 1", "Objective 2"]
  },
  "suggestedDifficulty": 1-5,
  "focusAreas": ["Area 1", "Area 2", "Area 3"]
}

Generate comprehensive analysis now:
`;

    const analysis = await generateStructuredContent(prompt);

    // Save analysis to database
    const aiAnalysis = new AIAnalysis({
      student_id: studentId,
      analysis_type: 'performance',
      insights: analysis,
      recommendations: analysis.recommendations,
      suggested_difficulty: analysis.suggestedDifficulty,
      focus_areas: analysis.focusAreas
    });

    await aiAnalysis.save();

    return analysis;
  } catch (error) {
    console.error('Error analyzing student performance:', error);
    throw error;
  }
}

/**
 * Generate session summary with AI insights
 */
export async function generateSessionSummary(sessionId) {
  try {
    // Get session data
    const session = await AssessmentSession.findOne({ session_id: sessionId }).lean();
    if (!session) {
      throw new Error('Session not found');
    }

    const attempts = await QuestionAttempt.find({ session_id: sessionId })
      .sort({ question_number: 1 })
      .lean();

    const emotions = await EmotionTracking.find({ session_id: sessionId })
      .sort({ question_number: 1 })
      .lean();

    const correct = attempts.filter(a => a.is_correct).length;
    const total = attempts.length;
    const accuracy = total > 0 ? (correct / total * 100) : 0;

    const prompt = `
You are an encouraging educational coach providing session feedback.

SESSION INFORMATION:
- Topic: ${session.topic}
- Questions Answered: ${total}
- Correct Answers: ${correct}
- Accuracy: ${accuracy.toFixed(1)}%
- Average Stress: ${session.average_stress || 0}/5
- Dominant Emotion: ${session.dominant_emotion || 'neutral'}

QUESTION-BY-QUESTION PERFORMANCE:
${JSON.stringify(attempts.map(a => ({
  num: a.question_number,
  difficulty: a.difficulty_level,
  correct: a.is_correct,
  emotion: a.emotion_during_answer,
  stress: a.stress_level
})), null, 2)}

EMOTIONAL JOURNEY:
${JSON.stringify(emotions.map(e => ({
  question: e.question_number,
  emotion: e.emotion,
  stress: e.stress_level
})), null, 2)}

PROVIDE:
1. Performance Summary (encouraging tone)
2. Emotional Journey (how emotions evolved)
3. Key Achievements (celebrate wins)
4. Areas for Improvement (constructive)
5. Personalized Encouragement

OUTPUT FORMAT (JSON only):
{
  "performanceSummary": "Overall performance description with encouragement",
  "emotionalJourney": "How emotions evolved during session",
  "keyAchievements": ["Achievement 1", "Achievement 2", "..."],
  "areasForImprovement": ["Area 1 with gentle guidance", "Area 2 with gentle guidance"],
  "personalizedEncouragement": "Motivating closing message tailored to this student"
}

Generate session summary now:
`;

    const summary = await generateStructuredContent(prompt);

    // Save summary
    const aiAnalysis = new AIAnalysis({
      student_id: session.student_id,
      session_id: sessionId,
      analysis_type: 'session_summary',
      insights: summary
    });

    await aiAnalysis.save();

    return summary;
  } catch (error) {
    console.error('Error generating session summary:', error);
    throw error;
  }
}

/**
 * Get topic-specific recommendations
 */
export async function getTopicRecommendations(studentId, topic) {
  try {
    const performance = await QuestionAttempt.getTopicPerformance(studentId, topic);
    
    if (!performance) {
      return {
        message: 'No data available for this topic yet',
        recommendations: ['Start with baseline questions', 'Focus on fundamental concepts']
      };
    }

    const attempts = await QuestionAttempt.find({ 
      student_id: studentId,
      topic: topic 
    }).sort({ createdAt: -1 }).limit(10).lean();

    const prompt = `
Analyze this student's performance on ${topic} and provide specific recommendations.

PERFORMANCE METRICS:
- Accuracy: ${performance.accuracy.toFixed(1)}%
- Total Attempts: ${performance.totalAttempts}
- Average Difficulty: ${performance.avgDifficulty}/5
- Average Stress: ${performance.avgStress}/5

RECENT ATTEMPTS:
${JSON.stringify(attempts.map(a => ({
  question: a.question_text,
  correct: a.is_correct,
  difficulty: a.difficulty_level,
  emotion: a.emotion_during_answer
})), null, 2)}

Provide specific, actionable recommendations for improvement.

OUTPUT FORMAT (JSON only):
{
  "summary": "Brief performance summary",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "nextSteps": ["Next step 1", "Next step 2"],
  "suggestedDifficulty": 1-5
}

Generate recommendations now:
`;

    const recommendations = await generateStructuredContent(prompt);
    return recommendations;
  } catch (error) {
    console.error('Error getting topic recommendations:', error);
    throw error;
  }
}

export default {
  analyzeStudentPerformance,
  generateSessionSummary,
  getTopicRecommendations
};
