import React from 'react';
import ProgressBar from './ProgressBar';

interface QuizHeaderProps {
  onBack: () => void;
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  timeElapsed?: number;
  categoryName?: string;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  onBack,
  currentQuestion,
  totalQuestions,
  score,
  timeElapsed,
  categoryName,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
      <div className="max-w-md mx-auto p-4">
        {/* Top Row - Back Button and Category */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-navy text-xl">←</span>
          </button>
          
          {categoryName && (
            <h1 className="text-sm font-semibold text-navy text-center flex-1 px-2">
              {categoryName}
            </h1>
          )}
          
          <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <ProgressBar
            current={currentQuestion}
            total={totalQuestions}
            label="Quiz Progress"
            showPercentage={false}
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-sm">
          {/* Question Number */}
          <div className="flex items-center space-x-2">
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Q{currentQuestion}
            </span>
            <span className="text-gray-600">of {totalQuestions}</span>
          </div>

          {/* Score */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Score:</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              {score}
            </span>
          </div>

          {/* Timer */}
          {timeElapsed !== undefined && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Time:</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium font-mono">
                {formatTime(timeElapsed)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizHeader;