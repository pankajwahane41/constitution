import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label = 'Progress',
  showPercentage = true,
}) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      {/* Label and Numbers */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {showPercentage && (
          <span className="text-sm font-bold text-navy">{current}/{total}</span>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
        <div
          className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-30 animate-pulse"></div>
        </div>
      </div>
      
      {/* Percentage */}
      {showPercentage && (
        <div className="mt-1">
          <span className="text-xs text-gray-500">{percentage}% complete</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;