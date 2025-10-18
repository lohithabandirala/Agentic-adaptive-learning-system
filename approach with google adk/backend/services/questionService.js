import { generateStructuredContent } from './aiService.js';
import Student from '../models/Student.js';
import QuestionAttempt from '../models/QuestionAttempt.js';
import EmotionTracking from '../models/EmotionTracking.js';

/**
 * Generate adaptive question based on student history and current emotion
 */
export async function generateAdaptiveQuestion(studentId, topic, emotionData, questionNumber) {
  try {
    // Get student history
    const student = await Student.findOne({ student_id: studentId });
    const recentAttempts = await QuestionAttempt.find({ 
      student_id: studentId,
      topic: topic 
    }).sort({ createdAt: -1 }).limit(5).lean();

    const topicPerformance = await QuestionAttempt.getTopicPerformance(studentId, topic);

    // Build context for AI
    const context = {
      student: student ? {
        grade: student.grade,
        name: student.name
      } : null,
      recentAttempts: recentAttempts.map(a => ({
        question: a.question_text,
        correct: a.is_correct,
        difficulty: a.difficulty_level,
        emotion: a.emotion_during_answer
      })),
      topicPerformance,
      currentEmotion: emotionData
    };

    const prompt = `
You are an expert adaptive learning AI creating personalized educational questions.

STUDENT CONTEXT:
${JSON.stringify(context, null, 2)}

CURRENT STATE:
- Question Number: ${questionNumber}
- Topic: ${topic}
- Current Emotion: ${emotionData?.emotion || 'unknown'}
- Stress Level: ${emotionData?.stressLevel || 0}/5

INSTRUCTIONS:
1. Consider the student's emotional state:
   - If stress is HIGH (4-5): Make question easier, supportive, confidence-building
   - If stress is MEDIUM (3): Keep balanced difficulty
   - If stress is LOW (1-2): Challenge appropriately

2. Learn from recent attempts:
   - Identify patterns in mistakes
   - Focus on weak areas
   - Build on strengths

3. Generate ONE high-quality question that:
   - Matches the topic
   - Adapts to current emotional state
   - Considers past performance
   - Uses appropriate Bloom's taxonomy level
   - Is grade-appropriate

OUTPUT FORMAT (JSON only):
{
  "question": "Clear, specific question text",
  "type": "multiple-choice" | "true-false" | "short-answer",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correctAnswer": "Exact correct answer",
  "explanation": "Why this is the correct answer",
  "difficulty": 1-5,
  "bloomLevel": "Remember|Understand|Apply|Analyze|Evaluate|Create",
  "reasoning": "Why this question was chosen based on student context and emotion"
}

Generate the question now:
`;

    const question = await generateStructuredContent(prompt);
    
    // Add topic to response
    question.topic = topic;
    
    return question;
  } catch (error) {
    console.error('Error generating adaptive question:', error);
    throw error;
  }
}

/**
 * Generate AI feedback for student answer
 */
export async function generateAnswerFeedback(questionText, studentAnswer, correctAnswer, emotionData, isCorrect) {
  try {
    const prompt = `
You are an encouraging, expert tutor providing personalized feedback.

QUESTION: ${questionText}
STUDENT'S ANSWER: ${studentAnswer}
CORRECT ANSWER: ${correctAnswer}
RESULT: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

STUDENT'S EMOTIONAL STATE:
- Emotion: ${emotionData?.emotion || 'neutral'}
- Stress Level: ${emotionData?.stressLevel || 0}/5

INSTRUCTIONS:
1. Provide immediate, specific feedback
2. Be encouraging and supportive (especially if stressed or incorrect)
3. Explain clearly why the answer is right/wrong
4. If incorrect: Identify the misconception
5. Suggest concrete next learning step

OUTPUT FORMAT (JSON only):
{
  "feedback": "Immediate, specific feedback",
  "encouragement": "Positive, motivating message",
  "explanation": "Clear explanation of the concept",
  "misconception": "Why the student might have gotten it wrong (if incorrect)",
  "nextStep": "Concrete action for improvement"
}

Generate the feedback now:
`;

    const feedback = await generateStructuredContent(prompt);
    return feedback;
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw error;
  }
}

/**
 * Generate simple baseline question (for first-time students)
 */
export async function generateBaselineQuestion(topic, grade, questionNumber) {
  try {
    const prompt = `
Create a baseline assessment question for a grade ${grade} student.

Topic: ${topic}
Question Number: ${questionNumber}
Purpose: Initial assessment to understand student's baseline knowledge

Generate a moderate difficulty question (level 2-3) that tests fundamental understanding.

OUTPUT FORMAT (JSON only):
{
  "question": "Clear question text",
  "type": "multiple-choice",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correctAnswer": "Exact correct answer",
  "explanation": "Brief explanation",
  "difficulty": 2,
  "bloomLevel": "Understand",
  "reasoning": "This is a baseline question to assess fundamental knowledge"
}

Generate the question now:
`;

    const question = await generateStructuredContent(prompt);
    question.topic = topic;
    return question;
  } catch (error) {
    console.error('Error generating baseline question:', error);
    throw error;
  }
}

export default {
  generateAdaptiveQuestion,
  generateAnswerFeedback,
  generateBaselineQuestion
};
