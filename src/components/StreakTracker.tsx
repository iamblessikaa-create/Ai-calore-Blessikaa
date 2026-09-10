import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Shield, Award, CheckCircle, Lock, Sparkles, X, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StreakInfo } from '../types/nutrition';

interface StreakTrackerProps {
  streak: StreakInfo;
  isOpen: boolean;
  onClose: () => void;
  onUseFreeze: () => void;
  onLogMealClick: () => void;
  isDayMode?: boolean;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  streak,
  isOpen,
  onClose,
  onUseFreeze,
  onLogMealClick,
  isDayMode = false,
}) => {
  const [freezeUsedToast, setFreezeUsedToast] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
    });
  };

  const handleFreeze = () => {
    if (streak.freezesLeft > 0) {
      onUseFreeze();
      setFreezeUsedToast(true);
      setTimeout(() => setFreezeUsedToast(false), 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`w-full max-w-md rounded-3xl shadow-2xl flex flex-col max-h-[92vh] my-auto overflow-hidden relative border transition-colors duration-200 ${
          isDayMode
            ? 'bg-white border-[#e2e6e0] text-[#19221a]'
            : 'bg-neutral-900 border-neutral-800 text-neutral-100'
        }`}
      >
        {/* Sticky Top Header */}
        <div
          className={`sticky top-0 z-30 flex items-center justify-between px-4 sm:px-5 py-3.5 backdrop-blur-md border-b ${
            isDayMode
              ? 'bg-white/95 border-[#e8ece6]'
              : 'bg-neutral-900/95 border-neutral-800'
          }`}
        >
          <button
            onClick={onClose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isDayMode
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-500">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <h3
              className={`font-bold text-xs ${
                isDayMode ? 'text-neutral-900' : 'text-white'
              }`}
            >
              Streak Center
            </h3>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-1.5 rounded-full transition cursor-pointer ${
              isDayMode
                ? 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Big Animated Streak Counter Banner */}
          <div
            className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
              isDayMode
                ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/40 border-amber-200/80 shadow-xs'
                : 'bg-gradient-to-br from-amber-500/15 via-neutral-950 to-neutral-950 border-amber-500/30'
            }`}
          >
            {/* Flame Icon with Pulsing Halo */}
            <div className="relative inline-block mb-3">
              <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 relative">
                <Flame className="w-11 h-11 text-white fill-white animate-bounce" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <span
                className={`text-4xl font-extrabold tracking-tight font-mono ${
                  isDayMode ? 'text-neutral-900' : 'text-white'
                }`}
              >
                {streak.currentStreak}
              </span>
              <span className="text-xl font-bold text-amber-500">DAYS</span>
            </div>
            <p
              className={`text-xs mt-1 ${
                isDayMode ? 'text-neutral-600' : 'text-neutral-300'
              }`}
            >
              Current Active Calorie & Macro Logging Streak
            </p>

            <div
              className={`flex items-center justify-center gap-4 mt-4 pt-3 border-t text-xs ${
                isDayMode ? 'border-neutral-200/80 text-neutral-600' : 'border-neutral-800/80 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>
                  Record:{' '}
                  <strong className={isDayMode ? 'text-neutral-900 font-mono' : 'text-white font-mono'}>
                    {streak.longestStreak} days
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sky-500" />
                <span>
                  Freezes:{' '}
                  <strong className={isDayMode ? 'text-neutral-900 font-mono' : 'text-white font-mono'}>
                    {streak.freezesLeft} available
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Day Tracker */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                This Week's Activity
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                6 of 7 days logged
              </span>
            </div>

            <div
              className={`grid grid-cols-7 gap-1.5 p-3 rounded-2xl border ${
                isDayMode
                  ? 'bg-[#f7f9f6] border-[#e2e6e0]'
                  : 'bg-neutral-950/70 border-neutral-800'
              }`}
            >
              {streak.weekHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-center transition ${
                    item.isToday
                      ? isDayMode
                        ? 'bg-amber-100/70 border border-amber-400/60 ring-1 ring-amber-400/30'
                        : 'bg-neutral-800/90 border border-amber-500/50 ring-1 ring-amber-500/30'
                      : isDayMode
                      ? 'bg-white border border-neutral-200/60'
                      : 'bg-neutral-900/60'
                  }`}
                >
                  <span className="text-[10px] font-medium text-neutral-500">{item.day}</span>
                  <div className="my-1.5 flex items-center justify-center">
                    {item.logged ? (
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      </div>
                    ) : item.freezeUsed ? (
                      <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-500 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isDayMode ? 'bg-neutral-100 text-neutral-400' : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        <span className="text-[10px]">•</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-neutral-500">
                    {item.isToday ? 'Today' : item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak Freeze Shield Rescue */}
          <div
            className={`mt-4 p-3.5 rounded-2xl flex items-center justify-between gap-3 border ${
              isDayMode
                ? 'bg-sky-50 border-sky-200/80'
                : 'bg-sky-950/20 border-sky-800/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4
                  className={`text-xs font-semibold ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  Streak Freeze Shields
                </h4>
                <p
                  className={`text-[11px] ${
                    isDayMode ? 'text-neutral-600' : 'text-neutral-400'
                  }`}
                >
                  Missed a day? Freeze shields prevent your streak from resetting.
                </p>
              </div>
            </div>
            <button
              onClick={handleFreeze}
              disabled={streak.freezesLeft === 0}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold shrink-0 transition ${
                streak.freezesLeft > 0
                  ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs cursor-pointer'
                  : isDayMode
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              Use ({streak.freezesLeft})
            </button>
          </div>

          {/* Milestones & Badges */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Milestone Badges
              </span>
              <button
                onClick={triggerConfetti}
                className="text-[11px] text-amber-500 hover:text-amber-600 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Celebrate
              </button>
            </div>

            <div className="space-y-2">
              {streak.milestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                    m.unlocked
                      ? isDayMode
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-emerald-950/15 border-emerald-500/30'
                      : isDayMode
                      ? 'bg-neutral-50 border-neutral-200/70 opacity-80'
                      : 'bg-neutral-800/30 border-neutral-800 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        m.unlocked
                          ? isDayMode
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-emerald-500/20 text-emerald-400'
                          : isDayMode
                          ? 'bg-neutral-200 text-neutral-400'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {m.unlocked ? <CheckCircle className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5
                          className={`text-xs font-bold ${
                            isDayMode ? 'text-neutral-900' : 'text-white'
                          }`}
                        >
                          {m.name}
                        </h5>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isDayMode ? 'bg-neutral-200 text-neutral-700' : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {m.daysRequired}d
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          isDayMode ? 'text-neutral-500' : 'text-neutral-400'
                        }`}
                      >
                        {m.description}
                      </p>
                    </div>
                  </div>
                  {m.unlocked && (
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded ${
                        isDayMode ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      Unlocked
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div
          className={`sticky bottom-0 z-30 p-4 backdrop-blur-md border-t space-y-2 ${
            isDayMode
              ? 'bg-white/95 border-[#e8ece6]'
              : 'bg-neutral-900/95 border-neutral-800'
          }`}
        >
          <button
            onClick={() => {
              onClose();
              onLogMealClick();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-neutral-950" />
            Log Today's Meal to Protect Streak
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`w-full text-center text-xs font-semibold py-1 transition cursor-pointer ${
              isDayMode ? 'text-neutral-500 hover:text-neutral-800' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Close Streak Center
          </button>
        </div>

        {/* Toast confirmation */}
        <AnimatePresence>
          {freezeUsedToast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-6 right-6 p-3 bg-sky-500 text-neutral-950 font-bold text-xs rounded-xl shadow-xl flex items-center gap-2 justify-center z-40"
            >
              <Shield className="w-4 h-4" />
              Streak Freeze Activated! Your streak is shielded.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
