import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Trophy, 
  User, 
  Star, 
  Gamepad2, 
  Users, 
  Building,
  Home as HomeIcon,
  Award
} from 'lucide-react';
import { useScreenSize } from '../hooks/useIsMobile';

interface MobileNavigationProps {
  currentView: string;
  onSelectMode: (mode: string) => void;
  userProfile: any;
  onProfileSelect?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentView,
  onSelectMode,
  userProfile,
  onProfileSelect
}) => {
  const { width: screenWidth, height: screenHeight } = useScreenSize();
  const isSmallMobile = screenWidth <= 375; // iPhone SE and similar
  const isLandscape = screenWidth > screenHeight;
  const safeBottomPadding = isSmallMobile ? 'pb-4' : 'pb-6';
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: Trophy,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'story',
      label: 'Story',
      icon: Star,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <>
      {/* Premium Floating Navigation Bar with Enhanced Responsiveness */}
      <motion.nav 
        className={`mobile-nav-bar safe-area-inset-bottom ${safeBottomPadding} ${isLandscape ? 'landscape-mode' : ''}`}
        role="navigation" 
        aria-label="Main navigation"
        style={{
          paddingBottom: isSmallMobile ? 'max(env(safe-area-inset-bottom), 16px)' : 'max(env(safe-area-inset-bottom), 24px)'
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1
        }}
      >
        <div className="mobile-nav-items">
          {navItems.map((item, index) => {
            const isActive = currentView === item.id;
            const IconComponent = item.icon;
            
            return (
                            <motion.button
                key={item.id}
                onClick={() => onSelectMode(item.id)}
                className={`mobile-nav-item ${isActive ? 'mobile-nav-active' : ''}`}
                aria-label={`Navigate to ${item.label}`}
                role="tab"
                aria-selected={isActive}
                style={{ touchAction: 'manipulation' }}
                whileHover={{
                  scale: 1.05,
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Background gradient (visible when active) */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500"
                    layoutId="activeNavBg"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30
                    }}
                  />
                )}
                
                {/* Icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -2 : 0
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  <IconComponent 
                    className={`mobile-nav-icon ${isActive ? 'text-white' : 'text-gray-600'}`}
                    size={isSmallMobile ? 20 : 24}
                    strokeWidth={isSmallMobile ? 1.5 : 2}
                    aria-hidden="true"
                  />
                </motion.div>
                
                {/* Label */}
                <motion.span 
                  className={`mobile-nav-label relative z-10 ${isActive ? 'text-white' : 'text-gray-600'}`}
                  animate={{
                    fontWeight: isActive ? 700 : 600,
                  }}
                  style={{
                    fontSize: '10px',
                    display: 'block',
                    maxWidth: '100%'
                  }}
                >
                  {item.label}
                </motion.span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 w-1.5 h-1.5 rounded-full bg-white"
                    layoutId="activeIndicator"
                    initial={{ scale: 0, x: '-50%' }}
                    animate={{ scale: 1, x: '-50%' }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
      
      {/* Premium Floating Action Button - Responsive Touch */}
      <motion.button
        onClick={() => onSelectMode('quiz')}
        className={`mobile-fab safe-area-inset-bottom ${safeBottomPadding} ${isLandscape ? 'landscape-fab' : ''}`}
        aria-label="Quick Quiz"
        style={{ 
          touchAction: 'manipulation',
          width: isSmallMobile ? '50px' : '56px',
          height: isSmallMobile ? '50px' : '56px',
          bottom: isSmallMobile ? 'max(env(safe-area-inset-bottom), 80px)' : 'max(env(safe-area-inset-bottom), 90px)'
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3
        }}
        whileHover={{ scale: isSmallMobile ? 1.05 : 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Trophy size={isSmallMobile ? 24 : 28} className="drop-shadow-lg" />
        </motion.div>
      </motion.button>
    </>
  );
};

// Memoized component for performance optimization
const MemoizedMobileNavigation = memo(MobileNavigation);
export default MemoizedMobileNavigation;
