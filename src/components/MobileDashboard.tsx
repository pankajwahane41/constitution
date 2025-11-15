import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../types/gamification';
import { 
  Trophy, 
  Star, 
  Zap, 
  Award, 
  TrendingUp,
  Calendar,
  Target,
  Crown,
  BookOpen,
  Gamepad2,
  ArrowRight,
  Flame,
  Coins,
  HelpCircle
} from 'lucide-react';
import ProgressVisualization from './ProgressVisualization';

interface MobileDashboardProps {
  userProfile: UserProfile;
  onSelectMode: (mode: string) => void;
  gamificationEngine?: any;
  storyMode?: any;
  completedModules?: string[];
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({
  userProfile,
  onSelectMode,
  completedModules = []
}) => {
  // Level calculation constants and functions
  const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000];
  
  const calculateLevel = (experiencePoints: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (experiencePoints >= LEVEL_THRESHOLDS[i]) {
        return i;
      }
    }
    return 0;
  };
  
  const calculateLevelProgress = (experiencePoints: number): number => {
    const currentLevel = calculateLevel(experiencePoints);
    const currentLevelMin = LEVEL_THRESHOLDS[currentLevel];
    const nextLevelMin = LEVEL_THRESHOLDS[currentLevel + 1] || LEVEL_THRESHOLDS[currentLevel];
    
    if (nextLevelMin === currentLevelMin) return 100;
    
    const progress = (experiencePoints - currentLevelMin) / (nextLevelMin - currentLevelMin);
    return Math.min(100, Math.max(0, Math.round(progress * 100)));
  };
  
  const getXPToNextLevel = (experiencePoints: number): number => {
    const currentLevel = calculateLevel(experiencePoints);
    const currentLevelMin = LEVEL_THRESHOLDS[currentLevel];
    const nextLevelMin = LEVEL_THRESHOLDS[currentLevel + 1];
    
    if (!nextLevelMin) return 0; // Already at max level
    
    return nextLevelMin - experiencePoints;
  };

  // Consistent number formatting function
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Tooltip component for mobile
  const StatTooltip = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    
    return (
      <div 
        className="relative"
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {children}
        {showTooltip && (
          <div className="absolute z-20 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full max-w-xs">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  };
  
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return { text: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-500 to-purple-600' };
    if (streak >= 14) return { text: 'text-pink-600', bg: 'bg-pink-100', gradient: 'from-pink-500 to-pink-600' };
    if (streak >= 7) return { text: 'text-orange-600', bg: 'bg-orange-100', gradient: 'from-orange-500 to-orange-600' };
    return { text: 'text-gray-600', bg: 'bg-gray-100', gradient: 'from-gray-500 to-gray-600' };
  };

  const getLevelProgress = () => {
    return calculateLevelProgress(userProfile.experiencePoints);
  };

  const quickActions = [
    {
      id: 'learn',
      title: 'Continue Learning',
      subtitle: `${completedModules.length} modules completed`,
      icon: BookOpen,
      gradient: 'from-orange-500 to-orange-600',
      action: () => onSelectMode('learn')
    },
    {
      id: 'quiz',
      title: 'Take Quiz',
      subtitle: 'Test your knowledge',
      icon: Trophy,
      gradient: 'from-green-500 to-green-600',
      action: () => onSelectMode('quiz')
    },
    {
      id: 'story',
      title: 'Read Story',
      subtitle: "Dr. Ambedkar's journey",
      icon: Star,
      gradient: 'from-blue-500 to-blue-600',
      action: () => onSelectMode('story')
    },
    {
      id: 'games',
      title: 'Play Games',
      subtitle: 'Fun constitutional games',
      icon: Gamepad2,
      gradient: 'from-purple-500 to-purple-600',
      action: () => onSelectMode('games')
    }
  ];

  const streakColors = getStreakColor(userProfile.currentStreak);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <motion.div 
      className="mobile-container mobile-full-width mobile-minimal-padding safe-area-inset-top safe-area-inset-bottom pb-28"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Welcome Header */}
      <motion.div 
        className="text-center mb-8"
        variants={itemVariants}
      >
        <motion.div 
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-premium-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #F59E0B 50%, #8B5CF6 100%)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Crown className="w-10 h-10 text-white drop-shadow-lg" />
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%)',
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
        
        <motion.h1 
          className="text-2xl font-bold mb-3"
          style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Hello, {userProfile.displayName}!
        </motion.h1>
        <p className="text-gray-600 text-sm font-medium">
          Level {userProfile.profileLevel} Constitutional Scholar
        </p>
      </motion.div>

      {/* Premium Quick Stats Grid */}
      <motion.div 
        className="mobile-stats-grid mb-8"
        variants={itemVariants}
      >
        <StatTooltip tooltip="Total Constitutional Coins earned through quizzes, achievements, and daily challenges">
          <motion.div 
            className="mobile-stats-item group relative"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {formatNumber(userProfile.constitutionalCoins)}
            </div>
            <div className="text-xs text-gray-600 font-medium flex items-center justify-center space-x-1">
              <span>Constitutional Coins</span>
              <HelpCircle className="w-3 h-3" />
            </div>
          </motion.div>
        </StatTooltip>
        
        <motion.div 
          className="mobile-stats-item group"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${streakColors.gradient} flex items-center justify-center shadow-lg`}>
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className={`text-2xl font-bold ${streakColors.text} mb-2`}>
            {userProfile.currentStreak}
          </div>
          <div className="text-xs text-gray-600 font-medium">Day Streak</div>
        </motion.div>
        
        <motion.div 
          className="mobile-stats-item group"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {userProfile.achievements.length}
          </div>
          <div className="text-xs text-gray-600 font-medium">Achievements</div>
        </motion.div>
        
        <motion.div 
          className="mobile-stats-item group"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-green-600 mb-2">
            #{userProfile.leaderboardStats.globalRank || 'N/A'}
          </div>
          <div className="text-xs text-gray-600 font-medium">Global Rank</div>
        </motion.div>
      </motion.div>

      {/* Enhanced Progress Visualization */}
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <ProgressVisualization 
          userProfile={userProfile} 
          className="mb-6"
          onViewProgress={() => onSelectMode('profile')}
          onContinueStreak={() => onSelectMode('quiz')}
          onViewBadges={() => onSelectMode('profile')}
        />
      </motion.div>

      {/* Premium Quick Actions */}
      <motion.div 
        className="mb-8"
        variants={itemVariants}
      >
        <h2 className="mobile-text-title flex items-center space-x-2 mb-6">
          <Zap className="w-6 h-6 text-orange-500" />
          <span>Quick Actions</span>
        </h2>
        
        <div className="space-y-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <motion.button
                key={action.id}
                onClick={action.action}
                className="mobile-card w-full text-left group"
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 8 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.1 * index,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.gradient} shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-navy-800 mb-1 text-lg">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.subtitle}</p>
                  </div>
                  
                  <motion.div 
                    className="text-gray-400"
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Achievements */}
      {userProfile.achievements.length > 0 && (
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <h2 className="mobile-text-title flex items-center space-x-2 mb-6">
            <Award className="w-6 h-6 text-yellow-500" />
            <span>Recent Achievements</span>
          </h2>
          
          <div className="space-y-4">
            {userProfile.achievements.slice(-2).map((achievement, index) => (
              <motion.div 
                key={achievement.id || index} 
                className="mobile-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.1 * index,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="text-4xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {achievement.icon || '🏆'}
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-bold text-navy-800 text-base">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-green-600 font-medium mt-1 flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Premium Today's Challenge Card */}
      <motion.div 
        className="mobile-card-gradient mt-6"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-white text-lg">Today's Challenge</h3>
        </div>
        
        <p className="text-white/90 mb-4 leading-relaxed">
          Complete 5 quiz questions to maintain your streak and earn bonus coins!
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white/80">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Due today</span>
          </div>
          
          <motion.button
            onClick={() => onSelectMode('quiz')}
            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold text-sm shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Challenge
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Memoized component for performance optimization
const MemoizedMobileDashboard = memo(MobileDashboard);
export default MemoizedMobileDashboard;
