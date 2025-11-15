import React, { useState, useEffect, Suspense, lazy } from 'react';

// Lazy load components for better performance
const Home = lazy(() => import('./components/Home'));
const LearnSection = lazy(() => import('./components/LearnSection'));
const QuizSection = lazy(() => import('./components/QuizSection'));
const ModuleViewer = lazy(() => import('./components/ModuleViewer'));
const QuestionCard = lazy(() => import('./components/QuestionCard'));
const QuizResults = lazy(() => import('./components/QuizResults'));
const QuizHeader = lazy(() => import('./components/QuizHeader'));
const ProgressBar = lazy(() => import('./components/ProgressBar'));
const ProfileDashboard = lazy(() => import('./components/ProfileDashboard'));
const StoryModeViewer = lazy(() => import('./components/StoryModeViewer'));
const AvatarCustomizer = lazy(() => import('./components/AvatarCustomizer'));
const AchievementModal = lazy(() => import('./components/AchievementModal'));
const CelebrationModal = lazy(() => import('./components/CelebrationModal'));
const MiniGamesHub = lazy(() => import('./components/MiniGamesHub'));
const ConstitutionBuilder = lazy(() => import('./components/ConstitutionBuilder'));
const LeaderboardView = lazy(() => import('./components/LeaderboardView'));
const DailyChallenges = lazy(() => import('./components/DailyChallenges'));
const AnimatedCoinCollection = lazy(() => import('./components/AnimatedCoinCollection'));
const AnimatedCoinDisplay = lazy(() => import('./components/AnimatedCoinDisplay'));
import CriticalErrorBoundary from './components/CriticalErrorBoundary';
const ErrorBoundary = lazy(() => import('./components/ErrorBoundary'));
const RightsPuzzleGame = lazy(() => import('./components/games').then(module => ({ default: module.RightsPuzzleGame })));
const FamousCasesGame = lazy(() => import('./components/games').then(module => ({ default: module.FamousCasesGame })));
const FinalQAAndDocumentation = lazy(() => import('./components/FinalQAAndDocumentation'));
const GameRouter = lazy(() => import('./components/GameRouter'));

// Lazy load mobile components for better performance
const MobileNavigation = lazy(() => import('./components/MobileNavigation'));
const MobileDashboard = lazy(() => import('./components/MobileDashboard'));
const MobileQuestionCard = lazy(() => import('./components/MobileQuestionCard'));

// Import mobile detection hook
import { useIsMobile, useScreenSize } from './hooks/useIsMobile';
import { AppState, QuizSession, UserProfile, QuizQuestion } from './types/gamification';
import { educationalModules } from './data/educationalModules';
import { quizCategories } from './data/quizCategories';
import { loadQuizData, getStoredData, setStoredData } from './lib/utils';
import { quizRateLimiter, gameRateLimiter } from './utils/security';
import { ConstitutionDB, initializeStorage } from './lib/storage';
import { GamificationEngine } from './lib/gamification';
import { AvatarSystem } from './lib/avatarSystem';
import { AmbedkarStoryMode } from './lib/storyMode';
import { AlertTriangle, User, Trophy, Star, BookOpen, Gamepad2, Building, Users, Zap, ChevronRight } from 'lucide-react';
import { triggerCoinAnimation } from './utils/coinAnimationUtils';

// Loading component for lazy-loaded sections
const SectionLoader: React.FC<{ children: string }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading {children}...</p>
    </div>
  </div>
);

function App() {
  // Mobile detection
  const isMobile = useIsMobile();
  const screenSize = useScreenSize();

  // Enhanced app state with gamification and game management
  const [appState, setAppState] = useState<AppState>({
    currentView: 'home',
    selectedModule: null,
    selectedCategory: null,
    currentQuiz: null,
    completedModules: getStoredData('completedLearningModules', []),
    isLoading: false,
    error: null,
    userProfile: null,
    showAchievementModal: false,
    newAchievements: [],
    showCelebration: false,
    celebrationType: 'achievement',
    currentGame: null,
    gameSession: null,
    gameProgress: null
  });

  // Additional state for race condition management
  const [quizProcessingState, setQuizProcessingState] = useState<'idle' | 'processing' | 'complete'>('idle');
  
  // Processing timeout to prevent getting stuck
  useEffect(() => {
    if (quizProcessingState === 'processing') {
      const timeout = setTimeout(() => {
        console.warn('Quiz processing timeout, forcing completion');
        setQuizProcessingState('idle');
        setQuizProcessingLock(false);
        
        // Force complete the quiz if it's still processing
        if (appState.currentQuiz && !appState.currentQuiz.isComplete) {
          setAppState(prev => ({
            ...prev,
            currentQuiz: prev.currentQuiz ? {
              ...prev.currentQuiz,
              isComplete: true,
              endTime: new Date().toISOString(),
              coinsEarned: prev.currentQuiz.score * 5,
              experienceGained: prev.currentQuiz.score * 10
            } : null,
            isLoading: false,
            error: 'Quiz processing took too long. Your answers have been saved with basic scoring.'
          }));
        }
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [quizProcessingState, appState.currentQuiz]);



  // Gamification systems
  const [db, setDb] = useState<ConstitutionDB | null>(null);
  const [gamificationEngine, setGamificationEngine] = useState<GamificationEngine | null>(null);
  const [avatarSystem] = useState(new AvatarSystem());
  const [storyMode] = useState(new AmbedkarStoryMode());
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize gamification systems
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        setIsInitializing(true);
        
        // Initialize IndexedDB
        const database = await initializeStorage('default');
        setDb(database);

        // Initialize gamification engine
        const engine = new GamificationEngine(database);
        setGamificationEngine(engine);

        // Load or create user profile
        let userProfile = await database.getUserProfile();
        if (!userProfile) {
          userProfile = await createDefaultProfile();
          await database.saveUserProfile(userProfile);
        }

        // Update daily streak
        if (engine) {
          await engine.updateStreak(userProfile);
        }

        setAppState(prev => ({ ...prev, userProfile }));
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize gamification systems:', error);
        setAppState(prev => ({ 
          ...prev, 
          error: 'Failed to initialize application. Please refresh the page.',
          isLoading: false 
        }));
        setIsInitializing(false);
      }
    };

    initializeSystems();
  }, []);

  // Create default user profile
  const createDefaultProfile = async (): Promise<UserProfile> => {
    const now = new Date().toISOString();
    const today = new Date().toDateString();
    return {
      userId: 'default',
      displayName: 'Constitutional Scholar',
      createdAt: now,
      lastLoginAt: now,
      totalPlayTime: 0,
      profileLevel: 1,
      experiencePoints: 0,
      constitutionalCoins: 100, // Starting coins
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: today,
      dailyCoinsEarned: 0,
      dailyCoinLimit: 500,
      version: 1,
      lastDailyReset: today,
      curriculumEnabled: false,
      curriculumDayCompleted: -1,
      curriculumTopicsCompleted: [],
      avatarConfig: avatarSystem.createDefaultAvatar(),
      preferences: {
        theme: 'light',
        language: 'en',
        soundEnabled: true,
        animationsEnabled: true,
        difficulty: 'adaptive',
        notificationsEnabled: true,
        parentalControls: {
          enabled: false,
          timeLimit: 120,
          allowedFeatures: [],
          restrictedContent: []
        }
      },
      achievements: [],
      badges: [],
      dailyChallengeProgress: {
        currentDate: today,
        challenges: [],
        completedToday: 0,
        streakCount: 0,
        totalCompleted: 0
      },
      storyProgress: {
        currentChapter: 1,
        totalChapters: 6,
        unlockedChapters: [1],
        chaptersCompleted: [],
        totalReadingTime: 0,
        bookmarkedSections: [],
        ambedkarJourneyProgress: {
          earlyLife: false,
          education: false,
          socialReform: false,
          constituentAssembly: false,
          constitutionDrafting: false,
          legacy: false
        }
      },
      leaderboardStats: {
        globalRank: 0,
        weeklyRank: 0,
        monthlyRank: 0,
        totalPoints: 0,
        weeklyPoints: 0,
        monthlyPoints: 0,
        quizAccuracy: 0,
        averageQuizTime: 0,
        favoriteTopics: [],
        studyStreak: 0
      }
    };
  };

  // Enhanced navigation functions
  const selectMode = (mode: AppState['currentView']) => {
    console.log('selectMode called with:', mode);
    try {
      setAppState(prev => {
        console.log('Current state before update:', prev.currentView);
        const newState = {
          ...prev,
          currentView: mode,
          selectedModule: null,
          selectedCategory: null,
          currentQuiz: null,
          error: null,
          currentGame: mode !== 'games' ? null : prev.currentGame,
          gameSession: mode !== 'games' ? null : prev.gameSession,
          gameProgress: mode !== 'games' ? null : prev.gameProgress
        };
        console.log('New state after update:', newState.currentView);
        return newState;
      });
    } catch (error) {
      console.error('Error in selectMode:', error);
      setAppState(prev => ({ ...prev, error: 'Navigation error occurred. Please try again.' }));
    }
  };

  // Profile and gamification functions
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!appState.userProfile || !db) return;
    
    const updatedProfile = { ...appState.userProfile, ...updates };
    await db.saveUserProfile(updatedProfile);
    setAppState(prev => ({ ...prev, userProfile: updatedProfile }));
  };

  const showAchievementCelebration = (achievements: any[], type: AppState['celebrationType'] = 'achievement') => {
    setAppState(prev => ({
      ...prev,
      newAchievements: achievements,
      showAchievementModal: true,
      showCelebration: true,
      celebrationType: type
    }));
  };

  const closeAchievementModal = () => {
    setAppState(prev => ({
      ...prev,
      showAchievementModal: false,
      showCelebration: false,
      newAchievements: []
    }));
  };

  const selectModule = (moduleId: string) => {
    try {
      const module = educationalModules.find(m => m.id === moduleId);
      if (module) {
        setAppState(prev => ({ ...prev, selectedModule: module }));
      } else {
        console.error('Module not found:', moduleId);
        setAppState(prev => ({ ...prev, error: 'Module not found. Please try again.' }));
      }
    } catch (error) {
      console.error('Error selecting module:', error);
      setAppState(prev => ({ ...prev, error: 'Error loading module. Please try again.' }));
    }
  };

  const selectCategory = (categoryId: string) => {
    try {
      const category = quizCategories.find(c => c.id === categoryId);
      if (category) {
        setAppState(prev => ({ ...prev, selectedCategory: category }));
      } else {
        console.error('Category not found:', categoryId);
        setAppState(prev => ({ ...prev, error: 'Category not found. Please try again.' }));
      }
    } catch (error) {
      console.error('Error selecting category:', error);
      setAppState(prev => ({ ...prev, error: 'Error loading category. Please try again.' }));
    }
  };

  const completeModule = (moduleId: string) => {
    const updatedCompletedModules = [...appState.completedModules];
    if (!updatedCompletedModules.includes(moduleId)) {
      updatedCompletedModules.push(moduleId);
    }
    
    setAppState(prev => ({
      ...prev,
      completedModules: updatedCompletedModules,
      selectedModule: null
    }));
    
    setStoredData('completedLearningModules', updatedCompletedModules);
    
    // Small delay to ensure the state update completes before scrolling
    setTimeout(() => {
      // Force a re-render of LearnSection by briefly changing the view and back
      if (appState.currentView === 'learn') {
        setAppState(prev => ({ ...prev, currentView: 'home' }));
        setTimeout(() => {
          setAppState(prev => ({ ...prev, currentView: 'learn' }));
        }, 50);
      }
    }, 100);
  };

  const startQuiz = async (sourceType: 'category' | 'module', sourceId: string, retryCount = 0) => {
    setAppState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let quizFile = '';
      let quizName = '';
      
      if (sourceType === 'category') {
        const category = quizCategories.find(c => c.id === sourceId);
        if (!category) throw new Error('Category not found');
        quizFile = category.file;
        quizName = category.name;
      } else {
        const module = educationalModules.find(m => m.id === sourceId);
        if (!module) throw new Error('Module not found');
        quizFile = module.file || 'constitution_questions_preamble.json';
        quizName = module.title;
      }
      
      console.log(`Loading quiz from: ${quizFile} (attempt ${retryCount + 1})`);
      const questions = await loadQuizData(quizFile);
      
      if (!questions || questions.length === 0) {
        throw new Error('No questions found in quiz data');
      }
      
      // Shuffle questions for randomization and limit to 10 for modules
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
      const limitedQuestions = sourceType === 'module' ? shuffledQuestions.slice(0, 10) : shuffledQuestions;
      
      // Convert Question[] to QuizQuestion[]
      const quizQuestions: QuizQuestion[] = limitedQuestions.map((q, index) => ({
        id: `${sourceId}_${index}`,
        category: sourceType,
        topic: quizName,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: 'medium' as const,
        image: q.image
      }));
      
      const quizSession: QuizSession = {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'default',
        sourceType,
        sourceId,
        sourceName: quizName,
        questions: quizQuestions,
        currentQuestionIndex: 0,
        score: 0,
        answers: [],
        isComplete: false,
        startTime: new Date().toISOString(),
        timeSpent: 0,
        hintsUsed: 0,
        perfectScore: false,
        streakBonus: 0,
        coinsEarned: 0,
        experienceGained: 0,
        achievementsUnlocked: []
      };
      
      setAppState(prev => ({
        ...prev,
        currentQuiz: quizSession,
        isLoading: false
      }));
      
    } catch (error) {
      console.error('Error starting quiz:', error);
      
      // Auto-retry up to 2 times for network errors
      if (retryCount < 2 && (error instanceof TypeError || error.message.includes('Failed to fetch'))) {
        console.log(`Retrying quiz load (attempt ${retryCount + 2})...`);
        setTimeout(() => {
          startQuiz(sourceType, sourceId, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // Enhanced error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const userFriendlyError = errorMessage.includes('Failed to fetch') 
        ? 'Network error. Please check your connection and try again.'
        : errorMessage.includes('404')
        ? 'Quiz data not found. Please try another category.'
        : `Failed to load quiz: ${errorMessage}`;
      
      setAppState(prev => ({
        ...prev,
        error: userFriendlyError,
        isLoading: false
      }));
    }
  };

  // Race condition management
  const [answerSubmissionLock, setAnswerSubmissionLock] = useState(false);
  const [quizProcessingLock, setQuizProcessingLock] = useState(false);

  const handleAnswerSelect = async (answerIndex: number) => {
    // Prevent multiple concurrent submissions
    if (answerSubmissionLock || quizProcessingLock) {
      console.log('Answer submission blocked - processing in progress');
      return;
    }

    const quiz = appState.currentQuiz;
    if (!quiz || quiz.isComplete || !appState.userProfile || !gamificationEngine) return;
    
    // Rate limiting check to prevent abuse
    if (!quizRateLimiter.canProceed(appState.userProfile.userId)) {
      setAppState(prev => ({
        ...prev,
        error: 'Too many quiz submissions. Please wait before trying again.'
      }));
      return;
    }
    
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    if (!currentQuestion || !Array.isArray(currentQuestion.options) || currentQuestion.options.length === 0) {
      console.error('Invalid current question:', currentQuestion);
      return;
    }

    if (answerIndex < 0 || answerIndex >= currentQuestion.options.length) {
      console.error('Invalid answer index:', answerIndex, 'max options:', currentQuestion.options.length);
      return;
    }

    // Check if this question has already been answered to prevent race conditions
    if (quiz.answers[quiz.currentQuestionIndex] !== undefined) {
      console.log('Question already answered, ignoring duplicate submission');
      return;
    }

    setAnswerSubmissionLock(true);

    try {
      const newAnswers = [...quiz.answers];
      newAnswers[quiz.currentQuestionIndex] = answerIndex;
      
      const isCorrect = answerIndex === currentQuestion.correct_answer;
      const newScore = isCorrect ? quiz.score + 1 : quiz.score;

      // Check if quiz is complete after this answer
      const isLastQuestion = quiz.currentQuestionIndex === quiz.questions.length - 1;
      const isComplete = isLastQuestion;
      
      // Calculate if this is a perfect score
      const perfectScore = isComplete && newScore === quiz.questions.length;

      const updatedQuiz = {
        ...quiz,
        answers: newAnswers,
        score: newScore,
        perfectScore,
        timeSpent: Math.floor((Date.now() - new Date(quiz.startTime).getTime()) / 1000)
      };

      setAppState(prev => ({
        ...prev,
        currentQuiz: updatedQuiz
      }));

      // Process gamification rewards if quiz is complete (atomic operation)
      if (isComplete && db && gamificationEngine) {
        console.log('Quiz completed, starting reward processing');
        await processQuizCompletionAtomic(updatedQuiz);
      } else if (isComplete) {
        console.warn('Quiz completed but missing dependencies:', {
          hasDB: !!db,
          hasGamificationEngine: !!gamificationEngine
        });
        
        // Fallback: mark quiz as complete without gamification processing
        setAppState(prev => ({
          ...prev,
          currentQuiz: {
            ...updatedQuiz,
            isComplete: true,
            coinsEarned: updatedQuiz.score * 5, // Basic fallback scoring
            experienceGained: updatedQuiz.score * 10
          }
        }));
      }

    } finally {
      setAnswerSubmissionLock(false);
    }
  };

  // Atomic quiz completion processing to prevent race conditions
  const processQuizCompletionAtomic = async (quiz: QuizSession) => {
    if (quizProcessingLock) {
      console.log('Quiz completion already processing, skipping duplicate');
      return;
    }

    console.log('Starting quiz completion processing for quiz:', quiz.sessionId);
    setQuizProcessingLock(true);
    setQuizProcessingState('processing');

    try {
      // Validate required dependencies
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      if (!gamificationEngine) {
        throw new Error('Gamification engine not initialized');
      }

      // Mark as complete first to prevent re-processing
      const completedQuiz = {
        ...quiz,
        isComplete: true,
        endTime: new Date().toISOString(),
        coinsEarned: 0,
        experienceGained: 0
      };

      console.log('Marked quiz as complete, updating UI state');

      // Update UI to show processing state
      setAppState(prev => ({
        ...prev,
        currentQuiz: completedQuiz,
        isLoading: true
      }));

      // Simulate processing delay for better user feedback
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Saving quiz session to database');
      // Save quiz session atomically
      await db.saveQuizSession(completedQuiz);
      
      // Process gamification rewards with user state snapshot
      const currentProfile = appState.userProfile;
      if (!currentProfile) throw new Error('User profile not available');

      console.log('Processing gamification rewards');
      const rewards = await gamificationEngine.processQuizCompletion(currentProfile, completedQuiz);
      
      // Update user profile with rewards (atomic update)
      const updatedProfile = {
        ...currentProfile,
        constitutionalCoins: currentProfile.constitutionalCoins + rewards.coinsEarned,
        experiencePoints: currentProfile.experiencePoints + rewards.experienceGained,
        profileLevel: currentProfile.profileLevel + (rewards.levelUp ? 1 : 0)
      };

      await db.saveUserProfile(updatedProfile);
      
      // Update app state with rewards and clear loading state
      setAppState(prev => ({
        ...prev,
        userProfile: updatedProfile,
        currentQuiz: { 
          ...completedQuiz, 
          coinsEarned: rewards.coinsEarned, 
          experienceGained: rewards.experienceGained 
        },
        isLoading: false
      }));

      // Trigger animated coin collection if coins were earned
      if (rewards.coinsEarned > 0) {
        // Delay slightly to ensure DOM updates
        setTimeout(() => {
          triggerCoinAnimation(rewards.coinsEarned);
        }, 300);
      }

      setQuizProcessingState('complete');

      // Show celebrations for achievements (queue to prevent UI race conditions)
      setTimeout(() => {
        if (rewards.achievementsUnlocked.length > 0) {
          showAchievementCelebration(rewards.achievementsUnlocked, 'achievement');
        } else if (rewards.badgesEarned.length > 0) {
          showAchievementCelebration(rewards.badgesEarned, 'badge');
        } else if (rewards.levelUp) {
          showAchievementCelebration([], 'level_up');
        } else if (completedQuiz.perfectScore) {
          showAchievementCelebration([], 'perfect_score');
        }
      }, 200);

    } catch (error) {
      console.error('Error processing quiz completion:', error);
      console.error('Error details:', {
        quizId: quiz.sessionId,
        hasDB: !!db,
        hasGamificationEngine: !!gamificationEngine,
        hasUserProfile: !!appState.userProfile,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      setQuizProcessingState('idle');
      
      // Ensure quiz is marked as complete even if reward processing fails
      // This prevents the quiz from getting stuck in a processing state
      const fallbackQuiz = {
        ...quiz,
        isComplete: true,
        endTime: new Date().toISOString(),
        coinsEarned: quiz.score * 5, // Basic fallback scoring
        experienceGained: quiz.score * 10
      };
      
      setAppState(prev => ({
        ...prev,
        currentQuiz: fallbackQuiz,
        isLoading: false,
        error: `Quiz completed, but there was an issue processing rewards: ${error instanceof Error ? error.message : 'Unknown error'}. Your progress has been saved.`
      }));
      
      // Auto-clear the error after 5 seconds
      setTimeout(() => {
        setAppState(prev => ({
          ...prev,
          error: null
        }));
      }, 5000);
    } finally {
      setQuizProcessingLock(false);
    }
  };

  const handleNextQuestion = () => {
    const quiz = appState.currentQuiz;
    if (!quiz || quiz.isComplete) return;
    
    // Prevent rapid clicking and race conditions
    if (answerSubmissionLock) {
      console.log('Next question blocked - answer submission in progress');
      return;
    }

    // Ensure current question is answered before proceeding
    if (quiz.answers[quiz.currentQuestionIndex] === undefined) {
      console.log('Cannot proceed - current question not answered');
      return;
    }
    
    setAppState(prev => ({
      ...prev,
      currentQuiz: prev.currentQuiz ? {
        ...prev.currentQuiz,
        currentQuestionIndex: Math.min(prev.currentQuiz.currentQuestionIndex + 1, prev.currentQuiz.questions.length - 1)
      } : null
    }));
  };

  const restartQuiz = () => {
    const quiz = appState.currentQuiz;
    if (!quiz) return;
    
    // Create a completely fresh quiz session to prevent duplicate detection issues
    const freshQuiz: QuizSession = {
      ...quiz,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // New unique session ID
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      isComplete: false,
      startTime: new Date().toISOString(), // Reset start time
      endTime: undefined,
      timeSpent: 0,
      coinsEarned: 0,
      experienceGained: 0,
      achievementsUnlocked: [],
      perfectScore: false,
      streakBonus: 0,
      hintsUsed: 0
    };
    
    // Reset processing states
    setQuizProcessingState('idle');
    setQuizProcessingLock(false);
    setAnswerSubmissionLock(false);
    
    setAppState(prev => ({
      ...prev,
      currentQuiz: freshQuiz
    }));
  };

  const backFromQuiz = () => {
    setAppState(prev => ({
      ...prev,
      currentQuiz: null,
      selectedCategory: null,
      selectedModule: null,
      error: null
    }));
  };

  // Enhanced Game Management Functions
  const startGame = (gameType: string) => {
    const gameSessionData = {
      sessionId: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameType: gameType as any,
      startTime: new Date().toISOString(),
      score: 0,
      perfectGame: false,
      accuracy: 0,
      difficulty: 'easy' as const,
      level: 1,
      coinsEarned: 0,
      experienceGained: 0,
      achievementsUnlocked: [],
      gameData: {},
      isCompleted: false,
      isAbandoned: false
    };
    
    // Update appState to reflect game state
    setAppState(prev => ({
      ...prev,
      currentGame: gameType,
      gameSession: gameSessionData,
      gameProgress: null
    }));
  };

  const endGame = (gameType: string, gameData?: any) => {
    const currentGameSession = appState.gameSession;
    if (currentGameSession) {
      const completedGameSession = {
        ...currentGameSession,
        endTime: new Date().toISOString(),
        isCompleted: true,
        isAbandoned: false,
        gameData: gameData || appState.gameProgress
      };
      
      // Save game session to database
      if (db) {
        db.saveGameSession?.(completedGameSession).catch(console.error);
      }
      
      // Clear game state in appState
      setAppState(prev => ({
        ...prev,
        currentGame: null,
        gameSession: null,
        gameProgress: null
      }));
    }
  };

  const saveGameProgress = (gameType: string, progressData: any) => {
    // Auto-save progress to database and update appState
    if (db && appState.gameSession) {
      const updatedSession = {
        ...appState.gameSession,
        gameData: { ...appState.gameSession.gameData, ...progressData },
        score: progressData.score || appState.gameSession.score,
        accuracy: progressData.accuracy || appState.gameSession.accuracy
      };
      
      db.saveGameSession?.(updatedSession).catch(console.error);
      
      // Update appState
      setAppState(prev => ({
        ...prev,
        gameProgress: progressData,
        gameSession: updatedSession
      }));
    }
  };

  const handleGameCompletion = async (gameType: string, completionData: {
    score: number;
    coinsEarned: number;
    experienceGained: number;
    achievementsUnlocked?: string[];
    gameData?: any;
  }) => {
    if (!appState.userProfile || !gamificationEngine || !db) return;
    
    try {
      // Process gamification rewards
      const rewards = await gamificationEngine.processGameCompletion(appState.userProfile, {
        gameType,
        ...completionData,
        sessionId: appState.gameSession?.sessionId
      });
      
      // Initialize daily coin tracking if needed
      await gamificationEngine.initializeDailyCoinTracking(appState.userProfile);
      
      // Calculate total coins to award
      const totalCoinsRequested = rewards.coinsEarned + completionData.coinsEarned;
      
      // Award coins with daily limit enforcement
      const actualCoinsAwarded = await gamificationEngine.awardCoinsWithLimit(
        appState.userProfile,
        totalCoinsRequested,
        'game_completion'
      );
      
      // Update user profile with experience and level
      const totalExperienceGained = rewards.experienceGained + completionData.experienceGained;
      const newExperience = appState.userProfile.experiencePoints + totalExperienceGained;
      const newLevel = Math.floor(newExperience / 1000) + 1;
      
      await updateUserProfile({
        constitutionalCoins: appState.userProfile.constitutionalCoins, // Already updated by awardCoinsWithLimit
        experiencePoints: newExperience,
        profileLevel: newLevel,
        dailyCoinsEarned: appState.userProfile.dailyCoinsEarned // Updated by awardCoinsWithLimit
      });
      
      // End the game session with completion data
      endGame(gameType, {
        ...completionData,
        coinsEarned: actualCoinsAwarded, // Update with actual coins awarded after daily limit
        rewards: {
          ...rewards,
          coinsEarned: actualCoinsAwarded
        }
      });
      
      // Show celebration if daily limit was reached
      if (actualCoinsAwarded < totalCoinsRequested) {
        console.log(`Daily coin limit reached during game completion. Awarded ${actualCoinsAwarded}/${totalCoinsRequested} coins.`);
      }
      
      // Show celebrations for achievements
      if (rewards.achievementsUnlocked && rewards.achievementsUnlocked.length > 0) {
        showAchievementCelebration(rewards.achievementsUnlocked, 'achievement');
      } else if (rewards.badgesEarned && rewards.badgesEarned.length > 0) {
        showAchievementCelebration(rewards.badgesEarned, 'badge');
      } else if (rewards.levelUp) {
        showAchievementCelebration([], 'level_up');
      }
      
    } catch (error) {
      console.error('Error processing game completion:', error);
      // Still end the game even if reward processing fails
      endGame(gameType, completionData);
    }
  };

  const backFromGame = () => {
    if (appState.gameSession && !appState.gameSession.isCompleted) {
      // Auto-save progress before leaving
      if (appState.gameProgress && db) {
        db.saveGameSession?.({
          ...appState.gameSession,
          gameData: appState.gameProgress,
          isAbandoned: true,
          isCompleted: false
        }).catch(console.error);
      }
    }
    
    // Clear game state in appState
    setAppState(prev => ({
      ...prev,
      currentGame: null,
      gameSession: null,
      gameProgress: null
    }));
  };

  const clearError = () => {
    setAppState(prev => ({ ...prev, error: null }));
  };

  // Error handling component
  if (appState.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full text-center border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{appState.error}</p>
          <div className="space-y-3">
            <button
              onClick={clearError}
              className="w-full p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => selectMode('home')}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced loading screen for initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center w-full mx-auto px-4">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-navy mb-2">Constitutional University</h2>
          <p className="text-gray-600 mb-4">Setting up your gamified learning experience...</p>
          
          {/* Progress indicators */}
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>Initializing storage...</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-100"></div>
              <span>Loading gamification system...</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
              <span>Preparing your profile...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-orange-500 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
      >
        Skip to main content
      </a>
      
      <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 w-full max-w-full overflow-x-hidden ${isMobile ? 'pb-16 mobile-full-width mobile-minimal-padding' : ''}`}>
        {/* Desktop Navigation Header - Mobile Optimized */}
        {appState.userProfile && !isMobile && (
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="w-full px-3 sm:px-4 lg:px-6 mx-auto">
              <div className="flex justify-between items-center h-14 sm:h-16">
                {/* Logo - Mobile Optimized */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-base sm:text-lg lg:text-xl font-bold text-navy">Constitution Hub</h1>
                    <p className="text-xs text-gray-500 hidden lg:block">Learning Platform</p>
                  </div>
                </div>

                {/* Navigation Menu - Mobile Optimized */}
                <nav className="hidden sm:flex space-x-1">
                  {/* Quiz Button - Special Handling */}
                  <button
                    id="quiz-nav-button"
                    onClick={() => {
                      console.log('QUIZ BUTTON CLICKED DIRECTLY! ID: quiz');
                      selectMode('quiz');
                    }}
                    className={`mobile-nav-button px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 min-h-[40px] ${
                      appState.currentView === 'quiz'
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Quiz</span>
                  </button>

                  {/* Other Navigation Buttons - Mobile Optimized */}
                  {[
                    { id: 'home', label: 'Home', icon: BookOpen },
                    { id: 'learn', label: 'Learn', icon: BookOpen },
                    { id: 'story', label: 'Story', icon: Star },
                    { id: 'games', label: 'Games', icon: Gamepad2 },
                    { id: 'builder', label: 'Builder', icon: Building },
                    { id: 'leaderboard', label: 'Leaderboard', icon: Users }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => {
                        console.log('Button clicked! ID:', id, 'Label:', label);
                        selectMode(id as any);
                      }}
                      className={`mobile-nav-button px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 min-h-[40px] ${
                        appState.currentView === id
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className={`${id === 'leaderboard' ? 'hidden lg:inline' : 'hidden sm:inline'}`}>{label}</span>
                    </button>
                  ))}
                </nav>

                {/* User Profile Summary - Mobile Optimized */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Constitutional Coins - Animated */}
                  <Suspense fallback={
                    <div className="flex items-center space-x-1 bg-yellow-100 px-2 sm:px-3 py-1 rounded-full">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs sm:text-sm font-medium text-yellow-700">
                        {appState.userProfile.constitutionalCoins.toLocaleString()}
                      </span>
                    </div>
                  }>
                    <div id="constitutional-coins-display">
                      <AnimatedCoinDisplay 
                        coins={appState.userProfile.constitutionalCoins}
                      />
                    </div>
                  </Suspense>

                  {/* Experience Level */}
                  <div className="hidden sm:flex items-center space-x-1 bg-blue-100 px-2 sm:px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="text-xs sm:text-sm font-medium text-blue-700">
                      <span className="hidden md:inline">Level </span>{appState.userProfile.profileLevel}
                    </span>
                  </div>

                  {/* Current Streak */}
                  {appState.userProfile.currentStreak > 0 && (
                    <div className="hidden md:flex items-center space-x-1 bg-red-100 px-2 sm:px-3 py-1 rounded-full">
                      <span className="text-xs sm:text-sm">🔥</span>
                      <span className="text-xs sm:text-sm font-medium text-red-700">
                        {appState.userProfile.currentStreak}
                      </span>
                    </div>
                  )}

                  {/* Profile Button */}
                  <button
                    onClick={() => selectMode('profile')}
                    className="mobile-nav-button p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors min-h-[40px] min-w-[40px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Mobile Navigation */}
        {appState.userProfile && isMobile && (
          <MobileNavigation
            currentView={appState.currentView}
            onSelectMode={selectMode}
            userProfile={appState.userProfile}
            onProfileSelect={() => selectMode('profile')}
          />
        )}

        {/* Main Content */}
        <main id="main-content" className={`w-full max-w-full overflow-x-hidden ${isMobile ? 'min-h-screen pt-0' : 'min-h-screen'}`}>
          {/* Home Screen */}
          {appState.currentView === 'home' && !appState.currentQuiz && (
            isMobile ? (
              <Suspense fallback={<SectionLoader>Dashboard</SectionLoader>}>
                <MobileDashboard
                  userProfile={appState.userProfile}
                  onSelectMode={selectMode}
                  gamificationEngine={gamificationEngine}
                  storyMode={storyMode}
                  completedModules={appState.completedModules}
                />
              </Suspense>
            ) : (
              <Suspense fallback={<SectionLoader>Home</SectionLoader>}>
                <Home
                  onSelectMode={selectMode}
                  isLoading={appState.isLoading}
                  userProfile={appState.userProfile}
                  storyMode={storyMode}
                  gamificationEngine={gamificationEngine}
                />
              </Suspense>
            )
          )}

          {/* Profile Dashboard */}
          {appState.currentView === 'profile' && appState.userProfile && (
            <Suspense fallback={<SectionLoader>Profile</SectionLoader>}>
              <ProfileDashboard
                userProfile={appState.userProfile}
                onUpdateProfile={updateUserProfile}
                avatarSystem={avatarSystem}
                onBack={() => selectMode('home')}
                achievements={gamificationEngine?.getAvailableAchievements() || []}
                badges={gamificationEngine?.getAvailableBadges() || []}
              />
            </Suspense>
          )}

          {/* Story Mode */}
          {appState.currentView === 'story' && appState.userProfile && (
            <StoryModeViewer
              userProfile={appState.userProfile}
              onBack={() => selectMode('home')}
              onUpdateProgress={(chapterId: string, readingTime: number) => {
                // Update story progress
                updateUserProfile({
                  storyProgress: {
                    ...appState.userProfile!.storyProgress,
                    chaptersCompleted: [...appState.userProfile!.storyProgress.chaptersCompleted, chapterId],
                    totalReadingTime: appState.userProfile!.storyProgress.totalReadingTime + readingTime
                  }
                });
              }}
            />
          )}

          {/* Mini Games Hub */}
          {appState.currentView === 'games' && appState.userProfile && !appState.currentGame && (
            <MiniGamesHub
              userProfile={appState.userProfile}
              onBack={() => selectMode('home')}
              onStartGame={(gameType) => {
                console.log(`Starting game: ${gameType}`);
                startGame(gameType);
              }}
            />
          )}

          {/* Game Router - Individual Games */}
          {appState.currentGame && appState.userProfile && (
            <GameRouter
              gameType={appState.currentGame}
              userProfile={appState.userProfile}
              onGameComplete={handleGameCompletion}
              onBack={backFromGame}
            />
          )}

          {/* Constitution Builder */}
          {appState.currentView === 'builder' && appState.userProfile && (
            <ConstitutionBuilder
              userProfile={appState.userProfile}
              onBack={() => selectMode('home')}
            />
          )}

          {/* Leaderboard */}
          {appState.currentView === 'leaderboard' && appState.userProfile && (
            <LeaderboardView
              userProfile={appState.userProfile}
              onBack={() => selectMode('home')}
              database={db}
              gamificationEngine={gamificationEngine}
            />
          )}

          {/* Final QA & Documentation */}
          {appState.currentView === 'final-qa' && (
            <Suspense fallback={<SectionLoader>Final QA & Documentation</SectionLoader>}>
              <FinalQAAndDocumentation
                onExportReport={() => {
                  // Export functionality would be implemented here
                  console.log('Exporting documentation...');
                }}
                onShareResults={() => {
                  // Share functionality would be implemented here
                  console.log('Sharing results...');
                }}
              />
            </Suspense>
          )}

          {/* Daily Challenges (overlay on home) */}
          {appState.currentView === 'home' && appState.userProfile && (
            <DailyChallenges
              userProfile={appState.userProfile}
              onBack={() => {}} // No back needed for overlay
              onStartChallenge={(type) => {
                if (type === 'quiz') selectMode('quiz');
                else if (type === 'story') selectMode('story');
                else if (type === 'mini_game') selectMode('games');
              }}
            />
          )}
        
          {/* Learn Section */}
          {appState.currentView === 'learn' && !appState.selectedModule && (
            <Suspense fallback={<SectionLoader>Learning Modules</SectionLoader>}>
              <LearnSection
                modules={educationalModules}
                onModuleSelect={selectModule}
                onBack={() => selectMode('home')}
                completedModules={appState.completedModules}
              />
            </Suspense>
          )}
          
          {/* Module Viewer */}
          {appState.selectedModule && (
            <Suspense fallback={<SectionLoader>Module Content</SectionLoader>}>
              <ModuleViewer
                module={appState.selectedModule}
                onBack={() => setAppState(prev => ({ ...prev, selectedModule: null }))}
                onComplete={() => completeModule(appState.selectedModule!.id)}
                isCompleted={appState.completedModules.includes(appState.selectedModule.id)}
              />
            </Suspense>
          )}
          
          {/* Quiz Section */}
          {appState.currentView === 'quiz' && !appState.currentQuiz && !appState.selectedCategory && (
            <Suspense fallback={<SectionLoader>Quiz Categories</SectionLoader>}>
              <QuizSection
                categories={quizCategories}
                onCategorySelect={selectCategory}
                onBack={() => selectMode('home')}
                isLoading={appState.isLoading}
              />
            </Suspense>
          )}
        
        {/* Category Quiz Start Screen */}
        {appState.selectedCategory && !appState.currentQuiz && (
          <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center ${isMobile ? 'p-4 pt-8' : 'p-4'}`}>
            <div className={`bg-white rounded-xl shadow-lg w-full text-center ${isMobile ? 'p-6' : 'p-8'}`}>
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
                <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>📚</span>
              </div>
              <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-navy mb-4`}>{appState.selectedCategory.name}</h2>
              <p className={`text-gray-600 mb-6 ${isMobile ? 'text-sm' : ''}`}>{appState.selectedCategory.description}</p>
              <div className="space-y-3">
                <button
                  onClick={() => startQuiz('category', appState.selectedCategory!.id)}
                  disabled={appState.isLoading}
                  className={`w-full ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${isMobile ? 'text-sm' : ''}`}
                >
                  {appState.isLoading ? 'Loading Quiz...' : `Start Quiz (${appState.selectedCategory.questionCount} questions)`}
                </button>
                <button
                  onClick={() => setAppState(prev => ({ ...prev, selectedCategory: null }))}
                  className={`w-full ${isMobile ? 'p-3' : 'p-3'} border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors ${isMobile ? 'text-sm' : ''}`}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Quiz Interface */}
        {appState.currentQuiz && !appState.currentQuiz.isComplete && (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
            {!isMobile && (
              <QuizHeader
                onBack={backFromQuiz}
                currentQuestion={appState.currentQuiz.currentQuestionIndex + 1}
                totalQuestions={appState.currentQuiz.questions.length}
                score={appState.currentQuiz.score}
                categoryName={appState.currentQuiz.sourceName}
              />
            )}
            
            <div className={isMobile ? "p-0" : "w-full mx-auto p-4"}>
              {!isMobile && (
                <div className="mb-6">
                  <ProgressBar
                    current={appState.currentQuiz.currentQuestionIndex + 1}
                    total={appState.currentQuiz.questions.length}
                    label="Progress"
                  />
                </div>
              )}
              
              {isMobile ? (
                <MobileQuestionCard
                  question={appState.currentQuiz.questions[appState.currentQuiz.currentQuestionIndex]}
                  questionNumber={appState.currentQuiz.currentQuestionIndex + 1}
                  totalQuestions={appState.currentQuiz.questions.length}
                  onAnswer={(answerIndex) => {
                    handleAnswerSelect(answerIndex);
                    // Don't auto-advance - user can click Next button manually
                  }}
                  onBack={backFromQuiz}
                  showResult={appState.currentQuiz.answers[appState.currentQuiz.currentQuestionIndex] !== undefined}
                  correctAnswer={appState.currentQuiz.questions[appState.currentQuiz.currentQuestionIndex].options[appState.currentQuiz.questions[appState.currentQuiz.currentQuestionIndex].correct_answer]}
                  selectedAnswer={appState.currentQuiz.answers[appState.currentQuiz.currentQuestionIndex] !== undefined 
                    ? appState.currentQuiz.questions[appState.currentQuiz.currentQuestionIndex].options[appState.currentQuiz.answers[appState.currentQuiz.currentQuestionIndex]]
                    : undefined}
                  progress={{
                    current: appState.currentQuiz.currentQuestionIndex + 1,
                    total: appState.currentQuiz.questions.length
                  }}
                  score={appState.currentQuiz.score}
                  categoryName={appState.currentQuiz.sourceName}
                />
              ) : (
                <QuestionCard
                  question={appState.currentQuiz.questions[appState.currentQuiz.currentQuestionIndex]}
                  questionNumber={appState.currentQuiz.currentQuestionIndex + 1}
                  totalQuestions={appState.currentQuiz.questions.length}
                  onAnswer={(answerIndex) => {
                    handleAnswerSelect(answerIndex);
                    // Don't auto-advance - user can click Next button manually
                  }}
                  showResult={appState.currentQuiz.answers[appState.currentQuiz.currentQuestionIndex] !== undefined}
                  correctAnswer={appState.currentQuiz.questions[appState.currentQuiz.currentQuestionIndex].options[appState.currentQuiz.questions[appState.currentQuiz.currentQuestionIndex].correct_answer]}
                  selectedAnswer={appState.currentQuiz.answers[appState.currentQuiz.currentQuestionIndex] !== undefined 
                    ? appState.currentQuiz.questions[appState.currentQuiz.currentQuestionIndex].options[appState.currentQuiz.answers[appState.currentQuiz.currentQuestionIndex]]
                    : undefined}
                />
              )}
              
              {/* 🔥 MOBILE QUIZ NAVIGATION - PROMINENT & FIXED 🔥 */}
              {appState.currentQuiz && 
               !appState.currentQuiz.isComplete && 
               appState.currentQuiz.answers[appState.currentQuiz.currentQuestionIndex] !== undefined && (
                <div className={`${isMobile ? 'fixed bottom-24 left-0 right-0 px-4 z-50 bg-white pb-4 border-t-2 border-orange-200' : 'flex justify-center mt-6 px-2'}`}>
                  <button
                    onClick={handleNextQuestion}
                    className={`flex items-center justify-center space-x-2 font-medium shadow-lg transition-colors ${
                      isMobile 
                        ? 'w-full py-4 px-6 text-lg bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-2xl hover:opacity-90 active:scale-95 border-2 border-orange-400 font-bold min-h-[60px]' 
                        : 'px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span>
                      {appState.currentQuiz.currentQuestionIndex === appState.currentQuiz.questions.length - 1 
                        ? '🏆 FINISH QUIZ' 
                        : '➡️ NEXT QUESTION'}
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Enhanced Quiz Results with Gamification */}
        {appState.currentQuiz && appState.currentQuiz.isComplete && (
          <QuizResults
            score={appState.currentQuiz.score}
            totalQuestions={appState.currentQuiz.questions.length}
            onRestart={restartQuiz}
            onBackToCategories={() => setAppState(prev => ({ ...prev, currentQuiz: null }))}
            coinsEarned={appState.currentQuiz.coinsEarned || 0}
            experienceGained={appState.currentQuiz.experienceGained || 0}
            perfectScore={appState.currentQuiz.perfectScore || false}
            userProfile={appState.userProfile}
          />
        )}
        </main>

        {/* Achievement and Celebration Modals */}
        {appState.showAchievementModal && (
          <AchievementModal
            achievements={appState.newAchievements}
            isOpen={appState.showAchievementModal}
            onClose={closeAchievementModal}
            celebrationType={appState.celebrationType}
          />
        )}

        {appState.showCelebration && (
          <CelebrationModal
            type={appState.celebrationType}
            isOpen={appState.showCelebration}
            onClose={() => setAppState(prev => ({ ...prev, showCelebration: false }))}
            data={appState.newAchievements}
          />
        )}

        {/* Animated Coin Collection System */}
        <Suspense fallback={null}>
          <AnimatedCoinCollection />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;