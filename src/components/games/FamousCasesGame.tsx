// Constitutional Stories Match Game Component
// Interactive game to match constitutional principles with real-life kid-friendly scenarios
// Designed for children aged 8-16 with engaging storytelling approach

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, FamousCasesGameProgress } from '../../types/gamification';
import { getStorageInstance } from '../..//lib/storage';
import { PointCalculator, GamePerformance } from '../../lib/pointCalculator';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Zap, 
  Star, 
  Coins,
  Scale,
  CheckCircle,
  XCircle,
  Play,
  Book,
  Award,
  Target,
  Timer,
  Brain,
  Lightbulb,
  Bookmark
} from 'lucide-react';

interface FamousCasesGameProps {
  userProfile: UserProfile;
  onBack: () => void;
  onGameComplete?: (score: number, coinsEarned: number, experienceGained: number) => void;
  onProgressUpdate?: (progressData: any) => void;
  initialProgress?: any;
  sessionId?: string;
}

interface CaseCard {
  id: string;
  caseName: string;
  description: string;
  year: number;
  type: 'case' | 'outcome';
  caseId: string;
  isFlipped: boolean;
  isMatched: boolean;
  isHighlighted: boolean;
}

interface GameStats {
  matches: number;
  attempts: number;
  startTime: number;
  endTime?: number;
  score: number;
  coinsEarned: number;
  experienceGained: number;
  accuracy: number;
}

interface DifficultySettings {
  casePairs: number;
  timeLimit: number;
  maxAttempts: number;
}

// Constitutional Stories for Kids - Simple scenarios they can understand
const FAMOUS_CASES = [
  {
    id: 'school_prayer_story',
    caseName: '🕉️ The School Prayer Story',
    description: 'A school said kids must pray to one god only. Some children felt sad because they prayed differently at home.',
    year: 2023,
    outcome: 'The court said all kids can pray their own way. Schools must respect every religion equally!',
    significance: 'This shows how our Constitution protects everyone\'s right to follow their own faith.'
  },
  {
    id: 'playground_equality_story',
    caseName: '⚖️ The Playground Equality Story',
    description: 'A playground had a sign saying "Only rich kids can play here." Poor kids had to watch from outside.',
    year: 2023,
    outcome: 'The court said ALL children are equal. No playground can ban kids just because they\'re poor!',
    significance: 'This teaches us that everyone deserves equal treatment, no matter how much money their family has.'
  },
  {
    id: 'free_lunch_story',
    caseName: '🍽️ The Free School Lunch Story',
    description: 'Some schools stopped giving free meals to hungry children. Many kids came to school with empty stomachs.',
    year: 2023,
    outcome: 'The court said every child must get nutritious food at school. Education includes proper meals!',
    significance: 'This shows how the right to education includes making sure kids are healthy and well-fed.'
  },
  {
    id: 'library_books_story',
    caseName: '📚 The Library Books Story',
    description: 'A library tried to ban books about different cultures and religions. Kids couldn\'t learn about diversity.',
    year: 2023,
    outcome: 'The court said children have the right to read and learn about all cultures and ideas!',
    significance: 'This protects our freedom to learn, read, and understand the world around us.'
  },
  {
    id: 'clean_water_story',
    caseName: '🚰 The Clean Water Story',
    description: 'A village had dirty water that made children sick. The government said "we have no money to fix it."',
    year: 2023,
    outcome: 'The court said clean water is a basic right. Every child deserves safe water to drink!',
    significance: 'This shows that our government must make sure we have clean water to stay healthy.'
  },
  {
    id: 'homework_help_story',
    caseName: '📝 The Homework Help Story',
    description: 'A teacher said kids from one community couldn\'t get extra help with homework. Only some kids got special classes.',
    year: 2023,
    outcome: 'The court said ALL children must get equal help at school, no matter their background!',
    significance: 'This teaches us that every student deserves the same opportunities to learn and grow.'
  },
  {
    id: 'festival_celebration_story',
    caseName: '🎉 The Festival Celebration Story',
    description: 'A school banned kids from celebrating their cultural festivals. Some children felt left out and sad.',
    year: 2023,
    outcome: 'The court said children can celebrate their festivals at school. Diversity makes us stronger!',
    significance: 'This protects our right to celebrate our culture and traditions proudly.'
  },
  {
    id: 'sports_team_story',
    caseName: '⚽ The Sports Team Story',
    description: 'A sports club said girls can\'t play football, only boys. Talented girls had to sit on the sidelines.',
    year: 2023,
    outcome: 'The court said girls and boys have equal rights to play any sport they love!',
    significance: 'This shows how gender equality means everyone gets the same chances to pursue their dreams.'
  },
  {
    id: 'secret_diary_story',
    caseName: '📔 The Secret Diary Story',
    description: 'A school principal read students\' private messages and diaries without permission to "keep them safe."',
    year: 2023,
    outcome: 'The court said children have privacy rights too. Adults can\'t read private things without good reason!',
    significance: 'This teaches us that even kids have the right to privacy and personal space.'
  },
  {
    id: 'street_food_story',
    caseName: '🍛 The Street Food Vendor Story',
    description: 'Police removed all street food vendors because they said it looked "messy." Many families lost their income.',
    year: 2023,
    outcome: 'The court said people have the right to earn a living. The city must help vendors, not remove them!',
    significance: 'This shows that everyone deserves dignity in their work and the right to make a living.'
  }
];

export default function FamousCasesGame({ userProfile, onBack, onGameComplete, onProgressUpdate, initialProgress, sessionId }: FamousCasesGameProps) {
  const [gameCards, setGameCards] = useState<CaseCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<CaseCard[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    matches: 0,
    attempts: 0,
    startTime: Date.now(),
    score: 0,
    coinsEarned: 0,
    experienceGained: 0,
    accuracy: 0
  });
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [currentCaseInfo, setCurrentCaseInfo] = useState<any>(null);
  const [gamePhase, setGamePhase] = useState<'matching' | 'celebrating' | 'educational'>('matching');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [difficulty] = useState<DifficultySettings>({
    casePairs: Math.min(6, FAMOUS_CASES.length),
    timeLimit: 600, // 10 minutes
    maxAttempts: 20
  });

  // Initialize game
  const initializeGame = useCallback(() => {
    const shuffledCases = [...FAMOUS_CASES].sort(() => Math.random() - 0.5).slice(0, difficulty.casePairs);
    
    const cards: CaseCard[] = [];
    shuffledCases.forEach((caseData) => {
      // Case card
      cards.push({
        id: `${caseData.id}_case`,
        caseName: caseData.caseName,
        description: caseData.description,
        year: caseData.year,
        type: 'case',
        caseId: caseData.id,
        isFlipped: false,
        isMatched: false,
        isHighlighted: false
      });
      
      // Outcome card
      cards.push({
        id: `${caseData.id}_outcome`,
        caseName: caseData.caseName,
        description: caseData.outcome,
        year: caseData.year,
        type: 'outcome',
        caseId: caseData.id,
        isFlipped: false,
        isMatched: false,
        isHighlighted: false
      });
    });
    
    // Shuffle all cards
    const shuffledCards = cards.sort(() => Math.random() - 0.5);
    setGameCards(shuffledCards);
    setSelectedCards([]);
  }, [difficulty.casePairs]);

  // Timer effect
  useEffect(() => {
    if (gamePhase === 'matching' && !isGameComplete) {
      const timer = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - gameStats.startTime) / 1000));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [gamePhase, isGameComplete, gameStats.startTime]);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Load initial progress if provided
  useEffect(() => {
    if (initialProgress) {
      if (initialProgress.score !== undefined) {
        setGameStats(prev => ({ ...prev, score: initialProgress.score }));
      }
      if (initialProgress.gameComplete !== undefined) setIsGameComplete(initialProgress.gameComplete);
      if (initialProgress.matches !== undefined || initialProgress.attempts !== undefined) {
        setGameStats(prev => ({
          ...prev,
          matches: initialProgress.matches ?? prev.matches,
          attempts: initialProgress.attempts ?? prev.attempts,
          accuracy: initialProgress.matches && initialProgress.attempts 
            ? Math.round((initialProgress.matches / initialProgress.attempts) * 100)
            : prev.accuracy
        }));
      }
      if (initialProgress.timeElapsed !== undefined) setTimeElapsed(initialProgress.timeElapsed);
      if (initialProgress.selectedCards) setSelectedCards(initialProgress.selectedCards);
      if (initialProgress.gameCards) {
        setGameCards(initialProgress.gameCards.map((card: any) => ({
          ...card,
          isFlipped: false, // Reset flip state on load
          isHighlighted: false
        })));
      }
    }
  }, [initialProgress]);

  // Handle card click
  const handleCardClick = (cardId: string) => {
    if (gamePhase !== 'matching' || isGameComplete) return;
    
    const card = gameCards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    const updatedCards = gameCards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setGameCards(updatedCards);
    
    const newSelected = [...selectedCards, { ...card, isFlipped: true }];
    setSelectedCards(newSelected);
    
    if (newSelected.length === 2) {
      checkMatch(newSelected);
    }
  };

  // Check for match
  const checkMatch = (selected: CaseCard[]) => {
    setTimeout(() => {
      const [first, second] = selected;
      const isMatch = first.caseId === second.caseId && first.type !== second.type;
      
      setGameStats(prev => {
        const newAttempts = prev.attempts + 1;
        const newMatches = isMatch ? prev.matches + 1 : prev.matches;
        const accuracy = Math.round((newMatches / newAttempts) * 100);
        
        const updatedStats = {
          ...prev,
          attempts: newAttempts,
          matches: newMatches,
          accuracy
        };
        
        // Update progress
        onProgressUpdate?.(updatedStats);
        
        return updatedStats;
      });
      
      if (isMatch) {
        // Successful match
        const matchedCase = FAMOUS_CASES.find(c => c.id === first.caseId);
        setCurrentCaseInfo(matchedCase);
        setGameCards(prev => prev.map(c => 
          c.caseId === first.caseId 
            ? { ...c, isMatched: true, isHighlighted: true }
            : c
        ));
        
        setGamePhase('celebrating');
        setTimeout(() => {
          setGamePhase('matching');
          setGameCards(prev => prev.map(c => ({ ...c, isHighlighted: false })));
          setShowEducationalModal(true);
        }, 2000);
      } else {
        // No match - flip back
        setGameCards(prev => prev.map(c => 
          selected.find(s => s.id === c.id) 
            ? { ...c, isFlipped: false, isHighlighted: false }
            : c
        ));
      }
      
      setSelectedCards([]);
    }, 1000);
  };

  // Calculate final score using standardized PointCalculator
  const calculateFinalScore = useCallback(() => {
    const timeBonus = Math.max(0, (difficulty.timeLimit - timeElapsed) * 10);
    const accuracyBonus = gameStats.accuracy * 5;
    const completionBonus = gameStats.matches === difficulty.casePairs ? 200 : 0;
    
    const totalScore = Math.floor(
      gameStats.matches * 50 + 
      gameStats.accuracy * 2 + 
      timeBonus + 
      completionBonus
    );
    
    // Calculate points using standardized PointCalculator
    const performance: GamePerformance = {
      score: totalScore,
      accuracy: gameStats.accuracy,
      timeSpent: timeElapsed,
      perfectGame: gameStats.matches === difficulty.casePairs && gameStats.accuracy >= 95,
      hintsUsed: 0, // Could be tracked if hints are implemented
      difficulty: 'medium', // Default difficulty for famous cases game
      gameType: 'famous_cases'
    };
    
    const pointResult = PointCalculator.calculateGamePoints(
      performance,
      userProfile,
      userProfile.currentStreak
    );
    
    return {
      totalScore,
      coinsEarned: pointResult.coinsEarned,
      experienceGained: pointResult.experienceGained
    };
  }, [gameStats, timeElapsed, difficulty, userProfile]);

  // Complete game
  const completeGame = useCallback(async () => {
    const { totalScore, coinsEarned, experienceGained } = calculateFinalScore();
    
    setGameStats(prev => ({
      ...prev,
      score: totalScore,
      coinsEarned,
      experienceGained,
      endTime: Date.now()
    }));
    
    setIsGameComplete(true);
    setGamePhase('educational');
    
    // Save progress to storage
    try {
      const storage = getStorageInstance();
      const progress: FamousCasesGameProgress = {
        gameId: 'famous_cases_match',
        userId: userProfile.userId,
        completionDate: new Date().toISOString(),
        score: totalScore,
        accuracy: gameStats.accuracy,
        timeSpent: Math.floor((Date.now() - gameStats.startTime) / 1000),
        coinsEarned,
        experienceGained,
        gameData: {
          matches: gameStats.matches,
          attempts: gameStats.attempts,
          difficulty: difficulty.casePairs,
          casesMatched: gameCards.filter(c => c.isMatched).map(c => c.caseId)
        }
      };

      // Update progress for external tracking
      onProgressUpdate?.(progress);

      // Note: Save progress to localStorage for now - can be enhanced later
      console.log('Game progress saved:', progress);
      
      // Update user profile
      if (onGameComplete) {
        onGameComplete(totalScore, coinsEarned, experienceGained);
      }
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  }, [calculateFinalScore, gameStats, difficulty, userProfile, onGameComplete]);

  // Check for game completion
  useEffect(() => {
    if (gameStats.matches === difficulty.casePairs && gamePhase === 'matching') {
      completeGame();
    }
  }, [gameStats.matches, difficulty.casePairs, gamePhase, completeGame]);

  // Reset game
  const resetGame = () => {
    setGameCards([]);
    setSelectedCards([]);
    setGameStats({
      matches: 0,
      attempts: 0,
      startTime: Date.now(),
      score: 0,
      coinsEarned: 0,
      experienceGained: 0,
      accuracy: 0
    });
    setIsGameComplete(false);
    setShowEducationalModal(false);
    setCurrentCaseInfo(null);
    setGamePhase('matching');
    setTimeElapsed(0);
    initializeGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const remaining = difficulty.timeLimit - timeElapsed;
    if (remaining < 60) return 'text-red-600';
    if (remaining < 180) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-3 sm:p-4">
      {/* Header - Mobile Optimized */}
      <div className="w-full">
        <div className="mobile-game-card bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
            <button
              onClick={onBack}
              className="mobile-game-button flex items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors min-h-[44px] w-fit"
              style={{ touchAction: 'manipulation' }}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back to Games</span>
            </button>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                <span className={`font-mono text-base sm:text-lg font-bold ${getTimeColor()}`}>
                  {formatTime(timeElapsed)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">/ {formatTime(difficulty.timeLimit)}</span>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">{gameStats.matches}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">{gameStats.accuracy}%</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">{gameStats.attempts}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Attempts</div>
                </div>
              </div>
              
              <button
                onClick={resetGame}
                className="mobile-game-button flex items-center gap-2 px-3 py-2 bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 rounded-lg transition-colors min-h-[44px]"
                style={{ touchAction: 'manipulation' }}
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">Reset</span>
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-xl sm:text-3xl font-bold text-amber-800 mb-2 flex items-center justify-center gap-2 sm:gap-3">
              <Scale className="w-6 h-6 sm:w-8 sm:h-8" />
              <span className="line-clamp-1">Famous Cases Match Game</span>
              <Scale className="w-6 h-6 sm:w-8 sm:h-8" />
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed">
              Match landmark Supreme Court cases with their outcomes. Learn how these cases shaped Indian law!
            </p>
            <div className="flex justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-600" />
                Score: {gameStats.score}
              </span>
              <span className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-amber-600" />
                Coins: {gameStats.coinsEarned}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-blue-600" />
                XP: {gameStats.experienceGained}
              </span>
            </div>
          </div>
        </div>

        {/* Game Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 lg:gap-4 mb-4 sm:mb-6">
          {gameCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`mobile-game-card
                relative min-h-[140px] sm:min-h-[160px] lg:h-48 cursor-pointer transform transition-all duration-300 
                ${card.isFlipped || card.isMatched ? 'rotate-y-180' : 'hover:shadow-md hover:bg-orange-50 active:shadow-sm'}
                ${card.isMatched ? 'ring-2 sm:ring-4 ring-green-400' : ''}
                ${card.isHighlighted ? 'ring-2 sm:ring-4 ring-yellow-400 animate-pulse' : ''}
                ${!card.isFlipped && !card.isMatched ? 'hover:shadow-lg' : ''}
              `}
              style={{ touchAction: 'manipulation' }}
            >
              {/* Card Back (what users see initially) */}
              <div className={`
                absolute inset-0 w-full h-full backface-hidden
                bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl
                border-2 border-amber-800 p-3 sm:p-4 flex flex-col justify-center items-center text-white
                ${card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'}
              `}>
                <Scale className="w-8 h-8 sm:w-12 sm:h-12 mb-2 opacity-80" />
                <div className="text-center">
                  <div className="text-xs sm:text-sm font-bold">FAMOUS</div>
                  <div className="text-xs sm:text-sm font-bold">CASE</div>
                </div>
              </div>
              
              {/* Card Front (content) */}
              <div className={`
                absolute inset-0 w-full h-full backface-hidden rotate-y-180
                bg-white rounded-xl border-2 border-amber-300 p-2 sm:p-3 flex flex-col justify-between
                ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}
                ${card.isMatched ? 'bg-green-50 border-green-400' : 'bg-white'}
                ${card.isHighlighted ? 'bg-yellow-50 border-yellow-400' : ''}
              `}>
                <div>
                  {card.type === 'case' ? (
                    <>
                      <div className="text-[10px] sm:text-xs text-amber-600 font-bold mb-1">{card.year}</div>
                      <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2">
                        {card.caseName}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-3">
                        {card.description}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] sm:text-xs text-green-600 font-bold mb-2 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        OUTCOME
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        {card.description}
                      </p>
                    </>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    card.type === 'case' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {card.type === 'case' ? 'CASE' : 'OUTCOME'}
                  </span>
                  {card.isMatched && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Complete Modal - Mobile Optimized */}
        {isGameComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="mobile-game-card bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full text-center max-h-[90vh] overflow-y-auto">
              <div className="mb-4 sm:mb-6">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Congratulations!</h2>
                <p className="text-sm sm:text-base text-gray-600">You've matched all the famous cases!</p>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">{gameStats.score}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Final Score</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-green-50 rounded-lg p-2 sm:p-3">
                    <div className="text-base sm:text-lg font-bold text-green-600">{gameStats.accuracy}%</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Accuracy</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                    <div className="text-base sm:text-lg font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Time Taken</div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3 sm:gap-4">
                  <div className="text-center">
                    <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 mx-auto mb-1" />
                    <div className="text-xs sm:text-sm font-bold text-amber-600">{gameStats.coinsEarned}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Coins</div>
                  </div>
                  <div className="text-center">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mx-auto mb-1" />
                    <div className="text-xs sm:text-sm font-bold text-purple-600">{gameStats.experienceGained}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Experience</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetGame}
                  className="mobile-game-button flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors min-h-[52px] text-sm sm:text-base"
                  style={{ touchAction: 'manipulation' }}
                >
                  Play Again
                </button>
                <button
                  onClick={onBack}
                  className="mobile-game-button flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors min-h-[52px] text-sm sm:text-base"
                  style={{ touchAction: 'manipulation' }}
                >
                  Back to Hub
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Educational Modal */}
        {showEducationalModal && currentCaseInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="text-center mb-6">
                <Award className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Case Unlocked!</h3>
                <p className="text-gray-600">Learn about this landmark judgment</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                  <h4 className="font-bold text-amber-800 mb-2">{currentCaseInfo.caseName}</h4>
                  <div className="text-sm text-amber-700 mb-2">{currentCaseInfo.year}</div>
                  <p className="text-sm text-gray-700">{currentCaseInfo.description}</p>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Landmark Outcome
                  </h5>
                  <p className="text-sm text-gray-700">{currentCaseInfo.outcome}</p>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <h5 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <Book className="w-4 h-4" />
                    Why It Matters
                  </h5>
                  <p className="text-sm text-gray-700">{currentCaseInfo.significance}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-800">Constitutional Connection</span>
                </div>
                <p className="text-sm text-gray-600">
                  These landmark cases show how the Supreme Court interprets and protects our Constitution. 
                  Each judgment strengthens the rule of law and expands the scope of fundamental rights for all citizens.
                </p>
              </div>
              
              <button
                onClick={() => setShowEducationalModal(false)}
                className="mobile-game-button w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors flex items-center justify-center gap-2 min-h-[52px]"
                style={{ touchAction: 'manipulation' }}
              >
                <Bookmark className="w-4 h-4" />
                Continue Learning
              </button>
            </div>
          </div>
        )}

        {/* Inspirational Footer */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-800">Justice Insights</span>
          </div>
          <p className="text-gray-600 mb-4">
            "The Constitution is not a mere lawyers' document, it is a vehicle of Life, 
            and its spirit is always the spirit of Age." - Dr. B.R. Ambedkar
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Scale className="w-4 h-4" />
              <span>Each case strengthens democracy</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Book className="w-4 h-4" />
              <span>Learn from legal precedents</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Award className="w-4 h-4" />
              <span>Understand your rights</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}