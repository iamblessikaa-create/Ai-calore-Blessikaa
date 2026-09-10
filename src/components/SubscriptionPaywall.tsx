import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  Shield,
  FileSpreadsheet,
  ScanLine,
  X,
  Lock,
  ChevronRight,
  Star,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionState } from '../types/nutrition';

interface SubscriptionPaywallProps {
  subscription: SubscriptionState;
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'annual' | 'monthly') => void;
  onCancelSubscription: () => void;
  isDayMode?: boolean;
}

export const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({
  subscription,
  isOpen,
  onClose,
  onSubscribe,
  onCancelSubscription,
  isDayMode = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartTrial = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSubscribe(selectedPlan);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10b981', '#fbbf24', '#38bdf8', '#a855f7'],
      });
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[92vh] my-auto overflow-hidden relative border transition-colors duration-200 ${
          isDayMode
            ? 'bg-white border-[#e2e6e0] text-[#19221a]'
            : 'bg-neutral-900 border-neutral-800 text-neutral-100'
        }`}
      >
        {/* Sticky Top Header Bar */}
        <div
          className={`sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 backdrop-blur-md border-b ${
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
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold">
            <Crown className="w-3.5 h-3.5" />
            PRO UPGRADE
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-2 rounded-full transition cursor-pointer ${
              isDayMode
                ? 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Header Title - Rewritten per Screen 20 */}
          <div className="text-center pt-1 pb-2">
            <h2
              className={`text-2xl font-extrabold tracking-tight ${
                isDayMode ? 'text-neutral-900' : 'text-white'
              }`}
            >
              Unlock Your Full Potential
            </h2>
            <p
              className={`text-xs max-w-sm mx-auto mt-1.5 font-medium ${
                isDayMode ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              Try it free for 7 days. Unlimited AI Vision meal scanning, dynamic macro optimization, and verified nutrition intelligence.
            </p>
          </div>

        {/* Current status if already Pro */}
        {subscription.isPro && (
          <div
            className={`mb-5 p-3.5 rounded-2xl flex items-center justify-between border ${
              isDayMode
                ? 'bg-emerald-50/80 border-emerald-300/80'
                : 'bg-emerald-950/30 border-emerald-500/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isDayMode ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-xs font-bold block ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  You are an active Blessikaa Pro Member
                </span>
                <span className="text-[11px] text-neutral-400">
                  Plan: {subscription.plan?.toUpperCase()} • All features unlocked
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onCancelSubscription();
              }}
              className="text-[11px] text-neutral-400 hover:text-rose-500 font-medium underline cursor-pointer"
            >
              Downgrade
            </button>
          </div>
        )}

        {/* Pro Features Checklist */}
        <div className="space-y-2.5 my-4">
          {[
            {
              icon: Zap,
              title: 'Unlimited AI Vision Scans',
              desc: 'Point your camera at any meal to identify calories & macros in 2 seconds (vs 3/day on Free).',
              color: 'text-amber-500',
            },
            {
              icon: Sparkles,
              title: 'Dynamic Macro & Deficit Optimizer',
              desc: 'Live recalculation of protein, carb & fat ratios tailored to your cut/bulk goals.',
              color: 'text-emerald-500',
            },
            {
              icon: ScanLine,
              title: '1.2M+ Barcode & Restaurant Database',
              desc: 'Instant label scanning for packaged foods, sports nutrition, and restaurant menus.',
              color: 'text-sky-500',
            },
            {
              icon: Shield,
              title: 'Unlimited Streak Freeze Protection',
              desc: 'Never lose your streak milestone shields even on hectic travel or rest days.',
              color: 'text-indigo-500',
            },
            {
              icon: FileSpreadsheet,
              title: 'Export Nutrition & Doctor Reports',
              desc: 'Comprehensive PDF/CSV logs of micronutrients, protein averages, and calorie adherence.',
              color: 'text-rose-500',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-2.5 rounded-xl border ${
                  isDayMode
                    ? 'bg-[#f7f9f6] border-[#e2e6e0]'
                    : 'bg-neutral-950/60 border-neutral-800/80'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${item.color} mt-0.5 shrink-0 ${
                    isDayMode ? 'bg-white border border-neutral-200' : 'bg-neutral-900 border border-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold flex items-center gap-1.5 ${
                      isDayMode ? 'text-neutral-900' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p
                    className={`text-[11px] mt-0.5 leading-snug ${
                      isDayMode ? 'text-neutral-600' : 'text-neutral-400'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Plan Selector Cards */}
        <div className="grid grid-cols-2 gap-3 my-5">
          {/* Annual Plan */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`relative p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              selectedPlan === 'annual'
                ? isDayMode
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-emerald-950/25 border-emerald-500 ring-2 ring-emerald-500/20'
                : isDayMode
                ? 'bg-[#f7f9f6] border-[#e2e6e0] hover:bg-[#eef2ed]'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            {/* Best Value Badge */}
            <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow">
              SAVE 50%
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                <span
                  className={`text-xs font-bold ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  Annual Plan (Best Value)
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span
                  className={`text-2xl font-extrabold font-mono ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  $4.99
                </span>
                <span className="text-[11px] text-neutral-400">/ mo</span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">Billed at $59.99/year after trial</p>
            </div>

            <div
              className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 ${
                isDayMode ? 'border-neutral-200' : 'border-neutral-800/60'
              }`}
            >
              <span>7 Days Free</span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedPlan === 'annual'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isDayMode
                    ? 'border-neutral-300'
                    : 'border-neutral-600'
                }`}
              >
                {selectedPlan === 'annual' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </div>
          </div>

          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              selectedPlan === 'monthly'
                ? isDayMode
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-emerald-950/25 border-emerald-500 ring-2 ring-emerald-500/20'
                : isDayMode
                ? 'bg-[#f7f9f6] border-[#e2e6e0] hover:bg-[#eef2ed]'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div>
              <span
                className={`text-xs font-bold block mb-1 ${
                  isDayMode ? 'text-neutral-900' : 'text-white'
                }`}
              >
                Monthly Plan
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span
                  className={`text-2xl font-extrabold font-mono ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  $9.99
                </span>
                <span className="text-[11px] text-neutral-400">/ mo</span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">Billed monthly, cancel anytime</p>
            </div>

            <div
              className={`mt-3 pt-2 border-t flex items-center justify-between text-[11px] text-neutral-400 font-semibold ${
                isDayMode ? 'border-neutral-200' : 'border-neutral-800/60'
              }`}
            >
              <span>Flexible</span>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  selectedPlan === 'monthly'
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isDayMode
                    ? 'border-neutral-300'
                    : 'border-neutral-600'
                }`}
              >
                {selectedPlan === 'monthly' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Sticky Bottom Footer */}
        <div
          className={`sticky bottom-0 z-30 p-4 sm:p-5 backdrop-blur-md border-t ${
            isDayMode
              ? 'bg-white/95 border-[#e8ece6]'
              : 'bg-neutral-900/95 border-neutral-800'
          }`}
        >
          <button
            onClick={handleStartTrial}
            disabled={isProcessing}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-emerald-500/25 cursor-pointer"
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {subscription.isPro ? 'Switch Plan & Refresh' : 'Start My Journey'}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between mt-2.5 px-1">
            <span
              className={`text-[10px] ${
                isDayMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              🔒 Cancel anytime in 1 tap • No commitment
            </span>
            <button
              type="button"
              onClick={onClose}
              className={`text-xs font-semibold transition cursor-pointer ${
                isDayMode ? 'text-neutral-500 hover:text-neutral-800' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
