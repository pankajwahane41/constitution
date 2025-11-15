import React, { memo } from 'react';
import { UserProfile } from '../types/gamification';
import { Trophy, Zap, Target, Calendar, TrendingUp, Award } from 'lucide-react';

interface ProgressVisualizationProps {
  userProfile: UserProfile;
  className?: string;
  onViewProgress?: () => void;
  onContinueStreak?: () => void;
  onViewBadges?: () => void;
}

const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  userProfile,
  className = '',
  onViewProgress,
  onContinueStreak,
  onViewBadges
}) => {
  // Calculate level progress
  const getCurrentLevel = () => {
    const levelThresholds = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000];
    let currentLevel = 1;
    
    for (let i = 0; i < levelThresholds.length; i++) {
      if (userProfile.experiencePoints >= levelThresholds[i]) {
        currentLevel = i + 1;
      } else {
        break;
      }
    }
    return currentLevel;
  };

  const currentLevel = getCurrentLevel();
  const nextLevelThreshold = currentLevel < 10 ? [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000][currentLevel] : userProfile.experiencePoints;
  const currentLevelXP = currentLevel > 1 ? [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000][currentLevel - 1] : 0;
  const progressToNext = nextLevelThreshold > currentLevelXP ? 
    ((userProfile.experiencePoints - currentLevelXP) / (nextLevelThreshold - currentLevelXP)) * 100 : 100;

  // Calculate streak progress
  const getStreakLevel = () => {
    if (userProfile.currentStreak >= 30) return 'Legendary';
    if (userProfile.currentStreak >= 14) return 'Expert';
    if (userProfile.currentStreak >= 7) return 'Advanced';
    if (userProfile.currentStreak >= 3) return 'Intermediate';
    return 'Beginner';
  };

  // Calculate achievement progress
  const totalAchievements = 50; // Estimated total achievements
  const earnedAchievements = userProfile.achievements.length;
  const achievementProgress = (earnedAchievements / totalAchievements) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level Progress Card - Story Tab Style */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm text-orange-600 font-medium">Level Progress</div>
          <Zap className="w-5 h-5 text-orange-500" />
        </div>

        <h3 className="text-lg font-bold text-navy mb-2">Level {currentLevel} Scholar</h3>
        <p className="text-sm text-gray-600 mb-4">{userProfile.experiencePoints} XP earned</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Current Progress</span>
          <div className="flex items-center space-x-1">
            <Target className="w-3 h-3" />
            <span>{nextLevelThreshold > currentLevelXP ? `${nextLevelThreshold - userProfile.experiencePoints} XP to next level` : 'Max Level!'}</span>
          </div>
        </div>

        <button 
          onClick={onViewProgress}
          className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
        >
          <Zap className="w-4 h-4" />
          <span>View Progress</span>
        </button>
      </div>

      {/* Streak Progress Card - Story Tab Style */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm text-orange-600 font-medium">Learning Streak</div>
          <TrendingUp className="w-5 h-5 text-orange-500" />
        </div>

        <h3 className="text-lg font-bold text-navy mb-2">{userProfile.currentStreak} Day Streak</h3>
        <p className="text-sm text-gray-600 mb-4">{getStreakLevel()} learner level</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Daily Progress</span>
          <div className="flex items-center space-x-1">
            <Trophy className="w-3 h-3" />
            <span>Keep it up!</span>
          </div>
        </div>

        <button 
          onClick={onContinueStreak}
          className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Continue Streak</span>
        </button>
      </div>

      {/* Achievement Progress Card - Story Tab Style */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm text-orange-600 font-medium">Achievements</div>
          <Award className="w-5 h-5 text-orange-500" />
        </div>

        <h3 className="text-lg font-bold text-navy mb-2">Badge Collection</h3>
        <p className="text-sm text-gray-600 mb-4">{earnedAchievements} of {totalAchievements} earned</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>Collection Progress</span>
          <div className="flex items-center space-x-1">
            <Trophy className="w-3 h-3" />
            <span>{achievementProgress.toFixed(0)}% Complete</span>
          </div>
        </div>

        <button 
          onClick={onViewBadges}
          className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
        >
          <Award className="w-4 h-4" />
          <span>View Badges</span>
        </button>
      </div>

      {/* Quick Stats Grid - Story Tab Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Constitutional Coins */}
        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
          <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-navy">{userProfile.constitutionalCoins}</div>
          <div className="text-sm text-gray-600">Constitutional Coins</div>
        </div>

        {/* Study Time */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
          <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-navy">{Math.floor(userProfile.totalPlayTime / 60)}m</div>
          <div className="text-sm text-gray-600">Study Time</div>
        </div>
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedProgressVisualization = memo(ProgressVisualization);
export default MemoizedProgressVisualization;
