// Famous Cases Match Game Component
// Interactive game to match landmark Supreme Court cases with their outcomes
// Designed for children aged 10-16 with scholarly case law theming

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

// Famous Supreme Court Cases Data
const FAMOUS_CASES = [
  {
    id: 'kesavananda_bharati',
    caseName: 'Kesavananda Bharati vs State of Kerala',
    description: 'Established the Basic Structure Doctrine - fundamental features of the Constitution cannot be amended by Parliament.',
    year: 1973,
    outcome: 'The Supreme Court held that Parliament cannot alter the basic structure of the Constitution.',
    significance: 'This case established judicial review of constitutional amendments and protected the core identity of Indian Constitution.'
  },
  {
    id: 'maneka_gandhi',
    caseName: 'Maneka Gandhi vs Union of India',
    description: 'Expanded the scope of Article 14 (Right to Equality) to include fair, just, and reasonable procedures.',
    year: 1978,
    outcome: 'Article 14 requires that laws must be fair, just, and reasonable, not just non-arbitrary.',
    significance: 'Strengthened the connection between different Fundamental Rights and made them more comprehensive.'
  },
  {
    id: 'vishaka',
    caseName: 'Vishaka vs State of Rajasthan',
    description: 'Established guidelines for prevention of sexual harassment at workplace in absence of specific legislation.',
    year: 1997,
    outcome: 'Created legally binding guidelines for workplace sexual harassment until Parliament made a law.',
    significance: 'Landmark judgment that protected women\'s rights at workplace and led to the Sexual Harassment Act 2013.'
  },
  {
    id: 'puttaswamy',
    caseName: 'Justice K.S. Puttaswamy vs Union of India',
    description: 'Recognized Right to Privacy as a Fundamental Right under Article 21.',
    year: 2017,
    outcome: 'Right to Privacy was declared as a Fundamental Right inherent in Article 21 (Right to Life).',
    significance: 'Protected individual privacy in the digital age and influenced many privacy-related judgments.'
  },
  {
    id: 'golaknath',
    caseName: 'Golaknath vs State of Punjab',
    description: 'Limited Parliament\'s power to amend Fundamental Rights under Article 368.',
    year: 1967,
    outcome: 'Parliament cannot amend Fundamental Rights to take away or abridge them.',
    significance: 'Preceded Kesavananda Bharati and started the debate on amendment powers.'
  },
  {
    id: 'minerva',
    caseName: 'Minerva Mills vs Union of India',
    description: 'Reaffirmed the Basic Structure Doctrine and balanced between judicial review and parliamentary sovereignty.',
    year: 1980,
    outcome: 'Upheld the Basic Structure Doctrine and set limits on Parliament\'s amendment powers.',
    significance: 'Strengthened judicial review and established that constitutional amendments must not destroy basic features.'
  },
  {
    id: 'bandit_queen',
    caseName: 'Phoolrani Devi vs Union of India (Bandit Queen Case)',
    description: 'Recognized the right to dignity of prisoners and highlighted prison reform.',
    year: 1990,
    outcome: 'Prisoners retain their dignity and basic human rights even after conviction.',
    significance: 'Brought attention to prison conditions and prisoner rights in India.'
  },
  {
    id: 'rajagopal',
    caseName: 'R. Rajagopal vs State of Tamil Nadu',
    description: 'Established the right to privacy in publication of private lives of public figures.',
    year: 1994,
    outcome: 'No one can publish another\'s life story without consent, even if true.',
    significance: 'Protected individual privacy rights, especially for public figures and celebrities.'
  },
  {
    id: 'nabha',
    caseName: 'Nabha vs State of Punjab',
    description: 'Demonstrated that constitutional courts can enforce socio-economic rights through PIL.',
    year: 1983,
    outcome: 'Constitutional courts have jurisdiction to enforce socio-economic rights through Public Interest Litigation.',
    significance: 'Expanded access to justice through PIL and helped marginalized communities.'
  },
  {
    id: 'shah_bano',
    caseName: 'Shah Bano vs Union of India',
    description: 'Granted Muslim women right to maintenance under Criminal Procedure Code, not just Muslim Personal Law.',
    year: 1985,
    outcome: 'Muslim women can claim maintenance under Criminal Procedure Code, independent of personal law.',
    significance: 'Highlighted gender justice and the relationship between personal laws and constitutional rights.'
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors min-h-[44px]"
              style={{ touchAction: 'manipulation' }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Games
            </button>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-amber-600" />
                <span className={`font-mono text-lg font-bold ${getTimeColor()}`}>
                  {formatTime(timeElapsed)}
                </span>
                <span className="text-sm text-gray-500">/ {formatTime(difficulty.timeLimit)}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{gameStats.matches}</div>
                  <div className="text-xs text-gray-500">Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{gameStats.accuracy}%</div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{gameStats.attempts}</div>
                  <div className="text-xs text-gray-500">Attempts</div>
                </div>
              </div>
              
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 rounded-lg transition-colors min-h-[44px]"
                style={{ touchAction: 'manipulation' }}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-800 mb-2 flex items-center justify-center gap-3">
              <Scale className="w-8 h-8" />
              Famous Cases Match Game
              <Scale className="w-8 h-8" />
            </h1>
            <p className="text-gray-600 mb-4">
              Match landmark Supreme Court cases with their outcomes. Learn how these cases shaped Indian law!
            </p>
            <div className="flex justify-center gap-4 text-sm">
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

        {/* Game Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {gameCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`mobile-game-card
                relative min-h-[160px] sm:h-48 cursor-pointer transform transition-all duration-300 
                ${card.isFlipped || card.isMatched ? 'rotate-y-180' : 'hover:scale-105 active:scale-95'}
                ${card.isMatched ? 'ring-4 ring-green-400' : ''}
                ${card.isHighlighted ? 'ring-4 ring-yellow-400 animate-pulse' : ''}
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

        {/* Game Complete Modal */}
        {isGameComplete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
              <div className="mb-6">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Congratulations!</h2>
                <p className="text-gray-600">You've matched all the famous cases!</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-amber-600">{gameStats.score}</div>
                  <div className="text-sm text-gray-600">Final Score</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-600">{gameStats.accuracy}%</div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                    <div className="text-xs text-gray-600">Time Taken</div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <Coins className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                    <div className="text-sm font-bold text-amber-600">{gameStats.coinsEarned}</div>
                    <div className="text-xs text-gray-500">Coins</div>
                  </div>
                  <div className="text-center">
                    <Star className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <div className="text-sm font-bold text-purple-600">{gameStats.experienceGained}</div>
                    <div className="text-xs text-gray-500">Experience</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={resetGame}
                  className="mobile-game-button flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors min-h-[52px]"
                  style={{ touchAction: 'manipulation' }}
                >
                  Play Again
                </button>
                <button
                  onClick={onBack}
                  className="mobile-game-button flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition-colors min-h-[52px]"
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