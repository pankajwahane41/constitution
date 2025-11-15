// Achievement Modal Component
// Shows celebration when achievements are unlocked

import React, { useState } from 'react';
import { Achievement } from '../types/gamification';
import { X, Trophy, Star, Coins, Zap, HelpCircle } from 'lucide-react';

interface AchievementModalProps {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
  celebrationType: 'achievement' | 'badge' | 'level_up' | 'streak' | 'perfect_score';
}

export default function AchievementModal({
  achievements,
  isOpen,
  onClose,
  celebrationType
}: AchievementModalProps) {
  if (!isOpen) return null;

  // Consistent number formatting
  const formatNumber = (num: number | string): string => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    return isNaN(numValue) ? '0' : numValue.toLocaleString();
  };

  // Tooltip for reward types
  const RewardTooltip = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    return (
      <div 
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
        {showTooltip && (
          <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 max-w-xs">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  };

  const getModalTitle = () => {
    switch (celebrationType) {
      case 'badge':
        return 'New Badge Earned!';
      case 'level_up':
        return 'Level Up!';
      case 'streak':
        return 'Streak Milestone!';
      case 'perfect_score':
        return 'Perfect Score!';
      default:
        return 'Achievement Unlocked!';
    }
  };

  const getModalIcon = () => {
    switch (celebrationType) {
      case 'badge':
        return <Star className="w-16 h-16 text-yellow-500" />;
      case 'level_up':
        return <Zap className="w-16 h-16 text-blue-500" />;
      case 'streak':
        return <span className="text-6xl">🔥</span>;
      case 'perfect_score':
        return <span className="text-6xl">⭐</span>;
      default:
        return <Trophy className="w-16 h-16 text-orange-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center relative animate-bounce">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          {getModalIcon()}
        </div>

        <h2 className="text-2xl font-bold text-navy mb-4">{getModalTitle()}</h2>

        {achievements.length > 0 ? (
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-navy">{achievement.title}</h3>
                <p className="text-gray-600 text-sm">{achievement.description}</p>
                
                {achievement.rewards && (
                  <div className="mt-3 flex justify-center space-x-4">
                    {achievement.rewards.map((reward, index) => (
                      <RewardTooltip 
                        key={index} 
                        tooltip={
                          reward.type === 'coins' 
                            ? 'Constitutional Coins: Used for unlocking premium content and special features'
                            : 'Experience Points: Contribute to leveling up and increasing your constitutional scholar rank'
                        }
                      >
                        <div className="flex items-center space-x-1 text-sm bg-gray-50 px-2 py-1 rounded-full">
                          {reward.type === 'coins' && <Coins className="w-4 h-4 text-yellow-500" />}
                          {reward.type === 'experience' && <Zap className="w-4 h-4 text-blue-500" />}
                          <span className="font-medium">
                            +{formatNumber(reward.value)} {reward.type === 'coins' ? 'Constitutional Coins' : 'XP'}
                          </span>
                          <HelpCircle className="w-3 h-3 text-gray-400" />
                        </div>
                      </RewardTooltip>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-600 mb-6">
            {celebrationType === 'level_up' && "Congratulations on reaching a new level!"}
            {celebrationType === 'perfect_score' && "Amazing! You got every question right!"}
            {celebrationType === 'streak' && "Keep up the great learning streak!"}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
}