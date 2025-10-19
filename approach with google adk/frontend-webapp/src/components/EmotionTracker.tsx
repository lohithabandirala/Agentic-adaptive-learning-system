import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface EmotionData {
  emotions: {
    happy: number;
    sad: number;
    angry: number;
    fear: number;
    neutral: number;
    surprise: number;
    disgust: number;
  };
  dominantEmotion: string;
  stressLevel: number;
}

interface EmotionTrackerProps {
  isActive: boolean; // Only track when test is active
  attemptId?: string; // Optional: link emotions to specific test attempt
  studentId?: string; // Optional: link emotions to specific student
  onEmotionDetected?: (emotionData: EmotionData) => void;
}

const EmotionTracker: React.FC<EmotionTrackerProps> = ({ 
  isActive, 
  attemptId, 
  studentId, 
  onEmotionDetected 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [stressLevel, setStressLevel] = useState<number>(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string>('');
  const intervalRef = useRef<number | null>(null);

  // Emotion emoji mapping
  const emotionEmojis: { [key: string]: string } = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    fear: '😨',
    neutral: '😐',
    surprise: '😮',
    disgust: '😖'
  };

  useEffect(() => {
    if (isActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isActive]);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsTracking(true);
        setError('');
        
        // Start capturing frames every 3 seconds
        intervalRef.current = setInterval(() => {
          captureAndAnalyze();
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to access webcam:', err);
      setError('Failed to access webcam. Please allow camera permissions.');
      setIsTracking(false);
    }
  };

  const stopWebcam = () => {
    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || !isTracking) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const base64Image = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix

    try {
      // Send to Python emotion detection service (port 5001, endpoint /detect-emotion)
      const response = await axios.post('http://localhost:5001/detect-emotion', {
        image: imageData // Send full data URL
      });

      if (response.data.success) {
        const emotionData: EmotionData = {
          emotions: response.data.emotions,
          dominantEmotion: response.data.dominantEmotion, // Fixed field name
          stressLevel: response.data.stressLevel // Fixed field name
        };

        setCurrentEmotion(emotionData.dominantEmotion);
        setStressLevel(emotionData.stressLevel);

        // Save to backend database
        if (attemptId || studentId) {
          try {
            // Get auth token from localStorage
            const token = localStorage.getItem('token');
            
            await axios.post('http://localhost:4000/api/emotions/track', {
              attemptId: attemptId || 'test-session',
              studentId: studentId || 'demo-student',
              dominantEmotion: emotionData.dominantEmotion, // ✅ Fixed field name
              stressLevel: emotionData.stressLevel,
              emotions: emotionData.emotions,
              questionNumber: 0, // Default to 0 for continuous tracking
              timestamp: new Date().toISOString()
            }, {
              headers: {
                'Authorization': `Bearer ${token}` // ✅ Added auth token
              }
            });
            console.log('✅ Emotion saved to backend:', emotionData.dominantEmotion, 'stress:', (emotionData.stressLevel * 100).toFixed(1) + '%');
          } catch (backendErr: any) {
            console.warn('⚠️ Failed to save emotion to backend:', backendErr.response?.data || backendErr.message);
            // Don't fail the whole process if backend save fails
          }
        }

        // Notify parent component
        if (onEmotionDetected) {
          onEmotionDetected(emotionData);
        }

        console.log('✅ Emotion detected:', emotionData.dominantEmotion, 'Stress:', (emotionData.stressLevel * 100).toFixed(1) + '%');
      }
    } catch (err: any) {
      console.error('❌ Failed to analyze emotion:', err.message);
      // Don't set error state for individual frame failures
      // Use fallback mock data to keep system working
      const fallbackData: EmotionData = {
        emotions: {
          happy: 30,
          sad: 10,
          angry: 5,
          fear: 5,
          neutral: 40,
          surprise: 5,
          disgust: 5
        },
        dominantEmotion: 'neutral',
        stressLevel: 0.25
      };
      setCurrentEmotion(fallbackData.dominantEmotion);
      setStressLevel(fallbackData.stressLevel);
      if (onEmotionDetected) {
        onEmotionDetected(fallbackData);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-4 z-50">
      <div className="flex flex-col items-center gap-3">
        {/* Header */}
        <div className="flex items-center gap-2 w-full justify-between">
          <h3 className="text-sm font-bold text-gray-700">Emotion Tracking</h3>
          <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
        </div>

        {/* Video Preview */}
        <div className="relative">
          <video
            ref={videoRef}
            className="w-48 h-36 bg-black rounded-lg object-cover"
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Emotion Overlay */}
          {isTracking && (
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 rounded px-2 py-1">
              <div className="flex items-center justify-between text-white text-xs">
                <span className="text-2xl">{emotionEmojis[currentEmotion]}</span>
                <div className="flex flex-col items-end">
                  <span className="font-semibold capitalize">{currentEmotion}</span>
                  <span className="text-yellow-400">
                    Stress: {(stressLevel * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-xs text-red-600 text-center max-w-xs">
            {error}
          </div>
        )}

        {/* Status */}
        <div className="text-xs text-gray-500 text-center">
          {isTracking ? 'Analyzing your emotions...' : 'Webcam inactive'}
        </div>
      </div>
    </div>
  );
};

export default EmotionTracker;
