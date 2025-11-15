import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../../types/gamification';
import { PointCalculator, GamePerformance } from '../../lib/pointCalculator';
import { Coins, Star } from 'lucide-react';

// Types for the game
interface Right {
  id: string;
  title: string;
  description: string;
  category: 'political' | 'economic' | 'cultural' | 'social';
  emoji: string;
  color: string;
}

interface DragItem {
  id: string;
  right: Right;
  isDragging?: boolean;
}

interface DropResult {
  isCorrect: boolean;
  message: string;
  color: string;
}

// Game categories
const categories = [
  { id: 'political', name: 'Political Rights', color: 'bg-gradient-to-br from-blue-400 to-blue-600', hoverColor: 'bg-gradient-to-br from-blue-300 to-blue-500', icon: '🏛️' },
  { id: 'economic', name: 'Economic Rights', color: 'bg-gradient-to-br from-green-400 to-green-600', hoverColor: 'bg-gradient-to-br from-green-300 to-green-500', icon: '💰' },
  { id: 'cultural', name: 'Cultural Rights', color: 'bg-gradient-to-br from-purple-400 to-purple-600', hoverColor: 'bg-gradient-to-br from-purple-300 to-purple-500', icon: '🎭' },
  { id: 'social', name: 'Social Rights', color: 'bg-gradient-to-br from-orange-400 to-orange-600', hoverColor: 'bg-gradient-to-br from-orange-300 to-orange-500', icon: '👥' },
];

// 6 Fundamental Rights with child-friendly descriptions
const fundamentalRights: Right[] = [
  {
    id: 'equality',
    title: 'Right to Equality',
    description: 'Everyone is equal and should be treated fairly, no matter who they are!',
    category: 'political',
    emoji: '⚖️',
    color: 'bg-gradient-to-r from-blue-400 to-blue-600',
  },
  {
    id: 'freedom',
    title: 'Right to Freedom',
    description: 'You can speak, think, and believe what you want, as long as it doesn\'t hurt others!',
    category: 'political',
    emoji: '🕊️',
    color: 'bg-gradient-to-r from-cyan-400 to-cyan-600',
  },
  {
    id: 'exploitation',
    title: 'Right Against Exploitation',
    description: 'No one can force you to work hard or treat you badly!',
    category: 'economic',
    emoji: '🛡️',
    color: 'bg-gradient-to-r from-green-400 to-green-600',
  },
  {
    id: 'religion',
    title: 'Right to Freedom of Religion',
    description: 'You can follow any religion or belief that makes you happy!',
    category: 'cultural',
    emoji: '🕌',
    color: 'bg-gradient-to-r from-purple-400 to-purple-600',
  },
  {
    id: 'education',
    title: 'Right to Education',
    description: 'Every child has the right to go to school and learn new things!',
    category: 'social',
    emoji: '📚',
    color: 'bg-gradient-to-r from-orange-400 to-orange-600',
  },
  {
    id: 'constitutional',
    title: 'Right to Constitutional Remedies',
    description: 'If someone breaks your rights, you can ask the court for help!',
    category: 'social',
    emoji: '⚖️',
    color: 'bg-gradient-to-r from-pink-400 to-pink-600',
  },
];

interface ScoreData {
  score: number;
  accuracy: number;
  timeTaken: number;
  completed: boolean;
  date: string;
  coinsEarned?: number;
  experienceGained?: number;
}

interface RightsPuzzleGameProps {
  userProfile?: UserProfile;
  onGameComplete?: (scoreData: ScoreData) => void;
  onProgressUpdate?: (progressData: any) => void;
  onBack?: () => void;
  initialProgress?: any;
  sessionId?: string;
}

const RightsPuzzleGame: React.FC<RightsPuzzleGameProps> = ({ 
  userProfile, 
  onGameComplete,
  onProgressUpdate,
  onBack,
  initialProgress,
  sessionId
}) => {
  // Game state
  const [selectedItem, setSelectedItem] = useState<DragItem | null>(null);
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [feedback, setFeedback] = useState<DropResult | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [availableRights, setAvailableRights] = useState<Right[]>(fundamentalRights);
  const [finalScoreData, setFinalScoreData] = useState<ScoreData | null>(null);

  // Load high score function
  const loadHighScore = useCallback(async () => {
    try {
      const request = indexedDB.open('ConstitutionLearningDB', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['highScores'], 'readonly');
        const store = transaction.objectStore('highScores');
        const getRequest = store.get('rightsPuzzle');
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            setHighScore(getRequest.result.score);
          }
        };
      };
    } catch (error) {
      // Fallback to localStorage
      const savedHighScore = localStorage.getItem('rightsPuzzleHighScore');
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore, 10));
      }
    }
  }, []);

  // Load high score on component mount
  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  // Load initial progress if provided
  useEffect(() => {
    if (initialProgress) {
      if (initialProgress.score !== undefined) setScore(initialProgress.score);
      if (initialProgress.gameCompleted !== undefined) setGameCompleted(initialProgress.gameCompleted);
      if (initialProgress.placedItems) setPlacedItems(initialProgress.placedItems);
      if (initialProgress.attempts !== undefined) setAttempts(initialProgress.attempts);
      if (initialProgress.timeElapsed !== undefined) setTimeElapsed(initialProgress.timeElapsed);
      if (initialProgress.gameStarted !== undefined) setGameStarted(initialProgress.gameStarted);
    }
  }, [initialProgress]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - (startTime || Date.now())) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted, startTime]);

  // Sound effects
  const playSuccessSound = useCallback(() => {
    try {
      // Create a simple success sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5 note
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5 note
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5 note
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  const playErrorSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, []);

  // IndexedDB storage
  const saveGameData = useCallback(async (scoreData: ScoreData) => {
    try {
      // Use the existing localStorage as fallback and attempt IndexedDB
      localStorage.setItem('lastGameResult', JSON.stringify(scoreData));
      
      // Try IndexedDB if available
      const request = indexedDB.open('ConstitutionLearningDB', 1);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('gameResults')) {
          db.createObjectStore('gameResults', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('highScores')) {
          db.createObjectStore('highScores', { keyPath: 'id' });
        }
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['gameResults'], 'readwrite');
        const store = transaction.objectStore('gameResults');
        store.add({ ...scoreData, gameType: 'rightsPuzzle' });
        
        // Save high score separately
        const highScoreTransaction = db.transaction(['highScores'], 'readwrite');
        const highScoreStore = highScoreTransaction.objectStore('highScores');
        highScoreStore.put({ id: 'rightsPuzzle', score: scoreData.score, date: scoreData.date });
      };
    } catch (error) {
      console.log('Storage not available, using localStorage fallback');
    }
  }, []);



  // Save high score
  const saveHighScore = useCallback((newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('rightsPuzzleHighScore', newScore.toString());
      
      // Save to IndexedDB
      try {
        const request = indexedDB.open('ConstitutionLearningDB', 1);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['highScores'], 'readwrite');
          const store = transaction.objectStore('highScores');
          store.put({ id: 'rightsPuzzle', score: newScore, date: new Date().toISOString() });
        };
      } catch (error) {
        console.log('IndexedDB not available');
      }
    }
  }, [highScore]);

  // Calculate final score
  const calculateScore = useCallback((accuracy: number, time: number) => {
    const baseScore = Math.round(accuracy * 100);
    const timeBonus = Math.max(0, 60 - time) * 2; // Bonus for faster completion
    return Math.round(baseScore + timeBonus);
  }, []);

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setStartTime(Date.now());
    setPlacedItems({});
    setScore(0);
    setTimeElapsed(0);
    setFeedback(null);
    setCelebrationVisible(false);
    
    // Update progress
    const progressData = {
      gameStarted: true,
      placedItems: {},
      score: 0,
      timeElapsed: 0
    };
    onProgressUpdate?.(progressData);
    setAttempts(0);
    setAvailableRights([...fundamentalRights]);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setPlacedItems({});
    setScore(0);
    setTimeElapsed(0);
    setFeedback(null);
    setCelebrationVisible(false);
    setAttempts(0);
    setAvailableRights([...fundamentalRights]);
  };

  // Mobile-friendly touch handlers (replaces drag-and-drop)
  const handleRightClick = (right: Right) => {
    if (placedItems[right.id]) return; // Already placed
    setSelectedItem(selectedItem?.id === right.id ? null : { id: right.id, right });
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!selectedItem || placedItems[selectedItem.id]) return;

    const correct = selectedItem.right.category === categoryId;
    setAttempts(prev => prev + 1);

    // Show feedback
    if (correct) {
      setPlacedItems(prev => ({ ...prev, [selectedItem.id]: categoryId }));
      setAvailableRights(prev => prev.filter(right => right.id !== selectedItem.id));
      setFeedback({
        isCorrect: true,
        message: `Correct! ${selectedItem.right.title} belongs to ${categories.find(c => c.id === categoryId)?.name}`,
        color: 'bg-green-500'
      });
      setScore(prev => prev + 25);
      setCelebrationVisible(true);
      playSuccessSound();
      setTimeout(() => setCelebrationVisible(false), 1500);
      
      // Update progress
      const progressData = {
        score: score + 25,
        placedItems,
        attempts: attempts + 1
      };
      onProgressUpdate?.(progressData);
    } else {
      setFeedback({
        isCorrect: false,
        message: `Try again! ${selectedItem.right.title} doesn't belong here.`,
        color: 'bg-red-500'
      });
      setScore(prev => Math.max(0, prev - 10));
      playErrorSound();
      
      // Update progress
      const progressData = {
        score: Math.max(0, score - 10),
        attempts: attempts + 1
      };
      onProgressUpdate?.(progressData);
    }

    setSelectedItem(null);
    setTimeout(() => setFeedback(null), 3000);

    // Check if game is completed
    if (correct && Object.keys(placedItems).length + 1 === fundamentalRights.length) {
      setGameCompleted(true);
      const finalAccuracy = ((Object.keys(placedItems).length + 1) / (attempts + 1)) * 100;
      const finalScore = calculateScore(finalAccuracy, timeElapsed);
      setScore(finalScore);
      saveHighScore(finalScore);
      
      // Update progress with final state
      const progressData = {
        gameCompleted: true,
        finalScore,
        placedItems,
        timeElapsed
      };
      onProgressUpdate?.(progressData);

      // Calculate standardized points using PointCalculator
      const performance: GamePerformance = {
        score: finalScore,
        accuracy: finalAccuracy,
        timeSpent: timeElapsed,
        perfectGame: finalAccuracy === 100,
        hintsUsed: 0, // Rights puzzle doesn't have hints
        difficulty: 'medium', // Can be made dynamic based on performance
        gameType: 'rights_puzzle'
      };

      const pointResult = PointCalculator.calculateGamePoints(
        performance,
        userProfile,
        userProfile?.currentStreak
      );

      // Save game data
      const scoreData: ScoreData = {
        score: finalScore,
        accuracy: finalAccuracy,
        timeTaken: timeElapsed,
        completed: true,
        date: new Date().toISOString(),
        coinsEarned: pointResult.coinsEarned,
        experienceGained: pointResult.experienceGained
      };
      saveGameData(scoreData);
      
      // Store final score data for modal display
      setFinalScoreData(scoreData);

      // Call completion callback if provided
      if (onGameComplete) {
        onGameComplete(scoreData);
      }
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get game progress
  const progress = (Object.keys(placedItems).length / fundamentalRights.length) * 100;
  const accuracy = attempts > 0 ? (Object.keys(placedItems).length / attempts) * 100 : 0;

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 min-h-screen">
      {/* Header with Back Button - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        {onBack && (
          <button
            onClick={onBack}
            className="mobile-game-button p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md transition-all duration-200 min-h-[44px]"
            style={{ touchAction: 'manipulation' }}
          >
            <span className="text-sm sm:text-base">← Back to Games</span>
          </button>
        )}
        <div className="flex-1 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2"
          >
            🧩 Rights Puzzle Game
          </motion.h1>
          <p className="text-gray-600 text-sm sm:text-lg leading-relaxed">
            Drag the rights to their correct categories!
          </p>
        </div>
        <div className="hidden sm:block w-32"></div> {/* Spacer for center alignment */}
      </div>

      {/* Game Stats - Mobile Optimized */}
      {gameStarted && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mobile-game-card bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6"
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4 text-center">
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-lg p-2 sm:p-3 border border-red-200">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{score}</div>
              <div className="text-xs sm:text-sm text-red-800">🎯 Score</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-2 sm:p-3 border border-blue-200">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
              <div className="text-xs sm:text-sm text-blue-800">⏱️ Time</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-2 sm:p-3 border border-purple-200">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{Math.round(accuracy)}%</div>
              <div className="text-xs sm:text-sm text-purple-800">🎯 Accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-2 sm:p-3 border border-green-200">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{Math.round(progress)}%</div>
              <div className="text-xs sm:text-sm text-green-800">🚀 Progress</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
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
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Learn About Rights?</h2>
            <p className="text-gray-600 mb-6">
              Tap to select a fundamental right, then tap the correct category to place it. 
              Learn while you play!
            </p>
            {highScore > 0 && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
                <span className="text-yellow-800">🏆 Best Score: {highScore}</span>
              </div>
            )}
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 hover:from-red-500 hover:via-yellow-500 hover:via-green-500 hover:via-blue-500 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 hover:shadow-xl shadow-lg animate-pulse"
            >
              🎮 Start Game
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Rights - Mobile Optimized */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="mobile-game-card bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
                🧩 Puzzle Pieces
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <AnimatePresence>
                  {availableRights.map((right) => (
                    <motion.div
                      key={right.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRightClick(right)}
                      className={`mobile-game-button ${right.color} p-3 sm:p-4 rounded-lg shadow-md cursor-pointer text-white transition-all duration-200 hover:shadow-lg hover:brightness-110 min-h-[56px] sm:min-h-[64px] ${
                        selectedItem?.id === right.id ? 'ring-2 sm:ring-4 ring-yellow-400 ring-offset-1 sm:ring-offset-2 scale-105' : ''
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">{right.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm line-clamp-1">{right.title}</h4>
                          <p className="text-[10px] sm:text-xs opacity-90 line-clamp-2">{right.description}</p>
                        </div>
                        {selectedItem?.id === right.id && (
                          <span className="text-yellow-300 text-lg sm:text-xl animate-pulse">✓</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {selectedItem && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-xs sm:text-sm text-yellow-800"
                >
                  <strong>{selectedItem.right.title}</strong> selected. Tap a category to place it!
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Category Drop Zones - Mobile Optimized */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  className={`mobile-game-button ${category.color} rounded-lg shadow-lg p-4 sm:p-6 min-h-[160px] sm:min-h-[200px] transition-all duration-300 cursor-pointer ${
                    selectedItem ? 'ring-2 ring-yellow-300 hover:ring-4' : ''
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="text-center mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl mb-2 block">{category.icon}</span>
                    <h3 className="text-white font-bold text-base sm:text-lg line-clamp-1">{category.name}</h3>
                    {selectedItem && (
                      <p className="text-white text-xs mt-1 opacity-80">Tap here to place</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 min-h-[80px] sm:min-h-[100px]">
                    {Object.entries(placedItems)
                      .filter(([, categoryId]) => categoryId === category.id)
                      .map(([rightId]) => {
                        const right = fundamentalRights.find(r => r.id === rightId);
                        if (!right) return null;
                        
                        return (
                          <motion.div
                            key={rightId}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white bg-opacity-20 backdrop-blur-sm p-2 sm:p-3 rounded-lg text-white"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm sm:text-base">{right.emoji}</span>
                              <span className="font-semibold text-xs sm:text-sm line-clamp-1">{right.title}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    
                    {/* Drop zone indicator - Mobile Optimized */}
                    {Object.values(placedItems).filter(cat => cat === category.id).length === 0 && (
                      <div className="border-2 border-dashed border-white border-opacity-50 rounded-lg p-3 sm:p-4 flex items-center justify-center min-h-[50px] sm:min-h-[60px]">
                        <span className="text-white text-opacity-70 text-xs sm:text-sm text-center">
                          {selectedItem ? 'Tap to place here' : 'Place rights here'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
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
            className={`${feedback.color} text-white p-4 rounded-lg shadow-lg mt-6 text-center`}
          >
            <span className="font-semibold">{feedback.message}</span>
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
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="text-6xl animate-bounce">🎉</div>
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -100, opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute text-4xl"
            >
              ✨
            </motion.div>
            <motion.div
              initial={{ x: 0, opacity: 1 }}
              animate={{ x: 100, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="absolute left-10 text-3xl"
            >
              🌟
            </motion.div>
            <motion.div
              initial={{ x: 0, opacity: 1 }}
              animate={{ x: -100, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.4 }}
              className="absolute right-10 text-3xl"
            >
              💫
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.1 }}
              className="absolute text-5xl"
            >
              🎊
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎊</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Congratulations!</h2>
                <p className="text-gray-600 mb-6">
                  You've successfully completed the Rights Puzzle Game!
                </p>
                
                <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
                      <div className="text-2xl font-bold text-red-600">{score}</div>
                      <div className="text-sm text-red-800">🏆 Final Score</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                      <div className="text-sm text-blue-800">⏱️ Time Taken</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">{Math.round(accuracy)}%</div>
                      <div className="text-sm text-purple-800">🎯 Accuracy</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="text-2xl font-bold text-green-600">{highScore}</div>
                      <div className="text-sm text-green-800">🏅 High Score</div>
                    </div>
                  </div>
                </div>

                {/* Rewards Earned */}
                {typeof finalScoreData?.coinsEarned === 'number' && (
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
                    <span className="text-yellow-800">🏆 New High Score!</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={startGame}
                    className="flex-1 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 hover:from-red-500 hover:via-yellow-500 hover:via-green-500 hover:via-blue-500 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
                  >
                    🔄 Play Again
                  </button>
                  <button
                    onClick={resetGame}
                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg"
                  >
                    🏠 Home
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RightsPuzzleGame;