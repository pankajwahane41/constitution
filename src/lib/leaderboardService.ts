import { ConstitutionDB } from './storage';
import { UserProfile } from '../types/gamification';
import { GamificationEngine } from './gamification';

// Mock leaderboard data for demonstration
interface MockUser {
  userId: string;
  displayName: string;
  experiencePoints: number;
  constitutionalCoins: number;
  profileLevel: number;
  currentStreak: number;
  achievements: any[];
  lastActivity: string;
}

export class LeaderboardService {
  private db: ConstitutionDB | null = null;
  private gamificationEngine: GamificationEngine | null = null;

  constructor(database?: ConstitutionDB, gamificationEngine?: GamificationEngine) {
    this.db = database || null;
    this.gamificationEngine = gamificationEngine || null;
  }

  // Generate realistic mock users based on current user profile
  private generateMockUsers(currentUser: UserProfile): MockUser[] {
    const currentXP = currentUser.experiencePoints;
    const currentCoins = currentUser.constitutionalCoins;
    const currentLevel = currentUser.profileLevel;
    
    // Create diverse mock competitors around user's level
    const mockUsers: MockUser[] = [];
    
    // Top performers (higher than current user)
    for (let i = 0; i < 5; i++) {
      const level = Math.max(1, currentLevel + Math.floor(Math.random() * 5) + 1);
      const xp = level * 1000 + Math.floor(Math.random() * 2000);
      const coins = Math.floor(xp * 0.3) + Math.floor(Math.random() * 1000);
      const streak = Math.floor(Math.random() * 30) + 1;
      
      mockUsers.push({
        userId: `top_user_${i}`,
        displayName: this.getRandomDisplayName('top'),
        experiencePoints: xp,
        constitutionalCoins: coins,
        profileLevel: level,
        currentStreak: streak,
        achievements: this.generateMockAchievements(level),
        lastActivity: this.getRandomRecentDate()
      });
    }
    
    // Mid-level competitors (around user's level)
    for (let i = 0; i < 8; i++) {
      const levelVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const level = Math.max(1, currentLevel + levelVariation);
      const xp = Math.max(100, currentXP + Math.floor(Math.random() * 2000) - 1000);
      const coins = Math.max(50, currentCoins + Math.floor(Math.random() * 800) - 400);
      const streak = Math.floor(Math.random() * 10);
      
      mockUsers.push({
        userId: `mid_user_${i}`,
        displayName: this.getRandomDisplayName('mid'),
        experiencePoints: xp,
        constitutionalCoins: coins,
        profileLevel: level,
        currentStreak: streak,
        achievements: this.generateMockAchievements(level),
        lastActivity: this.getRandomRecentDate()
      });
    }
    
    // Lower level competitors
    for (let i = 0; i < 7; i++) {
      const level = Math.max(1, currentLevel - Math.floor(Math.random() * 3) - 1);
      const xp = Math.max(50, level * 500 + Math.floor(Math.random() * 800));
      const coins = Math.floor(xp * 0.2) + Math.floor(Math.random() * 300);
      const streak = Math.floor(Math.random() * 5);
      
      mockUsers.push({
        userId: `low_user_${i}`,
        displayName: this.getRandomDisplayName('low'),
        experiencePoints: xp,
        constitutionalCoins: coins,
        profileLevel: level,
        currentStreak: streak,
        achievements: this.generateMockAchievements(level),
        lastActivity: this.getRandomRecentDate()
      });
    }
    
    return mockUsers;
  }

  private getRandomDisplayName(level: 'top' | 'mid' | 'low'): string {
    const titles = {
      top: ['Constitutional Champion', 'Rights Defender', 'Preamble Master', 'Amendment Expert', 'Democracy Hero'],
      mid: ['Student Scholar', 'Quiz Adventurer', 'Learning Explorer', 'Constitution Learner', 'History Buff'],
      low: ['New Student', 'Curious Learner', 'Beginner Explorer', 'Study Buddy', 'Learning Newbie']
    };
    
    const names = level === 'top' ? titles.top : level === 'mid' ? titles.mid : titles.low;
    return names[Math.floor(Math.random() * names.length)];
  }

  private generateMockAchievements(level: number): any[] {
    const achievements = [];
    for (let i = 0; i < Math.min(level, 5); i++) {
      achievements.push({ id: `achievement_${i}`, name: `Level ${i + 1} Master` });
    }
    return achievements;
  }

  private getRandomRecentDate(): string {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 7); // Within last week
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
  }

  // Calculate weighted scores for different leaderboard periods
  private calculateScores(user: UserProfile | MockUser): { global: number; weekly: number; monthly: number } {
    const totalXP = 'experiencePoints' in user ? user.experiencePoints : 0;
    const coins = 'constitutionalCoins' in user ? user.constitutionalCoins : 0;
    const streak = 'currentStreak' in user ? user.currentStreak : 0;
    const achievements = 'achievements' in user ? user.achievements : [];
    
    // Global score: Total XP + coins bonus + achievement bonus
    const achievementBonus = achievements.length * 100;
    const globalScore = Math.floor(totalXP + coins * 0.1 + achievementBonus);
    
    // Weekly score: Recent activity with streak multiplier
    const weeklyMultiplier = 1 + (streak * 0.05);
    const weeklyScore = Math.floor(totalXP * 0.2 * weeklyMultiplier);
    
    // Monthly score: Medium-term activity
    const monthlyMultiplier = 1 + (streak * 0.02);
    const monthlyScore = Math.floor(totalXP * 0.5 * monthlyMultiplier);
    
    return { global: globalScore, weekly: weeklyScore, monthly: monthlyScore };
  }

  // Generate dynamic leaderboard data
  public async generateLeaderboard(currentUser: UserProfile, period: 'global' | 'weekly' | 'monthly' = 'global') {
    try {
      // Generate mock users for competitive environment
      const mockUsers = this.generateMockUsers(currentUser);
      
      // Add current user to the list
      const allUsers = [...mockUsers, {
        userId: currentUser.userId,
        displayName: currentUser.displayName,
        experiencePoints: currentUser.experiencePoints,
        constitutionalCoins: currentUser.constitutionalCoins,
        profileLevel: currentUser.profileLevel,
        currentStreak: currentUser.currentStreak,
        achievements: currentUser.achievements,
        lastActivity: new Date().toISOString()
      }];
      
      // Calculate scores for all users
      const usersWithScores = allUsers.map(user => ({
        ...user,
        scores: this.calculateScores(user)
      }));
      
      // Sort by the requested period score
      const sortedUsers = usersWithScores
        .sort((a, b) => b.scores[period] - a.scores[period])
        .map((user, index) => ({
          ...user,
          rank: index + 1,
          score: user.scores[period]
        }));
      
      // Find current user's position
      const currentUserRank = sortedUsers.find(user => user.userId === currentUser.userId);
      
      return {
        leaderboard: sortedUsers.slice(0, 20), // Top 20
        currentUser: currentUserRank,
        totalUsers: sortedUsers.length,
        period: period
      };
      
    } catch (error) {
      console.error('Error generating leaderboard:', error);
      throw error;
    }
  }

  // Update user ranking based on recent activity
  public async updateUserRanking(userProfile: UserProfile, activity: 'quiz_completion' | 'module_completion' | 'game_completion') {
    try {
      // In a real implementation, this would:
      // 1. Calculate new score based on activity
      // 2. Update ranking in database
      // 3. Check for rank changes
      // 4. Trigger celebrations for rank improvements
      
      console.log(`Updated ranking for user ${userProfile.userId} after ${activity}`);
      
      // For now, just return the updated profile
      return userProfile;
      
    } catch (error) {
      console.error('Error updating user ranking:', error);
      throw error;
    }
  }

  // Get user's rank history (for trend analysis)
  public async getUserRankHistory(userId: string): Promise<Array<{ date: string; globalRank: number; weeklyRank: number; monthlyRank: number }>> {
    // Mock implementation - in real app, this would fetch from database
    const history = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      history.push({
        date: date.toISOString(),
        globalRank: Math.floor(Math.random() * 100) + 1,
        weeklyRank: Math.floor(Math.random() * 50) + 1,
        monthlyRank: Math.floor(Math.random() * 75) + 1
      });
    }
    
    return history;
  }

  // Get achievements that would improve ranking
  public async getRankingAchievements(currentUser: UserProfile): Promise<Array<{ achievement: string; rankImprovement: number; pointsRequired: number }>> {
    const currentXP = currentUser.experiencePoints;
    const nextLevelXP = (currentUser.profileLevel + 1) * 1000;
    const xpNeeded = nextLevelXP - currentXP;
    
    return [
      {
        achievement: 'Complete 5 more quizzes',
        rankImprovement: 5,
        pointsRequired: xpNeeded * 0.1
      },
      {
        achievement: 'Maintain 7-day streak',
        rankImprovement: 10,
        pointsRequired: xpNeeded * 0.2
      },
      {
        achievement: 'Finish all learning modules',
        rankImprovement: 15,
        pointsRequired: xpNeeded * 0.3
      }
    ];
  }
}