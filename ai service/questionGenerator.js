import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Google AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});
const model = 'gemini-2.5-flash';

// System instruction for the AI
const systemInstruction = {
  text: `You are an intelligent, autonomous question-generation engine inside an adaptive assessment platform.

Inputs (any combination):

1. PDF / Text Content – Reference material provided by the instructor or system.

2. Topic / Concept – Example: "Photosynthesis", "Newton's Laws of Motion".

3. Student Data (JSON) – Includes studentId, grade, subject mastery, learning preferences, goals, and previous performance.

Responsibilities:

Analyze all available inputs: PDF/text (if provided), topic/concept, and student data.

Research and synthesize accurate, curriculum-aligned knowledge using internal and reliable web references.

Generate adaptive questions tailored to the student's proficiency, stress level, and preferences.

Include Bloom's taxonomy level (Remember, Understand, Apply, Analyze, Evaluate, Create) for each question.

Ensure question diversity and balanced difficulty (1–5). Avoid repeating similar questions.

Output Format:

Return a JSON object with the following structure:
{
  "totalQuestions": <number>,
  "questions": [
    {
      "questionId": <string>,
      "topic": <string>,
      "difficulty": <number 1-5>,
      "bloomLevel": <string>,
      "type": <string>,
      "questionText": <string>,
      "options": [<array of strings, for MCQs>],
      "correctAnswer": <string>,
      "explanation": <string>
    }
  ]
}

Rules:

Output ONLY valid JSON following the exact schema above.

Do not include narrative text, reasoning, or commentary outside the JSON.

If PDF is missing, generate questions from topic + internal knowledge.

If student data is missing, balance question difficulty across easy, medium, and hard levels.

Ensure factual accuracy, age-appropriateness, and curriculum alignment.

Always return an array of questions in the "questions" field, even if generating only one question.`
};

// Helper function to extract valid JSON from response text
function extractJSON(responseText) {
  const firstBrace = responseText.indexOf('{');
  if (firstBrace === -1) {
    return null;
  }

  // Find the matching closing brace
  let braceCount = 0;
  let lastBrace = -1;
  
  for (let i = firstBrace; i < responseText.length; i++) {
    if (responseText[i] === '{') braceCount++;
    if (responseText[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        lastBrace = i;
        break;
      }
    }
  }
  
  if (lastBrace === -1) {
    return null;
  }
  
  const jsonStr = responseText.substring(firstBrace, lastBrace + 1);
  
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('JSON parse error:', error.message);
    return null;
  }
}

// Set up generation config
const generationConfig = {
  maxOutputTokens: 65535,
  temperature: 1,
  topP: 1,
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'OFF',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'OFF',
    }
  ],
  systemInstruction: {
    parts: [systemInstruction]
  },
};

/**
 * Generate adaptive questions based on inputs
 * @param {Object} params - Generation parameters
 * @param {string} params.topic - The topic/subject for questions
 * @param {Object} params.studentData - Student profile and performance data
 * @param {string} params.pdfContent - Optional PDF content (base64 encoded)
 * @param {string} params.pdfMimeType - Optional PDF mime type (default: 'application/pdf')
 * @param {number} params.questionCount - Number of questions to generate (default: 5)
 * @returns {Promise<Object>} Generated questions in JSON format
 */
export async function generateQuestions({
  topic,
  studentData = null,
  pdfContent = null,
  pdfMimeType = 'application/pdf',
  questionCount = 5
}) {
  try {
    // Validate required inputs
    if (!topic && !pdfContent) {
      throw new Error('Either topic or pdfContent must be provided');
    }

    // Create chat session
    const chat = ai.chats.create({
      model,
      config: generationConfig
    });

    // Build the message parts
    const messageParts = [];

    // Add PDF if provided
    if (pdfContent) {
      messageParts.push({
        inlineData: {
          mimeType: pdfMimeType,
          data: pdfContent
        }
      });
    }

    // Build the prompt
    let prompt = `Generate ${questionCount} adaptive assessment questions.\n\n`;

    if (topic) {
      prompt += `Topic: ${topic}\n\n`;
    }

    if (studentData) {
      prompt += `Student Data:\n${JSON.stringify(studentData, null, 2)}\n\n`;
    }

    prompt += `Please generate exactly ${questionCount} questions in valid JSON format following the schema defined in the system instructions.`;

    messageParts.push({ text: prompt });

    // Send message and get response (using stream internally)
    const response = await chat.sendMessageStream({
      message: messageParts
    });

    // Extract and parse the response
    let responseText = '';
    for await (const chunk of response) {
      if (chunk.text) {
        responseText += chunk.text;
      }
    }

    // Try to parse JSON from response using helper function
    const questions = extractJSON(responseText);
    
    if (questions) {
      return {
        success: true,
        data: questions,
        rawResponse: responseText
      };
    }
    
    return {
      success: false,
      error: 'Could not find valid JSON in response',
      rawResponse: responseText
    };

  } catch (error) {
    console.error('Error generating questions:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

/**
 * Generate questions with streaming response
 * @param {Object} params - Same as generateQuestions
 * @param {Function} onChunk - Callback for each chunk of response
 * @returns {Promise<Object>} Final result
 */
export async function generateQuestionsStream({
  topic,
  studentData = null,
  pdfContent = null,
  pdfMimeType = 'application/pdf',
  questionCount = 5,
  onChunk = null
}) {
  try {
    // Validate required inputs
    if (!topic && !pdfContent) {
      throw new Error('Either topic or pdfContent must be provided');
    }

    // Create chat session
    const chat = ai.chats.create({
      model,
      config: generationConfig
    });

    // Build the message parts
    const messageParts = [];

    // Add PDF if provided
    if (pdfContent) {
      messageParts.push({
        inlineData: {
          mimeType: pdfMimeType,
          data: pdfContent
        }
      });
    }

    // Build the prompt
    let prompt = `Generate ${questionCount} adaptive assessment questions.\n\n`;

    if (topic) {
      prompt += `Topic: ${topic}\n\n`;
    }

    if (studentData) {
      prompt += `Student Data:\n${JSON.stringify(studentData, null, 2)}\n\n`;
    }

    prompt += `Please generate exactly ${questionCount} questions in valid JSON format following the schema defined in the system instructions.`;

    messageParts.push({ text: prompt });

    // Send message with streaming
    const response = await chat.sendMessageStream({
      message: messageParts
    });

    let fullResponse = '';
    for await (const chunk of response) {
      if (chunk.text) {
        fullResponse += chunk.text;
        if (onChunk) {
          onChunk(chunk.text);
        }
      }
    }

    // Try to parse JSON from response using helper function
    const questions = extractJSON(fullResponse);
    
    if (questions) {
      return {
        success: true,
        data: questions,
        rawResponse: fullResponse
      };
    }
    
    return {
      success: false,
      error: 'Could not find valid JSON in response',
      rawResponse: fullResponse
    };

  } catch (error) {
    console.error('Error generating questions:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

export default {
  generateQuestions,
  generateQuestionsStream
};
