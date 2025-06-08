
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Clock, Users, X } from 'lucide-react';
import { useWaitingList } from '@/hooks/useWaitingList';

interface QueueSystemProps {
  eventId: string;
  onComplete: () => void;
  onLeave: () => void;
}

const QueueSystem: React.FC<QueueSystemProps> = ({ eventId, onComplete, onLeave }) => {
  const { waitingListEntry, leaveWaitingList } = useWaitingList(eventId);
  const [estimatedWait, setEstimatedWait] = useState(0);

  useEffect(() => {
    if (waitingListEntry) {
      // Calculate estimated wait (3 minutes per person ahead)
      const waitTime = Math.max(0, (waitingListEntry.position - 1) * 3 * 60);
      setEstimatedWait(waitTime);
    }
  }, [waitingListEntry]);

  useEffect(() => {
    // Check if user has been offered tickets
    if (waitingListEntry?.status === 'offered') {
      onComplete();
    }
  }, [waitingListEntry?.status, onComplete]);

  useEffect(() => {
    // Update estimated wait time every 30 seconds
    const interval = setInterval(() => {
      setEstimatedWait(prev => Math.max(0, prev - 30));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLeaveQueue = async () => {
    const success = await leaveWaitingList();
    if (success) {
      onLeave();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = waitingListEntry ? Math.max(0, 100 - (waitingListEntry.position / 10) * 100) : 0;

  if (!waitingListEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Loading queue status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-between items-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLeaveQueue}
              className="text-gray-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl">You're in the Queue</CardTitle>
          <p className="text-gray-600">Please wait while we process other customers</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Queue Position */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              #{waitingListEntry.position}
            </div>
            <p className="text-gray-600">in queue</p>
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

          {/* Status */}
          <div className="text-center">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              waitingListEntry.status === 'waiting' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {waitingListEntry.status === 'waiting' ? 'Waiting' : 'Processing'}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">While you wait:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep this tab open</li>
              <li>• Don't refresh the page</li>
              <li>• You'll be automatically notified when it's your turn</li>
            </ul>
          </div>

          {/* Queue Stats */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {Math.max(0, waitingListEntry.position - 1)}
              </div>
              <div className="text-xs text-gray-600">Ahead of you</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">~3</div>
              <div className="text-xs text-gray-600">Min per person</div>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handleLeaveQueue}
            className="w-full"
          >
            Leave Queue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueSystem;
