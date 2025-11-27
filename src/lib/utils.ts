// Utility functions for data transformation and validation
import { Question, QuestionData } from '../types';
import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Transform question data to match expected format - proven working approach
export const transformQuestion = (rawQuestion: any): Question | null => {
  try {
    // Handle different question formats
    const questionText = rawQuestion.question || rawQuestion.question_text || rawQuestion.scenario_text;
    const explanationText = rawQuestion.explanation || rawQuestion.correct_text;
    
    if (!rawQuestion || !questionText || !explanationText) {
      console.warn('Invalid question data:', rawQuestion);
      return null;
    }

    let options: string[] = [];
    let correctIndex = 0;

    // Handle different options formats - proven robust handling
    if (Array.isArray(rawQuestion.options)) {
      // Check if options are objects with 'text' property (e.g., {text: "...", is_correct: true})
      if (rawQuestion.options.length > 0 && typeof rawQuestion.options[0] === 'object' && rawQuestion.options[0].text) {
        options = rawQuestion.options.map((opt: any) => opt.text).filter((text: string) => text && typeof text === 'string');
        // Find correct index from is_correct property
        const correctOptionIndex = rawQuestion.options.findIndex((opt: any) => opt.is_correct === true);
        if (correctOptionIndex !== -1) {
          correctIndex = correctOptionIndex;
        }
      } else {
        // Plain string array
        options = rawQuestion.options.filter(opt => opt && typeof opt === 'string');
      }
    } else if (typeof rawQuestion.options === 'object' && rawQuestion.options !== null) {
      // Convert object format {"A": "...", "B": "..."} to array
      const letters = ['A', 'B', 'C', 'D'];
      options = letters.map(letter => rawQuestion.options[letter]).filter(opt => opt && typeof opt === 'string');
    } else {
      console.warn('Invalid options format:', rawQuestion.options);
      return null;
    }

    if (options.length === 0) {
      console.warn('No valid options found:', rawQuestion);
      return null;
    }

    // Handle different correct answer formats
    // Priority: 1) is_correct from options (already set above), 2) correct_index, 3) correct_answer, 4) correct_option
    if (rawQuestion.correct_index !== undefined || rawQuestion.correct_answer !== undefined || rawQuestion.correct_option !== undefined) {
      const correctAnswer = rawQuestion.correct_index !== undefined ? rawQuestion.correct_index : (rawQuestion.correct_answer || rawQuestion.correct_option);
      
      if (typeof correctAnswer === 'string') {
        // First, check if it's a letter format ("A", "B", "C", "D")
        const letterIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswer);
        if (letterIndex !== -1 && letterIndex < options.length) {
          correctIndex = letterIndex;
        } else {
          // If not a letter, try to find the exact text in options array
          correctIndex = options.findIndex(opt => opt === correctAnswer);
          if (correctIndex === -1) {
            console.warn('Correct answer text not found in options:', correctAnswer, 'options:', options);
            // Don't override correctIndex if it was already set from is_correct
          }
        }
      } else if (typeof correctAnswer === 'number') {
        correctIndex = correctAnswer;
      }
    }

    // Ensure correct index is within bounds
    if (correctIndex < 0 || correctIndex >= options.length) {
      console.warn('Correct answer index out of bounds:', correctIndex, 'options:', options.length);
      correctIndex = 0;
    }

    return {
      question: questionText,
      options: options,
      correct_answer: correctIndex,
      explanation: explanationText
    };
  } catch (error) {
    console.error('Error transforming question:', error, rawQuestion);
    return null;
  }
};

// Load and transform quiz data - proven working function
export const loadQuizData = async (fileName: string): Promise<Question[]> => {
  try {
    const response = await fetch(`/data/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${fileName}`);
    }
    
    const rawData: QuestionData = await response.json();
    
    let questions: Question[] = [];
    
    // Handle different data structures
    if (Array.isArray(rawData)) {
      // Direct array format
      questions = rawData.map(transformQuestion).filter(q => q !== null) as Question[];
    } else if (rawData.questions) {
      // Object with questions property
      if (Array.isArray(rawData.questions)) {
        questions = rawData.questions.map(transformQuestion).filter(q => q !== null) as Question[];
      } else {
        throw new Error('Questions property is not an array');
      }
    } else {
      throw new Error('Invalid data structure - missing questions array');
    }
    
    if (questions.length === 0) {
      throw new Error('No valid questions found in data file');
    }
    
    console.log(`Successfully loaded ${questions.length} questions from ${fileName}`);
    return questions;
  } catch (error) {
    console.error('Error loading quiz data:', error);
    throw error;
  }
};

// Load questions from file (alternative function name)
export const loadQuestionsFromFile = loadQuizData;

// Mark module as complete
export const markModuleComplete = (moduleId: string) => {
  const completedModules = getStoredData('completedLearningModules', []);
  if (!completedModules.includes(moduleId)) {
    completedModules.push(moduleId);
    setStoredData('completedLearningModules', completedModules);
  }
};

// Get color classes based on theme color
export const getColorClasses = (color: string, isCompleted: boolean = false) => {
  const baseClasses = {
    saffron: 'from-saffron/30 via-saffron/20 to-saffron/10 border-saffron/40',
    green: 'from-green/30 via-green/20 to-green/10 border-green/40',
    navy: 'from-navy/30 via-navy/20 to-navy/10 border-navy/40'
  };
  
  const hoverClasses = {
    saffron: 'hover:from-saffron/40 hover:via-saffron/30 hover:to-saffron/20 hover:border-saffron/60',
    green: 'hover:from-green/40 hover:via-green/30 hover:to-green/20 hover:border-green/60',
    navy: 'hover:from-navy/40 hover:via-navy/30 hover:to-navy/20 hover:border-navy/60'
  };
  
  const colorKey = color as keyof typeof baseClasses;
  const base = baseClasses[colorKey] || baseClasses.saffron;
  const hover = hoverClasses[colorKey] || hoverClasses.saffron;
  
  return `${base} ${hover}`;
};

// Get icon color based on theme
export const getIconColor = (color: string) => {
  const colors = {
    saffron: 'text-saffron',
    green: 'text-green',
    navy: 'text-navy'
  };
  return colors[color as keyof typeof colors] || 'text-saffron';
};

// Get age group badge configuration
export const getAgeGroupBadge = (ageGroup: string) => {
  const badges = {
    '8-12': { text: 'Ages 8-12', color: 'bg-saffron/20 text-saffron' },
    '12-16': { text: 'Ages 12-16', color: 'bg-green/20 text-green' },
    '14-16': { text: 'Ages 14-16', color: 'bg-navy/20 text-navy' }
  };
  return badges[ageGroup] || badges['8-12'];
};

// Get difficulty badge configuration
export const getDifficultyBadge = (difficulty: string) => {
  const badges = {
    beginner: { text: 'Beginner Friendly', color: 'bg-saffron/20 text-saffron' },
    intermediate: { text: 'Intermediate', color: 'bg-green/20 text-green' },
    advanced: { text: 'Advanced', color: 'bg-navy/20 text-navy' }
  };
  return badges[difficulty] || badges.beginner;
};

// Validate array before calling .map() - prevents errors
export const safeArrayMap = <T, U>(array: T[] | null | undefined, callback: (item: T, index: number) => U): U[] => {
  if (!Array.isArray(array)) {
    console.warn('Attempted to map on non-array:', array);
    return [];
  }
  return array.map(callback);
};

// Local storage helpers
export const getStoredData = (key: string, defaultValue: any) => {
  try {
    // Import security utilities
    const { validateStorageKey, safeJsonParse } = require('../utils/security');
    
    const validKey = validateStorageKey(key);
    const stored = localStorage.getItem(validKey);
    return safeJsonParse(stored, defaultValue);
  } catch (error) {
    console.warn('Error reading from localStorage securely:', error);
    return defaultValue;
  }
};

export const setStoredData = (key: string, data: any) => {
  try {
    // Import security utilities
    const { validateStorageKey, validateUserInput } = require('../utils/security');
    
    const validKey = validateStorageKey(key);
    
    // Sanitize string values before storage
    let sanitizedData = data;
    if (typeof data === 'string') {
      sanitizedData = validateUserInput(data);
    } else if (typeof data === 'object' && data !== null) {
      sanitizedData = JSON.parse(JSON.stringify(data, (key, val) => 
        typeof val === 'string' ? validateUserInput(val) : val
      ));
    }
    
    localStorage.setItem(validKey, JSON.stringify(sanitizedData));
  } catch (error) {
    console.warn('Error writing to localStorage securely:', error);
    throw new Error('Failed to store data securely');
  }
};