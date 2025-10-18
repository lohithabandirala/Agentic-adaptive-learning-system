import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

/**
 * Get AI model instance
 */
export function getAIModel(modelName = 'gemini-2.5-flash') {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generate content with AI
 */
export async function generateAIContent(prompt, modelName = 'gemini-2.5-flash') {
  try {
    const model = getAIModel(modelName);
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return response;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
}

/**
 * Parse JSON response from AI
 */
export function parseAIJSON(response) {
  try {
    // Try to find JSON in response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    // If no match, try parsing directly
    return JSON.parse(response);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Response was:', response);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Generate structured content with retry
 */
export async function generateStructuredContent(prompt, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await generateAIContent(prompt);
      return parseAIJSON(response);
    } catch (error) {
      if (i === maxRetries) {
        throw error;
      }
      console.warn(`Retry ${i + 1}/${maxRetries} for AI generation...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export default {
  getAIModel,
  generateAIContent,
  parseAIJSON,
  generateStructuredContent
};
