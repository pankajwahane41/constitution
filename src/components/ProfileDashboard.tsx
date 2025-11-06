// Profile Dashboard Component for University of Indian Constitution
// Shows user achievements, badges, avatar customization, and progress stats

import React, { useState } from 'react';
import { UserProfile, Achievement, Badge } from '../types/gamification';
import { AvatarSystem } from '../lib/avatarSystem';
import { User, Trophy, Star, Coins, Zap, Calendar, Target, Edit3, ArrowLeft, Crown, Award, HelpCircle } from 'lucide-react';

// Level calculation constants
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000];

// Calculate level based on experience points
const calculateLevel = (experiencePoints: number): number => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (experiencePoints >= LEVEL_THRESHOLDS[i]) {
      return i;
    }
  }
  return 0;
};

// Consistent number formatting function
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Tooltip component for stat items
const StatItemTooltip = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => {
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

// Calculate progress percentage to next level
const calculateLevelProgress = (experiencePoints: number): number => {
  const currentLevel = calculateLevel(experiencePoints);
  const currentLevelMin = LEVEL_THRESHOLDS[currentLevel];
  const nextLevelMin = LEVEL_THRESHOLDS[currentLevel + 1] || LEVEL_THRESHOLDS[currentLevel];
  
  if (nextLevelMin === currentLevelMin) return 100; // Max level
  
  const progress = (experiencePoints - currentLevelMin) / (nextLevelMin - currentLevelMin);
  return Math.min(100, Math.max(0, Math.round(progress * 100)));
};

interface ProfileDashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  avatarSystem: AvatarSystem;
  onBack: () => void;
  achievements: Achievement[];
  badges: Badge[];
}

export default function ProfileDashboard({
  userProfile,
  onUpdateProfile,
  avatarSystem,
  onBack,
  achievements,
  badges
}: ProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'badges' | 'avatar' | 'stats'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile.displayName);

  const handleSaveProfile = async () => {
    await onUpdateProfile({ displayName });
    setIsEditing(false);
  };

  const completedAchievements = achievements.filter(a => a.unlockedAt);
  const earnedBadges = badges.filter(b => b.earnedAt);
  const progressPercentage = calculateLevelProgress(userProfile.experiencePoints);

  const stats = [
    { label: 'Level', value: userProfile.profileLevel, icon: Zap, color: 'blue', tooltip: 'Your current constitutional scholar level based on total XP earned' },
    { 
      label: 'Constitutional Coins', 
      value: formatNumber(userProfile.constitutionalCoins), 
      icon: Coins, 
      color: 'yellow', 
      tooltip: 'Total Constitutional Coins earned through quizzes, achievements, and daily challenges. Used for unlocking content and rewards.' 
    },
    { 
      label: 'Current Streak', 
      value: `${userProfile.currentStreak} days`, 
      icon: Target, 
      color: 'red',
      tooltip: 'Consecutive days of learning activity. Longer streaks earn bonus coins and XP!'
    },
    { 
      label: 'Achievements', 
      value: completedAchievements.length, 
      icon: Trophy, 
      color: 'green',
      tooltip: 'Completed achievements that unlock special rewards and badges'
    },
    { 
      label: 'Badges Earned', 
      value: earnedBadges.length, 
      icon: Award, 
      color: 'purple',
      tooltip: 'Special badges earned for mastering different constitutional topics and skills'
    },
    { 
      label: 'Total Play Time', 
      value: `${Math.floor(userProfile.totalPlayTime / 60)}h ${userProfile.totalPlayTime % 60}m`, 
      icon: Calendar, 
      color: 'gray',
      tooltip: 'Total time spent learning about the Constitution across all activities'
    }
  ];

  const TabButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? 'bg-orange-500 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-navy">Your Profile</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-6">
            {/* Avatar Preview */}
            <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-green-200 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-orange-600" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="text-2xl font-bold text-navy bg-gray-100 px-3 py-1 rounded-lg border-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={handleSaveProfile}
                      className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setDisplayName(userProfile.displayName);
                        setIsEditing(false);
                      }}
                      className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-navy">{userProfile.displayName}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span>Constitutional Scholar since {new Date(userProfile.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Last active: {new Date(userProfile.lastLoginAt).toLocaleDateString()}</span>
              </div>

              {/* Level Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Level {userProfile.profileLevel}</span>
                  <span className="text-sm text-gray-500">{userProfile.experiencePoints} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{formatNumber(userProfile.constitutionalCoins)}</div>
                <div className="text-sm text-gray-600">Constitutional Coins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userProfile.currentStreak}</div>
                <div className="text-sm text-gray-600">Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          <TabButton id="overview" label="Overview" icon={User} />
          <TabButton id="achievements" label="Achievements" icon={Trophy} />
          <TabButton id="badges" label="Badges" icon={Award} />
          <TabButton id="avatar" label="Avatar" icon={Crown} />
          <TabButton id="stats" label="Statistics" icon={Target} />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-navy">{stat.value}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-1">
                      <span>{stat.label}</span>
                      {stat.tooltip && (
                        <HelpCircle className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                {stat.tooltip && (
                  <StatItemTooltip tooltip={stat.tooltip}>
                    <div className="mt-3 text-xs text-gray-500 text-center">
                      Hover for details
                    </div>
                  </StatItemTooltip>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-navy mb-6">Your Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    achievement.unlockedAt 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-navy">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      
                      {achievement.unlockedAt ? (
                        <div className="text-xs text-green-600 font-medium">
                          Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-purple-600 font-medium capitalize">
                        {achievement.rarity} • {achievement.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-navy mb-6">Your Badge Collection</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map(badge => (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 text-center transition-all hover:shadow-md ${
                    badge.earnedAt 
                      ? 'border-yellow-200 bg-yellow-50' 
                      : 'border-gray-200 bg-gray-50 opacity-40'
                  }`}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold text-navy text-sm">{badge.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                  
                  {badge.earnedAt && (
                    <div className="text-xs text-yellow-600 font-medium">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                  
                  <div className="flex justify-center mt-2">
                    {[...Array(badge.level)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'avatar' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-navy mb-6">Customize Your Avatar</h3>
            <div className="text-center text-gray-600">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-200 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-16 h-16 text-orange-600" />
              </div>
              <p className="mb-4">Avatar customization system coming soon!</p>
              <p className="text-sm">Unlock cultural elements, clothing, and accessories by earning achievements and Constitutional Coins.</p>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Learning Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-navy mb-6">Learning Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{userProfile.storyProgress.chaptersCompleted.length}</div>
                  <div className="text-gray-600">Story Chapters Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{userProfile.storyProgress.totalReadingTime}min</div>
                  <div className="text-gray-600">Total Reading Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{userProfile.completedModules?.length || 0}</div>
                  <div className="text-gray-600">Modules Completed</div>
                </div>
              </div>
            </div>

            {/* Leaderboard Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-navy mb-6">Competitive Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-lg font-semibold text-navy mb-2">Rankings</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Global Rank:</span>
                      <span className="font-medium">#{userProfile.leaderboardStats.globalRank || 'Unranked'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekly Rank:</span>
                      <span className="font-medium">#{userProfile.leaderboardStats.weeklyRank || 'Unranked'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rank:</span>
                      <span className="font-medium">#{userProfile.leaderboardStats.monthlyRank || 'Unranked'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-navy mb-2">Performance</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quiz Accuracy:</span>
                      <span className="font-medium">{userProfile.leaderboardStats.quizAccuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Quiz Time:</span>
                      <span className="font-medium">{userProfile.leaderboardStats.averageQuizTime}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Study Streak:</span>
                      <span className="font-medium">{userProfile.leaderboardStats.studyStreak} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}