// Gamification System Types for University of Indian Constitution

export interface UserProfile {
  userId: string;
  version: number;
  displayName: string;
  email?: string;
  createdAt: string;
  lastLoginAt: string;
  totalPlayTime: number; // in minutes
  profileLevel: number;
  experiencePoints: number;
  constitutionalCoins: number; // Virtual currency (Jain coins) - total accumulated (unlimited)
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  
  // Daily coin tracking system
  dailyCoinsEarned: number;    // Coins earned today (resets daily)
  dailyCoinLimit: number;      // Maximum coins allowed per day (default: 500)
  lastDailyReset: string;      // Last time daily coins were reset
  
  avatarConfig: AvatarCustomization;
  preferences: UserPreferences;
  achievements: Achievement[];
  badges: Badge[];
  dailyChallengeProgress: DailyChallengeProgress;
  storyProgress: StoryProgress;
  leaderboardStats: LeaderboardStats;
  completedModules?: string[];
}

export interface AvatarCustomization {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  clothing: string;
  accessories: string[];
  culturalElements: {
    turban?: boolean;
    tilaka?: boolean;
    jewelry?: string[];
    traditionalClothes?: string;
  };
  background: string;
  pose: string;
  unlockedItems: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'hi' | 'mixed';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  notificationsEnabled: boolean;
  parentalControls: ParentalControls;
}

export interface ParentalControls {
  enabled: boolean;
  timeLimit: number; // minutes per day
  allowedFeatures: string[];
  restrictedContent: string[];
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: AchievementCategory;
  type: AchievementType;
  icon: string;
  requirements: AchievementRequirement[];
  rewards: Reward[];
  unlockedAt?: string;
  progress: number; // 0-100
  isVisible: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type AchievementCategory = 
  | 'knowledge' 
  | 'engagement' 
  | 'social' 
  | 'exploration' 
  | 'mastery' 
  | 'dedication' 
  | 'special';

export type AchievementType = 
  | 'quiz_completion' 
  | 'perfect_score' 
  | 'streak' 
  | 'daily_login' 
  | 'story_progress' 
  | 'mini_game' 
  | 'constitution_builder' 
  | 'social_interaction' 
  | 'time_based' 
  | 'exploration';

export interface AchievementRequirement {
  type: 'count' | 'streak' | 'score' | 'time' | 'completion' | 'accuracy';
  target: number;
  current: number;
  condition?: string;
}

export interface Badge {
  id: string;
  userId: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  earnedAt: string;
  level: number; // 1-5 (bronze, silver, gold, platinum, diamond)
  displayOrder: number;
}

export type BadgeCategory = 
  | 'fundamental_rights' 
  | 'fundamental_duties' 
  | 'directive_principles' 
  | 'government_structure' 
  | 'judiciary' 
  | 'constitutional_bodies' 
  | 'amendments' 
  | 'preamble' 
  | 'ambedkar_scholar' 
  | 'constitution_master' 
  | 'daily_learner' 
  | 'quiz_champion' 
  | 'story_explorer' 
  | 'game_master' 
  | 'builder_expert';

export interface Reward {
  type: 'coins' | 'avatar_item' | 'badge' | 'title' | 'feature_unlock' | 'experience';
  value: number | string;
  description: string;
}

export interface DailyChallengeProgress {
  currentDate: string;
  challenges: DailyChallenge[];
  completedToday: number;
  streakCount: number;
  totalCompleted: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'story' | 'mini_game' | 'constitution_builder';
  target: number;
  progress: number;
  isCompleted: boolean;
  reward: Reward;
  expiresAt: string;
}

export interface StoryProgress {
  currentChapter: number;
  totalChapters: number;
  unlockedChapters: number[];
  chaptersCompleted: string[]; // Changed to string[] to match chapter IDs
  totalReadingTime: number;
  bookmarkedSections: string[];
  ambedkarJourneyProgress: {
    earlyLife: boolean;
    education: boolean;
    socialReform: boolean;
    constituentAssembly: boolean;
    constitutionDrafting: boolean;
    legacy: boolean;
  };
}

export interface LeaderboardStats {
  globalRank: number;
  weeklyRank: number;
  monthlyRank: number;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  quizAccuracy: number;
  averageQuizTime: number;
  favoriteTopics: string[];
  studyStreak: number;
}

export interface QuizSession {
  sessionId: string;
  userId?: string;
  sourceType: 'category' | 'module' | 'daily_challenge' | 'story_quiz';
  sourceId: string;
  sourceName: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  answers: (number | null)[];
  isComplete: boolean;
  startTime: string;
  endTime?: string;
  timeSpent: number; // in seconds
  hintsUsed: number;
  perfectScore: boolean;
  streakBonus: number;
  coinsEarned: number;
  experienceGained: number;
  achievementsUnlocked: string[];
}

export interface QuizQuestion {
  id: string | number;
  category: string;
  topic: string;
  question: string;
  options: string[];
  correct_answer: number | string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  hint?: string;
  funFact?: string;
  image?: string;
}

export interface ConstitutionBuilderProgress {
  sectionsCompleted: string[];
  articlesPlaced: number;
  totalArticles: number;
  currentLevel: number;
  unlockedFeatures: string[];
  customConstitutions: SavedConstitution[];
  timeSpent: number;
  collaborativeProjects: string[];
}

export interface SavedConstitution {
  id: string;
  name: string;
  description: string;
  articles: ConstitutionArticle[];
  createdAt: string;
  lastModified: string;
  isPublic: boolean;
  likes: number;
  collaborators: string[];
}

export interface ConstitutionArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  importance: number;
  placement: { x: number; y: number };
  connections: string[];
}

export interface MiniGameProgress {
  gamesUnlocked: string[];
  gamesCompleted: string[];
  highScores: Record<string, number>;
  totalGamesPlayed: number;
  favoriteGame: string;
  timeSpent: number;
  achievementsEarned: string[];
}

export interface FamousCasesGameProgress {
  gameId: string;
  userId: string;
  completionDate: string;
  score: number;
  accuracy: number;
  timeSpent: number;
  coinsEarned: number;
  experienceGained: number;
  gameData: {
    matches: number;
    attempts: number;
    difficulty: number;
    casesMatched: string[];
  };
}

export interface SpecificGameProgress {
  famous_cases_match?: FamousCasesGameProgress;
}

export interface NotificationSettings {
  dailyReminders: boolean;
  achievementAlerts: boolean;
  streakWarnings: boolean;
  challengeUpdates: boolean;
  socialUpdates: boolean;
  learningTips: boolean;
  quietHours: {
    start: string;
    end: string;
  };
}

// Removed duplicate GameSession interface - using the complete one defined below

export interface AppState {
  currentView: 'home' | 'learn' | 'quiz' | 'profile' | 'story' | 'games' | 'builder' | 'leaderboard' | 'final-qa';
  selectedModule: any | null;
  selectedCategory: any | null;
  currentQuiz: QuizSession | null;
  completedModules: string[];
  isLoading: boolean;
  error: string | null;
  userProfile: UserProfile | null;
  showAchievementModal: boolean;
  newAchievements: Achievement[];
  showCelebration: boolean;
  celebrationType: 'achievement' | 'badge' | 'level_up' | 'streak' | 'perfect_score';
  currentGame?: string | null;
  gameSession?: GameSession | null;
  gameProgress?: any;
}

// Storage Event Types for IndexedDB
export interface StorageEvent {
  type: 'quiz_completed' | 'achievement_unlocked' | 'badge_earned' | 'streak_updated' | 'profile_updated';
  timestamp: string;
  data: any;
  userId: string;
}

export interface GameificationConfig {
  coinRates: {
    quizCompletion: number;
    perfectScore: number;
    dailyLogin: number;
    streakBonus: number;
    storyReading: number;
    miniGameWin: number;
  };
  experienceRates: {
    quizQuestion: number;
    moduleCompletion: number;
    achievementUnlock: number;
    dailyChallenge: number;
  };
  levelThresholds: number[];
  streakBonusMultiplier: number;
  maxDailyCoins: number;        // Legacy field - use dailyCoinLimit in UserProfile instead
  defaultDailyCoinLimit: number; // Default daily coin limit for new users
}

// Game Manager Types
export type GameType = 
  | 'constitutional_memory'
  | 'rights_puzzle' 
  | 'quiz_race'
  | 'famous_cases'
  | 'preamble_builder'
  | 'amendment_timeline'
  | 'constitution_builder'
  | 'story_quiz'
  | 'daily_challenge';

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'adaptive';

export interface GameState {
  gameId: string;
  gameType: GameType;
  userId: string;
  currentLevel: number;
  currentScore: number;
  highScore: number;
  totalGamesPlayed: number;
  averageScore: number;
  bestTime?: number;
  totalTimeSpent: number; // in seconds
  lastPlayed: string;
  isUnlocked: boolean;
  difficulty: GameDifficulty;
  settings: GameSettings;
  achievements: GameAchievement[];
  statistics: GameStatistics;
}

export interface GameSettings {
  soundEnabled: boolean;
  difficulty: GameDifficulty;
  timeLimit?: number;
  showHints: boolean;
  autoSave: boolean;
  notifications: boolean;
}

export interface GameAchievement {
  id: string;
  gameType: GameType;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number; // 0-100
  requirements: AchievementRequirement[];
  rewards: GameReward[];
}

// Removed duplicate AchievementRequirement interface - using the complete one defined above

export interface GameReward {
  type: 'coins' | 'experience' | 'badge' | 'unlock' | 'title';
  value: number | string;
  description: string;
}

export interface GameStatistics {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number;
  averageTimePerGame: number;
  perfectGames: number;
  streakBest: number;
  currentStreak: number;
  favoriteDifficulty: GameDifficulty;
  mostPlayedGameMode: string;
  achievementsEarned: number;
  totalCoinsEarned: number;
  totalExperienceGained: number;
}

export interface GameSession {
  sessionId: string;
  userId?: string;
  gameType: GameType;
  startTime: string;
  endTime?: string;
  duration?: number;
  score: number;
  perfectGame: boolean;
  timeBonus?: number;
  accuracy: number;
  difficulty: GameDifficulty;
  level: number;
  coinsEarned: number;
  experienceGained: number;
  achievementsUnlocked: string[];
  gameData: Record<string, any>;
  isCompleted: boolean;
  isAbandoned: boolean;
}

export interface HighScore {
  id: string;
  gameType: GameType;
  userId: string;
  score: number;
  rank: number;
  achievedAt: string;
  gameDetails: {
    difficulty: GameDifficulty;
    timeSpent: number;
    accuracy: number;
    perfectGame: boolean;
  };
}

export interface GameProgress {
  userId: string;
  gameType: GameType;
  currentProgress: {
    level: number;
    experience: number;
    nextLevelExp: number;
    completionPercentage: number;
  };
  unlockedContent: string[];
  availableChallenges: GameChallenge[];
  recentSessions: GameSession[];
  leaderboardPosition: number;
}

export interface GameChallenge {
  id: string;
  gameType: GameType;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'story';
  difficulty: GameDifficulty;
  targetScore: number;
  timeLimit?: number;
  rewards: GameReward[];
  expiresAt?: string;
  isCompleted: boolean;
  progress: number;
}

export interface DifficultyProgression {
  userId: string;
  gameType: GameType;
  currentLevel: number;
  recommendedDifficulty: GameDifficulty;
  performanceMetrics: {
    averageScore: number;
    winRate: number;
    averageTime: number;
    consistencyScore: number;
  };
  nextMilestone: {
    type: 'level' | 'achievement' | 'score';
    target: number;
    description: string;
  };
}

export interface GameAnalytics {
  userId: string;
  gameType: GameType;
  playPattern: {
    mostActiveTime: string;
    preferredSessionLength: string;
    favoriteDays: string[];
    playFrequency: 'daily' | 'weekly' | 'monthly' | 'occasional';
  };
  performanceTrend: {
    last7Days: { date: string; score: number; timeSpent: number }[];
    last30Days: { date: string; score: number; timeSpent: number }[];
    improvementRate: number;
  };
  engagementMetrics: {
    retentionRate: number;
    sessionCompletionRate: number;
    averageSessionLength: number;
    returnPlayerRate: number;
  };
}