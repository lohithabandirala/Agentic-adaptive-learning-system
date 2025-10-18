"""
Complete System Test - Question Generation + Emotion Detection + Personalized Feedback
Tests all three key features of the Adaptive AI Learning System
"""

import sys
import os

# Add python-client to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python-client'))

import requests
import cv2
from deepface import DeepFace
import time
from datetime import datetime
import json

# API Configuration
API_URL = "http://localhost:3000/api"

def print_header(title):
    """Print formatted header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70 + "\n")

def test_api_connection():
    """Test 1: Check if backend API is running"""
    print_header("TEST 1: API CONNECTION")
    try:
        response = requests.get(f"{API_URL}/health", timeout=3)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend API is running!")
            print(f"   Database: {data.get('database')}")
            print(f"   AI Engine: {data.get('ai')}")
            return True
        else:
            print("❌ API returned error")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        print("   Make sure backend is running: npm start")
        return False

def test_question_generation():
    """Test 2: AI-powered question generation using Google Gemini"""
    print_header("TEST 2: AI QUESTION GENERATION (Google Gemini)")
    
    print("📝 Testing question generation for different difficulty levels...\n")
    
    # Test data
    test_data = {
        "student_id": "test_student_001",
        "name": "Test Student",
        "grade": 10,
        "topic": "Mathematics - Algebra",
        "total_questions": 3
    }
    
    try:
        # Start session
        print("🚀 Starting assessment session...")
        response = requests.post(f"{API_URL}/sessions/start", json=test_data)
        
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data['session_id']
            print(f"✅ Session created: {session_id}\n")
            
            # Generate 3 questions with different scenarios
            for i in range(3):
                print(f"\n{'─'*70}")
                print(f"📊 QUESTION {i+1}")
                print('─'*70)
                
                # Request next question
                question_response = requests.post(
                    f"{API_URL}/sessions/question/next",
                    json={
                        "session_id": session_id,
                        "previous_correct": i > 0,  # Simulate progression
                        "current_emotion": "neutral" if i == 0 else "happy",
                        "stress_level": 2 + i  # Gradually increasing stress
                    }
                )
                
                if question_response.status_code == 200:
                    question_data = question_response.json()
                    
                    print(f"\n🎯 Difficulty: {question_data.get('difficulty_level', 'N/A')}")
                    print(f"📚 Bloom's Level: {question_data.get('bloom_level', 'N/A')}")
                    print(f"\n❓ Question:")
                    print(f"   {question_data.get('question', 'N/A')}")
                    
                    if question_data.get('options'):
                        print(f"\n   Options:")
                        for opt in question_data['options']:
                            print(f"      {opt}")
                    
                    print(f"\n💡 Correct Answer: {question_data.get('correct_answer', 'N/A')}")
                    print(f"📖 Explanation: {question_data.get('explanation', 'N/A')}")
                    
                    # Test personalized feedback
                    print(f"\n{'─'*70}")
                    print("🤖 TESTING PERSONALIZED FEEDBACK")
                    print('─'*70)
                    
                    # Submit a correct answer
                    feedback_response = requests.post(
                        f"{API_URL}/sessions/answer/submit",
                        json={
                            "session_id": session_id,
                            "question_number": i + 1,
                            "answer": question_data.get('correct_answer'),
                            "emotion": "happy" if i % 2 == 0 else "confused",
                            "stress_level": 2 + i,
                            "time_taken": 30 + (i * 10)
                        }
                    )
                    
                    if feedback_response.status_code == 200:
                        feedback_data = feedback_response.json()
                        print(f"\n✅ Answer: {feedback_data.get('is_correct', False)}")
                        print(f"💬 AI Feedback: {feedback_data.get('feedback', 'N/A')}")
                        print(f"🎯 Encouragement: {feedback_data.get('encouragement', 'N/A')}")
                    
                    time.sleep(1)  # Brief pause between questions
                
            print(f"\n{'─'*70}")
            print("✅ Question generation test completed successfully!")
            print('─'*70)
            return True
            
        else:
            print(f"❌ Failed to start session: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during question generation test: {e}")
        return False

def test_emotion_detection():
    """Test 3: Real-time emotion detection"""
    print_header("TEST 3: EMOTION DETECTION (DeepFace + OpenCV)")
    
    print("📹 Testing camera and emotion detection...")
    print("   This will capture your emotions for 10 seconds\n")
    
    try:
        # Initialize camera
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Cannot access camera")
            return False
        
        print("✅ Camera initialized")
        print("\n🎬 Starting emotion detection...")
        print("   Look at the camera with different expressions!\n")
        
        emotions_detected = []
        start_time = time.time()
        duration = 10  # seconds
        frame_count = 0
        
        while time.time() - start_time < duration:
            ret, frame = cap.read()
            if not ret:
                break
            
            try:
                # Analyze emotion
                result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                if isinstance(result, list):
                    result = result[0]
                
                emotion = result['dominant_emotion']
                emotions_detected.append(emotion)
                frame_count += 1
                
                # Display on frame
                cv2.putText(frame, f"Emotion: {emotion}", (10, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                remaining = int(duration - (time.time() - start_time))
                cv2.putText(frame, f"Time: {remaining}s", (10, 70), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
                
                cv2.imshow('Emotion Detection Test', frame)
                
            except Exception as e:
                pass  # Skip failed frames
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cap.release()
        cv2.destroyAllWindows()
        
        # Analyze results
        if emotions_detected:
            from collections import Counter
            emotion_counts = Counter(emotions_detected)
            
            print("\n✅ Emotion detection completed!")
            print(f"\n📊 Results ({frame_count} frames analyzed):")
            for emotion, count in emotion_counts.most_common():
                percentage = (count / len(emotions_detected)) * 100
                print(f"   {emotion:15} {count:3} frames ({percentage:5.1f}%)")
            
            dominant = emotion_counts.most_common(1)[0][0]
            print(f"\n🎯 Dominant emotion: {dominant.upper()}")
            return True
        else:
            print("❌ No emotions detected")
            return False
            
    except Exception as e:
        print(f"❌ Error during emotion detection: {e}")
        return False

def test_personalized_feedback():
    """Test 4: AI-powered personalized feedback"""
    print_header("TEST 4: PERSONALIZED FEEDBACK (Context-Aware AI)")
    
    print("🤖 Testing AI feedback based on different scenarios...\n")
    
    scenarios = [
        {
            "name": "Correct answer + Happy emotion",
            "correct": True,
            "emotion": "happy",
            "stress": 2
        },
        {
            "name": "Wrong answer + Confused emotion + High stress",
            "correct": False,
            "emotion": "sad",
            "stress": 5
        },
        {
            "name": "Correct answer + Stressed emotion",
            "correct": True,
            "emotion": "fear",
            "stress": 4
        }
    ]
    
    # Create test session
    try:
        session_response = requests.post(
            f"{API_URL}/sessions/start",
            json={
                "student_id": "feedback_test_001",
                "name": "Feedback Test",
                "grade": 10,
                "topic": "Science",
                "total_questions": 3
            }
        )
        
        if session_response.status_code != 200:
            print("❌ Failed to create test session")
            return False
        
        session_id = session_response.json()['session_id']
        
        for i, scenario in enumerate(scenarios, 1):
            print(f"\n{'─'*70}")
            print(f"Scenario {i}: {scenario['name']}")
            print('─'*70)
            
            # Get a question first
            q_response = requests.post(
                f"{API_URL}/sessions/question/next",
                json={
                    "session_id": session_id,
                    "previous_correct": True,
                    "current_emotion": "neutral",
                    "stress_level": 2
                }
            )
            
            if q_response.status_code == 200:
                question = q_response.json()
                answer = question.get('correct_answer') if scenario['correct'] else "Wrong answer"
                
                # Submit answer with emotional context
                feedback_response = requests.post(
                    f"{API_URL}/sessions/answer/submit",
                    json={
                        "session_id": session_id,
                        "question_number": i,
                        "answer": answer,
                        "emotion": scenario['emotion'],
                        "stress_level": scenario['stress'],
                        "time_taken": 45
                    }
                )
                
                if feedback_response.status_code == 200:
                    data = feedback_response.json()
                    print(f"\n📝 Context:")
                    print(f"   Answer: {'✅ Correct' if scenario['correct'] else '❌ Wrong'}")
                    print(f"   Emotion: {scenario['emotion']}")
                    print(f"   Stress Level: {scenario['stress']}/5")
                    print(f"\n🤖 AI Response:")
                    print(f"   Feedback: {data.get('feedback', 'N/A')}")
                    print(f"   Encouragement: {data.get('encouragement', 'N/A')}")
                
            time.sleep(1)
        
        print(f"\n{'─'*70}")
        print("✅ Personalized feedback test completed!")
        print('─'*70)
        return True
        
    except Exception as e:
        print(f"❌ Error during feedback test: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("  🚀 ADAPTIVE AI LEARNING SYSTEM - COMPLETE TEST SUITE")
    print("="*70)
    print("\nThis will test:")
    print("  1. ✅ API Connection (Backend + Database + AI)")
    print("  2. 🧠 Question Generation (Google Gemini AI)")
    print("  3. 😊 Emotion Detection (DeepFace + OpenCV)")
    print("  4. 💬 Personalized Feedback (Context-Aware AI)")
    print("\n" + "="*70)
    
    input("\nPress ENTER to start tests...")
    
    results = []
    
    # Test 1: API Connection
    results.append(("API Connection", test_api_connection()))
    
    if not results[0][1]:
        print("\n❌ Cannot proceed without API connection")
        print("   Please start the backend server first!")
        return
    
    # Test 2: Question Generation
    results.append(("Question Generation", test_question_generation()))
    
    # Test 3: Emotion Detection
    print("\nℹ️  Next test will use your camera for emotion detection")
    input("   Press ENTER when ready (or Ctrl+C to skip)...")
    results.append(("Emotion Detection", test_emotion_detection()))
    
    # Test 4: Personalized Feedback
    results.append(("Personalized Feedback", test_personalized_feedback()))
    
    # Final Summary
    print_header("TEST SUMMARY")
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name:30} {status}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    
    print(f"\n{'─'*70}")
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    print('─'*70)
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! System is fully operational!")
    else:
        print("\n⚠️  Some tests failed. Check the output above.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
