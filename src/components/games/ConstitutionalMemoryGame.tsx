// Constitutional Memory Game Component
// Interactive memory game to match constitutional terms with definitions
// Designed for children aged 8-14 with engaging animations and rewards

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, MiniGameProgress } from '../../types/gamification';
import { getStorageInstance } from '../../lib/storage';
import { PointCalculator, GamePerformance } from '../../lib/pointCalculator';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Zap, 
  Star, 
  Coins,
  Target,
  Brain,
  CheckCircle,
  XCircle,
  Play,
  Pause
} from 'lucide-react';

interface ConstitutionalMemoryGameProps {
  userProfile: UserProfile;
  onBack: () => void;
  onGameComplete?: (score: number, coinsEarned: number, experienceGained: number) => void;
  onProgressUpdate?: (progressData: any) => void;
  initialProgress?: any;
  sessionId?: string;
}

interface Card {
  id: string;
  content: string;
  type: 'term' | 'definition';
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameStats {
  moves: number;
  matches: number;
  startTime: number;
  endTime?: number;
  score: number;
  coinsEarned: number;
  experienceGained: number;
}

interface DifficultySettings {
  pairs: number;
  gridCols: number;
  timeBonus: number;
  movePenalty: number;
  title: string;
}

const CONSTITUTIONAL_PAIRS = [
  {
    id: 'preamble',
    term: 'Preamble',
    definition: 'The introduction to the Constitution that states its main objectives'
  },
  {
    id: 'fundamental_rights',
    term: 'Fundamental Rights',
    definition: 'Basic rights guaranteed to every citizen like equality, freedom, and justice'
  },
  {
    id: 'fundamental_duties',
    term: 'Fundamental Duties',
    definition: 'Moral obligations of citizens to help promote harmony and the spirit of patriotism'
  },
  {
    id: 'directive_principles',
    term: 'Directive Principles',
    definition: 'Guidelines for the government to establish a just society'
  },
  {
    id: 'supreme_court',
    term: 'Supreme Court',
    definition: 'The highest court in India that ensures justice for all'
  },
  {
    id: 'parliament',
    term: 'Parliament',
    definition: 'The highest legislative body consisting of the President, Lok Sabha, and Rajya Sabha'
  },
  {
    id: 'president',
    term: 'President',
    definition: 'The head of state who represents India nationally and internationally'
  },
  {
    id: 'prime_minister',
    term: 'Prime Minister',
    definition: 'The head of government who leads the country\'s executive branch'
  },
  {
    id: 'bicameral',
    term: 'Bicameral',
    definition: 'Having two chambers or houses in the legislature'
  },
  {
    id: 'constitution',
    term: 'Constitution',
    definition: 'The supreme law of India that governs the country'
  },
  {
    id: 'citizenship',
    term: 'Citizenship',
    definition: 'Being a member of a country and enjoying its rights and protections'
  },
  {
    id: 'amendment',
    term: 'Amendment',
    definition: 'A change or addition to the Constitution'
  },
  {
    id: 'secular',
    term: 'Secular',
    definition: 'A state that treats all religions equally and respects all faiths'
  },
  {
    id: 'democracy',
    term: 'Democracy',
    definition: 'A system of government where people elect their representatives'
  },
  {
    id: 'federal',
    term: 'Federal',
    definition: 'A system where power is shared between the central and state governments'
  },
  {
    id: 'independence',
    term: 'Independence',
    definition: 'Freedom from colonial rule, achieved by India on August 15, 1947'
  },
  {
    id: 'unity',
    term: 'Unity',
    definition: 'Being united as one nation despite differences in language, religion, and culture'
  },
  {
    id: 'sovereignty',
    term: 'Sovereignty',
    definition: 'The supreme power of the nation to govern itself without external control'
  },
  {
    id: 'liberty',
    term: 'Liberty',
    definition: 'Freedom to speak, think, and act according to one\'s wishes within the law'
  },
  {
    id: 'equality',
    term: 'Equality',
    definition: 'All citizens having equal rights and opportunities without discrimination'
  },
  {
    id: 'justice',
    term: 'Justice',
    definition: 'Fairness in treatment and punishment according to law'
  },
  {
    id: 'fraternity',
    term: 'Fraternity',
    definition: 'Brotherhood and unity among all people of India'
  },
  {
    id: 'constituent_assembly',
    term: 'Constituent Assembly',
    definition: 'The group of elected representatives who wrote the Constitution'
  },
  {
    id: 'dr_ambedkar',
    term: 'Dr. B.R. Ambedkar',
    definition: 'The chief architect of the Indian Constitution'
  }
];

const DIFFICULTY_LEVELS: Record<string, DifficultySettings> = {
  easy: {
    pairs: 6,
    gridCols: 4,
    timeBonus: 20,
    movePenalty: 5,
    title: 'Constitutional Explorer'
  },
  medium: {
    pairs: 8,
    gridCols: 4,
    timeBonus: 30,
    movePenalty: 8,
    title: 'Rights Defender'
  },
  hard: {
    pairs: 12,
    gridCols: 6,
    timeBonus: 40,
    movePenalty: 10,
    title: 'Constitution Master'
  }
};

export default function ConstitutionalMemoryGame({ 
  userProfile, 
  onBack, 
  onGameComplete,
  onProgressUpdate,
  initialProgress,
  sessionId
}: ConstitutionalMemoryGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<GameStats>({
    moves: 0,
    matches: 0,
    startTime: 0,
    score: 0,
    coinsEarned: 0,
    experienceGained: 0
  });
  const [highScore, setHighScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // Load high score on component mount
  useEffect(() => {
    loadHighScore();
  }, []);

  // Load initial progress if provided
  useEffect(() => {
    if (initialProgress) {
      if (initialProgress.score !== undefined || initialProgress.moves !== undefined || initialProgress.matches !== undefined) {
        setStats(prev => ({
          ...prev,
          score: initialProgress.score ?? prev.score,
          moves: initialProgress.moves ?? prev.moves,
          matches: initialProgress.matches ?? prev.matches
        }));
      }
      if (initialProgress.gameCompleted !== undefined) setGameCompleted(initialProgress.gameCompleted);
      if (initialProgress.flippedCards) setFlippedCards(initialProgress.flippedCards);
      if (initialProgress.gameStarted !== undefined) setGameStarted(initialProgress.gameStarted);
    }
  }, [initialProgress]);

  const loadHighScore = async () => {
    try {
      const storage = getStorageInstance();
      const progress = await storage.getAchievements();
      const memoryGameAchievement = progress.find(a => a.id === 'memory_game_high_score');
      if (memoryGameAchievement) {
        setHighScore(memoryGameAchievement.progress || 0);
      }
    } catch (error) {
      console.error('Error loading high score:', error);
    }
  };

  const saveHighScore = async (score: number) => {
    try {
      if (score > highScore) {
        setHighScore(score);
        const storage = getStorageInstance();
        const achievement = {
          id: 'memory_game_high_score',
          title: 'Memory Master',
          description: 'Achieved a new high score in Constitutional Memory Game',
          category: 'knowledge' as const,
          type: 'mini_game' as const,
          icon: '🧠',
          requirements: [
            {
              type: 'score' as const,
              target: score,
              current: score,
              condition: 'high_score'
            }
          ],
          rewards: [
            { type: 'coins' as const, value: 10, description: 'Bonus coins for new high score!' }
          ],
          unlockedAt: new Date().toISOString(),
          progress: score,
          isVisible: true,
          rarity: 'rare' as const,
          userId: userProfile.userId
        };
        await storage.saveAchievement(achievement);
        setShowCelebration(true);
        setCelebrationMessage('New High Score! 🏆');
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeGame = useCallback(() => {
    const selectedPairs = CONSTITUTIONAL_PAIRS
      .sort(() => Math.random() - 0.5)
      .slice(0, DIFFICULTY_LEVELS[difficulty].pairs);

    const gameCards: Card[] = [];
    selectedPairs.forEach((pair) => {
      gameCards.push({
        id: `${pair.id}_term`,
        content: pair.term,
        type: 'term',
        pairId: pair.id,
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: `${pair.id}_definition`,
        content: pair.definition,
        type: 'definition',
        pairId: pair.id,
        isFlipped: false,
        isMatched: false
      });
    });

    setCards(shuffleArray(gameCards));
    setFlippedCards([]);
    setMatchedPairs([]);
    setStats({
      moves: 0,
      matches: 0,
      startTime: Date.now(),
      score: 0,
      coinsEarned: 0,
      experienceGained: 0
    });
    setGameCompleted(false);
    setShowCelebration(false);
  }, [difficulty]);

  const startGame = () => {
    setGameStarted(true);
    initializeGame();
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setFlippedCards([]);
    setCards([]);
    setStats({
      moves: 0,
      matches: 0,
      startTime: 0,
      score: 0,
      coinsEarned: 0,
      experienceGained: 0
    });
  };

  const flipCard = (cardId: string) => {
    if (flippedCards.length === 2 || gamePaused) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, card];
    setFlippedCards(newFlippedCards);

    // Check for match if two cards are flipped
    if (newFlippedCards.length === 2) {
      const updatedStats = { ...stats, moves: stats.moves + 1 };
      setStats(updatedStats);
      
      // Update progress
      onProgressUpdate?.(updatedStats);
      
      const [first, second] = newFlippedCards;
      if (first.pairId === second.pairId) {
        // Match found!
        setTimeout(() => {
          handleMatch(first.pairId);
        }, 600);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          handleNoMatch();
        }, 1000);
      }
    }
  };

  const handleMatch = (pairId: string) => {
    const newCards = cards.map(c => 
      c.pairId === pairId ? { ...c, isMatched: true } : c
    );
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs(prev => [...prev, pairId]);

    // Score calculation
    const currentTime = Date.now();
    const timeElapsed = (currentTime - stats.startTime) / 1000; // in seconds
    const moveEfficiency = Math.max(0, 100 - (stats.moves * 5));
    const timeBonus = Math.max(0, DIFFICULTY_LEVELS[difficulty].timeBonus - timeElapsed);
    const baseScore = 100;
    const matchScore = baseScore + timeBonus + moveEfficiency;

    setStats(prev => {
      const updatedStats = {
        ...prev,
        matches: prev.matches + 1,
        score: prev.score + Math.round(matchScore)
      };
      
      // Update progress
      onProgressUpdate?.(updatedStats);
      
      return updatedStats;
    });

    // Show immediate positive feedback
    setShowCelebration(true);
    setCelebrationMessage('Perfect Match! ✨');
    setTimeout(() => setShowCelebration(false), 1000);

    // Check if game is complete
    const expectedMatches = DIFFICULTY_LEVELS[difficulty].pairs;
    if (stats.matches + 1 >= expectedMatches) {
      setTimeout(() => {
        completeGame();
      }, 800);
    }
  };

  const handleNoMatch = () => {
    const newCards = cards.map(c => 
      !c.isMatched ? { ...c, isFlipped: false } : c
    );
    setCards(newCards);
    setFlippedCards([]);

    // Show feedback for wrong match
    setShowCelebration(true);
    setCelebrationMessage('Try Again! 💪');
    setTimeout(() => setShowCelebration(false), 1000);
  };

  const completeGame = () => {
    const endTime = Date.now();
    const totalTime = (endTime - stats.startTime) / 1000;
    const moveEfficiency = Math.max(0, 100 - (stats.moves * 5));
    const timeScore = Math.max(0, 200 - totalTime);
    const finalScore = stats.score + Math.round(timeScore + moveEfficiency);

    // Calculate points using standardized PointCalculator
    const performance: GamePerformance = {
      score: finalScore,
      accuracy: Math.min(100, (stats.matches * 100) / DIFFICULTY_LEVELS[difficulty].pairs),
      timeSpent: totalTime,
      perfectGame: finalScore >= 95,
      hintsUsed: 0, // Could be tracked if hints are implemented
      difficulty: difficulty,
      gameType: 'constitutional_memory'
    };
    
    const pointResult = PointCalculator.calculateGamePoints(
      performance,
      userProfile,
      userProfile.currentStreak
    );

    const coinsEarned = pointResult.coinsEarned;
    const experienceGained = pointResult.experienceGained;

    const finalStats = {
      ...stats,
      endTime,
      score: finalScore,
      coinsEarned,
      experienceGained
    };
    setStats(finalStats);
    setGameCompleted(true);

    // Update progress with final state
    onProgressUpdate?.(finalStats);

    // Save high score if achieved
    saveHighScore(finalScore);

    // Update user profile with rewards
    if (onGameComplete) {
      onGameComplete(finalScore, coinsEarned, experienceGained);
    }

    // Show completion celebration
    setShowCelebration(true);
    setCelebrationMessage('Congratulations! 🎉');
    setTimeout(() => setShowCelebration(false), 4000);
  };

  const getTimeElapsed = () => {
    if (!gameStarted || stats.startTime === 0) return 0;
    const endTime = gameCompleted ? (stats.endTime || Date.now()) : Date.now();
    return Math.floor((endTime - stats.startTime) / 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyStars = () => {
    const settings = DIFFICULTY_LEVELS[difficulty];
    const expectedPairs = settings.pairs;
    const currentPairs = matchedPairs.length;
    const completionPercentage = (currentPairs / expectedPairs) * 100;
    
    if (completionPercentage >= 90) return 3;
    if (completionPercentage >= 70) return 2;
    if (completionPercentage >= 40) return 1;
    return 0;
  };

  // Game Start Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Constitutional Memory Game</h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Trophy className="w-4 h-4" />
                <span>High Score: {highScore}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Game Introduction */}
          <div className="text-center mb-12">
            <Brain className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Test Your Constitutional Knowledge!</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Match constitutional terms with their definitions in this exciting memory challenge. 
              Complete each level to earn coins and experience points!
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Challenge</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(DIFFICULTY_LEVELS).map(([key, settings]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key as 'easy' | 'medium' | 'hard')}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    difficulty === key
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <Target className={`w-12 h-12 mx-auto mb-4 ${
                      difficulty === key ? 'text-blue-500' : 'text-gray-400'
                    }`} />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{settings.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {settings.pairs} pairs • {settings.gridCols} columns
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-yellow-600">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {key === 'easy' && 'Beginner Friendly'}
                        {key === 'medium' && 'Balanced Challenge'}
                        {key === 'hard' && 'Expert Level'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Memory Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{highScore}</div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Coins className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">25-75</div>
                <div className="text-sm text-gray-600">Coins Reward</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">20-60</div>
                <div className="text-sm text-gray-600">XP Gained</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">3-7</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
            </div>
          </div>

          {/* Start Game Button */}
          <div className="text-center">
            <button
              onClick={startGame}
              className="mobile-game-button inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 active:scale-95 transition-all shadow-lg min-h-[56px]"
              style={{ touchAction: 'manipulation' }}
            >
              <Play className="w-6 h-6" />
              <span>Start Game</span>
            </button>
          </div>

          {/* Game Instructions */}
          <div className="mt-12 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-500" />
              How to Play
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">1</div>
                <p>Flip two cards to reveal their content</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">2</div>
                <p>Match terms with their definitions</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">3</div>
                <p>Complete all pairs to win the level</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs">4</div>
                <p>Earn coins and XP based on performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Celebration Modal */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-center animate-pulse">
              <div className="text-6xl mb-4 animate-bounce">
                {celebrationMessage.includes('Perfect') && '✨'}
                {celebrationMessage.includes('Again') && '💪'}
                {celebrationMessage.includes('Congratulations') && '🎉'}
                {celebrationMessage.includes('High Score') && '🏆'}
              </div>
              <div className="text-2xl font-bold text-white bg-black bg-opacity-50 px-6 py-3 rounded-full">
                {celebrationMessage}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Game Completed Screen
  if (gameCompleted) {
    const expectedPairs = DIFFICULTY_LEVELS[difficulty].pairs;
    const accuracyPercentage = Math.round((stats.matches / expectedPairs) * 100);
    const timeElapsed = getTimeElapsed();
    const efficiencyScore = Math.round(100 - (stats.moves * 5));
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4">
          {/* Celebration Animation */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-xl text-gray-600">You've completed the Constitutional Memory Game!</p>
          </div>

          {/* Results Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Results</h3>
              <div className="flex items-center justify-center space-x-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${
                      i < getDifficultyStars() 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{stats.score}</div>
                <div className="text-sm text-gray-600">Final Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{accuracyPercentage}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{stats.moves}</div>
                <div className="text-sm text-gray-600">Total Moves</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-3xl font-bold text-gray-900">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>

            {/* Rewards */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-600" />
                Rewards Earned
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Constitutional Coins:</span>
                  <div className="flex items-center space-x-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-yellow-600">{stats.coinsEarned}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Experience Points:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-purple-600">{stats.experienceGained}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Feedback */}
            <div className="text-center mb-6">
              {accuracyPercentage >= 90 && (
                <p className="text-green-600 font-semibold">
                  🌟 Outstanding! You're a true Constitutional expert!
                </p>
              )}
              {accuracyPercentage >= 70 && accuracyPercentage < 90 && (
                <p className="text-blue-600 font-semibold">
                  ⭐ Great job! You have solid constitutional knowledge!
                </p>
              )}
              {accuracyPercentage >= 50 && accuracyPercentage < 70 && (
                <p className="text-yellow-600 font-semibold">
                  💪 Good effort! Keep practicing to improve!
                </p>
              )}
              {accuracyPercentage < 50 && (
                <p className="text-orange-600 font-semibold">
                  📚 Keep learning! Practice makes perfect!
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startGame}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Play Again</span>
            </button>
            <button
              onClick={resetGame}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Active Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <style>
        {`
          .preserve-style { transform-style: preserve-3d; }
          .backface-style { backface-visibility: hidden; }
          .rotate-front-style { transform: rotateY(180deg); }
        `}
      </style>
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
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Constitutional Memory Game</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-gray-700">{formatTime(getTimeElapsed())}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="font-semibold text-gray-700">{stats.moves}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Target className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-gray-700">{stats.matches}/{DIFFICULTY_LEVELS[difficulty].pairs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Board */}
        <div className="mb-8">
          <div 
            className={`grid gap-3 sm:gap-4 mx-auto`}
            style={{ 
              gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
              maxWidth: '800px'
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`mobile-game-card aspect-square cursor-pointer transform transition-all duration-300 min-h-[120px] min-w-[120px] ${
                  card.isMatched ? 'scale-95 opacity-75' : 'hover:scale-105 active:scale-95'
                } ${!card.isFlipped && !card.isMatched ? 'hover:shadow-lg' : ''}`}
                style={{ touchAction: 'manipulation' }}
              >
                <div className={`relative w-full h-full transition-transform duration-500 ${
                  card.isFlipped || card.isMatched ? 'transform rotate-y-180 preserve-style' : ''
                }`} style={{transformStyle: 'preserve-3d'}}>
                  {/* Card Back */}
                  <div className={`absolute inset-0 w-full h-full rounded-xl backface-style ${
                    card.isMatched 
                      ? 'bg-gradient-to-br from-green-200 to-green-300 border-2 border-green-400' 
                      : 'bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-blue-300 hover:from-blue-500 hover:to-purple-600 active:from-blue-600 active:to-purple-700'
                  } shadow-lg flex items-center justify-center`}>
                    <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  {/* Card Front */}
                  <div className={`absolute inset-0 w-full h-full rounded-xl shadow-lg flex items-center justify-center p-2 sm:p-4 rotate-front-style ${
                    card.type === 'term' 
                      ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300' 
                      : 'bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300'
                  }`}>
                    <div className="text-center">
                      {card.type === 'term' ? (
                        <>
                          <h3 className="font-bold text-blue-900 text-xs sm:text-lg mb-1 sm:mb-2">TERM</h3>
                          <p className="text-blue-800 font-semibold text-xs sm:text-sm leading-tight">{card.content}</p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-purple-900 text-xs sm:text-lg mb-1 sm:mb-2">MEANING</h3>
                          <p className="text-purple-800 text-[10px] sm:text-sm leading-tight">{card.content}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Progress</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-gray-700">{stats.score}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${(stats.matches / DIFFICULTY_LEVELS[difficulty].pairs) * 100}%` 
              }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Matched {stats.matches} of {DIFFICULTY_LEVELS[difficulty].pairs} pairs</span>
            <span>{Math.round((stats.matches / DIFFICULTY_LEVELS[difficulty].pairs) * 100)}% Complete</span>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 pointer-events-none">
          <div className="text-center animate-pulse">
            <div className="text-6xl mb-4 animate-bounce">
              {celebrationMessage.includes('Perfect') && '✨'}
              {celebrationMessage.includes('Again') && '💪'}
              {celebrationMessage.includes('Congratulations') && '🎉'}
              {celebrationMessage.includes('High Score') && '🏆'}
            </div>
            <div className="text-2xl font-bold text-white bg-black bg-opacity-50 px-6 py-3 rounded-full">
              {celebrationMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
