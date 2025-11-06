// Mini Games Hub Component
// Collection of constitutional mini-games

import React from 'react';
import { UserProfile } from '../types/gamification';
import { Gamepad2, Puzzle, Brain, Target, Star, Clock, Trophy, Play } from 'lucide-react';

interface MiniGamesHubProps {
  userProfile: UserProfile;
  onBack: () => void;
  onStartGame: (gameType: string) => void;
}

interface MiniGame {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  reward: number;
  isUnlocked: boolean;
  highScore?: number;
}

export default function MiniGamesHub({ userProfile, onBack, onStartGame }: MiniGamesHubProps) {
  const miniGames: MiniGame[] = [
    {
      id: 'constitutional_memory',
      title: 'Constitutional Memory',
      description: 'Match constitutional terms with their meanings',
      icon: <Brain className="w-8 h-8" />,
      difficulty: 'Easy',
      estimatedTime: '5 min',
      reward: 25,
      isUnlocked: true,
      highScore: 85
    },
    {
      id: 'rights_puzzle',
      title: 'Rights Puzzle',
      description: 'Arrange fundamental rights in correct categories',
      icon: <Puzzle className="w-8 h-8" />,
      difficulty: 'Medium',
      estimatedTime: '8 min',
      reward: 40,
      isUnlocked: true,
      highScore: 92
    },
    {
      id: 'constitution_quiz_race',
      title: 'Constitution Quiz Race',
      description: 'Speed quiz on constitutional knowledge',
      icon: <Target className="w-8 h-8" />,
      difficulty: 'Hard',
      estimatedTime: '10 min',
      reward: 60,
      isUnlocked: userProfile.profileLevel >= 3,
      highScore: userProfile.profileLevel >= 3 ? 78 : undefined
    },
    {
      id: 'amendment_timeline',
      title: 'Amendment Timeline',
      description: 'Place constitutional amendments in chronological order',
      icon: <Clock className="w-8 h-8" />,
      difficulty: 'Medium',
      estimatedTime: '7 min',
      reward: 35,
      isUnlocked: userProfile.profileLevel >= 2,
      highScore: userProfile.profileLevel >= 2 ? 65 : undefined
    },
    {
      id: 'preamble_builder',
      title: 'Preamble Builder',
      description: 'Reconstruct the Preamble by arranging words correctly',
      icon: <Star className="w-8 h-8" />,
      difficulty: 'Easy',
      estimatedTime: '4 min',
      reward: 20,
      isUnlocked: true,
      highScore: 100
    },
    {
      id: 'supreme_court_cases',
      title: 'Famous Cases Match',
      description: 'Match landmark Supreme Court cases with their outcomes',
      icon: <Trophy className="w-8 h-8" />,
      difficulty: 'Hard',
      estimatedTime: '12 min',
      reward: 75,
      isUnlocked: userProfile.profileLevel >= 5,
      highScore: userProfile.profileLevel >= 5 ? 88 : undefined
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const unlockedGames = miniGames.filter(game => game.isUnlocked);
  const lockedGames = miniGames.filter(game => !game.isUnlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px]"
                style={{ touchAction: 'manipulation' }}
              >
                ← Back
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-navy">Mini Games Hub</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="text-center mb-12">
          <Gamepad2 className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-navy mb-4">Constitutional Mini Games</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn about the Constitution through fun, interactive games. 
            Earn Constitutional Coins and unlock new challenges as you progress!
          </p>
        </div>

        {/* Available Games */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-navy mb-6">Available Games</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {unlockedGames.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200 hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer group active:scale-95"
                onClick={() => onStartGame(game.id)}
                style={{ touchAction: 'manipulation', minHeight: '280px' }}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-600 group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  <h4 className="text-lg font-bold text-navy">{game.title}</h4>
                </div>

                <p className="text-sm text-gray-600 mb-4 text-center">{game.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                    <span className="text-gray-500">{game.estimatedTime}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <span>🪙</span>
                      <span>{game.reward} coins</span>
                    </div>
                    {game.highScore && (
                      <div className="flex items-center space-x-1 text-purple-600">
                        <Trophy className="w-3 h-3" />
                        <span>{game.highScore}%</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => onStartGame(game.id)}
                    className="w-full mt-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity flex items-center justify-center space-x-2 min-h-[48px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Play className="w-4 h-4" />
                    <span>Play Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locked Games */}
        {lockedGames.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-navy mb-6">Unlock More Games</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {lockedGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-gray-200 opacity-60"
                  style={{ minHeight: '280px' }}
                >
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      {game.icon}
                    </div>
                    <h4 className="text-lg font-bold text-gray-600">{game.title}</h4>
                  </div>

                  <p className="text-sm text-gray-500 mb-4 text-center">{game.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(game.difficulty)}`}>
                        {game.difficulty}
                      </span>
                      <span className="text-gray-400">{game.estimatedTime}</span>
                    </div>

                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">🔒 Locked</div>
                      <div className="text-xs text-gray-500">
                        Reach Level {game.id === 'constitution_quiz_race' ? 3 : game.id === 'amendment_timeline' ? 2 : 5} to unlock
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gaming Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-navy mb-4">Your Gaming Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <Gamepad2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">{unlockedGames.length}</div>
              <div className="text-sm text-gray-600">Games Unlocked</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <Trophy className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">
                {unlockedGames.filter(g => g.highScore && g.highScore > 80).length}
              </div>
              <div className="text-sm text-gray-600">High Scores</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">
                {unlockedGames.reduce((total, game) => total + game.reward, 0)}
              </div>
              <div className="text-sm text-gray-600">Available Coins</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy">
                {unlockedGames.reduce((total, game) => total + parseInt(game.estimatedTime), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Play Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}