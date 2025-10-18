"""
Quick AI Test - Verify Gemini is working
"""
import requests
import json

API_URL = "http://localhost:3000/api"

print("="*80)
print("Testing Google Gemini AI Integration".center(80))
print("="*80)

# Start a session
print("\n1. Starting assessment session...")
response = requests.post(
    f"{API_URL}/sessions/start",
    json={
        "student_id": "QUICK_TEST",
        "name": "Quick Test",
        "grade": 10,
        "topic": "Python Programming",
        "total_questions": 1
    }
)

if response.status_code == 200:
    session_id = response.json()['session_id']
    print(f"✅ Session created: {session_id}")
    
    # Get a question
    print("\n2. Requesting AI-generated question...")
    q_response = requests.post(
        f"{API_URL}/sessions/question/next",
        json={
            "session_id": session_id,
            "current_emotion": "neutral",
            "stress_level": 2
        }
    )
    
    if q_response.status_code == 200:
        question = q_response.json()
        print("\n" + "="*80)
        print("✅ AI GENERATED QUESTION SUCCESSFULLY!")
        print("="*80)
        print(f"\nQuestion: {question.get('question', 'N/A')}")
        print(f"Type: {question.get('question_type', 'N/A')}")
        print(f"Difficulty: {question.get('difficulty_level', 'N/A')}")
        print(f"\nOptions:")
        for opt in question.get('options', []):
            print(f"  - {opt}")
        print(f"\nCorrect Answer: {question.get('correct_answer', 'N/A')}")
        print(f"Explanation: {question.get('explanation', 'N/A')}")
        print("\n" + "="*80)
        print("🎉 Google Gemini AI is working perfectly!")
        print("="*80)
    else:
        print(f"\n❌ Failed to get question:")
        print(json.dumps(q_response.json(), indent=2))
else:
    print(f"❌ Failed to start session: {response.text}")
