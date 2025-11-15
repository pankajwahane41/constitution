// Enhanced Daily Challenges Component
// Shows dynamic daily learning challenges with real-time progress tracking and UTC timing

import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, DailyChallenge, QuizSession } from '../types/gamification';
import { Target, CheckCircle, Coins, Clock, ArrowRight, Trophy, Star, Zap, Loader2 } from 'lucide-react';
import { ConstitutionDB } from '../lib/storage';
import GamificationEngine from '../lib/gamification';
import TimeSync, { DateUtils } from '../lib/timeSync';
import DailyResetService from '../lib/dailyResetService';
import { useIsMobile } from '../hooks/useIsMobile';
import { triggerCoinAnimationFromButton, triggerCoinAnimationFromPosition } from '../utils/coinAnimationUtils';

interface DailyChallengesProps {
  userProfile: UserProfile;
  onStartChallenge: (challengeType: string) => void;
  onBack: () => void;
  onProfileUpdate?: (profile: UserProfile) => void;
}

interface ChallengeProgress {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  reward: {
    coins: number;
    experience: number;
  };
  timeLeft: string;
  lastUpdated: string;
}

export default function DailyChallenges({ 
  userProfile, 
  onStartChallenge, 
  onBack, 
  onProfileUpdate 
}: DailyChallengesProps) {
  const [challenges, setChallenges] = useState<ChallengeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>('');
  const [resetStats, setResetStats] = useState<any>(null);
  const [curriculumProgress, setCurriculumProgress] = useState<any>(null);
  const [showCurriculumPrompt, setShowCurriculumPrompt] = useState(false);
  const [db] = useState(() => ConstitutionDB.getInstance());
  const [timeSync] = useState(() => TimeSync.getInstance());
  const [resetService] = useState(() => DailyResetService.getInstance(db));
  const [gamificationEngine] = useState(() => new GamificationEngine(db));
  const isMobile = useIsMobile();

  // Calculate time until midnight using UTC
  const calculateTimeUntilMidnight = useCallback(() => {
    const timeUntil = timeSync.getTimeUntilMidnight();
    return `${timeUntil.hours}h ${timeUntil.minutes}m`;
  }, [timeSync]);

  // Get today's UTC date string
  const getTodayUTCString = useCallback(() => timeSync.getCurrentUTCDate(), [timeSync]);

  // Get challenge icon based on type
  const getChallengeIcon = useCallback((type: string): string => {
    const iconMap: Record<string, string> = {
      quiz: '📝',
      story: '📚',
      reading: '📚',
      mini_game: '🎮',
      streak: '🔥',
      constitution_builder: '🏛️',
      curriculum_quiz: '🎓',
      curriculum_story: '📖',
      curriculum_mini_game: '🏆',
      curriculum_progress: '📊'
    };
    return iconMap[type] || '🎯';
  }, []);

  // Get user's quiz progress for today (UTC)
  const getTodayQuizProgress = useCallback(async (): Promise<number> => {
    try {
      const quizSessions = await db.getQuizSessions(100);
      const todayUTC = getTodayUTCString();
      
      return quizSessions.filter(session => 
        session.isComplete && 
        DateUtils.toUTCDateString(session.endTime || session.startTime) === todayUTC
      ).length;
    } catch (error) {
      console.error('Error getting quiz progress:', error);
      return 0;
    }
  }, [db, getTodayUTCString]);

  // Get user's reading progress for today (UTC)
  const getTodayReadingProgress = useCallback(async (): Promise<number> => {
    try {
      const storyProgress = await db.getGameState('story_progress');
      const todayUTC = getTodayUTCString();
      
      if (!storyProgress) return 0;
      
      // Count chapters read today
      const todayReadingSessions = storyProgress.sessions?.filter((session: any) => 
        DateUtils.toUTCDateString(session.timestamp) === todayUTC
      ) || [];
      
      return todayReadingSessions.length > 0 ? 1 : 0;
    } catch (error) {
      console.error('Error getting reading progress:', error);
      return 0;
    }
  }, [db, getTodayUTCString]);

  // Get user's mini-game progress for today (UTC)
  const getTodayGameProgress = useCallback(async (): Promise<number> => {
    try {
      const gameSessions = await db.getGameSessions(100);
      const todayUTC = getTodayUTCString();
      
      return gameSessions.filter(session => 
        session.isComplete && 
        DateUtils.toUTCDateString(session.startTime) === todayUTC
      ).length;
    } catch (error) {
      console.error('Error getting game progress:', error);
      return 0;
    }
  }, [db, getTodayUTCString]);

  // Load and generate challenges with UTC timing
  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const todayUTC = getTodayUTCString();
      
      // Get real progress data
      const [quizProgress, readingProgress, gameProgress] = await Promise.all([
        getTodayQuizProgress(),
        getTodayReadingProgress(),
        getTodayGameProgress()
      ]);

      // Generate dynamic challenges using enhanced gamification engine
      const baseChallenges = await gamificationEngine.generateDailyChallenges(userProfile);
      
      const dynamicChallenges: ChallengeProgress[] = baseChallenges.map(challenge => ({
        id: challenge.id,
        type: challenge.type,
        title: challenge.title,
        description: challenge.description,
        icon: getChallengeIcon(challenge.type),
        progress: challenge.progress,
        target: challenge.target,
        isCompleted: challenge.isCompleted,
        reward: { 
          coins: typeof challenge.reward === 'object' ? (typeof challenge.reward.value === 'number' ? challenge.reward.value : 0) : 0,
          experience: 20 
        },
        timeLeft: calculateTimeUntilMidnight(),
        lastUpdated: new Date().toISOString()
      }));

      setChallenges(dynamicChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile, getTodayQuizProgress, getTodayReadingProgress, getTodayGameProgress, calculateTimeUntilMidnight, getTodayUTCString, gamificationEngine, getChallengeIcon]);

  // Check curriculum status and progress
  const checkCurriculumStatus = useCallback(async () => {
    if (userProfile.curriculumEnabled && userProfile.curriculumStartDate) {
      try {
        const { getCurriculumProgress } = await import('../lib/curriculumConfig');
        const progress = getCurriculumProgress(userProfile.curriculumStartDate);
        setCurriculumProgress(progress);
        
        // Don't show prompt if already in curriculum
        setShowCurriculumPrompt(false);
      } catch (error) {
        console.error('Error checking curriculum status:', error);
      }
    } else {
      // Show curriculum prompt for non-curriculum users
      setShowCurriculumPrompt(!userProfile.curriculumEnabled);
    }
  }, [userProfile.curriculumEnabled, userProfile.curriculumStartDate]);

  // Start 10-day curriculum
  const handleStartCurriculum = async () => {
    try {
      setLoading(true);
      await gamificationEngine.startCurriculum(userProfile);
      
      // Update local state
      const updatedProfile = {
        ...userProfile,
        curriculumEnabled: true,
        curriculumStartDate: timeSync.getCurrentUTCDate(),
        curriculumDayCompleted: -1,
        curriculumTopicsCompleted: []
      };
      
      onProfileUpdate?.(updatedProfile);
      setShowCurriculumPrompt(false);
      
      // Reload challenges to show curriculum-based ones
      await loadChallenges();
    } catch (error) {
      console.error('Error starting curriculum:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced challenge completion with curriculum support
  const handleCurriculumChallengeCompletion = async (challengeType: string, challengeData?: any) => {
    try {
      const result = await gamificationEngine.processDailyChallengeCompletion(
        userProfile,
        challengeType,
        `${challengeType}_${timeSync.getCurrentUTCDate()}`,
        challengeData
      );
      
      // Update profile with rewards
      const updatedProfile = {
        ...userProfile,
        constitutionalCoins: userProfile.constitutionalCoins + result.coinsEarned,
        experiencePoints: userProfile.experiencePoints + result.experienceGained,
        profileLevel: result.levelUp ? userProfile.profileLevel + 1 : userProfile.profileLevel,
        lastActivityDate: timeSync.getCurrentUTCDate()
      };
      
      onProfileUpdate?.(updatedProfile);
      
      // Mark challenge as completed
      setChallenges(prev => prev.map(c => 
        c.type === challengeType ? { ...c, isCompleted: true, progress: c.target } : c
      ));
      
      // Trigger coin animation if coins were earned
      if (result.coinsEarned > 0) {
        setTimeout(() => {
          // Trigger from center for daily challenges
          triggerCoinAnimationFromPosition(
            window.innerWidth / 2,
            window.innerHeight / 2,
            result.coinsEarned
          );
        }, 300);
      }
      
      // Refresh curriculum progress
      await checkCurriculumStatus();
      
      return result;
    } catch (error) {
      console.error('Error completing curriculum challenge:', error);
      return null;
    }
  };

  // Update timer every minute
  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilMidnight(calculateTimeUntilMidnight());
      
      // Update challenge timers
      setChallenges(prev => prev.map(challenge => ({
        ...challenge,
        timeLeft: calculateTimeUntilMidnight()
      })));
    };

    // Update immediately
    updateTimer();
    
    // Update every minute
    const timer = setInterval(updateTimer, 60000);
    
    return () => clearInterval(timer);
  }, [calculateTimeUntilMidnight]);

  // Check if it's a new day and refresh challenges using UTC
  useEffect(() => {
    const checkForNewDay = async () => {
      const resetNeeded = await resetService.isResetNeeded();
      if (resetNeeded) {
        console.log('New day detected, refreshing challenges...');
        await loadChallenges();
      }
    };

    const interval = setInterval(checkForNewDay, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [loadChallenges, resetService]);

  // Load reset statistics
  useEffect(() => {
    const loadResetStats = async () => {
      try {
        const stats = await resetService.getResetStatistics();
        setResetStats(stats);
      } catch (error) {
        console.error('Error loading reset stats:', error);
      }
    };

    loadResetStats();
    const statsInterval = setInterval(loadResetStats, 60000); // Update every minute
    return () => clearInterval(statsInterval);
  }, [resetService]);

  // Load challenges on mount and profile change
  useEffect(() => {
    loadChallenges();
    checkCurriculumStatus();
  }, [loadChallenges, checkCurriculumStatus]);

  // Enhanced challenge completion with atomic operations
  const handleChallengeCompletion = async (challengeType: string) => {
    const challenge = challenges.find(c => c.type === challengeType);
    if (!challenge || challenge.isCompleted) return;

    try {
      // Get current profile and process completion
      const updatedProfile = { ...userProfile };
      await gamificationEngine.initializeDailyCoinTracking(updatedProfile);
      
      // Update streak first
      const streakResult = await gamificationEngine.updateStreak(updatedProfile);
      if (streakResult.streakUpdated && streakResult.streakBroken) {
        console.log('Streak broken! Start fresh tomorrow.');
      }

      // Award rewards with daily limit enforcement
      const coinsToAward = await gamificationEngine.awardCoinsWithLimit(
        updatedProfile, 
        challenge.reward.coins, 
        `daily_challenge_${challengeType}`
      );
      
      updatedProfile.experiencePoints += challenge.reward.experience;
      updatedProfile.lastActivityDate = timeSync.getCurrentUTCDate();

      // Update profile with new values
      onProfileUpdate?.(updatedProfile);

      // Mark challenge as completed locally
      setChallenges(prev => prev.map(c => 
        c.type === challengeType ? { ...c, isCompleted: true, progress: c.target } : c
      ));

      // Show notification if coins were limited
      if (coinsToAward < challenge.reward.coins) {
        console.log(`Daily coin limit reached. Awarded ${coinsToAward}/${challenge.reward.coins} coins.`);
      }

      // Log challenge completion
      await db.recordGameEvent({
        type: 'daily_challenge_completed',
        timestamp: new Date().toISOString(),
        data: {
          challengeType,
          coinsAwarded: coinsToAward,
          coinsRequested: challenge.reward.coins,
          experienceAwarded: challenge.reward.experience,
          streakBroken: streakResult.streakBroken
        }
      });

    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  // Handle challenge start
  const handleStartChallenge = (challengeType: string) => {
    onStartChallenge(challengeType);
  };

  // Manually refresh challenges
  const refreshChallenges = () => {
    loadChallenges();
  };

  // Manually trigger reset (for testing or manual reset)
  const triggerManualReset = async () => {
    try {
      setLoading(true);
      const result = await resetService.triggerManualReset();
      if (result.success) {
        console.log('Manual reset completed:', result);
        await loadChallenges(); // Reload challenges after reset
      } else {
        console.error('Manual reset failed:', result.errors);
      }
    } catch (error) {
      console.error('Error during manual reset:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedToday = challenges.filter(c => c.isCompleted).length;
  const totalChallenges = challenges.length;
  const completionPercentage = totalChallenges > 0 ? (completedToday / totalChallenges) * 100 : 0;

  // Auto-check for challenge completion every 30 seconds
  useEffect(() => {
    const checkChallengeCompletion = () => {
      challenges.forEach(challenge => {
        if (!challenge.isCompleted) {
          // Check if challenge should be marked as completed based on real progress
          switch (challenge.type) {
            case 'quiz':
              getTodayQuizProgress().then(progress => {
                if (progress >= challenge.target) {
                  handleChallengeCompletion(challenge.type);
                }
              });
              break;
            case 'reading':
              getTodayReadingProgress().then(progress => {
                if (progress >= challenge.target) {
                  handleChallengeCompletion(challenge.type);
                }
              });
              break;
            case 'mini_game':
              getTodayGameProgress().then(progress => {
                if (progress >= challenge.target) {
                  handleChallengeCompletion(challenge.type);
                }
              });
              break;
          }
        }
      });
    };

    const interval = setInterval(checkChallengeCompletion, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [challenges, getTodayQuizProgress, getTodayReadingProgress, getTodayGameProgress]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
        <p className="text-gray-600">Loading daily challenges...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-green-500 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span className="font-bold">Daily Challenges</span>
            <button 
              onClick={refreshChallenges}
              className="ml-2 p-1 hover:bg-white hover:bg-opacity-20 rounded"
              title="Refresh challenges"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button 
              onClick={triggerManualReset}
              className="ml-1 p-1 hover:bg-white hover:bg-opacity-20 rounded"
              title="Manual reset (testing)"
              disabled={loading}
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm font-medium">
            {completedToday}/{totalChallenges}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="mt-2 flex items-center justify-center space-x-1 text-xs opacity-90">
          <Clock className="w-3 h-3" />
          <span>Resets in: {timeUntilMidnight}</span>
        </div>

        {/* Reset Status Display */}
        {resetStats && (
          <div className="mt-1 text-xs opacity-75 text-center">
            {resetStats.resetNeeded ? (
              <span className="text-yellow-300">⚠️ Reset needed</span>
            ) : (
              <span className="text-green-300">✅ Reset up to date</span>
            )}
            {resetStats.lastReset && (
              <span className="ml-2">
                Last: {new Date(resetStats.lastReset).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Curriculum Prompt */}
      {showCurriculumPrompt && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 p-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🎓</div>
            <h3 className="text-navy font-bold text-sm mb-2">
              Start Your 10-Day Constitutional Journey
            </h3>
            <p className="text-gray-600 text-xs mb-3">
              Follow a structured curriculum to master the entire Indian Constitution in just 10 days. 
              Each day covers specific topics with stories, quizzes, and games.
            </p>
            <button
              onClick={handleStartCurriculum}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              disabled={loading}
            >
              Start Curriculum Mode
            </button>
          </div>
        </div>
      )}

      {/* Curriculum Progress */}
      {curriculumProgress && userProfile.curriculumEnabled && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-purple-600 font-bold text-sm">10-Day Journey</span>
              <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                Day {curriculumProgress.currentDay} of {curriculumProgress.totalDays}
              </div>
            </div>
            <div className="text-purple-600 text-sm font-medium">
              {curriculumProgress.progressPercentage.toFixed(0)}%
            </div>
          </div>
          
          {/* Curriculum Progress Bar */}
          <div className="w-full bg-purple-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${curriculumProgress.progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-purple-600">
            <span>Constitutional Learning Progress</span>
            {curriculumProgress.isCompleted ? (
              <span className="text-green-600 font-medium">🎉 Completed!</span>
            ) : (
              <span>{curriculumProgress.daysRemaining} days remaining</span>
            )}
          </div>
        </div>
      )}

      {/* Challenges List */}
      <div className={`${isMobile ? 'p-3' : 'p-4'} space-y-3 max-h-96 overflow-y-auto`}>
        {challenges.map((challenge) => {
          const progressPercentage = Math.min((challenge.progress / challenge.target) * 100, 100);
          const isClickable = !challenge.isCompleted && challenge.type !== 'streak';
          
          return (
            <div 
              key={challenge.id}
              className={`border rounded-lg p-3 transition-all duration-200 ${
                challenge.isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : isClickable
                    ? 'border-gray-200 hover:border-orange-200 hover:shadow-md cursor-pointer active:scale-95'
                    : 'border-gray-200 opacity-75'
              }`}
              onClick={() => isClickable && (challenge.type.startsWith('curriculum_') ? handleStartChallenge(challenge.type) : handleStartChallenge(challenge.type))}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl flex-shrink-0">{challenge.icon}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold ${challenge.type.startsWith('curriculum_') ? 'text-purple-700' : 'text-navy'} ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                      {challenge.title}
                      {challenge.type.startsWith('curriculum_') && (
                        <span className="ml-2 bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-xs font-normal">
                          Curriculum
                        </span>
                      )}
                    </h4>
                    {challenge.isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : challenge.type === 'streak' ? (
                      <Trophy className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    ) : (
                      <Zap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className={`text-gray-600 mb-2 ${isMobile ? 'text-xs' : 'text-xs'} line-clamp-2`}>
                    {challenge.description}
                  </p>
                  
                  {/* Progress */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span className="font-medium">
                        {challenge.progress}/{challenge.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          challenge.isCompleted ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Rewards & Time */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-yellow-600">
                        <Coins className="w-3 h-3" />
                        <span className="font-medium">{challenge.reward.coins}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Star className="w-3 h-3" />
                        <span className="font-medium">{challenge.reward.experience}</span>
                      </div>
                    </div>
                    
                    {!challenge.isCompleted && (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{challenge.timeLeft}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {isClickable && (
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {completedToday === totalChallenges ? (
        <div className="bg-green-50 border-t border-green-200 p-4 text-center">
          <div className="text-green-600 font-semibold text-sm mb-1">🎉 All challenges completed!</div>
          <div className="text-green-500 text-xs">Come back tomorrow for new challenges</div>
          {userProfile.currentStreak > 0 && (
            <div className="mt-2 text-green-600 text-xs">
              🔥 Current Streak: {userProfile.currentStreak} days
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
          <div className="text-gray-600 text-sm mb-1">
            Complete {totalChallenges - completedToday} more to finish today's challenges
          </div>
          <div className="text-gray-500 text-xs">
            Progress: {Math.round(completionPercentage)}%
          </div>
          {userProfile.currentStreak > 0 && (
            <div className="mt-2 text-orange-600 text-xs">
              🔥 Keep your {userProfile.currentStreak}-day streak alive!
            </div>
          )}
        </div>
      )}
    </div>
  );
}