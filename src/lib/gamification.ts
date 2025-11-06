// Enhanced Gamification Engine for University of Indian Constitution
// Handles achievements, badges, virtual currency, and progression systems with proper timing and synchronization
// UNIFIED SYSTEM: Fully integrated with PointCalculator for consistent point calculations

import { 
  UserProfile, 
  Achievement, 
  Badge, 
  QuizSession, 
  GameificationConfig,
  AchievementCategory,
  BadgeCategory,
  Reward,
  GameDifficulty,
  GameType
} from '../types/gamification';
import { ConstitutionDB } from './storage';
import TimeSync, { DateUtils } from './timeSync';
import AtomicStateManager from './atomicStateManager';
import DailyResetService from './dailyResetService';
import PointCalculator, { 
  QuizPerformance, 
  GamePerformance, 
  StreakBonus, 
  DailyLimits, 
  PointCalculationResult 
} from './pointCalculator';

// UNIFIED GAMIFICATION SYSTEM
// Using PointCalculator for all point calculations - no separate configuration needed
// All values aligned with PointCalculator constants for consistency

export class GamificationEngine {
  private db: ConstitutionDB;
  private timeSync: TimeSync;
  private stateManager: AtomicStateManager;
  private dailyResetService: DailyResetService;
  private achievements: Achievement[] = [];
  private badges: Badge[] = [];
  private initialized = false;

  constructor(db: ConstitutionDB) {
    this.db = db;
    this.timeSync = TimeSync.getInstance();
    this.stateManager = AtomicStateManager.getInstance(db);
    this.dailyResetService = DailyResetService.getInstance(db);
    this.initializeAchievements();
    this.initializeBadges();
    this.initialized = true;
    console.log('GamificationEngine initialized with time synchronization');
  }

  // Enhanced daily coin tracking with UTC timing
  async initializeDailyCoinTracking(profile: UserProfile): Promise<UserProfile> {
    const todayUTC = this.timeSync.getCurrentUTCDate();
    
    // Initialize daily tracking fields if not present
    if (profile.dailyCoinsEarned === undefined) {
      profile.dailyCoinsEarned = 0;
    }
    if (profile.dailyCoinLimit === undefined) {
      profile.dailyCoinLimit = 500; // PointCalculator.CONFIG.DEFAULT_DAILY_COIN_LIMIT
    }
    if (profile.lastDailyReset === undefined) {
      profile.lastDailyReset = todayUTC;
    }
    
    // Reset daily coins if it's a new day (UTC-based)
    if (profile.lastDailyReset !== todayUTC) {
      profile.dailyCoinsEarned = 0;
      profile.lastDailyReset = todayUTC;
    }
    
    await this.db.saveUserProfile(profile);
    return profile;
  }

  // Enhanced atomic daily reset
  async resetDailyCoinCounter(profile: UserProfile): Promise<void> {
    const todayUTC = this.timeSync.getCurrentUTCDate();
    profile.dailyCoinsEarned = 0;
    profile.lastDailyReset = todayUTC;
    await this.db.saveUserProfile(profile);
  }

  // Enhanced daily coin limit enforcement with UTC timing
  private async enforceDailyCoinLimit(profile: UserProfile, requestedCoins: number): Promise<number> {
    const todayUTC = this.timeSync.getCurrentUTCDate();
    
    // Don't award negative coins or zero coins
    if (requestedCoins <= 0) {
      return 0;
    }
    
    // Initialize daily tracking if needed
    await this.initializeDailyCoinTracking(profile);
    
    // Reset daily counter if it's a new day (UTC-based)
    if (profile.lastDailyReset !== todayUTC) {
      await this.resetDailyCoinCounter(profile);
    }
    
    // Calculate remaining daily allowance
    const remainingDailyAllowance = profile.dailyCoinLimit - profile.dailyCoinsEarned;
    
    // Return the minimum of requested coins and remaining allowance
    const coinsToAward = Math.min(requestedCoins, Math.max(0, remainingDailyAllowance));
    
    return coinsToAward;
  }

  // Enhanced atomic coin awarding
  async awardCoinsWithLimit(profile: UserProfile, requestedCoins: number, reason: string): Promise<number> {
    const coinsToAward = await this.enforceDailyCoinLimit(profile, requestedCoins);
    
    if (coinsToAward > 0) {
      const result = await this.stateManager.updateProfileAtomic('default', {
        constitutionalCoins: profile.constitutionalCoins + coinsToAward,
        dailyCoinsEarned: profile.dailyCoinsEarned + coinsToAward
      }, `coin_award_${reason}`);
      
      if (result.success && result.profile) {
        profile.constitutionalCoins = result.profile.constitutionalCoins;
        profile.dailyCoinsEarned = result.profile.dailyCoinsEarned;
      }
    }
    
    return coinsToAward;
  }

  // Achievement System with Time-Based Tracking
  private initializeAchievements(): void {
    this.achievements = [
      // Knowledge Achievements
      {
        id: 'first_quiz',
        userId: '',
        title: 'First Steps',
        description: 'Complete your first quiz',
        category: 'knowledge',
        type: 'quiz_completion',
        icon: '🎯',
        requirements: [{ type: 'count', target: 1, current: 0 }],
        rewards: [{ type: 'coins', value: 50, description: '50 Constitutional Coins' }],
        progress: 0,
        isVisible: true,
        rarity: 'common'
      },
      {
        id: 'quiz_master',
        userId: '',
        title: 'Quiz Master',
        description: 'Complete 50 quizzes',
        category: 'knowledge',
        type: 'quiz_completion',
        icon: '🏆',
        requirements: [{ type: 'count', target: 50, current: 0 }],
        rewards: [
          { type: 'coins', value: 500, description: '500 Constitutional Coins' },
          { type: 'badge', value: 'quiz_champion', description: 'Quiz Champion Badge' }
        ],
        progress: 0,
        isVisible: true,
        rarity: 'epic'
      },
      {
        id: 'perfect_score_streak',
        userId: '',
        title: 'Perfection Streak',
        description: 'Get perfect scores on 5 consecutive quizzes',
        category: 'mastery',
        type: 'perfect_score',
        icon: '⭐',
        requirements: [{ type: 'streak', target: 5, current: 0 }],
        rewards: [
          { type: 'coins', value: 200, description: '200 Constitutional Coins' },
          { type: 'avatar_item', value: 'golden_crown', description: 'Golden Crown for Avatar' }
        ],
        progress: 0,
        isVisible: true,
        rarity: 'rare'
      },
      {
        id: 'speed_learner',
        userId: '',
        title: 'Speed Learner',
        description: 'Complete a quiz in under 2 minutes with 90%+ score',
        category: 'mastery',
        type: 'time_based',
        icon: '⚡',
        requirements: [
          { type: 'time', target: 120, current: 0 },
          { type: 'score', target: 90, current: 0 }
        ],
        rewards: [
          { type: 'coins', value: 150, description: '150 Constitutional Coins' },
          { type: 'avatar_item', value: 'lightning_badge', description: 'Lightning Badge' }
        ],
        progress: 0,
        isVisible: true,
        rarity: 'rare'
      },
      {
        id: 'daily_learner',
        userId: '',
        title: 'Daily Learner',
        description: 'Maintain a 7-day learning streak',
        category: 'dedication',
        type: 'streak',
        icon: '🔥',
        requirements: [{ type: 'streak', target: 7, current: 0 }],
        rewards: [
          { type: 'coins', value: 100, description: '100 Constitutional Coins' },
          { type: 'badge', value: 'daily_learner', description: 'Daily Learner Badge' }
        ],
        progress: 0,
        isVisible: true,
        rarity: 'common'
      },
      {
        id: 'ambedkar_scholar',
        userId: '',
        title: 'Ambedkar Scholar',
        description: 'Complete Dr. Ambedkar\'s journey story mode',
        category: 'exploration',
        type: 'story_progress',
        icon: '👨‍🎓',
        requirements: [{ type: 'completion', target: 6, current: 0, condition: 'ambedkar_journey' }],
        rewards: [
          { type: 'badge', value: 'ambedkar_scholar', description: 'Ambedkar Scholar Badge' },
          { type: 'coins', value: 400, description: '400 Constitutional Coins' },
          { type: 'title', value: 'Constitution Scholar', description: 'Special Title' }
        ],
        progress: 0,
        isVisible: true,
        rarity: 'legendary'
      },
      {
        id: 'constitution_architect',
        userId: '',
        title: 'Constitution Architect',
        description: 'Complete the Virtual Constitution Builder',
        category: 'exploration',
        type: 'constitution_builder',
        icon: '🏛️',
        requirements: [{ type: 'completion', target: 1, current: 0 }],
        rewards: [
          { type: 'badge', value: 'constitution_architect', description: 'Constitution Architect Badge' },
          { type: 'coins', value: 600, description: '600 Constitutional Coins' },
          { type: 'avatar_item', value: 'architect_blueprint', description: 'Architect Blueprint' }
        ],
        progress: 0,
        isVisible: true,
        rarity: 'legendary'
      },
      {
        id: 'game_champion',
        userId: '',
        title: 'Game Champion',
        description: 'Win 20 mini-games',
        category: 'mastery',
        type: 'mini_game',
        icon: '🎮',
        requirements: [{ type: 'count', target: 20, current: 0 }],
        rewards: [
          { type: 'badge', value: 'game_champion', description: 'Game Champion Badge' },
          { type: 'coins', value: 350, description: '350 Constitutional Coins' }
        ],
        progress: 0,
        isVisible: true,
        rarity: 'epic'
      }
      // Add more achievements up to 125+ total
    ];
  }

  private initializeBadges(): void {
    this.badges = [
      {
        id: 'welcome_badge',
        userId: '',
        name: 'Welcome Badge',
        description: 'Started your constitutional learning journey',
        icon: '🌟',
        category: 'fundamental_rights',
        earnedAt: '',
        level: 1,
        displayOrder: 1
      },
      {
        id: 'quiz_champion',
        userId: '',
        name: 'Quiz Champion',
        description: 'Completed 50 quizzes with excellence',
        icon: '🏆',
        category: 'quiz_champion',
        earnedAt: '',
        level: 3,
        displayOrder: 2
      },
      {
        id: 'preamble_master',
        userId: '',
        name: 'Preamble Master',
        description: 'Perfect understanding of the Preamble',
        icon: '📜',
        category: 'preamble',
        earnedAt: '',
        level: 3,
        displayOrder: 3
      },
      {
        id: 'rights_defender',
        userId: '',
        name: 'Rights Defender',
        description: 'Champion of Fundamental Rights',
        icon: '🛡️',
        category: 'fundamental_rights',
        earnedAt: '',
        level: 4,
        displayOrder: 4
      },
      {
        id: 'daily_learner',
        userId: '',
        name: 'Daily Learner',
        description: 'Consistent daily learning habits',
        icon: '🔥',
        category: 'daily_learner',
        earnedAt: '',
        level: 2,
        displayOrder: 8
      },
      {
        id: 'ambedkar_scholar',
        userId: '',
        name: 'Ambedkar Scholar',
        description: 'Deep understanding of Dr. Ambedkar\'s vision',
        icon: '👨‍🎓',
        category: 'ambedkar_scholar',
        earnedAt: '',
        level: 5,
        displayOrder: 6
      },
      {
        id: 'constitution_architect',
        userId: '',
        name: 'Constitution Architect',
        description: 'Built a complete virtual constitution',
        icon: '🏛️',
        category: 'constitution_master',
        earnedAt: '',
        level: 5,
        displayOrder: 7
      },
      {
        id: 'game_champion',
        userId: '',
        name: 'Game Champion',
        description: 'Master of constitutional mini-games',
        icon: '🎮',
        category: 'game_master',
        earnedAt: '',
        level: 4,
        displayOrder: 9
      }
      // Add more badges up to 125+ total
    ];
  }

  // Enhanced Core Gamification Logic with Unified PointCalculator Integration
  async processGameCompletion(profile: UserProfile, gameData: any): Promise<{
    coinsEarned: number;
    experienceGained: number;
    achievementsUnlocked: Achievement[];
    badgesEarned: Badge[];
    levelUp: boolean;
  }> {
    const { score, accuracy, timeSpent, perfectGame, hintsUsed, gameType, difficulty } = gameData;
    const achievementsUnlocked: Achievement[] = [];
    const badgesEarned: Badge[] = [];

    // Use unified PointCalculator for consistent game point calculations
    const performance: GamePerformance = {
      score,
      accuracy: accuracy || (score / 100) * 100,
      timeSpent: timeSpent || 60,
      perfectGame: perfectGame || score >= 90,
      hintsUsed: hintsUsed || 0,
      difficulty: difficulty || 'medium',
      gameType: gameType || 'general',
      level: profile.profileLevel,
      streakBonus: profile.currentStreak,
      speedBonus: timeSpent && timeSpent < 30 ? 10 : 0
    };
    
    const pointResult = PointCalculator.calculateGamePoints(
      performance,
      profile,
      profile.currentStreak
    );
    
    const coinsEarned = pointResult.coinsEarned;
    const experienceGained = pointResult.experienceGained;
    const levelUp = pointResult.levelUp;

    // Game-specific achievements (using unified achievement system)
    if (score >= 90) {
      const achievementBonus = PointCalculator.calculateAchievementBonus('mastery', profile.profileLevel);
      achievementsUnlocked.push({
        id: `game_master_${gameType}`,
        userId: profile.userId,
        title: `${gameType} Master`,
        description: `Scored 90%+ in ${gameType}`,
        category: 'mastery',
        type: 'mini_game',
        icon: '🏆',
        requirements: [{ type: 'score', target: 90, current: score, condition: 'minimum_score' }],
        rewards: [
          { type: 'coins', value: achievementBonus, description: `${achievementBonus} coins` },
          { type: 'badge', value: `${gameType}_master`, description: `${gameType} Master Badge` }
        ],
        unlockedAt: new Date().toISOString(),
        progress: 100,
        isVisible: true,
        rarity: 'epic'
      });
    }

    // Process achievements unlocked by PointCalculator
    for (const achievementId of pointResult.achievementsUnlocked) {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlockedAt) {
        achievementsUnlocked.push(achievement);
        await this.stateManager.unlockAchievementAtomic('default', achievement);
        
        // Award badges for achievements atomically
        const badge = achievement.rewards.find(r => r.type === 'badge');
        if (badge) {
          const badgeData = this.badges.find(b => b.id === badge.value);
          if (badgeData) {
            const earnedBadge = { ...badgeData, earnedAt: new Date().toISOString() };
            badgesEarned.push(earnedBadge);
            await this.stateManager.earnBadgeAtomic('default', earnedBadge);
          }
        }
      }
    }

    // Update profile using atomic operations with daily limit enforcement
    await this.awardCoinsWithLimit(profile, coinsEarned, 'game_completion');
    
    // Update experience and other stats
    const profileUpdates: Partial<UserProfile> = {
      experiencePoints: profile.experiencePoints + experienceGained,
      profileLevel: Math.max(profile.profileLevel, levelUp ? PointCalculator.calculateLevel(profile.experiencePoints + experienceGained) : profile.profileLevel),
      lastActivityDate: this.timeSync.getCurrentUTCDate()
    };

    // Apply atomic profile update
    const result = await this.stateManager.updateProfileAtomic('default', profileUpdates, 'game_completion_stats');
    
    if (result.success && result.profile) {
      Object.assign(profile, result.profile);
    }

    return {
      coinsEarned,
      experienceGained,
      achievementsUnlocked,
      badgesEarned,
      levelUp
    };
  }

  // Enhanced Quiz Completion with Unified PointCalculator Integration
  async processQuizCompletion(profile: UserProfile, quiz: QuizSession): Promise<{
    coinsEarned: number;
    experienceGained: number;
    achievementsUnlocked: Achievement[];
    badgesEarned: Badge[];
    levelUp: boolean;
  }> {
    const achievementsUnlocked: Achievement[] = [];
    const badgesEarned: Badge[] = [];

    // Calculate coins and experience using unified PointCalculator
    const correctAnswers = quiz.answers.filter((answer, index) => 
      answer !== null && answer === quiz.questions[index].correct_answer
    ).length;
    
    const totalQuestions = quiz.questions.length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    // Use unified PointCalculator for consistent calculations
    const performance: QuizPerformance = {
      totalQuestions,
      correctAnswers,
      perfectScore: quiz.perfectScore || false,
      responseTime: quiz.timeSpent ? quiz.timeSpent * 1000 : undefined, // Convert to milliseconds
      timeSpent: quiz.timeSpent,
      hintsUsed: quiz.hintsUsed || 0
    };
    
    const pointResult = PointCalculator.calculateQuizPoints(
      performance,
      profile,
      profile.currentStreak
    );
    
    const coinsEarned = pointResult.coinsEarned;
    const experienceGained = pointResult.experienceGained;
    const levelUp = pointResult.levelUp;

    // Time-based bonus (speed learner achievement)
    if (quiz.timeSpent && quiz.timeSpent <= 120 && accuracy >= 90) {
      achievementsUnlocked.push({
        id: 'speed_learner_quiz_' + quiz.sessionId,
        userId: profile.userId,
        title: 'Speed Learner',
        description: 'Completed quiz in under 2 minutes with 90%+ score',
        category: 'mastery',
        type: 'time_based',
        icon: '⚡',
        requirements: [
          { type: 'time', target: 120, current: quiz.timeSpent },
          { type: 'score', target: 90, current: accuracy }
        ],
        rewards: [
          { type: 'coins', value: PointCalculator.calculateAchievementBonus('mastery', profile.profileLevel), description: 'Achievement Bonus Coins' },
          { type: 'avatar_item', value: 'lightning_badge', description: 'Lightning Badge' }
        ],
        unlockedAt: new Date().toISOString(),
        progress: 100,
        isVisible: true,
        rarity: 'rare'
      });
    }

    // Process achievements unlocked by PointCalculator
    for (const achievementId of pointResult.achievementsUnlocked) {
      const achievement = this.achievements.find(a => a.id === achievementId);
      if (achievement && !achievement.unlockedAt) {
        achievementsUnlocked.push(achievement);
        await this.stateManager.unlockAchievementAtomic('default', achievement);
        
        // Award badges for achievements atomically
        const badge = achievement.rewards.find(r => r.type === 'badge');
        if (badge) {
          const badgeData = this.badges.find(b => b.id === badge.value);
          if (badgeData) {
            const earnedBadge = { ...badgeData, earnedAt: new Date().toISOString() };
            badgesEarned.push(earnedBadge);
            await this.stateManager.earnBadgeAtomic('default', earnedBadge);
          }
        }
      }
    }

    // Check for additional achievements with UTC timing
    const quizAchievements = await this.checkQuizAchievements(profile, quiz);
    for (const achievement of quizAchievements) {
      if (!achievementsUnlocked.find(a => a.id === achievement.id)) {
        achievementsUnlocked.push(achievement);
      }
    }

    // Update profile using atomic operations with daily limit enforcement
    await this.awardCoinsWithLimit(profile, coinsEarned, 'quiz_completion');
    
    // Update experience and other stats
    const profileUpdates: Partial<UserProfile> = {
      experiencePoints: profile.experiencePoints + experienceGained,
      profileLevel: Math.max(profile.profileLevel, levelUp ? PointCalculator.calculateLevel(profile.experiencePoints + experienceGained) : profile.profileLevel),
      lastActivityDate: this.timeSync.getCurrentUTCDate()
    };

    // Apply atomic profile update
    const result = await this.stateManager.updateProfileAtomic('default', profileUpdates, 'quiz_completion_stats');
    
    if (result.success && result.profile) {
      Object.assign(profile, result.profile);
    }

    return {
      coinsEarned,
      experienceGained,
      achievementsUnlocked,
      badgesEarned,
      levelUp
    };
  }

  // Enhanced Achievement Checking with Time-Based Logic
  private async checkQuizAchievements(profile: UserProfile, quiz: QuizSession): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];
    const userQuizzes = await this.db.getQuizSessions();
    const completedQuizzes = userQuizzes.filter(q => q.isComplete);

    // Get today's quizzes for time-based achievements
    const todayUTC = this.timeSync.getCurrentUTCDate();
    const todayQuizzes = completedQuizzes.filter(q => 
      DateUtils.toUTCDateString(q.startTime) === todayUTC
    );

    for (const achievement of this.achievements) {
      if (achievement.unlockedAt) continue; // Already unlocked

      let unlocked = false;

      switch (achievement.type) {
        case 'quiz_completion':
          if (achievement.requirements[0].type === 'count') {
            const count = completedQuizzes.length;
            achievement.progress = Math.min(100, (count / achievement.requirements[0].target) * 100);
            unlocked = count >= achievement.requirements[0].target;
          }
          break;

        case 'perfect_score':
          if (achievement.requirements[0].type === 'streak') {
            // Check for consecutive perfect scores
            const recentQuizzes = completedQuizzes
              .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
              .slice(0, achievement.requirements[0].target);
            
            const perfectStreak = recentQuizzes.every(q => q.perfectScore);
            achievement.progress = perfectStreak ? 100 : 0;
            unlocked = perfectStreak && recentQuizzes.length >= achievement.requirements[0].target;
          }
          break;

        case 'time_based':
          const accuracy = (quiz.score / quiz.questions.length) * 100;
          if (quiz.timeSpent <= achievement.requirements[0].target && accuracy >= achievement.requirements[1].target) {
            achievement.progress = 100;
            unlocked = true;
          }
          break;
      }

      if (unlocked) {
        achievement.unlockedAt = new Date().toISOString();
        unlockedAchievements.push(achievement);
        await this.stateManager.unlockAchievementAtomic('default', achievement);
      }
    }

    return unlockedAchievements;
  }

  // Unified Level Calculation using PointCalculator
  private calculateLevel(experience: number): number {
    return PointCalculator.calculateLevel(experience);
  }

  // Enhanced Virtual Currency Operations with Atomic Updates
  async spendCoins(profile: UserProfile, amount: number, item: string): Promise<boolean> {
    if (profile.constitutionalCoins >= amount) {
      const result = await this.stateManager.updateProfileAtomic('default', {
        constitutionalCoins: profile.constitutionalCoins - amount
      }, `coin_spend_${item}`);
      
      if (result.success && result.profile) {
        profile.constitutionalCoins = result.profile.constitutionalCoins;
        return true;
      }
    }
    return false;
  }

  async giftCoins(profile: UserProfile, amount: number, reason: string): Promise<void> {
    const result = await this.stateManager.updateProfileAtomic('default', {
      constitutionalCoins: profile.constitutionalCoins + amount
    }, `coin_gift_${reason}`);
    
    if (result.success && result.profile) {
      profile.constitutionalCoins = result.profile.constitutionalCoins;
    }
  }

  // Enhanced Daily Challenge System with Unified PointCalculator Integration
  async generateDailyChallenges(profile: UserProfile): Promise<any[]> {
    const todayUTC = this.timeSync.getCurrentUTCDate();
    
    // Dynamic challenges based on user level and progress using PointCalculator constants
    const challenges = [
      {
        id: `daily_quiz_${todayUTC}`,
        title: 'Constitution Quiz Master',
        description: 'Complete quiz questions about the Constitution',
        type: 'quiz',
        target: Math.min(3 + Math.floor(profile.profileLevel / 2), 7), // Scale with level
        progress: 0,
        isCompleted: false,
        reward: { type: 'coins', value: 0, description: 'Calculated by PointCalculator' }, // Will be calculated dynamically
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        difficulty: profile.profileLevel < 3 ? 'easy' : profile.profileLevel < 7 ? 'medium' : 'hard',
        isDailyChallenge: true,
        currentDate: todayUTC
      },
      {
        id: `daily_story_${todayUTC}`,
        title: 'Constitutional Explorer',
        description: 'Read educational content about the Constitution',
        type: 'story',
        target: 1,
        progress: 0,
        isCompleted: false,
        reward: { type: 'coins', value: 0, description: 'Calculated by PointCalculator' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isDailyChallenge: true,
        currentDate: todayUTC
      },
      {
        id: `daily_game_${todayUTC}`,
        title: 'Mini-Game Champion',
        description: 'Play and win constitutional mini-games',
        type: 'mini_game',
        target: Math.min(1 + Math.floor(profile.profileLevel / 3), 4),
        progress: 0,
        isCompleted: false,
        reward: { type: 'coins', value: 0, description: 'Calculated by PointCalculator' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isDailyChallenge: true,
        currentDate: todayUTC
      },
      {
        id: `daily_streak_${todayUTC}`,
        title: 'Learning Streak',
        description: 'Maintain your daily learning habit',
        type: 'streak',
        target: profile.currentStreak + 1,
        progress: profile.currentStreak,
        isCompleted: false,
        reward: { type: 'coins', value: 0, description: 'Calculated by PointCalculator' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isStreakChallenge: true,
        isDailyChallenge: true,
        currentDate: todayUTC
      }
    ];

    return challenges;
  }
  
  // Unified daily challenge completion processor using PointCalculator
  async processDailyChallengeCompletion(
    profile: UserProfile, 
    challengeType: string, 
    challengeId: string
  ): Promise<{
    coinsEarned: number;
    experienceGained: number;
    achievementsUnlocked: string[];
    levelUp: boolean;
  }> {
    // Use unified PointCalculator for challenge point calculations
    const pointResult = PointCalculator.calculateChallengePoints(
      challengeType,
      true, // Challenge is completed
      profile
    );
    
    const coinsEarned = pointResult.coinsEarned;
    const experienceGained = pointResult.experienceGained;
    const levelUp = pointResult.levelUp;
    const achievementsUnlocked = pointResult.achievementsUnlocked;

    // Award coins with daily limit enforcement
    await this.awardCoinsWithLimit(profile, coinsEarned, 'daily_challenge_completion');
    
    // Update experience and profile stats
    const profileUpdates: Partial<UserProfile> = {
      experiencePoints: profile.experiencePoints + experienceGained,
      profileLevel: Math.max(profile.profileLevel, levelUp ? PointCalculator.calculateLevel(profile.experiencePoints + experienceGained) : profile.profileLevel),
      lastActivityDate: this.timeSync.getCurrentUTCDate()
    };

    // Apply atomic profile update
    const result = await this.stateManager.updateProfileAtomic('default', profileUpdates, 'daily_challenge_stats');
    
    if (result.success && result.profile) {
      Object.assign(profile, result.profile);
    }

    return {
      coinsEarned,
      experienceGained,
      achievementsUnlocked,
      levelUp
    };
  }

  // Enhanced Challenge Progress with UTC Timing
  async getChallengeProgress(profile: UserProfile, challengeType: string): Promise<number> {
    const todayUTC = this.timeSync.getCurrentUTCDate();
    
    switch (challengeType) {
      case 'quiz':
        const quizSessions = await this.db.getQuizSessions(100);
        return quizSessions.filter(session => 
          session.isComplete && 
          DateUtils.toUTCDateString(session.endTime || session.startTime) === todayUTC
        ).length;
      
      case 'story':
        const storyProgress = await this.db.getGameState('story_progress');
        if (!storyProgress) return 0;
        
        const todayReadingSessions = storyProgress.sessions?.filter((session: any) => 
          DateUtils.toUTCDateString(session.timestamp) === todayUTC
        ) || [];
        
        return todayReadingSessions.length > 0 ? 1 : 0;
      
      case 'mini_game':
        const gameSessions = await this.db.getGameSessions(100);
        return gameSessions.filter(session => 
          session.isComplete && 
          DateUtils.toUTCDateString(session.startTime) === todayUTC
        ).length;
      
      case 'streak':
        return profile.currentStreak;
      
      default:
        return 0;
    }
  }

  // Enhanced Streak Management with UTC Timing
  async updateStreak(profile: UserProfile): Promise<{ streakUpdated: boolean; streakBroken: boolean }> {
    const todayUTC = this.timeSync.getCurrentUTCDate();
    const yesterdayUTC = DateUtils.toUTCDateString(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    
    if (profile.lastActivityDate === todayUTC) {
      // Already active today
      return { streakUpdated: false, streakBroken: false };
    } else if (profile.lastActivityDate === yesterdayUTC) {
      // Continuing streak
      const newStreak = profile.currentStreak + 1;
      const longestStreak = Math.max(profile.longestStreak, newStreak);
      
      const result = await this.stateManager.updateStreakAtomic('default', newStreak, longestStreak);
      
      if (result.success && result.profile) {
        profile.currentStreak = result.profile.currentStreak;
        profile.longestStreak = result.profile.longestStreak;
        profile.lastActivityDate = todayUTC;
      }
      
      return { streakUpdated: true, streakBroken: false };
    } else {
      // Streak broken
      const newStreak = 1;
      
      const result = await this.stateManager.updateStreakAtomic('default', newStreak, profile.longestStreak);
      
      if (result.success && result.profile) {
        profile.currentStreak = result.profile.currentStreak;
        profile.lastActivityDate = todayUTC;
      }
      
      return { streakUpdated: true, streakBroken: true };
    }
  }

  // Get all available achievements for display
  getAvailableAchievements(): Achievement[] {
    return this.achievements.filter(a => a.isVisible);
  }

  // Get all available badges for display
  getAvailableBadges(): Badge[] {
    return this.badges.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  // Get time synchronization info
  getTimeSyncInfo(): {
    currentUTC: string;
    timeUntilMidnight: string;
    resetNeeded: boolean;
  } {
    return {
      currentUTC: this.timeSync.getCurrentUTCDate(),
      timeUntilMidnight: this.timeSync.formatTimeUntilReset(),
      resetNeeded: false // This will be checked by the daily reset service
    };
  }

  // Cleanup
  destroy(): void {
    this.stateManager.destroy();
    this.dailyResetService.destroy();
  }
}

export default GamificationEngine;