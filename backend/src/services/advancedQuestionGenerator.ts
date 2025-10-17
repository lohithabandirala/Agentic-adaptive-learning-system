import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Get API key dynamically
function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return key;
}

// Initialize AI instance
const genAI = new GoogleGenerativeAI(getApiKey());

// System instruction for the AI
const systemInstruction = {
  role: 'system',
  parts: [{
    text: `You are an intelligent, autonomous question-generation engine designed to create adaptive, curriculum-aligned educational assessments. Your purpose is to generate questions that are:

1. **Pedagogically Sound**: Questions should assess understanding at appropriate cognitive levels using Bloom's Taxonomy (Remember, Understand, Apply, Analyze, Evaluate, Create).

2. **Adaptive**: Questions should be tailored to individual student profiles, including:
   - Current knowledge level
   - Learning pace
   - Previous performance
   - Emotional state (stress, confidence)
   - Preferred question types

3. **Contextually Relevant**: Questions should be generated from:
   - Specific topics or learning objectives
   - PDF content (textbooks, articles, study materials)
   - Previous student interactions

4. **Diverse and Engaging**: Use various question types:
   - Multiple Choice Questions (MCQ)
   - True/False
   - Short Answer
   - Problem-Solving
   - Application-based scenarios

**Input Types You'll Receive:**
- **topic**: A subject or learning objective (e.g., "Photosynthesis", "Newton's Laws")
- **pdfContent**: Base64-encoded PDF content to generate questions from
- **studentData**: Student profile including performance history, emotional state, difficulty preferences

**Output Format (JSON only):**
Return a JSON array of question objects, each containing:
{
  "questionId": "unique_id",
  "topic": "topic_name",
  "difficulty": 1-5 (1=easiest, 5=hardest),
  "bloomLevel": "Remember|Understand|Apply|Analyze|Evaluate|Create",
  "type": "MCQ|TrueFalse|ShortAnswer|ProblemSolving",
  "questionText": "The actual question",
  "options": ["A", "B", "C", "D"], // for MCQ only
  "correctAnswer": "A" or "answer text",
  "explanation": "Why this answer is correct"
}

**Rules:**
- Always return valid JSON array
- Match difficulty to student's current level (±1 for adaptive challenge)
- Ensure questions are curriculum-aligned and factually accurate
- Include clear, concise explanations
- For PDF-based questions, cite content directly
- Never generate inappropriate or biased content`
  }]
};

// Generation configuration
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65535,
  responseMimeType: 'text/plain',
};

// Safety settings (all thresholds off for educational content)
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

// Question interface
export interface GeneratedQuestion {
  questionId: string;
  topic: string;
  difficulty: number; // 1-5
  bloomLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
  type: 'MCQ' | 'TrueFalse' | 'ShortAnswer' | 'ProblemSolving';
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudentData {
  studentId?: string;
  knowledgeLevel?: number; // 1-5
  learningPace?: string;
  previousPerformance?: {
    averageScore?: number;
    recentScores?: number[];
    weakTopics?: string[];
  };
  emotionalState?: {
    overallEmotion?: string;
    stressLevel?: string;
    confidence?: number;
  };
  preferredTypes?: string[];
}

export interface QuestionGenerationParams {
  topic?: string;
  studentData?: StudentData;
  pdfContent?: string;
  pdfMimeType?: string;
  questionCount?: number;
}

export interface QuestionGenerationResult {
  success: boolean;
  data?: GeneratedQuestion[];
  rawResponse?: string;
  error?: string;
}

/**
 * Extracts JSON array from AI response text using brace matching
 */
function extractJSON(responseText: string): any[] {
  try {
    // Remove markdown code blocks
    let cleaned = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Find JSON array using brace matching
    let depth = 0;
    let start = -1;
    let end = -1;

    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '[') {
        if (depth === 0) start = i;
        depth++;
      } else if (cleaned[i] === ']') {
        depth--;
        if (depth === 0 && start !== -1) {
          end = i;
          break;
        }
      }
    }

    if (start !== -1 && end !== -1) {
      const jsonStr = cleaned.substring(start, end + 1);
      return JSON.parse(jsonStr);
    }

    // Fallback: try direct parse
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON extraction failed:', error);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Main function to generate questions
 */
export async function generateQuestions(params: QuestionGenerationParams): Promise<QuestionGenerationResult> {
  const {
    topic,
    studentData,
    pdfContent,
    pdfMimeType = 'application/pdf',
    questionCount = 5
  } = params;

  try {
    console.log('🤖 Generating questions with Advanced AI...');
    
    // Create model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
      systemInstruction: systemInstruction,
      generationConfig,
      safetySettings,
    });

    // Build prompt parts
    let promptText = `Generate ${questionCount} educational questions`;
    
    if (topic) {
      promptText += ` on the topic: "${topic}"`;
    }

    if (studentData) {
      promptText += `\n\nStudent Profile:\n`;
      if (studentData.knowledgeLevel) {
        promptText += `- Knowledge Level: ${studentData.knowledgeLevel}/5\n`;
      }
      if (studentData.previousPerformance?.averageScore) {
        promptText += `- Average Score: ${studentData.previousPerformance.averageScore}%\n`;
      }
      if (studentData.emotionalState?.stressLevel) {
        promptText += `- Current Stress Level: ${studentData.emotionalState.stressLevel}\n`;
      }
      if (studentData.preferredTypes && studentData.preferredTypes.length > 0) {
        promptText += `- Preferred Question Types: ${studentData.preferredTypes.join(', ')}\n`;
      }
    }

    promptText += `\n\nGenerate questions as a JSON array following the exact format specified in your system instructions.`;

    // Prepare message parts
    const messageParts: any[] = [];

    // Add PDF content if provided
    if (pdfContent) {
      messageParts.push({
        inlineData: {
          data: pdfContent,
          mimeType: pdfMimeType,
        },
      });
      promptText = `Based on the provided PDF content, ${promptText}`;
    }

    messageParts.push({ text: promptText });

    console.log('📝 Prompt:', promptText.substring(0, 200) + '...');

    // Generate content
    const result = await model.generateContent(messageParts);
    const response = await result.response;
    const rawResponse = response.text();

    console.log('✅ AI Response received (length:', rawResponse.length, ')');
    console.log('📄 Response preview:', rawResponse.substring(0, 300));

    // Extract and parse JSON
    const questionsArray = extractJSON(rawResponse);

    if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
      throw new Error('No valid questions generated');
    }

    // Validate and normalize questions
    const questions: GeneratedQuestion[] = questionsArray.map((q, index) => ({
      questionId: q.questionId || `q_${Date.now()}_${index}`,
      topic: q.topic || topic || 'General',
      difficulty: Math.min(5, Math.max(1, q.difficulty || 3)),
      bloomLevel: q.bloomLevel || 'Understand',
      type: q.type || 'MCQ',
      questionText: q.questionText || q.question || 'Question text missing',
      options: q.options || (q.type === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined),
      correctAnswer: q.correctAnswer || q.correct || 'A',
      explanation: q.explanation || 'No explanation provided',
    }));

    console.log(`✅ Successfully generated ${questions.length} questions`);

    return {
      success: true,
      data: questions,
      rawResponse,
    };

  } catch (error: any) {
    console.error('❌ Error generating questions:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Legacy compatibility function - converts to old format
 */
export async function generateQuestionsLegacy(prompt: string) {
  console.log('🔄 Using legacy compatibility mode...');
  
  // Extract topic from prompt if possible
  const topicMatch = prompt.match(/topic[:\s]+["']?([^"'\n]+)["']?/i);
  const topic = topicMatch ? topicMatch[1].trim() : undefined;

  const result = await generateQuestions({
    topic,
    questionCount: 5,
  });

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to generate questions');
  }

  // Convert to legacy format
  const questions = result.data.map(q => ({
    id: q.questionId,
    text: q.questionText,
    difficulty: q.difficulty <= 2 ? 'easy' : q.difficulty >= 4 ? 'hard' : 'medium',
    options: q.options || [],
    correctAnswer: q.correctAnswer,
  }));

  return { questions };
}

export default {
  generateQuestions,
  generateQuestionsLegacy,
};
