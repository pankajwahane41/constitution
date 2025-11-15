// Animated Coin Collection Component
// Creates visual impact when coins are earned by animating them to the wallet

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import coinSoundEffects from '../utils/coinSoundEffects';

interface CoinAnimation {
  id: string;
  startX: number;
  startY: number;
  amount: number;
  timestamp: number;
}

interface AnimatedCoinCollectionProps {
  onAnimationComplete?: (amount: number) => void;
}

const AnimatedCoinCollection = ({ onAnimationComplete }: AnimatedCoinCollectionProps) => {
  const [coins, setCoins] = useState<CoinAnimation[]>([]);

  // Function to trigger coin animation from a specific position
  const triggerCoinAnimation = useCallback((amount: number, startElement?: HTMLElement) => {
    // Screen shake for large coin amounts (20+ coins)
    if (amount >= 20) {
      document.body.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
    }
    const rect = startElement?.getBoundingClientRect() || { 
      left: window.innerWidth / 2, 
      top: window.innerHeight / 2 
    };

    // Get wallet position (coin display in header)
    const walletElement = document.getElementById('constitutional-coins-display');
    const walletRect = walletElement?.getBoundingClientRect() || { 
      left: window.innerWidth - 100, 
      top: 20 
    };

    // Create multiple coins for larger amounts
    const coinCount = Math.min(Math.ceil(amount / 5), 8); // Max 8 coins for performance
    const newCoins: CoinAnimation[] = [];

    for (let i = 0; i < coinCount; i++) {
      const coinAmount = Math.ceil(amount / coinCount);
      const spread = 30; // Pixels to spread coins
      
      newCoins.push({
        id: `coin-${Date.now()}-${i}`,
        startX: rect.left + (Math.random() - 0.5) * spread,
        startY: rect.top + (Math.random() - 0.5) * spread,
        amount: coinAmount,
        timestamp: Date.now()
      });
    }

    setCoins(prev => [...prev, ...newCoins]);

    // Play coin collection sound effect
    setTimeout(() => {
      coinSoundEffects.playCoinCollectSound(coinCount);
      
      // Play bonus sound for perfect scores (50+ coins)
      if (amount >= 50) {
        setTimeout(() => {
          coinSoundEffects.playBonusSound();
        }, 200);
      }
    }, 100);

    // Screen flash for huge rewards (50+ coins)
    if (amount >= 50) {
      const flashDiv = document.createElement('div');
      flashDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(45deg, rgba(251, 191, 36, 0.3), rgba(34, 197, 94, 0.3));
        z-index: 9999;
        pointer-events: none;
        animation: coinFlash 0.3s ease-in-out;
      `;
      document.body.appendChild(flashDiv);
      
      setTimeout(() => {
        document.body.removeChild(flashDiv);
      }, 300);
    }

    // Remove coins after animation completes
    setTimeout(() => {
      setCoins(prev => prev.filter(coin => 
        !newCoins.some(newCoin => newCoin.id === coin.id)
      ));
      onAnimationComplete?.(amount);
    }, 2000); // Animation duration + buffer
  }, [onAnimationComplete]);

  // Expose trigger function globally
  useEffect(() => {
    (window as any).triggerCoinAnimation = triggerCoinAnimation;
    return () => {
      delete (window as any).triggerCoinAnimation;
    };
  }, [triggerCoinAnimation]);

  // Get wallet position for animation target
  const getWalletPosition = () => {
    const walletElement = document.getElementById('constitutional-coins-display');
    if (walletElement) {
      const rect = walletElement.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return { x: window.innerWidth - 80, y: 30 }; // Fallback position
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {coins.map((coin) => {
          const wallet = getWalletPosition();
          
          return (
            <motion.div
              key={coin.id}
              initial={{
                x: coin.startX,
                y: coin.startY,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: wallet.x,
                y: wallet.y,
                scale: [0, 1.2, 1],
                opacity: [0, 1, 1, 0],
                rotate: [0, 360]
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 1.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                times: [0, 0.2, 0.8, 1]
              }}
              className="absolute"
              style={{
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Animated Coin */}
              <div className="relative">
                {/* Coin glow effect */}
                <motion.div
                  className="absolute inset-0 bg-yellow-400 rounded-full blur-sm"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.6, 0.3, 0.6]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    width: '32px',
                    height: '32px'
                  }}
                />
                
                {/* Main coin */}
                <div className="relative w-8 h-8 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 rounded-full shadow-lg border-2 border-yellow-300 flex items-center justify-center">
                  {/* Coin shine effect */}
                  <motion.div
                    className="absolute inset-1 bg-gradient-to-br from-yellow-200 to-transparent rounded-full"
                    animate={{
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Coin symbol */}
                  <span className="text-yellow-900 font-bold text-xs z-10">₹</span>
                </div>

                {/* Coin amount indicator */}
                {coin.amount > 1 && (
                  <motion.div
                    initial={{ scale: 0, y: 0 }}
                    animate={{ scale: 1, y: -20 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                  >
                    +{coin.amount}
                  </motion.div>
                )}

                {/* Enhanced sparkle and trail effects */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 2,
                    ease: "linear",
                    repeat: Infinity
                  }}
                >
                  {/* Main sparkles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-200 rounded-full"
                      style={{
                        left: `${50 + 25 * Math.cos((i * 45 * Math.PI) / 180)}%`,
                        top: `${50 + 25 * Math.sin((i * 45 * Math.PI) / 180)}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      animate={{
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: 1.2
                      }}
                    />
                  ))}
                  
                  {/* Trailing particles */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={`trail-${i}`}
                      className="absolute w-0.5 h-0.5 bg-orange-300 rounded-full"
                      style={{
                        left: `${50 + 15 * Math.cos(((i * 90) * Math.PI) / 180)}%`,
                        top: `${50 + 15 * Math.sin(((i * 90) * Math.PI) / 180)}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0],
                        x: [0, Math.random() * 20 - 10],
                        y: [0, Math.random() * 20 - 10]
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.15 + 0.3,
                        repeat: Infinity,
                        repeatDelay: 1.5
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedCoinCollection;