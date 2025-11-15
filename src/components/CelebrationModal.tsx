// Celebration Modal Component
// Animated celebration overlay for achievements

import React, { useEffect } from 'react';

interface CelebrationModalProps {
  type: 'achievement' | 'badge' | 'level_up' | 'streak' | 'perfect_score';
  isOpen: boolean;
  onClose: () => void;
  data?: any[];
}

export default function CelebrationModal({
  type,
  isOpen,
  onClose,
  data
}: CelebrationModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getCelebrationEmoji = () => {
    switch (type) {
      case 'badge':
        return '🏆';
      case 'level_up':
        return '⚡';
      case 'streak':
        return '🔥';
      case 'perfect_score':
        return '⭐';
      default:
        return '🎉';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 pointer-events-none">
      <div className="text-center animate-pulse">
        <div className="text-8xl mb-4 animate-bounce">{getCelebrationEmoji()}</div>
        <div className="text-2xl font-bold text-white bg-black bg-opacity-50 px-6 py-3 rounded-full">
          {type === 'level_up' && 'Level Up!'}
          {type === 'perfect_score' && 'Perfect Score!'}
          {type === 'streak' && 'Streak Milestone!'}
          {type === 'badge' && 'New Badge!'}
          {type === 'achievement' && 'Achievement Unlocked!'}
        </div>
      </div>
    </div>
  );
}