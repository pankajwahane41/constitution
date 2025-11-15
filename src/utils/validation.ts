// Professional Validation & Error Handling System

// Validation Schema Types
export interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
  type: 'required' | 'format' | 'range' | 'custom';
}

export interface ValidationSchema<T extends Record<string, any>> {
  [key: string]: ValidationRule<any>[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  firstError?: string;
}

// Common Validation Rules
export const VALIDATION_RULES = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value) => value !== null && value !== undefined && value !== '',
    message,
    type: 'required'
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => typeof value === 'string' && value.length >= min,
    message: message || `Minimum ${min} characters required`,
    type: 'format'
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => typeof value === 'string' && value.length <= max,
    message: message || `Maximum ${max} characters allowed`,
    type: 'format'
  }),

  email: (message = 'Invalid email format'): ValidationRule<string> => ({
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return typeof value === 'string' && emailRegex.test(value);
    },
    message,
    type: 'format'
  }),

  range: (min: number, max: number, message?: string): ValidationRule<number> => ({
    validate: (value) => typeof value === 'number' && value >= min && value <= max,
    message: message || `Value must be between ${min} and ${max}`,
    type: 'range'
  }),

  oneOf: <T>(validValues: T[], message?: string): ValidationRule<T> => ({
    validate: (value) => validValues.includes(value),
    message: message || `Value must be one of: ${validValues.join(', ')}`,
    type: 'custom'
  }),

  custom: <T>(
    validateFn: (value: T) => boolean,
    message: string
  ): ValidationRule<T> => ({
    validate: validateFn,
    message,
    type: 'custom'
  })
};

// Validation Engine
export class Validator<T extends Record<string, any>> {
  private schema: ValidationSchema<T>;

  constructor(schema: ValidationSchema<T>) {
    this.schema = schema;
  }

  validate(data: Partial<T>): ValidationResult {
    const errors: Record<string, string[]> = {};
    let isValid = true;
    let firstError: string | undefined;

    for (const [field, rules] of Object.entries(this.schema)) {
      const value = data[field as keyof T];
      const fieldErrors: string[] = [];

      for (const rule of rules as ValidationRule[]) {
        if (!rule.validate(value)) {
          fieldErrors.push(rule.message);
          if (!firstError) {
            firstError = rule.message;
          }
          isValid = false;
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return {
      isValid,
      errors,
      firstError
    };
  }

  validateField(field: keyof T, value: T[keyof T]): ValidationResult {
    const rules = this.schema[field as string];
    if (!rules) {
      return { isValid: true, errors: {} };
    }

    const fieldErrors: string[] = [];
    let isValid = true;
    let firstError: string | undefined;

    for (const rule of rules) {
      if (!rule.validate(value)) {
        fieldErrors.push(rule.message);
        if (!firstError) {
          firstError = rule.message;
        }
        isValid = false;
      }
    }

    return {
      isValid,
      errors: fieldErrors.length > 0 ? { [field as string]: fieldErrors } : {},
      firstError
    };
  }
}

// Quiz Answer Validation
export interface QuizAnswer {
  questionId: string;
  selectedOption: string;
  timeSpent: number;
  isCorrect?: boolean;
}

export const quizAnswerValidator = new Validator<QuizAnswer>({
  questionId: [
    VALIDATION_RULES.required('Question ID is required'),
    VALIDATION_RULES.minLength(1, 'Invalid question ID')
  ],
  selectedOption: [
    VALIDATION_RULES.required('Please select an answer'),
    VALIDATION_RULES.minLength(1, 'Invalid option selected')
  ],
  timeSpent: [
    VALIDATION_RULES.required('Time tracking required'),
    VALIDATION_RULES.range(0, 300000, 'Invalid time spent (0-5 minutes)')
  ]
});

// User Profile Validation
export interface UserProfileInput {
  displayName: string;
  email?: string;
  profileLevel: number;
  constitutionalCoins: number;
}

export const userProfileValidator = new Validator<UserProfileInput>({
  displayName: [
    VALIDATION_RULES.required('Display name is required'),
    VALIDATION_RULES.minLength(2, 'Name must be at least 2 characters'),
    VALIDATION_RULES.maxLength(50, 'Name must be less than 50 characters')
  ],
  email: [
    VALIDATION_RULES.email('Please enter a valid email address')
  ],
  profileLevel: [
    VALIDATION_RULES.required('Profile level is required'),
    VALIDATION_RULES.range(1, 100, 'Level must be between 1 and 100')
  ],
  constitutionalCoins: [
    VALIDATION_RULES.required('Coins value is required'),
    VALIDATION_RULES.range(0, 1000000, 'Invalid coins amount')
  ]
});

// Error Types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK', 
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  stack?: string;
  userMessage: string;
  retryable: boolean;
  context?: Record<string, any>;
}

// Error Factory
export class ErrorFactory {
  static createError(
    type: ErrorType,
    code: string,
    message: string,
    options: {
      details?: any;
      userMessage?: string;
      retryable?: boolean;
      context?: Record<string, any>;
    } = {}
  ): AppError {
    return {
      type,
      code,
      message,
      details: options.details,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? new Error().stack : undefined,
      userMessage: options.userMessage || this.getDefaultUserMessage(type),
      retryable: options.retryable ?? this.isRetryableByDefault(type),
      context: options.context
    };
  }

  static validation(message: string, details?: any): AppError {
    return this.createError(ErrorType.VALIDATION, 'VALIDATION_ERROR', message, {
      details,
      userMessage: message,
      retryable: false
    });
  }

  static network(message = 'Network error occurred'): AppError {
    return this.createError(ErrorType.NETWORK, 'NETWORK_ERROR', message, {
      userMessage: 'Please check your internet connection and try again',
      retryable: true
    });
  }

  static notFound(resource: string): AppError {
    return this.createError(ErrorType.NOT_FOUND, 'NOT_FOUND', `${resource} not found`, {
      userMessage: `The requested ${resource.toLowerCase()} could not be found`,
      retryable: false
    });
  }

  static server(message = 'Server error occurred'): AppError {
    return this.createError(ErrorType.SERVER, 'SERVER_ERROR', message, {
      userMessage: 'Something went wrong on our end. Please try again later',
      retryable: true
    });
  }

  static timeout(operation: string): AppError {
    return this.createError(ErrorType.TIMEOUT, 'TIMEOUT_ERROR', `${operation} timed out`, {
      userMessage: 'The operation is taking longer than expected. Please try again',
      retryable: true
    });
  }

  private static getDefaultUserMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return 'Please check your input and try again';
      case ErrorType.NETWORK:
        return 'Please check your internet connection';
      case ErrorType.AUTHENTICATION:
        return 'Please log in to continue';
      case ErrorType.PERMISSION:
        return 'You do not have permission to perform this action';
      case ErrorType.NOT_FOUND:
        return 'The requested item could not be found';
      case ErrorType.SERVER:
        return 'Something went wrong. Please try again later';
      case ErrorType.TIMEOUT:
        return 'The request timed out. Please try again';
      default:
        return 'An unexpected error occurred';
    }
  }

  private static isRetryableByDefault(type: ErrorType): boolean {
    return [ErrorType.NETWORK, ErrorType.SERVER, ErrorType.TIMEOUT].includes(type);
  }
}

// Error Recovery Strategies
export interface ErrorRecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger';
}

export class ErrorRecoveryService {
  static getRecoveryActions(error: AppError): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];

    // Always provide retry for retryable errors
    if (error.retryable) {
      actions.push({
        label: 'Try Again',
        action: () => window.location.reload(),
        variant: 'primary'
      });
    }

    // Specific recovery actions based on error type
    switch (error.type) {
      case ErrorType.NETWORK:
        actions.push({
          label: 'Check Connection',
          action: () => {
            if (navigator.onLine) {
              alert('You appear to be online. Please try again.');
            } else {
              alert('You appear to be offline. Please check your connection.');
            }
          },
          variant: 'secondary'
        });
        break;

      case ErrorType.NOT_FOUND:
        actions.push({
          label: 'Go Home',
          action: () => { window.location.href = '/'; },
          variant: 'secondary'
        });
        break;

      case ErrorType.AUTHENTICATION:
        actions.push({
          label: 'Sign In',
          action: () => {
            // Redirect to login or trigger auth modal
            console.log('Redirect to authentication');
          },
          variant: 'primary'
        });
        break;
    }

    return actions;
  }
}

// Data Sanitization
export class DataSanitizer {
  static sanitizeUserInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS vectors
      .substring(0, 1000); // Limit length
  }

  static sanitizeQuizAnswer(answer: string): string {
    if (typeof answer !== 'string') return '';
    
    return answer
      .trim()
      .toLowerCase()
      .substring(0, 500);
  }

  static validateJsonData(data: any, expectedKeys: string[]): boolean {
    if (!data || typeof data !== 'object') return false;
    
    return expectedKeys.every(key => 
      Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined
    );
  }
}

// Type Guards
export const isValidQuizAnswer = (data: any): data is QuizAnswer => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.questionId === 'string' &&
    typeof data.selectedOption === 'string' &&
    typeof data.timeSpent === 'number'
  );
};

export const isAppError = (error: any): error is AppError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof error.type === 'string' &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  );
};