import React from 'react';
import { UserProfile } from '../../types/gamification';
import AmendmentTimelineGame from './AmendmentTimelineGame';

interface AmendmentTimelineGameWrapperProps {
  userProfile: UserProfile;
  onGameComplete: (scoreData: any) => void;
  onBack: () => void;
}

const AmendmentTimelineGameWrapper: React.FC<AmendmentTimelineGameWrapperProps> = ({
  userProfile,
  onGameComplete,
  onBack
}) => {
  // Render the base AmendmentTimelineGame and intercept completion
  const handleGameComplete = (completionData: any) => {
    onGameComplete(completionData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <AmendmentTimelineGame />
      {/* Add overlay controls for back and completion if needed */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mr-2"
        >
          Back
        </button>
        <button
          onClick={() => handleGameComplete({
            score: 500,
            coinsEarned: 50,
            experienceGained: 100,
            achievementsUnlocked: [],
            gameData: { completed: true }
          })}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Complete Game
        </button>
      </div>
    </div>
  );
};

export default AmendmentTimelineGameWrapper;