import React, { useState, useEffect, memo } from 'react';
import { UserProfile } from '../types/gamification';
import { 
  Trophy, 
  Star, 
  Gift, 
  Zap, 
  Target, 
  TrendingUp, 
  Award,
  Flame,
  Calendar,
  CheckCircle,
  Crown,
  Sparkles
} from 'lucide-react';

interface UserMotivationSystemProps {
  userProfile: UserProfile;
  onQuickAction: (action: string) => void;
  className?: string;
}

const UserMotivationSystem: React.FC<UserMotivationSystemProps> = ({
  userProfile,
  onQuickAction,
  className = ''
}) => {
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeReward, setActiveReward] = useState<any>(null);

  // Motivational messages based on user state
  const getMotivationalMessage = () => {
    const { currentStreak, experiencePoints, profileLevel } = userProfile;
    
    if (currentStreak >= 30) {
      return "Incredible! You're a constitutional master with an amazing 30+ day streak! 🏆";
    } else if (currentStreak >= 7) {
      return `Fantastic! Your ${currentStreak}-day streak shows real dedication! 💪`;
    } else if (experiencePoints >= 5000) {
      return "Outstanding! You've earned over 5000 XP - you're becoming an expert! 🌟";
    } else if (profileLevel >= 5) {
      return "Great progress! You're at level 5 and climbing! 🚀";
    } else {
      return "Every expert was once a beginner. Start your constitutional journey today! ✨";
    }
  };

  // Generate daily challenges
  const getDailyChallenges = () => {
    const challenges = [
      {
        id: 'daily-quiz',
        title: 'Daily Quiz',
        description: 'Complete one constitutional quiz',
        icon: Trophy,
        progress: 0, // This would be calculated from user data
        target: 1,
        reward: { coins: 25, xp: 50 }
      },
      {
        id: 'study-time',
        title: 'Study Time',
        description: 'Study for 15 minutes',
        icon: Target,
        progress: 0,
        target: 15,
        reward: { coins: 15, xp: 30 }
      },
      {
        id: 'module-complete',
        title: 'Module Mastery',
        description: 'Complete one learning module',
        icon: Star,
        progress: 0,
        target: 1,
        reward: { coins: 50, xp: 100 }
      }
    ];

    return challenges;
  };

  // Upcoming rewards and milestones
  const getUpcomingRewards = () => {
    const rewards = [
      {
        id: 'level-up',
        title: 'Level 5',
        description: 'Reach profile level 5',
        current: userProfile.profileLevel,
        target: 5,
        icon: Crown,
        color: 'gold'
      },
      {
        id: 'streak-10',
        title: '10-Day Streak',
        description: 'Maintain learning for 10 days',
        current: userProfile.currentStreak,
        target: 10,
        icon: Flame,
        color: 'red'
      },
      {
        id: 'xp-3000',
        title: '3000 XP',
        description: 'Accumulate 3000 experience points',
        current: userProfile.experiencePoints,
        target: 3000,
        icon: Zap,
        color: 'blue'
      }
    ];

    return rewards;
  };

  // Achievement celebrations
  const triggerCelebration = (type: string, data?: any) => {
    setActiveReward({ type, data });
    setShowCelebration(true);
    
    setTimeout(() => {
      setShowCelebration(false);
      setActiveReward(null);
    }, 3000);
  };

  useEffect(() => {
    setMotivationalMessage(getMotivationalMessage());
  }, [userProfile]);

  const dailyChallenges = getDailyChallenges();
  const upcomingRewards = getUpcomingRewards();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-lg font-bold">Keep Going!</h3>
        </div>
        <p className="text-white/90 leading-relaxed">{motivationalMessage}</p>
      </div>

      {/* Daily Challenges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-navy">Daily Challenges</h3>
        </div>
        
        <div className="space-y-4">
          {dailyChallenges.map((challenge) => {
            const IconComponent = challenge.icon;
            const progressPercentage = (challenge.progress / challenge.target) * 100;
            const isCompleted = challenge.progress >= challenge.target;
            
            return (
              <div
                key={challenge.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCompleted 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy">{challenge.title}</h4>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <button
                      onClick={() => onQuickAction(challenge.id)}
                      className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                    >
                      Start
                    </button>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {challenge.progress}/{challenge.target}
                  </span>
                  <span className="text-sm text-gray-600">
                    +{challenge.reward.coins} coins, +{challenge.reward.xp} XP
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Rewards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Gift className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-navy">Upcoming Rewards</h3>
        </div>
        
        <div className="space-y-3">
          {upcomingRewards.map((reward) => {
            const IconComponent = reward.icon;
            const progressPercentage = (reward.current / reward.target) * 100;
            const isUnlocked = reward.current >= reward.target;
            
            return (
              <div
                key={reward.id}
                className={`p-4 rounded-lg border-2 ${
                  isUnlocked 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isUnlocked ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${isUnlocked ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-navy">{reward.title}</h4>
                      {isUnlocked && (
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {reward.current}/{reward.target}
                  </span>
                  <span className="text-sm font-medium text-navy">
                    {Math.min(progressPercentage, 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <Flame className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-navy">{userProfile.currentStreak}</div>
          <div className="text-xs text-gray-600">Day Streak</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-navy">{userProfile.experiencePoints.toLocaleString()}</div>
          <div className="text-xs text-gray-600">XP</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <div className="text-lg font-bold text-navy">{userProfile.profileLevel}</div>
          <div className="text-xs text-gray-600">Level</div>
        </div>
      </div>

      {/* Celebration Overlay */}
      {showCelebration && activeReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-2">Congratulations!</h3>
            <p className="text-gray-600">
              {activeReward.type === 'level-up' && 'You leveled up!'}
              {activeReward.type === 'streak' && 'Amazing streak!'}
              {activeReward.type === 'achievement' && 'New achievement unlocked!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized component for performance
const MemoizedUserMotivationSystem = memo(UserMotivationSystem);
export default MemoizedUserMotivationSystem;
