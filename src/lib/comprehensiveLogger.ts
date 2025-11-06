// Comprehensive Logging and Monitoring System
// Tracks all point awarding activities, monitors exploitation attempts, and provides alerts

import { ConstitutionDB } from './storage';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY' | 'EXPLOIT' | 'DUPLICATE';
  category: 'gamification' | 'validation' | 'security' | 'performance' | 'user_activity';
  source: string;
  userId?: string;
  sessionId?: string;
  message: string;
  details: Record<string, any>;
  correlationId?: string;
  stackTrace?: string;
}

export interface MonitoringAlert {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'duplicate_attempt' | 'exploit_detected' | 'anomalous_behavior' | 'system_error' | 'security_violation';
  title: string;
  description: string;
  userId?: string;
  sessionId?: string;
  data: Record<string, any>;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface UserBehaviorPattern {
  userId: string;
  patternType: 'normal' | 'suspicious' | 'malicious';
  indicators: PatternIndicator[];
  riskScore: number;
  firstDetected: string;
  lastActivity: string;
  actions: PatternAction[];
}

export interface PatternIndicator {
  type: 'rapid_fire' | 'unusual_timing' | 'repeated_failures' | 'geometric_progression' | 'session_anomalies';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: string;
  evidence: Record<string, any>;
}

export interface PatternAction {
  action: 'monitor' | 'limit' | 'block' | 'investigate' | 'escalate';
  timestamp: string;
  reason: string;
  parameters?: Record<string, any>;
  automated: boolean;
}

export interface SystemMetrics {
  timestamp: string;
  validationStats: {
    totalValidations: number;
    duplicatesPrevented: number;
    exploitsDetected: number;
    falsePositives: number;
    averageValidationTime: number;
    successRate: number;
  };
  securityStats: {
    blockedAttempts: number;
    suspiciousActivities: number;
    sessionViolations: number;
    constraintViolations: number;
  };
  performanceStats: {
    databaseOperations: number;
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  userActivity: {
    activeUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    totalEventsLogged: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  action: AlertAction;
  enabled: boolean;
  cooldown: number; // minutes
  lastTriggered?: string;
}

export interface AlertCondition {
  type: 'threshold' | 'pattern' | 'frequency' | 'anomaly';
  parameters: Record<string, any>;
  timeWindow: number; // minutes
}

export interface AlertAction {
  type: 'log' | 'notify' | 'block' | 'limit' | 'escalate';
  parameters: Record<string, any>;
}

export class ComprehensiveLogger {
  private db: ConstitutionDB;
  private logBuffer: LogEntry[] = [];
  private alertBuffer: MonitoringAlert[] = [];
  private userPatterns: Map<string, UserBehaviorPattern> = new Map();
  private systemMetrics: SystemMetrics;
  private alertRules: Map<string, AlertRule> = new Map();
  private readonly MAX_BUFFER_SIZE = 1000;
  private readonly ALERT_COOLDOWN = 5; // minutes

  constructor(db: ConstitutionDB) {
    this.db = db;
    this.systemMetrics = this.initializeSystemMetrics();
    this.initializeAlertRules();
    this.startBackgroundProcessing();
  }

  private initializeSystemMetrics(): SystemMetrics {
    return {
      timestamp: new Date().toISOString(),
      validationStats: {
        totalValidations: 0,
        duplicatesPrevented: 0,
        exploitsDetected: 0,
        falsePositives: 0,
        averageValidationTime: 0,
        successRate: 100
      },
      securityStats: {
        blockedAttempts: 0,
        suspiciousActivities: 0,
        sessionViolations: 0,
        constraintViolations: 0
      },
      performanceStats: {
        databaseOperations: 0,
        averageResponseTime: 0,
        errorRate: 0,
        throughput: 0
      },
      userActivity: {
        activeUsers: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        totalEventsLogged: 0
      }
    };
  }

  private initializeAlertRules(): void {
    const rules: AlertRule[] = [
      {
        id: 'rapid_duplicates',
        name: 'Rapid Duplicate Attempts',
        description: 'Multiple duplicate attempts in short time',
        condition: {
          type: 'frequency',
          parameters: { threshold: 5, eventType: 'duplicate_attempt' },
          timeWindow: 10
        },
        action: {
          type: 'notify',
          parameters: { severity: 'high', channels: ['log', 'alert'] }
        },
        enabled: true,
        cooldown: this.ALERT_COOLDOWN
      },
      {
        id: 'exploit_detection',
        name: 'Exploit Pattern Detected',
        description: 'Suspicious exploit patterns identified',
        condition: {
          type: 'pattern',
          parameters: { patternTypes: ['rapid_fire', 'time_manipulation'] },
          timeWindow: 15
        },
        action: {
          type: 'block',
          parameters: { duration: 300, userId: '{userId}' }
        },
        enabled: true,
        cooldown: this.ALERT_COOLDOWN
      },
      {
        id: 'unusual_activity',
        name: 'Unusual User Activity',
        description: 'User activity outside normal parameters',
        condition: {
          type: 'anomaly',
          parameters: { baselineDeviation: 2.5, metric: 'validation_attempts' },
          timeWindow: 60
        },
        action: {
          type: 'notify',
          parameters: { enhancedMonitoring: true }
        },
        enabled: true,
        cooldown: this.ALERT_COOLDOWN
      },
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        description: 'System error rate exceeds threshold',
        condition: {
          type: 'threshold',
          parameters: { threshold: 10, metric: 'errorRate' },
          timeWindow: 30
        },
        action: {
          type: 'escalate',
          parameters: { severity: 'critical', immediate: true }
        },
        enabled: true,
        cooldown: this.ALERT_COOLDOWN
      }
    ];

    rules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  private startBackgroundProcessing(): void {
    // Process log buffer every 5 seconds
    setInterval(() => {
      this.processLogBuffer();
    }, 5000);

    // Process alert buffer every 10 seconds
    setInterval(() => {
      this.processAlertBuffer();
    }, 10000);

    // Update system metrics every minute
    setInterval(() => {
      this.updateSystemMetrics();
    }, 60000);

    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000);

    // Evaluate alert rules every 30 seconds
    setInterval(() => {
      this.evaluateAlertRules();
    }, 30000);
  }

  // Main logging methods

  /**
   * Log a validation event
   */
  async logValidationEvent(
    userId: string,
    sessionId: string,
    eventType: string,
    result: 'success' | 'duplicate_prevented' | 'exploit_detected' | 'failed',
    details: Record<string, any> = {},
    correlationId?: string
  ): Promise<void> {
    const logEntry: LogEntry = {
      id: `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: result === 'duplicate_prevented' || result === 'exploit_detected' ? 'WARN' : 'INFO',
      category: 'validation',
      source: 'duplicatePreventionService',
      userId,
      sessionId,
      message: `Validation ${eventType}: ${result}`,
      details: {
        eventType,
        result,
        ...details
      },
      correlationId
    };

    await this.addToLogBuffer(logEntry);

    // Update user behavior pattern
    await this.updateUserBehaviorPattern(userId, eventType, result, details);

    // Check for alert conditions
    await this.checkAlertConditions(logEntry);
  }

  /**
   * Log security-related events
   */
  async logSecurityEvent(
    userId: string | undefined,
    sessionId: string | undefined,
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    const logEntry: LogEntry = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: severity === 'critical' ? 'SECURITY' : severity === 'high' ? 'ERROR' : 'WARN',
      category: 'security',
      source: 'securityMonitor',
      userId,
      sessionId,
      message: `Security Event: ${description}`,
      details: {
        eventType,
        severity,
        description,
        ...details
      }
    };

    await this.addToLogBuffer(logEntry);

    // Create alert for high severity events
    if (severity === 'high' || severity === 'critical') {
      await this.createAlert({
        severity,
        type: 'security_violation',
        title: `Security Event: ${eventType}`,
        description,
        userId,
        sessionId,
        data: details
      });
    }
  }

  /**
   * Log gamification events
   */
  async logGamificationEvent(
    userId: string,
    sessionId: string | undefined,
    eventType: 'achievement_unlocked' | 'badge_earned' | 'coins_awarded' | 'level_up' | 'quiz_completed' | 'game_completed',
    details: Record<string, any> = {}
  ): Promise<void> {
    const logEntry: LogEntry = {
      id: `gam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'gamification',
      source: 'gamificationEngine',
      userId,
      sessionId,
      message: `Gamification Event: ${eventType}`,
      details: {
        eventType,
        ...details
      }
    };

    await this.addToLogBuffer(logEntry);
  }

  /**
   * Log system performance metrics
   */
  async logPerformanceEvent(
    operation: string,
    duration: number,
    success: boolean,
    details: Record<string, any> = {}
  ): Promise<void> {
    const logEntry: LogEntry = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: success ? 'INFO' : 'ERROR',
      category: 'performance',
      source: 'performanceMonitor',
      message: `Performance Event: ${operation}`,
      details: {
        operation,
        duration,
        success,
        ...details
      }
    };

    await this.addToLogBuffer(logEntry);

    // Update system metrics
    this.systemMetrics.performanceStats.databaseOperations++;
    const currentAvg = this.systemMetrics.performanceStats.averageResponseTime;
    this.systemMetrics.performanceStats.averageResponseTime = 
      (currentAvg + duration) / 2;
    
    if (!success) {
      this.systemMetrics.performanceStats.errorRate++;
    }
  }

  /**
   * Log user activity patterns
   */
  async logUserActivity(
    userId: string,
    sessionId: string,
    activityType: string,
    result: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const logEntry: LogEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'user_activity',
      source: 'userActivityTracker',
      userId,
      sessionId,
      message: `User Activity: ${activityType}`,
      details: {
        activityType,
        result,
        ...metadata
      }
    };

    await this.addToLogBuffer(logEntry);
  }

  // Alert management

  async createAlert(alertData: {
    severity: MonitoringAlert['severity'];
    type: MonitoringAlert['type'];
    title: string;
    description: string;
    userId?: string;
    sessionId?: string;
    data: Record<string, any>;
  }): Promise<void> {
    const alert: MonitoringAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      severity: alertData.severity,
      type: alertData.type,
      title: alertData.title,
      description: alertData.description,
      userId: alertData.userId,
      sessionId: alertData.sessionId,
      data: alertData.data,
      acknowledged: false,
      resolved: false
    };

    await this.addToAlertBuffer(alert);
  }

  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    try {
      const alert = this.alertBuffer.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedBy = acknowledgedBy;
        alert.acknowledgedAt = new Date().toISOString();

        // Save to database
        await this.db.saveGameState({
          id: `alert_${alertId}`,
          data: alert,
          timestamp: alert.acknowledgedAt,
          type: 'alert_update'
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      return false;
    }
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<boolean> {
    try {
      const alert = this.alertBuffer.find(a => a.id === alertId);
      if (alert) {
        alert.resolved = true;
        alert.resolvedBy = resolvedBy;
        alert.resolvedAt = new Date().toISOString();

        // Save to database
        await this.db.saveGameState({
          id: `alert_${alertId}`,
          data: alert,
          timestamp: alert.resolvedAt,
          type: 'alert_resolved'
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      return false;
    }
  }

  // User behavior analysis

  private async updateUserBehaviorPattern(
    userId: string,
    activityType: string,
    result: string,
    details: Record<string, any>
  ): Promise<void> {
    let pattern = this.userPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        patternType: 'normal',
        indicators: [],
        riskScore: 0,
        firstDetected: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        actions: []
      };
      this.userPatterns.set(userId, pattern);
    }

    // Analyze pattern indicators
    const indicator = this.analyzeActivityPattern(activityType, result, details);
    if (indicator) {
      pattern.indicators.push(indicator);
      pattern.riskScore += this.getIndicatorRiskScore(indicator);
      pattern.lastActivity = new Date().toISOString();

      // Update pattern type based on risk score
      if (pattern.riskScore > 80) {
        pattern.patternType = 'malicious';
        await this.handleMaliciousPattern(userId, pattern);
      } else if (pattern.riskScore > 40) {
        pattern.patternType = 'suspicious';
        await this.handleSuspiciousPattern(userId, pattern);
      }

      // Limit indicators to last 100
      if (pattern.indicators.length > 100) {
        pattern.indicators = pattern.indicators.slice(-100);
      }
    }
  }

  private analyzeActivityPattern(
    activityType: string,
    result: string,
    details: Record<string, any>
  ): PatternIndicator | null {
    const now = new Date();
    
    // Check for rapid-fire pattern
    if (result === 'duplicate_prevented' || result === 'exploit_detected') {
      return {
        type: 'rapid_fire',
        severity: result === 'exploit_detected' ? 'high' : 'medium',
        description: `Detected ${result} for ${activityType}`,
        timestamp: now.toISOString(),
        evidence: { activityType, result, details }
      };
    }

    // Check for repeated failures
    if (result === 'failed' && details.failureCount > 3) {
      return {
        type: 'repeated_failures',
        severity: 'medium',
        description: `Multiple failures detected for ${activityType}`,
        timestamp: now.toISOString(),
        evidence: { activityType, result, failureCount: details.failureCount }
      };
    }

    // Check for unusual timing
    if (details.timeSpent && details.timeSpent < 1000) {
      return {
        type: 'unusual_timing',
        severity: 'low',
        description: `Unusually fast ${activityType} completion`,
        timestamp: now.toISOString(),
        evidence: { activityType, timeSpent: details.timeSpent }
      };
    }

    return null;
  }

  private getIndicatorRiskScore(indicator: PatternIndicator): number {
    const severityScores = { low: 10, medium: 25, high: 50 };
    return severityScores[indicator.severity];
  }

  private async handleSuspiciousPattern(userId: string, pattern: UserBehaviorPattern): Promise<void> {
    pattern.actions.push({
      action: 'monitor',
      timestamp: new Date().toISOString(),
      reason: 'Suspicious activity pattern detected',
      automated: true
    });

    await this.createAlert({
      severity: 'medium',
      type: 'anomalous_behavior',
      title: 'Suspicious User Activity',
      description: `User ${userId} showing suspicious patterns`,
      userId,
      data: { pattern }
    });
  }

  private async handleMaliciousPattern(userId: string, pattern: UserBehaviorPattern): Promise<void> {
    pattern.actions.push({
      action: 'block',
      timestamp: new Date().toISOString(),
      reason: 'Malicious activity pattern detected',
      parameters: { duration: 3600 }, // 1 hour
      automated: true
    });

    await this.createAlert({
      severity: 'critical',
      type: 'exploit_detected',
      title: 'Malicious User Activity Detected',
      description: `User ${userId} showing malicious patterns`,
      userId,
      data: { pattern }
    });
  }

  // Alert rule evaluation

  private async evaluateAlertRules(): Promise<void> {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      const shouldTrigger = await this.evaluateRuleCondition(rule);
      if (shouldTrigger) {
        await this.triggerAlert(rule);
      }
    }
  }

  private async evaluateRuleCondition(rule: AlertRule): Promise<boolean> {
    const cutoffTime = new Date(Date.now() - (rule.condition.timeWindow * 60000));
    const recentLogs = this.logBuffer.filter(log => 
      log.timestamp > cutoffTime.toISOString()
    );

    switch (rule.condition.type) {
      case 'frequency':
        return this.evaluateFrequencyCondition(recentLogs, rule.condition);
      case 'pattern':
        return this.evaluatePatternCondition(recentLogs, rule.condition);
      case 'threshold':
        return this.evaluateThresholdCondition(rule.condition);
      case 'anomaly':
        return this.evaluateAnomalyCondition(recentLogs, rule.condition);
      default:
        return false;
    }
  }

  private evaluateFrequencyCondition(
    logs: LogEntry[], 
    condition: AlertCondition
  ): boolean {
    const count = logs.filter(log => 
      log.details.eventType === condition.parameters.eventType
    ).length;
    return count >= condition.parameters.threshold;
  }

  private evaluatePatternCondition(
    logs: LogEntry[], 
    condition: AlertCondition
  ): boolean {
    const patternTypes = condition.parameters.patternTypes as string[];
    return logs.some(log => patternTypes.includes(log.details.patternType));
  }

  private evaluateThresholdCondition(condition: AlertCondition): boolean {
    switch (condition.parameters.metric) {
      case 'errorRate':
        const errorRate = this.systemMetrics.performanceStats.errorRate;
        return errorRate >= condition.parameters.threshold;
      default:
        return false;
    }
  }

  private evaluateAnomalyCondition(
    logs: LogEntry[], 
    condition: AlertCondition
  ): boolean {
    // Simple anomaly detection based on standard deviation
    const validationAttempts = logs.filter(log => log.category === 'validation').length;
    const baseline = this.systemMetrics.userActivity.totalEventsLogged / 60; // per minute
    const deviation = Math.abs(validationAttempts - baseline) / baseline;
    return deviation >= condition.parameters.baselineDeviation;
  }

  private async triggerAlert(rule: AlertRule): Promise<void> {
    const now = new Date().toISOString();
    
    // Check cooldown
    if (rule.lastTriggered && 
        Date.now() - new Date(rule.lastTriggered).getTime() < (rule.cooldown * 60000)) {
      return;
    }

    await this.createAlert({
      severity: 'high',
      type: 'anomalous_behavior',
      title: `Alert Rule Triggered: ${rule.name}`,
      description: rule.description,
      data: { rule }
    });

    rule.lastTriggered = now;
  }

  // Buffer processing

  private async addToLogBuffer(logEntry: LogEntry): Promise<void> {
    this.logBuffer.push(logEntry);
    
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer = this.logBuffer.slice(-this.MAX_BUFFER_SIZE);
    }

    this.systemMetrics.userActivity.totalEventsLogged++;
  }

  private async addToAlertBuffer(alert: MonitoringAlert): Promise<void> {
    this.alertBuffer.push(alert);
    
    if (this.alertBuffer.length > this.MAX_BUFFER_SIZE) {
      this.alertBuffer = this.alertBuffer.slice(-this.MAX_BUFFER_SIZE);
    }

    // Save to database immediately for critical alerts
    if (alert.severity === 'critical') {
      await this.saveAlertToDatabase(alert);
    }
  }

  private async processLogBuffer(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    try {
      // Process logs in batches
      const batchSize = 50;
      const batch = this.logBuffer.splice(0, batchSize);

      for (const log of batch) {
        await this.saveLogToDatabase(log);
      }
    } catch (error) {
      console.error('Error processing log buffer:', error);
    }
  }

  private async processAlertBuffer(): Promise<void> {
    if (this.alertBuffer.length === 0) return;

    try {
      const criticalAlerts = this.alertBuffer.filter(alert => 
        alert.severity === 'critical' && !alert.resolved
      );

      for (const alert of criticalAlerts) {
        await this.saveAlertToDatabase(alert);
      }
    } catch (error) {
      console.error('Error processing alert buffer:', error);
    }
  }

  private async saveLogToDatabase(log: LogEntry): Promise<void> {
    await this.db.recordGameEvent({
      type: 'comprehensive_log',
      timestamp: log.timestamp,
      data: log,
      userId: log.userId
    });
  }

  private async saveAlertToDatabase(alert: MonitoringAlert): Promise<void> {
    await this.db.saveGameState({
      id: `alert_${alert.id}`,
      data: alert,
      timestamp: alert.timestamp,
      type: 'security_alert'
    });
  }

  private async checkAlertConditions(log: LogEntry): Promise<void> {
    // Check for duplicate prevention alerts
    if (log.details.result === 'duplicate_prevented') {
      this.systemMetrics.securityStats.blockedAttempts++;
    }

    // Check for exploit detection alerts
    if (log.details.result === 'exploit_detected') {
      this.systemMetrics.securityStats.suspiciousActivities++;
      await this.createAlert({
        severity: 'high',
        type: 'exploit_detected',
        title: 'Exploit Detected',
        description: log.message,
        userId: log.userId,
        sessionId: log.sessionId,
        data: log.details
      });
    }
  }

  private updateSystemMetrics(): Promise<void> {
    this.systemMetrics.timestamp = new Date().toISOString();
    
    // Save metrics to database
    return this.db.saveGameState({
      id: 'system_metrics',
      data: this.systemMetrics,
      timestamp: this.systemMetrics.timestamp,
      type: 'metrics_snapshot'
    });
  }

  private async cleanupOldData(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
      
      // Clean up old user patterns
      for (const [userId, pattern] of this.userPatterns.entries()) {
        if (new Date(pattern.lastActivity) < cutoffDate) {
          this.userPatterns.delete(userId);
        }
      }

      // Clean up resolved alerts older than 7 days
      const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
      this.alertBuffer = this.alertBuffer.filter(alert => 
        !alert.resolved || new Date(alert.timestamp) > sevenDaysAgo
      );

    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }

  // Public query methods

  async getLogs(
    options: {
      userId?: string;
      level?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
    } = {}
  ): Promise<LogEntry[]> {
    // In a real implementation, this would query the database
    // For now, return filtered buffer data
    let logs = [...this.logBuffer];

    if (options.userId) {
      logs = logs.filter(log => log.userId === options.userId);
    }
    if (options.level) {
      logs = logs.filter(log => log.level === options.level);
    }
    if (options.category) {
      logs = logs.filter(log => log.category === options.category);
    }
    if (options.startDate) {
      logs = logs.filter(log => log.timestamp >= options.startDate!);
    }
    if (options.endDate) {
      logs = logs.filter(log => log.timestamp <= options.endDate!);
    }

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return logs.slice(0, options.limit || 100);
  }

  async getAlerts(
    options: {
      severity?: string;
      type?: string;
      acknowledged?: boolean;
      resolved?: boolean;
      limit?: number;
    } = {}
  ): Promise<MonitoringAlert[]> {
    let alerts = [...this.alertBuffer];

    if (options.severity) {
      alerts = alerts.filter(alert => alert.severity === options.severity);
    }
    if (options.type) {
      alerts = alerts.filter(alert => alert.type === options.type);
    }
    if (options.acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === options.acknowledged);
    }
    if (options.resolved !== undefined) {
      alerts = alerts.filter(alert => alert.resolved === options.resolved);
    }

    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return alerts.slice(0, options.limit || 50);
  }

  getUserBehaviorPatterns(userId: string): UserBehaviorPattern | undefined {
    return this.userPatterns.get(userId);
  }

  getSystemMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const comprehensiveLogger: ComprehensiveLogger = new ComprehensiveLogger(
  ConstitutionDB.getInstance()
);
