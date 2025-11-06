// Leaderboard View Component
// Shows global and competitive rankings

import React, { useState } from 'react';
import { UserProfile } from '../types/gamification';
import { Trophy, Medal, Crown, Star, Target, Zap, Users, Calendar, HelpCircle } from 'lucide-react';

interface LeaderboardViewProps {
  userProfile: UserProfile;
  onBack: () => void;
}

interface LeaderboardEntry {
  id: string;
  rank: number;
  displayName: string;
  score: number;
  badge: string;
  avatar: string;
  isCurrentUser?: boolean;
}

export default function LeaderboardView({ userProfile, onBack }: LeaderboardViewProps) {
  const [activeBoard, setActiveBoard] = useState<'global' | 'weekly' | 'monthly'>('global');

  // Consistent number formatting
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Calculate proper ranking based on user performance
  const calculateRankings = (user: UserProfile) => {
    const totalXP = user.experiencePoints;
    const streakMultiplier = user.currentStreak > 1 ? 1 + (user.currentStreak * 0.01) : 1;
    const achievementBonus = user.achievements.length * 50;
    
    // Calculate weighted score for different time periods
    const globalScore = Math.floor(totalXP + achievementBonus);
    const weeklyScore = Math.floor(totalXP * 0.15 * streakMultiplier);
    const monthlyScore = Math.floor(totalXP * 0.45 * streakMultiplier);
    
    // Estimate rank based on score (mock calculation)
    const estimateRank = (score: number) => {
      if (score > 15000) return Math.floor(Math.random() * 50) + 1;
      if (score > 10000) return Math.floor(Math.random() * 100) + 51;
      if (score > 5000) return Math.floor(Math.random() * 200) + 151;
      return Math.floor(Math.random() * 500) + 351;
    };

    return {
      global: {
        rank: user.leaderboardStats.globalRank || estimateRank(globalScore),
        score: globalScore
      },
      weekly: {
        rank: user.leaderboardStats.weeklyRank || estimateRank(weeklyScore),
        score: weeklyScore
      },
      monthly: {
        rank: user.leaderboardStats.monthlyRank || estimateRank(monthlyScore),
        score: monthlyScore
      }
    };
  };

  const userRankings = calculateRankings(userProfile);

  // Enhanced mock leaderboard data with proper calculations
  const globalLeaderboard: LeaderboardEntry[] = [
    { id: '1', rank: 1, displayName: 'Constitutional Champion', score: 15420, badge: '👑', avatar: '👨‍🎓' },
    { id: '2', rank: 2, displayName: 'Rights Defender', score: 14890, badge: '🥇', avatar: '👩‍⚖️' },
    { id: '3', rank: 3, displayName: 'Preamble Master', score: 14350, badge: '🥈', avatar: '👨‍💼' },
    { id: '4', rank: 4, displayName: 'Amendment Expert', score: 13920, badge: '🥉', avatar: '👩‍🏫' },
    { 
      id: userProfile.userId, 
      rank: userRankings.global.rank, 
      displayName: userProfile.displayName, 
      score: userRankings.global.score, 
      badge: '⭐', 
      avatar: '👤', 
      isCurrentUser: true 
    },
  ];

  const weeklyLeaderboard: LeaderboardEntry[] = [
    { id: '1', rank: 1, displayName: 'Quiz Speedster', score: 2840, badge: '🚀', avatar: '👨‍🚀' },
    { id: '2', rank: 2, displayName: 'Daily Challenger', score: 2650, badge: '🏃‍♀️', avatar: '👩‍💻' },
    { id: '3', rank: 3, displayName: 'Story Explorer', score: 2420, badge: '📚', avatar: '👨‍📚' },
    { 
      id: userProfile.userId, 
      rank: userRankings.weekly.rank, 
      displayName: userProfile.displayName, 
      score: userRankings.weekly.score, 
      badge: '⭐', 
      avatar: '👤', 
      isCurrentUser: true 
    },
  ];

  const monthlyLeaderboard: LeaderboardEntry[] = [
    { id: '1', rank: 1, displayName: 'Constitution Scholar', score: 8920, badge: '📜', avatar: '👨‍🎓' },
    { id: '2', rank: 2, displayName: 'Rights Guardian', score: 8340, badge: '🛡️', avatar: '👩‍⚖️' },
    { id: '3', rank: 3, displayName: 'Democracy Expert', score: 7890, badge: '🗳️', avatar: '👨‍💼' },
    { 
      id: userProfile.userId, 
      rank: userRankings.monthly.rank, 
      displayName: userProfile.displayName, 
      score: userRankings.monthly.score, 
      badge: '⭐', 
      avatar: '👤', 
      isCurrentUser: true 
    },
  ];

  const getCurrentLeaderboard = () => {
    switch (activeBoard) {
      case 'weekly': return weeklyLeaderboard;
      case 'monthly': return monthlyLeaderboard;
      default: return globalLeaderboard;
    }
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
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <HelpCircle className="w-4 h-4" />
              <span>Click for details</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg relative group">
              <Trophy className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">#{userRankings.global.rank || 'Unranked'}</div>
              <div className="text-sm text-gray-600">Global Rank</div>
              <div className="mt-2 text-xs text-gray-500">
                {formatNumber(userRankings.global.score)} XP
              </div>
              <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs">
                Based on total XP + achievements earned across all time
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg relative group">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">#{userRankings.weekly.rank || 'Unranked'}</div>
              <div className="text-sm text-gray-600">Weekly Rank</div>
              <div className="mt-2 text-xs text-gray-500">
                {formatNumber(userRankings.weekly.score)} XP
              </div>
              <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs">
                Recent activity with streak multiplier for the current week
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg relative group">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">#{userRankings.monthly.rank || 'Unranked'}</div>
              <div className="text-sm text-gray-600">Monthly Rank</div>
              <div className="mt-2 text-xs text-gray-500">
                {formatNumber(userRankings.monthly.score)} XP
              </div>
              <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs">
                Monthly performance with consistent learning streak bonuses
              </div>
            </div>
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
                  key={entry.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                    entry.isCurrentUser
                      ? 'border-orange-200 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="text-2xl">{entry.avatar}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${entry.isCurrentUser ? 'text-orange-700' : 'text-navy'}`}>
                        {entry.displayName}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="px-2 py-1 bg-orange-200 text-orange-700 text-xs rounded-full">You</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">#{entry.rank}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-navy">{formatNumber(entry.score)}</div>
                    <div className="text-sm text-gray-600">Experience Points</div>
                  </div>
                  
                  <div className="text-2xl">{entry.badge}</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}