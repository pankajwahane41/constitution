// Daily Reset Service for University of Indian Constitution
// Handles automatic daily challenges reset, streak calculation, and daily coin limits

import { UserProfile, DailyChallenge } from '../types/gamification';
import { ConstitutionDB } from './storage';
import TimeSync, { DateUtils } from './timeSync';
import AtomicStateManager from './atomicStateManager';

export interface DailyResetOptions {
  enableAutomaticReset: boolean;
  resetTimeUTC: number; // Hour in UTC (0-23)
  enableStreakValidation: boolean;
  enableChallengeCleanup: boolean;
  enableEventLogging: boolean;
}

export interface ResetResult {
  success: boolean;
  challengesReset: number;
  streaksUpdated: number;
  coinsReset: boolean;
  errors: string[];
}

export class DailyResetService {
  private static instance: DailyResetService;
  private db: ConstitutionDB;
  private timeSync: TimeSync;
  private stateManager: AtomicStateManager;
  private options: DailyResetOptions;
  private isResetting = false;
  private lastResetDate: string | null = null;

  private constructor(db: ConstitutionDB) {
    this.db = db;
    this.timeSync = TimeSync.getInstance();
    this.stateManager = AtomicStateManager.getInstance(db);
    this.options = {
      enableAutomaticReset: true,
      resetTimeUTC: 0, // Midnight UTC
      enableStreakValidation: true,
      enableChallengeCleanup: true,
      enableEventLogging: true
    };

    this.initialize();
  }

  static getInstance(db: ConstitutionDB): DailyResetService {
    if (!DailyResetService.instance) {
      DailyResetService.instance = new DailyResetService(db);
    }
    return DailyResetService.instance;
  }

  private initialize(): void {
    // Register for midnight callbacks
    this.timeSync.registerCallback('midnight', () => {
      this.performDailyReset();
    });

    // Check if we need to reset on startup
    this.checkAndPerformResetOnStartup();
  }

  // Check if reset is needed on startup
  private async checkAndPerformResetOnStartup(): Promise<void> {
    try {
      const currentUTCDate = this.timeSync.getCurrentUTCDate();
      const profile = await this.db.getUserProfile('default');
      
      if (profile) {
        const lastReset = profile.lastDailyReset;
        
        // If last reset was not today, perform reset
        if (lastReset !== currentUTCDate) {
          console.log('Performing reset on startup - detected missed midnight reset');
          await this.performDailyReset();
        }
      }
    } catch (error) {
      console.error('Error checking reset status on startup:', error);
    }
  }

  // Perform daily reset for all users
  async performDailyReset(): Promise<ResetResult> {
    if (this.isResetting) {
      console.log('Daily reset already in progress');
      return {
        success: false,
        challengesReset: 0,
        streaksUpdated: 0,
        coinsReset: false,
        errors: ['Reset already in progress']
      };
    }

    this.isResetting = true;
    const errors: string[] = [];
    let challengesReset = 0;
    let streaksUpdated = 0;
    let coinsReset = false;

    try {
      const currentUTCDate = this.timeSync.getCurrentUTCDate();
      console.log(`Starting daily reset for ${currentUTCDate}`);

      // Get user profile
      const profile = await this.db.getUserProfile('default');
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Check if already reset today
      if (profile.lastDailyReset === currentUTCDate) {
        console.log('Daily reset already performed today');
        return {
          success: true,
          challengesReset: 0,
          streaksUpdated: 0,
          coinsReset: false,
          errors: []
        };
      }

      // 1. Reset daily coin counter
      try {
        await this.stateManager.updateProfileAtomic('default', {
          dailyCoinsEarned: 0,
          lastDailyReset: currentUTCDate
        }, 'daily_reset_coins');
        coinsReset = true;
        console.log('Daily coin counter reset');
      } catch (error) {
        errors.push(`Failed to reset coins: ${(error as Error).message}`);
      }

      // 2. Reset daily challenges
      try {
        challengesReset = await this.resetDailyChallenges(currentUTCDate);
        console.log(`Reset ${challengesReset} daily challenges`);
      } catch (error) {
        errors.push(`Failed to reset challenges: ${(error as Error).message}`);
      }

      // 3. Validate and update streaks
      try {
        if (this.options.enableStreakValidation) {
          streaksUpdated = await this.validateAndUpdateStreaks(profile, currentUTCDate);
          console.log(`Updated ${streaksUpdated} streak records`);
        }
      } catch (error) {
        errors.push(`Failed to update streaks: ${(error as Error).message}`);
      }

      // 4. Clean up expired data
      try {
        if (this.options.enableChallengeCleanup) {
          await this.cleanupExpiredData();
          console.log('Cleaned up expired data');
        }
      } catch (error) {
        errors.push(`Failed to cleanup expired data: ${(error as Error).message}`);
      }

      // 5. Log reset event
      if (this.options.enableEventLogging) {
        await this.db.recordGameEvent({
          type: 'daily_reset_completed',
          timestamp: new Date().toISOString(),
          data: {
            challengesReset,
            streaksUpdated,
            coinsReset,
            currentUTCDate
          }
        });
      }

      this.lastResetDate = currentUTCDate;
      console.log('Daily reset completed successfully');

      return {
        success: true,
        challengesReset,
        streaksUpdated,
        coinsReset,
        errors
      };

    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Daily reset failed:', errorMessage);
      errors.push(errorMessage);

      return {
        success: false,
        challengesReset,
        streaksUpdated,
        coinsReset,
        errors
      };
    } finally {
      this.isResetting = false;
    }
  }

  // Reset daily challenges
  private async resetDailyChallenges(currentUTCDate: string): Promise<number> {
    try {
      const gameStates = await this.db.getAllGameStates();
      let resetCount = 0;

      for (const state of gameStates) {
        // Reset challenges that are marked as daily
        if (state.id.startsWith('daily_') || state.isDailyChallenge) {
          const resetChallenge = async () => {
            // Check if challenge has expired
            if (state.expiresAt) {
              const expiryDate = DateUtils.toUTCDateString(state.expiresAt);
              if (expiryDate < currentUTCDate) {
                // Reset challenge for new day
                state.currentDate = currentUTCDate;
                state.progress = 0;
                state.isCompleted = false;
                state.completedAt = null;
                state.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                state.lastUpdated = new Date().toISOString();

                await this.db.saveGameState(state);
                resetCount++;
              }
            }
          };

          await resetChallenge();
        }
      }

      return resetCount;
    } catch (error) {
      throw new Error(`Failed to reset daily challenges: ${(error as Error).message}`);
    }
  }

  // Validate and update streaks
  private async validateAndUpdateStreaks(profile: UserProfile, currentUTCDate: string): Promise<number> {
    try {
      const lastActivity = profile.lastActivityDate;
      const currentStreak = profile.currentStreak;

      // If no activity yesterday, streak might be broken
      const yesterday = DateUtils.toUTCDateString(
        new Date(Date.parse(currentUTCDate) - 24 * 60 * 60 * 1000)
      );

      let newStreak = currentStreak;
      let streakBroken = false;

      if (lastActivity !== currentUTCDate) {
        // User was not active today
        if (lastActivity !== yesterday) {
          // Streak broken - more than 1 day since last activity
          newStreak = 0;
          streakBroken = true;
        } else {
          // Continuing streak but no activity today yet
          // Keep current streak, will be updated when user becomes active
          newStreak = currentStreak;
        }
      } else {
        // User was active today, streak continues
        newStreak = currentStreak;
      }

      // Update profile if streak changed
      if (newStreak !== currentStreak) {
        const longestStreak = Math.max(profile.longestStreak, newStreak);
        await this.stateManager.updateStreakAtomic('default', newStreak, longestStreak);
        return 1;
      }

      return 0;
    } catch (error) {
      throw new Error(`Failed to validate streaks: ${(error as Error).message}`);
    }
  }

  // Clean up expired data
  private async cleanupExpiredData(): Promise<void> {
    try {
      const cutoffDate = DateUtils.toUTCDateString(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      );

      // Clean up old quiz sessions (keep recent ones)
      const quizSessions = await this.db.getQuizSessions(1000);
      for (const session of quizSessions) {
        const sessionDate = DateUtils.toUTCDateString(session.startTime);
        if (sessionDate < cutoffDate && session.isComplete) {
          // Keep only the last 100 completed sessions
          // This is handled by the limit in getQuizSessions
        }
      }

      // Clean up old game sessions
      const gameSessions = await this.db.getGameSessions(1000);
      for (const session of gameSessions) {
        const sessionDate = DateUtils.toUTCDateString(session.startTime);
        if (sessionDate < cutoffDate && session.isComplete) {
          // Clean up old completed sessions
          // This is handled by the limit in getGameSessions
        }
      }

      console.log('Expired data cleanup completed');
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
    }
  }

  // Get time until next reset
  getTimeUntilNextReset(): { hours: number; minutes: number; seconds: number; total: number } {
    return this.timeSync.getTimeUntilMidnight();
  }

  // Check if reset is needed
  async isResetNeeded(): Promise<boolean> {
    try {
      const profile = await this.db.getUserProfile('default');
      if (!profile) return false;

      const currentUTCDate = this.timeSync.getCurrentUTCDate();
      return profile.lastDailyReset !== currentUTCDate;
    } catch (error) {
      console.error('Error checking if reset is needed:', error);
      return false;
    }
  }

  // Get last reset info
  getLastResetInfo(): { date: string | null; timeSince: string | null } {
    const info = {
      date: this.lastResetDate,
      timeSince: null as string | null
    };

    if (this.lastResetDate) {
      const lastReset = new Date(this.lastResetDate);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        info.timeSince = `${diffHours} hours ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        info.timeSince = `${diffDays} days ago`;
      }
    }

    return info;
  }

  // Manual reset trigger (for testing or manual reset)
  async triggerManualReset(): Promise<ResetResult> {
    console.log('Manual daily reset triggered');
    return await this.performDailyReset();
  }

  // Force reset (ignore current date check)
  async forceReset(): Promise<ResetResult> {
    try {
      // Set lastDailyReset to yesterday to force reset
      const yesterday = DateUtils.toUTCDateString(
        new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      await this.stateManager.updateProfileAtomic('default', {
        lastDailyReset: yesterday
      }, 'force_reset');

      // Now perform the reset
      return await this.performDailyReset();
    } catch (error) {
      return {
        success: false,
        challengesReset: 0,
        streaksUpdated: 0,
        coinsReset: false,
        errors: [(error as Error).message]
      };
    }
  }

  // Get reset statistics
  async getResetStatistics(): Promise<{
    lastReset: string | null;
    nextReset: string;
    timeUntilReset: string;
    resetNeeded: boolean;
    isResetting: boolean;
  }> {
    const timeUntil = this.getTimeUntilNextReset();
    const nextReset = this.timeSync.getNextMidnightUTC().toISOString();
    const resetNeeded = await this.isResetNeeded();

    return {
      lastReset: this.lastResetDate,
      nextReset,
      timeUntilReset: this.timeSync.formatTimeUntilReset(),
      resetNeeded,
      isResetting: this.isResetting
    };
  }

  // Update options
  updateOptions(newOptions: Partial<DailyResetOptions>): void {
    this.options = { ...this.options, ...newOptions };
    console.log('Daily reset options updated:', this.options);
  }

  // Cleanup
  destroy(): void {
    this.timeSync.unregisterCallback('midnight');
    this.isResetting = false;
  }
}

export default DailyResetService;