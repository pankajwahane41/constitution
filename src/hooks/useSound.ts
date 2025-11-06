import { useCallback } from 'react';

// Simple sound hook for game feedback
export const useSound = () => {
  const playSound = useCallback((type: 'correct' | 'incorrect' | 'click' | 'celebration') => {
    // Create simple audio feedback using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different sounds
      const frequencies = {
        correct: 523.25, // C5
        incorrect: 196.00, // G3
        click: 440.00, // A4
        celebration: 659.25, // E5
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Volume and duration settings
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Fallback: just log if audio context fails
      console.log('Sound effect:', type);
    }
  }, []);

  return { playSound };
};