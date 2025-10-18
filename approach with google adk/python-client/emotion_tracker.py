"""
Emotion Tracker with Background Threading for Parallel Emotion Detection
Tracks emotions while user solves questions (runs parallel with timer)
"""

import cv2
import threading
import time
from deepface import DeepFace
from collections import Counter


class EmotionTracker:
    """
    Background emotion tracker that runs in parallel with question answering
    """
    
    def __init__(self, capture_interval=2.0):
        """
        Initialize emotion tracker
        
        Args:
            capture_interval: Seconds between emotion captures (default: 2.0)
        """
        self.capture_interval = capture_interval
        self.is_running = False
        self.thread = None
        self.cap = None
        
        # Collected data
        self.emotions = []
        self.stress_levels = []
        self.timestamps = []
        self.start_time = None
        self.end_time = None
        
        # Thread safety
        self.lock = threading.Lock()
    
    def start(self):
        """
        Start emotion tracking in background thread
        """
        if self.is_running:
            print("⚠️ Emotion tracker already running")
            return False
        
        # Initialize webcam
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            print("❌ Failed to open webcam")
            return False
        
        # Reset data
        with self.lock:
            self.emotions = []
            self.stress_levels = []
            self.timestamps = []
            self.start_time = time.time()
            self.end_time = None
        
        # Start background thread
        self.is_running = True
        self.thread = threading.Thread(target=self._tracking_loop, daemon=True)
        self.thread.start()
        
        print("✅ Emotion tracking started (parallel with question timer)")
        return True
    
    def stop(self):
        """
        Stop emotion tracking and return analytics
        
        Returns:
            dict: Emotion analytics for the question
        """
        if not self.is_running:
            print("⚠️ Emotion tracker not running")
            return None
        
        # Stop tracking
        self.is_running = False
        
        # Wait for thread to finish
        if self.thread:
            self.thread.join(timeout=3.0)
        
        # Release webcam
        if self.cap:
            self.cap.release()
            self.cap = None
        
        # Calculate analytics
        with self.lock:
            self.end_time = time.time()
            analytics = self._calculate_analytics()
        
        print("✅ Emotion tracking stopped")
        return analytics
    
    def _tracking_loop(self):
        """
        Background tracking loop (runs in separate thread)
        """
        while self.is_running:
            try:
                # Capture frame
                ret, frame = self.cap.read()
                if not ret:
                    print("⚠️ Failed to capture frame")
                    time.sleep(self.capture_interval)
                    continue
                
                # Analyze emotions using DeepFace
                result = DeepFace.analyze(
                    frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    silent=True
                )
                
                # Extract emotion data
                if isinstance(result, list):
                    result = result[0]
                
                emotions = result.get('emotion', {})
                dominant_emotion = result.get('dominant_emotion', 'neutral')
                
                # Calculate stress level (simplified)
                # High stress = angry + fear + disgust
                # Low stress = happy + neutral
                stress = (
                    emotions.get('angry', 0) * 0.4 +
                    emotions.get('fear', 0) * 0.4 +
                    emotions.get('disgust', 0) * 0.2
                ) / 100.0  # Normalize to 0-1
                
                # Store data (thread-safe)
                with self.lock:
                    self.emotions.append({
                        'dominant': dominant_emotion,
                        'scores': emotions
                    })
                    self.stress_levels.append(stress)
                    self.timestamps.append(time.time())
                
                # Display frame (optional, can be disabled for performance)
                cv2.putText(frame, f"Emotion: {dominant_emotion}", (10, 30),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, f"Stress: {stress:.2f}", (10, 60),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.imshow('Emotion Detection', frame)
                
                # Check for 'q' key to quit (non-blocking)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    self.is_running = False
                
            except Exception as e:
                print(f"⚠️ Error in tracking loop: {e}")
            
            # Wait for next capture
            time.sleep(self.capture_interval)
        
        # Clean up OpenCV windows
        cv2.destroyAllWindows()
    
    def _calculate_analytics(self):
        """
        Calculate emotion analytics from collected data
        
        Returns:
            dict: Analytics summary
        """
        if not self.emotions:
            return {
                'success': False,
                'error': 'No emotion data collected'
            }
        
        # Duration
        duration = self.end_time - self.start_time if self.end_time else 0
        
        # Dominant emotions
        dominant_emotions = [e['dominant'] for e in self.emotions]
        emotion_counts = Counter(dominant_emotions)
        most_common_emotion = emotion_counts.most_common(1)[0][0]
        
        # Stress analytics
        avg_stress = sum(self.stress_levels) / len(self.stress_levels)
        peak_stress = max(self.stress_levels)
        min_stress = min(self.stress_levels)
        
        # Stress stability (standard deviation)
        mean_stress = avg_stress
        variance = sum((x - mean_stress) ** 2 for x in self.stress_levels) / len(self.stress_levels)
        std_dev = variance ** 0.5
        
        # Emotion distribution (average scores)
        avg_emotions = {}
        for emotion_key in ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']:
            scores = [e['scores'].get(emotion_key, 0) for e in self.emotions]
            avg_emotions[emotion_key] = sum(scores) / len(scores) if scores else 0
        
        return {
            'success': True,
            'duration': duration,
            'samples_count': len(self.emotions),
            'dominant_emotion': most_common_emotion,
            'emotion_distribution': dict(emotion_counts),
            'average_stress': avg_stress,
            'peak_stress': peak_stress,
            'min_stress': min_stress,
            'stress_stability': std_dev,
            'average_emotions': avg_emotions,
            'timeline': [
                {
                    'timestamp': ts - self.start_time,
                    'emotion': self.emotions[i]['dominant'],
                    'stress': self.stress_levels[i]
                }
                for i, ts in enumerate(self.timestamps)
            ]
        }


class QuestionSetTracker:
    """
    Tracks emotions for an entire question set (5 questions)
    """
    
    def __init__(self):
        self.question_analytics = []
        self.set_start_time = None
        self.set_end_time = None
    
    def start_set(self):
        """Start tracking a new question set"""
        self.question_analytics = []
        self.set_start_time = time.time()
        print("📊 Started tracking question set")
    
    def add_question_analytics(self, question_num, analytics):
        """Add analytics for one question"""
        self.question_analytics.append({
            'question_number': question_num,
            'analytics': analytics
        })
        print(f"✅ Added analytics for question {question_num}")
    
    def complete_set(self):
        """Complete question set and return summary"""
        self.set_end_time = time.time()
        
        if not self.question_analytics:
            return {
                'success': False,
                'error': 'No question analytics collected'
            }
        
        # Calculate set-level analytics
        total_duration = self.set_end_time - self.set_start_time
        
        # Average stress across all questions
        avg_stress_per_question = [
            q['analytics'].get('average_stress', 0)
            for q in self.question_analytics
            if q['analytics'].get('success', False)
        ]
        set_avg_stress = sum(avg_stress_per_question) / len(avg_stress_per_question) if avg_stress_per_question else 0
        
        # Dominant emotions across set
        all_emotions = []
        for q in self.question_analytics:
            if q['analytics'].get('success', False):
                all_emotions.append(q['analytics'].get('dominant_emotion', 'neutral'))
        
        emotion_counts = Counter(all_emotions)
        
        return {
            'success': True,
            'total_duration': total_duration,
            'questions_count': len(self.question_analytics),
            'set_average_stress': set_avg_stress,
            'set_emotion_distribution': dict(emotion_counts),
            'question_analytics': self.question_analytics
        }


# Example usage
if __name__ == "__main__":
    print("🧪 Testing EmotionTracker...")
    
    tracker = EmotionTracker(capture_interval=2.0)
    
    # Start tracking
    if tracker.start():
        print("Tracking emotions for 10 seconds...")
        time.sleep(10)
        
        # Stop and get analytics
        analytics = tracker.stop()
        
        if analytics and analytics.get('success'):
            print("\n📊 Emotion Analytics:")
            print(f"Duration: {analytics['duration']:.2f}s")
            print(f"Samples: {analytics['samples_count']}")
            print(f"Dominant Emotion: {analytics['dominant_emotion']}")
            print(f"Average Stress: {analytics['average_stress']:.3f}")
            print(f"Peak Stress: {analytics['peak_stress']:.3f}")
            print(f"Stress Stability: {analytics['stress_stability']:.3f}")
            print(f"Emotion Distribution: {analytics['emotion_distribution']}")
        else:
            print("❌ Failed to get analytics")
    else:
        print("❌ Failed to start tracker")
