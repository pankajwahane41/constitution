import React, { memo } from 'react';
import { UserProfile } from '../types/gamification';
import { Trophy, Zap, Target, Calendar, TrendingUp, Award } from 'lucide-react';

interface ProgressVisualizationProps {
  userProfile: UserProfile;
  className?: string;
}

const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  userProfile,
  className = ''
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
    <div className={`space-y-4 ${className}`}>
      {/* Level Progress Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-navy">Level {currentLevel}</h3>
              <p className="text-sm text-gray-600">{userProfile.experiencePoints} XP</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-navy">
              {nextLevelThreshold > currentLevelXP ? `${nextLevelThreshold - userProfile.experiencePoints} XP to next level` : 'Max Level!'}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-orange-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progressToNext, 100)}%` }}
          ></div>
        </div>
        
        {/* Progress Stats */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Level {currentLevel}</span>
          <span>Level {currentLevel + 1}</span>
        </div>
      </div>

      {/* Streak Progress Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-navy">Learning Streak</h3>
              <p className="text-sm text-gray-600">{userProfile.currentStreak} days</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-navy">{getStreakLevel()}</div>
            <div className="text-xs text-gray-500">Current streak</div>
          </div>
        </div>
        
        {/* Streak Visual */}
        <div className="flex items-center space-x-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-6 rounded-sm ${
                i < Math.min(userProfile.currentStreak, 7)
                  ? 'bg-gradient-to-r from-red-500 to-orange-500'
                  : 'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* Achievement Progress Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-navy">Achievements</h3>
              <p className="text-sm text-gray-600">{earnedAchievements} of {totalAchievements}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-navy">{achievementProgress.toFixed(0)}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
        
        {/* Achievement Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${achievementProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Constitutional Coins */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          </div>
          <div className="text-sm font-medium text-navy">{userProfile.constitutionalCoins}</div>
          <div className="text-xs text-gray-500">Coins</div>
        </div>

        {/* Study Time */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 text-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-sm font-medium text-navy">{Math.floor(userProfile.totalPlayTime / 60)}m</div>
          <div className="text-xs text-gray-500">Study Time</div>
        </div>
      </div>
    </div>
  );
};

// Memoized component for performance
const MemoizedProgressVisualization = memo(ProgressVisualization);
export default MemoizedProgressVisualization;
