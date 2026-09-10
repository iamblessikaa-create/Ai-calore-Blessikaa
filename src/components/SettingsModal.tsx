import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserProfile,
  DailyGoals,
  PermissionsState,
  SubscriptionState,
} from '../types/nutrition';
import { PermissionType } from './PermissionModal';
import { SettingsScreen } from './SettingsScreen';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  goals: DailyGoals;
  permissions: PermissionsState;
  subscription: SubscriptionState;
  onUpdateProfile: (updated: UserProfile) => void;
  onUpdateGoals: (updated: DailyGoals) => void;
  onRequestPermission: (type: PermissionType) => void;
  onToggleSubscription: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  goals,
  permissions,
  subscription,
  onUpdateProfile,
  onUpdateGoals,
  onRequestPermission,
  onToggleSubscription,
  onResetData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#0f1411] border border-[#232f25] rounded-[2.5rem] p-4 sm:p-6 shadow-2xl text-neutral-100 relative my-4 max-h-[92vh] overflow-y-auto"
      >
        <SettingsScreen
          userProfile={userProfile}
          goals={goals}
          permissions={permissions}
          subscription={subscription}
          isDayMode={false}
          onToggleDayMode={() => {}}
          onUpdateProfile={onUpdateProfile}
          onUpdateGoals={onUpdateGoals}
          onRequestPermission={onRequestPermission}
          onOpenPaywall={onToggleSubscription}
          onResetData={onResetData}
          onNavigateHome={onClose}
          onOpenAnalytics={onClose}
          onOpenAIChat={onClose}
          onOpenQuickLog={onClose}
          onClose={onClose}
        />
      </motion.div>
    </div>
  );
};
