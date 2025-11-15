import React, { useState } from 'react';
import { QuizCategory } from '../types';
import '../styles/professional-responsive.css';

interface QuizSectionProps {
  categories: QuizCategory[];
  onCategorySelect: (categoryId: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

const QuizSection: React.FC<QuizSectionProps> = ({
  categories,
  onCategorySelect,
  onBack,
  isLoading,
}) => {
  const [retryAttempt, setRetryAttempt] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 w-full overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 py-8 overflow-x-hidden">
        {/* Story Tab Style Header */}
        <header className="text-center mb-8">
          <button
            onClick={onBack}
            className="absolute left-0 top-0 p-3 text-gray-600 hover:text-orange-600 transition-colors rounded-lg"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-2xl">←</span>
          </button>
          <div className="pt-4">
            <h1 className="text-3xl font-bold text-navy mb-3"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
              Constitutional Quiz Hub
            </h1>
            <p className="text-gray-600 mb-6">Test your constitutional knowledge across various topics</p>
          </div>
        </header>

        {/* Story Tab Style Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border-2 border-gray-200">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">📝</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-navy mb-4">How the Quiz System Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="w-7 h-7 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <p className="text-sm text-gray-600 leading-relaxed">Select a constitutional topic from the categories below</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-7 h-7 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <p className="text-sm text-gray-600 leading-relaxed">Answer multiple-choice questions with instant feedback</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-7 h-7 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <p className="text-sm text-gray-600 leading-relaxed">Track your progress and improve your understanding</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="w-7 h-7 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <p className="text-sm text-gray-600 leading-relaxed">Earn points and compete on the leaderboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story Tab Style Quiz Categories */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-center text-navy mb-10">Choose Your Quiz Topic</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`text-left bg-white rounded-xl p-8 shadow-lg border-2 hover:border-orange-200 hover:shadow-xl transition-all duration-200 min-h-[240px] flex flex-col ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:bg-orange-50 active:shadow-md cursor-pointer'
                }`}
                onClick={() => !isLoading && onCategorySelect(category.id)}
                disabled={isLoading}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-3xl">📚</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-end sm:items-start">
                    <span className="text-xs sm:text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                      {category.questionCount} questions
                    </span>
                    <span className={`text-xs sm:text-sm px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                      category.difficulty.toLowerCase() === 'easy' ? 'bg-green-100 text-green-700' :
                      category.difficulty.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {category.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col justify-between h-full">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 leading-tight overflow-hidden">{category.title}</h3>
                    <p className="text-base text-gray-600 mb-6 leading-relaxed overflow-hidden" 
                       style={{
                         display: '-webkit-box',
                         WebkitLineClamp: 2,
                         WebkitBoxOrient: 'vertical',
                         textOverflow: 'ellipsis'
                       }}>{category.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                    <span className="text-sm sm:text-base font-semibold text-orange-600">
                      {isLoading ? 'Loading...' : 'Start Quiz'}
                    </span>
                    <span className="text-orange-600 text-lg">→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Story Tab Style Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200 mb-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-bold text-navy">Quiz Statistics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {categories.reduce((total, cat) => total + cat.questionCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Questions Available</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-3xl font-bold text-orange-600 mb-2">{categories.length}</div>
              <div className="text-sm text-gray-600">Constitutional Topics</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(categories.reduce((total, cat) => total + cat.questionCount, 0) / categories.length)}
              </div>
              <div className="text-sm text-gray-600">Avg. Questions per Topic</div>
            </div>
          </div>
        </div>

        {/* Enhanced Error Handling */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-10 text-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-navy mb-2">Loading Quiz Content</h3>
            <p className="text-gray-600">Preparing your constitutional knowledge test...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment for the first quiz</p>
          </div>
        )}

        {/* Story Tab Style Navigation Footer */}
        <div className="text-center mt-12">
          <button
            onClick={onBack}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizSection;