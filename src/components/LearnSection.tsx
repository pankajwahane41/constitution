import React, { useEffect, useRef } from 'react';
import { EducationalModule } from '../types';
import '../styles/professional-responsive.css';

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

  // Find the next uncompleted module
  const nextUncompletedModule = modules.find(module => !completedModules.includes(module.id));
  const nextModuleRef = useRef<HTMLDivElement>(null);

  // Scroll to the next uncompleted module when the component mounts
  useEffect(() => {
    if (nextModuleRef.current && nextUncompletedModule) {
      setTimeout(() => {
        nextModuleRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);
    }
  }, [nextUncompletedModule]);

  // Sort modules to prioritize uncompleted ones
  const sortedModules = [...modules].sort((a, b) => {
    const aCompleted = completedModules.includes(a.id);
    const bCompleted = completedModules.includes(b.id);
    
    // If one is completed and the other isn't, put uncompleted first
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }
    
    // If both are same completion status, maintain original order
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 w-full overflow-x-hidden">
      <div className="elegant-container w-full max-w-7xl mx-auto overflow-x-hidden">
        {/* Professional Header */}
        <header className="elegant-header flex flex-col sm:flex-row items-center justify-between">
          <button
            onClick={onBack}
            className="mobile-game-button self-start sm:self-center mb-4 sm:mb-0 bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 rounded-lg px-4 py-2 font-semibold flex items-center transition-all duration-200"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="mr-2">←</span>
            <span>Back</span>
          </button>
          <div className="text-center flex-1 sm:flex-initial">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Learning Modules</h1>
            <p className="text-sm sm:text-base text-gray-600">Master constitutional concepts through structured learning</p>
          </div>
          <div className="w-0 sm:w-24"></div>
        </header>

        {/* Enhanced Progress Dashboard */}
        <section className="elegant-card elegant-section bg-gradient-to-br from-white via-orange-50 to-green-50 shadow-lg border border-orange-100">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Learning Progress</h2>
              <p className="text-sm sm:text-base text-gray-600">Track your constitutional education journey</p>
            </div>
            <div className="text-center bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-orange-100">
              <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                {completedCount}/{modules.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">Modules</div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-6 mb-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-orange-500 via-orange-400 to-green-500 h-6 rounded-full transition-all duration-700 ease-out shadow-sm relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progressPercentage)}% Complete
              </span>
              {completedCount === modules.length && (
                <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  🎉 All modules completed!
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Professional Learning Modules Grid */}
        <section className="elegant-section w-full max-w-full overflow-x-hidden">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-green-600 bg-clip-text text-transparent">
              Constitutional Learning Path
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-orange-500 to-green-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 text-base sm:text-lg">Master the Constitution through structured, interactive lessons</p>
          </div>
          <div className="elegant-grid w-full max-w-full">
            {sortedModules.map((module, index) => {
              const isCompleted = completedModules.includes(module.id);
              const isNextUncompleted = module.id === nextUncompletedModule?.id;
              
              return (
                <article
                  key={module.id}
                  ref={isNextUncompleted ? nextModuleRef : undefined}
                  className={`learning-module-card ${
                    isCompleted ? 'learning-module-card--completed' : ''
                  } ${isNextUncompleted ? 'learning-module-card--next' : ''}`}
                  onClick={() => onModuleSelect(module.id)}
                >
                  <header className="learning-module-card__header">
                    <div className={`learning-module-card__number ${
                      isCompleted ? 'completed' : isNextUncompleted ? 'next' : 'default'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div className="learning-module-card__status">
                      {isCompleted && (
                        <span className="completion-badge">✅ Completed</span>
                      )}
                      {isNextUncompleted && !isCompleted && (
                        <span className="next-badge">▶ Start Here</span>
                      )}
                    </div>
                  </header>
                  
                  <div className="learning-module-card__content">
                    <h3 className="learning-module-card__title">
                      {module.title}
                      {isNextUncompleted && !isCompleted && (
                        <span className="ml-2 text-primary-500 text-sm font-medium">← Next</span>
                      )}
                    </h3>
                    <p className="learning-module-card__description">{module.summary}</p>
                    
                    <footer className="learning-module-card__footer">
                      <div className="module-meta">
                        <span className="module-duration">
                          <span className="module-duration__icon">⏱️</span>
                          <span className="module-duration__text">{module.estimatedTime} min</span>
                        </span>
                      </div>
                      <span className="module-action-text">
                        {isCompleted ? 'Review →' : isNextUncompleted ? 'Start →' : 'Learn More →'}
                      </span>
                    </footer>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Professional Navigation */}
        <footer className="elegant-section text-center">
          <button
            onClick={onBack}
            className="mobile-game-button w-full sm:w-auto bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 rounded-lg px-6 py-3 font-semibold flex items-center justify-center transition-all duration-200"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LearnSection;