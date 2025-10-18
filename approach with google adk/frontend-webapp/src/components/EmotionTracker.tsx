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
  onEmotionDetected?: (emotionData: EmotionData) => void;
}

const EmotionTracker: React.FC<EmotionTrackerProps> = ({ isActive, onEmotionDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [stressLevel, setStressLevel] = useState<number>(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      // Send to Python emotion detection service
      const response = await axios.post('http://localhost:5000/analyze', {
        image: base64Image
      });

      if (response.data.success) {
        const emotionData: EmotionData = {
          emotions: response.data.emotions,
          dominantEmotion: response.data.dominant_emotion,
          stressLevel: response.data.stress_level
        };

        setCurrentEmotion(emotionData.dominantEmotion);
        setStressLevel(emotionData.stressLevel);

        // Notify parent component
        if (onEmotionDetected) {
          onEmotionDetected(emotionData);
        }

        console.log('Emotion detected:', emotionData);
      }
    } catch (err) {
      console.error('Failed to analyze emotion:', err);
      // Don't set error state for individual frame failures
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
