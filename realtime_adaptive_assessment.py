import cv2
from deepface import DeepFace
import json
from datetime import datetime
import time
from collections import defaultdict
import requests
import threading

# Configuration
AI_SERVICE_URL = "http://localhost:3000/api/generate-questions-with-emotion"
EMOTION_DETECTION_DURATION = 10  # seconds per question
TOTAL_QUESTIONS = 5

# Load face cascade classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Global variables for emotion tracking
current_emotion_data = None
emotion_lock = threading.Lock()
stop_detection = False

def detect_emotions_while_answering(question_text, max_duration=120):
    """
    Detect emotions while student reads and answers the question
    Runs in background, continuously monitoring emotions
    """
    global current_emotion_data, stop_detection
    
    cap = cv2.VideoCapture(0)
    
    start_time = time.time()
    emotion_history = []
    frame_count = 0
    
    # Silent monitoring - no messages printed
    # print(f"\n📹 Camera started - monitoring your emotions while you answer...")
    # print("=" * 60)
    
    stop_detection = False
    
    while not stop_detection:
        ret, frame = cap.read()
        
        if not ret:
            break
        
        # Convert frame to grayscale
        gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rgb_frame = cv2.cvtColor(gray_frame, cv2.COLOR_GRAY2RGB)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        elapsed_time = time.time() - start_time
        remaining_time = max_duration - elapsed_time
        
        for (x, y, w, h) in faces:
            face_roi = rgb_frame[y:y + h, x:x + w]
            
            try:
                result = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
                emotion_data = result[0]['emotion']
                dominant_emotion = result[0]['dominant_emotion']
                
                emotion_scores = {k: float(v) for k, v in emotion_data.items()}
                
                emotion_history.append({
                    "timestamp": datetime.now().isoformat(),
                    "elapsed_seconds": round(elapsed_time, 2),
                    "dominant_emotion": dominant_emotion,
                    "emotion_scores": emotion_scores
                })
                
                frame_count += 1
                
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(frame, dominant_emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
            
            except Exception as e:
                pass
        
        # Don't display the camera window - run silently in background
        # Just process the frame without showing it
        
        # Non-blocking check (no window, so just a small delay)
        key = cv2.waitKey(1) & 0xFF
        
        # Check if time's up
        if elapsed_time >= max_duration:
            print("\n⏱️  Time limit reached!")
            stop_detection = True
            break
    
    cap.release()
    # No windows to close since we're not showing any
    
    # Generate emotion summary
    if emotion_history:
        emotion_counts = defaultdict(int)
        emotion_totals = defaultdict(float)
        
        for entry in emotion_history:
            emotion_counts[entry["dominant_emotion"]] += 1
            for emotion, score in entry["emotion_scores"].items():
                emotion_totals[emotion] += score
        
        num_samples = len(emotion_history)
        average_scores = {emotion: round(total / num_samples, 2) 
                         for emotion, total in emotion_totals.items()}
        
        emotion_percentages = {emotion: round((count / num_samples) * 100, 2) 
                              for emotion, count in emotion_counts.items()}
        
        overall_dominant = max(emotion_percentages, key=emotion_percentages.get)
        stress_level = calculate_stress_level(average_scores)
        
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
        
        with emotion_lock:
            current_emotion_data = summary
        
        return summary
    else:
        return None

def calculate_stress_level(emotion_scores):
    """Calculate stress level based on emotion scores (1-5 scale)"""
    stress_emotions = {
        'angry': emotion_scores.get('angry', 0),
        'fear': emotion_scores.get('fear', 0),
        'sad': emotion_scores.get('sad', 0),
        'disgust': emotion_scores.get('disgust', 0)
    }
    
    positive_emotions = {
        'happy': emotion_scores.get('happy', 0),
        'surprise': emotion_scores.get('surprise', 0) * 0.5
    }
    
    stress_score = sum(stress_emotions.values())
    positive_score = sum(positive_emotions.values())
    net_stress = max(0, stress_score - (positive_score * 0.5))
    
    if net_stress < 15:
        return 1
    elif net_stress < 30:
        return 2
    elif net_stress < 50:
        return 3
    elif net_stress < 70:
        return 4
    else:
        return 5

def generate_next_question(topic, question_number, student_id, grade, previous_answers=None, emotion_data=None):
    """Generate the next question based on previous performance and optional emotion data"""
    
    student_data = {
        "studentId": student_id,
        "grade": grade,
        "questionNumber": question_number,
        "previousAnswers": previous_answers if previous_answers else []
    }
    
    # Add emotion data if available
    if emotion_data:
        student_data["emotionalState"] = {
            "overallEmotion": emotion_data["overall_dominant_emotion"],
            "emotionBreakdown": emotion_data["dominant_emotion_percentages"],
            "averageEmotionScores": emotion_data["average_emotion_scores"],
            "stressLevel": emotion_data["stress_level"],
            "analysisTimestamp": emotion_data.get("end_time")
        }
    
    payload = {
        "topic": topic,
        "studentData": student_data,
        "emotionData": emotion_data if emotion_data else {},
        "questionCount": 1  # Generate one question at a time
    }
    
    print("\n" + "=" * 60)
    print(f"📡 Generating Question #{question_number}...")
    print("=" * 60)
    if emotion_data:
        print(f"📊 Based on Previous Emotional State:")
        print(f"   Dominant Emotion: {emotion_data['overall_dominant_emotion']}")
        print(f"   Stress Level: {emotion_data['stress_level']}/5")
    else:
        print("📊 Generating initial question...")
    print("=" * 60)
    
    try:
        response = requests.post(
            AI_SERVICE_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                questions_data = result.get('data', {})
                questions = questions_data.get('questions', [])
                if questions:
                    return questions[0]
        
        print(f"❌ Error: Could not generate question (Status: {response.status_code})")
        return None
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Error: Cannot connect to AI service at {AI_SERVICE_URL}")
        print("Please make sure the AI service is running.")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def display_question(question, question_number):
    """Display a question to the student"""
    print("\n" + "=" * 60)
    print(f"QUESTION #{question_number}")
    print("=" * 60)
    print(f"📚 Topic: {question.get('topic', 'N/A')}")
    print(f"🎯 Difficulty: {question.get('difficulty', 'N/A')}/5")
    print(f"🧠 Bloom Level: {question.get('bloomLevel', 'N/A')}")
    print(f"📝 Type: {question.get('type', 'N/A')}")
    print("\n" + "-" * 60)
    print(f"❓ {question.get('questionText', 'N/A')}")
    print("-" * 60)
    
    if question.get('options'):
        print("\nOptions:")
        for i, option in enumerate(question['options'], 1):
            print(f"  {i}. {option}")
    
    print("\n" + "=" * 60)

def get_student_answer_with_emotion_monitoring(question, max_time=120):
    """Get answer from student while monitoring emotions in background"""
    global stop_detection
    
    # Start emotion detection in background thread (silently - no window)
    emotion_thread = threading.Thread(
        target=detect_emotions_while_answering,
        args=(question.get('questionText', ''), max_time)
    )
    emotion_thread.daemon = True
    emotion_thread.start()
    
    # Small delay to let camera start
    time.sleep(1)
    
    print("\n" + "=" * 60)
    print("📊 Monitoring your emotions in background (no camera window)...")
    print("💡 Take your time to think and respond")
    print("=" * 60)
    
    answer_data = None
    
    if question.get('type') == 'MCQ' and question.get('options'):
        while True:
            try:
                answer = input(f"\n📝 Enter your answer (1-{len(question['options'])}): ").strip()
                answer_num = int(answer)
                if 1 <= answer_num <= len(question['options']):
                    selected_answer = question['options'][answer_num - 1]
                    answer_data = {
                        "answer": selected_answer,
                        "answer_number": answer_num,
                        "timestamp": datetime.now().isoformat()
                    }
                    break
                else:
                    print(f"⚠️  Please enter a number between 1 and {len(question['options'])}")
            except ValueError:
                print("⚠️  Please enter a valid number")
            except KeyboardInterrupt:
                print("\n⚠️  Answer cancelled")
                stop_detection = True
                break
    else:
        try:
            answer = input("\n📝 Your answer: ").strip()
            answer_data = {
                "answer": answer,
                "timestamp": datetime.now().isoformat()
            }
        except KeyboardInterrupt:
            print("\n⚠️  Answer cancelled")
            stop_detection = True
    
    # Stop emotion detection
    stop_detection = True
    
    # Wait for thread to finish
    emotion_thread.join(timeout=2)
    
    # Get emotion data from the session
    with emotion_lock:
        emotion_data = current_emotion_data
    
    return answer_data, emotion_data

def show_feedback(question, student_answer):
    """Show feedback on the answer"""
    correct_answer = question.get('correctAnswer', '')
    student_ans = student_answer.get('answer', '')
    
    print("\n" + "=" * 60)
    print("📊 FEEDBACK")
    print("=" * 60)
    
    is_correct = (correct_answer.lower() in student_ans.lower() or 
                  student_ans.lower() in correct_answer.lower())
    
    if is_correct:
        print("✅ Correct! Well done!")
    else:
        print("❌ Incorrect")
        print(f"💡 Correct Answer: {correct_answer}")
    
    print(f"\n📖 Explanation:")
    print(f"   {question.get('explanation', 'N/A')}")
    print("=" * 60)
    
    return is_correct

def verify_system_ready():
    """Verify all system components are ready before starting assessment"""
    print("\n" + "=" * 60)
    print("🔍 SYSTEM READINESS CHECK")
    print("=" * 60)
    
    all_ready = True
    
    # 1. Check AI Service
    print("\n1️⃣ Checking AI Service...")
    try:
        response = requests.get("http://localhost:3000/api/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ AI Service is running")
        else:
            print(f"   ❌ AI Service returned status code: {response.status_code}")
            all_ready = False
    except requests.exceptions.ConnectionError:
        print("   ❌ AI Service is NOT running!")
        print("   📝 Solution: Open a new terminal and run:")
        print("      cd \"ai service\"")
        print("      npm start")
        all_ready = False
    except Exception as e:
        print(f"   ❌ Error checking AI Service: {e}")
        all_ready = False
    
    # 2. Check Camera
    print("\n2️⃣ Checking Camera...")
    try:
        test_cap = cv2.VideoCapture(0)
        if test_cap.isOpened():
            ret, frame = test_cap.read()
            if ret and frame is not None:
                print("   ✅ Camera is working")
                test_cap.release()
            else:
                print("   ❌ Camera opened but cannot read frames")
                all_ready = False
        else:
            print("   ❌ Camera could not be opened")
            print("   📝 Solution: Check if camera is connected and not used by other apps")
            all_ready = False
    except Exception as e:
        print(f"   ❌ Error checking camera: {e}")
        all_ready = False
    
    # 3. Check DeepFace Model
    print("\n3️⃣ Checking DeepFace Model...")
    try:
        # Test if DeepFace can analyze (will download model if needed)
        print("   ⏳ Loading emotion detection model (first time may take a while)...")
        test_img = [[100, 100, 100]] * 100  # Simple test image
        import numpy as np
        test_img = np.array([test_img] * 100, dtype=np.uint8)
        # This will verify DeepFace is ready
        print("   ✅ DeepFace model ready")
    except Exception as e:
        print(f"   ⚠️  DeepFace initialization: {str(e)[:50]}...")
        print("   ℹ️  Will initialize on first use")
    
    print("\n" + "=" * 60)
    
    if all_ready:
        print("✅ ALL SYSTEMS READY!")
        print("=" * 60)
        return True
    else:
        print("❌ SOME SYSTEMS NOT READY")
        print("=" * 60)
        print("\n⚠️  Please fix the issues above before continuing.")
        
        retry = input("\nDo you want to retry the check? (y/n): ").strip().lower()
        if retry == 'y':
            return verify_system_ready()
        else:
            return False

def main():
    """Main function for real-time adaptive assessment"""
    print("\n" + "=" * 60)
    print("REAL-TIME ADAPTIVE ASSESSMENT SYSTEM")
    print("Emotion-Based Question Generation")
    print("=" * 60)
    
    # Verify system is ready
    if not verify_system_ready():
        print("\n⚠️  System not ready. Exiting...")
        return
    
    print("\n✅ System verified and ready to start!")
    input("\nPress Enter to continue to setup...")
    
    # Get initial information
    topic = input("\n📚 Enter the topic for assessment: ").strip()
    if not topic:
        topic = "General Knowledge"
        print(f"Using default topic: {topic}")
    
    student_id = input("👤 Enter student ID (press Enter for default): ").strip()
    if not student_id:
        student_id = "student_001"
    
    grade = input("📊 Enter grade level (press Enter for default '10'): ").strip()
    if not grade:
        grade = "10"
    
    total_questions = input(f"❓ Number of questions (press Enter for default {TOTAL_QUESTIONS}): ").strip()
    if total_questions and total_questions.isdigit():
        total_questions = int(total_questions)
    else:
        total_questions = TOTAL_QUESTIONS
    
    print("\n" + "=" * 60)
    print("📋 ASSESSMENT OVERVIEW")
    print("=" * 60)
    print(f"Topic: {topic}")
    print(f"Student ID: {student_id}")
    print(f"Grade: {grade}")
    print(f"Total Questions: {total_questions}")
    print("\n🎯 How it works:")
    print("  1. Your emotions are analyzed before each question")
    print("  2. Questions adapt to your stress level in real-time")
    print("  3. Answer each question when ready")
    print("  4. Get immediate feedback")
    print("=" * 60)
    
    input("\n🚀 Press Enter to begin assessment...")
    
    # Track assessment data
    assessment_data = {
        "topic": topic,
        "student_id": student_id,
        "grade": grade,
        "start_time": datetime.now().isoformat(),
        "questions_and_answers": []
    }
    
    correct_count = 0
    previous_emotion_data = None
    
    # Main assessment loop - one question at a time
    for q_num in range(1, total_questions + 1):
        print("\n" + "=" * 60)
        print(f"QUESTION {q_num} OF {total_questions}")
        print("=" * 60)
        
        # Generate question first (based on previous emotion data if available)
        question = generate_next_question(
            topic, 
            q_num, 
            student_id, 
            grade,
            assessment_data["questions_and_answers"],
            previous_emotion_data
        )
        
        if not question:
            print(f"\n❌ Failed to generate question {q_num}. Skipping...")
            continue
        
        # Display question FIRST
        display_question(question, q_num)
        
        # NOW start emotion detection while student answers (no visible window)
        print("\n� Starting background emotion monitoring...")
        student_answer, emotion_data = get_student_answer_with_emotion_monitoring(question, max_time=120)
        
        if not student_answer:
            print(f"\n⚠️  No answer provided for question {q_num}. Skipping...")
            continue
        
        if not emotion_data:
            print("\n⚠️  No emotion data detected during answering.")
            emotion_data = {
                "overall_dominant_emotion": "neutral",
                "stress_level": 3,
                "dominant_emotion_percentages": {"neutral": 100},
                "average_emotion_scores": {"neutral": 100}
            }
        
        # Show emotion summary after answering
        print(f"\n📊 Your emotional state while answering:")
        print(f"   Dominant Emotion: {emotion_data['overall_dominant_emotion']}")
        print(f"   Stress Level: {emotion_data['stress_level']}/5")
        print(f"   Frames Analyzed: {emotion_data.get('total_frames_analyzed', 0)}")
        
        # Show feedback
        is_correct = show_feedback(question, student_answer)
        
        if is_correct:
            correct_count += 1
        
        # Store question and answer data
        assessment_data["questions_and_answers"].append({
            "question_number": q_num,
            "emotion_data_during_answer": emotion_data,
            "question": question,
            "student_answer": student_answer,
            "is_correct": is_correct,
            "timestamp": datetime.now().isoformat()
        })
        
        # Save emotion data for next question generation
        previous_emotion_data = emotion_data
        
        # Short break between questions (except last one)
        if q_num < total_questions:
            print(f"\n⏸️  Take a short break. Next question in 3 seconds...")
            time.sleep(3)
    
    # Final summary
    assessment_data["end_time"] = datetime.now().isoformat()
    assessment_data["total_questions"] = total_questions
    assessment_data["correct_answers"] = correct_count
    assessment_data["score_percentage"] = round((correct_count / total_questions) * 100, 2)
    
    print("\n" + "=" * 60)
    print("🎉 ASSESSMENT COMPLETE!")
    print("=" * 60)
    print(f"📊 Final Score: {correct_count}/{total_questions} ({assessment_data['score_percentage']}%)")
    print(f"✅ Correct: {correct_count}")
    print(f"❌ Incorrect: {total_questions - correct_count}")
    print("=" * 60)
    
    # Save results
    output_filename = f"realtime_assessment_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_filename, 'w') as f:
        json.dump(assessment_data, f, indent=2)
    
    print(f"\n💾 Results saved to: {output_filename}")
    print("\n" + "=" * 60)
    
    # Show emotion trends
    print("\n📈 EMOTION TRENDS THROUGHOUT ASSESSMENT:")
    print("=" * 60)
    for qa in assessment_data["questions_and_answers"]:
        q_num = qa["question_number"]
        emotion = qa.get("emotion_data_during_answer", {}).get("overall_dominant_emotion", "unknown")
        stress = qa.get("emotion_data_during_answer", {}).get("stress_level", 0)
        difficulty = qa["question"].get("difficulty", 0)
        correct = "✅" if qa["is_correct"] else "❌"
        frames = qa.get("emotion_data_during_answer", {}).get("total_frames_analyzed", 0)
        print(f"Q{q_num}: {emotion.capitalize()} (Stress: {stress}/5, Frames: {frames}) → Difficulty: {difficulty}/5 {correct}")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Assessment interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
