import React, { useEffect, useState } from 'react';
import { EducationalModule } from '../types';

interface ModuleViewerProps {
  module: EducationalModule;
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

interface ModuleContent {
  type: 'story' | 'content';
  title: string;
  content: string;
}

const ModuleViewer: React.FC<ModuleViewerProps> = ({
  module,
  onBack,
  onComplete,
  isCompleted,
}) => {
  const [isReading, setIsReading] = useState(false);
  const [content, setContent] = useState<ModuleContent[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModuleContent = async () => {
      try {
        setLoadingContent(true);
        setError(null);
        
        // If module has content array, use it
        if (module.content && module.content.length > 0) {
          setContent(module.content as ModuleContent[]);
        } else {
          // Fallback: construct content from other module properties
          const fallbackContent: ModuleContent[] = [
            {
              type: 'story',
              title: `Module ${module.id}: ${module.title}`,
              content: module.story || module.summary || 'Loading content...'
            }
          ];
          
          if (module.concepts) {
            module.concepts.forEach((concept, index) => {
              fallbackContent.push({
                type: 'content',
                title: `Concept ${index + 1}: ${concept.title}`,
                content: concept.description
              });
            });
          }
          
          setContent(fallbackContent);
        }
      } catch (err) {
        console.error('Error loading module content:', err);
        setError('Failed to load module content. Please try again.');
        // Set basic content as fallback
        setContent([
          {
            type: 'story',
            title: module.title,
            content: module.summary || 'Module content is temporarily unavailable.'
          }
        ]);
      } finally {
        setLoadingContent(false);
      }
    };

    // Mark as reading when component mounts
    setIsReading(true);
    
    // Load content
    loadModuleContent();
    
    // Set a timer to mark as reading complete
    const timer = setTimeout(() => {
      setIsReading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [module]);

  // Loading state
  if (loadingContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="w-full mx-auto px-2 py-4">
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
        <div className="w-full mx-auto px-2 py-4 pb-32 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Content Loading Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="w-full mx-auto px-2 py-4">
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
      <div className="w-full mx-auto px-2 py-4 pb-32">
        {/* Module Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <p className="text-gray-700 text-base leading-relaxed">{module.summary}</p>
        </div>

        {/* Dynamic Content Sections */}
        {content.map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-navy mb-4 text-lg">
              {section.type === 'story' ? '📖' : '📚'} {section.title}
            </h3>
            <p className="text-gray-700 leading-relaxed text-base">{section.content}</p>
          </div>
        ))}

        {/* Legacy content rendering for backwards compatibility */}
        {module.concepts && module.concepts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-navy mb-4 text-lg">💡 Key Concepts</h3>
            <div className="space-y-4">
              {module.concepts.map((concept, index) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium text-navy mb-2">{concept.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{concept.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-World Examples */}
        {module.examples && module.examples.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-navy mb-4 text-lg">🌟 Real-World Examples</h3>
            <div className="space-y-4">
              {module.examples.map((example, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium text-navy mb-2">{example.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{example.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaways */}
        {module.keyTakeaways && module.keyTakeaways.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="font-semibold text-navy mb-4 text-lg">🎯 Key Takeaways</h3>
            <div className="space-y-3">
              {module.keyTakeaways.map((takeaway, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-orange-500 mt-1 font-bold">•</span>
                  <p className="text-gray-700 leading-relaxed">{takeaway}</p>
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