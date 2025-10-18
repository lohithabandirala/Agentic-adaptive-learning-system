"""
Python Emotion Detection Service
Flask API for real-time emotion detection from webcam images
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from deepface import DeepFace
import base64
import io
from PIL import Image
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Emotion Service is running',
        'service': 'python-emotion-service'
    }), 200

@app.route('/detect-emotion', methods=['POST'])
def detect_emotion():
    """
    Detect emotion from base64 encoded image
    Expected JSON: { "image": "base64_string" }
    Returns: { "emotions": {...}, "dominant_emotion": "...", "stress_level": 0.0-1.0 }
    """
    try:
        # Get image data from request
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = data['image']
        
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(image_data)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to numpy array (BGR format for OpenCV)
        image_np = np.array(image)
        
        # Convert RGB to BGR if needed
        if len(image_np.shape) == 3 and image_np.shape[2] == 3:
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        
        # Save temporary image for DeepFace
        temp_path = 'temp_emotion_image.jpg'
        cv2.imwrite(temp_path, image_np)
        
        # Analyze emotion using DeepFace
        result = DeepFace.analyze(
            img_path=temp_path,
            actions=['emotion'],
            enforce_detection=False,
            silent=True
        )
        
        # Extract emotion data
        if isinstance(result, list):
            result = result[0]
        
        emotions = result.get('emotion', {})
        dominant_emotion = result.get('dominant_emotion', 'neutral')
        
        # Calculate stress level (0-1 scale)
        # High stress emotions: angry, fear, sad
        # Low stress emotions: happy, surprise, neutral
        stress_emotions = ['angry', 'fear', 'sad']
        calm_emotions = ['happy', 'surprise', 'neutral']
        
        stress_score = sum(emotions.get(e, 0) for e in stress_emotions)
        calm_score = sum(emotions.get(e, 0) for e in calm_emotions)
        
        # Normalize stress level (0-1)
        total = stress_score + calm_score
        stress_level = stress_score / total if total > 0 else 0.0
        
        logger.info(f"Emotion detected: {dominant_emotion}, Stress: {stress_level:.2f}")
        
        return jsonify({
            'emotions': emotions,
            'dominantEmotion': dominant_emotion,
            'stressLevel': stress_level,
            'success': True
        }), 200
        
    except Exception as e:
        logger.error(f"Error detecting emotion: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False,
            'emotions': {},
            'dominantEmotion': 'neutral',
            'stressLevel': 0.0
        }), 500

@app.route('/detect-emotion-simple', methods=['POST'])
def detect_emotion_simple():
    """
    Simplified emotion detection (fallback if DeepFace fails)
    Returns mock data for testing
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Return mock emotion data
        return jsonify({
            'emotions': {
                'angry': 5.0,
                'disgust': 2.0,
                'fear': 8.0,
                'happy': 25.0,
                'sad': 10.0,
                'surprise': 15.0,
                'neutral': 35.0
            },
            'dominantEmotion': 'neutral',
            'stressLevel': 0.3,
            'success': True,
            'mock': True
        }), 200
        
    except Exception as e:
        logger.error(f"Error in simple detection: {str(e)}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Python Emotion Detection Service...")
    logger.info("📍 Service will run on http://127.0.0.1:5001")
    logger.info("🔍 Endpoints:")
    logger.info("   - GET  /health              - Health check")
    logger.info("   - POST /detect-emotion      - Emotion detection (DeepFace)")
    logger.info("   - POST /detect-emotion-simple - Simple detection (fallback)")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
