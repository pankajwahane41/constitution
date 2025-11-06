import React from 'react';
import { UserProfile } from '../types/gamification';
import { GamificationEngine } from '../lib/gamification';
import { AmbedkarStoryMode } from '../lib/storyMode';
import { BookOpen, Trophy, Star, Gamepad2, Building, Users, ArrowRight, Award, Zap } from 'lucide-react';

interface HomeProps {
  onSelectMode: (mode: 'home' | 'learn' | 'quiz' | 'profile' | 'story' | 'games' | 'builder' | 'leaderboard') => void;
  isLoading: boolean;
  userProfile: UserProfile | null;
  storyMode: AmbedkarStoryMode;
  gamificationEngine: GamificationEngine | null;
}

const Home: React.FC<HomeProps> = ({ 
  onSelectMode, 
  isLoading, 
  userProfile, 
  storyMode, 
  gamificationEngine 
}) => {
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your constitutional journey...</p>
        </div>
      </div>
    );
  }

  const storyProgress = storyMode.getReadingProgress(userProfile);
  const nextChapter = storyMode.getNextChapter(userProfile);
  const recentAchievements = userProfile.achievements.slice(-3);

  const activities = [
    {
      id: 'learn',
      title: 'Learn',
      description: 'Discover constitutional concepts through interactive modules',
      icon: BookOpen,
      color: 'orange',
      stats: `${userProfile.completedModules?.length || 0} modules completed`
    },
    {
      id: 'quiz',
      title: 'Quiz',
      description: 'Test your knowledge with comprehensive quizzes on all constitutional topics',
      icon: Trophy,
      color: 'green',
      stats: 'Challenge yourself with 1200+ questions across 12 categories'
    },
    {
      id: 'story',
      title: 'Dr. Ambedkar\'s Journey',
      description: 'Follow the master architect\'s constitutional story',
      icon: Star,
      color: 'blue',
      stats: `${storyProgress.chaptersCompleted}/${storyProgress.totalChapters} chapters`
    },
    {
      id: 'games',
      title: 'Mini Games',
      description: 'Learn through fun constitutional games',
      icon: Gamepad2,
      color: 'purple',
      stats: 'Interactive learning'
    },
    {
      id: 'builder',
      title: 'Constitution Builder',
      description: 'Build your own constitutional framework',
      icon: Building,
      color: 'indigo',
      stats: 'Create and explore'
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      description: 'Compete with other constitutional scholars',
      icon: Users,
      color: 'pink',
      stats: `Rank #${userProfile.leaderboardStats.globalRank || 'Unranked'}`
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; icon: string; text: string }> = {
      orange: { bg: 'bg-orange-100', border: 'border-orange-500', icon: 'text-orange-600', text: 'text-orange-500' },
      green: { bg: 'bg-green-100', border: 'border-green-500', icon: 'text-green-600', text: 'text-green-500' },
      blue: { bg: 'bg-blue-100', border: 'border-blue-500', icon: 'text-blue-600', text: 'text-blue-500' },
      purple: { bg: 'bg-purple-100', border: 'border-purple-500', icon: 'text-purple-600', text: 'text-purple-500' },
      indigo: { bg: 'bg-indigo-100', border: 'border-indigo-500', icon: 'text-indigo-600', text: 'text-indigo-500' },
      pink: { bg: 'bg-pink-100', border: 'border-pink-500', icon: 'text-pink-600', text: 'text-pink-500' }
    };
    return colorMap[color] || colorMap.orange;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - University Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-full shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="university-title text-navy mb-2">
            University of Indian Constitution
          </h1>
          <p className="university-subtitle text-gray-600 max-w-3xl mx-auto">
            Your comprehensive platform for constitutional learning, featuring interactive modules, 
            gamified quizzes, and Dr. Ambedkar's inspiring journey.
          </p>
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">🏛️</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-4">
            Welcome back, {userProfile.displayName}!
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Continue your constitutional journey with engaging content, achievements, and interactive experiences.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-orange-600">{userProfile.profileLevel}</div>
            <div className="text-sm text-gray-600">Level</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-yellow-600">{userProfile.constitutionalCoins.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Coins</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-red-600">{userProfile.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md text-center">
            <div className="text-2xl font-bold text-green-600">{userProfile.achievements.length}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>

        {/* Continue Learning Section */}
        {nextChapter && (
          <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-xl p-6 mb-8 text-white">
            <h2 className="text-xl font-bold mb-2">Continue Dr. Ambedkar's Journey</h2>
            <p className="text-orange-100 mb-4">
              Next: {nextChapter.title} - {nextChapter.subtitle}
            </p>
            <button
              onClick={() => onSelectMode('story')}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
            >
              <Star className="w-5 h-5" />
              <span>Continue Reading</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Learning Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {activities.map((activity) => {
            const colors = getColorClasses(activity.color);
            const IconComponent = activity.icon;
            
            return (
              <button
                key={activity.id}
                onClick={() => onSelectMode(activity.id as any)}
                disabled={isLoading}
                className={`w-full p-6 bg-white rounded-xl shadow-md border-l-4 ${colors.border} hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left group`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy text-lg mb-1">{activity.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                    <div className={`text-xs font-medium ${colors.text}`}>{activity.stats}</div>
                  </div>
                  <ArrowRight className={`w-5 h-5 ${colors.text} group-hover:translate-x-1 transition-transform`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy">Recent Achievements</h2>
              <button
                onClick={() => onSelectMode('profile')}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <h4 className="font-semibold text-navy text-sm">{achievement.title}</h4>
                      <p className="text-gray-600 text-xs">{achievement.description}</p>
                      {achievement.unlockedAt && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Features */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-navy mb-4 flex items-center space-x-2">
            <Award className="w-6 h-6 text-blue-600" />
            <span>Your Constitutional University</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-navy mb-2">Learning Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 1,451 interactive quiz questions</li>
                <li>• Dr. Ambedkar's complete journey (6 chapters)</li>
                <li>• 125+ achievement badges to earn</li>
                <li>• Constitutional mini-games and puzzles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-navy mb-2">Gamification:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Virtual Constitutional Coins system</li>
                <li>• Avatar customization with cultural elements</li>
                <li>• Daily learning streaks and challenges</li>
                <li>• Social leaderboards and competitions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;