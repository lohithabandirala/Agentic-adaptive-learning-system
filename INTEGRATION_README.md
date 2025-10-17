# Integrated Emotion-Based Adaptive Assessment System

This project integrates facial emotion recognition with an AI-powered adaptive question generation system to create personalized assessments based on the student's emotional state.

## 🌟 Features

- **Real-time Emotion Detection**: Uses OpenCV and DeepFace to analyze facial expressions
- **Stress Level Assessment**: Calculates stress levels (1-5 scale) based on detected emotions
- **Adaptive Question Generation**: AI generates questions tailored to student's emotional state
- **Complete Integration**: Single workflow from emotion detection to personalized questions
- **Comprehensive Logging**: Saves emotion data and generated questions for analysis

## 🏗️ System Architecture

```
┌─────────────────────────┐
│   Webcam (Student)      │
└───────────┬─────────────┘
            │
            v
┌─────────────────────────┐
│  Emotion Detection      │
│  (OpenCV + DeepFace)    │
└───────────┬─────────────┘
            │
            v
┌─────────────────────────┐
│  Emotion Analysis       │
│  - Dominant emotions    │
│  - Stress calculation   │
└───────────┬─────────────┘
            │
            v
┌─────────────────────────┐
│  AI Service (Node.js)   │
│  - Google Gemini API    │
│  - Question Generation  │
└───────────┬─────────────┘
            │
            v
┌─────────────────────────┐
│  Adaptive Questions     │
│  (Personalized Output)  │
└─────────────────────────┘
```

## 📋 Prerequisites

### For Python (Emotion Detection):
- Python 3.8 or higher
- Webcam/Camera
- Windows/Linux/macOS

### For Node.js (AI Service):
- Node.js 16 or higher
- npm or yarn
- Google Cloud API Key (Gemini)

## 🚀 Installation

### Step 1: Install Python Dependencies

```bash
pip install -r integrated_requirements.txt
```

### Step 2: Install Node.js Dependencies

Navigate to the AI service folder:

```bash
cd "ai service"
npm install
```

### Step 3: Configure API Key

1. In the `ai service` folder, create a `.env` file
2. Add your Google Cloud API key:

```env
GOOGLE_CLOUD_API_KEY=your_api_key_here
PORT=3000
```

## 🎯 Usage

### Method 1: Complete Integration (Recommended)

1. **Start the AI Service** (in terminal 1):
```bash
cd "ai service"
npm start
```

2. **Run the Integrated System** (in terminal 2):
```bash
python integrated_emotion_assessment.py
```

3. **Follow the prompts**:
   - Enter the topic for questions (e.g., "Photosynthesis", "Python Programming")
   - Enter student details (optional)
   - Look at the camera for 20 seconds
   - Review your emotion analysis
   - Get personalized adaptive questions!

### Method 2: Separate Components

#### A. Emotion Detection Only
```bash
cd "Facial-Emotion-Recognition-using-OpenCV-and-Deepface"
python emotion.py
```

#### B. AI Service Only
```bash
cd "ai service"
npm start
```

Then use the API endpoints:

**Generate Questions with Emotion Data:**
```bash
curl -X POST http://localhost:3000/api/generate-questions-with-emotion \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Photosynthesis",
    "emotionData": {
      "overall_dominant_emotion": "happy",
      "stress_level": 2
    },
    "questionCount": 5
  }'
```

## 📊 Output Files

The integrated system generates three types of output files:

1. **emotion_summary_YYYYMMDD_HHMMSS.json** - Detailed emotion analysis
2. **integrated_output_YYYYMMDD_HHMMSS.json** - Complete workflow output (emotions + questions)

### Sample Emotion Summary:
```json
{
  "overall_dominant_emotion": "happy",
  "stress_level": 2,
  "dominant_emotion_percentages": {
    "happy": 65.5,
    "neutral": 20.3,
    "surprise": 14.2
  },
  "average_emotion_scores": {
    "happy": 72.4,
    "neutral": 15.8,
    "surprise": 8.2
  }
}
```

### Sample Generated Questions:
```json
{
  "questions": [
    {
      "questionId": "q1",
      "topic": "Photosynthesis",
      "difficulty": 2,
      "bloomLevel": "Understand",
      "type": "MCQ",
      "questionText": "What is the primary purpose of photosynthesis?",
      "options": [
        "To produce oxygen",
        "To produce glucose",
        "To absorb water",
        "To release carbon dioxide"
      ],
      "correctAnswer": "To produce glucose",
      "explanation": "..."
    }
  ]
}
```

## 🎨 How It Works

### Emotion Detection Process:

1. **Face Detection**: Uses Haar Cascade to detect faces in video frames
2. **Emotion Analysis**: DeepFace analyzes 7 emotions (angry, disgust, fear, happy, sad, surprise, neutral)
3. **Stress Calculation**: Calculates stress level based on emotion distribution:
   - High stress emotions: angry, fear, sad, disgust
   - Low stress emotions: happy, neutral
   - Scale: 1 (very low stress) to 5 (very high stress)

### Adaptive Question Generation:

1. **Emotion Integration**: Emotion data is sent to AI service
2. **AI Analysis**: Google Gemini analyzes student's emotional state
3. **Question Adaptation**:
   - **High stress** → Easier questions, encouraging explanations
   - **Low stress** → Moderate to challenging questions
   - **Positive emotions** → Engaging, creative questions
   - **Negative emotions** → Supportive, confidence-building questions

## 🔧 Configuration

### Emotion Detection Settings (in integrated_emotion_assessment.py):

```python
DURATION = 20  # Emotion detection duration in seconds
QUESTION_COUNT = 5  # Number of questions to generate
AI_SERVICE_URL = "http://localhost:3000/api/generate-questions-with-emotion"
```

### AI Service Settings (in ai service/.env):

```env
GOOGLE_CLOUD_API_KEY=your_api_key_here
PORT=3000
```

## 🧪 Testing

### Test the AI Service:
```bash
cd "ai service"
npm test
```

### Test Emotion Detection:
```bash
python integrated_emotion_assessment.py
# Follow prompts to test the complete workflow
```

## 📝 API Endpoints

### POST /api/generate-questions-with-emotion
Generate adaptive questions based on emotion data

**Request Body:**
```json
{
  "topic": "String (required)",
  "studentData": "Object (optional)",
  "emotionData": "Object (optional)",
  "questionCount": "Number (default: 5)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuestions": 5,
    "questions": [...]
  }
}
```

### GET /api/health
Check if the AI service is running

## 🐛 Troubleshooting

### Issue: Camera not detected
**Solution**: 
- Ensure your webcam is connected
- Check if another application is using the camera
- Try changing camera index in code: `cv2.VideoCapture(1)` instead of `0`

### Issue: AI Service connection error
**Solution**:
- Verify AI service is running: `npm start` in `ai service` folder
- Check if port 3000 is available
- Verify `.env` file has valid API key

### Issue: DeepFace model download errors
**Solution**:
- Ensure stable internet connection
- DeepFace will download models on first run
- Check Python environment has write permissions

### Issue: Low accuracy in emotion detection
**Solution**:
- Ensure good lighting conditions
- Face the camera directly
- Remove glasses or masks if possible
- Increase detection duration for better accuracy

## 🤝 Contributing

This is a hackathon project combining:
- Facial Emotion Recognition using OpenCV and DeepFace
- AI-powered question generation using Google Gemini

## 📄 License

This project combines components with different licenses:
- Emotion Recognition: See `Facial-Emotion-Recognition-using-OpenCV-and-Deepface/LICENSE`
- AI Service: MIT License (custom implementation)

## 🎓 Use Cases

1. **Adaptive Learning Platforms**: Adjust difficulty based on student stress
2. **Online Assessments**: Detect test anxiety and adapt accordingly
3. **Mental Health Monitoring**: Track emotional patterns during learning
4. **Personalized Education**: Create truly adaptive learning experiences
5. **Research**: Study correlation between emotions and learning outcomes

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review individual component READMEs
- Check console output for detailed error messages

## 🌈 Future Enhancements

- [ ] Multi-student support in single session
- [ ] Real-time question difficulty adjustment
- [ ] Integration with LMS platforms
- [ ] Historical emotion tracking and analysis
- [ ] Voice tone analysis integration
- [ ] Mobile app support
- [ ] Dashboard for educators

---

**Made for Vibethon Hackathon** 🚀
