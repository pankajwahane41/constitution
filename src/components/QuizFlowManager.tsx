import React, { useState, useEffect, memo } from 'react';
import { QuizQuestion } from '../types/gamification';
import { 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  CheckCircle, 
  XCircle,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react';

interface QuizFlowManagerProps {
  questions: QuizQuestion[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onAnswerSelect: (answerIndex: number) => void;
  userAnswers: number[];
  showResults: boolean;
  timeRemaining?: number;
  onTimeUp?: () => void;
  className?: string;
}

const QuizFlowManager: React.FC<QuizFlowManagerProps> = ({
  questions,
  currentIndex,
  onNext,
  onPrevious,
  onAnswerSelect,
  userAnswers,
  showResults,
  timeRemaining,
  onTimeUp,
  className = ''
}) => {
  const [transitioning, setTransitioning] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = userAnswers[currentIndex] !== undefined;
  const currentAnswer = userAnswers[currentIndex];

  // Auto-advance after showing results
  useEffect(() => {
    if (showResults && hasAnswered && !isLastQuestion) {
      const timer = setTimeout(() => {
        setShowTransition(true);
        setTimeout(() => {
          onNext();
          setShowTransition(false);
        }, 800);
      }, 3000); // Show result for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showResults, hasAnswered, isLastQuestion, onNext]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (hasAnswered) return;
    
    setTransitioning(true);
    onAnswerSelect(answerIndex);
    
    // Brief delay for visual feedback
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };

  const getQuestionProgress = () => {
    return {
      current: currentIndex + 1,
      total: questions.length,
      percentage: ((currentIndex + 1) / questions.length) * 100
    };
  };

  const getDifficultyIndicator = () => {
    const difficulty = currentQuestion.difficulty || 'medium';
    const colors = {
      easy: 'bg-green-500',
      medium: 'bg-orange-500',
      hard: 'bg-red-500'
    };
    
    return {
      level: difficulty,
      color: colors[difficulty as keyof typeof colors] || colors.medium,
      label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    };
  };

  const progress = getQuestionProgress();
  const difficulty = getDifficultyIndicator();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header with Progress */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-navy">Question {progress.current}</div>
                <div className="text-xs text-gray-500">of {progress.total}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${difficulty.color}`}></div>
              <span className="text-xs text-gray-600">{difficulty.label}</span>
            </div>
          </div>

          {timeRemaining !== undefined && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className={`text-sm font-medium ${
                timeRemaining <= 10 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {timeRemaining}s
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className={`transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
          <h3 className="text-lg font-semibold text-navy mb-6 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer === index;
              const isCorrect = currentQuestion.correct_answer === index;
              const showResult = showResults && hasAnswered;
              
              let buttonClass = 'w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ';
              
              if (showResult) {
                if (isSelected && isCorrect) {
                  buttonClass += 'border-green-500 bg-green-100 text-green-800';
                } else if (isSelected && !isCorrect) {
                  buttonClass += 'border-red-500 bg-red-100 text-red-800';
                } else if (isCorrect) {
                  buttonClass += 'border-green-500 bg-green-50 text-green-800';
                } else {
                  buttonClass += 'border-gray-200 bg-gray-50 text-gray-600';
                }
              } else if (isSelected) {
                buttonClass += 'border-orange-500 bg-orange-100 text-orange-800';
              } else {
                buttonClass += 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 cursor-pointer';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult || hasAnswered}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                    </div>
                    {showResult && (
                      <div>
                        {isSelected && isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : isSelected && !isCorrect ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResults && hasAnswered && currentQuestion.explanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-navy">Explanation</h4>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transition Overlay */}
      {showTransition && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-navy font-medium">Next question...</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      {!showResults && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-500">
                {userAnswers.filter(a => a !== undefined).length} of {questions.length} answered
              </div>
            </div>

            <button
              onClick={onNext}
              disabled={isLastQuestion || !hasAnswered}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {isLastQuestion && showResults && hasAnswered && (
        <div className="p-4 border-t border-gray-200 bg-green-50">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Quiz completed! Great work!</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized component for performance
const MemoizedQuizFlowManager = memo(QuizFlowManager);
export default MemoizedQuizFlowManager;
