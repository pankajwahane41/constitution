import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '../types/gamification';
import { Check, X, ArrowLeft, Clock, Lightbulb, Zap } from 'lucide-react';
import '../styles/professional-responsive.css';

interface MobileQuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answerIndex: number) => void;
  onBack: () => void;
  showResult?: boolean;
  correctAnswer?: string;
  selectedAnswer?: string;
  progress: {
    current: number;
    total: number;
  };
  score: number;
  categoryName: string;
  timeLimit?: number;
  onTimeUp?: () => void;
}

const MobileQuestionCard: React.FC<MobileQuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  showResult = false,
  correctAnswer,
  selectedAnswer,
  progress,
  score,
  categoryName,
  timeLimit = 30,
  onTimeUp
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOptionClick = (optionIndex: number) => {
    // Prevent multiple clicks and processing during answer submission
    if (showResult || selectedAnswer || isProcessing) return;
    
    console.log('Mobile quiz: Option clicked', optionIndex);
    setIsProcessing(true);
    
    // Call the parent handler
    onAnswer(optionIndex);
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  // Reset processing state when question changes
  useEffect(() => {
    setIsProcessing(false);
    setTimeRemaining(timeLimit);
  }, [questionNumber, timeLimit]);

  // Timer effect
  useEffect(() => {
    if (showResult) return;

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
  }, [showResult, onTimeUp]);

  // Get time color based on remaining time
  const getTimeColor = () => {
    const percentage = (timeRemaining / timeLimit) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 25) return 'text-orange-500';
    return 'text-red-500';
  };

  // Check if the selected answer is correct
  const isCorrect = selectedAnswer && selectedAnswer === correctAnswer;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <div className="responsive-container flex flex-col min-h-screen">
        {/* Professional Quiz Header */}
        <motion.header 
          className="quiz-header"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between">
            <motion.button 
              onClick={onBack}
              className="professional-button button-outline button-sm focus-ring"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={16} className="mr-2" />
              <span>Back</span>
            </motion.button>
            
            <div className="text-center">
              <div className="caption text-neutral-600">Question {progress.current} of {progress.total}</div>
              <div className="flex items-center space-x-3 justify-center mt-1">
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-warning-500" />
                  <span className="body-small font-semibold text-neutral-800">{score} pts</span>
                </div>
                {!showResult && (
                  <motion.div 
                    className={`caption font-semibold ${getTimeColor()} flex items-center space-x-1`}
                    animate={{
                      scale: timeRemaining < 10 ? [1, 1.1, 1] : 1
                    }}
                    transition={{
                      duration: 1,
                      repeat: timeRemaining < 10 ? Infinity : 0
                    }}
                  >
                    <Clock size={12} />
                    <span>{timeRemaining}s</span>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="w-20"></div>
          </div>
        </motion.header>

      {/* Premium Progress Bar */}
      <div className="h-3 bg-gray-100 relative overflow-hidden">
        <motion.div 
          className="h-full mobile-progress-bar absolute top-0 left-0"
          initial={{ width: 0 }}
          animate={{ width: `${(progress.current / progress.total) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="flex-1 py-6">
        {/* Premium Question Card */}
        <motion.div 
          className="mobile-question-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="mb-6">
            <motion.div 
              className="flex items-start space-x-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-base font-bold">Q</span>
              </div>
              <h3 className="mobile-question-text flex-1">
                {question.question}
              </h3>
            </motion.div>
            
            {/* Category Badge */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-blue-700">{categoryName}</span>
            </motion.div>
          </div>

          {/* Premium Answer Options */}
          <div className="mobile-options-grid">
            <AnimatePresence mode="wait">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer && selectedAnswer === option;
                const isCorrectAnswer = correctAnswer && option === correctAnswer;
                
                let buttonClass = 'mobile-option-button ';
                
                if (showResult && isSelected) {
                  buttonClass += isCorrect ? 'correct' : 'incorrect';
                } else if (showResult && isCorrectAnswer) {
                  buttonClass += 'correct';
                } else if (isSelected) {
                  buttonClass += 'selected';
                }
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    className={buttonClass}
                    disabled={showResult}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.1 * index,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    whileHover={{ scale: showResult ? 1 : 1.02 }}
                    whileTap={{ scale: showResult ? 1 : 0.98 }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-base font-medium flex-1 pr-4 text-left">
                        {option}
                      </span>
                      
                      <AnimatePresence>
                        {showResult && (isSelected || isCorrectAnswer) && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                            {isSelected && isCorrect ? (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            ) : isSelected && !isCorrect ? (
                              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                                <X className="w-5 h-5 text-white" />
                              </div>
                            ) : isCorrectAnswer && !isSelected ? (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            ) : null}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Premium Result Summary */}
        <AnimatePresence>
          {showResult && (
            <motion.div 
              className={`
                flex items-center justify-between p-5 rounded-2xl mt-6
                ${isCorrect 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200' 
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200'
                }
              `}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                >
                  {isCorrect ? (
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <Check className="w-7 h-7 text-white" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                      <X className="w-7 h-7 text-white" />
                    </div>
                  )}
                </motion.div>
                <span className={`
                  text-lg font-bold
                  ${isCorrect ? 'text-green-700' : 'text-red-700'}
                `}>
                  {isCorrect ? 'Excellent!' : 'Keep Learning!'}
                </span>
              </div>
              {isCorrect && (
                <motion.div
                  className="text-4xl"
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 0.6 }}
                >
                  🎉
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Explanation Card */}
        <AnimatePresence>
          {showResult && question.explanation && (
            <motion.div 
              className="mt-6 rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start space-x-3">
                <motion.div 
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Lightbulb className="w-5 h-5 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-navy-800 mb-2">Did you know?</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Memoized component for performance optimization
const MemoizedMobileQuestionCard = memo(MobileQuestionCard);
export default MemoizedMobileQuestionCard;
