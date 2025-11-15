import React, { useState, useEffect, useRef } from 'react';
import { Play, Clock, Star, Trophy, HelpCircle, CheckCircle, X, RotateCcw, Lightbulb } from 'lucide-react';
import { PointCalculator, GamePerformance } from '../../lib/pointCalculator';
import { UserProfile } from '../../types/gamification';

interface Amendment {
  id: number;
  year: number;
  title: string;
  description: string;
  funFact: string;
  hint: string;
  category: 'rights' | 'democracy' | 'culture' | 'justice' | 'education';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GameState {
  currentStep: 'intro' | 'playing' | 'complete';
  placedAmendments: { amendment: Amendment; position: number }[];
  availableAmendments: Amendment[];
  score: number;
  hintsUsed: number;
  timeSpent: number;
  moves: number;
  correctPlacements: number;
  isComplete: boolean;
  showHint: boolean;
  selectedAmendment: Amendment | null;
  coinsEarned: number;
  experienceGained: number;
}

interface GameStats {
  gamesPlayed: number;
  bestScore: number;
  averageAccuracy: number;
  totalHintsUsed: number;
  averageTime: number;
  achievements: string[];
}

const AMENDMENTS: Amendment[] = [
  {
    id: 1,
    year: 1951,
    title: "Freedom of Speech & Expression",
    description: "The first amendment protected every Indian's right to speak freely, write, and express their thoughts. This means children can share their ideas in school and adults can discuss important topics in their communities.",
    funFact: "Before this amendment, people sometimes couldn't speak freely about government decisions.",
    hint: "This amendment deals with the most basic democratic right - speaking your mind.",
    category: 'rights',
    difficulty: 'easy'
  },
  {
    id: 42,
    year: 1976,
    title: "Fundamental Duties of Citizens",
    description: "This amendment added duties for every citizen, like respecting the national flag, valuing education, and protecting India's cultural heritage. It teaches that rights come with responsibilities.",
    funFact: "It's like having homework for being a good citizen!",
    hint: "This amendment is about responsibilities citizens have, not just rights.",
    category: 'rights',
    difficulty: 'medium'
  },
  {
    id: 44,
    year: 1978,
    title: "Right to Property Protection",
    description: "This amendment made sure that the government can't take away someone's property without proper legal process and fair compensation. It protects people's homes and belongings.",
    funFact: "This means your family's home can't be taken away without a very good reason and fair payment.",
    hint: "Think about protecting something valuable that belongs to you or your family.",
    category: 'rights',
    difficulty: 'medium'
  },
  {
    id: 61,
    year: 1988,
    title: "Lowering Voting Age",
    description: "This amendment lowered the voting age from 21 to 18, giving young people a bigger voice in choosing their leaders. Now 18-year-olds can help decide who runs the country.",
    funFact: "Before this change, 18-year-olds couldn't vote even though they could join the army!",
    hint: "This amendment helped younger people participate in democracy.",
    category: 'democracy',
    difficulty: 'easy'
  },
  {
    id: 73,
    year: 1992,
    title: "Village Panchayats Power",
    description: "This amendment gave more power to village councils (panchayats) to make decisions about local problems like clean water, schools, and roads. It brought democracy closer to people's homes.",
    funFact: "Village councils can now decide on things like where to build new schools or parks!",
    hint: "This amendment is about local community decision-making in villages.",
    category: 'democracy',
    difficulty: 'medium'
  },
  {
    id: 74,
    year: 1992,
    title: "Urban Local Bodies",
    description: "This amendment strengthened municipal councils in cities and towns, giving them more power to manage local services like waste collection, traffic, and public parks.",
    funFact: "City mayors and council members got more authority to make your neighborhood better!",
    hint: "Think about local government in cities and towns, not just villages.",
    category: 'democracy',
    difficulty: 'medium'
  },
  {
    id: 86,
    year: 2002,
    title: "Right to Education",
    description: "This amendment made education a fundamental right for all children aged 6-14. It means every child in India has the right to go to school and get a quality education.",
    funFact: "Before this, education wasn't guaranteed by the Constitution - now it is!",
    hint: "This amendment ensures every child has access to schooling.",
    category: 'education',
    difficulty: 'easy'
  },
  {
    id: 101,
    year: 2016,
    title: "Goods and Services Tax (GST)",
    description: "This amendment created GST, a single tax system that replaced many different taxes across India. It made buying and selling goods simpler and more uniform across the country.",
    funFact: "GST simplified over a dozen different taxes into one system - like organizing your messy room!",
    hint: "This amendment created a unified tax system across India.",
    category: 'justice',
    difficulty: 'hard'
  }
];

const CATEGORY_COLORS = {
  rights: 'bg-blue-500',
  democracy: 'bg-green-500',
  culture: 'bg-purple-500',
  justice: 'bg-orange-500',
  education: 'bg-indigo-500'
};

const DIFFICULTY_COLORS = {
  easy: 'text-green-600',
  medium: 'text-yellow-600',
  hard: 'text-red-600'
};

const AmendmentTimelineGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentStep: 'intro',
    placedAmendments: [],
    availableAmendments: [...AMENDMENTS].sort(() => Math.random() - 0.5),
    score: 1000,
    hintsUsed: 0,
    timeSpent: 0,
    moves: 0,
    correctPlacements: 0,
    isComplete: false,
    showHint: false,
    selectedAmendment: null,
    coinsEarned: 0,
    experienceGained: 0
  });

  const [gameStats, setGameStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('amendment-timeline-stats');
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      bestScore: 0,
      averageAccuracy: 0,
      totalHintsUsed: 0,
      averageTime: 0,
      achievements: []
    };
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dropZoneRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (gameState.currentStep === 'playing') {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeSpent: prev.timeSpent + 1
        }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.currentStep]);

  useEffect(() => {
    localStorage.setItem('amendment-timeline-stats', JSON.stringify(gameStats));
  }, [gameStats]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      currentStep: 'playing',
      availableAmendments: [...AMENDMENTS].sort(() => Math.random() - 0.5),
      placedAmendments: [],
      score: 1000,
      hintsUsed: 0,
      timeSpent: 0,
      moves: 0,
      correctPlacements: 0,
      isComplete: false,
      showHint: false,
      selectedAmendment: null,
      coinsEarned: 0,
      experienceGained: 0
    }));
  };

  const showHint = (amendment: Amendment) => {
    setGameState(prev => {
      const hintPenalty = 50;
      return {
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
        score: Math.max(0, prev.score - hintPenalty),
        selectedAmendment: amendment,
        showHint: true
      };
    });
  };

  const handleAmendmentClick = (amendment: Amendment) => {
    setGameState(prev => ({
      ...prev,
      selectedAmendment: prev.selectedAmendment?.id === amendment.id ? null : amendment,
      showHint: false
    }));
  };

  const handleYearClick = (year: number) => {
    if (!gameState.selectedAmendment) return;

    const correctYear = gameState.selectedAmendment.year;
    const isCorrect = correctYear === year;

    setGameState(prev => {
      const newPlacedAmendments = [
        ...prev.placedAmendments,
        { amendment: prev.selectedAmendment!, position: year }
      ];

      const newAvailableAmendments = prev.availableAmendments.filter(
        a => a.id !== prev.selectedAmendment!.id
      );

      const placementBonus = isCorrect ? 100 : 0;
      const newScore = prev.score + placementBonus - (isCorrect ? 0 : 25);
      const newCorrectPlacements = prev.correctPlacements + (isCorrect ? 1 : 0);

      return {
        ...prev,
        placedAmendments: newPlacedAmendments,
        availableAmendments: newAvailableAmendments,
        moves: prev.moves + 1,
        score: Math.max(0, newScore),
        correctPlacements: newCorrectPlacements,
        selectedAmendment: null,
        showHint: false
      };
    });

    // Check if game is complete
    setTimeout(() => {
      if (gameState.availableAmendments.length === 1) {
        completeGame();
      }
    }, 100);
  };

  const completeGame = () => {
    // Calculate final score with bonuses and penalties
    const accuracy = (gameState.correctPlacements / AMENDMENTS.length) * 100;
    const timeBonus = Math.max(0, 300 - gameState.timeSpent) * 1.5; // Bonus for faster completion (max 300s)
    const hintPenalty = gameState.hintsUsed * 50; // Penalty for hint usage
    const perfectScoreBonus = accuracy === 100 ? 150 : 0; // Bonus for perfect placement
    
    const finalScore = Math.max(0, Math.round(
      gameState.score + timeBonus + perfectScoreBonus - hintPenalty
    ));
    
    // Calculate rewards using standardized PointCalculator
    const performance: GamePerformance = {
      score: finalScore,
      accuracy: accuracy,
      timeSpent: gameState.timeSpent,
      perfectGame: accuracy === 100,
      hintsUsed: gameState.hintsUsed,
      difficulty: 'medium',
      gameType: 'amendment_timeline'
    };
    
    const pointResult = PointCalculator.calculateGamePoints(
      performance,
      undefined, // Will be provided by parent component
      0 // Current streak (could be passed as prop)
    );

    const coinsEarned = pointResult.coinsEarned;
    const experienceGained = pointResult.experienceGained;

    setGameState(prev => ({
      ...prev,
      currentStep: 'complete',
      isComplete: true,
      score: finalScore,
      coinsEarned,
      experienceGained
    }));

    // Update statistics
    setGameStats(prev => {
      const newGamesPlayed = prev.gamesPlayed + 1;
      const newAverageAccuracy = ((prev.averageAccuracy * prev.gamesPlayed) + accuracy) / newGamesPlayed;
      const newTotalHintsUsed = prev.totalHintsUsed + gameState.hintsUsed;
      const newAverageTime = ((prev.averageTime * prev.gamesPlayed) + gameState.timeSpent) / newGamesPlayed;
      
      const newAchievements = [...prev.achievements];
      
      // Check for new achievements
      if (accuracy === 100 && !prev.achievements.includes('perfect_placement')) {
        newAchievements.push('perfect_placement');
      }
      if (gameState.hintsUsed === 0 && !prev.achievements.includes('no_hints_needed')) {
        newAchievements.push('no_hints_needed');
      }
      if (gameState.timeSpent < 300 && !prev.achievements.includes('speed_learner')) {
        newAchievements.push('speed_learner');
      }

      return {
        gamesPlayed: newGamesPlayed,
        bestScore: Math.max(prev.bestScore, finalScore),
        averageAccuracy: newAverageAccuracy,
        totalHintsUsed: newTotalHintsUsed,
        averageTime: newAverageTime,
        achievements: newAchievements
      };
    });

    // Show celebration
    setTimeout(() => {
      setShowCelebration(true);
      setTimeout(() => setAnimationComplete(true), 1000);
    }, 500);
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      currentStep: 'intro'
    }));
    setShowCelebration(false);
    setAnimationComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderIntro = () => (
    <div className="w-full p-2">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📜 Amendment Timeline Game</h1>
          <p className="text-lg text-gray-600 mb-6">
            Learn about important changes to the Indian Constitution by placing amendments in the correct chronological order!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-lg mb-2">Tap & Place</h3>
            <p className="text-gray-600">Tap amendments to select, then tap the correct year to place them</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="font-bold text-lg mb-2">Use Hints</h3>
            <p className="text-gray-600">Get helpful clues to learn more about each amendment</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold text-lg mb-2">Score Points</h3>
            <p className="text-gray-600">Earn points for correct placement and minimal hint usage</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-8 shadow-lg">
          <h3 className="font-bold text-lg mb-4">Game Rules:</h3>
          <div className="text-left space-y-2 mb-4">
            <p>• Tap an amendment card to select it</p>
            <p>• Tap the correct year on the timeline to place it</p>
            <p>• Use hints if you're stuck (but they'll reduce your score)</p>
            <p>• Try to complete the timeline with the highest score possible</p>
            <p>• Learn fascinating facts about each constitutional amendment</p>
          </div>
          
          <h3 className="font-bold text-lg mb-4">Scoring System:</h3>
          <div className="text-left space-y-2 text-sm">
            <p>• <strong>Correct Placement:</strong> +100 points</p>
            <p>• <strong>Incorrect Placement:</strong> -25 points</p>
            <p>• <strong>Using Hints:</strong> -50 points each</p>
            <p>• <strong>Time Bonus:</strong> Faster completion = up to 450 bonus points</p>
            <p>• <strong>Perfect Score Bonus:</strong> +150 points for 100% accuracy</p>
            <p>• <strong>Coins Earned:</strong> Final score ÷ 10</p>
            <p>• <strong>Experience Gained:</strong> Final score ÷ 8</p>
          </div>
        </div>

        <button
          onClick={startGame}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:shadow-lg flex items-center gap-3 mx-auto"
        >
          <Play className="w-6 h-6" />
          Start Learning Journey
        </button>

        {gameStats.gamesPlayed > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4">Your Previous Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{gameStats.gamesPlayed}</div>
                <div className="text-sm text-gray-600">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{gameStats.bestScore}</div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{Math.round(gameStats.averageAccuracy)}%</div>
                <div className="text-sm text-gray-600">Avg Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{Math.round(gameStats.averageTime)}s</div>
                <div className="text-sm text-gray-600">Avg Time</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="w-full mobile-game-padding">
      {/* Game Header - Mobile Optimized */}
      <div className="mobile-card mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-1 sm:gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <span className="font-bold text-sm sm:text-lg">{gameState.score}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              <span className="font-mono text-sm sm:text-base">{formatTime(gameState.timeSpent)}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              <span className="text-sm sm:text-base">{gameState.moves}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-lg sm:text-xl">🪙</span>
              <span className="font-medium text-orange-600 text-sm sm:text-base">{Math.round(gameState.score / 10)}</span>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            Placed: {gameState.placedAmendments.length}/{AMENDMENTS.length}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Amendment Cards - Mobile Optimized */}
        <div className="lg:col-span-1">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Amendment Cards</h2>
          <div className="space-y-2 sm:space-y-3">
            {gameState.availableAmendments.map((amendment) => (
              <div
                key={amendment.id}
                onClick={() => handleAmendmentClick(amendment)}
                className={`mobile-game-card ${CATEGORY_COLORS[amendment.category]} bg-opacity-10 border-2 border-opacity-30 rounded-xl cursor-pointer hover:shadow-lg hover:bg-opacity-20 transition-all duration-200 ${
                  gameState.selectedAmendment?.id === amendment.id ? 'mobile-game-selected' : ''
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold ${CATEGORY_COLORS[amendment.category]} text-white`}>
                    {amendment.category.toUpperCase()}
                  </span>
                  <span className={`text-[10px] sm:text-xs font-bold ${DIFFICULTY_COLORS[amendment.difficulty]}`}>
                    {amendment.difficulty.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2">{amendment.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 line-clamp-3">{amendment.description}</p>
                  </div>
                  {gameState.selectedAmendment?.id === amendment.id && (
                    <span className="text-yellow-500 text-lg sm:text-xl animate-pulse">✓</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showHint(amendment);
                  }}
                  className="mobile-game-button flex items-center gap-1 sm:gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors p-2 rounded bg-blue-50 hover:bg-blue-100"
                >
                  <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Need a hint? (-50 points)</span>
                  <span className="sm:hidden">Hint (-50)</span>
                </button>
              </div>
            ))}
            {gameState.selectedAmendment && (
              <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-xs sm:text-sm text-yellow-800">
                <strong>{gameState.selectedAmendment.title}</strong> selected. Tap a year to place it!
              </div>
            )}
          </div>
        </div>

        {/* Timeline - Mobile Optimized */}
        <div className="lg:col-span-2">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Timeline</h2>
          <div className="bg-white rounded-xl p-3 sm:p-6 shadow-lg">
            <div className="relative">
              {/* Timeline line - Responsive */}
              <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 sm:w-1 bg-gradient-to-b from-blue-500 to-purple-500"></div>
              
              {/* Year markers and drop zones - Mobile Optimized */}
              <div className="space-y-4 sm:space-y-8">
                {[1951, 1976, 1978, 1988, 1992, 2002, 2016].map((year, index) => (
                  <div
                    key={year}
                    className="relative flex items-center"
                  >
                    <div className="absolute left-3 sm:left-6 w-3 h-3 sm:w-5 sm:h-5 bg-white border-2 sm:border-4 border-blue-500 rounded-full z-10"></div>
                    <div className="ml-8 sm:ml-16 flex-1">
                      <div
                        ref={el => dropZoneRefs.current[index] = el}
                        onClick={() => handleYearClick(year)}
                        className={`mobile-game-card min-h-[80px] sm:min-h-[100px] bg-gray-50 rounded-lg border-2 p-3 sm:p-4 transition-all duration-200 cursor-pointer ${
                          gameState.selectedAmendment 
                            ? 'border-yellow-400 bg-yellow-50 hover:border-yellow-500 hover:bg-yellow-100 hover:shadow-lg' 
                            : 'border-gray-300 border-dashed hover:border-blue-400 hover:bg-blue-50'
                        }`}
                        style={{ touchAction: 'manipulation' }}
                      >
                        {gameState.placedAmendments.find(p => p.position === year) ? (
                          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="font-bold text-green-800">{year}</span>
                            </div>
                            <h4 className="font-bold text-lg text-green-900">
                              {gameState.placedAmendments.find(p => p.position === year)?.amendment.title}
                            </h4>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            {gameState.selectedAmendment ? 'Tap to place here' : 'Place amendment here'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute left-0 ml-4 font-bold text-blue-600">{year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amendment Details - Mobile Optimized */}
      {gameState.selectedAmendment && (
        <div className="mt-4 sm:mt-6 bg-white rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="flex-1 pr-2">
              <h3 className="text-lg sm:text-2xl font-bold line-clamp-2">{gameState.selectedAmendment.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{gameState.selectedAmendment.year} • {gameState.selectedAmendment.category}</p>
            </div>
            <button
              onClick={() => setGameState(prev => ({ ...prev, selectedAmendment: null }))}
              className="mobile-game-button text-gray-400 hover:text-gray-600 p-2 rounded"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-2">What it means:</h4>
              <p className="text-sm sm:text-base text-gray-700 line-height-relaxed">{gameState.selectedAmendment.description}</p>
            </div>
            
            {gameState.showHint && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <h4 className="font-bold text-lg text-blue-800">Hint:</h4>
                </div>
                <p className="text-blue-700">{gameState.selectedAmendment.hint}</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-lg mb-2">🌟 Fun Fact:</h4>
            <p className="text-yellow-800">{gameState.selectedAmendment.funFact}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderComplete = () => (
    <div className="w-full p-2">
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 text-center">
        <div className="mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Timeline Completed!</h1>
          <p className="text-lg text-gray-600">Congratulations! You've placed all amendments on the timeline.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4">Your Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Final Score:</span>
                <span className="font-bold text-green-600">{gameState.score}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Taken:</span>
                <span className="font-bold">{formatTime(gameState.timeSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span>Correct Placements:</span>
                <span className="font-bold">{gameState.correctPlacements}/{AMENDMENTS.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Hints Used:</span>
                <span className="font-bold">{gameState.hintsUsed}</span>
              </div>
              <div className="flex justify-between">
                <span>Moves Made:</span>
                <span className="font-bold">{gameState.moves}</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-bold">{Math.round((gameState.correctPlacements / AMENDMENTS.length) * 100)}%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4">🎁 Rewards Earned!</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  <span className="font-medium text-yellow-700">Constitutional Coins</span>
                </div>
                <span className="font-bold text-2xl text-yellow-600">+{gameState.coinsEarned}</span>
              </div>
              
              <div className="flex items-center justify-between bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="font-medium text-purple-700">Experience Points</span>
                </div>
                <span className="font-bold text-2xl text-purple-600">+{gameState.experienceGained}</span>
              </div>
              
              {Math.round((gameState.correctPlacements / AMENDMENTS.length) * 100) === 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <span className="text-green-700 font-medium">🌟 Perfect Placement Bonus Unlocked!</span>
                </div>
              )}
              
              {gameState.hintsUsed === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <span className="text-blue-700 font-medium">🎯 No Hints Used - Master Achievement!</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-lg mb-4">Learning Progress</h3>
            <div className="space-y-4">
              {AMENDMENTS.map((amendment) => {
                const isCorrect = gameState.placedAmendments.find(p => p.amendment.id === amendment.id)?.position === amendment.year;
                return (
                  <div key={amendment.id} className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <X className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm">{amendment.title} ({amendment.year})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {showCelebration && (
          <div className="mb-8">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">Amazing Work!</h2>
            <p className="text-green-600">You've mastered the amendment timeline!</p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg"
          >
            Play Again
          </button>
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {gameState.currentStep === 'intro' && renderIntro()}
      {gameState.currentStep === 'playing' && renderGame()}
      {gameState.currentStep === 'complete' && renderComplete()}
    </div>
  );
};

export default AmendmentTimelineGame;