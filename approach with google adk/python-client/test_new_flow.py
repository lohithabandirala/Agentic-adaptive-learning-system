"""
Test Client for NEW Question-Set Flow with Parallel Emotion Detection

NEW FLOW:
1. Generate 5 questions at once
2. For each question:
   - Display question + start timer
   - Start emotion detection (parallel with timer)
   - User answers
   - Stop emotion detection
   - Submit answer + emotion analytics
3. After 5 questions, agent analyzes all data
4. Generate next 5 questions (adapted)
"""

import requests
import time
from emotion_tracker import EmotionTracker, QuestionSetTracker
from config import API_BASE_URL


class NewFlowTestClient:
    """Test client for question-set-based adaptive learning"""
    
    def __init__(self, base_url=API_BASE_URL):
        self.base_url = base_url
        self.session_id = None
        self.student_id = None
        self.questions_answered = 0
        self.set_tracker = QuestionSetTracker()
    
    def register_student(self, name, grade, subject):
        """Register a new student"""
        print(f"\n📝 Registering student: {name}")
        
        response = requests.post(f"{self.base_url}/students/register", json={
            "name": name,
            "grade": grade,
            "initial_subject": subject
        })
        
        if response.status_code == 201:
            data = response.json()
            self.student_id = data['student_id']
            print(f"✅ Student registered: {self.student_id}")
            return True
        else:
            print(f"❌ Failed to register student: {response.text}")
            return False
    
    def start_session(self, subject):
        """Start assessment session"""
        print(f"\n🎯 Starting assessment session for {subject}")
        
        response = requests.post(f"{self.base_url}/sessions/start", json={
            "student_id": self.student_id,
            "subject": subject
        })
        
        if response.status_code == 200:
            data = response.json()
            self.session_id = data['session_id']
            print(f"✅ Session started: {self.session_id}")
            return True
        else:
            print(f"❌ Failed to start session: {response.text}")
            return False
    
    def generate_question_set(self, topic, count=5):
        """
        Generate a set of questions (NEW FLOW)
        
        Args:
            topic: Subject topic
            count: Number of questions (default: 5)
        
        Returns:
            list: Question set or None
        """
        print(f"\n🤖 Generating question set ({count} questions) with ADK Agent...")
        
        response = requests.post(f"{self.base_url}/sessions/questionset/generate", json={
            "session_id": self.session_id,
            "student_id": self.student_id,
            "topic": topic,
            "count": count
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Received {data['totalQuestions']} questions (Set #{data['setNumber']})")
            print(f"🧠 Agent Reasoning: {data.get('reasoning', 'N/A')[:200]}...")
            print(f"🔄 Agent Iterations: {data.get('iterations', 'N/A')}")
            return data['questionSet']
        else:
            print(f"❌ Failed to generate question set: {response.text}")
            return None
    
    def ask_question_with_emotion_tracking(self, question, question_num):
        """
        Display question and track emotions while user answers (NEW FLOW)
        
        Args:
            question: Question data dict
            question_num: Question number (1-5)
        
        Returns:
            tuple: (user_answer, emotion_analytics, time_spent)
        """
        print(f"\n{'='*60}")
        print(f"📋 QUESTION {question_num}/5")
        print(f"{'='*60}")
        print(f"\n{question['question']}\n")
        
        for i, option in enumerate(question['options']):
            print(f"{chr(65+i)}) {option}")
        
        print(f"\n🎚️ Difficulty: {question['difficulty']}")
        print(f"📚 Topic: {question['topic']}")
        
        # Initialize emotion tracker
        emotion_tracker = EmotionTracker(capture_interval=2.0)
        
        # Start emotion tracking + timer (PARALLEL)
        print(f"\n⏱️ Timer started | 📹 Emotion detection started (parallel)")
        start_time = time.time()
        
        if not emotion_tracker.start():
            print("⚠️ Emotion tracker failed to start, continuing without it")
            emotion_analytics = None
        
        # Get user answer
        user_answer = input("\n👉 Your answer (A/B/C/D): ").strip().upper()
        
        # Stop timer + emotion tracking
        end_time = time.time()
        time_spent = end_time - start_time
        
        emotion_analytics = emotion_tracker.stop()
        
        print(f"\n⏱️ Time spent: {time_spent:.2f}s")
        
        if emotion_analytics and emotion_analytics.get('success'):
            print(f"😊 Dominant emotion: {emotion_analytics['dominant_emotion']}")
            print(f"😰 Average stress: {emotion_analytics['average_stress']:.3f}")
            print(f"📊 Samples collected: {emotion_analytics['samples_count']}")
        
        return user_answer, emotion_analytics, time_spent
    
    def submit_answer(self, question, user_answer, emotion_analytics, time_spent):
        """
        Submit answer with emotion analytics
        
        Args:
            question: Question data
            user_answer: User's answer (A/B/C/D)
            emotion_analytics: Emotion data from tracker
            time_spent: Time in seconds
        
        Returns:
            bool: Whether answer was correct
        """
        # Prepare emotion data for backend
        emotion_data = None
        if emotion_analytics and emotion_analytics.get('success'):
            emotion_data = {
                'dominant_emotion': str(emotion_analytics['dominant_emotion']),
                'average_stress': float(emotion_analytics['average_stress']),
                'peak_stress': float(emotion_analytics['peak_stress']),
                'stress_stability': float(emotion_analytics['stress_stability']),
                'emotion_distribution': {k: int(v) for k, v in emotion_analytics['emotion_distribution'].items()},
                'samples_count': int(emotion_analytics['samples_count'])
            }
        
        # Submit to backend
        response = requests.post(f"{self.base_url}/sessions/answer/submit", json={
            "session_id": self.session_id,
            "student_id": self.student_id,
            "question": question['question'],
            "options": question['options'],
            "correct_answer": question['correctAnswer'],
            "user_answer": user_answer,
            "difficulty": question['difficulty'],
            "topic": question['topic'],
            "time_spent": time_spent,
            "emotion_data": emotion_data
        })
        
        if response.status_code == 200:
            data = response.json()
            is_correct = data['is_correct']
            
            if is_correct:
                print("✅ Correct!")
            else:
                print(f"❌ Incorrect. Correct answer: {question['correctAnswer']}")
            
            print(f"💡 Explanation: {question['explanation']}")
            
            self.questions_answered += 1
            return is_correct
        else:
            print(f"⚠️ Failed to submit answer: {response.text}")
            return False
    
    def complete_session(self):
        """Complete assessment session"""
        print(f"\n🏁 Completing session...")
        
        response = requests.post(f"{self.base_url}/sessions/complete", json={
            "session_id": self.session_id,
            "student_id": self.student_id
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n{'='*60}")
            print(f"📊 SESSION SUMMARY")
            print(f"{'='*60}")
            print(f"Questions Answered: {data.get('questions_answered', 'N/A')}")
            print(f"Correct Answers: {data.get('correct_answers', 'N/A')}")
            print(f"Accuracy: {data.get('accuracy', 'N/A')}%")
            print(f"Average Time: {data.get('average_time', 'N/A')}s")
            
            if data.get('adk_agent'):
                print(f"\n🤖 ADK Agent Analysis:")
                print(f"{data.get('agent_summary', 'N/A')}")
            
            return True
        else:
            print(f"❌ Failed to complete session: {response.text}")
            return False
    
    def run_question_set(self, topic, set_number=1):
        """
        Run one complete question set (5 questions) - NEW FLOW
        
        Args:
            topic: Subject topic
            set_number: Set number (1, 2, 3, ...)
        
        Returns:
            bool: Success status
        """
        print(f"\n{'#'*60}")
        print(f"🎯 QUESTION SET #{set_number}")
        print(f"{'#'*60}")
        
        # Step 1: Generate 5 questions
        questions = self.generate_question_set(topic, count=5)
        if not questions:
            return False
        
        # Start set tracking
        self.set_tracker.start_set()
        
        # Step 2: Loop through questions
        for i, question in enumerate(questions, start=1):
            # Display question + track emotions (parallel with timer)
            user_answer, emotion_analytics, time_spent = self.ask_question_with_emotion_tracking(
                question, i
            )
            
            # Submit answer + emotions
            is_correct = self.submit_answer(question, user_answer, emotion_analytics, time_spent)
            
            # Add to set tracker
            if emotion_analytics:
                self.set_tracker.add_question_analytics(i, emotion_analytics)
            
            # Pause before next question
            if i < len(questions):
                print("\n⏳ Next question in 2 seconds...")
                time.sleep(2)
        
        # Complete set
        set_analytics = self.set_tracker.complete_set()
        
        if set_analytics.get('success'):
            print(f"\n{'='*60}")
            print(f"📊 SET #{set_number} SUMMARY")
            print(f"{'='*60}")
            print(f"Total Duration: {set_analytics['total_duration']:.2f}s")
            print(f"Average Stress: {set_analytics['set_average_stress']:.3f}")
            print(f"Emotion Distribution: {set_analytics['set_emotion_distribution']}")
        
        return True
    
    def run_full_test(self, name, grade, subject, topic, num_sets=2):
        """
        Run complete test with multiple question sets
        
        Args:
            name: Student name
            grade: Student grade
            subject: Subject
            topic: Topic
            num_sets: Number of question sets to run (default: 2, i.e., 10 questions)
        """
        print(f"\n{'#'*60}")
        print(f"🚀 NEW FLOW TEST - ADAPTIVE LEARNING WITH EMOTION DETECTION")
        print(f"{'#'*60}")
        
        # Register student
        if not self.register_student(name, grade, subject):
            return
        
        # Start session
        if not self.start_session(subject):
            return
        
        # Run question sets
        for set_num in range(1, num_sets + 1):
            if not self.run_question_set(topic, set_num):
                break
            
            # Ask if user wants to continue to next set
            if set_num < num_sets:
                print(f"\n{'='*60}")
                continue_choice = input("📋 Do you want to continue to the next set of questions? (yes/no): ").strip().lower()
                
                if continue_choice not in ['yes', 'y']:
                    print("\n🛑 Stopping test. Completing session...")
                    break
                
                print(f"\n⏳ Starting next set...")
                time.sleep(1)
        
        # Complete session
        self.complete_session()
        
        print(f"\n{'='*60}")
        print(f"✅ TEST COMPLETED")
        print(f"{'='*60}")


def main():
    """Main test function"""
    client = NewFlowTestClient()
    
    # Run full test: Start with 1 set, ask user if they want more
    # User can continue as many times as they want
    client.run_full_test(
        name="Test Student",
        grade=9,
        subject="Biology",
        topic="Cell Biology",
        num_sets=10  # Maximum sets, but user can stop anytime
    )


if __name__ == "__main__":
    main()
