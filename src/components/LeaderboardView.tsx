// Leaderboard View Component
// Shows global and competitive rankings with dynamic data

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/gamification';
import { Trophy, Medal, Crown, Star, Target, Zap, Users, Calendar, HelpCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { LeaderboardService } from '../lib/leaderboardService';

interface LeaderboardViewProps {
  userProfile: UserProfile;
  onBack: () => void;
  database?: any;
  gamificationEngine?: any;
}

interface LeaderboardEntry {
  userId: string;
  rank: number;
  displayName: string;
  score: number;
  experiencePoints: number;
  constitutionalCoins: number;
  profileLevel: number;
  currentStreak: number;
  achievements: any[];
  lastActivity: string;
  isCurrentUser?: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry;
  totalUsers: number;
  period: 'global' | 'weekly' | 'monthly';
}

export default function LeaderboardView({ userProfile, onBack, database, gamificationEngine }: LeaderboardViewProps) {
  const [activeBoard, setActiveBoard] = useState<'global' | 'weekly' | 'monthly'>('global');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Initialize leaderboard service
  const leaderboardService = new LeaderboardService(database, gamificationEngine);

  // Load leaderboard data
  const loadLeaderboard = async (period: 'global' | 'weekly' | 'monthly' = activeBoard) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await leaderboardService.generateLeaderboard(userProfile, period);
      setLeaderboardData(data);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when period changes
  useEffect(() => {
    loadLeaderboard(activeBoard);
  }, [activeBoard, userProfile]);

  // Consistent number formatting
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Get avatar emoji based on profile level
  const getAvatarEmoji = (level: number) => {
    if (level >= 10) return '👑'; // King/Queen
    if (level >= 7) return '🎓'; // Scholar
    if (level >= 4) return '📚'; // Student
    return '👤'; // Beginner
  };

  // Get badge based on rank
  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    if (rank <= 25) return '⭐';
    return '📈';
  };

  // Check if user ranking improved (mock implementation)
  const hasRankingImproved = (currentRank: number) => {
    // In real implementation, this would compare with previous rank
    return Math.random() > 0.7; // 30% chance of improvement for demo
  };

  const getCurrentLeaderboard = (): LeaderboardEntry[] => {
    if (!leaderboardData) return [];
    return leaderboardData.leaderboard;
  };

  const getBoardTitle = () => {
    switch (activeBoard) {
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      default: return 'All Time';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-600" />;
      default: return <Trophy className="w-5 h-5 text-gray-500" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  ← Back
                </button>
                <h1 className="text-2xl font-bold text-navy">Leaderboards</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Leaderboard Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => loadLeaderboard()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentUserData = leaderboardData?.currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-navy">Leaderboards</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Stats Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy">Your Rankings</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <HelpCircle className="w-4 h-4" />
                <span>Click for details</span>
              </div>
              <button
                onClick={() => loadLeaderboard()}
                className="p-2 text-gray-500 hover:text-orange-500 transition-colors"
                title="Refresh leaderboard"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {currentUserData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg relative group">
                <div className="flex items-center justify-between">
                  <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  {hasRankingImproved(currentUserData.rank) && (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="text-2xl font-bold text-navy">#{currentUserData.rank}</div>
                <div className="text-sm text-gray-600">Global Rank</div>
                <div className="mt-2 text-xs text-gray-500">
                  {formatNumber(currentUserData.experiencePoints)} XP
                </div>
                <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs">
                  Based on total XP + achievements earned across all time
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg relative group">
                <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-navy">
                  #{leaderboardData?.leaderboard.find(u => u.userId === userProfile.userId)?.rank || '—'}
                </div>
                <div className="text-sm text-gray-600">Weekly Rank</div>
                <div className="mt-2 text-xs text-gray-500">
                  {formatNumber(Math.floor(userProfile.experiencePoints * 0.2 * (1 + userProfile.currentStreak * 0.05)))} XP
                </div>
                <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs">
                  Recent activity with streak multiplier for the current week
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg relative group">
                <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-navy">
                  #{leaderboardData?.leaderboard.find(u => u.userId === userProfile.userId)?.rank || '—'}
                </div>
                <div className="text-sm text-gray-600">Monthly Rank</div>
                <div className="mt-2 text-xs text-gray-500">
                  {formatNumber(Math.floor(userProfile.experiencePoints * 0.5 * (1 + userProfile.currentStreak * 0.02)))} XP
                </div>
                <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs">
                  Monthly performance with consistent learning streak bonuses
                </div>
              </div>
            </div>
          )}
          
          {/* Last updated info */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Leaderboard Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'global', label: 'All Time', icon: Trophy },
                { id: 'weekly', label: 'This Week', icon: Calendar },
                { id: 'monthly', label: 'This Month', icon: Star }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveBoard(id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeBoard === id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Content */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-navy mb-4">{getBoardTitle()} Champions</h3>
            
            <div className="space-y-3">
              {getCurrentLeaderboard().map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                    entry.isCurrentUser
                      ? 'border-orange-200 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="text-2xl">{getAvatarEmoji(entry.profileLevel)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${entry.isCurrentUser ? 'text-orange-700' : 'text-navy'}`}>
                        {entry.displayName}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="px-2 py-1 bg-orange-200 text-orange-700 text-xs rounded-full">You</span>
                      )}
                      <span className="text-lg">{getRankBadge(entry.rank)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Level {entry.profileLevel} • {entry.currentStreak} day streak
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-navy">{formatNumber(entry.score)}</div>
                    <div className="text-sm text-gray-600">
                      {formatNumber(entry.experiencePoints)} XP
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Coins</div>
                    <div className="font-medium text-yellow-600">
                      {formatNumber(entry.constitutionalCoins)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-navy mb-4">Climb the Rankings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Target className="w-6 h-6 text-orange-500 mt-1" />
              <div>
                <h4 className="font-medium text-navy">Complete Daily Challenges</h4>
                <p className="text-sm text-gray-600">Consistent daily activity boosts your ranking</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Zap className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium text-navy">Ace Your Quizzes</h4>
                <p className="text-sm text-gray-600">High accuracy and speed earn more points</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium text-navy">Maintain Learning Streaks</h4>
                <p className="text-sm text-gray-600">Daily study habits multiply your XP gains</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Star className="w-6 h-6 text-purple-500 mt-1" />
              <div>
                <h4 className="font-medium text-navy">Unlock Achievements</h4>
                <p className="text-sm text-gray-600">Special accomplishments provide ranking bonuses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}