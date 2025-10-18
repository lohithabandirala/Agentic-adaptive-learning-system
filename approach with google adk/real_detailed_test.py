"""
REAL DETAILED TEST - Shows actual AI responses
Demonstrates Question Generation, Emotion Detection, and Personalized Feedback
"""

import requests
import cv2
from deepface import DeepFace
import time
from collections import Counter
import json

API_URL = "http://localhost:3000/api"

def print_section(title, symbol="="):
    """Print formatted section"""
    print(f"\n{symbol*80}")
    print(f"{title:^80}")
    print(f"{symbol*80}\n")

def real_test_questions():
    """Generate and display real AI questions"""
    print_section("🧠 REAL AI QUESTION GENERATION TEST")
    
    print("Creating assessment session for 'Python Programming'...\n")
    
    # Start session
    session_response = requests.post(
        f"{API_URL}/sessions/start",
        json={
            "student_id": "DEMO_STUDENT_001",
            "name": "Demo Student",
            "grade": 10,
            "topic": "Python Programming",
            "total_questions": 3
        }
    )
    
    if session_response.status_code != 200:
        print(f"❌ Failed to start session: {session_response.text}")
        return
    
    session_id = session_response.json()['session_id']
    print(f"✅ Session Started: {session_id}\n")
    
    # Test 3 questions with progression
    scenarios = [
        {"emotion": "neutral", "stress": 2, "previous_correct": None},
        {"emotion": "happy", "stress": 2, "previous_correct": True},
        {"emotion": "confused", "stress": 4, "previous_correct": False}
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{'─'*80}")
        print(f"QUESTION {i} - Emotional Context: {scenario['emotion'].upper()} (Stress: {scenario['stress']}/5)")
        print('─'*80)
        
        # Get question
        q_data = {
            "session_id": session_id,
            "current_emotion": scenario['emotion'],
            "stress_level": scenario['stress']
        }
        
        if scenario['previous_correct'] is not None:
            q_data['previous_correct'] = scenario['previous_correct']
        
        q_response = requests.post(f"{API_URL}/sessions/question/next", json=q_data)
        
        if q_response.status_code == 200:
            question = q_response.json()
            
            print(f"\n📚 TOPIC: {question.get('topic', 'N/A')}")
            print(f"🎯 DIFFICULTY: {question.get('difficulty_level', 'N/A')}")
            print(f"🧠 BLOOM'S LEVEL: {question.get('bloom_level', 'N/A')}")
            print(f"📝 TYPE: {question.get('question_type', 'N/A')}")
            
            print(f"\n❓ QUESTION:")
            print(f"   {question.get('question', 'N/A')}")
            
            if question.get('options'):
                print(f"\n   📋 OPTIONS:")
                for idx, opt in enumerate(question['options'], 1):
                    print(f"      {idx}. {opt}")
            
            print(f"\n✅ CORRECT ANSWER: {question.get('correct_answer', 'N/A')}")
            print(f"\n💡 EXPLANATION:")
            print(f"   {question.get('explanation', 'N/A')}")
            
            # Test personalized feedback
            print(f"\n{'─'*80}")
            print("🤖 TESTING PERSONALIZED AI FEEDBACK")
            print('─'*80)
            
            # Simulate student answer
            if i == 1:
                student_answer = question.get('correct_answer')
                is_correct = True
                feedback_emotion = "happy"
                feedback_stress = 2
            elif i == 2:
                student_answer = question.get('correct_answer')
                is_correct = True
                feedback_emotion = "happy"
                feedback_stress = 3
            else:
                # Wrong answer
                student_answer = "Wrong answer for testing"
                is_correct = False
                feedback_emotion = "sad"
                feedback_stress = 5
            
            feedback_response = requests.post(
                f"{API_URL}/sessions/answer/submit",
                json={
                    "session_id": session_id,
                    "question_number": i,
                    "answer": student_answer,
                    "emotion": feedback_emotion,
                    "stress_level": feedback_stress,
                    "time_taken": 30 + (i * 10)
                }
            )
            
            if feedback_response.status_code == 200:
                feedback = feedback_response.json()
                
                print(f"\n📊 STUDENT RESPONSE:")
                print(f"   Answer: {student_answer}")
                print(f"   Result: {'✅ CORRECT' if feedback.get('is_correct') else '❌ INCORRECT'}")
                print(f"   Emotion During Answer: {feedback_emotion}")
                print(f"   Stress Level: {feedback_stress}/5")
                print(f"   Time Taken: {30 + (i * 10)} seconds")
                
                print(f"\n🤖 AI PERSONALIZED FEEDBACK:")
                print(f"   {feedback.get('feedback', 'No feedback')}")
                
                if feedback.get('encouragement'):
                    print(f"\n💪 ENCOURAGEMENT:")
                    print(f"   {feedback.get('encouragement')}")
                
                if feedback.get('hint'):
                    print(f"\n💡 HINT:")
                    print(f"   {feedback.get('hint')}")
            
            time.sleep(2)  # Pause between questions
        else:
            print(f"❌ Failed to get question: {q_response.text}")
    
    # Get session summary
    print(f"\n{'─'*80}")
    print("📊 GETTING SESSION SUMMARY FROM AI")
    print('─'*80)
    
    summary_response = requests.post(f"{API_URL}/sessions/complete", json={"session_id": session_id})
    
    if summary_response.status_code == 200:
        summary = summary_response.json()
        
        print(f"\n📈 SESSION STATISTICS:")
        print(f"   Total Questions: {summary.get('total_questions', 0)}")
        print(f"   Correct Answers: {summary.get('correct_answers', 0)}")
        print(f"   Accuracy: {summary.get('accuracy', 0)}%")
        print(f"   Average Stress: {summary.get('average_stress', 0)}/5")
        print(f"   Dominant Emotion: {summary.get('dominant_emotion', 'N/A')}")
        
        if summary.get('ai_summary'):
            print(f"\n🤖 AI OVERALL ASSESSMENT:")
            print(f"   {summary['ai_summary']}")
        
        if summary.get('recommendations'):
            print(f"\n💡 AI RECOMMENDATIONS:")
            for rec in summary['recommendations']:
                print(f"   • {rec}")

def real_test_emotion_detection():
    """Real emotion detection test with live display"""
    print_section("😊 REAL EMOTION DETECTION TEST (Live)", "=")
    
    print("📹 This will use your camera for 15 seconds")
    print("   Try different expressions: Happy, Sad, Angry, Surprised!\n")
    
    input("Press ENTER to start camera...")
    
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Cannot access camera")
        return
    
    print("\n✅ Camera started!")
    print("🎬 Recording emotions for 15 seconds...\n")
    
    start_time = time.time()
    duration = 15
    emotions_detected = []
    emotion_timeline = []
    
    while time.time() - start_time < duration:
        ret, frame = cap.read()
        if not ret:
            break
        
        try:
            result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            if isinstance(result, list):
                result = result[0]
            
            emotion = result['dominant_emotion']
            emotions_detected.append(emotion)
            
            elapsed = int(time.time() - start_time)
            emotion_timeline.append({
                'second': elapsed,
                'emotion': emotion,
                'scores': result['emotion']
            })
            
            # Display on frame
            cv2.putText(frame, f"Emotion: {emotion.upper()}", (10, 40), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
            
            remaining = duration - elapsed
            cv2.putText(frame, f"Time: {remaining}s", (10, 90), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
            
            # Show emotion scores
            y_pos = 140
            for emo, score in sorted(result['emotion'].items(), key=lambda x: x[1], reverse=True)[:3]:
                cv2.putText(frame, f"{emo}: {score:.1f}%", (10, y_pos), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                y_pos += 30
            
            cv2.imshow('Real Emotion Detection Test', frame)
            
        except:
            pass
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    
    # Detailed analysis
    if emotions_detected:
        print("\n✅ Emotion detection completed!\n")
        
        emotion_counts = Counter(emotions_detected)
        total_frames = len(emotions_detected)
        
        print(f"{'─'*80}")
        print(f"📊 DETAILED EMOTION ANALYSIS ({total_frames} frames)")
        print('─'*80)
        
        for emotion, count in emotion_counts.most_common():
            percentage = (count / total_frames) * 100
            bar_length = int(percentage / 2)
            bar = '█' * bar_length
            print(f"{emotion:15} {bar:50} {count:3} frames ({percentage:5.1f}%)")
        
        # Timeline summary
        print(f"\n{'─'*80}")
        print("⏱️  EMOTION TIMELINE (Second by Second)")
        print('─'*80)
        
        for i in range(0, duration, 3):
            emotions_in_period = [e['emotion'] for e in emotion_timeline if i <= e['second'] < i+3]
            if emotions_in_period:
                most_common = Counter(emotions_in_period).most_common(1)[0][0]
                print(f"Seconds {i:2}-{i+3:2}: {most_common.upper()}")
        
        # Stress calculation
        stress_emotions = ['angry', 'fear', 'sad']
        stress_count = sum(emotion_counts[e] for e in stress_emotions if e in emotion_counts)
        stress_level = min(5, max(1, int((stress_count / total_frames) * 5) + 1))
        
        print(f"\n{'─'*80}")
        print(f"📈 EMOTIONAL STATE SUMMARY")
        print('─'*80)
        print(f"Dominant Emotion: {emotion_counts.most_common(1)[0][0].upper()}")
        print(f"Calculated Stress Level: {stress_level}/5")
        print(f"Emotional Stability: {'High' if len(emotion_counts) <= 3 else 'Variable'}")
        
        return True
    
    return False

def main():
    """Run real comprehensive tests"""
    print("\n" + "="*80)
    print("🚀 REAL ADAPTIVE AI LEARNING SYSTEM TEST".center(80))
    print("Showing ACTUAL AI-Generated Content".center(80))
    print("="*80)
    
    # Check API
    try:
        response = requests.get(f"{API_URL}/health", timeout=3)
        if response.status_code != 200:
            print("\n❌ Backend not running! Start it first:")
            print("   cd backend && npm start")
            return
        print("\n✅ Backend API is running")
    except:
        print("\n❌ Cannot connect to backend!")
        print("   Start backend: cd backend && npm start")
        return
    
    print("\n" + "="*80)
    print("This test will show REAL:")
    print("  1. AI-generated questions (Google Gemini)")
    print("  2. Personalized feedback based on emotions")
    print("  3. Live emotion detection with analysis")
    print("="*80)
    
    input("\nPress ENTER to start...")
    
    # Test 1: Real question generation
    real_test_questions()
    
    # Test 2: Real emotion detection
    print("\n\n")
    print("="*80)
    print("Next: Live Emotion Detection Test".center(80))
    print("="*80)
    input("\nPress ENTER when ready to use camera...")
    
    real_test_emotion_detection()
    
    print_section("✅ ALL REAL TESTS COMPLETED!", "=")
    print("You've seen:")
    print("  ✅ Real AI-generated questions from Google Gemini")
    print("  ✅ Real personalized feedback based on emotions")
    print("  ✅ Real-time emotion detection with detailed analysis")
    print("\n" + "="*80)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
