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
      {/* Premium Floating Navigation Bar with Glassmorphism */}
      <motion.nav 
        className="mobile-nav-bar safe-area-inset-bottom" 
        role="navigation" 
        aria-label="Main navigation"
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
                className={`
                  mobile-nav-item touch-target focus-ring
                  ${isActive ? 'active' : ''}
                `}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 + index * 0.05
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
                    size={24}
                    strokeWidth={2}
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
      
      {/* Premium Floating Action Button */}
      <motion.button
        onClick={() => onSelectMode('quiz')}
        className="mobile-fab safe-area-inset-bottom"
        aria-label="Quick Quiz"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3
        }}
        whileHover={{ scale: 1.1 }}
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
          <Trophy size={28} className="drop-shadow-lg" />
        </motion.div>
      </motion.button>
    </>
  );
};

// Memoized component for performance optimization
const MemoizedMobileNavigation = memo(MobileNavigation);
export default MemoizedMobileNavigation;
