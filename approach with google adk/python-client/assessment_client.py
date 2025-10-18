"""
Adaptive AI Assessment Client
Main interface for student assessments with emotion detection
"""

import requests
import time
import json
from datetime import datetime
from emotion_detector import EmotionDetector, verify_camera, test_deepface
from config import API_BASE_URL, DEFAULT_GRADE, DEFAULT_QUESTIONS


class AssessmentClient:
    def __init__(self):
        self.api_url = API_BASE_URL
        self.emotion_detector = EmotionDetector()
        self.session_id = None
        self.student_id = None
        
    def check_api_health(self):
        """Check if API is running"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=3)
            return response.status_code == 200
        except:
            return False
    
    def verify_systems(self):
        """Verify all systems are ready"""
        print("\n" + "="*60)
        print("🔍 SYSTEM READINESS CHECK")
        print("="*60 + "\n")
        
        all_ready = True
        
        # Check API
        print("1️⃣  Checking AI Service (MongoDB + Gemini)...")
        if self.check_api_health():
            print("   ✅ AI Service is running\n")
        else:
            print("   ❌ AI Service is NOT running!")
            print("   📝 Solution:")
            print("      cd \"approach with google adk\\backend\"")
            print("      npm install")
            print("      npm start\n")
            all_ready = False
        
        # Check Camera
        print("2️⃣  Checking Camera...")
        if verify_camera():
            print("   ✅ Camera is working\n")
        else:
            print("   ❌ Camera not accessible\n")
            all_ready = False
        
        # Check DeepFace
        print("3️⃣  Checking DeepFace Model...")
        print("   ⏳ Loading emotion detection model...")
        if test_deepface():
            print("   ✅ DeepFace model ready\n")
        else:
            print("   ❌ DeepFace model failed\n")
            all_ready = False
        
        print("="*60)
        if all_ready:
            print("✅ ALL SYSTEMS READY!")
        else:
            print("❌ SOME SYSTEMS NOT READY")
        print("="*60 + "\n")
        
        return all_ready
    
    def start_session(self, student_id, name, grade, topic, total_questions):
        """Start assessment session"""
        try:
            response = requests.post(
                f"{self.api_url}/sessions/start",
                json={
                    "student_id": student_id,
                    "name": name,
                    "grade": grade,
                    "topic": topic,
                    "total_questions": total_questions
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                self.session_id = data['session_id']
                self.student_id = student_id
                
                print(f"\n✅ Session started: {self.session_id}")
                
                # Show student profile if available
                if data.get('profile'):
                    profile = data['profile']
                    print(f"\n📊 Student Profile:")
                    print(f"   Total Sessions: {profile.get('totalSessions', 0)}")
                    print(f"   Total Questions: {profile.get('totalQuestions', 0)}")
                    if profile.get('totalQuestions', 0) > 0:
                        print(f"   Overall Accuracy: {profile.get('accuracy', 0):.1f}%")
                
                return True
            else:
                print(f"❌ Error starting session: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def get_next_question(self, topic, emotion_data, question_number):
        """Get next question from AI"""
        try:
            response = requests.post(
                f"{self.api_url}/sessions/question/next",
                json={
                    "session_id": self.session_id,
                    "student_id": self.student_id,
                    "topic": topic,
                    "emotion_data": emotion_data,
                    "question_number": question_number
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('reasoning'):
                    print(f"\n🤖 AI Reasoning: {data['reasoning']}")
                return data.get('question')
            else:
                print(f"❌ Error getting question: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def submit_answer(self, question, student_answer, emotion_data, time_taken):
        """Submit answer and get feedback"""
        try:
            response = requests.post(
                f"{self.api_url}/sessions/answer/submit",
                json={
                    "session_id": self.session_id,
                    "student_id": self.student_id,
                    "topic": question['topic'],
                    "question_number": question.get('number', 1),
                    "question_text": question['question'],
                    "question_type": question['type'],
                    "options": question.get('options', []),
                    "difficulty_level": question['difficulty'],
                    "bloom_level": question['bloomLevel'],
                    "student_answer": student_answer,
                    "correct_answer": question['correctAnswer'],
                    "emotion_data": emotion_data,
                    "time_taken_seconds": time_taken,
                    "ai_reasoning": question.get('reasoning')
                },
                timeout=20
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Error submitting answer: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def complete_session(self, all_emotions, all_stress):
        """Complete session and get AI summary"""
        try:
            avg_stress = sum(all_stress) / len(all_stress) if all_stress else 0
            
            emotion_counts = {}
            for emotion in all_emotions:
                emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            dominant_emotion = max(emotion_counts, key=emotion_counts.get) if emotion_counts else 'neutral'
            
            response = requests.post(
                f"{self.api_url}/sessions/complete",
                json={
                    "session_id": self.session_id,
                    "student_id": self.student_id,
                    "average_stress": avg_stress,
                    "dominant_emotion": dominant_emotion
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Error completing session: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def display_question(self, question, question_number, total_questions):
        """Display question in formatted way"""
        print("\n" + "="*60)
        print(f"QUESTION {question_number} OF {total_questions}")
        print("="*60 + "\n")
        print(f"📚 Topic: {question.get('topic', 'N/A')}")
        print(f"🎯 Difficulty: {question['difficulty']}/5")
        print(f"🧠 Bloom Level: {question['bloomLevel']}")
        print(f"📝 Type: {question['type']}\n")
        print("-" * 60)
        print(f"❓ {question['question']}")
        print("-" * 60 + "\n")
        
        if question.get('options'):
            for option in question['options']:
                print(f"  {option}")
            print()
    
    def display_feedback(self, feedback_data):
        """Display AI feedback"""
        print("\n" + "="*60)
        print("📊 AI FEEDBACK")
        print("="*60)
        
        feedback = feedback_data.get('feedback', {})
        is_correct = feedback_data.get('is_correct', False)
        
        print(f"\n{'✅ Correct!' if is_correct else '❌ Incorrect'}")
        print(f"\n💬 {feedback.get('feedback', '')}")
        print(f"💡 {feedback.get('encouragement', '')}")
        print(f"\n📖 {feedback.get('explanation', '')}")
        
        if not is_correct and feedback.get('misconception'):
            print(f"\n🔍 Common Misconception: {feedback['misconception']}")
        
        if feedback.get('nextStep'):
            print(f"\n🎯 Next Step: {feedback['nextStep']}")
        
        print("="*60)
    
    def run_assessment(self):
        """Main assessment flow"""
        print("\n" + "="*60)
        print("ADAPTIVE AI LEARNING SYSTEM")
        print("MongoDB + Google Gemini + Emotion Detection")
        print("="*60 + "\n")
        
        # Verify systems
        if not self.verify_systems():
            print("\n⚠️  Please fix issues before continuing.")
            retry = input("\nRetry system check? (y/n): ").strip().lower()
            if retry == 'y':
                return self.run_assessment()
            else:
                print("\n👋 Exiting...")
                return
        
        # Get student info
        print("\n" + "="*60)
        print("STUDENT INFORMATION")
        print("="*60 + "\n")
        
        topic = input("📚 Enter topic: ").strip()
        if not topic:
            print("❌ Topic is required")
            return
        
        student_id = input(f"👤 Student ID (default '315'): ").strip() or "315"
        name = input("👤 Student Name: ").strip() or f"Student {student_id}"
        grade = input(f"📊 Grade (default {DEFAULT_GRADE}): ").strip()
        grade = int(grade) if grade else DEFAULT_GRADE
        
        num_questions = input(f"❓ Number of questions (default {DEFAULT_QUESTIONS}): ").strip()
        num_questions = int(num_questions) if num_questions else DEFAULT_QUESTIONS
        
        # Start session
        if not self.start_session(student_id, name, grade, topic, num_questions):
            print("❌ Failed to start session")
            return
        
        # Initialize emotion detector
        if not self.emotion_detector.initialize_camera():
            print("❌ Failed to initialize camera")
            return
        
        print(f"\n🚀 Starting {num_questions}-question assessment on '{topic}'...")
        print("="*60)
        
        all_emotions = []
        all_stress = []
        
        try:
            for q_num in range(1, num_questions + 1):
                # Get previous emotion data if available
                prev_emotion = all_emotions[-1] if all_emotions else {}
                
                # Get question
                print(f"\n📡 Generating Question #{q_num}...")
                question = self.get_next_question(topic, prev_emotion, q_num)
                
                if not question:
                    print("❌ Could not generate question")
                    continue
                
                question['number'] = q_num
                
                # Display question
                self.display_question(question, q_num, num_questions)
                
                # Start emotion detection
                print("="*60)
                print("📹 Starting silent emotion monitoring...")
                print("💡 Take your time to think and respond")
                print("="*60 + "\n")
                
                detection_thread = self.emotion_detector.start_detection(q_num)
                
                # Get answer
                start_time = time.time()
                student_answer = input("📝 Your answer: ").strip()
                time_taken = int(time.time() - start_time)
                
                # Stop emotion detection
                self.emotion_detector.stop_detection()
                detection_thread.join(timeout=2)
                
                emotion_data = self.emotion_detector.get_emotion_data()
                
                # Show emotion summary
                if emotion_data:
                    print(f"\n📊 Emotion: {emotion_data.get('emotion', 'unknown')}")
                    print(f"📊 Stress Level: {emotion_data.get('stressLevel', 0)}/5")
                    print(f"📊 Frames Analyzed: {emotion_data.get('frameCount', 0)}\n")
                    
                    all_emotions.append(emotion_data)
                    all_stress.append(emotion_data.get('stressLevel', 3))
                
                # Submit and get feedback
                feedback_data = self.submit_answer(question, student_answer, emotion_data, time_taken)
                
                if feedback_data:
                    self.display_feedback(feedback_data)
                
                if q_num < num_questions:
                    time.sleep(1)
            
            # Complete session
            print("\n\n" + "="*60)
            print("📊 GENERATING AI-POWERED SESSION SUMMARY...")
            print("="*60)
            
            completion_data = self.complete_session(all_emotions, all_stress)
            
            if completion_data:
                summary = completion_data.get('summary', {})
                session = completion_data.get('session', {})
                
                print("\n" + "="*60)
                print("🎓 SESSION SUMMARY")
                print("="*60)
                print(f"\nAccuracy: {session.get('accuracy', 0)}%")
                print(f"Questions Answered: {session.get('questions_answered', 0)}")
                print(f"Correct Answers: {session.get('correct_answers', 0)}")
                
                if summary:
                    print(f"\n📊 Performance: {summary.get('performanceSummary', 'N/A')}")
                    print(f"\n😊 Emotional Journey: {summary.get('emotionalJourney', 'N/A')}")
                    
                    if summary.get('keyAchievements'):
                        print("\n🎯 Key Achievements:")
                        for achievement in summary['keyAchievements']:
                            print(f"  ✅ {achievement}")
                    
                    if summary.get('areasForImprovement'):
                        print("\n📈 Areas for Improvement:")
                        for area in summary['areasForImprovement']:
                            print(f"  📌 {area}")
                    
                    if summary.get('personalizedEncouragement'):
                        print(f"\n💪 {summary['personalizedEncouragement']}")
                
                print("\n" + "="*60)
            
            print(f"\n✅ Assessment complete! Session ID: {self.session_id}")
            print(f"📊 All data saved to MongoDB for future personalization\n")
            
        finally:
            # Clean up
            self.emotion_detector.release_camera()


def main():
    """Main entry point"""
    client = AssessmentClient()
    
    try:
        client.run_assessment()
    except KeyboardInterrupt:
        print("\n\n⚠️  Assessment interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        if client.emotion_detector:
            client.emotion_detector.release_camera()


if __name__ == "__main__":
    main()
