import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Camera,
  ScanLine,
  Mic,
  Search,
  Droplets,
  Sparkles,
  Plus,
} from 'lucide-react';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVisionScanner: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenVoiceLogger: () => void;
  onOpenFoodDatabase: () => void;
  onAddWater: (amount: number) => void;
  isDayMode?: boolean;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onOpenVisionScanner,
  onOpenBarcodeScanner,
  onOpenVoiceLogger,
  onOpenFoodDatabase,
  onAddWater,
  isDayMode = false,
}) => {
  if (!isOpen) return null;

  const options = [
    {
      id: 'vision',
      title: 'AI Vision Camera',
      subtitle: 'Snap a picture to detect dish & macros',
      icon: Camera,
      color: 'bg-emerald-500',
      action: () => {
        onClose();
        onOpenVisionScanner();
      },
    },
    {
      id: 'barcode',
      title: 'Scan Barcode',
      subtitle: 'Instant package & nutrition facts lookup',
      icon: ScanLine,
      color: 'bg-sky-500',
      action: () => {
        onClose();
        onOpenBarcodeScanner();
      },
    },
    {
      id: 'voice',
      title: 'Voice & NLP Logger',
      subtitle: 'Speak your meal in natural language',
      icon: Mic,
      color: 'bg-purple-500',
      action: () => {
        onClose();
        onOpenVoiceLogger();
      },
    },
    {
      id: 'database',
      title: 'Food Database Search',
      subtitle: 'Browse thousands of foods or add custom item',
      icon: Search,
      color: 'bg-amber-500',
      action: () => {
        onClose();
        onOpenFoodDatabase();
      },
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className={`w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl border ${
            isDayMode
              ? 'bg-[#ffffff] border-[#e2e6e0] text-[#19221a]'
              : 'bg-[#151c17] border-[#253228] text-[#f2f6f3]'
          }`}
        >
          {/* Top handle on mobile */}
          <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto mb-4 sm:hidden" />

          <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5dba7d]" />
                Log Today's Meal
              </h3>
              <p className="text-xs text-neutral-400">Choose your preferred input method</p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition cursor-pointer ${
                isDayMode ? 'hover:bg-neutral-100 text-neutral-500' : 'hover:bg-neutral-800 text-neutral-400'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5 my-3">
            {options.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={opt.action}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3.5 transition text-left cursor-pointer border ${
                    isDayMode
                      ? 'bg-[#f7f9f6] hover:bg-[#eef2ed] border-[#e5e9e3]'
                      : 'bg-[#1b231d] hover:bg-[#222c25] border-[#27352a]'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-2xl ${opt.color} text-white flex items-center justify-center shadow-md shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-sm block">{opt.title}</span>
                    <span className="text-xs text-neutral-400 block truncate">{opt.subtitle}</span>
                  </div>
                  <span className="text-xs text-emerald-500 font-semibold">Open →</span>
                </button>
              );
            })}
          </div>

          {/* Quick Water hydration shortcut */}
          <div className={`mt-4 p-3 rounded-2xl border flex items-center justify-between ${
            isDayMode ? 'bg-[#f0f7f2] border-[#d8ebe0]' : 'bg-[#15241b] border-[#21382a]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold block">Quick Water Intake</span>
                <span className="text-[11px] text-neutral-400">Log glasses easily</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  onAddWater(250);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold text-xs hover:bg-sky-500/30 transition cursor-pointer"
              >
                +250ml
              </button>
              <button
                onClick={() => {
                  onAddWater(500);
                  onClose();
                }}
                className="px-2.5 py-1 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold text-xs hover:bg-sky-500/30 transition cursor-pointer"
              >
                +500ml
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
