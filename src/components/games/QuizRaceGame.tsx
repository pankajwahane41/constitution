import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '../../types';
import { UserProfile } from '../../types/gamification';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { useSound } from '../../hooks/useSound';
import { useToast } from '../../hooks/use-toast';
import { loadQuizData } from '../../lib/utils';
import { PointCalculator, QuizPerformance } from '../../lib/pointCalculator';
import { Trophy, Clock, Coins, Zap, Car, Flag, Star, Target } from 'lucide-react';

interface QuizRaceGameProps {
  questions: Question[];
  userProfile: UserProfile | null;
  onGameComplete: (results: RaceResults) => void;
  onBack: () => void;
}

interface RacePosition {
  progress: number; // 0-100
  lap: number;
  totalLaps: number;
}

interface QuestionState {
  question: Question;
  startTime: number;
  timeLeft: number;
  selectedAnswer: number | null;
  isAnswered: boolean;
  isCorrect: boolean;
}

interface RaceResults {
  totalTime: number;
  correctAnswers: number;
  totalQuestions: number;
  averageResponseTime: number;
  coinsEarned: number;
  experienceGained: number;
  highestStreak: number;
  finalPosition: RacePosition;
  isNewRecord: boolean;
  achievements: string[];
}

interface LeaderboardEntry {
  time: number;
  correctAnswers: number;
  accuracy: number;
  date: string;
  playerName: string;
}

const TOTAL_LAPS = 3;
const TRACK_LENGTH = 100;
const BASE_TIME_PER_QUESTION = 10000; // 10 seconds
const CORRECT_ANSWER_DISTANCE = 20;
// Note: STREAK_BONUS_MULTIPLIER and SPEED_BONUS_THRESHOLD are now handled by unified PointCalculator

const CONGRATULATORY_MESSAGES = [
  "🚀 Lightning fast! You're racing through the constitution!",
  "🏆 Amazing speed! Dr. Ambedkar would be proud!",
  "⚡ Incredible! You're becoming a constitutional champion!",
  "🏁 Fantastic! You're crossing the finish line of knowledge!",
  "🌟 Superb! Your constitutional knowledge is racing ahead!",
  "🏆 Brilliant! You're neck and neck with constitutional experts!",
  "🚀 Wow! Your understanding is lapping the competition!",
  "🏅 Excellent! You're winning this constitutional race!",
  "🎯 Perfect! Constitutional mastery at full speed!",
  "💨 Amazing! You're zooming past constitutional challenges!",
  "🎪 Spectacular! Dr. Ambedkar's spirit is guiding you!",
  "⭐ Fantastic! Your knowledge is accelerating!",
];

const ENCOURAGING_MESSAGES = [
  "Keep going! Every answer brings you closer to victory!",
  "Don't give up! The constitution awaits your mastery!",
  "Stay focused! You're building constitutional knowledge!",
  "You've got this! The next question is waiting!",
  "Push forward! Your constitutional journey continues!",
  "You're learning! Every question makes you stronger!",
  "Great effort! The constitution believes in you!",
  "Keep racing! Your journey to constitutional wisdom continues!",
  "You're doing great! The track to knowledge awaits!",
];

const RACING_COLORS = {
  primary: '#ff6b35', // Orange
  secondary: '#004e89', // Navy
  success: '#11999e', // Teal
  warning: '#f39c12', // Yellow
  danger: '#e74c3c', // Red
  track: '#2c3e50', // Dark gray
  lane: '#34495e', // Lighter gray
};

export const QuizRaceGame: React.FC<QuizRaceGameProps> = ({
  questions,
  userProfile,
  onGameComplete,
  onBack,
}) => {
  const [gameState, setGameState] = useState<'intro' | 'racing' | 'finished'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [racePosition, setRacePosition] = useState<RacePosition>({
    progress: 0,
    lap: 1,
    totalLaps: TOTAL_LAPS,
  });
  const [questionState, setQuestionState] = useState<QuestionState | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [averageResponseTime, setAverageResponseTime] = useState(0);
  const [backgroundSpeed, setBackgroundSpeed] = useState(1);
  const [speedEffect, setSpeedEffect] = useState(false);
  const [trackShake, setTrackShake] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { playSound } = useSound();
  const { toast } = useToast();

  // Load leaderboard from localStorage
  useEffect(() => {
    const savedLeaderboard = localStorage.getItem('constitution_quiz_race_leaderboard');
    if (savedLeaderboard) {
      setLeaderboard(JSON.parse(savedLeaderboard));
    }
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  // Get random unused question
  const getRandomQuestion = useCallback((): Question | null => {
    const availableQuestions = questions.filter(
      (q, index) => !usedQuestions.has(index)
    );
    
    if (availableQuestions.length === 0) {
      // Reset used questions if all have been used
      setUsedQuestions(new Set());
      return questions[0] || null;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    const originalIndex = questions.findIndex(q => q === selectedQuestion);
    
    setUsedQuestions(prev => new Set([...prev, originalIndex]));
    return selectedQuestion;
  }, [questions, usedQuestions]);

  // Start game
  const startGame = () => {
    setGameState('racing');
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    
    const firstQuestion = getRandomQuestion();
    if (firstQuestion) {
      setQuestionState({
        question: firstQuestion,
        startTime: Date.now(),
        timeLeft: BASE_TIME_PER_QUESTION,
        selectedAnswer: null,
        isAnswered: false,
        isCorrect: false,
      });
    }

    // Start question timer
    timerRef.current = setInterval(() => {
      setQuestionState(prev => {
        if (!prev || prev.isAnswered) return prev;
        
        const newTimeLeft = BASE_TIME_PER_QUESTION - (Date.now() - prev.startTime);
        
        if (newTimeLeft <= 0) {
          // Time's up - auto submit wrong answer
          handleAnswer(-1, true);
          return prev;
        }
        
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 100);
  };

  // Handle answer selection
  const handleAnswer = useCallback((selectedOption: number, isTimeout = false) => {
    if (!questionState || questionState.isAnswered) return;

    const responseTime = Date.now() - questionStartTime;
    const isCorrect = selectedOption === questionState.question.correct_answer;
    
    setQuestionState(prev => prev ? {
      ...prev,
      selectedAnswer: selectedOption,
      isAnswered: true,
      isCorrect,
    } : null);

    // Update statistics
    setCorrectAnswers(prev => isCorrect ? prev + 1 : prev);
    setCurrentStreak(prev => isCorrect ? prev + 1 : 0);
    setHighestStreak(prev => Math.max(prev, isCorrect ? currentStreak + 1 : prev));
    
    // Note: Points are calculated using unified PointCalculator at game completion
    // Individual question rewards are removed for consistency

    // Update race position with enhanced effects
    if (isCorrect) {
      const progressIncrease = CORRECT_ANSWER_DISTANCE + (currentStreak * 2);
      setRacePosition(prev => {
        const newProgress = Math.min(prev.progress + progressIncrease, TRACK_LENGTH);
        const newLap = newProgress >= TRACK_LENGTH ? prev.lap + 1 : prev.lap;
        
        return {
          ...prev,
          progress: newProgress >= TRACK_LENGTH ? 0 : newProgress,
          lap: newLap,
        };
      });

      // Add speed effects
      setSpeedEffect(true);
      setBackgroundSpeed(prev => Math.min(prev + 0.5, 3));
      setTrackShake(true);
      
      // Reset speed effects after animation
      setTimeout(() => {
        setSpeedEffect(false);
        setBackgroundSpeed(1);
        setTrackShake(false);
      }, 500);
    }

    // Play sounds and show enhanced feedback
    if (isCorrect) {
      playSound('correct');
      const randomMessage = CONGRATULATORY_MESSAGES[
        Math.floor(Math.random() * CONGRATULATORY_MESSAGES.length)
      ];
      setCelebrationMessage(randomMessage);
      setShowCelebration(true);
      
      // Additional celebration for streaks
      if (currentStreak > 0 && currentStreak % 3 === 0) {
        setTimeout(() => {
          toast({
            title: "🔥 Streak Bonus!",
            description: `${currentStreak} in a row! You're on fire!`,
            duration: 3000,
          });
        }, 1000);
      }
    } else {
      playSound('incorrect');
    }

    // Calculate average response time
    const newTotalTime = totalTime + responseTime;
    const newAnswerCount = correctAnswers + 1;
    setAverageResponseTime(newTotalTime / newAnswerCount);

    // Show toast feedback
    if (isCorrect) {
      const encouragement = CONGRATULATORY_MESSAGES[
        Math.floor(Math.random() * CONGRATULATORY_MESSAGES.length)
      ];
      toast({
        title: "Correct! 🏆",
        description: encouragement,
        duration: 2000,
      });
    } else {
      const randomEncouragement = ENCOURAGING_MESSAGES[
        Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)
      ];
      toast({
        title: "Incorrect 😔",
        description: randomEncouragement,
        duration: 3000,
      });
    }

    // Clear question timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Move to next question after a short delay
    setTimeout(() => {
      setShowCelebration(false);
      moveToNextQuestion();
    }, 2000);
  }, [questionState, currentStreak, questionStartTime, totalTime, correctAnswers, playSound, toast]);

  // Move to next question
  const moveToNextQuestion = () => {
    if (racePosition.lap > TOTAL_LAPS) {
      // Race finished
      finishGame();
      return;
    }

    const nextQuestion = getRandomQuestion();
    if (nextQuestion) {
      setQuestionState({
        question: nextQuestion,
        startTime: Date.now(),
        timeLeft: BASE_TIME_PER_QUESTION,
        selectedAnswer: null,
        isAnswered: false,
        isCorrect: false,
      });
      setQuestionStartTime(Date.now());
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Finish game
  const finishGame = () => {
    setGameState('finished');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }

    const totalGameTime = Date.now() - startTime;
    const accuracy = correctAnswers / currentQuestionIndex;

    // Calculate coins and experience using standardized PointCalculator
    const performance: QuizPerformance = {
      totalQuestions: currentQuestionIndex,
      correctAnswers: correctAnswers,
      perfectScore: accuracy >= 0.9 && totalGameTime < 180000,
      responseTime: totalGameTime / currentQuestionIndex,
      timeSpent: totalGameTime / 1000,
      hintsUsed: 0
    };
    
    const pointResult = PointCalculator.calculateQuizPoints(
      performance,
      userProfile,
      highestStreak
    );

    const coinsEarned = pointResult.coinsEarned;
    const experienceGained = pointResult.experienceGained;

    // Check for new record
    const newEntry: LeaderboardEntry = {
      time: totalGameTime,
      correctAnswers,
      accuracy,
      date: new Date().toISOString(),
      playerName: userProfile?.displayName || 'Anonymous',
    };

    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => a.time - b.time)
      .slice(0, 10); // Keep top 10

    const isNewRecord = !leaderboard.some(entry => entry.time > totalGameTime);
    
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('constitution_quiz_race_leaderboard', JSON.stringify(updatedLeaderboard));

    const results: RaceResults = {
      totalTime: totalGameTime,
      correctAnswers,
      totalQuestions: currentQuestionIndex,
      averageResponseTime,
      coinsEarned,
      experienceGained,
      highestStreak,
      finalPosition: racePosition,
      isNewRecord,
      achievements: [], // Add achievement logic here
    };

    setTimeout(() => {
      onGameComplete(results);
    }, 1000);
  };

  // Format time display
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  // Get timer color based on time left
  const getTimerColor = (timeLeft: number): string => {
    const percentage = timeLeft / BASE_TIME_PER_QUESTION;
    if (percentage > 0.6) return RACING_COLORS.success;
    if (percentage > 0.3) return RACING_COLORS.warning;
    return RACING_COLORS.danger;
  };

  // Render intro screen - Mobile Optimized
  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 p-3 sm:p-4 flex items-center justify-center relative overflow-hidden">
        {/* Racing background effect - Reduced for mobile performance */}
        <div className="absolute inset-0 hidden sm:block">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-64 h-1 bg-white opacity-10 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 60 - 30}deg)`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        
        <Card className="mobile-game-card max-w-2xl w-full p-4 sm:p-8 text-center relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl">
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <Car className="w-16 h-16 sm:w-24 sm:h-24 text-orange-500 animate-bounce" />
                {/* Racing trail effect */}
                <div className="absolute inset-0 -z-10 animate-pulse">
                  <div className="w-20 h-2 sm:w-32 sm:h-4 bg-orange-300 opacity-30 blur-sm rounded-full" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              🏁 Constitution Quiz Race! 🏁
            </h1>
            <p className="text-base sm:text-xl text-gray-600 mb-4 sm:mb-6 font-medium">
              Fast-paced constitutional racing! Answer questions quickly to speed through the track!
            </p>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-2 sm:p-3 rounded-lg mb-4 sm:mb-6">
              <p className="font-bold text-sm sm:text-lg">
                🚀 New Features: Enhanced Speed Effects, Dynamic Backgrounds, Combo Multipliers! 🚀
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-6 sm:mb-8">
            <div className="mobile-game-card bg-orange-100 p-3 sm:p-4 rounded-lg border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1 sm:mb-2" />
              <h3 className="font-bold text-sm sm:text-lg">10 Seconds</h3>
              <p className="text-xs sm:text-sm">Per Question</p>
            </div>
            <div className="mobile-game-card bg-green-100 p-3 sm:p-4 rounded-lg border-2 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1 sm:mb-2" />
              <h3 className="font-bold text-sm sm:text-lg">3 Laps</h3>
              <p className="text-xs sm:text-sm">Constitutional Track</p>
            </div>
            <div className="mobile-game-card bg-blue-100 p-3 sm:p-4 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1 sm:mb-2" />
              <h3 className="font-bold text-sm sm:text-lg">10-75 Coins</h3>
              <p className="text-xs sm:text-sm">Speed & Streak Bonuses</p>
            </div>
            <div className="mobile-game-card bg-purple-100 p-3 sm:p-4 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1 sm:mb-2" />
              <h3 className="font-bold text-sm sm:text-lg">Leaderboard</h3>
              <p className="text-xs sm:text-sm">Best Race Times</p>
            </div>
          </div>

          {/* Racing Tips - Mobile Optimized */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
            <h4 className="font-bold text-sm sm:text-base text-gray-700 mb-2">🏎️ Racing Tips:</h4>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>• Answer in under 3 seconds for speed bonus coins!</li>
              <li>• Build streaks for combo multipliers (2x, 3x, 5x)!</li>
              <li>• Watch the timer turn red when time is running out!</li>
              <li>• Finish all 3 laps to complete the race!</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={startGame}
              className="mobile-game-button w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-4 shadow-lg hover:shadow-xl active:shadow-md transition-all duration-300 min-h-[56px]"
              style={{ touchAction: 'manipulation' }}
            >
              <Car className="w-6 h-6 mr-2" />
              Start Race!
            </Button>
            <Button 
              onClick={() => setShowLeaderboard(true)}
              variant="outline"
              className="mobile-game-button w-full hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 min-h-[48px]"
              style={{ touchAction: 'manipulation' }}
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Leaderboard
            </Button>
          </div>

          {showLeaderboard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Leaderboard</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowLeaderboard(false)}
                  >
                    ×
                  </Button>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No races completed yet. Be the first! 🏆
                  </p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg flex justify-between items-center ${
                          index === 0 ? 'bg-yellow-100' : 
                          index === 1 ? 'bg-gray-100' : 
                          index === 2 ? 'bg-orange-100' : 'bg-gray-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center">
                            {index === 0 && <Trophy className="w-4 h-4 mr-1 text-yellow-500" />}
                            #{index + 1} {entry.playerName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {entry.correctAnswers}/{currentQuestionIndex} correct • {Math.round(entry.accuracy * 100)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatTime(entry.time)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Render racing screen
  if (gameState === 'racing' && questionState) {
    const progressPercentage = (racePosition.progress / TRACK_LENGTH) * 100;
    const timerPercentage = (questionState.timeLeft / BASE_TIME_PER_QUESTION) * 100;

    // Dynamic background based on progress and speed
    const getBackgroundClass = () => {
      if (speedEffect) return 'animate-pulse bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500';
      if (racePosition.lap === 1) return 'bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900';
      if (racePosition.lap === 2) return 'bg-gradient-to-br from-purple-900 via-pink-800 to-red-900';
      return 'bg-gradient-to-br from-red-900 via-orange-800 to-yellow-800';
    };

    return (
      <div className={`min-h-screen p-2 sm:p-4 transition-all duration-500 ${getBackgroundClass()}`}>
        {/* Speed lines background effect - Reduced for mobile performance */}
        {speedEffect && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden hidden sm:block">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-32 h-1 bg-white opacity-20 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 45}deg)`,
                  animationDuration: `${0.5 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}
        
        <div className="w-full">
          {/* Enhanced Header with race info - Mobile Optimized */}
          <div className={`mobile-game-card bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 shadow-lg transition-all duration-300 ${
            speedEffect ? 'shadow-xl shadow-yellow-400/50' : ''
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 space-y-2 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="text-sm sm:text-lg font-bold flex items-center">
                  <span className="mr-1">🏁</span>
                  Lap {racePosition.lap}/{TOTAL_LAPS}
                  {racePosition.lap === TOTAL_LAPS && <span className="ml-1 text-red-500 animate-pulse">FINAL!</span>}
                </span>
                <span className="text-sm sm:text-lg">
                  Streak: <span className={`font-bold transition-all duration-300 ${
                    currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'
                  } ${currentStreak >= 3 ? 'animate-pulse' : ''}`}>{currentStreak}</span>
                </span>
                <span className="text-sm sm:text-lg flex items-center">
                  <Coins className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-500" />
                  <span className="font-bold text-green-500">+{correctAnswers * 5}</span>
                  <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">(est.)</span>
                </span>
                {/* Combo Multiplier Display */}
                {currentStreak > 0 && (
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <span className="text-xs sm:text-sm font-bold text-purple-500">
                      {currentStreak >= 10 ? '5x' : currentStreak >= 5 ? '3x' : currentStreak >= 3 ? '2x' : ''}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-medium">Question</div>
                  <div className="text-sm sm:text-lg font-bold">{currentQuestionIndex + 1}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onBack}
                  className="mobile-game-button hover:bg-red-50 hover:border-red-300 min-h-[40px] sm:min-h-[44px] min-w-[50px] sm:min-w-[60px] text-xs sm:text-sm"
                  style={{ touchAction: 'manipulation' }}
                >
                  Exit
                </Button>
              </div>
            </div>
            
            {/* Enhanced Track visualization */}
            <div className={`relative h-20 bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 ${
              trackShake ? 'animate-pulse' : ''
            } ${speedEffect ? 'shadow-lg shadow-yellow-400/50' : ''}`}>
              {/* Animated track lanes */}
              <div className="absolute inset-0 flex">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 border-r border-gray-600 transition-all duration-300 ${
                      i === 2 ? 'bg-blue-600 bg-opacity-20' : ''
                    } ${speedEffect && i === 2 ? 'bg-yellow-400 bg-opacity-40 animate-pulse' : ''}`}
                  />
                ))}
              </div>
              
              {/* Racing lines animation */}
              {speedEffect && (
                <div className="absolute inset-0">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-0.5 bg-yellow-300 opacity-60 animate-pulse"
                      style={{
                        top: `${20 + i * 20}%`,
                        animationDuration: '0.2s',
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Car position with enhanced animation */}
              <div 
                className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  speedEffect ? 'scale-110 drop-shadow-lg' : ''
                }`}
                style={{ left: `${Math.max(0, Math.min(progressPercentage, 95))}%` }}
              >
                <div className="relative">
                  <Car className={`w-10 h-10 text-yellow-400 transition-all duration-300 ${
                    speedEffect ? 'transform rotate-12 scale-110' : 'transform rotate-12'
                  }`} />
                  {/* Speed effect trail */}
                  {speedEffect && (
                    <div className="absolute inset-0 -z-10">
                      <div className="w-12 h-4 bg-yellow-300 opacity-30 blur-sm animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Finish line */}
              <div className={`absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-yellow-200 to-yellow-400 flex items-center justify-center transition-all duration-300 ${
                racePosition.lap === TOTAL_LAPS ? 'animate-pulse' : ''
              }`}>
                <Flag className={`w-8 h-8 transition-all duration-300 ${
                  racePosition.lap === TOTAL_LAPS ? 'text-yellow-600 scale-110' : 'text-gray-800'
                }`} />
              </div>
              
              {/* Lap indicators */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                {[...Array(TOTAL_LAPS)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full mb-1 transition-all duration-300 ${
                      i + 1 < racePosition.lap ? 'bg-green-400' :
                      i + 1 === racePosition.lap ? 'bg-yellow-400 animate-pulse' :
                      'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Progress indicator */}
            <Progress value={progressPercentage} className="mt-2" />
          </div>

          {/* Question card - Mobile Optimized */}
          <Card className="mobile-game-card p-4 sm:p-6 mb-3 sm:mb-4">
            {/* Timer */}
            <div className="mb-3 sm:mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium">Time Remaining</span>
                <span className="text-sm sm:text-base font-bold">
                  {Math.ceil(questionState.timeLeft / 1000)}s
                </span>
              </div>
              <Progress 
                value={timerPercentage} 
                className="h-2 sm:h-3"
                style={{
                  '--progress-background': getTimerColor(questionState.timeLeft),
                } as React.CSSProperties}
              />
            </div>

            {/* Question */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 line-height-relaxed">{questionState.question.question}</h2>
              
              {/* Options - Mobile Optimized */}
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {questionState.question.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={questionState.selectedAnswer === index ? "default" : "outline"}
                    className={`mobile-game-button p-3 sm:p-4 h-auto text-left justify-start whitespace-normal min-h-[56px] sm:min-h-[60px] text-sm sm:text-base ${
                      questionState.selectedAnswer === index
                        ? questionState.isCorrect 
                          ? 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white' 
                          : 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
                        : 'hover:bg-gray-100 active:bg-gray-200'
                    }`}
                    onClick={() => handleAnswer(index)}
                    disabled={questionState.isAnswered}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="mr-2 sm:mr-3 font-bold text-sm sm:text-base">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Feedback - Mobile Optimized */}
            {questionState.isAnswered && (
              <div className={`p-3 sm:p-4 rounded-lg ${
                questionState.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className="flex items-center mb-2">
                  {questionState.isCorrect ? (
                    <>
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="font-bold text-sm sm:text-base">Excellent!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="font-bold text-sm sm:text-base">Keep Learning!</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {questionState.question.explanation}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Enhanced Celebration modal */}
        {showCelebration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {/* Confetti effect */}
            <div className="fixed inset-0 pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-2xl animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`,
                  }}
                >
                  {['🎉', '🏆', '⭐', '🚀', '💫', '🏅'][Math.floor(Math.random() * 6)]}
                </div>
              ))}
            </div>
            
            <Card className="max-w-md w-full mx-4 p-6 text-center bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 border-2 border-yellow-300 animate-pulse">
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h2 className="text-3xl font-bold mb-2 text-orange-600">AWESOME!</h2>
              <p className="text-lg text-gray-700 font-medium">{celebrationMessage}</p>
              {currentStreak >= 3 && (
                <div className="mt-4 p-2 bg-purple-100 rounded-lg">
                  <div className="text-purple-600 font-bold">
                    🔥 {currentStreak} STREAK! 🔥
                  </div>
                  <div className="text-purple-500 text-sm">
                    Keep it going!
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Render enhanced finished screen
  if (gameState === 'finished') {
    const accuracy = (correctAnswers / currentQuestionIndex) * 100;
    const finalTime = Date.now() - startTime;
    
    // Achievement badges
    const achievements = [];
    if (accuracy >= 90) achievements.push({ icon: '🎯', title: 'Constitutional Master', description: '90%+ accuracy' });
    if (finalTime < 120000) achievements.push({ icon: '⚡', title: 'Speed Demon', description: 'Finished under 2 minutes' });
    if (highestStreak >= 5) achievements.push({ icon: '🔥', title: 'Streak Champion', description: '5+ correct in a row' });
    if (coinsEarned >= 50) achievements.push({ icon: '💰', title: 'Coin Collector', description: '50+ coins earned' });
    if (currentStreak === 0) achievements.push({ icon: '💪', title: 'Never Give Up', description: 'Completed despite challenges' });

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 p-3 sm:p-4 flex items-center justify-center relative overflow-hidden">
        {/* Celebration background effect - Reduced for mobile performance */}
        <div className="absolute inset-0 hidden sm:block">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🏆', '⭐', '🎉', '🚀', '💫', '🏅', '🎊', '✨'][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>
        
        <Card className="mobile-game-card max-w-3xl w-full p-4 sm:p-8 text-center relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="relative">
                <Flag className="w-16 h-16 sm:w-24 sm:h-24 text-purple-600 animate-bounce" />
                <div className="absolute inset-0 -z-10 animate-pulse">
                  <div className="w-20 h-2 sm:w-32 sm:h-4 bg-purple-300 opacity-30 blur-sm rounded-full" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
              Race Complete! 🏆
            </h1>
            <p className="text-base sm:text-xl text-gray-600">
              Congratulations on finishing the constitutional track!
            </p>
          </div>

          {/* Achievement badges - Mobile Optimized */}
          {achievements.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-700">🏅 Achievements Unlocked!</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="mobile-game-card bg-gradient-to-br from-yellow-100 to-orange-100 p-2 sm:p-3 rounded-lg border-2 border-yellow-300">
                    <div className="text-lg sm:text-2xl mb-1">{achievement.icon}</div>
                    <div className="font-bold text-xs sm:text-sm text-gray-700 line-clamp-1">{achievement.title}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 line-clamp-2">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Results */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-lg border-2 border-blue-300">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{formatTime(finalTime)}</div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${
              accuracy >= 80 ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300' :
              accuracy >= 60 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300' :
              'bg-gradient-to-br from-red-100 to-red-200 border-red-300'
            }`}>
              <Target className="w-8 h-8 mx-auto mb-2" style={{ 
                color: accuracy >= 80 ? '#10b981' : accuracy >= 60 ? '#f59e0b' : '#ef4444' 
              }} />
              <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-lg border-2 border-orange-300">
              <Coins className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{coinsEarned}</div>
              <div className="text-sm text-gray-600">Coins Earned</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg border-2 border-purple-300">
              <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{highestStreak}</div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </div>
          </div>

          {/* Performance summary */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-lg mb-6">
            <h3 className="font-bold text-gray-700 mb-2">📊 Race Summary:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Questions Answered:</span> {correctAnswers}/{currentQuestionIndex}
              </div>
              <div>
                <span className="font-medium">Average Response:</span> {Math.round(averageResponseTime / 1000 * 10) / 10}s
              </div>
              <div>
                <span className="font-medium">Experience Gained:</span> {Math.floor(correctAnswers * 5 + coinsEarned * 0.5)} XP
              </div>
              <div>
                <span className="font-medium">Performance:</span> {accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Keep Practicing!'}
              </div>
            </div>
          </div>

          {/* New record celebration */}
          {correctAnswers / currentQuestionIndex >= 0.9 && finalTime < 180000 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-lg mb-6 animate-pulse">
              <h3 className="text-xl font-bold mb-2">🎊 Outstanding Performance! 🎊</h3>
              <p className="text-sm">You've set a new personal record for speed and accuracy!</p>
            </div>
          )}

          <div className="space-y-4">
            <Button 
              onClick={() => {
                setGameState('intro');
                // Reset all game state
                setCurrentQuestionIndex(0);
                setRacePosition({ progress: 0, lap: 1, totalLaps: TOTAL_LAPS });
                setCurrentStreak(0);
                setHighestStreak(0);
                setCoinsEarned(0);
                setTotalTime(0);
                setCorrectAnswers(0);
                setShowCelebration(false);
                setUsedQuestions(new Set());
              }}
              className="mobile-game-button w-full bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white text-lg py-4 shadow-lg hover:shadow-xl active:shadow-md transition-all duration-300 min-h-[56px]"
              style={{ touchAction: 'manipulation' }}
            >
              Race Again!
            </Button>
            <Button 
              onClick={onBack}
              variant="outline"
              className="mobile-game-button w-full hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 min-h-[48px]"
              style={{ touchAction: 'manipulation' }}
            >
              Back to Games
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

// Wrapper component that handles data loading
interface QuizRaceGameWrapperProps {
  userProfile: UserProfile | null;
  onGameComplete: (results: RaceResults) => void;
  onBack: () => void;
  dataFileName?: string; // Optional: specify which data file to use
}

export const QuizRaceGameWrapper: React.FC<QuizRaceGameWrapperProps> = ({
  userProfile,
  onGameComplete,
  onBack,
  dataFileName = 'constitution_questions_preamble.json' // Default to preamble questions
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedQuestions = await loadQuizData(dataFileName);
        setQuestions(loadedQuestions);
      } catch (err) {
        console.error('Error loading questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [dataFileName]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Loading Race Questions...</h2>
          <p className="text-gray-600">Preparing the constitutional track for you!</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-bold mb-4 text-red-600">Error Loading Questions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onBack} variant="outline">
            Back to Games
          </Button>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-yellow-800 to-orange-900 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-bold mb-4 text-yellow-600">No Questions Available</h2>
          <p className="text-gray-600 mb-4">No questions found in the data file.</p>
          <Button onClick={onBack} variant="outline">
            Back to Games
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <QuizRaceGame
      questions={questions}
      userProfile={userProfile}
      onGameComplete={onGameComplete}
      onBack={onBack}
    />
  );
};

export default QuizRaceGameWrapper;