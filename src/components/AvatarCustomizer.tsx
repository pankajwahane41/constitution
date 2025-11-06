// Avatar Customizer Component (Placeholder)
// Will be implemented with full avatar customization system

import React from 'react';
import { UserProfile } from '../types/gamification';
import { AvatarSystem } from '../lib/avatarSystem';

interface AvatarCustomizerProps {
  userProfile: UserProfile;
  avatarSystem: AvatarSystem;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onClose: () => void;
}

export default function AvatarCustomizer({
  userProfile,
  avatarSystem,
  onUpdateProfile,
  onClose
}: AvatarCustomizerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-navy mb-4">Avatar Customizer</h2>
        <p className="text-gray-600 mb-6">
          Full avatar customization system coming soon! Unlock cultural elements, 
          clothing, and accessories by earning achievements and Constitutional Coins.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}