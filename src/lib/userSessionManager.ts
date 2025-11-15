// User Session Manager for Duplicate Prevention
// Tracks user sessions, validates activities, and prevents session-based exploits

import { ConstitutionDB } from './storage';
import { UserProfile } from '../types/gamification';

export interface UserSession {
  sessionId: string;
  userId: string;
  startTime: string;
  lastActivity: string;
  endTime?: string;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
  sessionToken: string;
  activities: SessionActivity[];
  location?: SessionLocation;
  deviceFingerprint?: string;
  riskScore: number;
  validationState: SessionValidationState;
}

export interface SessionActivity {
  activityId: string;
  activityType: string;
  timestamp: string;
  duration?: number;
  result: 'success' | 'failed' | 'duplicate_prevented' | 'exploit_detected';
  metadata?: Record<string, any>;
}

export interface SessionLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  coordinates?: { lat: number; lng: number };
}

export interface SessionValidationState {
  isValid: boolean;
  issues: SessionIssue[];
  lastCheck: string;
  trustedActivities: string[];
  blockedActivities: string[];
}

export interface SessionIssue {
  type: 'rapid_fire' | 'suspicious_pattern' | 'location_change' | 'device_mismatch' | 'time_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
  resolution?: string;
}

export interface SessionValidationOptions {
  strictMode?: boolean;
  enableGeoValidation?: boolean;
  enableDeviceTracking?: boolean;
  enableTimeValidation?: boolean;
  maxSessionDuration?: number; // in minutes
  maxActivitiesPerSession?: number;
  requireActivityValidation?: boolean;
}

export class UserSessionManager {
  private db: ConstitutionDB;
  private activeSessions: Map<string, UserSession> = new Map();
  private sessionTokens: Map<string, string> = new Map(); // sessionId -> token
  private deviceFingerprints: Map<string, string> = new Map(); // userId -> fingerprint
  private readonly SESSION_TIMEOUT = 3600000; // 1 hour
  private readonly MAX_SIMULTANEOUS_SESSIONS = 3;
  private readonly MAX_ACTIVITIES_PER_HOUR = 100;
  private readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 5;

  constructor(db: ConstitutionDB) {
    this.db = db;
    this.initializeSessionCleanup();
  }

  private initializeSessionCleanup(): void {
    // Clean up expired sessions every 10 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 600000);
  }

  /**
   * Create a new user session
   */
  async createSession(
    userId: string,
    sessionToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<UserSession> {
    // Check for existing active sessions
    const existingSessions = await this.getUserSessions(userId, true);
    if (existingSessions.length >= this.MAX_SIMULTANEOUS_SESSIONS) {
      throw new Error('Maximum number of simultaneous sessions reached');
    }

    const sessionId = `session_${userId}_${Date.now()}`;
    
    // Generate device fingerprint
    const deviceFingerprint = this.generateDeviceFingerprint(userAgent || '');
    
    const session: UserSession = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true,
      ipAddress,
      userAgent,
      sessionToken,
      activities: [],
      deviceFingerprint,
      riskScore: 0,
      validationState: {
        isValid: true,
        issues: [],
        lastCheck: new Date().toISOString(),
        trustedActivities: [],
        blockedActivities: []
      }
    };

    // Store session
    this.activeSessions.set(sessionId, session);
    this.sessionTokens.set(sessionToken, sessionId);
    this.deviceFingerprints.set(userId, deviceFingerprint);

    // Persist to database
    await this.saveSessionToStorage(session);

    // Log session creation
    await this.db.recordGameEvent({
      type: 'session_created',
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
      metadata: { userAgent, ipAddress, deviceFingerprint }
    });

    return session;
  }

  /**
   * Update session with new activity
   */
  async recordSessionActivity(
    sessionId: string,
    activityType: string,
    activityId: string,
    result: SessionActivity['result'],
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const activity: SessionActivity = {
      activityId,
      activityType,
      timestamp: new Date().toISOString(),
      result,
      metadata
    };

    session.activities.push(activity);
    session.lastActivity = new Date().toISOString();

    // Update risk score based on activity result
    this.updateRiskScore(session, activity);

    // Validate session after activity
    await this.validateSession(session);

    // Update storage
    await this.saveSessionToStorage(session);
  }

  /**
   * End a user session
   */
  async endSession(sessionId: string, reason: string = 'user_logout'): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.endTime = new Date().toISOString();
    session.isActive = false;

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
    this.sessionTokens.delete(session.sessionToken);

    // Save final session state
    await this.saveSessionToStorage(session);

    // Log session end
    await this.db.recordGameEvent({
      type: 'session_ended',
      sessionId,
      userId: session.userId,
      timestamp: new Date().toISOString(),
      metadata: { reason, duration: this.calculateSessionDuration(session) }
    });
  }

  /**
   * Validate session for suspicious activities
   */
  async validateSession(session: UserSession): Promise<SessionValidationState> {
    const issues: SessionIssue[] = [];
    let riskScore = 0;

    // Check for rapid-fire activities
    const recentActivities = session.activities.filter(activity => 
      new Date(activity.timestamp) > new Date(Date.now() - 300000) // Last 5 minutes
    );

    if (recentActivities.length > this.MAX_ACTIVITIES_PER_HOUR) {
      issues.push({
        type: 'rapid_fire',
        severity: 'high',
        description: `Excessive activity rate: ${recentActivities.length} activities in 5 minutes`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
      riskScore += 30;
    }

    // Check for suspicious activity patterns
    const failedActivities = session.activities.filter(activity => 
      activity.result === 'failed' || activity.result === 'duplicate_prevented'
    );

    if (failedActivities.length > this.SUSPICIOUS_ACTIVITY_THRESHOLD) {
      issues.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        description: `High failure rate: ${failedActivities.length} failed activities`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
      riskScore += 20;
    }

    // Check for exploit detection
    const exploitActivities = session.activities.filter(activity => 
      activity.result === 'exploit_detected'
    );

    if (exploitActivities.length > 0) {
      issues.push({
        type: 'suspicious_pattern',
        severity: 'critical',
        description: `Exploit attempts detected: ${exploitActivities.length}`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
      riskScore += 50;
    }

    // Check for time anomalies
    const sessionDuration = this.calculateSessionDuration(session);
    if (sessionDuration > 14400000) { // 4 hours
      issues.push({
        type: 'time_anomaly',
        severity: 'medium',
        description: `Unusually long session: ${Math.round(sessionDuration / 3600000)} hours`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
      riskScore += 15;
    }

    // Update session validation state
    session.validationState = {
      isValid: issues.filter(issue => issue.severity === 'critical').length === 0,
      issues,
      lastCheck: new Date().toISOString(),
      trustedActivities: this.getTrustedActivities(session),
      blockedActivities: this.getBlockedActivities(session)
    };

    session.riskScore = riskScore;

    return session.validationState;
  }

  /**
   * Get active session for user
   */
  async getActiveSession(sessionToken: string): Promise<UserSession | null> {
    const sessionId = this.sessionTokens.get(sessionToken);
    if (!sessionId) {
      return null;
    }

    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      return null;
    }

    // Check if session is still valid
    const lastActivity = new Date(session.lastActivity);
    if (Date.now() - lastActivity.getTime() > this.SESSION_TIMEOUT) {
      await this.endSession(sessionId, 'timeout');
      return null;
    }

    return session;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string, activeOnly: boolean = false): Promise<UserSession[]> {
    const allSessions: UserSession[] = [];
    
    this.activeSessions.forEach(session => {
      if (session.userId === userId && (!activeOnly || session.isActive)) {
        allSessions.push(session);
      }
    });

    // Also check database for historical sessions
    const storedSessions = await this.getStoredSessions(userId);
    allSessions.push(...storedSessions.filter(session => 
      !activeOnly || session.isActive
    ));

    return allSessions.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  /**
   * Validate session token and get session
   */
  async validateSessionToken(sessionToken: string): Promise<{
    isValid: boolean;
    session?: UserSession;
    error?: string;
  }> {
    try {
      const session = await this.getActiveSession(sessionToken);
      
      if (!session) {
        return {
          isValid: false,
          error: 'Invalid or expired session'
        };
      }

      // Validate session state
      const validationState = await this.validateSession(session);
      
      if (!validationState.isValid) {
        const criticalIssues = validationState.issues.filter(issue => issue.severity === 'critical');
        if (criticalIssues.length > 0) {
          await this.endSession(session.sessionId, 'validation_failed');
          return {
            isValid: false,
            error: 'Session validation failed due to critical issues'
          };
        }
      }

      return {
        isValid: true,
        session
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Session validation error'
      };
    }
  }

  /**
   * Block suspicious session activities
   */
  async blockSessionActivity(
    sessionId: string,
    activityType: string,
    reason: string,
    duration: number = 300000 // 5 minutes default
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add to blocked activities
    const blockUntil = new Date(Date.now() + duration);
    session.validationState.blockedActivities.push(`${activityType}_${blockUntil.getTime()}`);

    // Log the blocking
    await this.db.recordGameEvent({
      type: 'activity_blocked',
      sessionId,
      userId: session.userId,
      timestamp: new Date().toISOString(),
      metadata: { activityType, reason, duration }
    });

    // Save updated session
    await this.saveSessionToStorage(session);
  }

  /**
   * Check if activity is allowed for session
   */
  async isActivityAllowed(sessionId: string, activityType: string): Promise<{
    allowed: boolean;
    reason?: string;
    blockedUntil?: string;
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return { allowed: false, reason: 'Session not found' };
    }

    // Check if activity is in blocked list
    const now = new Date();
    for (const blockedActivity of session.validationState.blockedActivities) {
      const [activity, timestamp] = blockedActivity.split('_');
      if (activity === activityType) {
        const blockedUntil = new Date(parseInt(timestamp));
        if (blockedUntil > now) {
          return {
            allowed: false,
            reason: 'Activity temporarily blocked',
            blockedUntil: blockedUntil.toISOString()
          };
        }
      }
    }

    // Check session validation state
    if (!session.validationState.isValid) {
      const criticalIssues = session.validationState.issues.filter(
        issue => issue.severity === 'critical' && !issue.resolved
      );
      if (criticalIssues.length > 0) {
        return {
          allowed: false,
          reason: 'Session has unresolved critical issues'
        };
      }
    }

    return { allowed: true };
  }

  // Private helper methods

  private generateDeviceFingerprint(userAgent: string): string {
    // Simple device fingerprinting based on user agent
    // In a real implementation, this would be more sophisticated
    const navigator = typeof window !== 'undefined' ? window.navigator : null;
    const screen = typeof window !== 'undefined' ? window.screen : null;
    
    const fingerprint = [
      userAgent,
      navigator?.language,
      navigator?.platform,
      screen?.width + 'x' + screen?.height,
      navigator?.hardwareConcurrency
    ].filter(Boolean).join('|');

    // Simple hash (in production, use a proper hash function)
    return btoa(fingerprint).slice(0, 32);
  }

  private async saveSessionToStorage(session: UserSession): Promise<void> {
    await this.db.saveGameState({
      id: `session_${session.sessionId}`,
      data: session,
      timestamp: session.lastActivity,
      type: 'user_session',
      userId: session.userId
    });
  }

  private async getStoredSessions(userId: string): Promise<UserSession[]> {
    try {
      const allStates = await this.db.getAllGameStates();
      return allStates
        .filter(state => state.type === 'user_session' && state.userId === userId)
        .map(state => state.data as UserSession);
    } catch (error) {
      console.warn('Failed to load stored sessions:', error);
      return [];
    }
  }

  private updateRiskScore(session: UserSession, activity: SessionActivity): void {
    switch (activity.result) {
      case 'duplicate_prevented':
        session.riskScore += 5;
        break;
      case 'exploit_detected':
        session.riskScore += 15;
        break;
      case 'failed':
        session.riskScore += 2;
        break;
      case 'success':
        // Decrease risk score slightly for successful activities
        session.riskScore = Math.max(0, session.riskScore - 1);
        break;
    }
  }

  private getTrustedActivities(session: UserSession): string[] {
    // Activities that have been consistently successful
    return session.activities
      .filter(activity => activity.result === 'success')
      .map(activity => activity.activityType)
      .filter((type, index, array) => array.indexOf(type) === index); // Unique types
  }

  private getBlockedActivities(session: UserSession): string[] {
    return session.validationState.blockedActivities;
  }

  private calculateSessionDuration(session: UserSession): number {
    const endTime = session.endTime ? new Date(session.endTime) : new Date();
    const startTime = new Date(session.startTime);
    return endTime.getTime() - startTime.getTime();
  }

  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessions: string[] = [];

    this.activeSessions.forEach((session, sessionId) => {
      const lastActivity = new Date(session.lastActivity);
      if (now - lastActivity.getTime() > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    });

    for (const sessionId of expiredSessions) {
      await this.endSession(sessionId, 'timeout');
    }
  }

  /**
   * Get session statistics for a user
   */
  async getSessionStatistics(userId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    averageDuration: number;
    totalActivities: number;
    riskLevel: 'low' | 'medium' | 'high';
    recentIssues: SessionIssue[];
  }> {
    const sessions = await this.getUserSessions(userId, false);
    const activeSessions = sessions.filter(s => s.isActive);
    
    const completedSessions = sessions.filter(s => s.endTime);
    const totalDuration = completedSessions.reduce((sum, session) => 
      sum + this.calculateSessionDuration(session), 0
    );
    const averageDuration = completedSessions.length > 0 
      ? totalDuration / completedSessions.length 
      : 0;

    const totalActivities = sessions.reduce((sum, session) => 
      sum + session.activities.length, 0
    );

    // Calculate overall risk level
    const recentIssues = sessions
      .flatMap(s => s.validationState.issues)
      .filter(issue => new Date(issue.timestamp) > new Date(Date.now() - 86400000)) // Last 24 hours
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const riskScore = recentIssues.reduce((score, issue) => {
      const severityWeight = { low: 1, medium: 3, high: 5, critical: 10 }[issue.severity];
      return score + severityWeight;
    }, 0);

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore > 20) riskLevel = 'high';
    else if (riskScore > 10) riskLevel = 'medium';

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      averageDuration,
      totalActivities,
      riskLevel,
      recentIssues
    };
  }

  /**
   * Force end all sessions for a user (useful for security incidents)
   */
  async forceEndAllSessions(userId: string, reason: string = 'forced_logout'): Promise<void> {
    const userSessions = await this.getUserSessions(userId, true);
    
    for (const session of userSessions) {
      await this.endSession(session.sessionId, reason);
    }

    // Log the mass logout
    await this.db.recordGameEvent({
      type: 'mass_logout',
      userId,
      timestamp: new Date().toISOString(),
      metadata: { reason, sessionsEnded: userSessions.length }
    });
  }
}

// Export singleton instance
export const userSessionManager = new UserSessionManager(
  ConstitutionDB.getInstance()
);
