import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Heart, Bell, ShieldCheck, CheckCircle2, X, ArrowLeft } from 'lucide-react';
import { PermissionsState } from '../types/nutrition';

export type PermissionType = 'camera' | 'healthSync' | 'notifications';

interface PermissionModalProps {
  type: PermissionType | null;
  isOpen: boolean;
  onClose: () => void;
  onAllow: (type: PermissionType) => void;
  onDeny: (type: PermissionType) => void;
}

const permissionDetails: Record<
  PermissionType,
  {
    title: string;
    description: string;
    benefit: string;
    icon: any;
    iconBg: string;
    iconColor: string;
    allowText: string;
    disclaimer: string;
  }
> = {
  camera: {
    title: 'Allow Camera Access?',
    description:
      'Blessikaa uses your camera to instantly scan meals, detect individual ingredients on your plate, and read product barcodes in real time.',
    benefit: 'Log a complete meal in under 2 seconds without typing',
    icon: Camera,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    iconColor: 'text-emerald-400',
    allowText: 'Allow Camera Access',
    disclaimer: 'Photos are analyzed securely and never shared without your permission.',
  },
  healthSync: {
    title: 'Sync Apple Health & Google Fit?',
    description:
      'Connect your health data to automatically import active calories burned, daily steps, and workout sessions directly into your calorie budget.',
    benefit: 'Dynamic calorie budget that increases when you work out',
    icon: Heart,
    iconBg: 'bg-rose-500/10 border-rose-500/20',
    iconColor: 'text-rose-400',
    allowText: 'Connect Health Data',
    disclaimer: 'Read-only access to Active Calories and Steps. Encrypted end-to-end.',
  },
  notifications: {
    title: 'Enable Smart Meal Reminders?',
    description:
      'Never lose your streak! Receive gentle reminders at your preferred meal times and an urgent streak protection alert before midnight.',
    benefit: 'Keep your streak alive & hit your daily protein goal',
    icon: Bell,
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    iconColor: 'text-amber-400',
    allowText: 'Enable Notifications',
    disclaimer: 'You can customize reminder hours or mute notifications anytime.',
  },
};

export const PermissionModal: React.FC<PermissionModalProps> = ({
  type,
  isOpen,
  onClose,
  onAllow,
  onDeny,
}) => {
  if (!isOpen || !type) return null;

  const config = permissionDetails[type];
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-center relative max-h-[92vh] overflow-y-auto my-auto"
        >
          {/* Header navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-neutral-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Icon Badge */}
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg">
            <div className={`w-full h-full rounded-2xl flex items-center justify-center ${config.iconBg}`}>
              <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold text-white tracking-tight">{config.title}</h3>
          <p className="text-xs text-neutral-300 mt-2 leading-relaxed px-1">{config.description}</p>

          {/* Key Benefit Highlight */}
          <div className="my-4 py-2.5 px-3 bg-neutral-800/60 border border-neutral-800 rounded-xl flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-medium text-neutral-200">{config.benefit}</span>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onAllow(type);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {config.allowText}
            </button>

            <button
              onClick={() => {
                onDeny(type);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 text-xs font-semibold transition"
            >
              Not Now
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-neutral-500 mt-3">{config.disclaimer}</p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
