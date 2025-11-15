import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/gamification';
import { PointCalculator, QuizPerformance } from '../lib/pointCalculator';
import { Coins, Zap, Trophy, Star, Target, HelpCircle, Calculator } from 'lucide-react';
import { triggerCoinAnimation } from '../utils/coinAnimationUtils';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  onBackToCategories: () => void;
  timeTaken?: number;
  coinsEarned?: number;
  experienceGained?: number;
  perfectScore?: boolean;
  userProfile?: UserProfile | null;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  onRestart,
  onBackToCategories,
  timeTaken,
  coinsEarned = 0,
  experienceGained = 0,
  perfectScore = false,
  userProfile,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Consistent number formatting
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Detailed point calculation breakdown using unified PointCalculator
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  // Calculate breakdown components using unified PointCalculator
  const performance: QuizPerformance = {
    totalQuestions,
    correctAnswers: score,
    perfectScore: perfectScore || false,
    responseTime: timeTaken ? timeTaken * 1000 : undefined,
    timeSpent: timeTaken,
    hintsUsed: 0
  };
  
  const pointResult = PointCalculator.calculateQuizPoints(performance, userProfile || undefined);
  
  const baseCoins = score * 5; // 5 coins per correct answer (PointCalculator standard)
  const baseXP = score * 10;   // 10 XP per correct answer (PointCalculator standard)
  
  // Breakdown components from PointCalculator result
  const streakBonus = pointResult.streakBonus;
  const speedBonus = pointResult.speedBonus;
  const perfectScoreBonus = pointResult.perfectScoreBonus;
  const difficultyMultiplier = pointResult.difficultyMultiplier;
  
  const totalCoinsCalculated = pointResult.coinsEarned;
  const totalXPCalculated = pointResult.experienceGained;
  
  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: 'Excellent!', emoji: '🏆', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 80) return { level: 'Very Good!', emoji: '⭐', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 70) return { level: 'Good Job!', emoji: '👍', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (percentage >= 60) return { level: 'Not Bad!', emoji: '📚', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Keep Learning!', emoji: '💪', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performanceLevel = getPerformanceLevel();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger coin animation when component loads if coins were earned
  useEffect(() => {
    if (coinsEarned > 0) {
      // Delay to allow component to render
      const timer = setTimeout(() => {
        triggerCoinAnimation(coinsEarned);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [coinsEarned]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header with Celebration */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-full flex items-center justify-center shadow-lg ${perfectScore ? 'animate-bounce' : ''}`}>
            <div className="text-3xl">{perfectScore ? '🎉' : performanceLevel.emoji}</div>
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">
            {perfectScore ? 'Perfect Score!' : 'Quiz Complete!'}
          </h1>
          <p className={`text-lg font-semibold ${performanceLevel.color}`}>{performanceLevel.level}</p>
          
          {perfectScore && (
            <div className="mt-2 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-full inline-block">
              <span className="text-sm font-medium text-yellow-800">🌟 Flawless Victory! 🌟</span>
            </div>
          )}
        </div>

        {/* Rewards Section */}
        {(coinsEarned > 0 || experienceGained > 0) && (
          <div className="bg-gradient-to-r from-yellow-100 to-green-100 rounded-xl p-4 mb-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-navy text-center">🎁 Rewards Earned!</h3>
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Calculator className="w-4 h-4" />
                <span>{showBreakdown ? 'Hide' : 'Show'} Breakdown</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {coinsEarned > 0 && (
                <div className="flex items-center justify-center space-x-2 bg-white bg-opacity-60 rounded-lg p-3">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <div className="text-center">
                    <div className="font-bold text-yellow-700">+{formatNumber(coinsEarned)}</div>
                    <div className="text-xs text-yellow-600">Constitutional Coins</div>
                  </div>
                </div>
              )}
              {experienceGained > 0 && (
                <div className="flex items-center justify-center space-x-2 bg-white bg-opacity-60 rounded-lg p-3">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <div className="text-center">
                    <div className="font-bold text-blue-700">+{formatNumber(experienceGained)}</div>
                    <div className="text-xs text-blue-600">Experience Points</div>
                  </div>
                </div>
              )}
            </div>

            {/* Point Calculation Breakdown */}
            {showBreakdown && (
              <div className="mt-4 p-3 bg-white bg-opacity-70 rounded-lg">
                <h4 className="text-sm font-semibold text-navy mb-2 flex items-center space-x-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>Point Calculation Breakdown (Unified System)</span>
                </h4>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span>Base Coins ({score} correct × 5):</span>
                    <span className="font-medium">{formatNumber(baseCoins)}</span>
                  </div>
                  {difficultyMultiplier > 1 && (
                    <div className="flex justify-between">
                      <span>Streak Multiplier ({difficultyMultiplier.toFixed(1)}x):</span>
                      <span className="font-medium">+{formatNumber(baseCoins * (difficultyMultiplier - 1))}</span>
                    </div>
                  )}
                  {speedBonus > 0 && (
                    <div className="flex justify-between">
                      <span>Speed Bonus (3s per question):</span>
                      <span className="font-medium">+{formatNumber(speedBonus)}</span>
                    </div>
                  )}
                  {perfectScoreBonus > 0 && (
                    <div className="flex justify-between">
                      <span>Perfect Score Bonus (50%):</span>
                      <span className="font-medium">+{formatNumber(perfectScoreBonus)}</span>
                    </div>
                  )}
                  {streakBonus > 0 && (
                    <div className="flex justify-between">
                      <span>Streak Bonus:</span>
                      <span className="font-medium">+{formatNumber(streakBonus)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold">
                    <span>Total Constitutional Coins:</span>
                    <span className="text-yellow-700">{formatNumber(totalCoinsCalculated)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Experience Points:</span>
                    <span className="text-blue-700">{formatNumber(totalXPCalculated)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                    💡 Uses unified PointCalculator for consistent rewards across all activities
                  </div>
                </div>
              </div>
            )}
            
            {userProfile && userProfile.currentStreak > 1 && (
              <div className="mt-3 text-center">
                <div className="inline-flex items-center space-x-2 bg-red-100 px-3 py-1 rounded-full">
                  <span className="text-sm">🔥</span>
                  <span className="text-sm font-medium text-red-700">
                    {userProfile.currentStreak} day streak bonus active!
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Main Score */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-navy mb-2">{score}/{totalQuestions}</div>
            <div className="text-lg text-gray-600">{percentage}% Correct</div>
          </div>

          {/* Visual Progress Ring */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className={percentage >= 70 ? 'text-green-500' : percentage >= 60 ? 'text-orange-500' : 'text-red-500'}
                  style={{
                    strokeDasharray: `${2 * Math.PI * 40}`,
                    strokeDashoffset: `${2 * Math.PI * 40 * (1 - percentage / 100)}`,
                    transition: 'stroke-dashoffset 0.5s ease-in-out'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-navy">{percentage}%</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-green-700">Correct</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalQuestions - score}</div>
              <div className="text-sm text-red-700">Incorrect</div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Time Taken */}
            {timeTaken && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{formatTime(timeTaken)}</div>
                <div className="text-sm text-blue-700">Time</div>
              </div>
            )}
            
            {/* Accuracy Badge */}
            <div className={`text-center p-3 rounded-lg ${performanceLevel.bg}`}>
              <div className={`text-lg font-bold ${performanceLevel.color}`}>
                {percentage >= 90 ? '⭐⭐⭐' : percentage >= 80 ? '⭐⭐' : percentage >= 70 ? '⭐' : '📚'}
              </div>
              <div className={`text-sm ${performanceLevel.color}`}>
                {percentage >= 90 ? 'Expert' : percentage >= 80 ? 'Advanced' : percentage >= 70 ? 'Good' : 'Learning'}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Message */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-navy mb-2 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Your Performance</span>
          </h3>
          <p className="text-gray-600 text-sm">
            {percentage >= 90
              ? "Outstanding! You have excellent knowledge of India's Constitution. Dr. Ambedkar would be proud of your dedication!"
              : percentage >= 80
              ? "Great job! You have strong understanding of constitutional concepts. A bit more practice will make you a constitutional expert!"
              : percentage >= 70
              ? "Good work! You understand most concepts well. Review the areas you missed and try again!"
              : percentage >= 60
              ? "Not bad! You have basic understanding. Spend more time learning the concepts and try the quiz again!"
              : "Keep learning! Don't worry - the Constitution is complex. Try reading Dr. Ambedkar's story first, then attempt the quiz!"}
          </p>
          
          {perfectScore && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                🏆 Perfect Score Achievement! You've demonstrated mastery of this topic. 
                This level of understanding helps carry forward Dr. Ambedkar's vision of an educated citizenry.
              </p>
            </div>
          )}
        </div>

        {/* Progress Encouragement */}
        {userProfile && (
          <div className="bg-gradient-to-r from-orange-100 to-green-100 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-navy mb-2">🎯 Your Journey</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <div>• Level {userProfile.profileLevel} Constitutional Scholar</div>
              <div>• {userProfile.achievements.length} achievements unlocked</div>
              <div>• {formatNumber(userProfile.constitutionalCoins)} Constitutional Coins earned</div>
              {userProfile.currentStreak > 0 && (
                <div>• {userProfile.currentStreak} day learning streak! 🔥</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full p-4 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
          >
            <span>🔄</span>
            <span>Try Again</span>
          </button>
          
          <button
            onClick={onBackToCategories}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Choose Different Category
          </button>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button className="p-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              📚 Read Story
            </button>
            <button className="p-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              🎮 Play Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;