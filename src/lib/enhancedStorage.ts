// Enhanced Storage System with Database-Level Constraints
// Provides duplicate prevention at the database level

import { ConstitutionDB } from './storage';
import { 
  UserProfile, 
  Achievement, 
  Badge, 
  QuizSession, 
  GameSession, 
  StorageEvent 
} from '../types/gamification';

export interface DatabaseConstraint {
  name: string;
  type: 'unique' | 'check' | 'foreign_key';
  target: string;
  condition?: string;
  description: string;
}

export interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  constraintViolations?: string[];
}

export interface OptimisticLock {
  version: number;
  lastModified: string;
}

export class EnhancedStorageWrapper {
  private db: ConstitutionDB;
  private transactionLocks: Map<string, { locked: boolean; timestamp: number }> = new Map();
  private readonly LOCK_TIMEOUT = 30000; // 30 seconds

  // Database constraints definition
  private static readonly DATABASE_CONSTRAINTS: DatabaseConstraint[] = [
    // Unique constraints for preventing duplicates
    {
      name: 'unique_achievement_per_user',
      type: 'unique',
      target: 'achievements',
      condition: 'userId + id must be unique',
      description: 'Prevents same achievement from being unlocked multiple times by same user'
    },
    {
      name: 'unique_badge_per_user',
      type: 'unique',
      target: 'badges',
      condition: 'userId + id must be unique',
      description: 'Prevents same badge from being earned multiple times by same user'
    },
    {
      name: 'unique_quiz_session',
      type: 'unique',
      target: 'quizSessions',
      condition: 'sessionId must be unique',
      description: 'Prevents duplicate quiz session entries'
    },
    {
      name: 'unique_game_session',
      type: 'unique',
      target: 'gameSessions',
      condition: 'sessionId must be unique',
      description: 'Prevents duplicate game session entries'
    },
    {
      name: 'unique_daily_challenge',
      type: 'unique',
      target: 'dailyChallenges',
      condition: 'userId + id + currentDate must be unique',
      description: 'Prevents multiple completions of same daily challenge'
    },
    {
      name: 'unique_user_profile',
      type: 'unique',
      target: 'userProfile',
      condition: 'userId must be unique',
      description: 'Ensures only one profile per user'
    },
    {
      name: 'unique_high_score',
      type: 'unique',
      target: 'highScores',
      condition: 'userId + gameType must be unique',
      description: 'Prevents multiple high scores for same game type by user'
    },
    
    // Check constraints for data validation
    {
      name: 'valid_coin_amounts',
      type: 'check',
      target: 'userProfile',
      condition: 'constitutionalCoins >= 0 AND dailyCoinsEarned >= 0',
      description: 'Ensures coin amounts are never negative'
    },
    {
      name: 'valid_experience_points',
      type: 'check',
      target: 'userProfile',
      condition: 'experiencePoints >= 0 AND profileLevel >= 0',
      description: 'Ensures experience and level values are valid'
    },
    {
      name: 'valid_streak_values',
      type: 'check',
      target: 'userProfile',
      condition: 'currentStreak >= 0 AND longestStreak >= 0',
      description: 'Ensures streak values are non-negative'
    },
    {
      name: 'valid_score_ranges',
      type: 'check',
      target: 'quizSessions',
      condition: 'score >= 0 AND score <= questions.length',
      description: 'Ensures quiz scores are within valid range'
    },
    {
      name: 'valid_activity_timestamps',
      type: 'check',
      target: 'gameSessions',
      condition: 'startTime <= endTime',
      description: 'Ensures session timestamps are logically consistent'
    }
  ];

  constructor(db: ConstitutionDB) {
    this.db = db;
    this.initializeDatabaseConstraints();
  }

  private async initializeDatabaseConstraints(): Promise<void> {
    try {
      // Store constraint definitions in database for reference
      await this.db.saveGameState({
        id: 'database_constraints',
        data: {
          constraints: EnhancedStorageWrapper.DATABASE_CONSTRAINTS,
          version: 1,
          createdAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        type: 'constraint_definitions'
      });

      console.log('Database constraints initialized');
    } catch (error) {
      console.warn('Failed to initialize database constraints:', error);
    }
  }

  /**
   * Saves achievement with database-level constraints and duplicate prevention
   * @param achievement - The achievement to save
   * @param userId - The user ID
   * @returns Transaction result with saved achievement or error
   */
  async saveAchievementWithConstraints(
    achievement: Achievement,
    userId: string
  ): Promise<TransactionResult<Achievement>> {
    const lockKey = `achievement_${userId}_${achievement.id}`;
    
    try {
      // Acquire lock
      if (!this.acquireLock(lockKey)) {
        return {
          success: false,
          error: 'Unable to acquire lock for achievement operation'
        };
      }

      // Check for existing achievement
      const existingAchievements = await this.db.getAchievements();
      const duplicate = existingAchievements.find(a => 
        a.id === achievement.id && 
        a.userId === userId && 
        a.unlockedAt
      );

      if (duplicate) {
        return {
          success: false,
          error: 'Achievement already unlocked',
          constraintViolations: ['unique_achievement_per_user']
        };
      }

      // Validate achievement data
      const validationResult = this.validateAchievementData(achievement);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: 'Achievement data validation failed',
          constraintViolations: validationResult.violations
        };
      }

      // Add metadata for tracking
      const enhancedAchievement = {
        ...achievement,
        userId,
        version: 1 as number,
        lastModified: new Date().toISOString()
      };

      // Save to database
      await this.db.saveAchievement(enhancedAchievement);

      return {
        success: true,
        data: enhancedAchievement
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to save achievement: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      this.releaseLock(lockKey);
    }
  }

  /**
   * Saves badge with database-level constraints and duplicate prevention
   * @param badge - The badge to save
   * @param userId - The user ID
   * @returns Transaction result with saved badge or error
   */
  async saveBadgeWithConstraints(
    badge: Badge,
    userId: string
  ): Promise<TransactionResult<Badge>> {
    const lockKey = `badge_${userId}_${badge.id}`;
    
    try {
      if (!this.acquireLock(lockKey)) {
        return {
          success: false,
          error: 'Unable to acquire lock for badge operation'
        };
      }

      // Check for existing badge
      const existingBadges = await this.db.getBadges();
      const duplicate = existingBadges.find(b => 
        b.id === badge.id && 
        b.userId === userId
      );

      if (duplicate) {
        return {
          success: false,
          error: 'Badge already earned',
          constraintViolations: ['unique_badge_per_user']
        };
      }

      // Validate badge data
      const validationResult = this.validateBadgeData(badge);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: 'Badge data validation failed',
          constraintViolations: validationResult.violations
        };
      }

      // Add metadata for tracking
      const enhancedBadge = {
        ...badge,
        userId,
        version: 1 as number,
        lastModified: new Date().toISOString()
      };

      // Save to database
      await this.db.saveBadge(enhancedBadge);

      return {
        success: true,
        data: enhancedBadge
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to save badge: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      this.releaseLock(lockKey);
    }
  }

  /**
   * Saves quiz session with database-level constraints and duplicate prevention
   * @param session - The quiz session to save
   * @returns Transaction result with saved session or error
   */
  async saveQuizSessionWithConstraints(
    session: QuizSession
  ): Promise<TransactionResult<QuizSession>> {
    const lockKey = `quiz_session_${session.sessionId}`;
    
    try {
      if (!this.acquireLock(lockKey)) {
        return {
          success: false,
          error: 'Unable to acquire lock for quiz session operation'
        };
      }

      // Check for duplicate session ID
      const existingSessions = await this.db.getQuizSessions(1000);
      const duplicate = existingSessions.find(s => s.sessionId === session.sessionId);

      if (duplicate) {
        return {
          success: false,
          error: 'Quiz session already exists',
          constraintViolations: ['unique_quiz_session']
        };
      }

      // Validate quiz session data
      const validationResult = this.validateQuizSessionData(session);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: 'Quiz session data validation failed',
          constraintViolations: validationResult.violations
        };
      }

      // Add metadata for tracking
      const enhancedSession = {
        ...session,
        version: 1 as number,
        lastModified: new Date().toISOString()
      };

      // Save to database
      await this.db.saveQuizSession(enhancedSession);

      return {
        success: true,
        data: enhancedSession
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to save quiz session: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      this.releaseLock(lockKey);
    }
  }

  /**
   * Saves game session with database-level constraints and duplicate prevention
   * @param session - The game session to save
   * @returns Transaction result with saved session or error
   */
  async saveGameSessionWithConstraints(
    session: GameSession
  ): Promise<TransactionResult<GameSession>> {
    const lockKey = `game_session_${session.sessionId}`;
    
    try {
      if (!this.acquireLock(lockKey)) {
        return {
          success: false,
          error: 'Unable to acquire lock for game session operation'
        };
      }

      // Check for duplicate session ID
      const existingSessions = await this.db.getGameSessions(1000);
      const duplicate = existingSessions.find(s => s.sessionId === session.sessionId);

      if (duplicate) {
        return {
          success: false,
          error: 'Game session already exists',
          constraintViolations: ['unique_game_session']
        };
      }

      // Validate game session data
      const validationResult = this.validateGameSessionData(session);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: 'Game session data validation failed',
          constraintViolations: validationResult.violations
        };
      }

      // Add metadata for tracking
      const enhancedSession = {
        ...session,
        version: 1 as number,
        lastModified: new Date().toISOString()
      };

      // Save to database
      await this.db.saveGameSession(enhancedSession);

      return {
        success: true,
        data: enhancedSession
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to save game session: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      this.releaseLock(lockKey);
    }
  }

  /**
   * Updates user profile with database-level constraints and optimistic locking
   * @param profile - The user profile to update
   * @param expectedVersion - Optional expected version for optimistic locking (use null to skip version check)
   * @returns Transaction result with updated profile or error
   */
  async updateUserProfileWithConstraints(
    profile: UserProfile,
    expectedVersion?: number | null
  ): Promise<TransactionResult<UserProfile>> {
    const lockKey = `profile_${profile.userId}`;
    
    try {
      if (!this.acquireLock(lockKey)) {
        return {
          success: false,
          error: 'Unable to acquire lock for profile update operation'
        };
      }

      // Get current profile for optimistic locking
      const currentProfile = await this.db.getUserProfile(profile.userId);
      
      if (expectedVersion !== undefined && currentProfile && currentProfile.version !== expectedVersion) {
        return {
          success: false,
          error: 'Profile has been modified by another process',
          constraintViolations: ['optimistic_lock_violation']
        };
      }

      // Validate profile data
      const validationResult = this.validateUserProfileData(profile);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: 'User profile data validation failed',
          constraintViolations: validationResult.violations
        };
      }

      // Increment version for optimistic locking
      const enhancedProfile = {
        ...profile,
        version: (currentProfile?.version ?? 0) + 1,
        lastModified: new Date().toISOString()
      };

      // Save to database
      await this.db.saveUserProfile(enhancedProfile);

      return {
        success: true,
        data: enhancedProfile
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      this.releaseLock(lockKey);
    }
  }

  /**
   * Atomically updates coins with database-level constraints and validation
   * @param userId - The user ID
   * @param coinDelta - The change in coins (positive or negative)
   * @param reason - Reason for the coin update
   * @param metadata - Additional metadata for the transaction
   * @returns Transaction result with new balance or error
   */
  async updateCoinsWithConstraints(
    userId: string,
    coinDelta: number,
    reason: string,
    metadata: Record<string, any> = {}
  ): Promise<TransactionResult<{ newBalance: number; coinsUpdated: boolean }>> {
    const lockKey = `coins_${userId}`;
    
    try {
      if (!this.acquireLock(lockKey)) {
        return {
          success: false,
          error: 'Unable to acquire lock for coin update operation'
        };
      }

      // Get current profile
      const profile = await this.db.getUserProfile(userId);
      if (!profile) {
        return {
          success: false,
          error: 'User profile not found'
        };
      }

      // Validate coin operations
      const newBalance = profile.constitutionalCoins + coinDelta;
      if (newBalance < 0) {
        return {
          success: false,
          error: 'Insufficient coins',
          constraintViolations: ['valid_coin_amounts']
        };
      }

      // Check daily limits if adding coins
      if (coinDelta > 0) {
        const today = new Date().toDateString();
        if (profile.lastDailyReset !== today) {
          profile.dailyCoinsEarned = 0;
          profile.lastDailyReset = today;
        }

        const remainingDaily = profile.dailyCoinLimit - profile.dailyCoinsEarned;
        if (coinDelta > remainingDaily) {
          return {
            success: false,
            error: 'Daily coin limit exceeded',
            constraintViolations: ['daily_coin_limit']
          };
        }

        profile.dailyCoinsEarned += coinDelta;
      }

      // Update balance
      profile.constitutionalCoins = newBalance;
      profile.lastActivityDate = new Date().toDateString();

      // Save updated profile
      await this.db.saveUserProfile(profile);

      // Log the transaction
      await this.db.recordGameEvent({
        type: 'coin_transaction',
        timestamp: new Date().toISOString(),
        userId,
        data: {
          coinDelta,
          reason,
          metadata,
          previousBalance: profile.constitutionalCoins - coinDelta,
          newBalance,
          transactionId: `tx_${userId}_${Date.now()}`
        }
      });

      return {
        success: true,
        data: {
          newBalance,
          coinsUpdated: true
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to update coins: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      this.releaseLock(lockKey);
    }
  }

  // Private validation methods
  private validateAchievementData(achievement: Achievement): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    if (!achievement.id) violations.push('missing_achievement_id');
    if (!achievement.title) violations.push('missing_achievement_title');
    if (achievement.progress < 0 || achievement.progress > 100) violations.push('invalid_progress_range');
    if (!['common', 'rare', 'epic', 'legendary'].includes(achievement.rarity)) violations.push('invalid_rarity');

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  private validateBadgeData(badge: Badge): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    if (!badge.id) violations.push('missing_badge_id');
    if (!badge.name) violations.push('missing_badge_name');
    if (badge.level < 1 || badge.level > 5) violations.push('invalid_badge_level');

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  private validateQuizSessionData(session: QuizSession): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    if (!session.sessionId) violations.push('missing_session_id');
    if (session.questions.length === 0) violations.push('no_questions_in_session');
    if (session.score < 0 || session.score > session.questions.length) violations.push('invalid_score_range');

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  private validateGameSessionData(session: GameSession): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    if (!session.sessionId) violations.push('missing_session_id');
    if (session.score < 0) violations.push('negative_score');
    if (session.accuracy < 0 || session.accuracy > 100) violations.push('invalid_accuracy_range');

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  private validateUserProfileData(profile: UserProfile): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    if (!profile.userId) violations.push('missing_user_id');
    if (profile.constitutionalCoins < 0) violations.push('negative_constitutional_coins');
    if (profile.dailyCoinsEarned < 0) violations.push('negative_daily_coins');
    if (profile.currentStreak < 0) violations.push('negative_current_streak');
    if (profile.longestStreak < 0) violations.push('negative_longest_streak');
    if (profile.experiencePoints < 0) violations.push('negative_experience_points');
    if (profile.profileLevel < 0) violations.push('negative_profile_level');

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  // Lock management
  private acquireLock(lockKey: string): boolean {
    const existingLock = this.transactionLocks.get(lockKey);
    const now = Date.now();

    if (existingLock && now - existingLock.timestamp < this.LOCK_TIMEOUT) {
      return false; // Lock is still active
    }

    this.transactionLocks.set(lockKey, {
      locked: true,
      timestamp: now
    });

    return true;
  }

  private releaseLock(lockKey: string): void {
    this.transactionLocks.delete(lockKey);
  }

  // Cleanup expired locks
  private cleanupLocks(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.transactionLocks.forEach((lock, key) => {
      if (now - lock.timestamp > this.LOCK_TIMEOUT) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.transactionLocks.delete(key));
  }

  /**
   * Get database constraint violations for a specific record
   */
  async checkConstraintViolations(
    table: string,
    record: any,
    userId: string
  ): Promise<string[]> {
    const violations: string[] = [];

    try {
      switch (table) {
        case 'achievements':
          const existingAchievements = await this.db.getAchievements();
          if (existingAchievements.some(a => a.id === record.id && a.userId === userId)) {
            violations.push('unique_achievement_per_user');
          }
          break;

        case 'badges':
          const existingBadges = await this.db.getBadges();
          if (existingBadges.some(b => b.id === record.id && b.userId === userId)) {
            violations.push('unique_badge_per_user');
          }
          break;

        case 'quizSessions':
          const existingSessions = await this.db.getQuizSessions(1000);
          if (existingSessions.some(s => s.sessionId === record.sessionId)) {
            violations.push('unique_quiz_session');
          }
          break;

        default:
          // Generic constraint checking
          if (record.constitutionalCoins !== undefined && record.constitutionalCoins < 0) {
            violations.push('valid_coin_amounts');
          }
          break;
      }
    } catch (error) {
      console.warn('Error checking constraint violations:', error);
    }

    return violations;
  }

  /**
   * Get all defined database constraints
   */
  getDatabaseConstraints(): DatabaseConstraint[] {
    return [...EnhancedStorageWrapper.DATABASE_CONSTRAINTS];
  }

  /**
   * Initialize constraint monitoring
   */
  initializeConstraintMonitoring(): void {
    // Clean up locks every minute
    setInterval(() => {
      this.cleanupLocks();
    }, 60000);

    console.log('Database constraint monitoring initialized');
  }
}

// Create singleton instance
export const enhancedStorage = new EnhancedStorageWrapper(
  ConstitutionDB.getInstance()
);

// Initialize monitoring
enhancedStorage.initializeConstraintMonitoring();
