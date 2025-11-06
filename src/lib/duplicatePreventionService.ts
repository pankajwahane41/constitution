// Duplicate Prevention and Validation Service
// Centralized system for preventing duplicate achievements, coin awards, and game exploits

import { ConstitutionDB } from './storage';
import { UserProfile, Achievement, QuizSession, GameSession } from '../types/gamification';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  duplicateOf?: string;
  cooldownRemaining?: number;
  timestamp: string;
}

export interface ValidationOptions {
  strictMode?: boolean;
  allowCooldownBypass?: boolean;
  maxRetries?: number;
  validationTimeout?: number;
}

export interface ActivityRecord {
  userId: string;
  activityType: string;
  activityId: string;
  timestamp: string;
  sessionId?: string;
  cooldownEndTime?: string;
  attempts: number;
  lastAttempt: string;
  metadata?: Record<string, any>;
}

export interface ExploitPattern {
  patternId: string;
  userId: string;
  patternType: 'rapid_fire' | 'duplicate_submission' | 'session_replay' | 'time_manipulation';
  detectionTime: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: Record<string, any>;
  actionTaken: 'none' | 'warning' | 'limit' | 'suspend' | 'ban';
  resolvedAt?: string;
}

export interface ValidationMetrics {
  totalValidations: number;
  duplicatesPrevented: number;
  exploitsDetected: number;
  falsePositives: number;
  lastValidation: string;
  topViolationTypes: Array<{ type: string; count: number }>;
}

export class DuplicatePreventionService {
  private db: ConstitutionDB;
  private activityCache: Map<string, ActivityRecord[]> = new Map();
  private exploitPatterns: Map<string, ExploitPattern[]> = new Map();
  private metrics: ValidationMetrics;
  private readonly COOLDOWN_PERIODS = {
    QUIZ_COMPLETION: 30000, // 30 seconds
    ACHIEVEMENT_UNLOCK: 5000, // 5 seconds
    DAILY_CHALLENGE: 60000, // 1 minute
    GAME_COMPLETION: 10000, // 10 seconds
    COIN_AWARD: 2000, // 2 seconds
    STORY_COMPLETION: 15000, // 15 seconds
    LEVEL_UP: 10000, // 10 seconds
    DEFAULT: 5000 // 5 seconds default
  };
  private readonly MAX_ATTEMPTS_PER_MINUTE = 10;
  private readonly MAX_DAILY_ACTIVITIES = 1000;

  constructor(db: ConstitutionDB) {
    this.db = db;
    this.metrics = {
      totalValidations: 0,
      duplicatesPrevented: 0,
      exploitsDetected: 0,
      falsePositives: 0,
      lastValidation: new Date().toISOString(),
      topViolationTypes: []
    };
    
    this.initializeMetricsTracking();
  }

  private initializeMetricsTracking(): void {
    // Initialize metrics from database
    this.loadMetricsFromStorage();
    
    // Set up periodic metrics cleanup and storage
    setInterval(() => {
      this.saveMetricsToStorage();
    }, 300000); // Save every 5 minutes
  }

  private async loadMetricsFromStorage(): Promise<void> {
    try {
      const storedMetrics = await this.db.getGameState('validation_metrics');
      if (storedMetrics) {
        this.metrics = { ...this.metrics, ...storedMetrics.data };
      }
    } catch (error) {
      console.warn('Failed to load validation metrics from storage:', error);
    }
  }

  private async saveMetricsToStorage(): Promise<void> {
    try {
      await this.db.saveGameState({
        id: 'validation_metrics',
        data: this.metrics,
        timestamp: new Date().toISOString(),
        type: 'metrics_snapshot'
      });
    } catch (error) {
      console.warn('Failed to save validation metrics to storage:', error);
    }
  }

  // Core validation methods

  /**
   * Validate quiz completion to prevent duplicate submissions
   */
  async validateQuizCompletion(
    userId: string, 
    quizSessionId: string, 
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    this.metrics.totalValidations++;
    
    try {
      // Check for existing quiz completion
      const existingQuizzes = await this.db.getQuizSessions(100);
      const duplicateQuiz = existingQuizzes.find(quiz => 
        quiz.sessionId === quizSessionId && 
        quiz.userId === userId && 
        quiz.isComplete
      );

      if (duplicateQuiz) {
        this.metrics.duplicatesPrevented++;
        await this.recordAttempt(userId, 'quiz_completion', quizSessionId, {
          duplicateOf: duplicateQuiz.sessionId,
          existingTimestamp: duplicateQuiz.endTime
        });
        
        return {
          isValid: false,
          error: 'Quiz already completed',
          duplicateOf: duplicateQuiz.sessionId,
          timestamp: new Date().toISOString()
        };
      }

      // Check cooldown period
      const cooldownResult = await this.checkCooldown(userId, 'quiz_completion');
      if (!cooldownResult.isValid) {
        return cooldownResult;
      }

      // Check for rapid-fire submissions
      const rapidFireCheck = await this.checkRapidFireAttempts(userId, 'quiz_completion');
      if (!rapidFireCheck.isValid) {
        return rapidFireCheck;
      }

      // Record the activity
      await this.recordActivity(userId, 'quiz_completion', quizSessionId);

      return {
        isValid: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Quiz validation error:', error);
      return {
        isValid: false,
        error: 'Validation system error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate achievement unlock to prevent duplicates
   */
  async validateAchievementUnlock(
    userId: string,
    achievementId: string,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    this.metrics.totalValidations++;

    try {
      // Check if achievement is already unlocked
      const existingAchievements = await this.db.getAchievements();
      const duplicateAchievement = existingAchievements.find(achievement =>
        achievement.id === achievementId &&
        achievement.userId === userId &&
        achievement.unlockedAt
      );

      if (duplicateAchievement) {
        this.metrics.duplicatesPrevented++;
        await this.recordAttempt(userId, 'achievement_unlock', achievementId, {
          duplicateOf: duplicateAchievement.id,
          unlockedAt: duplicateAchievement.unlockedAt
        });

        return {
          isValid: false,
          error: 'Achievement already unlocked',
          duplicateOf: duplicateAchievement.id,
          timestamp: new Date().toISOString()
        };
      }

      // Check cooldown for rapid achievement unlocking
      const cooldownResult = await this.checkCooldown(userId, 'achievement_unlock');
      if (!cooldownResult.isValid) {
        return cooldownResult;
      }

      await this.recordActivity(userId, 'achievement_unlock', achievementId);

      return {
        isValid: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Achievement validation error:', error);
      return {
        isValid: false,
        error: 'Validation system error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate daily challenge completion
   */
  async validateDailyChallenge(
    userId: string,
    challengeId: string,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    this.metrics.totalValidations++;

    try {
      // Check if challenge is already completed
      const challengeState = await this.db.getGameState(challengeId);
      if (challengeState && challengeState.isCompleted && challengeState.userId === userId) {
        this.metrics.duplicatesPrevented++;
        await this.recordAttempt(userId, 'daily_challenge', challengeId, {
          duplicateOf: challengeState.id,
          completedAt: challengeState.completedAt
        });

        return {
          isValid: false,
          error: 'Daily challenge already completed',
          duplicateOf: challengeState.id,
          timestamp: new Date().toISOString()
        };
      }

      // Check for daily challenge cooldown
      const cooldownResult = await this.checkCooldown(userId, 'daily_challenge');
      if (!cooldownResult.isValid) {
        return cooldownResult;
      }

      // Check daily activity limits
      const dailyActivityCheck = await this.checkDailyActivityLimit(userId);
      if (!dailyActivityCheck.isValid) {
        return dailyActivityCheck;
      }

      await this.recordActivity(userId, 'daily_challenge', challengeId);

      return {
        isValid: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Daily challenge validation error:', error);
      return {
        isValid: false,
        error: 'Validation system error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate game completion to prevent replay exploitation
   */
  async validateGameCompletion(
    userId: string,
    gameSessionId: string,
    gameType: string,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    this.metrics.totalValidations++;

    try {
      // Check for existing game completion
      const existingSessions = await this.db.getGameSessions(100);
      const duplicateSession = existingSessions.find(session =>
        session.sessionId === gameSessionId &&
        session.userId === userId &&
        session.isComplete
      );

      if (duplicateSession) {
        this.metrics.duplicatesPrevented++;
        await this.recordAttempt(userId, 'game_completion', gameSessionId, {
          duplicateOf: duplicateSession.sessionId,
          gameType,
          existingTimestamp: duplicateSession.endTime
        });

        return {
          isValid: false,
          error: 'Game session already completed',
          duplicateOf: duplicateSession.sessionId,
          timestamp: new Date().toISOString()
        };
      }

      // Check game-specific cooldown
      const cooldownResult = await this.checkCooldown(userId, 'game_completion', { gameType });
      if (!cooldownResult.isValid) {
        return cooldownResult;
      }

      // Detect suspicious patterns
      const patternDetection = await this.detectExploitPatterns(userId, 'game_completion');
      if (!patternDetection.isValid) {
        this.metrics.exploitsDetected++;
        return patternDetection;
      }

      await this.recordActivity(userId, 'game_completion', gameSessionId, { gameType });

      return {
        isValid: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Game validation error:', error);
      return {
        isValid: false,
        error: 'Validation system error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validate coin award to prevent double awarding
   */
  async validateCoinAward(
    userId: string,
    coinAmount: number,
    reason: string,
    metadata: Record<string, any> = {},
    options: ValidationOptions = {}
  ): Promise<ValidationResult> {
    this.metrics.totalValidations++;

    try {
      // Check for rapid coin awards
      const cooldownResult = await this.checkCooldown(userId, 'coin_award');
      if (!cooldownResult.isValid) {
        return cooldownResult;
      }

      // Check for unusual coin patterns
      const patternCheck = await this.detectCoinExploitPattern(userId, coinAmount, reason);
      if (!patternCheck.isValid) {
        this.metrics.exploitsDetected++;
        return patternCheck;
      }

      await this.recordActivity(userId, 'coin_award', `${reason}_${Date.now()}`, {
        amount: coinAmount,
        reason,
        ...metadata
      });

      return {
        isValid: true,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Coin validation error:', error);
      return {
        isValid: false,
        error: 'Validation system error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Private helper methods

  private async checkCooldown(
    userId: string, 
    activityType: string, 
    metadata: Record<string, any> = {}
  ): Promise<ValidationResult> {
    const cacheKey = `${userId}_${activityType}`;
    const activities = this.activityCache.get(cacheKey) || [];
    const now = new Date();

    // Get activity-specific cooldown period
    const cooldownPeriod = this.COOLDOWN_PERIODS[activityType as keyof typeof this.COOLDOWN_PERIODS] 
      || this.COOLDOWN_PERIODS.DEFAULT;

    // Find recent activity
    const recentActivity = activities.find(activity => {
      const activityTime = new Date(activity.timestamp);
      const timeDiff = now.getTime() - activityTime.getTime();
      return timeDiff < cooldownPeriod;
    });

    if (recentActivity) {
      const cooldownRemaining = Math.ceil((cooldownPeriod - (now.getTime() - new Date(recentActivity.timestamp).getTime())) / 1000);
      return {
        isValid: false,
        error: `Activity cooldown in effect`,
        cooldownRemaining,
        timestamp: new Date().toISOString()
      };
    }

    return { isValid: true, timestamp: new Date().toISOString() };
  }

  private async checkRapidFireAttempts(userId: string, activityType: string): Promise<ValidationResult> {
    const cacheKey = `${userId}_${activityType}`;
    const activities = this.activityCache.get(cacheKey) || [];
    const oneMinuteAgo = new Date(Date.now() - 60000);

    const recentAttempts = activities.filter(activity => 
      new Date(activity.timestamp) > oneMinuteAgo
    );

    if (recentAttempts.length >= this.MAX_ATTEMPTS_PER_MINUTE) {
      this.metrics.exploitsDetected++;
      return {
        isValid: false,
        error: 'Too many rapid attempts detected',
        timestamp: new Date().toISOString()
      };
    }

    return { isValid: true, timestamp: new Date().toISOString() };
  }

  private async checkDailyActivityLimit(userId: string): Promise<ValidationResult> {
    const today = new Date().toDateString();
    const userActivities = await this.db.getGameEvents();
    
    const todayActivities = userActivities.filter(event => {
      const eventDate = new Date(event.timestamp).toDateString();
      return eventDate === today;
    });

    if (todayActivities.length >= this.MAX_DAILY_ACTIVITIES) {
      return {
        isValid: false,
        error: 'Daily activity limit exceeded',
        timestamp: new Date().toISOString()
      };
    }

    return { isValid: true, timestamp: new Date().toISOString() };
  }

  private async detectExploitPatterns(userId: string, activityType: string): Promise<ValidationResult> {
    const patterns = this.exploitPatterns.get(userId) || [];
    const suspiciousPatterns = patterns.filter(pattern => 
      pattern.patternType === 'rapid_fire' && 
      new Date(pattern.detectionTime) > new Date(Date.now() - 300000) // Last 5 minutes
    );

    if (suspiciousPatterns.length > 3) {
      return {
        isValid: false,
        error: 'Multiple exploit patterns detected',
        timestamp: new Date().toISOString()
      };
    }

    return { isValid: true, timestamp: new Date().toISOString() };
  }

  private async detectCoinExploitPattern(
    userId: string, 
    amount: number, 
    reason: string
  ): Promise<ValidationResult> {
    // Check for suspicious coin amounts
    if (amount > 1000) {
      await this.recordExploitPattern(userId, 'time_manipulation', {
        unusualCoinAmount: amount,
        reason,
        severity: 'medium'
      });

      return {
        isValid: false,
        error: 'Unusual coin amount detected',
        timestamp: new Date().toISOString()
      };
    }

    // Check for repeated coin reasons
    const recentCoinActivities = this.activityCache.get(`${userId}_coin_award`) || [];
    const recentSimilarCoins = recentCoinActivities.filter(activity =>
      activity.metadata?.reason === reason &&
      new Date(activity.timestamp) > new Date(Date.now() - 60000) // Last minute
    );

    if (recentSimilarCoins.length > 3) {
      await this.recordExploitPattern(userId, 'duplicate_submission', {
        repeatedReason: reason,
        count: recentSimilarCoins.length,
        severity: 'high'
      });

      return {
        isValid: false,
        error: 'Suspicious coin award pattern',
        timestamp: new Date().toISOString()
      };
    }

    return { isValid: true, timestamp: new Date().toISOString() };
  }

  private async recordActivity(
    userId: string, 
    activityType: string, 
    activityId: string, 
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const cacheKey = `${userId}_${activityType}`;
    const activities = this.activityCache.get(cacheKey) || [];

    const activity: ActivityRecord = {
      userId,
      activityType,
      activityId,
      timestamp: new Date().toISOString(),
      attempts: 1,
      lastAttempt: new Date().toISOString(),
      metadata
    };

    activities.push(activity);

    // Keep only recent activities (last hour)
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recentActivities = activities.filter(activity => 
      new Date(activity.timestamp) > oneHourAgo
    );

    this.activityCache.set(cacheKey, recentActivities);

    // Also store in database for persistence
    await this.db.recordGameEvent({
      type: 'activity_recorded',
      activityType,
      activityId,
      timestamp: activity.timestamp,
      metadata
    });
  }

  private async recordAttempt(
    userId: string,
    activityType: string,
    activityId: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    await this.db.recordGameEvent({
      type: 'duplicate_attempt',
      activityType,
      activityId,
      timestamp: new Date().toISOString(),
      userId,
      metadata
    });
  }

  private async recordExploitPattern(
    userId: string,
    patternType: ExploitPattern['patternType'],
    evidence: Record<string, any>
  ): Promise<void> {
    const pattern: ExploitPattern = {
      patternId: `exploit_${userId}_${Date.now()}`,
      userId,
      patternType,
      detectionTime: new Date().toISOString(),
      severity: evidence.severity || 'medium',
      evidence,
      actionTaken: 'warning'
    };

    const patterns = this.exploitPatterns.get(userId) || [];
    patterns.push(pattern);
    this.exploitPatterns.set(userId, patterns);

    // Store in database
    await this.db.saveGameState({
      id: `exploit_pattern_${pattern.patternId}`,
      data: pattern,
      timestamp: pattern.detectionTime,
      type: 'exploit_detection'
    });
  }

  // Public utility methods

  /**
   * Get validation metrics for monitoring
   */
  getMetrics(): ValidationMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset validation metrics
   */
  async resetMetrics(): Promise<void> {
    this.metrics = {
      totalValidations: 0,
      duplicatesPrevented: 0,
      exploitsDetected: 0,
      falsePositives: 0,
      lastValidation: new Date().toISOString(),
      topViolationTypes: []
    };
    await this.saveMetricsToStorage();
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string): Promise<{
    totalActivities: number;
    recentActivities: ActivityRecord[];
    exploitPatterns: ExploitPattern[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const allActivities: ActivityRecord[] = [];
    this.activityCache.forEach((activities, cacheKey) => {
      if (cacheKey.startsWith(userId)) {
        allActivities.push(...activities);
      }
    });

    const patterns = this.exploitPatterns.get(userId) || [];
    const recentActivities = allActivities
      .filter(activity => new Date(activity.timestamp) > new Date(Date.now() - 3600000)) // Last hour
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    // Calculate risk level
    const riskScore = patterns.length * 2 + recentActivities.length * 0.1;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore > 10) riskLevel = 'high';
    else if (riskScore > 5) riskLevel = 'medium';

    return {
      totalActivities: allActivities.length,
      recentActivities,
      exploitPatterns: patterns,
      riskLevel
    };
  }

  /**
   * Clean up old activity data
   */
  async cleanup(): Promise<void> {
    const oneDayAgo = new Date(Date.now() - 86400000);
    
    // Clean up activity cache
    this.activityCache.forEach((activities, key) => {
      const recentActivities = activities.filter(activity => 
        new Date(activity.timestamp) > oneDayAgo
      );
      
      if (recentActivities.length === 0) {
        this.activityCache.delete(key);
      } else {
        this.activityCache.set(key, recentActivities);
      }
    });

    // Clean up exploit patterns
    this.exploitPatterns.forEach((patterns, userId) => {
      const recentPatterns = patterns.filter(pattern => 
        new Date(pattern.detectionTime) > oneDayAgo
      );
      
      if (recentPatterns.length === 0) {
        this.exploitPatterns.delete(userId);
      } else {
        this.exploitPatterns.set(userId, recentPatterns);
      }
    });
  }
}

// Export singleton instance
export const duplicatePreventionService = new DuplicatePreventionService(
  ConstitutionDB.getInstance()
);
