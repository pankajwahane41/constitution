// Simple fallback component for testing MiniGamesHub
import React from 'react';

const MiniGamesHubFallback: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Games Hub Loading...</h2>
        <p className="text-gray-600">Setting up your gaming environment</p>
      </div>
    </div>
  );
};

export default MiniGamesHubFallback;