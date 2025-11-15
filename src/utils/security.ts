/**
 * Security utilities for input validation and sanitization
 * Prevents XSS attacks and ensures data integrity
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param input - Raw HTML string
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Basic HTML sanitization - removes script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .trim();
}

/**
 * Validates and sanitizes user input for storage
 * @param input - User input string
 * @returns Sanitized string safe for storage
 */
export function validateUserInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, 1000) // Limit input length
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Safely parses JSON with error handling
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  
  try {
    const parsed = JSON.parse(jsonString);
    return parsed || fallback;
  } catch (error) {
    console.warn('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Validates localStorage key to prevent injection
 * @param key - Storage key
 * @returns Validated key or throws error
 */
export function validateStorageKey(key: string): string {
  if (typeof key !== 'string' || !key.trim()) {
    throw new Error('Invalid storage key');
  }
  
  // Only allow alphanumeric, underscore, and dash
  const validKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
  if (validKey !== key) {
    console.warn('Storage key sanitized:', key, '->', validKey);
  }
  
  return validKey;
}

/**
 * Rate limiting for API calls to prevent abuse
 */
class RateLimiter {
  private attempts = new Map<string, number[]>();
  private readonly maxAttempts: number;
  private readonly timeWindow: number;

  constructor(maxAttempts = 10, timeWindowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.timeWindow = timeWindowMs;
  }

  canProceed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Clean old attempts
    const recentAttempts = attempts.filter(time => now - time < this.timeWindow);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    return true;
  }
}

export const quizRateLimiter = new RateLimiter(30, 300000); // 30 attempts per 5 minutes
export const gameRateLimiter = new RateLimiter(50, 300000); // 50 attempts per 5 minutes