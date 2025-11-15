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
  GameType,
  DailyChallenge
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

        case 'time_based': {
          const accuracy = (quiz.score / quiz.questions.length) * 100;
          if (quiz.timeSpent <= achievement.requirements[0].target && accuracy >= achievement.requirements[1].target) {
            achievement.progress = 100;
            unlocked = true;
          }
          break;
        }
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

  // Enhanced Daily Challenge System with 10-Day Curriculum Integration
  async generateDailyChallenges(profile: UserProfile): Promise<DailyChallenge[]> {
    const todayUTC = this.timeSync.getCurrentUTCDate();
    
    // Check if user is in curriculum mode and get current curriculum day
    if (profile.curriculumEnabled && profile.curriculumStartDate) {
      return this.generateCurriculumChallenges(profile, todayUTC);
    }
    
    // Fallback to traditional challenges for non-curriculum users
    return this.generateTraditionalChallenges(profile, todayUTC);
  }

  // Generate curriculum-based challenges for systematic learning
  private async generateCurriculumChallenges(profile: UserProfile, todayUTC: string): Promise<DailyChallenge[]> {
    const { getCurrentCurriculumDay, getCurriculumProgress } = await import('./curriculumConfig');
    
    const currentCurriculumDay = getCurrentCurriculumDay(profile.curriculumStartDate!, todayUTC);
    const progress = getCurriculumProgress(profile.curriculumStartDate!, todayUTC);
    
    if (!currentCurriculumDay) {
      // Outside curriculum window, switch to traditional challenges
      return this.generateTraditionalChallenges(profile, todayUTC);
    }
    
    const challenges: DailyChallenge[] = [
      {
        id: `curriculum_quiz_day_${currentCurriculumDay.day}_${todayUTC}`,
        title: `Day ${currentCurriculumDay.day}: ${currentCurriculumDay.title}`,
        description: currentCurriculumDay.learningObjective,
        type: 'curriculum_quiz' as const,
        curriculumDay: currentCurriculumDay.day,
        categories: currentCurriculumDay.quizConfig.categories,
        target: currentCurriculumDay.quizConfig.totalQuestions,
        progress: 0,
        isCompleted: false,
        reward: { type: 'coins' as const, value: 0, description: 'Curriculum completion bonus' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        difficulty: currentCurriculumDay.quizConfig.difficulty,
        isDailyChallenge: true,
        isCurriculumChallenge: true,
        keyTopics: currentCurriculumDay.keyTopics,
        currentDate: todayUTC
      }
    ];

    // Add story challenge if there's a story chapter for this day
    if (currentCurriculumDay.storyChapter) {
      challenges.push({
        id: `curriculum_story_day_${currentCurriculumDay.day}_${todayUTC}`,
        title: `Story: ${currentCurriculumDay.storyTitle}`,
        description: `Chapter ${currentCurriculumDay.storyChapter} - ${currentCurriculumDay.storyTitle}`,
        type: 'curriculum_story' as const,
        curriculumDay: currentCurriculumDay.day,
        storyChapter: currentCurriculumDay.storyChapter,
        target: 1,
        progress: 0,
        isCompleted: false,
        reward: { type: 'coins' as const, value: 0, description: 'Story completion bonus' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isDailyChallenge: true,
        isCurriculumChallenge: true,
        currentDate: todayUTC
      });
    }

    // Add mini-game challenge
    challenges.push({
      id: `curriculum_game_day_${currentCurriculumDay.day}_${todayUTC}`,
      title: `Educational Game: ${currentCurriculumDay.miniGameFocus}`,
      description: 'Play mini-games that reinforce today\'s constitutional concepts',
      type: 'curriculum_mini_game' as const,
      curriculumDay: currentCurriculumDay.day,
      gameFocus: currentCurriculumDay.miniGameFocus,
      target: 1,
      progress: 0,
      isCompleted: false,
      reward: { type: 'coins' as const, value: 0, description: 'Game mastery bonus' },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isDailyChallenge: true,
      isCurriculumChallenge: true,
      currentDate: todayUTC
    });

    // Add curriculum progress challenge
    challenges.push({
      id: `curriculum_progress_${todayUTC}`,
      title: `Learning Journey Progress`,
      description: `Complete Day ${currentCurriculumDay.day} of your 10-day constitutional journey (${progress.progressPercentage.toFixed(0)}% complete)`,
      type: 'curriculum_progress' as const,
      curriculumDay: currentCurriculumDay.day,
      target: 3, // Complete all 3 daily activities
      progress: 0,
      isCompleted: false,
      reward: { type: 'coins' as const, value: 0, description: 'Daily completion bonus' },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isDailyChallenge: true,
      isCurriculumChallenge: true,
      isProgressChallenge: true,
      curriculumProgress: progress,
      currentDate: todayUTC
    });

    return challenges;
  }

  // Generate traditional challenges for non-curriculum users
  private async generateTraditionalChallenges(profile: UserProfile, todayUTC: string): Promise<DailyChallenge[]> {
    const challenges: DailyChallenge[] = [
      {
        id: `daily_quiz_${todayUTC}`,
        title: 'Constitution Quiz Master',
        description: 'Complete quiz questions about the Constitution',
        type: 'quiz' as const,
        target: Math.min(3 + Math.floor(profile.profileLevel / 2), 7), // Scale with level
        progress: 0,
        isCompleted: false,
        reward: { type: 'coins' as const, value: 0, description: 'Calculated by PointCalculator' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        difficulty: profile.profileLevel < 3 ? 'easy' as const : profile.profileLevel < 7 ? 'medium' as const : 'hard' as const,
        isDailyChallenge: true,
        currentDate: todayUTC
      },
      {
        id: `daily_story_${todayUTC}`,
        title: 'Constitutional Explorer',
        description: 'Read educational content about the Constitution',
        type: 'story' as const,
        target: 1,
        progress: 0,
        isCompleted: false,
        reward: { type: 'coins' as const, value: 0, description: 'Calculated by PointCalculator' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isDailyChallenge: true,
        currentDate: todayUTC
      },
      {
        id: `daily_game_${todayUTC}`,
        title: 'Mini-Game Champion',
        description: 'Play and win constitutional mini-games',
        type: 'mini_game' as const,
        target: Math.min(1 + Math.floor(profile.profileLevel / 3), 4),
        progress: 0,
        isCompleted: false,
        reward: { type: 'coins' as const, value: 0, description: 'Calculated by PointCalculator' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isDailyChallenge: true,
        currentDate: todayUTC
      },
      {
        id: `daily_streak_${todayUTC}`,
        title: 'Learning Streak',
        description: 'Maintain your daily learning habit',
        type: 'streak' as const,
        target: profile.currentStreak + 1,
        progress: profile.currentStreak,
        isCompleted: false,
        reward: { type: 'coins' as const, value: 0, description: 'Calculated by PointCalculator' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isStreakChallenge: true,
        isDailyChallenge: true,
        currentDate: todayUTC
      }
    ];

    return challenges;
  }

  // Start 10-day curriculum for a user
  async startCurriculum(profile: UserProfile): Promise<void> {
    const todayUTC = this.timeSync.getCurrentUTCDate();
    
    const result = await this.stateManager.updateProfileAtomic('default', {
      curriculumEnabled: true,
      curriculumStartDate: todayUTC,
      curriculumDayCompleted: -1, // Haven't completed any day yet
      curriculumTopicsCompleted: []
    }, 'curriculum_start');
    
    if (result.success && result.profile) {
      profile.curriculumEnabled = result.profile.curriculumEnabled;
      profile.curriculumStartDate = result.profile.curriculumStartDate;
      profile.curriculumDayCompleted = result.profile.curriculumDayCompleted;
      profile.curriculumTopicsCompleted = result.profile.curriculumTopicsCompleted || [];
    }
  }

  // Complete a curriculum day
  async completeCurriculumDay(profile: UserProfile, day: number, topicsCompleted: string[]): Promise<void> {
    const newTopics = [...(profile.curriculumTopicsCompleted || []), ...topicsCompleted];
    
    const result = await this.stateManager.updateProfileAtomic('default', {
      curriculumDayCompleted: day,
      curriculumTopicsCompleted: newTopics
    }, `curriculum_day_${day}_complete`);
    
    if (result.success && result.profile) {
      profile.curriculumDayCompleted = result.profile.curriculumDayCompleted;
      profile.curriculumTopicsCompleted = result.profile.curriculumTopicsCompleted || [];
    }
  }
  
  // Unified daily challenge completion processor using PointCalculator
  async processDailyChallengeCompletion(
    profile: UserProfile, 
    challengeType: string, 
    challengeId: string,
    challengeData?: any
  ): Promise<{
    coinsEarned: number;
    experienceGained: number;
    achievementsUnlocked: string[];
    levelUp: boolean;
  }> {
    // Handle curriculum challenges with enhanced rewards
    if (challengeType.startsWith('curriculum_')) {
      return this.processCurriculumChallengeCompletion(profile, challengeType, challengeId, challengeData);
    }
    
    // Use unified PointCalculator for traditional challenge point calculations
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

  // Process curriculum-specific challenge completion with enhanced rewards
  private async processCurriculumChallengeCompletion(
    profile: UserProfile, 
    challengeType: string, 
    challengeId: string,
    challengeData?: any
  ): Promise<{
    coinsEarned: number;
    experienceGained: number;
    achievementsUnlocked: string[];
    levelUp: boolean;
  }> {
    // Enhanced curriculum rewards (50% bonus over traditional challenges)
    let baseCoins = 0;
    let baseExperience = 0;
    
    switch (challengeType) {
      case 'curriculum_quiz':
        baseCoins = 50 + (challengeData?.questionsCompleted || 0) * 3; // 3 coins per question
        baseExperience = 30 + (challengeData?.questionsCompleted || 0) * 2; // 2 XP per question
        break;
      case 'curriculum_story':
        baseCoins = 40;
        baseExperience = 25;
        break;
      case 'curriculum_mini_game':
        baseCoins = 35;
        baseExperience = 20;
        break;
      case 'curriculum_progress':
        baseCoins = 100; // Daily completion bonus
        baseExperience = 50;
        break;
      default:
        baseCoins = 25;
        baseExperience = 15;
    }
    
    // Apply curriculum completion bonus
    const curriculumBonus = Math.floor(baseCoins * 0.5); // 50% bonus
    const coinsEarned = baseCoins + curriculumBonus;
    const experienceGained = baseExperience + Math.floor(baseExperience * 0.5);
    
    // Check for level up
    const newExperience = profile.experiencePoints + experienceGained;
    const newLevel = PointCalculator.calculateLevel(newExperience);
    const levelUp = newLevel > profile.profileLevel;
    
    // Award coins with daily limit enforcement
    await this.awardCoinsWithLimit(profile, coinsEarned, 'curriculum_challenge_completion');
    
    // Update curriculum progress if it's a daily completion
    if (challengeType === 'curriculum_progress' && challengeData?.curriculumDay !== undefined) {
      const completedTopics = challengeData.topicsCompleted || [];
      await this.completeCurriculumDay(profile, challengeData.curriculumDay, completedTopics);
    }
    
    // Update experience and profile stats
    const profileUpdates: Partial<UserProfile> = {
      experiencePoints: newExperience,
      profileLevel: Math.max(profile.profileLevel, newLevel),
      lastActivityDate: this.timeSync.getCurrentUTCDate()
    };

    // Apply atomic profile update
    const result = await this.stateManager.updateProfileAtomic('default', profileUpdates, 'curriculum_challenge_stats');
    
    if (result.success && result.profile) {
      Object.assign(profile, result.profile);
    }

    // Check for curriculum-specific achievements
    const achievementsUnlocked = await this.checkCurriculumAchievements(profile);

    return {
      coinsEarned,
      experienceGained,
      achievementsUnlocked,
      levelUp
    };
  }

  // Check for curriculum-specific achievements
  private async checkCurriculumAchievements(profile: UserProfile): Promise<string[]> {
    const unlockedAchievements: string[] = [];
    
    // Check curriculum milestone achievements
    if (profile.curriculumDayCompleted >= 2 && !profile.achievements.find(a => a.id === 'curriculum_week_1')) {
      // First 3 days completed
      unlockedAchievements.push('curriculum_week_1');
    }
    
    if (profile.curriculumDayCompleted >= 4 && !profile.achievements.find(a => a.id === 'curriculum_halfway')) {
      // Halfway through curriculum
      unlockedAchievements.push('curriculum_halfway');
    }
    
    if (profile.curriculumDayCompleted >= 9 && !profile.achievements.find(a => a.id === 'curriculum_master')) {
      // Completed full 10-day curriculum
      unlockedAchievements.push('curriculum_master');
    }
    
    return unlockedAchievements;
  }

  // Enhanced Challenge Progress with UTC Timing and Curriculum Support
  async getChallengeProgress(profile: UserProfile, challengeType: string, challengeId?: string): Promise<number> {
    const todayUTC = this.timeSync.getCurrentUTCDate();
    
    // Handle curriculum challenges
    if (challengeType.startsWith('curriculum_')) {
      return this.getCurriculumChallengeProgress(profile, challengeType, challengeId, todayUTC);
    }
    
    switch (challengeType) {
      case 'quiz': {
        const quizSessions = await this.db.getQuizSessions(100);
        return quizSessions.filter(session => 
          session.isComplete && 
          DateUtils.toUTCDateString(session.endTime || session.startTime) === todayUTC
        ).length;
      }
      
      case 'story': {
        const storyProgress = await this.db.getGameState('story_progress');
        if (!storyProgress) return 0;
        
        const todayReadingSessions = storyProgress.sessions?.filter((session: any) => 
          DateUtils.toUTCDateString(session.timestamp) === todayUTC
        ) || [];
        
        return todayReadingSessions.length > 0 ? 1 : 0;
      }
      
      case 'mini_game': {
        const gameSessions = await this.db.getGameSessions(100);
        return gameSessions.filter(session => 
          session.isComplete && 
          DateUtils.toUTCDateString(session.startTime) === todayUTC
        ).length;
      }
      
      case 'streak':
        return profile.currentStreak;
      
      default:
        return 0;
    }
  }

  // Get progress for curriculum-specific challenges
  private async getCurriculumChallengeProgress(
    profile: UserProfile, 
    challengeType: string, 
    challengeId?: string,
    todayUTC?: string
  ): Promise<number> {
    const today = todayUTC || this.timeSync.getCurrentUTCDate();
    
    switch (challengeType) {
      case 'curriculum_quiz': {
        // Check quiz sessions for today that match curriculum categories
        const quizSessions = await this.db.getQuizSessions(100);
        const todayQuizSessions = quizSessions.filter(session => 
          session.isComplete && 
          DateUtils.toUTCDateString(session.endTime || session.startTime) === today
        );
        
        // Sum up questions completed in curriculum-relevant quizzes
        return todayQuizSessions.reduce((total, session) => {
          return total + (session.questions?.length || 0);
        }, 0);
      }
      
      case 'curriculum_story': {
        // Check if today's story chapter was completed
        const storyProgress = await this.db.getGameState('story_progress');
        if (!storyProgress) return 0;
        
        const todayReadingSessions = storyProgress.sessions?.filter((session: any) => 
          DateUtils.toUTCDateString(session.timestamp) === today
        ) || [];
        
        return todayReadingSessions.length > 0 ? 1 : 0;
      }
      
      case 'curriculum_mini_game': {
        // Check mini-game sessions for today
        const gameSessions = await this.db.getGameSessions(100);
        const todayGameSessions = gameSessions.filter(session => 
          session.isComplete && 
          DateUtils.toUTCDateString(session.startTime) === today
        );
        
        return todayGameSessions.length > 0 ? 1 : 0;
      }
      
      case 'curriculum_progress': {
        // Count completed curriculum activities for today
        const quizProgress = await this.getCurriculumChallengeProgress(profile, 'curriculum_quiz', undefined, today);
        const storyProgress = await this.getCurriculumChallengeProgress(profile, 'curriculum_story', undefined, today);
        const gameProgress = await this.getCurriculumChallengeProgress(profile, 'curriculum_mini_game', undefined, today);
        
        let completed = 0;
        if (quizProgress > 0) completed++;
        if (storyProgress > 0) completed++;
        if (gameProgress > 0) completed++;
        
        return completed;
      }
      
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