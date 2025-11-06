import React from 'react';
import { EducationalModule } from '../types';
import { markModuleComplete } from '../lib/utils';

interface LearnSectionProps {
  modules: EducationalModule[];
  onModuleSelect: (moduleId: string) => void;
  onBack: () => void;
  completedModules: string[];
}

const LearnSection: React.FC<LearnSectionProps> = ({
  modules,
  onModuleSelect,
  onBack,
  completedModules,
}) => {
  const completedCount = completedModules.length;
  const progressPercentage = (completedCount / modules.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <span className="text-navy text-xl">←</span>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-navy text-center">Learn Section</h1>
          </div>
          <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>

        {/* Progress */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Learning Progress</span>
            <span className="text-sm font-bold text-navy">
              {completedCount}/{modules.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completedCount === modules.length
              ? "🎉 Congratulations! You've completed all modules!"
              : `${Math.round(progressPercentage)}% complete`}
          </p>
        </div>

        {/* Module Grid */}
        <div className="space-y-4">
          {modules.map((module) => {
            const isCompleted = completedModules.includes(module.id);
            
            return (
              <button
                key={module.id}
                onClick={() => onModuleSelect(module.id)}
                className="w-full p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-transparent hover:border-orange-500"
              >
                <div className="flex items-start space-x-4">
                  {/* Module Number */}
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {module.id}
                  </div>
                  
                  {/* Module Info */}
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-navy mb-1">{module.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{module.summary}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isCompleted && (
                          <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                        )}
                        <span className="text-xs text-gray-500">
                          {module.estimatedTime} min
                        </span>
                      </div>
                      <span className="text-orange-500 text-sm">Read more →</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Back to Home */}
        <button
          onClick={onBack}
          className="w-full mt-8 p-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default LearnSection;