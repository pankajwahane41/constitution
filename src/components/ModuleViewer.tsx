import React, { useEffect } from 'react';
import { EducationalModule } from '../types';

interface ModuleViewerProps {
  module: EducationalModule;
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

const ModuleViewer: React.FC<ModuleViewerProps> = ({
  module,
  onBack,
  onComplete,
  isCompleted,
}) => {
  const [isReading, setIsReading] = React.useState(false);

  useEffect(() => {
    // Mark as reading when component mounts
    setIsReading(true);
    
    // Set a timer to mark as reading complete (simulating reading time)
    const timer = setTimeout(() => {
      setIsReading(false);
    }, 2000); // 2 seconds reading time

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-navy text-xl">←</span>
            </button>
            <h1 className="text-lg font-bold text-navy text-center flex-1">
              Module {module.id}: {module.title}
            </h1>
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Module Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <p className="text-gray-700 text-sm">{module.summary}</p>
        </div>

        {/* Story */}
        {module.story && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 className="font-semibold text-navy mb-3">📖 Story Time</h3>
            <p className="text-gray-700 leading-relaxed">{module.story}</p>
          </div>
        )}

        {/* Key Concepts */}
        {module.concepts && module.concepts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 className="font-semibold text-navy mb-3">💡 Key Concepts</h3>
            <div className="space-y-3">
              {module.concepts.map((concept, index) => (
                <div key={index} className="border-l-3 border-orange-500 pl-3">
                  <h4 className="font-medium text-navy mb-1">{concept.title}</h4>
                  <p className="text-gray-600 text-sm">{concept.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-World Examples */}
        {module.examples && module.examples.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <h3 className="font-semibold text-navy mb-3">🌟 Real-World Examples</h3>
            <div className="space-y-3">
              {module.examples.map((example, index) => (
                <div key={index} className="border-l-3 border-green-500 pl-3">
                  <h4 className="font-medium text-navy mb-1">{example.title}</h4>
                  <p className="text-gray-600 text-sm">{example.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaways */}
        {module.keyTakeaways && module.keyTakeaways.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h3 className="font-semibold text-navy mb-3">🎯 Key Takeaways</h3>
            <div className="space-y-2">
              {module.keyTakeaways.map((takeaway, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <p className="text-gray-700 text-sm">{takeaway}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isCompleted && (
            <button
              onClick={onComplete}
              disabled={isReading}
              className="w-full p-4 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReading ? '📖 Reading...' : '✓ Mark as Complete'}
            </button>
          )}

          {isCompleted && (
            <div className="w-full p-4 bg-green-100 border border-green-300 rounded-lg text-center">
              <p className="text-green-700 font-medium">✓ Module Completed!</p>
              <p className="text-green-600 text-sm mt-1">Great job learning about {module.title}!</p>
            </div>
          )}

          <button
            onClick={onBack}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Back to Learning Modules
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleViewer;