// Time Synchronization Utility for University of Indian Constitution
// Handles UTC-based time calculations, timezone conversion, and cron-like scheduling

export interface TimeSyncConfig {
  timezone: string;
  resetHour: number; // Hour in UTC when daily resets occur (0-23)
  checkInterval: number; // How often to check for time changes (ms)
}

export class TimeSync {
  private static instance: TimeSync;
  private config: TimeSyncConfig;
  private callbacks: Map<string, () => void> = new Map();
  private checkIntervalId: NodeJS.Timeout | null = null;
  private lastMidnightUTC: Date | null = null;

  private constructor() {
    this.config = {
      timezone: 'UTC', // Always use UTC for consistency
      resetHour: 0, // Midnight UTC
      checkInterval: 60000 // Check every minute
    };
    this.initialize();
  }

  static getInstance(): TimeSync {
    if (!TimeSync.instance) {
      TimeSync.instance = new TimeSync();
    }
    return TimeSync.instance;
  }

  private initialize(): void {
    this.lastMidnightUTC = this.getLastMidnightUTC();
    this.startPeriodicCheck();
  }

  private startPeriodicCheck(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }

    this.checkIntervalId = setInterval(() => {
      this.checkForMidnightCrossing();
    }, this.config.checkInterval);
  }

  private checkForMidnightCrossing(): void {
    const currentMidnight = this.getLastMidnightUTC();
    
    if (!this.lastMidnightUTC || this.lastMidnightUTC.getTime() !== currentMidnight.getTime()) {
      console.log('Midnight crossing detected, triggering daily resets...');
      this.lastMidnightUTC = currentMidnight;
      this.triggerCallbacks('midnight');
    }
  }

  // Get current UTC date string (consistent across timezones)
  getCurrentUTCDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get today's UTC date with specific time
  getTodayUTC(): Date {
    const now = new Date();
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }

  // Get last midnight UTC (reset time)
  getLastMidnightUTC(): Date {
    const now = new Date();
    return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }

  // Get next midnight UTC
  getNextMidnightUTC(): Date {
    const today = this.getTodayUTC();
    return new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }

  // Calculate time until next midnight UTC
  getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number; total: number } {
    const now = new Date();
    const nextMidnight = this.getNextMidnightUTC();
    const diff = nextMidnight.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      hours,
      minutes,
      seconds,
      total: diff
    };
  }

  // Convert UTC to user's local timezone for display
  convertUTCToLocal(utcDate: string | Date): Date {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    return date;
  }

  // Format time until next reset for display
  formatTimeUntilReset(): string {
    const timeUntil = this.getTimeUntilMidnight();
    const { hours, minutes } = timeUntil;
    return `${hours}h ${minutes}m`;
  }

  // Check if a date string represents today (UTC comparison)
  isToday(dateString: string): boolean {
    return dateString === this.getCurrentUTCDate();
  }

  // Check if date is yesterday (UTC comparison)
  isYesterday(dateString: string): boolean {
    const today = new Date(this.getCurrentUTCDate());
    const checkDate = new Date(dateString);
    const diffTime = today.getTime() - checkDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  // Get days between two date strings (UTC)
  getDaysDifference(dateString1: string, dateString2: string): number {
    const date1 = new Date(dateString1);
    const date2 = new Date(dateString2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // Register callback for time-based events
  registerCallback(event: 'midnight' | 'hourly', callback: () => void): string {
    const id = `${event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.callbacks.set(id, callback);
    return id;
  }

  // Remove callback
  unregisterCallback(id: string): void {
    this.callbacks.delete(id);
  }

  private triggerCallbacks(event: 'midnight' | 'hourly'): void {
    for (const [id, callback] of this.callbacks.entries()) {
      try {
        callback();
      } catch (error) {
        console.error(`Error in time sync callback ${id}:`, error);
      }
    }
  }

  // Cleanup
  destroy(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    this.callbacks.clear();
  }

  // Force trigger midnight (for testing)
  forceMidnightTrigger(): void {
    this.triggerCallbacks('midnight');
  }

  // Get timezone info for debugging
  getTimezoneInfo(): {
    utcDate: string;
    localDate: string;
    timeUntilMidnight: string;
    nextMidnightUTC: string;
  } {
    return {
      utcDate: this.getCurrentUTCDate(),
      localDate: new Date().toDateString(),
      timeUntilMidnight: this.formatTimeUntilReset(),
      nextMidnightUTC: this.getNextMidnightUTC().toISOString()
    };
  }
}

// Helper functions for consistent date handling
export const DateUtils = {
  // Get current UTC date string
  getCurrentUTCDate(): string {
    return new Date().toISOString().split('T')[0];
  },

  // Convert any date to UTC date string
  toUTCDateString(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  },

  // Create date at midnight UTC
  createUTCDate(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month, day));
  },

  // Get timestamp for midnight UTC today
  getTodayMidnightUTC(): number {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  },

  // Check if two dates are the same day (UTC)
  isSameUTCDate(date1: Date | string, date2: Date | string): boolean {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    return d1.getUTCFullYear() === d2.getUTCFullYear() &&
           d1.getUTCMonth() === d2.getUTCMonth() &&
           d1.getUTCDate() === d2.getUTCDate();
  },

  // Get start of day in UTC
  getStartOfUTCDate(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  },

  // Get end of day in UTC
  getEndOfUTCDate(date: Date | string): Date {
    const start = this.getStartOfUTCDate(date);
    return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  }
};

export default TimeSync;