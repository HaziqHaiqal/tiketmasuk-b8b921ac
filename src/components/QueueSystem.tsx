
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Users } from 'lucide-react';

interface QueueSystemProps {
  position: number;
  onComplete: () => void;
}

const QueueSystem: React.FC<QueueSystemProps> = ({ position, onComplete }) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [estimatedWait, setEstimatedWait] = useState(position * 30); // 30 seconds per person
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPosition(prev => {
        const newPosition = Math.max(0, prev - 1);
        if (newPosition === 0) {
          setTimeout(onComplete, 1000);
        }
        return newPosition;
      });
      
      setEstimatedWait(prev => Math.max(0, prev - 30));
      setProgress(prev => Math.min(100, prev + (100 / position)));
    }, 3000); // Move forward every 3 seconds for demo

    return () => clearInterval(interval);
  }, [position, onComplete]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">You're in the Queue</CardTitle>
          <p className="text-gray-600">Please wait while we process other customers</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Queue Position */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {currentPosition === 0 ? 'Next!' : `#${currentPosition}`}
            </div>
            <p className="text-gray-600">
              {currentPosition === 0 ? 'Redirecting you now...' : 'in queue'}
            </p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Estimated Wait Time */}
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Estimated wait: {formatTime(estimatedWait)}</span>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">While you wait:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep this tab open</li>
              <li>• Don't refresh the page</li>
              <li>• You'll be automatically redirected</li>
            </ul>
          </div>

          {/* Queue Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">{Math.max(0, currentPosition - 5)}</div>
              <div className="text-xs text-gray-600">Behind you</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">~2-3</div>
              <div className="text-xs text-gray-600">Min per person</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueSystem;
