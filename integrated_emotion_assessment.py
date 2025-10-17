import cv2
from deepface import DeepFace
import json
from datetime import datetime
import time
from collections import defaultdict
import requests

# Configuration
AI_SERVICE_URL = "http://localhost:3000/api/generate-questions-with-emotion"
DURATION = 20  # seconds for emotion detection
QUESTION_COUNT = 5  # number of questions to generate

# Load face cascade classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def detect_emotions(duration=20):
    """
    Detect emotions for a specified duration and return emotion summary
    """
    # Start capturing video
    cap = cv2.VideoCapture(0)
    
    # Variables for emotion tracking
    start_time = time.time()
    emotion_history = []
    frame_count = 0
    
    print(f"Starting {duration}-second emotion detection...")
    print("Analyzing emotions... Please look at the camera")
    print("=" * 60)
    
    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()
        
        if not ret:
            break
        
        # Convert frame to grayscale
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Convert grayscale frame to RGB format
        rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)
        
        # Detect faces in the frame
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        # Check elapsed time
        elapsed_time = time.time() - start_time
        remaining_time = duration - elapsed_time
        
        for i, (x, y, w, h) in enumerate(faces):
            # Extract the face ROI (Region of Interest)
            face_roi = rgb_frame[y:y + h, x:x + w]
            
            try:
                # Perform emotion analysis on the face ROI
                result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
                
                # Get emotion data
                emotion_data = result[0]['emotion']
                dominant_emotion = result[0]['dominant_emotion']
                
                # Convert emotion scores to regular Python floats
                emotion_scores = {k: float(v) for k, v in emotion_data.items()}
                
                # Store emotion data with timestamp
                emotion_history.append({
                    "timestamp": datetime.now().isoformat(),
                    "elapsed_seconds": round(elapsed_time, 2),
                    "dominant_emotion": dominant_emotion,
                    "emotion_scores": emotion_scores
                })
                
                frame_count += 1
                
                # Draw rectangle around face and label with predicted emotion
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(frame, dominant_emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            
            except Exception as e:
                print(f"Error analyzing face: {e}")
        
        # Display countdown and frame count
        cv2.putText(frame, f"Time remaining: {int(remaining_time)}s", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        cv2.putText(frame, f"Frames analyzed: {frame_count}", (10, 70), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Display the resulting frame
        cv2.imshow('Emotion Detection - Integration Mode', frame)
        
        # Check if duration has passed
        if elapsed_time >= duration:
            print("\nEmotion detection completed! Generating summary...")
            break
        
        # Press 'q' to exit early
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("\nStopped early. Generating summary...")
            break
    
    # Release the capture and close all windows
    cap.release()
    cv2.destroyAllWindows()
    
    # Generate emotion summary
    if emotion_history:
        # Calculate emotion statistics
        emotion_counts = defaultdict(int)
        emotion_totals = defaultdict(float)
        
        for entry in emotion_history:
            emotion_counts[entry["dominant_emotion"]] += 1
            for emotion, score in entry["emotion_scores"].items():
                emotion_totals[emotion] += score
        
        # Calculate averages
        num_samples = len(emotion_history)
        average_scores = {emotion: round(total / num_samples, 2) 
                         for emotion, total in emotion_totals.items()}
        
        # Calculate percentages of dominant emotions
        emotion_percentages = {emotion: round((count / num_samples) * 100, 2) 
                              for emotion, count in emotion_counts.items()}
        
        # Find overall dominant emotion
        overall_dominant = max(emotion_percentages, key=emotion_percentages.get)
        
        # Calculate stress level based on emotions
        stress_level = calculate_stress_level(average_scores)
        
        # Create final summary
        summary = {
            "analysis_duration_seconds": round(time.time() - start_time, 2),
            "total_frames_analyzed": frame_count,
            "start_time": emotion_history[0]["timestamp"] if emotion_history else None,
            "end_time": emotion_history[-1]["timestamp"] if emotion_history else None,
            "overall_dominant_emotion": overall_dominant,
            "dominant_emotion_percentages": dict(sorted(emotion_percentages.items(), 
                                                       key=lambda x: x[1], reverse=True)),
            "average_emotion_scores": dict(sorted(average_scores.items(), 
                                                  key=lambda x: x[1], reverse=True)),
            "stress_level": stress_level,
            "detailed_timeline": emotion_history
        }
        
        return summary
    else:
        print("No faces detected during the analysis period.")
        return None

def calculate_stress_level(emotion_scores):
    """
    Calculate stress level based on emotion scores (1-5 scale)
    1 = Very Low Stress, 2 = Low Stress, 3 = Moderate, 4 = High Stress, 5 = Very High Stress
    """
    # Stress indicators (negative emotions)
    stress_emotions = {
        'angry': emotion_scores.get('angry', 0),
        'fear': emotion_scores.get('fear', 0),
        'sad': emotion_scores.get('sad', 0),
        'disgust': emotion_scores.get('disgust', 0)
    }
    
    # Positive emotions (reduce stress)
    positive_emotions = {
        'happy': emotion_scores.get('happy', 0),
        'surprise': emotion_scores.get('surprise', 0) * 0.5  # Surprise can be mixed
    }
    
    stress_score = sum(stress_emotions.values())
    positive_score = sum(positive_emotions.values())
    
    # Calculate net stress (0-100 scale)
    net_stress = max(0, stress_score - (positive_score * 0.5))
    
    # Map to 1-5 scale
    if net_stress < 15:
        return 1  # Very Low Stress
    elif net_stress < 30:
        return 2  # Low Stress
    elif net_stress < 50:
        return 3  # Moderate Stress
    elif net_stress < 70:
        return 4  # High Stress
    else:
        return 5  # Very High Stress

def generate_adaptive_questions(emotion_data, topic, student_id="student_001", grade="10", subject="General"):
    """
    Send emotion data to AI service and get adaptive questions
    """
    # Prepare student data with emotion insights
    student_data = {
        "studentId": student_id,
        "grade": grade,
        "subject": subject,
        "emotionalState": {
            "overallEmotion": emotion_data["overall_dominant_emotion"],
            "emotionBreakdown": emotion_data["dominant_emotion_percentages"],
            "averageEmotionScores": emotion_data["average_emotion_scores"],
            "stressLevel": emotion_data["stress_level"],
            "analysisTimestamp": emotion_data["end_time"]
        },
        "learningPreferences": {
            "adaptToStress": True,
            "adjustDifficultyBasedOnEmotion": True
        },
        "performanceHistory": {
            "recentStressLevel": emotion_data["stress_level"],
            "emotionalTrend": emotion_data["overall_dominant_emotion"]
        }
    }
    
    # Prepare request payload
    payload = {
        "topic": topic,
        "studentData": student_data,
        "emotionData": emotion_data,
        "questionCount": QUESTION_COUNT
    }
    
    print("\n" + "=" * 60)
    print("SENDING REQUEST TO AI SERVICE")
    print("=" * 60)
    print(f"Topic: {topic}")
    print(f"Stress Level: {emotion_data['stress_level']}/5")
    print(f"Dominant Emotion: {emotion_data['overall_dominant_emotion']}")
    print(f"Question Count: {QUESTION_COUNT}")
    print("=" * 60)
    
    try:
        # Send POST request to AI service
        response = requests.post(
            AI_SERVICE_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            return result
        else:
            print(f"Error: Received status code {response.status_code}")
            print(f"Response: {response.text}")
            return None
    
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Error: Cannot connect to AI service at {AI_SERVICE_URL}")
        print("Please make sure the AI service is running:")
        print("  1. Navigate to 'ai service' folder")
        print("  2. Run: npm install")
        print("  3. Run: npm start")
        return None
    except Exception as e:
        print(f"Error calling AI service: {e}")
        return None

def main():
    """
    Main function to run the integrated emotion-based adaptive assessment
    """
    print("\n" + "=" * 60)
    print("INTEGRATED EMOTION-BASED ADAPTIVE ASSESSMENT SYSTEM")
    print("=" * 60)
    
    # Get topic from user
    topic = input("\nEnter the topic for questions (e.g., 'Photosynthesis', 'Python Programming'): ").strip()
    if not topic:
        topic = "General Knowledge"
        print(f"No topic entered. Using default: {topic}")
    
    # Optional: Get student details
    student_id = input("Enter student ID (press Enter for default 'student_001'): ").strip()
    if not student_id:
        student_id = "student_001"
    
    grade = input("Enter grade level (press Enter for default '10'): ").strip()
    if not grade:
        grade = "10"
    
    print(f"\n📊 Starting emotion detection for {DURATION} seconds...")
    print("💡 Tip: Try to maintain a natural expression while looking at the camera")
    print("\nPress 'q' to stop early\n")
    
    # Detect emotions
    emotion_data = detect_emotions(DURATION)
    
    if emotion_data:
        # Save emotion summary
        emotion_filename = f"emotion_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(emotion_filename, 'w') as f:
            json.dump(emotion_data, f, indent=2)
        
        print("\n" + "=" * 60)
        print("EMOTION ANALYSIS SUMMARY")
        print("=" * 60)
        print(f"Dominant Emotion: {emotion_data['overall_dominant_emotion']}")
        print(f"Stress Level: {emotion_data['stress_level']}/5")
        print(f"Frames Analyzed: {emotion_data['total_frames_analyzed']}")
        print(f"Summary saved to: {emotion_filename}")
        print("=" * 60)
        
        # Generate adaptive questions
        print("\n🤖 Generating adaptive questions based on your emotional state...")
        questions_result = generate_adaptive_questions(emotion_data, topic, student_id, grade)
        
        if questions_result and questions_result.get('success'):
            questions_data = questions_result.get('data', {})
            questions = questions_data.get('questions', [])
            
            print("\n" + "=" * 60)
            print("ADAPTIVE QUESTIONS GENERATED")
            print("=" * 60)
            print(f"Total Questions: {len(questions)}\n")
            
            for i, q in enumerate(questions, 1):
                print(f"\nQuestion {i}:")
                print(f"  Topic: {q.get('topic', 'N/A')}")
                print(f"  Difficulty: {q.get('difficulty', 'N/A')}/5")
                print(f"  Bloom Level: {q.get('bloomLevel', 'N/A')}")
                print(f"  Type: {q.get('type', 'N/A')}")
                print(f"  Question: {q.get('questionText', 'N/A')}")
                
                if q.get('options'):
                    print("  Options:")
                    for opt_idx, opt in enumerate(q['options'], 1):
                        print(f"    {opt_idx}. {opt}")
                
                print(f"  Correct Answer: {q.get('correctAnswer', 'N/A')}")
                print(f"  Explanation: {q.get('explanation', 'N/A')}")
            
            # Save complete output
            output_filename = f"integrated_output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            complete_output = {
                "emotionData": emotion_data,
                "questions": questions_result
            }
            
            with open(output_filename, 'w') as f:
                json.dump(complete_output, f, indent=2)
            
            print("\n" + "=" * 60)
            print(f"✅ Complete output saved to: {output_filename}")
            print("=" * 60)
        else:
            print("\n❌ Failed to generate questions. Please check if AI service is running.")
            if questions_result:
                print(f"Error: {questions_result.get('error', 'Unknown error')}")
    else:
        print("\n❌ No emotion data collected. Please ensure your face is visible to the camera.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Process interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")

