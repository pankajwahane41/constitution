import React from 'react';
import { UserProfile } from '../types/gamification';
import { GamificationEngine } from '../lib/gamification';
import { AmbedkarStoryMode } from '../lib/storyMode';
import { BookOpen, Trophy, Star, Gamepad2, Building, Users, ArrowRight, Award, Zap, Play } from 'lucide-react';
import '../styles/professional-responsive.css';

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 w-full max-w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 overflow-x-hidden">
        {/* Elegant Hero Section - Story Tab Style */}
        <div className="text-center mb-12">
          <BookOpen className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-navy mb-4">
            Welcome back, {userProfile.displayName}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Continue your journey through India's Constitution with interactive learning, 
            Dr. Ambedkar's inspiring story, and gamified challenges.
          </p>
        </div>

        {/* Progress Stats - Story Tab Style */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Learning Progress</span>
            <span className="text-sm text-gray-500">Level {userProfile.profileLevel}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((userProfile.experiencePoints / (userProfile.profileLevel * 100)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid - Story Tab Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
            <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-navy">{userProfile.profileLevel}</div>
            <div className="text-sm text-gray-600">Level</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-navy">{userProfile.constitutionalCoins.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Coins</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-navy">{userProfile.currentStreak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-navy">{userProfile.achievements.length}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>

        {/* Continue Story Section - Story Tab Style */}
        {nextChapter && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-200 hover:border-orange-300 transition-all mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm text-orange-600 font-medium">Dr. Ambedkar's Journey</div>
              <BookOpen className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-navy mb-2">Continue Reading</h3>
            <p className="text-sm text-gray-600 mb-4">Next: {nextChapter.title}</p>
            <button
              onClick={() => onSelectMode('story')}
              className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              style={{ touchAction: 'manipulation' }}
            >
              <Play className="w-4 h-4" />
              <span>Continue Story</span>
            </button>
          </div>
        )}

        {/* Learning Activities Grid - Story Tab Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-full mb-8">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            
            return (
              <div
                key={activity.id}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => onSelectMode(activity.id as any)}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-sm text-orange-600 font-medium">{activity.stats}</div>
                  <IconComponent className="w-5 h-5 text-orange-500" />
                </div>

                <h3 className="text-lg font-bold text-navy mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{activity.description}</p>

                <button 
                  className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  <Play className="w-4 h-4" />
                  <span>Start Learning</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Recent Achievements - Story Tab Style */}
        {recentAchievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-navy">Recent Achievements</h3>
              <button
                onClick={() => onSelectMode('profile')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                style={{ touchAction: 'manipulation' }}
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-bold text-navy">{achievement.title}</div>
                  <div className="text-xs text-gray-600">{achievement.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default Home;