// Validation Middleware for Gamification System
// Integrates duplicate prevention with existing game mechanics

import { 
  duplicatePreventionService,
  ValidationResult,
  ValidationOptions 
} from './duplicatePreventionService';
import { 
  userSessionManager,
  UserSession 
} from './userSessionManager';
import { ConstitutionDB } from './storage';
import { 
  UserProfile, 
  Achievement, 
  QuizSession, 
  GameSession, 
  Badge 
} from '../types/gamification';

export interface ValidationMiddlewareConfig {
  enableStrictValidation: boolean;
  enableSessionValidation: boolean;
  enableActivityLogging: boolean;
  enableExploitDetection: boolean;
  enableRealTimeMonitoring: boolean;
  validationTimeout: number;
  maxRetries: number;
}

export interface GamificationEvent {
  type: 'quiz_completed' | 'achievement_unlocked' | 'badge_earned' | 'game_completed' | 
        'daily_challenge_completed' | 'coins_awarded' | 'experience_gained' | 'level_up';
  userId: string;
  sessionId?: string;
  timestamp: string;
  data: Record<string, any>;
  validationResult?: ValidationResult;
  sessionValidation?: {
    isValid: boolean;
    allowed: boolean;
    blockedUntil?: string;
  };
}

export interface ValidationStats {
  totalEvents: number;
  validatedEvents: number;
  blockedEvents: number;
  duplicatePrevented: number;
  exploitsDetected: number;
  sessionViolations: number;
  lastValidation: string;
  averageValidationTime: number;
}

export class ValidationMiddleware {
  private db: ConstitutionDB;
  private config: ValidationMiddlewareConfig;
  private stats: ValidationStats;
  private eventQueue: GamificationEvent[] = [];
  private processingQueue: boolean = false;

  constructor(db: ConstitutionDB, config: Partial<ValidationMiddlewareConfig> = {}) {
    this.db = db;
    this.config = {
      enableStrictValidation: true,
      enableSessionValidation: true,
      enableActivityLogging: true,
      enableExploitDetection: true,
      enableRealTimeMonitoring: true,
      validationTimeout: 5000, // 5 seconds
      maxRetries: 3,
      ...config
    };

    this.stats = {
      totalEvents: 0,
      validatedEvents: 0,
      blockedEvents: 0,
      duplicatePrevented: 0,
      exploitsDetected: 0,
      sessionViolations: 0,
      lastValidation: new Date().toISOString(),
      averageValidationTime: 0
    };

    this.initializeEventProcessor();
  }

  private initializeEventProcessor(): void {
    // Process validation queue every 100ms
    setInterval(() => {
      if (!this.processingQueue && this.eventQueue.length > 0) {
        this.processValidationQueue();
      }
    }, 100);
  }

  /**
   * Main validation entry point for all gamification events
   */
  async validateGamificationEvent(
    eventType: GamificationEvent['type'],
    userId: string,
    eventData: Record<string, any>,
    sessionId?: string,
    options: ValidationOptions = {}
  ): Promise<{
    isValid: boolean;
    result?: ValidationResult;
    sessionValidation?: any;
    error?: string;
  }> {
    const startTime = Date.now();
    this.stats.totalEvents++;

    try {
      // Create event object
      const event: GamificationEvent = {
        type: eventType,
        userId,
        sessionId,
        timestamp: new Date().toISOString(),
        data: eventData
      };

      // Validate session if enabled
      if (this.config.enableSessionValidation && sessionId) {
        const sessionValidation = await this.validateSessionActivity(sessionId, eventType);
        event.sessionValidation = sessionValidation;
        
        if (!sessionValidation.allowed) {
          this.stats.sessionViolations++;
          return {
            isValid: false,
            sessionValidation,
            error: sessionValidation.reason
          };
        }
      }

      // Perform event-specific validation
      let validationResult: ValidationResult | undefined;
      
      switch (eventType) {
        case 'quiz_completed':
          validationResult = await this.validateQuizEvent(event, options);
          break;
        
        case 'achievement_unlocked':
          validationResult = await this.validateAchievementEvent(event, options);
          break;
        
        case 'badge_earned':
          validationResult = await this.validateBadgeEvent(event, options);
          break;
        
        case 'game_completed':
          validationResult = await this.validateGameEvent(event, options);
          break;
        
        case 'daily_challenge_completed':
          validationResult = await this.validateDailyChallengeEvent(event, options);
          break;
        
        case 'coins_awarded':
          validationResult = await this.validateCoinEvent(event, options);
          break;
        
        case 'experience_gained':
        case 'level_up':
          validationResult = await this.validateExperienceEvent(event, options);
          break;
      }

      event.validationResult = validationResult;

      // Process validation result
      const validationTime = Date.now() - startTime;
      this.updateStats(validationResult, validationTime);

      if (!validationResult?.isValid) {
        this.stats.blockedEvents++;
        
        // Log blocked event
        if (this.config.enableActivityLogging) {
          await this.logBlockedEvent(event, validationResult);
        }

        return {
          isValid: false,
          result: validationResult,
          sessionValidation: event.sessionValidation,
          error: validationResult?.error
        };
      }

      this.stats.validatedEvents++;

      // Log successful validation
      if (this.config.enableActivityLogging) {
        await this.logValidatedEvent(event);
      }

      // Queue event for further processing if needed
      this.eventQueue.push(event);

      return {
        isValid: true,
        result: validationResult,
        sessionValidation: event.sessionValidation
      };

    } catch (error) {
      console.error('Validation middleware error:', error);
      return {
        isValid: false,
        error: 'Validation system error'
      };
    }
  }

  private async validateQuizEvent(
    event: GamificationEvent, 
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const { quizSessionId, quizData } = event.data;
    
    return await duplicatePreventionService.validateQuizCompletion(
      event.userId,
      quizSessionId,
      options
    );
  }

  private async validateAchievementEvent(
    event: GamificationEvent, 
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const { achievementId, achievementData } = event.data;
    
    return await duplicatePreventionService.validateAchievementUnlock(
      event.userId,
      achievementId,
      options
    );
  }

  private async validateBadgeEvent(
    event: GamificationEvent, 
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const { badgeId, badgeData } = event.data;
    
    // Badges are tied to achievements, so validate achievement unlock
    return await duplicatePreventionService.validateAchievementUnlock(
      event.userId,
      badgeData.achievementId || badgeId,
      options
    );
  }

  private async validateGameEvent(
    event: GamificationEvent, 
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const { gameSessionId, gameType, gameData } = event.data;
    
    return await duplicatePreventionService.validateGameCompletion(
      event.userId,
      gameSessionId,
      gameType,
      options
    );
  }

  private async validateDailyChallengeEvent(
    event: GamificationEvent, 
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const { challengeId, challengeData } = event.data;
    
    return await duplicatePreventionService.validateDailyChallenge(
      event.userId,
      challengeId,
      options
    );
  }

  private async validateCoinEvent(
    event: GamificationEvent, 
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const { coinAmount, reason, metadata } = event.data;
    
    return await duplicatePreventionService.validateCoinAward(
      event.userId,
      coinAmount,
      reason,
      metadata,
      options
    );
  }

  private async validateExperienceEvent(
    event: GamificationEvent, 
    options: ValidationOptions
  ): Promise<ValidationResult> {
    const { experienceAmount, reason, metadata } = event.data;
    
    // Experience validation is less strict than coin validation
    // Check for rapid experience gains rather than preventing all duplicates
    return await duplicatePreventionService.validateCoinAward(
      event.userId,
      experienceAmount,
      `experience_${reason}`,
      { ...metadata, type: 'experience' },
      { ...options, strictMode: false }
    );
  }

  private async validateSessionActivity(
    sessionId: string, 
    activityType: string
  ): Promise<{ isValid: boolean; allowed: boolean; reason?: string; blockedUntil?: string }> {
    try {
      const allowedResult = await userSessionManager.isActivityAllowed(sessionId, activityType);
      return { ...allowedResult, isValid: allowedResult.allowed };
    } catch (error) {
      return { isValid: false, allowed: false, reason: 'Session validation error' };
    }
  }

  /**
   * Process the validation queue for post-processing tasks
   */
  private async processValidationQueue(): Promise<void> {
    if (this.processingQueue || this.eventQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      // Process events in batches
      const batchSize = 10;
      const batch = this.eventQueue.splice(0, batchSize);

      for (const event of batch) {
        await this.processValidatedEvent(event);
      }

    } catch (error) {
      console.error('Error processing validation queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  private async processValidatedEvent(event: GamificationEvent): Promise<void> {
    try {
      // Record session activity
      if (event.sessionId && event.validationResult?.isValid) {
        await userSessionManager.recordSessionActivity(
          event.sessionId,
          event.type,
          event.data.activityId || event.timestamp,
          'success',
          { eventType: event.type, ...event.data }
        );
      }

      // Send real-time monitoring data
      if (this.config.enableRealTimeMonitoring) {
        await this.sendRealTimeEvent(event);
      }

    } catch (error) {
      console.error('Error processing validated event:', error);
    }
  }

  /**
   * Log blocked events for analysis
   */
  private async logBlockedEvent(event: GamificationEvent, validationResult?: ValidationResult): Promise<void> {
    await this.db.recordGameEvent({
      type: 'validation_blocked',
      timestamp: new Date().toISOString(),
      userId: event.userId,
      eventType: event.type,
      sessionId: event.sessionId,
      data: {
        originalEvent: event,
        validationResult,
        reason: validationResult?.error,
        blockedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Log successfully validated events
   */
  private async logValidatedEvent(event: GamificationEvent): Promise<void> {
    await this.db.recordGameEvent({
      type: 'validation_passed',
      timestamp: new Date().toISOString(),
      userId: event.userId,
      eventType: event.type,
      sessionId: event.sessionId,
      data: {
        originalEvent: event,
        validatedAt: new Date().toISOString(),
        sessionValidation: event.sessionValidation
      }
    });
  }

  /**
   * Send real-time monitoring data
   */
  private async sendRealTimeEvent(event: GamificationEvent): Promise<void> {
    // In a real implementation, this would send data to monitoring systems
    console.log('Real-time validation event:', {
      type: event.type,
      userId: event.userId,
      isValid: event.validationResult?.isValid,
      timestamp: event.timestamp
    });
  }

  private updateStats(validationResult: ValidationResult | undefined, validationTime: number): void {
    // Update average validation time
    this.stats.averageValidationTime = 
      (this.stats.averageValidationTime + validationTime) / 2;
    
    this.stats.lastValidation = new Date().toISOString();

    if (validationResult?.error?.includes('duplicate')) {
      this.stats.duplicatePrevented++;
    }

    if (validationResult?.error?.includes('exploit')) {
      this.stats.exploitsDetected++;
    }
  }

  /**
   * Get validation statistics
   */
  getStatistics(): ValidationStats {
    return { ...this.stats };
  }

  /**
   * Reset validation statistics
   */
  resetStatistics(): void {
    this.stats = {
      totalEvents: 0,
      validatedEvents: 0,
      blockedEvents: 0,
      duplicatePrevented: 0,
      exploitsDetected: 0,
      sessionViolations: 0,
      lastValidation: new Date().toISOString(),
      averageValidationTime: 0
    };
  }

  /**
   * Update middleware configuration
   */
  updateConfig(newConfig: Partial<ValidationMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ValidationMiddlewareConfig {
    return { ...this.config };
  }

  /**
   * Force validation bypass for admin operations (use with caution)
   */
  async forceBypassValidation(
    eventType: GamificationEvent['type'],
    userId: string,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    // Log the bypass attempt
    await this.db.recordGameEvent({
      type: 'validation_bypass',
      timestamp: new Date().toISOString(),
      userId,
      data: { eventType, reason, bypassedAt: new Date().toISOString() }
    });

    return {
      success: true,
      message: `Validation bypassed for ${eventType}: ${reason}`
    };
  }

  /**
   * Get validation health check
   */
  async getHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      duplicatePrevention: boolean;
      sessionManager: boolean;
      database: boolean;
    };
    metrics: ValidationStats;
    queueSize: number;
    lastUpdate: string;
  }> {
    const healthChecks = await Promise.allSettled([
      duplicatePreventionService.getMetrics(),
      userSessionManager.getSessionStatistics('health_check_user'),
      this.db.getGameEvents()
    ]);

    const services = {
      duplicatePrevention: healthChecks[0].status === 'fulfilled',
      sessionManager: healthChecks[1].status === 'fulfilled',
      database: healthChecks[2].status === 'fulfilled'
    };

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (Object.values(services).some(service => !service)) {
      status = 'degraded';
    }
    if (Object.values(services).filter(service => !service).length > 1) {
      status = 'unhealthy';
    }

    return {
      status,
      services,
      metrics: this.getStatistics(),
      queueSize: this.eventQueue.length,
      lastUpdate: new Date().toISOString()
    };
  }
}

// Create and export middleware instance
export const validationMiddleware = new ValidationMiddleware(
  ConstitutionDB.getInstance()
);

// Export utility functions for easy integration
export const validateQuizWithMiddleware = async (
  userId: string,
  sessionId: string,
  quizSessionId: string,
  quizData: any
): Promise<ValidationResult> => {
  const result = await validationMiddleware.validateGamificationEvent(
    'quiz_completed',
    userId,
    { quizSessionId, quizData },
    sessionId
  );
  
  return result.result || { isValid: false, error: 'Validation failed', timestamp: new Date().toISOString() };
};

export const validateAchievementWithMiddleware = async (
  userId: string,
  sessionId: string,
  achievementId: string,
  achievementData: any
): Promise<ValidationResult> => {
  const result = await validationMiddleware.validateGamificationEvent(
    'achievement_unlocked',
    userId,
    { achievementId, achievementData },
    sessionId
  );
  
  return result.result || { isValid: false, error: 'Validation failed', timestamp: new Date().toISOString() };
};

export const validateGameWithMiddleware = async (
  userId: string,
  sessionId: string,
  gameSessionId: string,
  gameType: string,
  gameData: any
): Promise<ValidationResult> => {
  const result = await validationMiddleware.validateGamificationEvent(
    'game_completed',
    userId,
    { gameSessionId, gameType, gameData },
    sessionId
  );
  
  return result.result || { isValid: false, error: 'Validation failed', timestamp: new Date().toISOString() };
};

export const validateCoinsWithMiddleware = async (
  userId: string,
  sessionId: string,
  coinAmount: number,
  reason: string,
  metadata: any = {}
): Promise<ValidationResult> => {
  const result = await validationMiddleware.validateGamificationEvent(
    'coins_awarded',
    userId,
    { coinAmount, reason, metadata },
    sessionId
  );
  
  return result.result || { isValid: false, error: 'Validation failed', timestamp: new Date().toISOString() };
};
