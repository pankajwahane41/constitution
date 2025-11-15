import React, { useState, useEffect, useCallback, memo } from 'react';
import { QuizQuestion } from '../types/gamification';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answerIndex: number) => void;
  showResult: boolean;
  correctAnswer?: string;
  selectedAnswer?: string;
  timeLimit?: number; // seconds
  onTimeUp?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showResult,
  correctAnswer,
  selectedAnswer,
  timeLimit = 30,
  onTimeUp
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Helper function to normalize correct_answer to number
  const getCorrectAnswerIndex = (): number => {
    return typeof question.correct_answer === 'string' 
      ? parseInt(question.correct_answer, 10) 
      : question.correct_answer;
  };

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setTimeRemaining(timeLimit);
    setStartTime(Date.now());
  }, [question, timeLimit]);

  // Timer effect
  useEffect(() => {
    if (hasAnswered || showResult) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasAnswered, showResult, onTimeUp]);

  const handleOptionSelect = useCallback((optionIndex: number) => {
    if (hasAnswered || showResult) return;
    
    // Prevent rapid multiple clicks
    setSelectedOption(optionIndex);
    setHasAnswered(true);
    onAnswer(optionIndex);
  }, [hasAnswered, showResult, onAnswer]);

  // Get time color based on remaining time
  const getTimeColor = () => {
    const percentage = (timeRemaining / timeLimit) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 25) return 'text-orange-500';
    return 'text-red-500';
  };

  // Get time progress percentage
  const getTimeProgress = () => {
    return ((timeLimit - timeRemaining) / timeLimit) * 100;
  };

  const getOptionClass = (optionIndex: number) => {
    const option = question.options[optionIndex];
    
    if (!showResult) {
      return selectedOption === optionIndex
        ? 'bg-blue-100 border-blue-500 text-blue-700'
        : 'bg-white border-gray-300 hover:bg-gray-50';
    }

    // Show results state
    const correctAnswerIndex = getCorrectAnswerIndex();
    if (optionIndex === correctAnswerIndex) {
      return 'bg-green-100 border-green-500 text-green-700';
    } else if (optionIndex === selectedOption && optionIndex !== correctAnswerIndex) {
      return 'bg-red-100 border-red-500 text-red-700';
    } else {
      return 'bg-gray-100 border-gray-300 text-gray-500';
    }
  };

  const getOptionIcon = (optionIndex: number) => {
    const option = question.options[optionIndex];
    
    if (!showResult) {
      return selectedOption === optionIndex ? '✓' : '';
    }

    const correctAnswerIndex = getCorrectAnswerIndex();
    if (optionIndex === correctAnswerIndex) {
      return '✓';
    } else if (optionIndex === selectedOption && optionIndex !== correctAnswerIndex) {
      return '✗';
    }
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
        {showResult && (
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            selectedAnswer === correctAnswer
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {selectedAnswer === correctAnswer ? '✓ Correct' : '✗ Incorrect'}
          </span>
        )}
      </div>

      {/* Timer */}
      {!showResult && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className={`w-4 h-4 ${getTimeColor()}`} />
              <span className={`text-sm font-medium ${getTimeColor()}`}>
                {timeRemaining}s remaining
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Q{questionNumber} of {totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                timeRemaining > 10 ? 'bg-green-500' : 
                timeRemaining > 5 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${100 - (timeRemaining / timeLimit) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Question Text */}
      <h3 className="text-lg font-semibold text-navy mb-6 leading-relaxed">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const optionKey = String.fromCharCode(65 + index); // A, B, C, D
          
          return (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={hasAnswered}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${getOptionClass(
                index
              )} disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    {optionKey}
                  </span>
                  <span className="flex-1">{option}</span>
                </div>
                <span className="text-lg font-bold">{getOptionIcon(index)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showResult && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-navy mb-2">💡 Explanation</h4>
          <p className="text-gray-700 text-sm">{question.explanation}</p>
        </div>
      )}

      {/* Image */}
      {question.image && (
        <div className="mt-4">
          <img
            src={question.image}
            alt="Question illustration"
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

// Memoized component for performance optimization
const MemoizedQuestionCard = memo(QuestionCard);
export default MemoizedQuestionCard;