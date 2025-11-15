// Standardized Point Calculator for University of Indian Constitution
// Provides consistent point calculation across all games and activities

import { 
  UserProfile, 
  GameDifficulty, 
  GameType,
  AchievementCategory 
} from '../types/gamification';

export interface QuizPerformance {
  totalQuestions: number;
  correctAnswers: number;
  perfectScore: boolean;
  responseTime?: number; // in milliseconds
  timeSpent?: number; // in seconds
  hintsUsed?: number;
}

export interface GamePerformance {
  score: number;
  accuracy: number; // 0-100
  timeSpent: number; // in seconds
  perfectGame: boolean;
  hintsUsed?: number;
  difficulty: GameDifficulty;
  gameType: GameType;
  level?: number;
  streakBonus?: number;
  speedBonus?: number;
}

export interface StreakBonus {
  currentStreak: number;
  streakMultiplier: number; // 0.0 - 1.0
}

export interface DailyLimits {
  dailyCoinsEarned: number;
  dailyCoinLimit: number;
  lastDailyReset: string;
}

export interface PointCalculationResult {
  coinsEarned: number;
  experienceGained: number;
  perfectScoreBonus: number;
  streakBonus: number;
  speedBonus: number;
  difficultyMultiplier: number;
  levelUp: boolean;
  achievementsUnlocked: string[];
}

/**
 * Unified Point Calculator for all educational activities
 * 
 * Features:
 * - Consistent coin/XP ratios across all activities
 * - Balanced earning potential with daily limits
 * - Achievement-based rewards with proper scaling
 * - Streak bonuses and perfect score multipliers
 * - Difficulty-based adjustments
 */
export class PointCalculator {
  public static readonly CONFIG = {
    // STANDARD UNIFIED SYSTEM CONFIGURATION
    // Base quiz points: 5 coins + 10 XP per correct answer
    QUIZ_BASE_COINS: 5, // 5 coins per correct answer
    QUIZ_BASE_XP: 10, // 10 XP per correct answer
    QUIZ_INCORRECT_PENALTY: 2, // 2 coins for incorrect answer
    QUIZ_INCORRECT_XP: 1, // 1 XP for incorrect answer
    
    // Perfect score bonus: +50% across all activities
    PERFECT_SCORE_BONUS: 0.5, // 50% bonus across all activities
    
    // Speed bonus: +10% for quiz completion under time limit
    SPEED_BONUS_THRESHOLD: 3000, // 3 seconds per question
    SPEED_BONUS_MULTIPLIER: 0.1, // 10% bonus
    
    // Streak bonuses: Increasing multipliers (1.1x, 1.2x, 1.3x)
    STREAK_MULTIPLIERS: {
      2: 1.1, // 1.1x for 2+ streak
      3: 1.2, // 1.2x for 3+ streak  
      4: 1.3, // 1.3x for 4+ streak
      5: 1.3  // 1.3x for 5+ streak (max)
    },
    MAX_STREAK_MULTIPLIER: 1.3,
    
    // Game completion: 25-75 coins based on performance score
    GAME_COMPLETION_MIN: 25,
    GAME_COMPLETION_MAX: 75,
    
    // Difficulty multipliers: Easy (0.8x), Medium (1.0x), Hard (1.2x)
    DIFFICULTY_MULTIPLIERS: {
      easy: 0.8,
      medium: 1.0,
      hard: 1.2,
      adaptive: 1.0
    },
    
    // XP conversion: 1 coin = 2 XP (standard ratio)
    XP_PER_COIN: 2,
    
    // Daily limits
    DEFAULT_DAILY_COIN_LIMIT: 500,
    
    // Minimum thresholds
    MIN_COINS_PER_ACTIVITY: 1,
    MIN_XP_PER_ACTIVITY: 5
  };

  /**
   * Calculate points for quiz completion using unified system
   * Base formula: 5 coins + 10 XP per correct answer
   * Perfect score bonus: +50% across all activities
   * Speed bonus: +10% for quiz completion under time limit
   * Streak bonuses: Increasing multipliers (1.1x, 1.2x, 1.3x)
   */
  static calculateQuizPoints(
    performance: QuizPerformance,
    userProfile?: UserProfile,
    currentStreak?: number
  ): PointCalculationResult {
    const { totalQuestions, correctAnswers, perfectScore, responseTime, hintsUsed = 0 } = performance;
    
    // Base calculation: 5 coins + 10 XP per correct answer
    const baseCoins = correctAnswers * this.CONFIG.QUIZ_BASE_COINS;
    const baseXP = correctAnswers * this.CONFIG.QUIZ_BASE_XP;
    
    // Apply streak multipliers (1.1x, 1.2x, 1.3x)
    let streakMultiplier = 1.0;
    if (currentStreak && currentStreak >= 2) {
      if (currentStreak >= 5) {
        streakMultiplier = this.CONFIG.STREAK_MULTIPLIERS[5];
      } else {
        streakMultiplier = this.CONFIG.STREAK_MULTIPLIERS[currentStreak as keyof typeof this.CONFIG.STREAK_MULTIPLIERS] || 1.1;
      }
    }
    
    let coinsEarned = Math.floor(baseCoins * streakMultiplier);
    let experienceGained = Math.floor(baseXP * streakMultiplier);
    
    // Speed bonus: +10% for quiz completion under time limit (3 seconds per question)
    let speedBonus = 0;
    if (responseTime && responseTime <= this.CONFIG.SPEED_BONUS_THRESHOLD) {
      speedBonus = Math.floor(coinsEarned * this.CONFIG.SPEED_BONUS_MULTIPLIER);
      coinsEarned += speedBonus;
      experienceGained += Math.floor(speedBonus * this.CONFIG.XP_PER_COIN);
    }
    
    // Perfect score bonus: +50% across all activities
    let perfectScoreBonus = 0;
    if (perfectScore) {
      perfectScoreBonus = Math.floor(coinsEarned * this.CONFIG.PERFECT_SCORE_BONUS);
      coinsEarned += perfectScoreBonus;
      experienceGained += Math.floor(perfectScoreBonus * this.CONFIG.XP_PER_COIN);
    }
    
    // Apply XP conversion ratio (1 coin = 2 XP)
    experienceGained = Math.max(experienceGained, Math.floor(coinsEarned * this.CONFIG.XP_PER_COIN));
    
    // Ensure minimum thresholds
    coinsEarned = Math.max(this.CONFIG.MIN_COINS_PER_ACTIVITY, coinsEarned);
    experienceGained = Math.max(this.CONFIG.MIN_XP_PER_ACTIVITY, experienceGained);
    
    // Achievement unlocks
    const achievementsUnlocked = this.checkQuizAchievements(performance, userProfile);
    
    // Level up check
    let levelUp = false;
    if (userProfile) {
      const newExp = userProfile.experiencePoints + experienceGained;
      const newLevel = this.calculateLevel(newExp);
      levelUp = newLevel > userProfile.profileLevel;
    }
    
    // Apply daily limits
    if (userProfile) {
      coinsEarned = this.enforceDailyLimits(coinsEarned, userProfile);
    }
    
    return {
      coinsEarned,
      experienceGained,
      perfectScoreBonus,
      streakBonus: coinsEarned - baseCoins,
      speedBonus,
      difficultyMultiplier: streakMultiplier,
      levelUp,
      achievementsUnlocked
    };
  }

  /**
   * Calculate points for game completion using unified system
   * Game completion: 25-75 coins based on performance score
   * Perfect score bonus: +50% across all activities
   * Difficulty multipliers: Easy (0.8x), Medium (1.0x), Hard (1.2x)
   * Streak bonuses: Increasing multipliers (1.1x, 1.2x, 1.3x)
   */
  static calculateGamePoints(
    performance: GamePerformance,
    userProfile?: UserProfile,
    currentStreak?: number
  ): PointCalculationResult {
    const { score, accuracy, timeSpent, perfectGame, hintsUsed = 0, difficulty, gameType } = performance;
    
    // Base coins from performance score (25-75 coins range)
    let baseCoins = Math.floor((score / 100) * this.CONFIG.GAME_COMPLETION_MAX);
    baseCoins = Math.max(this.CONFIG.GAME_COMPLETION_MIN, baseCoins);
    
    // Apply difficulty multipliers: Easy (0.8x), Medium (1.0x), Hard (1.2x)
    const difficultyMultiplier = this.CONFIG.DIFFICULTY_MULTIPLIERS[difficulty];
    let coinsEarned = Math.floor(baseCoins * difficultyMultiplier);
    
    // Apply streak multipliers (1.1x, 1.2x, 1.3x)
    let streakMultiplier = 1.0;
    if (currentStreak && currentStreak >= 2) {
      if (currentStreak >= 5) {
        streakMultiplier = this.CONFIG.STREAK_MULTIPLIERS[5];
      } else {
        streakMultiplier = this.CONFIG.STREAK_MULTIPLIERS[currentStreak as keyof typeof this.CONFIG.STREAK_MULTIPLIERS] || 1.1;
      }
    }
    coinsEarned = Math.floor(coinsEarned * streakMultiplier);
    
    // Perfect score bonus: +50% across all activities
    let perfectScoreBonus = 0;
    if (perfectGame) {
      perfectScoreBonus = Math.floor(coinsEarned * this.CONFIG.PERFECT_SCORE_BONUS);
      coinsEarned += perfectScoreBonus;
    }
    
    // Speed bonus (if applicable)
    let speedBonus = 0;
    const timeLimit = this.getTimeLimitForGame(gameType);
    if (timeLimit && timeSpent < timeLimit * 0.5) { // Completed in under 50% of time
      speedBonus = Math.floor(coinsEarned * this.CONFIG.SPEED_BONUS_MULTIPLIER);
      coinsEarned += speedBonus;
    }
    
    // Hint penalty
    if (hintsUsed > 0) {
      const hintPenalty = Math.min(hintsUsed * 5, Math.floor(coinsEarned * 0.3));
      coinsEarned = Math.max(this.CONFIG.MIN_COINS_PER_ACTIVITY, coinsEarned - hintPenalty);
    }
    
    // XP conversion: 1 coin = 2 XP
    let experienceGained = Math.floor(coinsEarned * this.CONFIG.XP_PER_COIN);
    
    // Ensure minimum thresholds
    coinsEarned = Math.max(this.CONFIG.MIN_COINS_PER_ACTIVITY, coinsEarned);
    experienceGained = Math.max(this.CONFIG.MIN_XP_PER_ACTIVITY, experienceGained);
    
    // Level up check
    let levelUp = false;
    if (userProfile) {
      const newExp = userProfile.experiencePoints + experienceGained;
      const newLevel = this.calculateLevel(newExp);
      levelUp = newLevel > userProfile.profileLevel;
      
      // Award level up bonus
      if (levelUp) {
        const levelBonus = (newLevel - userProfile.profileLevel) * 50;
        coinsEarned += levelBonus;
        levelUp = true;
      }
    }
    
    // Achievement unlocks
    const achievementsUnlocked = this.checkGameAchievements(performance, userProfile);
    
    // Apply daily limits
    if (userProfile) {
      coinsEarned = this.enforceDailyLimits(coinsEarned, userProfile);
    }
    
    return {
      coinsEarned,
      experienceGained,
      perfectScoreBonus,
      streakBonus: coinsEarned - Math.floor(baseCoins * difficultyMultiplier),
      speedBonus,
      difficultyMultiplier,
      levelUp,
      achievementsUnlocked
    };
  }

  /**
   * Calculate points for story reading completion
   */
  static calculateStoryPoints(
    timeSpent: number,
    sectionsCompleted: number,
    userProfile?: UserProfile
  ): PointCalculationResult {
    const baseCoins = sectionsCompleted * 10; // 10 coins per section
    const timeBonus = Math.max(0, Math.floor(timeSpent / 60)) * 2; // 2 coins per minute of engagement
    const coinsEarned = Math.min(baseCoins + timeBonus, 50); // Max 50 coins
    
    const experienceGained = Math.max(
      this.CONFIG.MIN_XP_PER_ACTIVITY,
      Math.floor(coinsEarned * this.CONFIG.XP_PER_COIN)
    );
    
    const achievementsUnlocked = this.checkStoryAchievements(sectionsCompleted, userProfile);
    
    // Apply daily limits
    if (userProfile) {
      const finalCoins = this.enforceDailyLimits(coinsEarned, userProfile);
      return {
        coinsEarned: finalCoins,
        experienceGained,
        perfectScoreBonus: 0,
        streakBonus: 0,
        speedBonus: 0,
        difficultyMultiplier: 1.0,
        levelUp: false,
        achievementsUnlocked
      };
    }
    
    return {
      coinsEarned,
      experienceGained,
      perfectScoreBonus: 0,
      streakBonus: 0,
      speedBonus: 0,
      difficultyMultiplier: 1.0,
      levelUp: false,
      achievementsUnlocked
    };
  }

  /**
   * Calculate points for daily challenges
   */
  static calculateChallengePoints(
    challengeType: string,
    completed: boolean,
    userProfile?: UserProfile
  ): PointCalculationResult {
    if (!completed) {
      return {
        coinsEarned: 0,
        experienceGained: 0,
        perfectScoreBonus: 0,
        streakBonus: 0,
        speedBonus: 0,
        difficultyMultiplier: 1.0,
        levelUp: false,
        achievementsUnlocked: []
      };
    }
    
    // Base challenge rewards
    const baseRewards = {
      quiz: 30,
      story: 20,
      mini_game: 35,
      constitution_builder: 50,
      streak: 25
    };
    
    const coinsEarned = baseRewards[challengeType as keyof typeof baseRewards] || 25;
    const experienceGained = Math.floor(coinsEarned * this.CONFIG.XP_PER_COIN);
    
    // Streak bonus for streak challenges
    let streakBonus = 0;
    if (challengeType === 'streak' && userProfile?.currentStreak) {
      streakBonus = userProfile.currentStreak * 2;
    }
    
    const totalCoins = coinsEarned + streakBonus;
    
    // Apply daily limits
    const finalCoins = userProfile ? this.enforceDailyLimits(totalCoins, userProfile) : totalCoins;
    
    const achievementsUnlocked = this.checkChallengeAchievements(challengeType, userProfile);
    
    return {
      coinsEarned: finalCoins,
      experienceGained,
      perfectScoreBonus: 0,
      streakBonus,
      speedBonus: 0,
      difficultyMultiplier: 1.0,
      levelUp: false,
      achievementsUnlocked
    };
  }

  /**
   * Calculate bonus points for achievements
   */
  static calculateAchievementBonus(
    achievementType: AchievementCategory,
    userLevel: number
  ): number {
    const baseBonuses = {
      knowledge: 50,
      mastery: 75,
      dedication: 60,
      exploration: 40,
      engagement: 30,
      social: 25,
      special: 100
    };
    
    const baseBonus = baseBonuses[achievementType] || 25;
    const levelBonus = userLevel * 5;
    
    return baseBonus + levelBonus;
  }

  /**
   * Enforce daily coin limits
   */
  private static enforceDailyLimits(requestedCoins: number, userProfile: UserProfile): number {
    const today = new Date().toDateString();
    const dailyCoinsEarned = userProfile.dailyCoinsEarned || 0;
    const dailyCoinLimit = userProfile.dailyCoinLimit || this.CONFIG.DEFAULT_DAILY_COIN_LIMIT;
    
    // Reset if new day
    if (userProfile.lastDailyReset !== today) {
      return requestedCoins; // Don't limit on new day reset
    }
    
    // Calculate remaining allowance
    const remainingAllowance = dailyCoinLimit - dailyCoinsEarned;
    
    // Return minimum of requested coins and remaining allowance
    return Math.min(requestedCoins, Math.max(0, remainingAllowance));
  }

  /**
   * Calculate user level from experience points
   */
  static calculateLevel(experience: number): number {
    const levelThresholds = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000];
    
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (experience >= levelThresholds[i]) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Get time limits for different game types (in seconds)
   */
  private static getTimeLimitForGame(gameType: GameType): number | null {
    const timeLimits = {
      constitutional_memory: 180, // 3 minutes
      rights_puzzle: 60, // 1 minute
      quiz_race: 300, // 5 minutes
      famous_cases: 180, // 3 minutes
      preamble_builder: 120, // 2 minutes
      amendment_timeline: 90, // 1.5 minutes
      constitution_builder: 600, // 10 minutes
      story_quiz: 180, // 3 minutes
      daily_challenge: 300 // 5 minutes
    };
    
    return timeLimits[gameType] || null;
  }

  /**
   * Check for quiz-related achievements
   */
  private static checkQuizAchievements(
    performance: QuizPerformance, 
    userProfile?: UserProfile
  ): string[] {
    const achievements: string[] = [];
    const { totalQuestions, correctAnswers, perfectScore } = performance;
    
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    // Perfect score achievement
    if (perfectScore && totalQuestions >= 10) {
      achievements.push('perfect_quiz_master');
    }
    
    // High accuracy achievement
    if (accuracy >= 90 && totalQuestions >= 5) {
      achievements.push('accuracy_expert');
    }
    
    return achievements;
  }

  /**
   * Check for game-related achievements
   */
  private static checkGameAchievements(
    performance: GamePerformance,
    userProfile?: UserProfile
  ): string[] {
    const achievements: string[] = [];
    const { score, accuracy, perfectGame, gameType } = performance;
    
    // Perfect game achievement
    if (perfectGame && score >= 90) {
      achievements.push(`${gameType}_master`);
    }
    
    // High score achievement
    if (score >= 95) {
      achievements.push('score_champion');
    }
    
    // Accuracy achievement
    if (accuracy >= 90) {
      achievements.push('accuracy_master');
    }
    
    return achievements;
  }

  /**
   * Check for story-related achievements
   */
  private static checkStoryAchievements(
    sectionsCompleted: number,
    userProfile?: UserProfile
  ): string[] {
    const achievements: string[] = [];
    
    // Story explorer achievement
    if (sectionsCompleted >= 5) {
      achievements.push('story_explorer');
    }
    
    return achievements;
  }

  /**
   * Check for challenge-related achievements
   */
  private static checkChallengeAchievements(
    challengeType: string,
    userProfile?: UserProfile
  ): string[] {
    const achievements: string[] = [];
    
    // Daily challenge completion
    achievements.push('daily_challenge_complete');
    
    return achievements;
  }

  /**
   * Get standardized game completion rewards range
   */
  static getGameCompletionRange(difficulty: GameDifficulty): { min: number; max: number } {
    const baseMin = this.CONFIG.GAME_COMPLETION_MIN;
    const baseMax = this.CONFIG.GAME_COMPLETION_MAX;
    const multiplier = this.CONFIG.DIFFICULTY_MULTIPLIERS[difficulty];
    
    return {
      min: Math.floor(baseMin * multiplier),
      max: Math.floor(baseMax * multiplier)
    };
  }

  /**
   * Get quiz question difficulty rewards
   */
  static getQuestionDifficultyReward(difficulty: GameDifficulty): number {
    const rewards = {
      easy: 5,
      medium: 7,
      hard: 10,
      adaptive: 6
    };
    
    return rewards[difficulty] || 5;
  }

  /**
   * Validate point calculation consistency
   */
  static validateCalculation(
    expectedCoins: number,
    actualCoins: number,
    activityType: 'quiz' | 'game' | 'story' | 'challenge'
  ): boolean {
    // Allow 10% variance for rounding
    const variance = Math.abs(expectedCoins - actualCoins) / Math.max(expectedCoins, 1);
    return variance <= 0.1;
  }

  /**
   * Get configuration summary for debugging
   */
  static getConfigurationSummary(): any {
    return {
      coinPerScorePoint: this.CONFIG.QUIZ_BASE_COINS,
      expPerCoin: this.CONFIG.XP_PER_COIN,
      quizBaseCoins: this.CONFIG.QUIZ_BASE_COINS,
      quizIncorrectPenalty: this.CONFIG.QUIZ_INCORRECT_PENALTY,
      quizPerfectMultiplier: this.CONFIG.PERFECT_SCORE_BONUS,
      gameCompletionRange: {
        min: this.CONFIG.GAME_COMPLETION_MIN,
        max: this.CONFIG.GAME_COMPLETION_MAX
      },
      speedBonusThreshold: this.CONFIG.SPEED_BONUS_THRESHOLD,
      speedBonusAmount: this.CONFIG.SPEED_BONUS_MULTIPLIER,
      streakBonusMultipliers: this.CONFIG.STREAK_MULTIPLIERS,
      perfectScoreBonus: this.CONFIG.PERFECT_SCORE_BONUS,
      difficultyMultipliers: this.CONFIG.DIFFICULTY_MULTIPLIERS,
      defaultDailyCoinLimit: this.CONFIG.DEFAULT_DAILY_COIN_LIMIT
    };
  }

  /**
   * Public getters for CONFIG values - provides clean API access
   */
  static getQuizBaseCoins(): number {
    return this.CONFIG.QUIZ_BASE_COINS;
  }

  static getQuizBaseXP(): number {
    return this.CONFIG.QUIZ_BASE_XP;
  }

  static getQuizIncorrectPenalty(): number {
    return this.CONFIG.QUIZ_INCORRECT_PENALTY;
  }

  static getQuizIncorrectXP(): number {
    return this.CONFIG.QUIZ_INCORRECT_XP;
  }

  static getPerfectScoreBonus(): number {
    return this.CONFIG.PERFECT_SCORE_BONUS;
  }

  static getSpeedBonusThreshold(): number {
    return this.CONFIG.SPEED_BONUS_THRESHOLD;
  }

  static getSpeedBonusMultiplier(): number {
    return this.CONFIG.SPEED_BONUS_MULTIPLIER;
  }

  static getStreakMultipliers(): { [key: number]: number } {
    return this.CONFIG.STREAK_MULTIPLIERS;
  }

  static getMaxStreakMultiplier(): number {
    return this.CONFIG.MAX_STREAK_MULTIPLIER;
  }

  static getGameCompletionMin(): number {
    return this.CONFIG.GAME_COMPLETION_MIN;
  }

  static getGameCompletionMax(): number {
    return this.CONFIG.GAME_COMPLETION_MAX;
  }

  static getDifficultyMultipliers(): { [key: string]: number } {
    return this.CONFIG.DIFFICULTY_MULTIPLIERS;
  }

  static getXPPerCoin(): number {
    return this.CONFIG.XP_PER_COIN;
  }

  static getDefaultDailyCoinLimit(): number {
    return this.CONFIG.DEFAULT_DAILY_COIN_LIMIT;
  }

  static getMinCoinsPerActivity(): number {
    return this.CONFIG.MIN_COINS_PER_ACTIVITY;
  }

  static getMinXPPerActivity(): number {
    return this.CONFIG.MIN_XP_PER_ACTIVITY;
  }
}

export default PointCalculator;
