import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { UserProfile, Achievement } from '../types/gamification';
import { APP_ACTIONS } from '../constants/actions';

interface UserGameStats {
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  favoriteGame: string | null;
  achievements: Achievement[];
}

export type AppAction = 
  | { type: typeof APP_ACTIONS.LOAD_USER_PROFILE; payload: UserProfile }
  | { type: typeof APP_ACTIONS.UPDATE_USER_PROFILE; payload: Partial<UserProfile> }
  | { type: typeof APP_ACTIONS.UPDATE_COINS; payload: number }
  | { type: typeof APP_ACTIONS.UPDATE_LEVEL; payload: number }
  | { type: typeof APP_ACTIONS.UPDATE_STREAK; payload: number }
  | { type: typeof APP_ACTIONS.START_QUIZ; payload: { categoryId: string; questions: any[] } }
  | { type: typeof APP_ACTIONS.SUBMIT_ANSWER; payload: { questionId: string; answer: string; isCorrect: boolean } }
  | { type: typeof APP_ACTIONS.COMPLETE_QUIZ; payload: { score: number; totalQuestions: number; timeSpent: number } }
  | { type: typeof APP_ACTIONS.RESET_QUIZ }
  | { type: typeof APP_ACTIONS.COMPLETE_MODULE; payload: string }
  | { type: typeof APP_ACTIONS.UPDATE_READING_PROGRESS; payload: { chapterId: string; progress: number } }
  | { type: typeof APP_ACTIONS.UPDATE_GAME_STATS; payload: Partial<UserGameStats> }
  | { type: typeof APP_ACTIONS.UNLOCK_ACHIEVEMENT; payload: Achievement }
  | { type: typeof APP_ACTIONS.SET_LOADING; payload: { key: string; loading: boolean } }
  | { type: typeof APP_ACTIONS.SET_ERROR; payload: { key: string; error: string | null } }
  | { type: typeof APP_ACTIONS.CLEAR_ERROR; payload: string }
  | { type: typeof APP_ACTIONS.SET_MODAL; payload: { modalType: string; data?: any } | null }
  | { type: typeof APP_ACTIONS.NAVIGATE_TO; payload: string };

// Application State Shape
export interface AppState {
  user: {
    profile: UserProfile | null;
    isAuthenticated: boolean;
  };
  quiz: {
    currentQuiz: {
      categoryId: string | null;
      questions: any[];
      currentIndex: number;
      answers: Record<string, string>;
      score: number;
      startTime: number | null;
    };
    isActive: boolean;
  };
  learning: {
    completedModules: string[];
    readingProgress: Record<string, number>;
    currentModule: string | null;
  };
  games: {
    stats: UserGameStats;
    currentGame: string | null;
  };
  ui: {
    loading: Record<string, boolean>;
    errors: Record<string, string>;
    currentModal: { type: string; data?: any } | null;
    currentRoute: string;
  };
}

// Initial State
const initialState: AppState = {
  user: {
    profile: null,
    isAuthenticated: false
  },
  quiz: {
    currentQuiz: {
      categoryId: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      score: 0,
      startTime: null
    },
    isActive: false
  },
  learning: {
    completedModules: [],
    readingProgress: {},
    currentModule: null
  },
  games: {
    stats: {
      totalGamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      favoriteGame: null,
      achievements: []
    },
    currentGame: null
  },
  ui: {
    loading: {},
    errors: {},
    currentModal: null,
    currentRoute: 'home'
  }
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case APP_ACTIONS.LOAD_USER_PROFILE:
      return {
        ...state,
        user: {
          profile: action.payload,
          isAuthenticated: true
        }
      };

    case APP_ACTIONS.UPDATE_USER_PROFILE:
      return {
        ...state,
        user: {
          ...state.user,
          profile: state.user.profile ? {
            ...state.user.profile,
            ...action.payload
          } : null
        }
      };

    case APP_ACTIONS.UPDATE_COINS:
      return {
        ...state,
        user: {
          ...state.user,
          profile: state.user.profile ? {
            ...state.user.profile,
            constitutionalCoins: action.payload
          } : null
        }
      };

    case APP_ACTIONS.START_QUIZ:
      return {
        ...state,
        quiz: {
          currentQuiz: {
            categoryId: action.payload.categoryId,
            questions: action.payload.questions,
            currentIndex: 0,
            answers: {},
            score: 0,
            startTime: Date.now()
          },
          isActive: true
        }
      };

    case APP_ACTIONS.SUBMIT_ANSWER: {
      const newAnswers = {
        ...state.quiz.currentQuiz.answers,
        [action.payload.questionId]: action.payload.answer
      };
      
      return {
        ...state,
        quiz: {
          ...state.quiz,
          currentQuiz: {
            ...state.quiz.currentQuiz,
            answers: newAnswers,
            score: action.payload.isCorrect 
              ? state.quiz.currentQuiz.score + 1 
              : state.quiz.currentQuiz.score
          }
        }
      };
    }

    case APP_ACTIONS.COMPLETE_MODULE: {
      const updatedModules = [...state.learning.completedModules];
      if (!updatedModules.includes(action.payload)) {
        updatedModules.push(action.payload);
      }
      
      return {
        ...state,
        learning: {
          ...state.learning,
          completedModules: updatedModules
        }
      };
    }

    case APP_ACTIONS.UNLOCK_ACHIEVEMENT:
      return {
        ...state,
        user: {
          ...state.user,
          profile: state.user.profile ? {
            ...state.user.profile,
            achievements: [...state.user.profile.achievements, action.payload]
          } : null
        }
      };

    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: {
            ...state.ui.loading,
            [action.payload.key]: action.payload.loading
          }
        }
      };

    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          errors: {
            ...state.ui.errors,
            [action.payload.key]: action.payload.error || ''
          }
        }
      };

    case APP_ACTIONS.CLEAR_ERROR: {
      const newErrors = { ...state.ui.errors };
      delete newErrors[action.payload];
      
      return {
        ...state,
        ui: {
          ...state.ui,
          errors: newErrors
        }
      };
    }

    case APP_ACTIONS.SET_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          currentModal: action.payload ? { 
            type: action.payload.modalType, 
            data: action.payload.data 
          } : null
        }
      };

    case APP_ACTIONS.NAVIGATE_TO:
      return {
        ...state,
        ui: {
          ...state.ui,
          currentRoute: action.payload
        }
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Hook to use context
export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
};

// Custom Hooks for specific domains
export const useUser = () => {
  const { state, dispatch } = useAppState();
  
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    dispatch({ type: APP_ACTIONS.UPDATE_USER_PROFILE, payload: updates });
  }, [dispatch]);

  const updateCoins = useCallback((coins: number) => {
    dispatch({ type: APP_ACTIONS.UPDATE_COINS, payload: coins });
  }, [dispatch]);

  const unlockAchievement = useCallback((achievement: Achievement) => {
    dispatch({ type: APP_ACTIONS.UNLOCK_ACHIEVEMENT, payload: achievement });
  }, [dispatch]);

  return {
    profile: state.user.profile,
    isAuthenticated: state.user.isAuthenticated,
    updateProfile,
    updateCoins,
    unlockAchievement
  };
};

export const useQuiz = () => {
  const { state, dispatch } = useAppState();
  
  const startQuiz = useCallback((categoryId: string, questions: any[]) => {
    dispatch({ 
      type: APP_ACTIONS.START_QUIZ, 
      payload: { categoryId, questions } 
    });
  }, [dispatch]);

  const submitAnswer = useCallback((questionId: string, answer: string, isCorrect: boolean) => {
    dispatch({ 
      type: APP_ACTIONS.SUBMIT_ANSWER, 
      payload: { questionId, answer, isCorrect } 
    });
  }, [dispatch]);

  const resetQuiz = useCallback(() => {
    dispatch({ type: APP_ACTIONS.RESET_QUIZ });
  }, [dispatch]);

  return {
    currentQuiz: state.quiz.currentQuiz,
    isActive: state.quiz.isActive,
    startQuiz,
    submitAnswer,
    resetQuiz
  };
};

export const useUI = () => {
  const { state, dispatch } = useAppState();
  
  const setLoading = useCallback((key: string, loading: boolean) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: { key, loading } });
  }, [dispatch]);

  const setError = useCallback((key: string, error: string | null) => {
    dispatch({ type: APP_ACTIONS.SET_ERROR, payload: { key, error } });
  }, [dispatch]);

  const clearError = useCallback((key: string) => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR, payload: key });
  }, [dispatch]);

  const setModal = useCallback((modalType: string, data?: any) => {
    dispatch({ type: APP_ACTIONS.SET_MODAL, payload: { modalType, data } });
  }, [dispatch]);

  const closeModal = useCallback(() => {
    dispatch({ type: APP_ACTIONS.SET_MODAL, payload: null });
  }, [dispatch]);

  return {
    loading: state.ui.loading,
    errors: state.ui.errors,
    currentModal: state.ui.currentModal,
    currentRoute: state.ui.currentRoute,
    setLoading,
    setError,
    clearError,
    setModal,
    closeModal
  };
};

// Provider Component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          dispatch({ type: APP_ACTIONS.LOAD_USER_PROFILE, payload: profile });
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  // Save user profile to localStorage when it changes
  useEffect(() => {
    if (state.user.profile) {
      try {
        localStorage.setItem('userProfile', JSON.stringify(state.user.profile));
      } catch (error) {
        console.error('Failed to save user profile:', error);
      }
    }
  }, [state.user.profile]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};