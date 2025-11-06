// Quick test to verify QuizRaceGame functionality
import React from 'react';
import { QuizRaceGameWrapper } from '../components/games/QuizRaceGame';
import { UserProfile } from '../types/gamification';

// Mock user profile for testing
const mockUserProfile: UserProfile = {
  userId: 'test-user',
  displayName: 'Test Player',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  totalPlayTime: 0,
  profileLevel: 5,
  experiencePoints: 1000,
  constitutionalCoins: 250,
  currentStreak: 3,
  longestStreak: 7,
  lastActivityDate: new Date().toDateString(),
  dailyCoinsEarned: 0,
  dailyCoinLimit: 500,
  lastDailyReset: new Date().toDateString(),
  avatarConfig: {
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'black',
    clothing: 'casual',
    accessories: [],
    culturalElements: {},
    background: 'default',
    pose: 'neutral',
    unlockedItems: []
  },
  preferences: {
    theme: 'light',
    language: 'en',
    soundEnabled: true,
    animationsEnabled: true,
    difficulty: 'medium',
    notificationsEnabled: true,
    parentalControls: {
      enabled: false,
      timeLimit: 60,
      allowedFeatures: [],
      restrictedContent: []
    }
  },
  achievements: [],
  badges: [],
  dailyChallengeProgress: {
    currentDate: new Date().toISOString(),
    challenges: [],
    completedToday: 0,
    streakCount: 0,
    totalCompleted: 0
  },
  storyProgress: {
    currentChapter: 1,
    totalChapters: 10,
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
    globalRank: 15,
    weeklyRank: 8,
    monthlyRank: 5,
    totalPoints: 1500,
    weeklyPoints: 200,
    monthlyPoints: 500,
    quizAccuracy: 85,
    averageQuizTime: 45,
    favoriteTopics: ['preamble', 'rights'],
    studyStreak: 3
  },
  completedModules: [],
  version: 1
};

// Test component
export const QuizRaceGameTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Quiz Race Game Test</h1>
      <QuizRaceGameWrapper
        userProfile={mockUserProfile}
        onGameComplete={(results) => {
          console.log('🎮 Game Complete!', results);
          alert(`Race finished!\nTime: ${Math.floor(results.totalTime / 1000)}s\nCoins: ${results.coinsEarned}\nAccuracy: ${Math.round((results.correctAnswers / results.totalQuestions) * 100)}%`);
        }}
        onBack={() => {
          console.log('🏠 Back to menu');
          alert('Returning to menu...');
        }}
        dataFileName="constitution_questions_preamble.json"
      />
    </div>
  );
};

export default QuizRaceGameTest;