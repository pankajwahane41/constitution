// Mini Games Hub Component
// Collection of constitutional mini-games

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/gamification';
import { Gamepad2, Puzzle, Brain, Target, Star, Clock, Trophy, Play } from 'lucide-react';
import '../styles/professional-responsive.css';

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

const MiniGamesHub: React.FC<MiniGamesHubProps> = ({ userProfile, onBack, onStartGame }) => {
  console.log('MiniGamesHub component rendering', { userProfile: !!userProfile });
  
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 w-full max-w-full overflow-x-hidden">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full max-w-7xl mx-auto overflow-x-hidden">
        {/* Mobile-Optimized Header */}
        <header className="flex flex-col sm:flex-row items-center sm:justify-between mb-6 sm:mb-8 lg:mb-12">
          <button
            onClick={onBack}
            className="mobile-game-button self-start sm:self-center mb-4 sm:mb-0 bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 rounded-lg px-4 py-2 font-semibold flex items-center transition-all duration-200 min-h-[44px]"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="mr-2">←</span>
            <span>Back</span>
          </button>
          <div className="text-center flex-1 sm:flex-initial">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Constitutional Games</h1>
            <p className="text-sm sm:text-base text-gray-600">Interactive learning through engaging mini-games</p>
          </div>
          <div className="w-0 sm:w-24"></div>
        </header>

        {/* Elegant Hero Section */}
        <section className="bg-gradient-to-br from-white via-orange-50 to-green-50 rounded-2xl p-8 shadow-lg border border-orange-100 mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-4">
            Constitutional Mini Games
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-green-500 mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Master constitutional concepts through engaging, interactive games. 
            Earn Constitutional Coins, unlock achievements, and compete on the leaderboard!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
                {unlockedGames.length}
              </div>
              <div className="text-sm font-medium text-gray-600">Available Games</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-green-100">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-2">
                {unlockedGames.reduce((total, game) => total + game.reward, 0)}
              </div>
              <div className="text-sm font-medium text-gray-600">Total Coins</div>
            </div>
          </div>
        </section>

        {/* Elegant Available Games Grid */}
        <section className="mb-6 sm:mb-8 lg:mb-12 w-full max-w-full overflow-x-hidden">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-green-600 bg-clip-text text-transparent mb-4">
              Available Games
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-green-500 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-4 text-lg">Choose your constitutional adventure</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-full">
            {unlockedGames.map((game) => (
              <button
                key={game.id}
                className="elegant-game-card text-left transition-all duration-300 cursor-pointer group"
                onClick={() => onStartGame(game.id)}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="game-icon flex-shrink-0">
                    {game.icon}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`difficulty-badge difficulty-${game.difficulty.toLowerCase()}`}>
                      {game.difficulty}
                    </span>
                    {game.highScore && (
                      <span className="high-score-badge">
                        <Trophy className="w-3 h-3" />
                        {game.highScore}%
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="game-title">{game.title}</h3>
                  <p className="game-description">{game.description}</p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="game-meta">
                        <Clock className="w-4 h-4" />
                        <span>{game.estimatedTime}</span>
                      </div>
                      <div className="game-meta">
                        <span className="text-lg">🪙</span>
                        <span>{game.reward} coins</span>
                      </div>
                    </div>
                  </div>

                  <button className="play-button">
                    <Play className="w-5 h-5" />
                    <span>Play Now</span>
                  </button>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Elegant Locked Games */}
        {lockedGames.length > 0 && (
          <section className="mb-6 sm:mb-8 lg:mb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 bg-clip-text text-transparent mb-4">
                Unlock More Games
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-500 mx-auto rounded-full"></div>
              <p className="text-gray-600 mt-4 text-lg">Level up to access advanced challenges</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {lockedGames.map((game) => (
                <div
                  key={game.id}
                  className="elegant-locked-game-card"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="locked-icon flex-shrink-0">
                      {game.icon}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="locked-badge">
                        🔒 Locked
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="locked-title">{game.title}</h3>
                    <p className="locked-description">{game.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="game-meta" style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#9ca3af' }}>
                          <Clock className="w-4 h-4" />
                          <span>{game.estimatedTime}</span>
                        </div>
                        <span className={`difficulty-badge opacity-60`} 
                              style={{ 
                                color: '#6b7280', 
                                background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                                borderColor: 'rgba(107, 114, 128, 0.2)'
                              }}>
                          {game.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="unlock-requirement">
                      <div className="unlock-text">Level Required</div>
                      <div className="unlock-level">
                        Level {game.id === 'constitution_quiz_race' ? 3 : game.id === 'amendment_timeline' ? 2 : 5}
                      </div>
                      <div className="unlock-text mt-2">
                        Complete more activities to unlock
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mobile-Responsive Gaming Statistics */}
        <section className="mobile-game-card bg-white rounded-xl p-4 sm:p-6 shadow-md">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Your Gaming Statistics</h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">{unlockedGames.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Games Unlocked</div>
            </div>
            <div className="text-center">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                {unlockedGames.filter(g => g.highScore && g.highScore > 80).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">High Scores (80%+)</div>
            </div>
            <div className="text-center">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1 sm:mb-2">
                {unlockedGames.reduce((total, game) => total + game.reward, 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Available Coins</div>
            </div>
            <div className="text-center">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                {unlockedGames.reduce((total, game) => total + parseInt(game.estimatedTime), 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Minutes of Content</div>
            </div>
          </div>
        </section>

        {/* Mobile-Optimized Navigation Footer */}
        <footer className="mt-6 sm:mt-8 lg:mt-12 text-center">
          <button
            onClick={onBack}
            className="mobile-game-button w-full sm:w-auto bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 rounded-lg px-6 py-3 font-semibold flex items-center justify-center transition-all duration-200 min-h-[44px]"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="mr-2">←</span>
            <span>Back to Dashboard</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default MiniGamesHub;