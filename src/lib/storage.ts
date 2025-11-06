// IndexedDB Storage System for University of Indian Constitution
// Implements event-sourcing pattern with state restoration capabilities

import { 
  UserProfile, 
  StorageEvent, 
  QuizSession, 
  Achievement, 
  Badge, 
  ConstitutionBuilderProgress, 
  SavedConstitution,
  ConstitutionArticle
} from '../types/gamification';

const DB_NAME = 'ConstitutionUniversity';
const DB_VERSION = 2;

// Store names
const STORES = {
  USER_PROFILE: 'userProfile',
  QUIZ_SESSIONS: 'quizSessions', 
  ACHIEVEMENTS: 'achievements',
  BADGES: 'badges',
  DAILY_CHALLENGES: 'dailyChallenges',
  STORY_PROGRESS: 'storyProgress',
  CONSTITUTION_BUILDER: 'constitutionBuilder',
  SAVED_CONSTITUTIONS: 'savedConstitutions',
  MINI_GAMES: 'miniGames',
  GAME_STATES: 'gameStates', // Game state storage
  HIGH_SCORES: 'highScores', // High scores storage
  GAME_SESSIONS: 'gameSessions', // Game sessions
  EVENTS: 'events', // Event sourcing
  SNAPSHOTS: 'snapshots', // State snapshots
  SETTINGS: 'settings'
};

export class ConstitutionDB {
  private static instance: ConstitutionDB;
  private db: IDBDatabase | null = null;
  private userId: string = 'default';

  private constructor() {}

  static getInstance(): ConstitutionDB {
    if (!ConstitutionDB.instance) {
      ConstitutionDB.instance = new ConstitutionDB();
    }
    return ConstitutionDB.instance;
  }

  async initialize(userId: string = 'default'): Promise<void> {
    this.userId = userId;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // User Profile Store
        if (!db.objectStoreNames.contains(STORES.USER_PROFILE)) {
          const profileStore = db.createObjectStore(STORES.USER_PROFILE, { keyPath: 'userId' });
          profileStore.createIndex('lastLoginAt', 'lastLoginAt');
          profileStore.createIndex('profileLevel', 'profileLevel');
        }

        // Quiz Sessions Store
        if (!db.objectStoreNames.contains(STORES.QUIZ_SESSIONS)) {
          const quizStore = db.createObjectStore(STORES.QUIZ_SESSIONS, { keyPath: 'sessionId' });
          quizStore.createIndex('userId', 'userId');
          quizStore.createIndex('startTime', 'startTime');
          quizStore.createIndex('sourceType', 'sourceType');
          quizStore.createIndex('isComplete', 'isComplete');
        }

        // Achievements Store
        if (!db.objectStoreNames.contains(STORES.ACHIEVEMENTS)) {
          const achievementStore = db.createObjectStore(STORES.ACHIEVEMENTS, { keyPath: 'id' });
          achievementStore.createIndex('userId', 'userId');
          achievementStore.createIndex('category', 'category');
          achievementStore.createIndex('unlockedAt', 'unlockedAt');
          achievementStore.createIndex('rarity', 'rarity');
        }

        // Badges Store
        if (!db.objectStoreNames.contains(STORES.BADGES)) {
          const badgeStore = db.createObjectStore(STORES.BADGES, { keyPath: 'id' });
          badgeStore.createIndex('userId', 'userId');
          badgeStore.createIndex('category', 'category');
          badgeStore.createIndex('earnedAt', 'earnedAt');
          badgeStore.createIndex('level', 'level');
        }

        // Daily Challenges Store
        if (!db.objectStoreNames.contains(STORES.DAILY_CHALLENGES)) {
          const challengeStore = db.createObjectStore(STORES.DAILY_CHALLENGES, { keyPath: 'id' });
          challengeStore.createIndex('userId', 'userId');
          challengeStore.createIndex('currentDate', 'currentDate');
          challengeStore.createIndex('isCompleted', 'isCompleted');
        }

        // Story Progress Store
        if (!db.objectStoreNames.contains(STORES.STORY_PROGRESS)) {
          const storyStore = db.createObjectStore(STORES.STORY_PROGRESS, { keyPath: 'userId' });
          storyStore.createIndex('currentChapter', 'currentChapter');
          storyStore.createIndex('totalReadingTime', 'totalReadingTime');
        }

        // Constitution Builder Store
        if (!db.objectStoreNames.contains(STORES.CONSTITUTION_BUILDER)) {
          const builderStore = db.createObjectStore(STORES.CONSTITUTION_BUILDER, { keyPath: 'userId' });
          builderStore.createIndex('currentLevel', 'currentLevel');
          builderStore.createIndex('articlesPlaced', 'articlesPlaced');
        }

        // Saved Constitutions Store
        if (!db.objectStoreNames.contains(STORES.SAVED_CONSTITUTIONS)) {
          const savedConstitutionStore = db.createObjectStore(STORES.SAVED_CONSTITUTIONS, { keyPath: 'id' });
          savedConstitutionStore.createIndex('userId', 'userId');
          savedConstitutionStore.createIndex('createdAt', 'createdAt');
          savedConstitutionStore.createIndex('isPublic', 'isPublic');
        }

        // Mini Games Store
        if (!db.objectStoreNames.contains(STORES.MINI_GAMES)) {
          const gameStore = db.createObjectStore(STORES.MINI_GAMES, { keyPath: 'userId' });
          gameStore.createIndex('totalGamesPlayed', 'totalGamesPlayed');
          gameStore.createIndex('favoriteGame', 'favoriteGame');
        }

        // Game States Store
        if (!db.objectStoreNames.contains(STORES.GAME_STATES)) {
          const gameStateStore = db.createObjectStore(STORES.GAME_STATES, { keyPath: 'id' });
          gameStateStore.createIndex('userId', 'userId');
          gameStateStore.createIndex('gameType', 'gameType');
          gameStateStore.createIndex('lastPlayed', 'lastPlayed');
        }

        // High Scores Store
        if (!db.objectStoreNames.contains(STORES.HIGH_SCORES)) {
          const highScoreStore = db.createObjectStore(STORES.HIGH_SCORES, { keyPath: 'id' });
          highScoreStore.createIndex('userId', 'userId');
          highScoreStore.createIndex('gameType', 'gameType');
          highScoreStore.createIndex('score', 'score');
          highScoreStore.createIndex('achievedAt', 'achievedAt');
        }

        // Game Sessions Store
        if (!db.objectStoreNames.contains(STORES.GAME_SESSIONS)) {
          const gameSessionStore = db.createObjectStore(STORES.GAME_SESSIONS, { keyPath: 'sessionId' });
          gameSessionStore.createIndex('userId', 'userId');
          gameSessionStore.createIndex('gameType', 'gameType');
          gameSessionStore.createIndex('startTime', 'startTime');
          gameSessionStore.createIndex('isComplete', 'isComplete');
        }

        // Events Store (Event Sourcing)
        if (!db.objectStoreNames.contains(STORES.EVENTS)) {
          const eventStore = db.createObjectStore(STORES.EVENTS, { keyPath: 'id', autoIncrement: true });
          eventStore.createIndex('userId', 'userId');
          eventStore.createIndex('type', 'type');
          eventStore.createIndex('timestamp', 'timestamp');
        }

        // Snapshots Store
        if (!db.objectStoreNames.contains(STORES.SNAPSHOTS)) {
          const snapshotStore = db.createObjectStore(STORES.SNAPSHOTS, { keyPath: 'id' });
          snapshotStore.createIndex('userId', 'userId');
          snapshotStore.createIndex('timestamp', 'timestamp');
        }

        // Settings Store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          const settingsStore = db.createObjectStore(STORES.SETTINGS, { keyPath: 'userId' });
        }
      };
    });
  }

  // User Profile Operations
  async getUserProfile(userId: string = this.userId): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.USER_PROFILE], 'readonly');
      const store = transaction.objectStore(STORES.USER_PROFILE);
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.USER_PROFILE], 'readwrite');
      const store = transaction.objectStore(STORES.USER_PROFILE);
      const request = store.put(profile);

      request.onsuccess = () => {
        this.recordEvent('profile_updated', profile);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Quiz Session Operations
  async saveQuizSession(session: QuizSession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.QUIZ_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORES.QUIZ_SESSIONS);
      const sessionWithUserId = { ...session, userId: this.userId };
      const request = store.put(sessionWithUserId);

      request.onsuccess = () => {
        if (session.isComplete) {
          this.recordEvent('quiz_completed', session);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getQuizSessions(limit: number = 50): Promise<QuizSession[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.QUIZ_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORES.QUIZ_SESSIONS);
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => {
        const sessions = request.result
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .slice(0, limit);
        resolve(sessions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Achievement Operations
  async saveAchievement(achievement: Achievement): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.ACHIEVEMENTS], 'readwrite');
      const store = transaction.objectStore(STORES.ACHIEVEMENTS);
      const achievementWithUserId = { ...achievement, userId: this.userId };
      const request = store.put(achievementWithUserId);

      request.onsuccess = () => {
        if (achievement.unlockedAt) {
          this.recordEvent('achievement_unlocked', achievement);
        }
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAchievements(): Promise<Achievement[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.ACHIEVEMENTS], 'readonly');
      const store = transaction.objectStore(STORES.ACHIEVEMENTS);
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Badge Operations
  async saveBadge(badge: Badge): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.BADGES], 'readwrite');
      const store = transaction.objectStore(STORES.BADGES);
      const badgeWithUserId = { ...badge, userId: this.userId };
      const request = store.put(badgeWithUserId);

      request.onsuccess = () => {
        this.recordEvent('badge_earned', badge);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getBadges(): Promise<Badge[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.BADGES], 'readonly');
      const store = transaction.objectStore(STORES.BADGES);
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Constitution Builder Operations
  async saveConstitutionBuilderProgress(progress: ConstitutionBuilderProgress): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CONSTITUTION_BUILDER], 'readwrite');
      const store = transaction.objectStore(STORES.CONSTITUTION_BUILDER);
      const progressWithUserId = { ...progress, userId: this.userId };
      const request = store.put(progressWithUserId);

      request.onsuccess = () => {
        this.recordEvent('constitution_builder_progress', progress);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getConstitutionBuilderProgress(): Promise<ConstitutionBuilderProgress | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CONSTITUTION_BUILDER], 'readonly');
      const store = transaction.objectStore(STORES.CONSTITUTION_BUILDER);
      const request = store.get(this.userId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveConstitution(constitution: SavedConstitution): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SAVED_CONSTITUTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.SAVED_CONSTITUTIONS);
      const constitutionWithUserId = { ...constitution, userId: this.userId };
      const request = store.put(constitutionWithUserId);

      request.onsuccess = () => {
        this.recordEvent('constitution_saved', constitution);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSavedConstitutions(): Promise<SavedConstitution[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SAVED_CONSTITUTIONS], 'readonly');
      const store = transaction.objectStore(STORES.SAVED_CONSTITUTIONS);
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteConstitution(constitutionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SAVED_CONSTITUTIONS], 'readwrite');
      const store = transaction.objectStore(STORES.SAVED_CONSTITUTIONS);
      const request = store.delete(constitutionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Event Sourcing
  private async recordEvent(type: string, data: any): Promise<void> {
    if (!this.db) return;
    
    const event: StorageEvent = {
      type: type as any,
      timestamp: new Date().toISOString(),
      data,
      userId: this.userId
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.EVENTS], 'readwrite');
      const store = transaction.objectStore(STORES.EVENTS);
      const request = store.add(event);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // State Restoration
  async createSnapshot(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const profile = await this.getUserProfile();
    const achievements = await this.getAchievements();
    const badges = await this.getBadges();
    const quizSessions = await this.getQuizSessions(10);

    const snapshot = {
      id: `snapshot_${this.userId}_${Date.now()}`,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      data: {
        profile,
        achievements,
        badges,
        recentQuizSessions: quizSessions
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SNAPSHOTS], 'readwrite');
      const store = transaction.objectStore(STORES.SNAPSHOTS);
      const request = store.put(snapshot);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utility Methods
  async getStorageSize(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0
      };
    }
    return { used: 0, available: 0 };
  }

  async clearUserData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stores = Object.values(STORES);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(stores, 'readwrite');
      let completedStores = 0;

      stores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const index = store.index?.('userId');
        
        if (index) {
          const request = index.openCursor(this.userId);
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              completedStores++;
              if (completedStores === stores.length) {
                resolve();
              }
            }
          };
          request.onerror = () => reject(request.error);
        } else {
          completedStores++;
          if (completedStores === stores.length) {
            resolve();
          }
        }
      });
    });
  }

  async exportUserData(): Promise<string> {
    const profile = await this.getUserProfile();
    const achievements = await this.getAchievements();
    const badges = await this.getBadges();
    const quizSessions = await this.getQuizSessions(100);

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      userId: this.userId,
      data: {
        profile,
        achievements,
        badges,
        quizSessions
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Game Session Operations
  async saveGameSession(session: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.GAME_SESSIONS], 'readwrite');
      const store = transaction.objectStore(STORES.GAME_SESSIONS);
      const sessionWithUserId = { ...session, userId: this.userId };
      const request = store.put(sessionWithUserId);

      request.onsuccess = () => {
        this.recordEvent('game_session_saved', session);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getGameSessions(limit: number = 50): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.GAME_SESSIONS], 'readonly');
      const store = transaction.objectStore(STORES.GAME_SESSIONS);
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => {
        const sessions = request.result
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .slice(0, limit);
        resolve(sessions);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Game State Operations
  async saveGameState(gameState: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.GAME_STATES], 'readwrite');
      const store = transaction.objectStore(STORES.GAME_STATES);
      const stateWithUserId = { ...gameState, userId: this.userId };
      const request = store.put(stateWithUserId);

      request.onsuccess = () => {
        this.recordEvent('game_state_saved', gameState);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getGameState(gameId: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.GAME_STATES], 'readonly');
      const store = transaction.objectStore(STORES.GAME_STATES);
      const request = store.get(gameId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllGameStates(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.GAME_STATES], 'readonly');
      const store = transaction.objectStore(STORES.GAME_STATES);
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteGameState(gameId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.GAME_STATES], 'readwrite');
      const store = transaction.objectStore(STORES.GAME_STATES);
      const request = store.delete(gameId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // High Score Operations
  async saveHighScore(highScore: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.HIGH_SCORES], 'readwrite');
      const store = transaction.objectStore(STORES.HIGH_SCORES);
      const scoreWithUserId = { ...highScore, userId: this.userId };
      const request = store.put(scoreWithUserId);

      request.onsuccess = () => {
        this.recordEvent('high_score_saved', highScore);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getHighScore(gameType: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.HIGH_SCORES], 'readonly');
      const store = transaction.objectStore(STORES.HIGH_SCORES);
      const index = store.index('gameType');
      const request = index.getAll(gameType);

      request.onsuccess = () => {
        const userScores = request.result
          .filter(score => score.userId === this.userId)
          .sort((a, b) => b.score - a.score);
        resolve(userScores[0] || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getTopHighScores(gameType: string, limit: number = 10): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.HIGH_SCORES], 'readonly');
      const store = transaction.objectStore(STORES.HIGH_SCORES);
      const index = store.index('gameType');
      const request = index.getAll(gameType);

      request.onsuccess = () => {
        const scores = request.result
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
        resolve(scores);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getUserHighScores(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.HIGH_SCORES], 'readonly');
      const store = transaction.objectStore(STORES.HIGH_SCORES);
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => {
        const scores = request.result
          .sort((a, b) => b.score - a.score);
        resolve(scores);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Game Event Operations
  async recordGameEvent(event: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const gameEvent = {
      ...event,
      userId: this.userId,
      timestamp: event.timestamp || new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.EVENTS], 'readwrite');
      const store = transaction.objectStore(STORES.EVENTS);
      const request = store.add(gameEvent);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Daily Challenge Operations
  async saveDailyChallenge(challenge: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DAILY_CHALLENGES], 'readwrite');
      const store = transaction.objectStore(STORES.DAILY_CHALLENGES);
      const challengeWithUserId = { ...challenge, userId: this.userId };
      const request = store.put(challengeWithUserId);

      request.onsuccess = () => {
        this.recordEvent('daily_challenge_saved', challenge);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getDailyChallenges(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DAILY_CHALLENGES], 'readonly');
      const store = transaction.objectStore(STORES.DAILY_CHALLENGES);
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getTodayChallenges(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const today = new Date().toDateString();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DAILY_CHALLENGES], 'readonly');
      const store = transaction.objectStore(STORES.DAILY_CHALLENGES);
      const index = store.index('currentDate');
      const request = index.getAll(today);

      request.onsuccess = () => {
        const todayChallenges = request.result.filter(challenge => challenge.userId === this.userId);
        resolve(todayChallenges);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateChallengeProgress(challengeId: string, progress: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DAILY_CHALLENGES], 'readwrite');
      const store = transaction.objectStore(STORES.DAILY_CHALLENGES);
      const getRequest = store.get(challengeId);

      getRequest.onsuccess = () => {
        const challenge = getRequest.result;
        if (challenge && challenge.userId === this.userId) {
          challenge.progress = progress;
          challenge.lastUpdated = new Date().toISOString();
          
          // Check if completed
          if (progress >= challenge.target && !challenge.isCompleted) {
            challenge.isCompleted = true;
            challenge.completedAt = new Date().toISOString();
          }
          
          const putRequest = store.put(challenge);
          putRequest.onsuccess = () => {
            this.recordEvent('challenge_progress_updated', challenge);
            resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async resetExpiredChallenges(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const today = new Date().toDateString();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.DAILY_CHALLENGES], 'readwrite');
      const store = transaction.objectStore(STORES.DAILY_CHALLENGES);
      const index = store.index('userId');
      const request = index.openCursor(this.userId);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const challenge = cursor.value;
          const expiryDate = challenge.expiresAt ? new Date(challenge.expiresAt).toDateString() : null;
          
          if (expiryDate && expiryDate < today) {
            // Reset challenge for new day
            challenge.currentDate = today;
            challenge.progress = 0;
            challenge.isCompleted = false;
            challenge.completedAt = null;
            challenge.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            challenge.lastUpdated = new Date().toISOString();
            
            cursor.update(challenge);
          }
          
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getChallengeStatistics(): Promise<{
    totalCompleted: number;
    streakBest: number;
    averageCompletion: number;
    favoriteChallengeType: string;
  }> {
    if (!this.db) throw new Error('Database not initialized');
    
    const challenges = await this.getDailyChallenges();
    const completedChallenges = challenges.filter(c => c.isCompleted);
    
    // Calculate statistics
    const totalCompleted = completedChallenges.length;
    
    // Find best streak (consecutive days with completed challenges)
    const challengeDates = completedChallenges
      .map(c => c.completedAt ? new Date(c.completedAt).toDateString() : null)
      .filter(date => date !== null)
      .sort();
    
    let streakBest = 0;
    let currentStreak = 0;
    let lastDate = null;
    
    for (const date of challengeDates) {
      if (lastDate) {
        const dateObj = new Date(date);
        const lastDateObj = new Date(lastDate);
        const diffTime = dateObj.getTime() - lastDateObj.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          streakBest = Math.max(streakBest, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      lastDate = date;
    }
    streakBest = Math.max(streakBest, currentStreak);
    
    // Calculate average completion rate
    const totalChallenges = challenges.length;
    const averageCompletion = totalChallenges > 0 ? (completedChallenges.length / challenges.length) * 100 : 0;
    
    // Find favorite challenge type
    const typeCounts: Record<string, number> = {};
    completedChallenges.forEach(c => {
      typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    });
    
    const favoriteChallengeType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'quiz';
    
    return {
      totalCompleted,
      streakBest,
      averageCompletion,
      favoriteChallengeType
    };
  }

  async getGameEvents(gameType?: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.EVENTS], 'readonly');
      const store = transaction.objectStore(STORES.EVENTS);
      const index = store.index('userId');
      const request = index.getAll(this.userId);

      request.onsuccess = () => {
        let events = request.result || [];
        if (gameType) {
          events = events.filter(event => event.gameType === gameType);
        }
        resolve(events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear User Game Data
  async clearUserGameData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const gameStores = [
      STORES.GAME_STATES,
      STORES.HIGH_SCORES,
      STORES.GAME_SESSIONS,
      STORES.MINI_GAMES
    ];
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(gameStores, 'readwrite');
      let completedStores = 0;

      gameStores.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const index = store.index?.('userId');
        
        if (index) {
          const request = index.openCursor(this.userId);
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              completedStores++;
              if (completedStores === gameStores.length) {
                this.recordEvent('user_game_data_cleared', { timestamp: new Date().toISOString() });
                resolve();
              }
            }
          };
          request.onerror = () => reject(request.error);
        } else {
          completedStores++;
          if (completedStores === gameStores.length) {
            resolve();
          }
        }
      });
    });
  }

  // Connection Management
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Helper Functions
export const initializeStorage = async (userId: string = 'default'): Promise<ConstitutionDB> => {
  const db = ConstitutionDB.getInstance();
  await db.initialize(userId);
  return db;
};

export const getStorageInstance = (): ConstitutionDB => {
  return ConstitutionDB.getInstance();
};