// Coin Display Component with animation effects
// Enhanced coin display that pulses when coins change

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedCoinDisplayProps {
  coins: number;
  className?: string;
}

const AnimatedCoinDisplay: React.FC<AnimatedCoinDisplayProps> = ({ coins, className = '' }) => {
  const [prevCoins, setPrevCoins] = useState(coins);
  const [isAnimating, setIsAnimating] = useState(false);
  const [coinDiff, setCoinDiff] = useState(0);

  useEffect(() => {
    if (coins !== prevCoins) {
      const diff = coins - prevCoins;
      setCoinDiff(diff);
      setIsAnimating(true);
      setPrevCoins(coins);
      
      // Reset animation after delay
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setCoinDiff(0);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [coins, prevCoins]);

  const formatCoins = (coinAmount: number) => {
    return coinAmount > 999 
      ? `${Math.floor(coinAmount / 1000)}k`
      : coinAmount.toLocaleString();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main coin display */}
      <motion.div 
        className="flex items-center space-x-1 bg-yellow-100 px-2 sm:px-3 py-1 rounded-full"
        animate={{
          scale: isAnimating ? [1, 1.1, 1] : 1,
          boxShadow: isAnimating 
            ? [
                '0 0 0 rgba(251, 191, 36, 0)',
                '0 0 20px rgba(251, 191, 36, 0.5)',
                '0 0 0 rgba(251, 191, 36, 0)'
              ]
            : '0 0 0 rgba(251, 191, 36, 0)'
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Coin icon */}
        <motion.div 
          className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full"
          animate={{
            rotate: isAnimating ? 360 : 0,
            scale: isAnimating ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Coin amount */}
        <span className="text-xs sm:text-sm font-medium text-yellow-700">
          {formatCoins(coins)}
        </span>
      </motion.div>

      {/* Floating coin difference indicator */}
      <AnimatePresence>
        {isAnimating && coinDiff !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-bold ${
              coinDiff > 0 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            } shadow-lg z-10`}
          >
            {coinDiff > 0 ? '+' : ''}{coinDiff}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle effects when coins increase */}
      <AnimatePresence>
        {isAnimating && coinDiff > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                style={{
                  left: `${50 + 30 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                  top: `${50 + 30 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 40],
                  y: [0, (Math.random() - 0.5) * 40]
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedCoinDisplay;