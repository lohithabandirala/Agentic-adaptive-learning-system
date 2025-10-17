import axios from 'axios';

// Get API key dynamically to ensure dotenv has loaded
function getApiKey() {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  return key;
}

async function callGemini(prompt: string) {
  const GEMINI_API_KEY = getApiKey();
  
  // Google Gemini API endpoint - using the correct model identifier
  // Try gemini-1.5-pro-latest which is more stable than flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  const resp = await axios.post(url, {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
  
  return resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export default {
  async generateQuestions(prompt: string) {
    console.log('🤖 Generating questions with AI...');
    console.log('📝 Prompt:', prompt.substring(0, 150) + '...');
    
    // Check API key at runtime
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ No GEMINI_API_KEY found in environment');
      console.error('📁 Make sure .env file exists at:', process.cwd() + '/.env');
      console.error('📋 Current env keys:', Object.keys(process.env).filter(k => k.includes('API')));
      throw new Error('AI service not configured. Please set GEMINI_API_KEY in .env file');
    }
    
    console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

    try {
      const responseText = await callGemini(prompt);
      console.log('✅ AI Response received (length:', responseText.length, ')');
      console.log('📄 Response preview:', responseText.substring(0, 200));

      // Try to parse JSON from the response
      try {
        // Remove markdown code blocks if present
        let cleaned = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        // Sometimes the response has extra text before/after JSON
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          cleaned = jsonMatch[0];
        }

        const parsed = JSON.parse(cleaned);
        
        let questions = [];
        if (Array.isArray(parsed)) {
          questions = parsed;
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          questions = parsed.questions;
        }

        // Validate questions have required fields
        questions = questions.map((q: any, index: number) => ({
          id: q.id || `ai_q${index + 1}`,
          text: q.text || q.question || 'Question text missing',
          difficulty: q.difficulty || 'medium',
          options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: q.correctAnswer || q.correct || 'A'
        }));

        if (questions.length > 0) {
          console.log(`✅ Successfully parsed ${questions.length} questions from AI`);
          return { questions };
        }
      } catch (parseError) {
        console.log('⚠️ Could not parse as JSON, attempting text extraction');
      }

      // Fallback: Extract questions from formatted text
      const lines = responseText.split('\n');
      const questions = [];
      let currentQuestion: any = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Detect question (starts with number or "Q:")
        if (trimmed.match(/^(\d+[\.\):]|Q\d+:|Question \d+:)/i)) {
          if (currentQuestion) {
            questions.push(currentQuestion);
          }
          currentQuestion = {
            id: `ai_q${questions.length + 1}`,
            text: trimmed.replace(/^(\d+[\.\):]|Q\d+:|Question \d+:)\s*/i, ''),
            difficulty: 'medium',
            options: [],
            correctAnswer: 'A'
          };
        }
        // Detect options (A), B), etc)
        else if (trimmed.match(/^[A-D][\.\)]/i) && currentQuestion) {
          currentQuestion.options.push(trimmed);
        }
      }
      
      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      if (questions.length > 0) {
        console.log(`✅ Extracted ${questions.length} questions from text format`);
        return { questions };
      }

      throw new Error('Could not extract questions from AI response');

    } catch (err: any) {
      console.error('❌ AI generation failed:', err?.response?.data || err?.message || err);
      throw new Error(`AI generation failed: ${err?.response?.data?.error?.message || err?.message || 'Unknown error'}`);
    }
  },
};
