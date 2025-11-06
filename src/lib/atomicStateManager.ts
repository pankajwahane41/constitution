// Atomic State Manager for University of Indian Constitution
// Ensures atomic operations and prevents race conditions in profile updates

import { UserProfile, Achievement, Badge } from '../types/gamification';
import { ConstitutionDB } from './storage';
import TimeSync from './timeSync';

export interface AtomicOperation {
  id: string;
  type: 'profile_update' | 'achievement_unlock' | 'badge_earn' | 'streak_update' | 'daily_reset';
  timestamp: number;
  userId: string;
  data: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  retryCount: number;
  maxRetries: number;
}

export interface StateSyncOptions {
  enableAtomicOperations: boolean;
  enableConflictResolution: boolean;
  enableEventLogging: boolean;
  maxRetries: number;
  retryDelay: number;
}

export class AtomicStateManager {
  private static instance: AtomicStateManager;
  private db: ConstitutionDB;
  private timeSync: TimeSync;
  private options: StateSyncOptions;
  private pendingOperations: Map<string, AtomicOperation> = new Map();
  private processedOperations: Set<string> = new Set();
  private operationQueue: AtomicOperation[] = [];
  private isProcessing = false;
  private operationId = 0;

  private constructor(db: ConstitutionDB) {
    this.db = db;
    this.timeSync = TimeSync.getInstance();
    this.options = {
      enableAtomicOperations: true,
      enableConflictResolution: true,
      enableEventLogging: true,
      maxRetries: 3,
      retryDelay: 1000
    };
    this.initialize();
  }

  static getInstance(db: ConstitutionDB): AtomicStateManager {
    if (!AtomicStateManager.instance) {
      AtomicStateManager.instance = new AtomicStateManager(db);
    }
    return AtomicStateManager.instance;
  }

  private initialize(): void {
    // Register for midnight callbacks to handle daily resets
    this.timeSync.registerCallback('midnight', () => {
      this.handleMidnightReset();
    });

    // Start processing queue
    this.processOperationQueue();
  }

  // Create atomic profile update
  async updateProfileAtomic(
    userId: string,
    updates: Partial<UserProfile>,
    reason: string = 'atomic_update'
  ): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const operation: AtomicOperation = {
        id: this.generateOperationId(),
        type: 'profile_update',
        timestamp: Date.now(),
        userId,
        data: { updates, reason },
        priority: 'high',
        retryCount: 0,
        maxRetries: this.options.maxRetries
      };

      await this.addToQueue(operation);
      
      // Wait for operation to complete (with timeout)
      const result = await this.waitForOperation(operation.id, 5000);
      return result;
    } catch (error) {
      console.error('Atomic profile update failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Atomic achievement unlock
  async unlockAchievementAtomic(
    userId: string,
    achievement: Achievement
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const operation: AtomicOperation = {
        id: this.generateOperationId(),
        type: 'achievement_unlock',
        timestamp: Date.now(),
        userId,
        data: { achievement },
        priority: 'normal',
        retryCount: 0,
        maxRetries: this.options.maxRetries
      };

      await this.addToQueue(operation);
      const result = await this.waitForOperation(operation.id, 3000);
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Atomic achievement unlock failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Atomic badge earn
  async earnBadgeAtomic(
    userId: string,
    badge: Badge
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const operation: AtomicOperation = {
        id: this.generateOperationId(),
        type: 'badge_earn',
        timestamp: Date.now(),
        userId,
        data: { badge },
        priority: 'normal',
        retryCount: 0,
        maxRetries: this.options.maxRetries
      };

      await this.addToQueue(operation);
      const result = await this.waitForOperation(operation.id, 3000);
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Atomic badge earn failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Atomic streak update
  async updateStreakAtomic(
    userId: string,
    newStreak: number,
    longestStreak: number
  ): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const operation: AtomicOperation = {
        id: this.generateOperationId(),
        type: 'streak_update',
        timestamp: Date.now(),
        userId,
        data: { newStreak, longestStreak },
        priority: 'high',
        retryCount: 0,
        maxRetries: this.options.maxRetries
      };

      await this.addToQueue(operation);
      const result = await this.waitForOperation(operation.id, 3000);
      return result;
    } catch (error) {
      console.error('Atomic streak update failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Add operation to queue
  private async addToQueue(operation: AtomicOperation): Promise<void> {
    this.pendingOperations.set(operation.id, operation);
    
    // Sort by priority
    this.operationQueue.push(operation);
    this.operationQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Process operation queue
  private async processOperationQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift();
      if (!operation) continue;

      try {
        await this.executeOperation(operation);
        this.processedOperations.add(operation.id);
        this.pendingOperations.delete(operation.id);
      } catch (error) {
        console.error(`Operation ${operation.id} failed:`, error);
        
        if (operation.retryCount < operation.maxRetries) {
          operation.retryCount++;
          // Re-add to queue with delay
          setTimeout(() => {
            this.operationQueue.push(operation);
          }, this.options.retryDelay * operation.retryCount);
        } else {
          console.error(`Operation ${operation.id} failed after ${operation.maxRetries} retries`);
          this.pendingOperations.delete(operation.id);
        }
      }
    }

    this.isProcessing = false;
  }

  // Execute specific operation
  private async executeOperation(operation: AtomicOperation): Promise<void> {
    const { id, type, userId, data } = operation;

    switch (type) {
      case 'profile_update':
        await this.executeProfileUpdate(userId, data.updates, data.reason);
        break;
        
      case 'achievement_unlock':
        await this.executeAchievementUnlock(userId, data.achievement);
        break;
        
      case 'badge_earn':
        await this.executeBadgeEarn(userId, data.badge);
        break;
        
      case 'streak_update':
        await this.executeStreakUpdate(userId, data.newStreak, data.longestStreak);
        break;
        
      case 'daily_reset':
        await this.executeDailyReset(userId);
        break;
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    if (this.options.enableEventLogging) {
      await this.logOperation(operation);
    }
  }

  // Execute profile update atomically
  private async executeProfileUpdate(userId: string, updates: Partial<UserProfile>, reason: string): Promise<void> {
    // Get current profile with optimistic locking
    let profile = await this.db.getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Create updated profile
    const updatedProfile: UserProfile = {
      ...profile,
      ...updates,
      lastLoginAt: new Date().toISOString()
    };

    // Validate updates
    this.validateProfileUpdates(updatedProfile, profile);

    // Save atomically
    await this.db.saveUserProfile(updatedProfile);

    // Log the update
    if (this.options.enableEventLogging) {
      await this.db.recordGameEvent({
        type: 'profile_updated',
        timestamp: new Date().toISOString(),
        data: { reason, updates }
      });
    }
  }

  // Execute achievement unlock atomically
  private async executeAchievementUnlock(userId: string, achievement: Achievement): Promise<void> {
    const profile = await this.db.getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Check if already unlocked
    const alreadyUnlocked = profile.achievements.some(a => a.id === achievement.id);
    if (alreadyUnlocked) {
      return; // Already unlocked, nothing to do
    }

    // Add achievement to profile
    const updatedAchievements = [...profile.achievements, achievement];
    profile.achievements = updatedAchievements;

    // Save profile
    await this.db.saveUserProfile(profile);

    // Save achievement separately
    await this.db.saveAchievement(achievement);
  }

  // Execute badge earn atomically
  private async executeBadgeEarn(userId: string, badge: Badge): Promise<void> {
    const profile = await this.db.getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Check if already earned
    const alreadyEarned = profile.badges.some(b => b.id === badge.id);
    if (alreadyEarned) {
      return; // Already earned, nothing to do
    }

    // Add badge to profile
    const updatedBadges = [...profile.badges, badge];
    profile.badges = updatedBadges;

    // Save profile
    await this.db.saveUserProfile(profile);

    // Save badge separately
    await this.db.saveBadge(badge);
  }

  // Execute streak update atomically
  private async executeStreakUpdate(userId: string, newStreak: number, longestStreak: number): Promise<void> {
    const profile = await this.db.getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Update streak data
    profile.currentStreak = newStreak;
    profile.longestStreak = Math.max(profile.longestStreak, longestStreak);
    profile.lastActivityDate = TimeSync.getInstance().getCurrentUTCDate();

    // Save profile
    await this.db.saveUserProfile(profile);

    // Log streak update
    if (this.options.enableEventLogging) {
      await this.db.recordGameEvent({
        type: 'streak_updated',
        timestamp: new Date().toISOString(),
        data: { newStreak, longestStreak }
      });
    }
  }

  // Execute daily reset
  private async executeDailyReset(userId: string): Promise<void> {
    const profile = await this.db.getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Reset daily coin counter
    profile.dailyCoinsEarned = 0;
    profile.lastDailyReset = TimeSync.getInstance().getCurrentUTCDate();

    // Save profile
    await this.db.saveUserProfile(profile);

    // Log daily reset
    if (this.options.enableEventLogging) {
      await this.db.recordGameEvent({
        type: 'daily_reset',
        timestamp: new Date().toISOString(),
        data: { userId }
      });
    }
  }

  // Validate profile updates
  private validateProfileUpdates(updated: UserProfile, original: UserProfile): void {
    // Ensure no negative values
    if (updated.constitutionalCoins < 0) {
      updated.constitutionalCoins = 0;
    }
    if (updated.experiencePoints < 0) {
      updated.experiencePoints = 0;
    }
    if (updated.currentStreak < 0) {
      updated.currentStreak = 0;
    }
    if (updated.dailyCoinsEarned < 0) {
      updated.dailyCoinsEarned = 0;
    }

    // Ensure daily coins don't exceed limit
    if (updated.dailyCoinsEarned > updated.dailyCoinLimit) {
      updated.dailyCoinsEarned = updated.dailyCoinLimit;
    }

    // Recalculate level if experience changed significantly
    if (Math.abs(updated.experiencePoints - original.experiencePoints) > 10) {
      const newLevel = this.calculateLevel(updated.experiencePoints);
      updated.profileLevel = Math.max(updated.profileLevel, newLevel);
    }
  }

  // Calculate level from experience
  private calculateLevel(experience: number): number {
    const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000];
    
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (experience >= LEVEL_THRESHOLDS[i]) {
        return i;
      }
    }
    return 0;
  }

  // Wait for operation completion
  private async waitForOperation(operationId: string, timeout: number = 5000): Promise<{
    success: boolean;
    profile?: UserProfile;
    error?: string;
  }> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkCompletion = () => {
        if (this.processedOperations.has(operationId)) {
          resolve({ success: true });
        } else if (Date.now() - startTime > timeout) {
          resolve({ success: false, error: 'Operation timeout' });
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      
      checkCompletion();
    });
  }

  // Handle midnight reset
  private async handleMidnightReset(): Promise<void> {
    try {
      const userId = 'default'; // Assuming single user for now
      
      const operation: AtomicOperation = {
        id: this.generateOperationId(),
        type: 'daily_reset',
        timestamp: Date.now(),
        userId,
        data: {},
        priority: 'critical',
        retryCount: 0,
        maxRetries: 1
      };

      await this.addToQueue(operation);
      await this.processOperationQueue();
      
      console.log('Daily reset completed successfully');
    } catch (error) {
      console.error('Daily reset failed:', error);
    }
  }

  // Log operation
  private async logOperation(operation: AtomicOperation): Promise<void> {
    await this.db.recordGameEvent({
      type: 'atomic_operation',
      timestamp: new Date().toISOString(),
      data: {
        operationId: operation.id,
        type: operation.type,
        priority: operation.priority,
        retryCount: operation.retryCount,
        success: true
      }
    });
  }

  // Generate operation ID
  private generateOperationId(): string {
    return `op_${++this.operationId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get pending operations (for debugging)
  getPendingOperations(): AtomicOperation[] {
    return Array.from(this.pendingOperations.values());
  }

  // Clear pending operations (for emergency cleanup)
  clearPendingOperations(): void {
    this.pendingOperations.clear();
    this.operationQueue = [];
  }

  // Cleanup
  destroy(): void {
    this.timeSync.unregisterCallback('midnight');
    this.clearPendingOperations();
    if (this.isProcessing) {
      this.isProcessing = false;
    }
  }
}

export default AtomicStateManager;