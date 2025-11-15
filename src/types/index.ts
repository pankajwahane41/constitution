// Core types for the Constitution Learning Hub

export interface Question {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  image?: string;
}

export interface QuestionData {
  title?: string;
  description?: string;
  questions: Question[] | any[];
}

// Quiz categories (proven working format)
export interface QuizCategory {
  id: string;
  name: string;
  title: string; // Added for compatibility
  description: string;
  file: string;
  questionCount: number;
  color: 'saffron' | 'green' | 'navy';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Educational content types
export interface EducationalModule {
  id: string;
  title: string;
  summary: string; // Added for compatibility
  description: string;
  ageGroup: '8-12' | '12-16' | '14-16';
  estimatedTime: string;
  color: 'saffron' | 'green' | 'navy';
  icon: string;
  story?: string; // Added for compatibility
  concepts?: Concept[]; // Added for compatibility
  examples?: Example[]; // Added for compatibility
  keyTakeaways?: string[]; // Added for compatibility
  content: ContentSection[];
  quizId: string;
  file?: string;
}

export interface Concept {
  title: string;
  description: string;
}

export interface Example {
  title: string;
  description: string;
}

export interface ContentSection {
  type: 'story' | 'concept' | 'activity' | 'content';
  title: string;
  content: string;
  interactive?: InteractiveElement[];
}

export interface InteractiveElement {
  type: 'think' | 'activity' | 'example';
  title: string;
  content: string;
}

// App state
export type AppMode = 'home' | 'learn' | 'quiz' | 'story' | 'profile' | 'games' | 'builder' | 'leaderboard' | 'final-qa';

export interface AppState {
  currentView: AppMode;
  selectedModule: EducationalModule | null;
  selectedCategory: QuizCategory | null;
  currentQuiz: QuizSession | null;
  completedModules: string[];
  isLoading: boolean;
  error: string | null;
}

// Quiz session
export interface QuizSession {
  sourceType: 'category' | 'module';
  sourceId: string;
  sourceName: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  answers: number[];
  isComplete: boolean;
}