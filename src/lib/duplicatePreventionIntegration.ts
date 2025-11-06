// Duplicate Prevention Integration Service
// Integrates all duplicate prevention components with the existing gamification system

import { 
  duplicatePreventionService,
  ValidationResult 
} from './duplicatePreventionService';
import { 
  userSessionManager,
  UserSession 
} from './userSessionManager';
import { 
  validationMiddleware,
  validateQuizWithMiddleware,
  validateAchievementWithMiddleware,
  validateGameWithMiddleware,
  validateCoinsWithMiddleware
} from './validationMiddleware';
import { 
  enhancedStorage,
  TransactionResult 
} from './enhancedStorage';
import { 
  comprehensiveLogger,
  LogEntry 
} from './comprehensiveLogger';
import { ConstitutionDB } from './storage';
import { 
  UserProfile, 
  Achievement, 
  Badge, 
  QuizSession, 
  GameSession 
} from '../types/gamification';

export interface IntegrationConfig {
  enableValidationMiddleware: boolean;
  enableEnhancedStorage: boolean;
  enableComprehensiveLogging: boolean;
  enableSessionManagement: boolean;
  strictValidation: boolean;
  monitoringLevel: 'minimal' | 'standard' | 'comprehensive';
}

export interface ValidationStats {
  totalValidations: number;
  duplicatesPrevented: number;
  exploitsDetected: number;
  sessionViolations: number;
  storageViolations: number;
  recentActivity: ValidationActivity[];
}

export interface ValidationActivity {
  timestamp: string;
  type: string;
  userId: string;
  result: 'allowed' | 'blocked' | 'flagged';
  reason?: string;
  details: Record<string, any>;
}

export class DuplicatePreventionIntegration {
  private db: ConstitutionDB;
  private config: IntegrationConfig;
  private validationStats: ValidationStats;
  private isInitialized: boolean = false;

  constructor(db: ConstitutionDB, config: Partial<IntegrationConfig> = {}) {
    this.db = db;
    this.config = {
      enableValidationMiddleware: true,
      enableEnhancedStorage: true,
      enableComprehensiveLogging: true,
      enableSessionManagement: true,
      strictValidation: true,
      monitoringLevel: 'comprehensive',
      ...config
    };

    this.validationStats = {
      totalValidations: 0,
      duplicatesPrevented: 0,
      exploitsDetected: 0,
      sessionViolations: 0,
      storageViolations: 0,
      recentActivity: []
    };

    this.initializeIntegration();
  }

  private async initializeIntegration(): Promise<void> {
    try {
      console.log('Initializing Duplicate Prevention Integration...');

      // Initialize all services
      await this.initializeServices();

      // Set up integration hooks
      this.setupIntegrationHooks();

      // Start monitoring
      this.startIntegrationMonitoring();

      this.isInitialized = true;
      console.log('Duplicate Prevention Integration initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Duplicate Prevention Integration:', error);
      throw error;
    }
  }

  private async initializeServices(): Promise<void> {
    // Initialize enhanced storage constraints
    if (this.config.enableEnhancedStorage) {
      console.log('Initializing Enhanced Storage...');
      // Enhanced storage is automatically initialized via singleton
    }

    // Initialize validation middleware
    if (this.config.enableValidationMiddleware) {
      console.log('Initializing Validation Middleware...');
      // Validation middleware is automatically initialized via singleton
    }

    // Initialize comprehensive logging
    if (this.config.enableComprehensiveLogging) {
      console.log('Initializing Comprehensive Logger...');
      // Comprehensive logger is automatically initialized via singleton
    }

    // Initialize session management
    if (this.config.enableSessionManagement) {
      console.log('Initializing Session Management...');
      // User session manager is automatically initialized via singleton
    }
  }

  private setupIntegrationHooks(): void {
    // Override key methods in gamification system to include validation
    this.setupGamificationHooks();
    this.setupStorageHooks();
    this.setupValidationHooks();
  }

  private setupGamificationHooks(): void {
    // This would normally involve monkey-patching or wrapping existing methods
    // For this implementation, we'll provide integration functions
    console.log('Gamification hooks configured');
  }

  private setupStorageHooks(): void {
    // Enhanced storage is already integrated via wrapper classes
    console.log('Storage hooks configured');
  }

  private setupValidationHooks(): void {
    // Validation middleware is already integrated
    console.log('Validation hooks configured');
  }

  private startIntegrationMonitoring(): void {
    // Monitor integration health every 30 seconds
    setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);

    // Clean up resources every hour
    setInterval(async () => {
      await this.performCleanup();
    }, 3600000);
  }

  // Main integration methods

  /**
   * Process quiz completion with full duplicate prevention
   */
  async processQuizCompletion(
    userId: string,
    sessionId: string,
    quizSession: QuizSession,
    originalHandler: () => Promise<{
      coinsEarned: number;
      experienceGained: number;
      achievementsUnlocked: Achievement[];
      badgesEarned: Badge[];
      levelUp: boolean;
    }>
  ): Promise<{
    coinsEarned: number;
    experienceGained: number;
    achievementsUnlocked: Achievement[];
    badgesEarned: Badge[];
    levelUp: boolean;
    validationResult: ValidationResult;
    duplicatePrevented: boolean;
  }> {
    const correlationId = `quiz_${userId}_${quizSession.sessionId}_${Date.now()}`;

    try {
      this.validationStats.totalValidations++;

      // Step 1: Validate quiz completion
      const validationResult = await validateQuizWithMiddleware(
        userId,
        sessionId,
        quizSession.sessionId,
        quizSession
      );

      if (!validationResult.isValid) {
        this.validationStats.duplicatesPrevented++;
        await this.recordValidationActivity({
          timestamp: new Date().toISOString(),
          type: 'quiz_completion',
          userId,
          result: 'blocked',
          reason: validationResult.error,
          details: { quizSessionId: quizSession.sessionId }
        });

        return {
          coinsEarned: 0,
          experienceGained: 0,
          achievementsUnlocked: [],
          badgesEarned: [],
          levelUp: false,
          validationResult,
          duplicatePrevented: true
        };
      }

      // Step 2: Process with enhanced storage if enabled
      let processedSession;
      if (this.config.enableEnhancedStorage) {
        const storageResult = await enhancedStorage.saveQuizSessionWithConstraints(quizSession);
        if (!storageResult.success) {
          this.validationStats.storageViolations++;
          await this.recordValidationActivity({
            timestamp: new Date().toISOString(),
            type: 'quiz_completion',
            userId,
            result: 'blocked',
            reason: storageResult.error,
            details: { constraintViolations: storageResult.constraintViolations }
          });

          return {
            coinsEarned: 0,
            experienceGained: 0,
            achievementsUnlocked: [],
            badgesEarned: [],
            levelUp: false,
            validationResult: { isValid: false, error: storageResult.error, timestamp: new Date().toISOString() },
            duplicatePrevented: false
          };
        }
        processedSession = storageResult.data;
      }

      // Step 3: Log validation success
      await comprehensiveLogger.logValidationEvent(
        userId,
        sessionId,
        'quiz_completion',
        'success',
        { quizSessionId: quizSession.sessionId },
        correlationId
      );

      // Step 4: Execute original handler
      const result = await originalHandler();

      // Step 5: Post-process with validation
      if (result.coinsEarned > 0) {
        await validateCoinsWithMiddleware(
          userId,
          sessionId,
          result.coinsEarned,
          'quiz_completion',
          { quizSessionId: quizSession.sessionId, score: quizSession.score }
        );
      }

      // Step 6: Process achievements and badges
      for (const achievement of result.achievementsUnlocked) {
        await validateAchievementWithMiddleware(
          userId,
          sessionId,
          achievement.id,
          achievement
        );
      }

      await this.recordValidationActivity({
        timestamp: new Date().toISOString(),
        type: 'quiz_completion',
        userId,
        result: 'allowed',
        details: { 
          quizSessionId: quizSession.sessionId,
          coinsEarned: result.coinsEarned,
          achievementsUnlocked: result.achievementsUnlocked.length
        }
      });

      return {
        ...result,
        validationResult,
        duplicatePrevented: false
      };

    } catch (error) {
      console.error('Error in quiz completion processing:', error);
      
      await comprehensiveLogger.logSecurityEvent(
        userId,
        sessionId,
        'quiz_processing_error',
        'high',
        'Error processing quiz completion',
        { error: error instanceof Error ? error.message : 'Unknown error', correlationId }
      );

      return {
        coinsEarned: 0,
        experienceGained: 0,
        achievementsUnlocked: [],
        badgesEarned: [],
        levelUp: false,
        validationResult: { isValid: false, error: 'Processing error', timestamp: new Date().toISOString() },
        duplicatePrevented: false
      };
    }
  }

  /**
   * Process achievement unlock with full duplicate prevention
   */
  async processAchievementUnlock(
    userId: string,
    sessionId: string,
    achievement: Achievement,
    originalHandler: () => Promise<{ success: boolean; badgeEarned?: Badge }>
  ): Promise<{
    success: boolean;
    badgeEarned?: Badge;
    validationResult: ValidationResult;
    duplicatePrevented: boolean;
  }> {
    const correlationId = `achievement_${userId}_${achievement.id}_${Date.now()}`;

    try {
      this.validationStats.totalValidations++;

      // Step 1: Validate achievement unlock
      const validationResult = await validateAchievementWithMiddleware(
        userId,
        sessionId,
        achievement.id,
        achievement
      );

      if (!validationResult.isValid) {
        this.validationStats.duplicatesPrevented++;
        await this.recordValidationActivity({
          timestamp: new Date().toISOString(),
          type: 'achievement_unlock',
          userId,
          result: 'blocked',
          reason: validationResult.error,
          details: { achievementId: achievement.id }
        });

        return {
          success: false,
          validationResult,
          duplicatePrevented: true
        };
      }

      // Step 2: Process with enhanced storage
      let processedAchievement;
      if (this.config.enableEnhancedStorage) {
        const storageResult = await enhancedStorage.saveAchievementWithConstraints(achievement, userId);
        if (!storageResult.success) {
          this.validationStats.storageViolations++;
          return {
            success: false,
            validationResult: { isValid: false, error: storageResult.error, timestamp: new Date().toISOString() },
            duplicatePrevented: false
          };
        }
        processedAchievement = storageResult.data;
      }

      // Step 3: Log validation success
      await comprehensiveLogger.logValidationEvent(
        userId,
        sessionId,
        'achievement_unlock',
        'success',
        { achievementId: achievement.id },
        correlationId
      );

      // Step 4: Execute original handler
      const result = await originalHandler();

      await this.recordValidationActivity({
        timestamp: new Date().toISOString(),
        type: 'achievement_unlock',
        userId,
        result: 'allowed',
        details: { 
          achievementId: achievement.id,
          badgeEarned: !!result.badgeEarned
        }
      });

      return {
        success: result.success,
        badgeEarned: result.badgeEarned,
        validationResult,
        duplicatePrevented: false
      };

    } catch (error) {
      console.error('Error in achievement unlock processing:', error);
      
      await comprehensiveLogger.logSecurityEvent(
        userId,
        sessionId,
        'achievement_processing_error',
        'medium',
        'Error processing achievement unlock',
        { error: error instanceof Error ? error.message : 'Unknown error', correlationId }
      );

      return {
        success: false,
        validationResult: { isValid: false, error: 'Processing error', timestamp: new Date().toISOString() },
        duplicatePrevented: false
      };
    }
  }

  /**
   * Process game completion with duplicate prevention
   */
  async processGameCompletion(
    userId: string,
    sessionId: string,
    gameSession: GameSession,
    originalHandler: () => Promise<{
      coinsEarned: number;
      experienceGained: number;
      achievementsUnlocked: string[];
      levelUp: boolean;
    }>
  ): Promise<{
    coinsEarned: number;
    experienceGained: number;
    achievementsUnlocked: string[];
    levelUp: boolean;
    validationResult: ValidationResult;
    duplicatePrevented: boolean;
  }> {
    const correlationId = `game_${userId}_${gameSession.sessionId}_${Date.now()}`;

    try {
      this.validationStats.totalValidations++;

      // Step 1: Validate game completion
      const validationResult = await validateGameWithMiddleware(
        userId,
        sessionId,
        gameSession.sessionId,
        gameSession.gameType,
        gameSession
      );

      if (!validationResult.isValid) {
        this.validationStats.duplicatesPrevented++;
        await this.recordValidationActivity({
          timestamp: new Date().toISOString(),
          type: 'game_completion',
          userId,
          result: 'blocked',
          reason: validationResult.error,
          details: { gameSessionId: gameSession.sessionId, gameType: gameSession.gameType }
        });

        return {
          coinsEarned: 0,
          experienceGained: 0,
          achievementsUnlocked: [],
          levelUp: false,
          validationResult,
          duplicatePrevented: true
        };
      }

      // Step 2: Process with enhanced storage
      if (this.config.enableEnhancedStorage) {
        const storageResult = await enhancedStorage.saveGameSessionWithConstraints(gameSession);
        if (!storageResult.success) {
          this.validationStats.storageViolations++;
          return {
            coinsEarned: 0,
            experienceGained: 0,
            achievementsUnlocked: [],
            levelUp: false,
            validationResult: { isValid: false, error: storageResult.error, timestamp: new Date().toISOString() },
            duplicatePrevented: false
          };
        }
      }

      // Step 3: Log validation success
      await comprehensiveLogger.logValidationEvent(
        userId,
        sessionId,
        'game_completion',
        'success',
        { gameSessionId: gameSession.sessionId, gameType: gameSession.gameType },
        correlationId
      );

      // Step 4: Execute original handler
      const result = await originalHandler();

      // Step 5: Validate coin awards
      if (result.coinsEarned > 0) {
        await validateCoinsWithMiddleware(
          userId,
          sessionId,
          result.coinsEarned,
          'game_completion',
          { gameSessionId: gameSession.sessionId, gameType: gameSession.gameType }
        );
      }

      await this.recordValidationActivity({
        timestamp: new Date().toISOString(),
        type: 'game_completion',
        userId,
        result: 'allowed',
        details: { 
          gameSessionId: gameSession.sessionId,
          coinsEarned: result.coinsEarned
        }
      });

      return {
        ...result,
        validationResult,
        duplicatePrevented: false
      };

    } catch (error) {
      console.error('Error in game completion processing:', error);
      
      await comprehensiveLogger.logSecurityEvent(
        userId,
        sessionId,
        'game_processing_error',
        'medium',
        'Error processing game completion',
        { error: error instanceof Error ? error.message : 'Unknown error', correlationId }
      );

      return {
        coinsEarned: 0,
        experienceGained: 0,
        achievementsUnlocked: [],
        levelUp: false,
        validationResult: { isValid: false, error: 'Processing error', timestamp: new Date().toISOString() },
        duplicatePrevented: false
      };
    }
  }

  /**
   * Update user profile with validation and optimistic locking
   */
  async updateUserProfile(
    userId: string,
    profile: UserProfile,
    originalHandler: (profile: UserProfile) => Promise<void>,
    expectedVersion?: number
  ): Promise<{ success: boolean; error?: string; newProfile?: UserProfile }> {
    try {
      this.validationStats.totalValidations++;

      if (this.config.enableEnhancedStorage) {
        const result = await enhancedStorage.updateUserProfileWithConstraints(
          profile,
          expectedVersion
        );

        if (!result.success) {
          this.validationStats.storageViolations++;
          return { success: false, error: result.error };
        }

        // Execute handler with enhanced profile
        await originalHandler(result.data!);
        
        return { success: true, newProfile: result.data };
      } else {
        // Use original handler without enhanced storage
        await originalHandler(profile);
        return { success: true };
      }

    } catch (error) {
      console.error('Error updating user profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Award coins with full validation
   */
  async awardCoins(
    userId: string,
    sessionId: string,
    coinDelta: number,
    reason: string,
    metadata: Record<string, any> = {},
    originalHandler: (userId: string, amount: number, reason: string) => Promise<number>
  ): Promise<{ success: boolean; coinsAwarded: number; error?: string; validationResult?: ValidationResult }> {
    try {
      this.validationStats.totalValidations++;

      // Validate coin award
      const validationResult = await validateCoinsWithMiddleware(
        userId,
        sessionId,
        coinDelta,
        reason,
        metadata
      );

      if (!validationResult.isValid) {
        this.validationStats.duplicatesPrevented++;
        await this.recordValidationActivity({
          timestamp: new Date().toISOString(),
          type: 'coin_award',
          userId,
          result: 'blocked',
          reason: validationResult.error,
          details: { coinAmount: coinDelta, reason }
        });

        return { success: false, coinsAwarded: 0, error: validationResult.error, validationResult };
      }

      // Use enhanced storage if available
      if (this.config.enableEnhancedStorage) {
        const result = await enhancedStorage.updateCoinsWithConstraints(
          userId,
          coinDelta,
          reason,
          metadata
        );

        if (!result.success) {
          return { success: false, coinsAwarded: 0, error: result.error, validationResult };
        }

        return { 
          success: true, 
          coinsAwarded: result.data.newBalance, 
          validationResult 
        };
      } else {
        // Use original handler
        const coinsAwarded = await originalHandler(userId, coinDelta, reason);
        return { success: true, coinsAwarded, validationResult };
      }

    } catch (error) {
      console.error('Error awarding coins:', error);
      return { 
        success: false, 
        coinsAwarded: 0, 
        error: error instanceof Error ? error.message : 'Unknown error',
        validationResult: { isValid: false, error: 'Processing error', timestamp: new Date().toISOString() }
      };
    }
  }

  // Session management integration

  async createUserSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<UserSession> {
    const sessionToken = `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = await userSessionManager.createSession(
      userId,
      sessionToken,
      userAgent,
      ipAddress
    );

    await comprehensiveLogger.logUserActivity(
      userId,
      session.sessionId,
      'session_created',
      'success',
      { userAgent, ipAddress }
    );

    return session;
  }

  async validateUserSession(sessionToken: string): Promise<{
    isValid: boolean;
    session?: UserSession;
    error?: string;
  }> {
    const result = await userSessionManager.validateSessionToken(sessionToken);
    
    if (result.session) {
      await comprehensiveLogger.logUserActivity(
        result.session.userId,
        result.session.sessionId,
        'session_validated',
        'success',
        {}
      );
    }

    return result;
  }

  // Monitoring and health checks

  private recordValidationActivity(activity: ValidationActivity): void {
    this.validationStats.recentActivity.unshift(activity);
    
    // Keep only last 100 activities
    if (this.validationStats.recentActivity.length > 100) {
      this.validationStats.recentActivity = this.validationStats.recentActivity.slice(0, 100);
    }

    // Update counters
    switch (activity.result) {
      case 'blocked':
        if (activity.reason?.includes('duplicate')) {
          this.validationStats.duplicatesPrevented++;
        } else if (activity.reason?.includes('exploit')) {
          this.validationStats.exploitsDetected++;
        } else if (activity.reason?.includes('session')) {
          this.validationStats.sessionViolations++;
        } else if (activity.reason?.includes('constraint')) {
          this.validationStats.storageViolations++;
        }
        break;
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const healthStatus = await validationMiddleware.getHealthCheck();
      
      if (healthStatus.status === 'unhealthy') {
        await comprehensiveLogger.createAlert({
          severity: 'critical',
          type: 'system_error',
          title: 'Duplicate Prevention System Health Check Failed',
          description: 'One or more services are unhealthy',
          data: healthStatus
        });
      }

    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  private async performCleanup(): Promise<void> {
    try {
      // Clean up duplicate prevention service
      await duplicatePreventionService.cleanup();

      // Clean up user session manager
      // (cleanup is handled internally by the session manager)

      // Clean up comprehensive logger
      await comprehensiveLogger['cleanupOldData']();

    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  // Public getter methods

  getValidationStats(): ValidationStats {
    return { ...this.validationStats };
  }

  getIntegrationConfig(): IntegrationConfig {
    return { ...this.config };
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  // Force reset (use with caution)
  async resetSystem(): Promise<void> {
    console.log('Resetting Duplicate Prevention System...');
    
    await duplicatePreventionService.resetMetrics();
    await comprehensiveLogger['resetStatistics']?.();
    
    this.validationStats = {
      totalValidations: 0,
      duplicatesPrevented: 0,
      exploitsDetected: 0,
      sessionViolations: 0,
      storageViolations: 0,
      recentActivity: []
    };

    console.log('Duplicate Prevention System reset complete');
  }
}

// Create and export integration instance
export const duplicatePreventionIntegration = new DuplicatePreventionIntegration(
  ConstitutionDB.getInstance()
);
