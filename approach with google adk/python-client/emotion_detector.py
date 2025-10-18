"""
Emotion Detector Module
Handles camera and emotion detection using DeepFace
"""

import cv2
import time
from deepface import DeepFace
from collections import defaultdict
import threading
from config import EMOTION_DETECTION_TIMEOUT, CAMERA_INDEX, STRESS_EMOTIONS


class EmotionDetector:
    def __init__(self):
        self.cap = None
        self.is_running = False
        self.emotion_data = {}
        self.stop_event = threading.Event()
        
    def initialize_camera(self):
        """Initialize camera"""
        try:
            self.cap = cv2.VideoCapture(CAMERA_INDEX)
            if not self.cap.isOpened():
                raise Exception("Cannot access camera")
            return True
        except Exception as e:
            print(f"❌ Camera initialization failed: {e}")
            return False
    
    def release_camera(self):
        """Release camera resources"""
        if self.cap:
            self.cap.release()
            self.cap = None
    
    def detect_emotions_silent(self, question_number, max_duration=EMOTION_DETECTION_TIMEOUT):
        """
        Silently detect emotions in background
        Returns emotion data dictionary
        """
        if not self.cap or not self.cap.isOpened():
            print("❌ Camera not initialized")
            return None
        
        start_time = time.time()
        emotions_detected = []
        emotion_scores_sum = defaultdict(float)
        frame_count = 0
        
        print(f"\n📹 Monitoring emotions for question {question_number}...")
        print("   (Silent mode - no camera window)")
        
        while not self.stop_event.is_set():
            ret, frame = self.cap.read()
            if not ret:
                break
            
            try:
                # Analyze emotion
                result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                if isinstance(result, list):
                    result = result[0]
                
                # Record emotion
                dominant_emotion = result['dominant_emotion']
                emotions_detected.append(dominant_emotion)
                
                # Accumulate scores
                for emotion, score in result['emotion'].items():
                    emotion_scores_sum[emotion] += score
                
                frame_count += 1
                
            except Exception as e:
                # Skip frames that fail analysis
                pass
            
            # Check timeout
            elapsed = time.time() - start_time
            if elapsed > max_duration:
                print(f"\n⏱️  Maximum time reached ({max_duration}s)")
                break
        
        # Calculate results
        if emotions_detected and frame_count > 0:
            # Count emotions
            emotion_counts = defaultdict(int)
            for emotion in emotions_detected:
                emotion_counts[emotion] += 1
            
            # Find dominant emotion
            dominant_emotion = max(emotion_counts, key=emotion_counts.get)
            
            # Calculate stress level
            stress_count = sum(emotion_counts[e] for e in STRESS_EMOTIONS)
            stress_level = min(5, max(1, int((stress_count / len(emotions_detected)) * 5) + 1))
            
            # Calculate percentages
            emotion_percentages = {
                emotion: (count / len(emotions_detected) * 100)
                for emotion, count in emotion_counts.items()
            }
            
            # Average scores
            emotion_avg_scores = {
                emotion: (total / frame_count)
                for emotion, total in emotion_scores_sum.items()
            }
            
            emotion_data = {
                'emotion': dominant_emotion,
                'stressLevel': stress_level,
                'emotionCounts': dict(emotion_counts),
                'emotionPercentages': emotion_percentages,
                'emotionScores': emotion_avg_scores,
                'frameCount': frame_count,
                'analysisDuration': time.time() - start_time,
                'questionNumber': question_number
            }
            
            return emotion_data
        else:
            # Fallback if no emotions detected
            return {
                'emotion': 'neutral',
                'stressLevel': 3,
                'emotionCounts': {'neutral': 1},
                'emotionPercentages': {'neutral': 100.0},
                'emotionScores': {},
                'frameCount': 0,
                'analysisDuration': time.time() - start_time,
                'questionNumber': question_number
            }
    
    def start_detection(self, question_number):
        """Start emotion detection in background thread"""
        self.stop_event.clear()
        self.emotion_data = {}
        
        def detection_thread():
            self.emotion_data = self.detect_emotions_silent(question_number)
        
        thread = threading.Thread(target=detection_thread, daemon=True)
        thread.start()
        return thread
    
    def stop_detection(self):
        """Stop emotion detection"""
        self.stop_event.set()
    
    def get_emotion_data(self):
        """Get collected emotion data"""
        return self.emotion_data


def verify_camera():
    """Verify camera is accessible"""
    try:
        cap = cv2.VideoCapture(CAMERA_INDEX)
        if cap.isOpened():
            cap.release()
            return True
        return False
    except:
        return False


def test_deepface():
    """Test DeepFace model loading"""
    try:
        # Create a small test image
        import numpy as np
        test_img = np.zeros((48, 48, 3), dtype=np.uint8)
        DeepFace.analyze(test_img, actions=['emotion'], enforce_detection=False)
        return True
    except Exception as e:
        print(f"DeepFace test failed: {e}")
        return False
