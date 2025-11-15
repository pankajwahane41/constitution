import React from 'react';
import { QuizSession } from '../types/gamification';

interface QuizValidationGuardProps {
  quiz: QuizSession | null;
  questionIndex: number;
  children: React.ReactNode;
}

/**
 * Component to prevent race conditions in quiz state
 * Ensures questions are answered in order and prevents duplicate submissions
 */
export const QuizValidationGuard: React.FC<QuizValidationGuardProps> = ({
  quiz,
  questionIndex,
  children
}) => {
  if (!quiz) {
    return <div>No quiz data available</div>;
  }

  // Check if this question has already been answered
  const isQuestionAnswered = quiz.answers[questionIndex] !== undefined;
  
  // Check if we're trying to skip questions
  const isQuestionAccessible = questionIndex <= quiz.currentQuestionIndex;
  
  // Check if quiz is complete
  const isQuizComplete = quiz.isComplete;

  // Prevent access to future questions or already answered questions
  if (!isQuestionAccessible || isQuestionAnswered || isQuizComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {isQuizComplete ? 'Quiz Complete' : 'Invalid Question Access'}
          </h2>
          <p className="text-gray-600">
            {isQuizComplete 
              ? 'This quiz has already been completed.'
              : 'Please answer questions in order without skipping.'
            }
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default QuizValidationGuard;