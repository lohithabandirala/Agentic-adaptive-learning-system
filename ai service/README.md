# AI Question Generator Service

An intelligent, adaptive question generation service powered by Google Gemini AI. This module generates educational assessment questions with Bloom's taxonomy integration, adaptive difficulty levels, and support for PDF-based content.

## 🎯 Features

- **AI-Powered Generation**: Uses Google Gemini 2.5 Flash model for intelligent question creation
- **Adaptive Assessment**: Questions tailored to student proficiency and learning preferences
- **Bloom's Taxonomy**: Each question tagged with cognitive level (Remember, Understand, Apply, Analyze, Evaluate, Create)
- **Multiple Question Types**: MCQ, True/False, Short Answer, and more
- **PDF Support**: Extract and generate questions from PDF documents
- **Flexible Difficulty**: 5-level difficulty scale with balanced distribution
- **REST API**: Ready-to-use Express.js API server
- **Modular Design**: Import as a module or use via HTTP endpoints

## 📦 Installation

```bash
# Install dependencies
npm install

# Or use the batch file (Windows)
install.bat
```

## 🔑 Setup

1. Create a `.env` file in the root directory:
```env
GOOGLE_CLOUD_API_KEY=your_api_key_here
PORT=3000
```

2. Get your Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Quick Start

### Option 1: Use as a Module

```javascript
import { generateQuestions } from './questionGenerator.js';

const result = await generateQuestions({
  topic: 'Photosynthesis',
  questionCount: 5,
  studentData: {
    studentId: 'S001',
    grade: 10,
    subject: 'Biology',
    accuracy: 78
  }
});

console.log(result.data.questions);
```

### Option 2: Use the REST API

```bash
# Start the API server
node api.js

# Or use the batch file (Windows)
start-api.bat
```

Then make HTTP requests:

```bash
# Generate questions
curl -X POST http://localhost:3000/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Newton's Laws of Motion",
    "questionCount": 3,
    "studentData": {
      "grade": 11,
      "subject": "Physics"
    }
  }'
```

### Option 3: Run Test

```bash
node test.js
```

## 📚 API Documentation

### Module API

#### `generateQuestions(options)`

Generates adaptive questions based on the provided parameters.

**Parameters:**
- `topic` (string): Subject or topic for questions
- `questionCount` (number, default: 5): Number of questions to generate
- `studentData` (object, optional): Student profile and performance data
- `pdfContent` (string, optional): Base64-encoded PDF content
- `pdfMimeType` (string, default: 'application/pdf'): PDF MIME type

**Returns:**
```javascript
{
  success: true,
  data: {
    totalQuestions: 3,
    questions: [
      {
        questionId: "PHO001",
        topic: "Photosynthesis",
        difficulty: 2,
        bloomLevel: "Remember",
        type: "multiple-choice",
        questionText: "Which pigment is primarily responsible for photosynthesis?",
        options: ["Carotenoid", "Chlorophyll", "Anthocyanin", "Xanthophyll"],
        correctAnswer: "Chlorophyll",
        explanation: "Chlorophyll absorbs light energy..."
      }
    ]
  },
  rawResponse: "..."
}
```

#### `generateQuestionsStream(options)`

Streaming version of question generation with real-time callbacks.

**Additional Parameters:**
- `onChunk` (function): Callback function called for each chunk of data

### REST API Endpoints

#### `POST /api/generate-questions`

Generate questions from topic and student data.

**Request Body:**
```json
{
  "topic": "Photosynthesis",
  "questionCount": 3,
  "studentData": {
    "studentId": "S001",
    "grade": 10,
    "subject": "Biology",
    "accuracy": 76
  }
}
```

#### `POST /api/generate-questions-with-pdf`

Generate questions from a PDF file.

**Form Data:**
- `file`: PDF file (multipart/form-data)
- `topic`: Optional topic override
- `questionCount`: Number of questions
- `studentData`: Student data (JSON string)

#### `GET /api/health`

Health check endpoint.

## 📂 Project Structure

```
ai service/
├── questionGenerator.js    # Core question generation module
├── api.js                   # Express REST API server
├── pdfUtils.js             # PDF processing utilities
├── sampleData.js           # Sample student data and topics
├── example.js              # Usage examples
├── integrationExamples.js  # Integration patterns
├── test.js                 # Test script
├── .env                    # Environment variables (create this)
├── .env.example            # Environment template
├── package.json            # Dependencies
├── install.bat             # Windows installer
└── start-api.bat           # API server starter
```

## 🎓 Question Schema

Each generated question follows this structure:

```javascript
{
  questionId: string,        // Unique identifier
  topic: string,             // Subject/topic
  difficulty: number,        // 1-5 scale
  bloomLevel: string,        // Bloom's taxonomy level
  type: string,              // Question type (MCQ, Short Answer, etc.)
  questionText: string,      // The question
  options: string[],         // Answer options (for MCQs)
  correctAnswer: string,     // Correct answer
  explanation: string        // Detailed explanation
}
```

## 🧪 Testing

Run the test script to verify everything works:

```bash
node test.js
```

Expected output:
```
✅ SUCCESS! Questions generated!
📊 Total Questions: 3

Question 1:
  ID: PHO001
  Topic: Photosynthesis
  Difficulty: 2/5
  Type: multiple-choice
  Bloom Level: Remember
  Question: Which of the following are the two primary products of photosynthesis?
  Options:
    A. Carbon Dioxide and Water
    B. Glucose and Oxygen
    C. Oxygen and Water
    D. Carbon Dioxide and Glucose
  Correct Answer: Glucose and Oxygen
```

## 🔧 Configuration

### Environment Variables

- `GOOGLE_CLOUD_API_KEY`: Your Google AI API key (required)
- `PORT`: API server port (default: 3000)

### Generation Settings

Modify `generationConfig` in `questionGenerator.js`:

```javascript
const generationConfig = {
  maxOutputTokens: 65535,
  temperature: 1,
  topP: 1,
  // ... safety settings
};
```

## 📖 Examples

See `example.js` and `integrationExamples.js` for more usage patterns:

- Basic question generation
- PDF-based generation
- Student-adaptive questions
- Streaming responses
- Batch processing
- Error handling
- Caching strategies

## 🛠️ Tech Stack

- **Node.js**: Runtime environment
- **Google Gemini AI**: Question generation engine (@google/genai v1.25.0)
- **Express.js**: REST API server (v4.21.2)
- **Multer**: File upload handling (v1.4.5)
- **dotenv**: Environment configuration (v16.4.5)
- **CORS**: Cross-origin support (v2.8.5)

## 🐛 Troubleshooting

### Common Issues

**Error: API key not found**
- Make sure `.env` file exists with `GOOGLE_CLOUD_API_KEY`

**Error: Cannot read properties of undefined**
- Check that the AI response has the correct JSON structure
- Verify your API key is valid and has quota

**PowerShell execution policy errors**
- Use the provided `.bat` files instead of running npm directly
- Or run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

## 📝 License

MIT License - feel free to use in your hackathon projects!

## 🤝 Contributing

This is a hackathon project for Vibethon. Feel free to fork and customize for your needs.

---

**Built for Vibethon 2025** 🚀
