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
    <div className={`bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-orange-200 transition-all relative ${className}`}>
      {/* Story Tab Style Header with Progress */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-green-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-navy">Question {progress.current}</div>
                <div className="text-sm text-gray-600">of {progress.total}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-1 bg-white rounded-full">
              <div className={`w-3 h-3 rounded-full ${difficulty.color}`}></div>
              <span className="text-sm font-medium text-gray-700">{difficulty.label}</span>
            </div>
          </div>

          {timeRemaining !== undefined && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className={`text-lg font-bold ${
                timeRemaining <= 10 ? 'text-red-600' : 'text-gray-700'
              }`}>
                {timeRemaining}s
              </span>
            </div>
          )}
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* ⭐ QUIZ NAVIGATION - ALWAYS VISIBLE AT TOP ⭐ */}
      <div className="px-4 md:px-6 py-4 border-b-2 border-orange-200 bg-gradient-to-r from-orange-100 to-green-100 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="flex items-center space-x-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-400 hover:bg-orange-50 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md min-h-[52px] font-bold text-sm md:text-base"
            style={{ touchAction: 'manipulation' }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>

          <div className="text-center px-2 flex-1">
            <div className="text-sm md:text-base font-bold text-gray-800 mb-1">
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className="flex justify-center space-x-1">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full border-2 ${
                    userAnswers[index] !== undefined 
                      ? 'bg-green-500 border-green-600' 
                      : index === currentIndex 
                        ? 'bg-orange-500 border-orange-600' 
                        : 'bg-gray-300 border-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={onNext}
            disabled={isLastQuestion || !hasAnswered}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-bold min-h-[52px] text-sm md:text-base border-2 border-orange-400"
            style={{ touchAction: 'manipulation' }}
          >
            <span>NEXT</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Story Tab Style Question Content */}
      <div className="p-6 lg:p-8">
        <div className={`transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
          <h3 className="text-xl font-bold text-navy mb-8 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* Story Tab Style Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer === index;
              const isCorrect = currentQuestion.correct_answer === index;
              const showResult = showResults && hasAnswered;
              
              let buttonClass = 'w-full p-5 text-left rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ';
              
              if (showResult) {
                if (isSelected && isCorrect) {
                  buttonClass += 'border-green-500 bg-green-100 text-green-800 shadow-green-200';
                } else if (isSelected && !isCorrect) {
                  buttonClass += 'border-red-500 bg-red-100 text-red-800 shadow-red-200';
                } else if (isCorrect) {
                  buttonClass += 'border-green-500 bg-green-50 text-green-800';
                } else {
                  buttonClass += 'border-gray-200 bg-gray-50 text-gray-600';
                }
              } else if (isSelected) {
                buttonClass += 'border-orange-500 bg-orange-100 text-orange-800 shadow-orange-200';
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
                    <div className="flex items-center space-x-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        showResult && isCorrect 
                          ? 'bg-green-500 text-white' 
                          : showResult && isSelected && !isCorrect
                            ? 'bg-red-500 text-white'
                            : isSelected
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 font-medium">{option}</span>
                    </div>
                    {showResult && (
                      <div>
                        {isSelected && isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : isSelected && !isCorrect ? (
                          <XCircle className="w-6 h-6 text-red-600" />
                        ) : isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Story Tab Style Explanation */}
          {showResults && hasAnswered && currentQuestion.explanation && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-navy text-lg">💡 Explanation</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
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



      {/* Story Tab Style Results Summary */}
      {isLastQuestion && showResults && hasAnswered && (
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="font-bold text-green-800 text-lg">Quiz Completed! 🎉</div>
              <div className="text-green-600 text-sm">Great work on your constitutional knowledge!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized component for performance
const MemoizedQuizFlowManager = memo(QuizFlowManager);
export default MemoizedQuizFlowManager;
