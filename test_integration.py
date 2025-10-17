"""
Test script to verify the integrated emotion assessment system
This script tests the integration without requiring webcam input
"""

import requests
import json
from datetime import datetime

# Configuration
AI_SERVICE_URL = "http://localhost:3000/api/generate-questions-with-emotion"

def test_ai_service_connection():
    """Test if AI service is running and accessible"""
    print("\n" + "=" * 60)
    print("TEST 1: AI Service Connection")
    print("=" * 60)
    
    try:
        response = requests.get("http://localhost:3000/api/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print("✅ AI Service is running!")
            print(f"   Status: {result.get('message')}")
            print(f"   Timestamp: {result.get('timestamp')}")
            return True
        else:
            print(f"❌ AI Service returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to AI service at http://localhost:3000")
        print("   Please start the AI service first:")
        print("   1. cd 'ai service'")
        print("   2. npm start")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_emotion_based_question_generation():
    """Test question generation with simulated emotion data"""
    print("\n" + "=" * 60)
    print("TEST 2: Emotion-Based Question Generation")
    print("=" * 60)
    
    # Simulated emotion data (happy, low stress)
    mock_emotion_data = {
        "analysis_duration_seconds": 20.5,
        "total_frames_analyzed": 150,
        "start_time": datetime.now().isoformat(),
        "end_time": datetime.now().isoformat(),
        "overall_dominant_emotion": "happy",
        "dominant_emotion_percentages": {
            "happy": 65.5,
            "neutral": 20.3,
            "surprise": 10.2,
            "sad": 2.0,
            "angry": 1.5,
            "fear": 0.3,
            "disgust": 0.2
        },
        "average_emotion_scores": {
            "happy": 72.4,
            "neutral": 15.8,
            "surprise": 8.2,
            "sad": 1.8,
            "angry": 1.0,
            "fear": 0.5,
            "disgust": 0.3
        },
        "stress_level": 2
    }
    
    # Prepare request payload
    payload = {
        "topic": "Python Programming",
        "studentData": {
            "studentId": "test_student_001",
            "grade": "10",
            "subject": "Computer Science",
            "emotionalState": {
                "overallEmotion": mock_emotion_data["overall_dominant_emotion"],
                "emotionBreakdown": mock_emotion_data["dominant_emotion_percentages"],
                "stressLevel": mock_emotion_data["stress_level"],
                "analysisTimestamp": mock_emotion_data["end_time"]
            }
        },
        "emotionData": mock_emotion_data,
        "questionCount": 3
    }
    
    print("\nSending request with:")
    print(f"  Topic: Python Programming")
    print(f"  Dominant Emotion: {mock_emotion_data['overall_dominant_emotion']}")
    print(f"  Stress Level: {mock_emotion_data['stress_level']}/5")
    print(f"  Question Count: 3")
    
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
                print("\n✅ Questions generated successfully!")
                
                questions_data = result.get('data', {})
                questions = questions_data.get('questions', [])
                
                print(f"\nTotal Questions: {len(questions)}")
                
                for i, q in enumerate(questions, 1):
                    print(f"\n--- Question {i} ---")
                    print(f"Topic: {q.get('topic', 'N/A')}")
                    print(f"Difficulty: {q.get('difficulty', 'N/A')}/5")
                    print(f"Bloom Level: {q.get('bloomLevel', 'N/A')}")
                    print(f"Type: {q.get('type', 'N/A')}")
                    print(f"Question: {q.get('questionText', 'N/A')[:100]}...")
                
                # Save test output
                output_file = f"test_output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                with open(output_file, 'w') as f:
                    json.dump({
                        "emotionData": mock_emotion_data,
                        "questionsResult": result
                    }, f, indent=2)
                
                print(f"\n✅ Test output saved to: {output_file}")
                return True
            else:
                print(f"\n❌ Question generation failed!")
                print(f"Error: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"\n❌ Server returned status code: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

def test_high_stress_adaptation():
    """Test question generation with high stress emotion data"""
    print("\n" + "=" * 60)
    print("TEST 3: High Stress Adaptation")
    print("=" * 60)
    
    # Simulated high stress emotion data
    mock_emotion_data = {
        "analysis_duration_seconds": 20.5,
        "total_frames_analyzed": 150,
        "overall_dominant_emotion": "fear",
        "dominant_emotion_percentages": {
            "fear": 45.0,
            "sad": 25.0,
            "angry": 15.0,
            "neutral": 10.0,
            "happy": 5.0
        },
        "average_emotion_scores": {
            "fear": 55.0,
            "sad": 30.0,
            "angry": 20.0,
            "neutral": 12.0,
            "happy": 5.0
        },
        "stress_level": 5
    }
    
    payload = {
        "topic": "Mathematics",
        "studentData": {
            "studentId": "test_student_002",
            "emotionalState": {
                "overallEmotion": mock_emotion_data["overall_dominant_emotion"],
                "stressLevel": mock_emotion_data["stress_level"]
            }
        },
        "emotionData": mock_emotion_data,
        "questionCount": 2
    }
    
    print(f"\nTesting with high stress scenario:")
    print(f"  Dominant Emotion: {mock_emotion_data['overall_dominant_emotion']}")
    print(f"  Stress Level: {mock_emotion_data['stress_level']}/5")
    print(f"  Expected: Easier, supportive questions")
    
    try:
        response = requests.post(AI_SERVICE_URL, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                questions_data = result.get('data', {})
                questions = questions_data.get('questions', [])
                
                print(f"\n✅ Generated {len(questions)} questions")
                
                # Check if questions are adapted (lower difficulty expected)
                avg_difficulty = sum(q.get('difficulty', 3) for q in questions) / len(questions) if questions else 0
                print(f"   Average Difficulty: {avg_difficulty:.1f}/5")
                
                if avg_difficulty <= 3:
                    print("   ✅ Questions appropriately adapted for high stress")
                else:
                    print("   ⚠️  Questions may not be fully adapted")
                
                return True
            else:
                print(f"❌ Failed: {result.get('error')}")
                return False
        else:
            print(f"❌ Status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all integration tests"""
    print("\n" + "=" * 60)
    print("INTEGRATED EMOTION ASSESSMENT SYSTEM - TEST SUITE")
    print("=" * 60)
    print("\nThis will test the integration without requiring a webcam.")
    print("Make sure the AI service is running before proceeding.")
    
    input("\nPress Enter to start tests...")
    
    # Run tests
    results = []
    
    # Test 1: Connection
    results.append(("AI Service Connection", test_ai_service_connection()))
    
    # Only continue if AI service is available
    if results[0][1]:
        # Test 2: Normal emotion-based generation
        results.append(("Question Generation (Low Stress)", test_emotion_based_question_generation()))
        
        # Test 3: High stress adaptation
        results.append(("Question Generation (High Stress)", test_high_stress_adaptation()))
    else:
        print("\n⚠️  Skipping remaining tests - AI service not available")
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    total_tests = len(results)
    passed_tests = sum(1 for _, passed in results if passed)
    
    print("\n" + "=" * 60)
    print(f"TOTAL: {passed_tests}/{total_tests} tests passed")
    print("=" * 60)
    
    if passed_tests == total_tests:
        print("\n🎉 All tests passed! Integration is working correctly.")
        print("\nYou can now run the full system:")
        print("  python integrated_emotion_assessment.py")
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        print("\nCommon fixes:")
        print("  1. Make sure AI service is running: cd 'ai service' && npm start")
        print("  2. Check .env file has valid GOOGLE_CLOUD_API_KEY")
        print("  3. Verify all dependencies are installed")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
