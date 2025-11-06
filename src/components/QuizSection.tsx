import React from 'react';
import { QuizCategory } from '../types';

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
            <h1 className="text-xl font-bold text-navy text-center">Quiz Section</h1>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-navy mb-2">📝 How Quiz Works</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Choose a topic category below</li>
            <li>• Answer questions with 4 multiple choice options</li>
            <li>• Get instant feedback on your answers</li>
            <li>• Track your score and progress</li>
          </ul>
        </div>

        {/* Category Selection */}
        <div className="space-y-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              disabled={isLoading}
              className="w-full p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-transparent hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start space-x-4">
                {/* Category Icon */}
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📚</span>
                </div>
                
                {/* Category Info */}
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-navy mb-1">{category.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        {category.questionCount} questions
                      </span>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        {category.difficulty}
                      </span>
                    </div>
                    <span className="text-green-500 text-sm">Start Quiz →</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold text-navy mb-3">📊 Quiz Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.reduce((total, cat) => total + cat.questionCount, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <button
          onClick={onBack}
          className="w-full mt-6 p-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default QuizSection;