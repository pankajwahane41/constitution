// Quiz Race Game Integration Example
// This component demonstrates how to integrate the Quiz Race Game into your main app

import React, { useState } from 'react';
import { QuizRaceGameWrapper } from './games/QuizRaceGame';
import { UserProfile } from '../types/gamification';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface GameIntegrationExampleProps {
  userProfile: UserProfile;
}

export const GameIntegrationExample: React.FC<GameIntegrationExampleProps> = ({
  userProfile
}) => {
  const [currentView, setCurrentView] = useState<'menu' | 'race'>('menu');
  const [raceResults, setRaceResults] = useState(null);

  const handleStartRace = () => {
    setCurrentView('race');
  };

  const handleGameComplete = (results: any) => {
    console.log('🏁 Race Results:', results);
    
    // Update user profile with earned rewards
    const updatedProfile = {
      ...userProfile,
      constitutionalCoins: userProfile.constitutionalCoins + results.coinsEarned,
      experiencePoints: userProfile.experiencePoints + results.experienceGained,
      currentStreak: Math.max(userProfile.currentStreak, results.highestStreak),
    };

    // Here you would typically save to your state management system
    console.log('Updated Profile:', updatedProfile);
    
    // Show results and return to menu
    setRaceResults(results);
    setCurrentView('menu');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
    setRaceResults(null);
  };

  // Main menu view
  if (currentView === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Constitutional Learning Hub</h1>
          
          {raceResults && (
            <div className="mb-6 p-4 bg-green-100 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">🏆 Last Race Results:</h3>
              <div className="text-sm text-green-700">
                <p>Time: {Math.floor(raceResults.totalTime / 60000)}:{(raceResults.totalTime / 1000 % 60).toFixed(1)}s</p>
                <p>Accuracy: {Math.round((raceResults.correctAnswers / raceResults.totalQuestions) * 100)}%</p>
                <p>Coins Earned: {raceResults.coinsEarned}</p>
                <p>Best Streak: {raceResults.highestStreak}</p>
                {raceResults.isNewRecord && <p className="font-bold">🎉 New Record!</p>}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <Button 
              onClick={handleStartRace}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
            >
              🏁 Start Constitution Quiz Race
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
            >
              📚 Study Mode
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
            >
              🏆 Leaderboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Race game view
  return (
    <QuizRaceGameWrapper
      userProfile={userProfile}
      onGameComplete={handleGameComplete}
      onBack={handleBackToMenu}
      dataFileName="constitution_questions_preamble.json"
    />
  );
};

// Export the main QuizRaceGameWrapper component for easy importing
export { QuizRaceGameWrapper } from './games/QuizRaceGame';