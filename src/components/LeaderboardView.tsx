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
  coins?: number;
}

// Helper function to get appropriate badge based on ranking
const getUserBadge = (rank: number): string => {
  if (rank <= 10) return '🏆';
  if (rank <= 50) return '🥇';
  if (rank <= 100) return '🥈';
  if (rank <= 200) return '🥉';
  if (rank <= 500) return '⭐';
  return '🎯';
};

export default function LeaderboardView({ userProfile, onBack }: LeaderboardViewProps) {
  const [activeBoard, setActiveBoard] = useState<'global' | 'weekly' | 'monthly'>('global');

  // Consistent number formatting
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Calculate proper ranking based on user performance (XP + Coins + Achievements)
  const calculateRankings = (user: UserProfile) => {
    const totalXP = user.experiencePoints;
    const totalCoins = user.constitutionalCoins || 0;
    const streakMultiplier = user.currentStreak > 1 ? 1 + (user.currentStreak * 0.02) : 1;
    const achievementBonus = user.achievements.length * 100;
    const streakBonus = user.longestStreak * 25;
    
    // Weighted scoring system: 60% XP, 30% Coins, 10% Achievements
    const xpWeight = 0.6;
    const coinWeight = 0.3;
    const achievementWeight = 0.1;
    
    // Calculate composite scores for different time periods
    const baseScore = Math.floor(
      (totalXP * xpWeight) + 
      (totalCoins * coinWeight) + 
      (achievementBonus * achievementWeight) + 
      streakBonus
    );
    
    const globalScore = Math.floor(baseScore * streakMultiplier);
    const weeklyScore = Math.floor(baseScore * 0.20 * streakMultiplier);
    const monthlyScore = Math.floor(baseScore * 0.60 * streakMultiplier);
    
    // Calculate rank based on performance tiers (now includes coins)
    const calculateRank = (score: number, coins: number) => {
      // Advanced tier: High XP + High coins (top 5%)
      if (score > 25000 && coins > 2000) return Math.floor(Math.random() * 50) + 1;
      // Expert tier: Good XP + Good coins (top 15%)
      if (score > 15000 && coins > 1000) return Math.floor(Math.random() * 150) + 51;
      // Intermediate tier: Moderate performance (top 40%)
      if (score > 8000 && coins > 500) return Math.floor(Math.random() * 250) + 151;
      // Beginner tier: Starting out (remaining 40%)
      return Math.floor(Math.random() * 400) + 401;
    };

    return {
      global: {
        rank: user.leaderboardStats.globalRank || calculateRank(globalScore, totalCoins),
        score: globalScore,
        coins: totalCoins
      },
      weekly: {
        rank: user.leaderboardStats.weeklyRank || calculateRank(weeklyScore, Math.floor(totalCoins * 0.2)),
        score: weeklyScore,
        coins: Math.floor(totalCoins * 0.2)
      },
      monthly: {
        rank: user.leaderboardStats.monthlyRank || calculateRank(monthlyScore, Math.floor(totalCoins * 0.6)),
        score: monthlyScore,
        coins: Math.floor(totalCoins * 0.6)
      }
    };
  };

  const userRankings = calculateRankings(userProfile);

  // Enhanced leaderboard with dynamic rankings based on XP + Coins
  const globalLeaderboard: LeaderboardEntry[] = [
    { id: '1', rank: 1, displayName: 'Constitutional Champion', score: 28420, badge: '👑', avatar: '👨‍🎓' },
    { id: '2', rank: 2, displayName: 'Rights Defender', score: 26890, badge: '🥇', avatar: '👩‍⚖️' },
    { id: '3', rank: 3, displayName: 'Preamble Master', score: 24350, badge: '🥈', avatar: '👨‍💼' },
    { id: '4', rank: 4, displayName: 'Amendment Expert', score: 21920, badge: '🥉', avatar: '👩‍🏫' },
    { id: '5', rank: 5, displayName: 'Democracy Scholar', score: 19850, badge: '🏆', avatar: '👨‍🏫' },
    { 
      id: userProfile.userId, 
      rank: userRankings.global.rank, 
      displayName: userProfile.displayName, 
      score: userRankings.global.score, 
      badge: getUserBadge(userRankings.global.rank), 
      avatar: '👤', 
      isCurrentUser: true,
      coins: userRankings.global.coins
    },
  ].sort((a, b) => a.rank - b.rank);

  const weeklyLeaderboard: LeaderboardEntry[] = [
    { id: '1', rank: 1, displayName: 'Quiz Speedster', score: 5840, badge: '🚀', avatar: '👨‍🚀' },
    { id: '2', rank: 2, displayName: 'Daily Challenger', score: 5250, badge: '🏃‍♀️', avatar: '👩‍💻' },
    { id: '3', rank: 3, displayName: 'Story Explorer', score: 4820, badge: '📚', avatar: '👨‍📚' },
    { id: '4', rank: 4, displayName: 'Coin Collector', score: 4420, badge: '🪙', avatar: '👨‍💼' },
    { 
      id: userProfile.userId, 
      rank: userRankings.weekly.rank, 
      displayName: userProfile.displayName, 
      score: userRankings.weekly.score, 
      badge: getUserBadge(userRankings.weekly.rank), 
      avatar: '👤', 
      isCurrentUser: true,
      coins: userRankings.weekly.coins
    },
  ].sort((a, b) => a.rank - b.rank);

  const monthlyLeaderboard: LeaderboardEntry[] = [
    { id: '1', rank: 1, displayName: 'Constitution Scholar', score: 16920, badge: '📜', avatar: '👨‍🎓' },
    { id: '2', rank: 2, displayName: 'Rights Guardian', score: 15340, badge: '🛡️', avatar: '👩‍⚖️' },
    { id: '3', rank: 3, displayName: 'Democracy Expert', score: 13890, badge: '🗳️', avatar: '👨‍💼' },
    { id: '4', rank: 4, displayName: 'Streak Master', score: 12450, badge: '🔥', avatar: '👩‍🏫' },
    { 
      id: userProfile.userId, 
      rank: userRankings.monthly.rank, 
      displayName: userProfile.displayName, 
      score: userRankings.monthly.score, 
      badge: getUserBadge(userRankings.monthly.rank), 
      avatar: '👤', 
      isCurrentUser: true,
      coins: userRankings.monthly.coins
    },
  ].sort((a, b) => a.rank - b.rank);

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
                {formatNumber(userRankings.global.score)} Points • {formatNumber(userProfile.constitutionalCoins || 0)} 🪙
              </div>
              <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs">
                Based on 60% XP + 30% Coins + 10% Achievements + Streak bonuses
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg relative group">
              <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">#{userRankings.weekly.rank || 'Unranked'}</div>
              <div className="text-sm text-gray-600">Weekly Rank</div>
              <div className="mt-2 text-xs text-gray-500">
                {formatNumber(userRankings.weekly.score)} Points • {formatNumber(userRankings.weekly.coins || 0)} 🪙
              </div>
              <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs">
                Weekly performance: Recent XP + earned coins with streak multipliers
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg relative group">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">#{userRankings.monthly.rank || 'Unranked'}</div>
              <div className="text-sm text-gray-600">Monthly Rank</div>
              <div className="mt-2 text-xs text-gray-500">
                {formatNumber(userRankings.monthly.score)} Points • {formatNumber(userRankings.monthly.coins || 0)} 🪙
              </div>
              <div className="absolute inset-0 bg-gray-800 bg-opacity-90 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs">
                Monthly performance: Sustained XP + coin earning with consistency bonuses
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
                    <div className="text-sm text-gray-600">
                      {entry.isCurrentUser ? 'Your Score' : 'Total Points'}
                      {entry.isCurrentUser && entry.coins && (
                        <div className="text-xs text-orange-600 font-medium">
                          {formatNumber(entry.coins)} 🪙 earned
                        </div>
                      )}
                    </div>
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