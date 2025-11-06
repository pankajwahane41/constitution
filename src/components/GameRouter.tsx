import React from 'react';
import { UserProfile } from '../types/gamification';
import { 
  RightsPuzzleGame, 
  ConstitutionalMemoryGame, 
  FamousCasesGame, 
  PreambleBuilderGame,
  QuizRaceGameWrapper,
  AmendmentTimelineGame 
} from './games';
import AmendmentTimelineGameWrapper from './games/AmendmentTimelineGameWrapper';

interface GameRouterProps {
  gameType: string;
  userProfile: UserProfile;
  onGameComplete: (gameType: string, completionData: {
    score: number;
    coinsEarned: number;
    experienceGained: number;
    achievementsUnlocked?: string[];
    gameData?: any;
  }) => void;
  onBack: () => void;
}

// Helper function to transform different score data formats
const transformScoreData = (scoreData: any, gameType: string) => {
  // Handle numeric scores (just a number)
  if (typeof scoreData === 'number') {
    return {
      score: scoreData,
      coinsEarned: Math.floor(scoreData * 0.5), // 50% of score as coins
      experienceGained: Math.floor(scoreData * 0.3), // 30% of score as XP
      achievementsUnlocked: [],
      gameData: { gameType, originalScore: scoreData }
    };
  }
  
  // Handle ScoreData objects with different property names
  if (typeof scoreData === 'object' && scoreData !== null) {
    return {
      score: scoreData.score || scoreData.finalScore || 0,
      coinsEarned: scoreData.coinsEarned || Math.floor((scoreData.score || 0) * 0.5),
      experienceGained: scoreData.experienceGained || Math.floor((scoreData.score || 0) * 0.3),
      achievementsUnlocked: scoreData.achievementsUnlocked || [],
      gameData: { gameType, ...scoreData }
    };
  }
  
  // Default fallback
  return {
    score: 0,
    coinsEarned: 0,
    experienceGained: 0,
    achievementsUnlocked: [],
    gameData: { gameType, originalData: scoreData }
  };
};

export default function GameRouter({
  gameType,
  userProfile,
  onGameComplete,
  onBack
}: GameRouterProps) {

  // Render the appropriate game based on gameType
  switch (gameType) {
    case 'rights_puzzle':
      return (
        <RightsPuzzleGame
          userProfile={userProfile}
          onGameComplete={(scoreData) => onGameComplete(gameType, transformScoreData(scoreData, gameType))}
          onBack={onBack}
        />
      );

    case 'constitutional_memory':
      return (
        <ConstitutionalMemoryGame
          userProfile={userProfile}
          onGameComplete={(scoreData) => onGameComplete(gameType, transformScoreData(scoreData, gameType))}
          onBack={onBack}
        />
      );

    case 'supreme_court_cases':
      return (
        <FamousCasesGame
          userProfile={userProfile}
          onGameComplete={(scoreData) => onGameComplete(gameType, transformScoreData(scoreData, gameType))}
          onBack={onBack}
        />
      );

    case 'preamble_builder':
      return (
        <PreambleBuilderGame
          userProfile={userProfile}
          onGameComplete={(scoreData) => onGameComplete(gameType, transformScoreData(scoreData, gameType))}
          onBack={onBack}
        />
      );

    case 'constitution_quiz_race':
      return (
        <QuizRaceGameWrapper
          userProfile={userProfile}
          onGameComplete={(scoreData) => onGameComplete(gameType, transformScoreData(scoreData, gameType))}
          onBack={onBack}
        />
      );

    case 'amendment_timeline':
      return (
        <AmendmentTimelineGameWrapper
          userProfile={userProfile}
          onGameComplete={(scoreData) => onGameComplete(gameType, transformScoreData(scoreData, gameType))}
          onBack={onBack}
        />
      );

    // Default case for unimplemented games
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
          <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Coming Soon!</h2>
            <p className="text-gray-600 mb-6">
              This exciting game "{gameType}" is under development. Check back soon for new adventures!
            </p>
            <div className="space-y-3">
              <button
                onClick={onBack}
                className="w-full bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                Back to Games
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full border border-gray-300 text-gray-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
  }
}