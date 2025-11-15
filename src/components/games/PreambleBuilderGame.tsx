import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Pause,
  Lightbulb,
  Volume2
} from 'lucide-react';
import { UserProfile } from '../../types/gamification';
import { PointCalculator, GamePerformance } from '../../lib/pointCalculator';

interface PreambleBuilderGameProps {
  userProfile?: UserProfile;
  onGameComplete?: (scoreData: ScoreData) => void;
  onProgressUpdate?: (progressData: any) => void;
  onBack?: () => void;
  initialProgress?: any;
  sessionId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Word {
  id: string;
  text: string;
  correctPosition: number;
  isPlaced: boolean;
  isCorrect: boolean;
  category?: 'sovereignty' | 'socialist' | 'secular' | 'democratic' | 'republic';
}

interface ScoreData {
  score: number;
  accuracy: number;
  timeTaken: number;
  hintsUsed: number;
  completed: boolean;
  date: string;
  coinsEarned?: number;
  experienceGained?: number;
}

interface EducationalPopup {
  term: string;
  title: string;
  description: string;
  example: string;
  color: string;
}

// The complete Preamble text split into words
const PREAMBLE_WORDS = [
  'WE,', 'THE', 'PEOPLE', 'OF', 'INDIA,', 'IN', 'OUR', 'CONSTITUTIONAL', 'ASSEMBLY,',
  'HEREBY', 'ADOPT,', 'ENACT,', 'AND', 'GIVE', 'TO', 'OURSELVES,', 'THIS', 'CONSTITUTION.'
];

// Educational content for key Preamble terms
const EDUCATIONAL_POPUPS: Record<string, EducationalPopup> = {
  'SOVEREIGN': {
    term: 'SOVEREIGN',
    title: 'Sovereign',
    description: 'India is completely free and independent. No foreign power can control our country.',
    example: 'Like being the captain of your own ship - you make all the decisions!',
    color: 'from-orange-400 to-orange-600'
  },
  'SOCIALIST': {
    term: 'SOCIALIST',
    title: 'Socialist',
    description: 'Everyone should have equal opportunities and wealth should be shared fairly among people.',
    example: 'Like sharing your lunch equally with friends so everyone gets some!',
    color: 'from-white to-white'
  },
  'SECULAR': {
    term: 'SECULAR',
    title: 'Secular',
    description: 'India respects all religions equally. People of all faiths can practice their religion freely.',
    example: 'Like a school that welcomes children of all backgrounds equally!',
    color: 'from-green-400 to-green-600'
  },
  'DEMOCRATIC': {
    term: 'DEMOCRATIC',
    title: 'Democratic',
    description: 'People choose their leaders through voting. Everyone has an equal say in how the country is run.',
    example: 'Like class elections where everyone votes for their favorite leader!',
    color: 'from-blue-400 to-blue-600'
  },
  'REPUBLIC': {
    term: 'REPUBLIC',
    title: 'Republic',
    description: 'India has no king or queen. The people are the highest authority, and leaders are elected.',
    example: 'Like a club where members elect their own president every year!',
    color: 'from-orange-400 to-orange-600'
  }
};

// Key terms that trigger educational popups
const KEY_TERMS = ['SOVEREIGN', 'SOCIALIST', 'SECULAR', 'DEMOCRATIC', 'REPUBLIC'];

// Difficulty settings for Preamble Builder Game
const DIFFICULTY_SETTINGS = {
  easy: {
    timeBonusMultiplier: 0.5,
    hintPenaltyMultiplier: 0.5,
    scoreMultiplier: 0.8,
    title: 'Preamble Explorer'
  },
  medium: {
    timeBonusMultiplier: 1.0,
    hintPenaltyMultiplier: 1.0,
    scoreMultiplier: 1.0,
    title: 'Preamble Builder'
  },
  hard: {
    timeBonusMultiplier: 1.5,
    hintPenaltyMultiplier: 1.5,
    scoreMultiplier: 1.2,
    title: 'Preamble Master'
  }
};

const PreambleBuilderGame: React.FC<PreambleBuilderGameProps> = ({ 
  userProfile, 
  onGameComplete,
  onProgressUpdate,
  onBack,
  initialProgress,
  sessionId,
  difficulty: initialDifficulty = 'medium'
}) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialDifficulty);
  // Game state
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [placedWords, setPlacedWords] = useState<Word[]>([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [showEducationalPopup, setShowEducationalPopup] = useState<EducationalPopup | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showNextHint, setShowNextHint] = useState(false);
  const [finalScoreData, setFinalScoreData] = useState<ScoreData | null>(null);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted && !isPaused) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - (startTime || Date.now())) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted, startTime, isPaused]);

  // Load high score and stats on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('preambleBuilderHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Load initial progress if provided
  useEffect(() => {
    if (initialProgress) {
      try {
        setScore(initialProgress.score || 0);
        setTimeElapsed(initialProgress.timeElapsed || 0);
        setHintsUsed(initialProgress.hintsUsed || 0);
        setAttempts(initialProgress.attempts || 0);
        if (initialProgress.availableWords) {
          setAvailableWords(initialProgress.availableWords);
        }
        if (initialProgress.placedWords) {
          setPlacedWords(initialProgress.placedWords);
        }
        if (initialProgress.currentPosition !== undefined) {
          setCurrentPosition(initialProgress.currentPosition);
        }
      } catch (error) {
        console.warn('Failed to load initial progress:', error);
      }
    }
  }, [initialProgress]);

  // Save high score
  const saveHighScore = useCallback((newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('preambleBuilderHighScore', newScore.toString());
    }
  }, [highScore]);

  // Shuffle array helper
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const words: Word[] = PREAMBLE_WORDS.map((text, index) => ({
      id: `word-${index}`,
      text,
      correctPosition: index,
      isPlaced: false,
      isCorrect: false,
      category: getWordCategory(text)
    }));
    
    setAvailableWords(shuffleArray(words));
    setPlacedWords([]);
    setCurrentPosition(0);
    setHintsUsed(0);
    setAttempts(0);
    setTimeElapsed(0);
    setScore(0);
    setShowNextHint(false);
  }, [shuffleArray]);

  // Get word category for educational popups
  const getWordCategory = (text: string): 'sovereignty' | 'socialist' | 'secular' | 'democratic' | 'republic' | undefined => {
    const upperText = text.toUpperCase();
    if (upperText.includes('SOVEREIGN')) return 'sovereignty';
    if (upperText.includes('SOCIALIST')) return 'socialist';
    if (upperText.includes('SECULAR')) return 'secular';
    if (upperText.includes('DEMOCRATIC')) return 'democratic';
    if (upperText.includes('REPUBLIC')) return 'republic';
    return undefined;
  };

  // Start game
  const startGame = () => {
    initializeGame();
    setGameStarted(true);
    setStartTime(Date.now());
    setGameCompleted(false);
    setFeedback(null);
    setCelebrationVisible(false);
    setIsPaused(false);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setAvailableWords([]);
    setPlacedWords([]);
    setCurrentPosition(0);
    setScore(0);
    setTimeElapsed(0);
    setHintsUsed(0);
    setFeedback(null);
    setCelebrationVisible(false);
    setShowEducationalPopup(null);
    setIsPaused(false);
    setShowNextHint(false);
  };

  // Pause/Resume game
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Mobile-friendly touch handlers (replaces drag-and-drop)
  const handleWordClick = (word: Word) => {
    if (isPaused || word.isPlaced) return;
    setSelectedWord(selectedWord?.id === word.id ? null : word);
  };

  const handleSlotClick = (position: number) => {
    if (isPaused || !selectedWord) return;
    if (position !== currentPosition) {
      // Only allow placement at current position
      setFeedback({
        message: `Please place words in order. Next position is ${currentPosition + 1}.`,
        type: 'info'
      });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }
    placeWord(selectedWord, position);
    setSelectedWord(null);
  };

  // Handle word placement
  const placeWord = (word: Word, position?: number) => {
    const targetPosition = position !== undefined ? position : currentPosition;
    const isCorrect = word.correctPosition === targetPosition;
    
    setAttempts(prev => prev + 1);
    setAvailableWords(prev => prev.filter(w => w.id !== word.id));
    
    const placedWord = { ...word, isPlaced: true, isCorrect };
    setPlacedWords(prev => {
      const newPlaced = [...prev];
      newPlaced[targetPosition] = placedWord;
      return newPlaced;
    });

    if (isCorrect) {
      setScore(prev => prev + 20);
      setCurrentPosition(prev => prev + 1);
      setFeedback({
        message: `✅ Correct! "${word.text}" belongs here.`,
        type: 'success'
      });

      // Show educational popup for key terms
      if (KEY_TERMS.some(term => word.text.toUpperCase().includes(term))) {
        const keyTerm = KEY_TERMS.find(term => word.text.toUpperCase().includes(term));
        if (keyTerm && EDUCATIONAL_POPUPS[keyTerm]) {
          setTimeout(() => {
            setShowEducationalPopup(EDUCATIONAL_POPUPS[keyTerm]);
          }, 1500);
        }
      }

      // Check if game is completed
      if (targetPosition + 1 === PREAMBLE_WORDS.length) {
        completeGame();
      }
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setFeedback({
        message: `❌ "${word.text}" doesn't belong here. Try again!`,
        type: 'error'
      });
      // Return word to available words
      setAvailableWords(prev => [...prev, word]);
    }

    setCelebrationVisible(true);
    setTimeout(() => setCelebrationVisible(false), 1500);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Complete game
  const completeGame = () => {
    setGameCompleted(true);
    const finalAccuracy = (currentPosition / attempts) * 100;
    const timeBonus = Math.max(0, 180 - timeElapsed) * 2; // Bonus for faster completion
    const hintPenalty = hintsUsed * 10; // Penalty for hint usage
    const finalScore = Math.max(0, Math.round(score + timeBonus - hintPenalty));
    
    setScore(finalScore);
    saveHighScore(finalScore);

    // Save game data
    const scoreData: ScoreData = {
      score: finalScore,
      accuracy: finalAccuracy,
      timeTaken: timeElapsed,
      hintsUsed,
      completed: true,
      date: new Date().toISOString()
    };
    localStorage.setItem('lastPreambleGameResult', JSON.stringify(scoreData));

    // Calculate standardized points using PointCalculator
    const performance: GamePerformance = {
      score: finalScore,
      accuracy: finalAccuracy,
      timeSpent: timeElapsed,
      perfectGame: finalAccuracy === 100 && hintsUsed === 0,
      hintsUsed: hintsUsed,
      difficulty: difficulty,
      gameType: 'preamble_builder'
    };
    
    const pointResult = PointCalculator.calculateGamePoints(
      performance,
      userProfile,
      userProfile?.currentStreak
    );
    
    // Add coins and experience to scoreData
    const enhancedScoreData: ScoreData = {
      ...scoreData,
      coinsEarned: pointResult.coinsEarned,
      experienceGained: pointResult.experienceGained
    };

    // Store final score data for modal display
    setFinalScoreData(enhancedScoreData);

    // Call completion callback if provided
    if (onGameComplete) {
      onGameComplete(enhancedScoreData);
    }
  };

  // Use hint
  const useHint = () => {
    if (currentPosition >= PREAMBLE_WORDS.length) return;
    
    setHintsUsed(prev => prev + 1);
    setScore(prev => Math.max(0, prev - 15));
    
    const correctWord = availableWords.find(word => word.correctPosition === currentPosition);
    if (correctWord) {
      placeWord(correctWord, currentPosition);
      setFeedback({
        message: `💡 Hint used! The word "${correctWord.text}" was placed correctly.`,
        type: 'info'
      });
      setShowNextHint(false);
    }
  };

  // Show next word hint
  const showNextWordHint = () => {
    if (currentPosition >= PREAMBLE_WORDS.length) return;
    setShowNextHint(true);
    setTimeout(() => setShowNextHint(false), 3000);
  };

  // Remove placed word
  const removeWord = (position: number) => {
    const placedWord = placedWords[position];
    if (!placedWord) return;
    
    setPlacedWords(prev => {
      const newPlaced = [...prev];
      newPlaced[position] = undefined as any;
      return newPlaced;
    });
    setAvailableWords(prev => [...prev, placedWord]);
    setCurrentPosition(Math.min(currentPosition, position));
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get game progress
  const progress = (currentPosition / PREAMBLE_WORDS.length) * 100;
  const accuracy = attempts > 0 ? (currentPosition / attempts) * 100 : 0;

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-orange-50 via-white to-green-50 min-h-screen">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        {onBack && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="mobile-game-button flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md transition-all duration-200 min-h-[44px]"
            style={{ touchAction: 'manipulation' }}
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Games</span>
          </motion.button>
        )}
        <div className="flex-1 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-2"
          >
            🕉️ Preamble Builder Game
          </motion.h1>
          <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
            Build the Preamble of the Indian Constitution word by word!
          </p>
        </div>
        <div className="hidden sm:block w-32"></div> {/* Spacer for center alignment */}
      </div>

      {/* Game Stats - Mobile Optimized */}
      {gameStarted && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mobile-game-card bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border-t-4 border-gradient-to-r from-orange-400 via-white to-green-400"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 text-center mb-4">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-2 sm:p-3">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{score}</div>
              <div className="text-xs sm:text-sm text-blue-800">Score</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-lg p-2 sm:p-3">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{formatTime(timeElapsed)}</div>
              <div className="text-xs sm:text-sm text-green-800">Time</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-2 sm:p-3">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{Math.round(accuracy)}%</div>
              <div className="text-xs sm:text-sm text-purple-800">Accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-2 sm:p-3">
              <div className="text-lg sm:text-2xl font-bold text-orange-600">{Math.round(progress)}%</div>
              <div className="text-xs sm:text-sm text-orange-800">Progress</div>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-2 sm:p-3 col-span-2 sm:col-span-1">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{hintsUsed}</div>
              <div className="text-xs sm:text-sm text-red-800">Hints</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-orange-400 via-white to-green-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {/* Game Controls */}
      {!gameStarted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-t-4 border-gradient-to-r from-orange-400 via-white to-green-400">
            <div className="text-6xl mb-4">🕉️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Build the Preamble?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Tap words to select them, then tap the correct slot to arrange them in order to form the Preamble of the Indian Constitution. 
              Learn about India's founding principles while you play!
            </p>
            
            <div className="bg-gradient-to-r from-orange-100 via-white to-green-100 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🌟 What you'll learn:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">⚪</span>
                  <span className="text-gray-700">Sovereign - Independent India</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">🟢</span>
                  <span className="text-gray-700">Secular - Equal respect for all religions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">🔵</span>
                  <span className="text-gray-700">Democratic - Power to the people</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-500">🟠</span>
                  <span className="text-gray-700">Republic - No kings or queens</span>
                </div>
              </div>
            </div>

            {highScore > 0 && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
                <span className="text-yellow-800">🏆 Best Score: {highScore}</span>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 hover:from-orange-600 hover:via-blue-600 hover:to-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 shadow-lg"
              >
                <Play size={20} className="inline mr-2" />
                Start Building!
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Words */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="mobile-game-card bg-white rounded-xl shadow-lg p-4 sm:p-6 border-t-4 border-gradient-to-r from-orange-400 via-white to-green-400">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  🧩 Word Bank
                </h3>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePause}
                    className="mobile-game-button p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors min-h-[44px] min-w-[44px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={useHint}
                    disabled={currentPosition >= PREAMBLE_WORDS.length}
                    className="mobile-game-button p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-700 transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Lightbulb size={16} />
                  </motion.button>
                </div>
              </div>
              
              {isPaused && (
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 text-center">
                  <Pause size={16} className="sm:w-5 sm:h-5 inline mr-2 text-blue-600" />
                  <span className="text-blue-800 font-medium text-sm sm:text-base">Game Paused</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                <AnimatePresence>
                  {availableWords.map((word) => (
                    <motion.div
                      key={word.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleWordClick(word)}
                      className={`mobile-game-button p-2 sm:p-3 rounded-lg shadow-md cursor-pointer text-center font-semibold transition-all duration-200 hover:shadow-lg min-h-[48px] sm:min-h-[56px] flex items-center justify-center text-xs sm:text-sm ${
                        selectedWord?.id === word.id
                          ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 ring-2 sm:ring-4 ring-yellow-400 ring-offset-1 sm:ring-offset-2 scale-105'
                          : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {word.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Hint Display */}
              {showNextHint && currentPosition < PREAMBLE_WORDS.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg"
                >
                  <div className="text-sm text-yellow-800">
                    <strong>Next word:</strong> "{PREAMBLE_WORDS[currentPosition]}"
                  </div>
                </motion.div>
              )}
              
              {/* Selection indicator */}
              {selectedWord && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-sm text-green-800"
                >
                  <strong>"{selectedWord.text}"</strong> selected. Tap slot {currentPosition + 1} to place it!
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Preamble Builder Area */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-gradient-to-r from-safford-400 via-white to-green-400">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  🏛️ Build the Preamble
                </h3>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={showNextWordHint}
                    disabled={currentPosition >= PREAMBLE_WORDS.length}
                    className="mobile-game-button px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors disabled:opacity-50 min-h-[40px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    💡 <span className="hidden sm:inline">Show Next Word</span><span className="sm:hidden">Next</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="mobile-game-button px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors min-h-[40px]"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <RotateCcw size={14} className="sm:w-4 sm:h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Current Position Indicator - Mobile Optimized */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-orange-100 via-white to-green-100 rounded-lg border-l-4 border-orange-500">
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                  <strong>Position {currentPosition + 1} of {PREAMBLE_WORDS.length}:</strong> 
                  {currentPosition < PREAMBLE_WORDS.length 
                    ? ` Place the word that comes next in the Preamble` 
                    : ' All words placed!'}
                </p>
              </div>

              {/* Word Slots - Mobile Optimized */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {PREAMBLE_WORDS.map((expectedWord, index) => {
                  const placedWord = placedWords[index];
                  const isNext = index === currentPosition;
                  const isCorrect = placedWord?.isCorrect;
                  
                  return (
                    <motion.div
                      key={index}
                      className={`mobile-game-button min-h-[50px] sm:min-h-[60px] p-2 sm:p-3 rounded-lg border-2 flex items-center justify-center text-center transition-all duration-300 cursor-pointer text-xs sm:text-sm ${
                        isNext 
                          ? selectedWord
                            ? 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-600 hover:shadow-lg' 
                            : 'border-blue-500 bg-blue-50 border-dashed'
                          : placedWord 
                            ? isCorrect 
                              ? 'border-green-500 bg-green-100' 
                              : 'border-red-500 bg-red-100'
                            : 'border-gray-300 bg-gray-50 border-dashed'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                      whileHover={isNext && selectedWord ? { scale: 1.05 } : {}}
                      whileTap={isNext && selectedWord ? { scale: 0.95 } : {}}
                      onClick={() => handleSlotClick(index)}
                    >
                      {placedWord ? (
                        <div className="relative group">
                          <span className={`font-semibold ${
                            isCorrect ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {placedWord.text}
                          </span>
                          {index < currentPosition && (
                            <motion.button
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeWord(index);
                              }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </motion.button>
                          )}
                        </div>
                      ) : (
                        <span className={`text-sm ${
                          isNext 
                            ? selectedWord 
                              ? 'text-yellow-600 font-medium animate-pulse' 
                              : 'text-blue-600 font-medium'
                            : 'text-gray-400'
                        }`}>
                          {isNext ? (selectedWord ? 'Tap here!' : 'Next') : `${index + 1}`}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Complete Preamble Display */}
              {currentPosition === PREAMBLE_WORDS.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-6 bg-gradient-to-r from-orange-100 via-white to-green-100 rounded-lg border-2 border-orange-300"
                >
                  <h4 className="text-lg font-bold text-gray-800 mb-3 text-center">
                    🎊 Complete Preamble:
                  </h4>
                  <p className="text-lg text-center font-serif leading-relaxed text-gray-800">
                    {PREAMBLE_WORDS.join(' ')}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Feedback Message */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg text-white font-medium z-50 ${
              feedback.type === 'success' ? 'bg-green-500' :
              feedback.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Animation */}
      <AnimatePresence>
        {celebrationVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <div className="text-8xl">🎉</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-4">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -100, opacity: 0 }}
                    transition={{ duration: 2, delay: i * 0.1 }}
                    className="text-4xl"
                  >
                    {['🇮🇳', '✨', '⭐', '🎊', '🌟', '💫'][i]}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Educational Popup Modal */}
      <AnimatePresence>
        {showEducationalPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEducationalPopup(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className={`bg-gradient-to-br ${showEducationalPopup.color} rounded-xl shadow-2xl p-8 max-w-md w-full text-white`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-3xl font-bold mb-4">{showEducationalPopup.title}</h2>
                <p className="text-lg mb-4 leading-relaxed">
                  {showEducationalPopup.description}
                </p>
                <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-2">💡 Think of it like this:</h3>
                  <p className="text-sm italic">
                    {showEducationalPopup.example}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEducationalPopup(null)}
                  className="bg-white text-gray-800 font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Got it! 🚀
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Completed Modal */}
      <AnimatePresence>
        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4"
            >
              <div className="text-center">
                <div className="text-8xl mb-6">🇮🇳</div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
                  Preamble Complete!
                </h2>
                <p className="text-gray-600 mb-6">
                  Congratulations! You've successfully built the Preamble of the Indian Constitution!
                </p>
                
                <div className="bg-gradient-to-r from-orange-100 via-white to-green-100 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{score}</div>
                      <div className="text-sm text-blue-800">Final Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{formatTime(timeElapsed)}</div>
                      <div className="text-sm text-green-800">Time Taken</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{Math.round(accuracy)}%</div>
                      <div className="text-sm text-purple-800">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">{hintsUsed}</div>
                      <div className="text-sm text-orange-800">Hints Used</div>
                    </div>
                  </div>
                </div>

                {/* Rewards Earned */}
                {finalScoreData?.coinsEarned !== undefined && (
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
                          <span className="font-bold text-yellow-600">{finalScoreData.coinsEarned}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Experience Points:</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-purple-500" />
                          <span className="font-bold text-purple-600">{finalScoreData.experienceGained}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {score === highScore && score > 0 && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
                    <span className="text-yellow-800 text-lg font-semibold">🏆 New High Score!</span>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-blue-800 mb-2">🌟 What you learned:</h3>
                  <p className="text-blue-700 text-sm">
                    The Preamble establishes India's identity as a sovereign, socialist, secular, democratic republic. 
                    These principles guide our Constitution and our nation!
                  </p>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="flex-1 bg-gradient-to-r from-orange-500 via-blue-500 to-green-500 hover:from-orange-600 hover:via-blue-600 hover:to-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    🔄 Play Again
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    🏠 Home
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PreambleBuilderGame;