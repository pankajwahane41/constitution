// 10-Day Constitutional Curriculum Configuration
import { QuizCategory } from '../types';

export interface CurriculumDay {
  day: number;
  title: string;
  learningObjective: string;
  storyChapter?: number;
  storyTitle?: string;
  quizConfig: {
    categories: string[];
    questionsPerCategory: number;
    totalQuestions: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  miniGameFocus: string;
  keyTopics: string[];
  description: string;
}

export const CURRICULUM_STRUCTURE: CurriculumDay[] = [
  {
    day: 1,
    title: 'Constitutional Foundation',
    learningObjective: 'Understanding what a Constitution is and India\'s constitutional story',
    storyChapter: 1,
    storyTitle: 'Dr. Ambedkar\'s Early Life & Vision',
    quizConfig: {
      categories: ['preamble'],
      questionsPerCategory: 15,
      totalQuestions: 15,
      difficulty: 'beginner'
    },
    miniGameFocus: 'preamble-builder',
    keyTopics: ['Constitution as supreme law', 'constitutional creation story', 'Preamble promises'],
    description: 'Learn the fundamentals of what makes a Constitution and how India\'s came to be'
  },
  {
    day: 2,
    title: 'Dr. Ambedkar\'s Intellectual Journey',
    learningObjective: 'Understanding how Dr. Ambedkar\'s writings and philosophy shaped the Constitution',
    storyChapter: 2,
    storyTitle: 'Higher Education & Global Learning',
    quizConfig: {
      categories: ['ambedkar-intellectual-journey'],
      questionsPerCategory: 20,
      totalQuestions: 20,
      difficulty: 'intermediate'
    },
    miniGameFocus: 'constitutional-memory',
    keyTopics: ['Annihilation of Caste', 'Columbia University research', 'Buddhist philosophy', 'Constitutional provisions'],
    description: 'Explore how Dr. Ambedkar\'s literary works and academic research became the foundation of constitutional rights and principles'
  },
  {
    day: 3,
    title: 'Constitutional Inspiration & Creation',
    learningObjective: 'How India\'s Constitution was created and its global inspirations',
    storyChapter: 3,
    storyTitle: 'Social Reform & Rights Advocacy',
    quizConfig: {
      categories: ['inspirations'],
      questionsPerCategory: 15,
      totalQuestions: 15,
      difficulty: 'beginner'
    },
    miniGameFocus: 'article-explorer',
    keyTopics: ['Constituent Assembly', 'global constitutional influences', 'Indian adaptations'],
    description: 'Discover how world constitutions inspired India\'s unique constitutional framework'
  },
  {
    day: 4,
    title: 'Fundamental Rights (Part 1)',
    learningObjective: 'Understanding individual rights and constitutional protections',
    storyChapter: 4,
    storyTitle: 'Constituent Assembly Leadership',
    quizConfig: {
      categories: ['fundamental-rights'],
      questionsPerCategory: 20,
      totalQuestions: 20,
      difficulty: 'intermediate'
    },
    miniGameFocus: 'constitution-quiz-master',
    keyTopics: ['Right to Equality', 'Right to Freedom', 'constitutional remedies'],
    description: 'Master the fundamental rights that protect every Indian citizen'
  },
  {
    day: 5,
    title: 'Fundamental Rights & Duties',
    learningObjective: 'Balancing rights with responsibilities',
    storyChapter: 5,
    storyTitle: 'Master Architect of Constitution',
    quizConfig: {
      categories: ['fundamental-rights', 'fundamental-duties'],
      questionsPerCategory: 10,
      totalQuestions: 20,
      difficulty: 'intermediate'
    },
    miniGameFocus: 'balance-challenge',
    keyTopics: ['Remaining fundamental rights', 'fundamental duties', 'directive principles intro'],
    description: 'Understand the balance between individual rights and civic responsibilities'
  },
  {
    day: 6,
    title: 'Government Structure - Union',
    learningObjective: 'Understanding how India\'s central government works',
    storyChapter: 6,
    storyTitle: 'Constitutional Legacy & Impact',
    quizConfig: {
      categories: ['union-government'],
      questionsPerCategory: 20,
      totalQuestions: 20,
      difficulty: 'intermediate'
    },
    miniGameFocus: 'government-simulator',
    keyTopics: ['President', 'Parliament', 'Prime Minister', 'separation of powers'],
    description: 'Learn how India\'s three branches of government work together'
  },
  {
    day: 7,
    title: 'Federal Structure',
    learningObjective: 'Multi-level governance from Union to Local',
    quizConfig: {
      categories: ['state-local-government'],
      questionsPerCategory: 15,
      totalQuestions: 15,
      difficulty: 'intermediate'
    },
    miniGameFocus: 'federalism-explorer',
    keyTopics: ['Federal structure', 'state governments', 'local governance', 'power sharing'],
    description: 'Explore India\'s multi-level federal system and power distribution'
  },
  {
    day: 8,
    title: 'Judiciary System',
    learningObjective: 'Understanding India\'s justice system and constitutional protection',
    quizConfig: {
      categories: ['judiciary'],
      questionsPerCategory: 20,
      totalQuestions: 20,
      difficulty: 'advanced'
    },
    miniGameFocus: 'court-system-navigation',
    keyTopics: ['Supreme Court', 'High Courts', 'constitutional writs', 'judicial review'],
    description: 'Master India\'s three-tier justice system and constitutional protection'
  },
  {
    day: 9,
    title: 'Constitutional Bodies & Institutions',
    learningObjective: 'Special institutions that make democracy work',
    quizConfig: {
      categories: ['constitutional-bodies'],
      questionsPerCategory: 15,
      totalQuestions: 15,
      difficulty: 'intermediate'
    },
    miniGameFocus: 'institution-manager',
    keyTopics: ['Election Commission', 'CAG', 'UPSC', 'NHRC', 'democratic safeguards'],
    description: 'Learn about the special bodies that ensure democratic functioning'
  },
  {
    day: 10,
    title: 'Emergency & Advanced Concepts',
    learningObjective: 'Constitutional crisis management and advanced principles',
    quizConfig: {
      categories: ['emergency-provisions', 'advanced-concepts'],
      questionsPerCategory: 10,
      totalQuestions: 20,
      difficulty: 'advanced'
    },
    miniGameFocus: 'constitutional-crisis-simulator',
    keyTopics: ['Emergency provisions', 'basic structure doctrine', 'constitutional interpretation'],
    description: 'Understand how the Constitution handles crises and advanced legal concepts'
  },
  {
    day: 11,
    title: 'Amendments & Constitutional Evolution',
    learningObjective: 'How Constitution grows and adapts while preserving core values',
    quizConfig: {
      categories: ['amendments', 'preamble'], // Mixed review
      questionsPerCategory: 12,
      totalQuestions: 25,
      difficulty: 'advanced'
    },
    miniGameFocus: 'amendment-process-game',
    keyTopics: ['Amendment procedure', 'basic structure', 'constitutional evolution'],
    description: 'Master constitutional amendments and complete your learning journey'
  }
];

// Helper function to get curriculum day based on user's start date
export function getCurrentCurriculumDay(userStartDate: string, currentDate?: string): CurriculumDay | null {
  const startDate = new Date(userStartDate);
  const now = currentDate ? new Date(currentDate) : new Date();
  
  // Calculate days since start (accounting for timezone)
  const daysDifference = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // If more than 11 days have passed, cycle through again or return null
  if (daysDifference < 0 || daysDifference >= 11) {
    return null; // Outside 11-day window
  }
  
  return CURRICULUM_STRUCTURE[daysDifference];
}

// Helper function to get user's curriculum progress
export function getCurriculumProgress(userStartDate: string, currentDate?: string): {
  currentDay: number;
  totalDays: number;
  progressPercentage: number;
  isCompleted: boolean;
  daysRemaining: number;
} {
  const startDate = new Date(userStartDate);
  const now = currentDate ? new Date(currentDate) : new Date();
  
  const daysDifference = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = Math.max(0, Math.min(daysDifference + 1, 11));
  const isCompleted = daysDifference >= 10;
  const daysRemaining = Math.max(0, 11 - currentDay);
  const progressPercentage = Math.min((currentDay / 11) * 100, 100);
  
  return {
    currentDay,
    totalDays: 11,
    progressPercentage,
    isCompleted,
    daysRemaining
  };
}