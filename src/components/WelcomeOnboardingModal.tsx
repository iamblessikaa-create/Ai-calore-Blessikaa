import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Flame,
  Camera,
  Heart,
  Scale,
  Award,
  Calendar,
  X,
  ShieldCheck,
  Clock,
  Zap,
  ChevronRight,
  TrendingDown,
  Target,
  Smile,
  Activity,
  Dumbbell,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, DailyGoals } from '../types/nutrition';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (updatedProfile: Partial<UserProfile>, updatedGoals: Partial<DailyGoals>, unitSystem: 'metric' | 'imperial') => void;
  isDayMode?: boolean;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isDayMode = false,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 13;

  // Form states matching Screens 1 to 13
  // Screen 2: Motivation
  const [motivation, setMotivation] = useState<string>('Feel confident in my own skin');
  // Screen 3: Diet History
  const [dietHistory, setDietHistory] = useState<string>('Calorie Awareness');
  // Screen 4: Weight Unit
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  // Screen 5: Pace
  const [pace, setPace] = useState<'steady' | 'balanced' | 'focused' | 'ambitious'>('balanced');
  // Screen 6: BMR & Personal Details
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [birthYear, setBirthYear] = useState<number>(1998);
  const [heightCm, setHeightCm] = useState<number>(170); // 170cm ~ 5'7"
  // Screen 7: Current Weight
  const [weightKg, setWeightKg] = useState<number>(78); // default 78 kg (~172 lbs)
  // Screen 8: Activity Level
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete'>('moderate');
  // Screen 9: Goal Weight
  const [goalWeightKg, setGoalWeightKg] = useState<number>(68); // target 68 kg (~150 lbs)
  // Screen 10: Macro Goals
  const [macroPreset, setMacroPreset] = useState<'balanced' | 'muscle' | 'keto' | 'lowcarb' | 'custom'>('balanced');

  // Screen 12: Press and Hold Commitment State
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);
  const holdIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isHolding && !isCommitted) {
      const interval = window.setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsCommitted(true);
            try {
              confetti({
                particleCount: 90,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#5dba7d', '#f59e0b', '#3b82f6', '#10b981'],
              });
            } catch (e) {
              // ignore
            }
            setTimeout(() => setStep(13), 600);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      holdIntervalRef.current = interval;
    } else {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
      if (!isCommitted) {
        setHoldProgress(0);
      }
    }
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, [isHolding, isCommitted]);

  if (!isOpen) return null;

  // Conversions for display
  const isImperial = unitSystem === 'imperial';
  const displayCurrentWeight = isImperial ? Math.round(weightKg * 2.20462) : weightKg;
  const displayGoalWeight = isImperial ? Math.round(goalWeightKg * 2.20462) : goalWeightKg;
  const weightUnitLabel = isImperial ? 'lbs' : 'kg';

  // Dynamic calculation for Plan Reveal (Screen 13)
  const weightDiffKg = Math.max(0, weightKg - goalWeightKg);
  const weeklyLossKg = pace === 'steady' ? 0.2 : pace === 'balanced' ? 0.4 : pace === 'focused' ? 0.6 : 0.8;
  const weeksNeeded = Math.ceil(weightDiffKg / weeklyLossKg) || 12;
  const projectedTargetDate = new Date();
  projectedTargetDate.setDate(projectedTargetDate.getDate() + weeksNeeded * 7);
  const targetDateFormatted = projectedTargetDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  // Calculate daily calorie target based on Harris-Benedict BMR + Deficit
  const age = new Date().getFullYear() - birthYear;
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };
  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.4));
  const dailyDeficit = Math.round(weeklyLossKg * 1100); // ~7700 kcal per kg of fat
  const calculatedCalories = Math.max(1350, Math.min(3200, tdee - dailyDeficit));

  // Macros calculation
  let proteinRatio = 0.3;
  let carbRatio = 0.45;
  let fatRatio = 0.25;

  if (macroPreset === 'muscle') {
    proteinRatio = 0.35;
    carbRatio = 0.4;
    fatRatio = 0.25;
  } else if (macroPreset === 'keto') {
    proteinRatio = 0.25;
    carbRatio = 0.05;
    fatRatio = 0.7;
  } else if (macroPreset === 'lowcarb') {
    proteinRatio = 0.4;
    carbRatio = 0.2;
    fatRatio = 0.4;
  }

  const targetProtein = Math.round((calculatedCalories * proteinRatio) / 4);
  const targetCarbs = Math.round((calculatedCalories * carbRatio) / 4);
  const targetFat = Math.round((calculatedCalories * fatRatio) / 9);

  const handleFinishBlueprint = () => {
    onComplete(
      {
        weightKg,
        targetWeightKg: goalWeightKg,
        heightCm,
        age,
        sex: gender,
        activityLevel: activityLevel === 'athlete' ? 'very_active' : activityLevel,
        goal: weightKg > goalWeightKg ? 'cut' : weightKg < goalWeightKg ? 'bulk' : 'maintain',
        dietType: macroPreset === 'muscle' ? 'high_protein' : macroPreset === 'keto' ? 'keto' : 'balanced',
      },
      {
        calories: calculatedCalories,
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        waterMl: isImperial ? 2500 : 2250,
      },
      unitSystem
    );
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch (e) {
      // ignore
    }
    onClose();
  };

  const nextStep = () => {
    if (step < totalSteps) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`w-full max-w-md rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] my-auto overflow-hidden relative transition-colors duration-200 ${
          isDayMode
            ? 'bg-[#ffffff] border-[#e2e6e0] text-[#19221a]'
            : 'bg-neutral-900 border-neutral-800 text-neutral-100'
        }`}
      >
        {/* Top Progress & Navigation Bar */}
        <div
          className={`sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md ${
            isDayMode
              ? 'bg-[#ffffff]/95 border-[#e8ece6]'
              : 'bg-neutral-900/95 border-neutral-800'
          }`}
        >
          {step > 1 ? (
            <button
              onClick={prevStep}
              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                ✨
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Blessikaa
              </span>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-24 h-1.5 rounded-full overflow-hidden ${
                isDayMode ? 'bg-neutral-200' : 'bg-neutral-800'
              }`}
            >
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              {step}/{totalSteps}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Skip / Close"
            className={`p-1.5 rounded-full transition cursor-pointer ${
              isDayMode
                ? 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Step Content Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* ============================================================ */}
          {/* SCREEN 1: Hero / Introduction                                */}
          {/* ============================================================ */}
          {step === 1 && (
            <div className="text-center py-3 space-y-6">
              <div className="relative inline-block mx-auto mt-2">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 mx-auto">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] tracking-wider uppercase shadow">
                  AI
                </span>
              </div>

              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  Your Journey to a Healthier You Starts Here
                </h1>
                <p
                  className={`text-sm mt-2 max-w-xs mx-auto leading-relaxed ${
                    isDayMode ? 'text-neutral-600' : 'text-neutral-400'
                  }`}
                >
                  Let's build a plan that fits your life, not the other way around.
                </p>
              </div>

              {/* Feature Highlight Pill Badges */}
              <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto text-left text-xs">
                <div
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                    isDayMode ? 'bg-[#f7f9f6] border-[#e5e9e3]' : 'bg-neutral-800/50 border-neutral-800'
                  }`}
                >
                  <Camera className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold">Instant AI Vision</span>
                </div>
                <div
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                    isDayMode ? 'bg-[#f7f9f6] border-[#e5e9e3]' : 'bg-neutral-800/50 border-neutral-800'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-semibold">Custom Blueprint</span>
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 2: Weight Loss Motivation                             */}
          {/* ============================================================ */}
          {step === 2 && (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Step 1 of 10
                </span>
                <h2
                  className={`text-xl font-extrabold mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  What's driving your desire to feel healthier?
                </h2>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  { label: 'Feel confident in my own skin', icon: Smile },
                  { label: 'Build a stronger, healthier body', icon: Dumbbell },
                  { label: 'Wake up feeling energized every day', icon: Zap },
                  { label: 'Regain control of my health', icon: Heart },
                  { label: 'Something personal to me', icon: Sparkles },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = motivation === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setMotivation(opt.label);
                        setTimeout(nextStep, 250);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : isDayMode
                          ? 'bg-[#f7f9f6] border-[#e2e6e0] hover:bg-[#eef2ed] text-neutral-800'
                          : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : isDayMode
                              ? 'bg-white text-neutral-600 border border-neutral-200'
                              : 'bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold">{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 3: Diet History                                       */}
          {/* ============================================================ */}
          {step === 3 && (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Past Experience
                </span>
                <h2
                  className={`text-xl font-extrabold mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  Have any eating styles worked well for you in the past?
                </h2>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  'Intermittent Fasting',
                  'Keto / Low Carb',
                  'Plant-Based / Vegetarian',
                  'Calorie Awareness',
                  'Something else entirely',
                ].map((style) => {
                  const isSelected = dietHistory === style;
                  return (
                    <button
                      key={style}
                      onClick={() => {
                        setDietHistory(style);
                        setTimeout(nextStep, 250);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : isDayMode
                          ? 'bg-[#f7f9f6] border-[#e2e6e0] hover:bg-[#eef2ed] text-neutral-800'
                          : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      <span className="text-sm font-semibold">{style}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 4: Weight Unit Preference                            */}
          {/* ============================================================ */}
          {step === 4 && (
            <div className="space-y-4 py-2 text-center">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Units
                </span>
                <h2
                  className={`text-xl font-extrabold mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  How would you like to track your progress?
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  You can change this anytime in your preferences.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => {
                    setUnitSystem('imperial');
                    setTimeout(nextStep, 250);
                  }}
                  className={`p-6 rounded-3xl border flex flex-col items-center justify-center transition cursor-pointer ${
                    unitSystem === 'imperial'
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : isDayMode
                      ? 'bg-[#f7f9f6] border-[#e2e6e0] hover:bg-[#eef2ed] text-neutral-800'
                      : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                  }`}
                >
                  <Scale className="w-8 h-8 mb-2 text-emerald-500" />
                  <span className="font-extrabold text-base">Pounds (lbs)</span>
                  <span className="text-xs text-neutral-400 mt-0.5">Imperial system</span>
                </button>

                <button
                  onClick={() => {
                    setUnitSystem('metric');
                    setTimeout(nextStep, 250);
                  }}
                  className={`p-6 rounded-3xl border flex flex-col items-center justify-center transition cursor-pointer ${
                    unitSystem === 'metric'
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : isDayMode
                      ? 'bg-[#f7f9f6] border-[#e2e6e0] hover:bg-[#eef2ed] text-neutral-800'
                      : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                  }`}
                >
                  <Scale className="w-8 h-8 mb-2 text-emerald-500" />
                  <span className="font-extrabold text-base">Kilograms (kg)</span>
                  <span className="text-xs text-neutral-400 mt-0.5">Metric system</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 5: Weight Loss Pace                                  */}
          {/* ============================================================ */}
          {step === 5 && (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Pacing
                </span>
                <h2
                  className={`text-xl font-extrabold mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  What pace feels right for your lifestyle?
                </h2>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  {
                    id: 'steady',
                    label: 'Steady & Sustainable',
                    rate: isImperial ? '0.5 lbs / week' : '0.2 kg / week',
                    desc: 'Gentle deficit, easily maintained long-term.',
                  },
                  {
                    id: 'balanced',
                    label: 'Balanced & Recommended',
                    rate: isImperial ? '1.0 lb / week' : '0.4 kg / week',
                    desc: 'Optimal balance of steady fat loss and energy.',
                    recommended: true,
                  },
                  {
                    id: 'focused',
                    label: 'Focused & Committed',
                    rate: isImperial ? '1.3 lbs / week' : '0.6 kg / week',
                    desc: 'Faster results for dedicated tracking.',
                  },
                  {
                    id: 'ambitious',
                    label: 'Ambitious & Driven',
                    rate: isImperial ? '1.8 lbs / week' : '0.8 kg / week',
                    desc: 'Higher deficit, suited for short timelines.',
                  },
                ].map((item) => {
                  const isSelected = pace === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPace(item.id as any);
                        setTimeout(nextStep, 250);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left relative transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : isDayMode
                          ? 'bg-[#f7f9f6] border-[#e2e6e0] hover:bg-[#eef2ed] text-neutral-800'
                          : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      {item.recommended && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider">
                          Recommended
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-sm block">{item.label}</span>
                          <span className="text-xs text-emerald-500 font-mono font-bold mt-0.5 block">
                            {item.rate}
                          </span>
                          <span className="text-[11px] text-neutral-400 mt-1 block">
                            {item.desc}
                          </span>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 6: BMR / Personal Details                             */}
          {/* ============================================================ */}
          {step === 6 && (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Metabolic Baseline
                </span>
                <h2
                  className={`text-xl font-extrabold mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  Let's personalize your plan. What's your gender?
                </h2>
              </div>

              {/* Gender selector */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['female', 'male', 'other'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`py-3 px-2 rounded-2xl border text-xs font-bold capitalize transition cursor-pointer ${
                      gender === g
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                        : isDayMode
                        ? 'bg-[#f7f9f6] border-[#e2e6e0] text-neutral-700'
                        : 'bg-neutral-800/60 border-neutral-800 text-neutral-300'
                    }`}
                  >
                    {g === 'other' ? 'Prefer not to say' : g}
                  </button>
                ))}
              </div>

              {/* Birth year */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDayMode ? 'bg-[#f7f9f6] border-[#e2e6e0]' : 'bg-neutral-800/40 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">When were you born?</span>
                  <span className="text-sm font-mono font-extrabold text-emerald-500">
                    {birthYear} ({new Date().getFullYear() - birthYear} yrs)
                  </span>
                </div>
                <input
                  type="range"
                  min="1940"
                  max="2010"
                  value={birthYear}
                  onChange={(e) => setBirthYear(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Height */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDayMode ? 'bg-[#f7f9f6] border-[#e2e6e0]' : 'bg-neutral-800/40 border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold">How tall are you?</span>
                  <span className="text-sm font-mono font-extrabold text-emerald-500">
                    {isImperial
                      ? `${Math.floor(heightCm / 30.48)}' ${Math.round((heightCm % 30.48) / 2.54)}"`
                      : `${heightCm} cm`}
                  </span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <button
                onClick={nextStep}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                Continue
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 7: Current Weight                                    */}
          {/* ============================================================ */}
          {step === 7 && (
            <div className="space-y-4 py-2 text-center">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Starting Point
                </span>
                <h2
                  className={`text-xl font-extrabold mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  What do you currently weigh?
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Slide to match your current scale reading.
                </p>
              </div>

              {/* Large Weight Readout */}
              <div className="py-4">
                <div className="flex items-baseline justify-center gap-1.5 font-mono">
                  <span
                    className={`text-5xl font-black ${
                      isDayMode ? 'text-neutral-900' : 'text-white'
                    }`}
                  >
                    {displayCurrentWeight}
                  </span>
                  <span className="text-xl font-bold text-emerald-500">{weightUnitLabel}</span>
                </div>
              </div>

              {/* Weight Slider */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDayMode ? 'bg-[#f7f9f6] border-[#e2e6e0]' : 'bg-neutral-800/40 border-neutral-800'
                }`}
              >
                <input
                  type="range"
                  min={isImperial ? 88 : 40}
                  max={isImperial ? 330 : 150}
                  value={displayCurrentWeight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setWeightKg(isImperial ? Math.round(val / 2.20462) : val);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer h-2"
                />
                <div className="flex justify-between text-[11px] text-neutral-400 mt-2 font-mono">
                  <span>{isImperial ? '88 lbs' : '40 kg'}</span>
                  <span>{isImperial ? '330 lbs' : '150 kg'}</span>
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                Confirm Weight
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 8: Activity Level                                    */}
          {/* ============================================================ */}
          {step === 8 && (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Movement
                </span>
                <h2
                  className={`text-xl font-extrabold mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  How often do you move your body?
                </h2>
              </div>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'sedentary', label: 'Sedentary (Rarely exercise)', icon: Clock },
                  { id: 'light', label: 'Lightly Active (1-2 times/week)', icon: Activity },
                  { id: 'moderate', label: 'Moderately Active (2-4 times/week)', icon: Dumbbell },
                  { id: 'very_active', label: 'Very Active (4+ times/week)', icon: Flame },
                  { id: 'athlete', label: 'Athlete (Daily intense training)', icon: Zap },
                ].map((item) => {
                  const isSelected = activityLevel === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivityLevel(item.id as any);
                        setTimeout(nextStep, 250);
                      }}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : isDayMode
                          ? 'bg-[#f7f9f6] border-[#e2e6e0] hover:bg-[#eef2ed] text-neutral-800'
                          : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 9: Goal Weight                                       */}
          {/* ============================================================ */}
          {step === 9 && (
            <div className="space-y-4 py-2 text-center">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  The Destination
                </span>
                <h2
                  className={`text-xl font-extrabold mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  What's your dream weight?
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  We'll calculate the safest calorie deficit to get you there.
                </p>
              </div>

              {/* Large Goal Readout */}
              <div className="py-4">
                <div className="flex items-baseline justify-center gap-1.5 font-mono">
                  <span
                    className={`text-5xl font-black ${
                      isDayMode ? 'text-neutral-900' : 'text-white'
                    }`}
                  >
                    {displayGoalWeight}
                  </span>
                  <span className="text-xl font-bold text-emerald-500">{weightUnitLabel}</span>
                </div>
                {displayCurrentWeight > displayGoalWeight && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-500/10 px-3 py-1 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Targeting {displayCurrentWeight - displayGoalWeight} {weightUnitLabel} reduction
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isDayMode ? 'bg-[#f7f9f6] border-[#e2e6e0]' : 'bg-neutral-800/40 border-neutral-800'
                }`}
              >
                <input
                  type="range"
                  min={isImperial ? 88 : 40}
                  max={isImperial ? 260 : 120}
                  value={displayGoalWeight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setGoalWeightKg(isImperial ? Math.round(val / 2.20462) : val);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer h-2"
                />
              </div>

              <button
                onClick={nextStep}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                Set Goal Weight
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 10: Macro Goals                                      */}
          {/* ============================================================ */}
          {step === 10 && (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Macronutrients
                </span>
                <h2
                  className={`text-xl font-extrabold mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  Let's fine-tune your nutrition plan.
                </h2>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  {
                    id: 'balanced',
                    label: 'Balanced Lifestyle',
                    sub: '45% Carbs, 30% Protein, 25% Fat',
                  },
                  {
                    id: 'muscle',
                    label: 'Muscle Building',
                    sub: '40% Carbs, 35% Protein, 25% Fat',
                  },
                  {
                    id: 'keto',
                    label: 'Keto / High Fat',
                    sub: '5% Carbs, 25% Protein, 70% Fat',
                  },
                  {
                    id: 'lowcarb',
                    label: 'Low Carb',
                    sub: '20% Carbs, 40% Protein, 40% Fat',
                  },
                  {
                    id: 'custom',
                    label: 'Custom Plan (Fine-tune myself)',
                    sub: 'Full manual control in macro editor',
                  },
                ].map((item) => {
                  const isSelected = macroPreset === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMacroPreset(item.id as any);
                        setTimeout(nextStep, 250);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : isDayMode
                          ? 'bg-[#f7f9f6] border-[#e2e6e0] hover:bg-[#eef2ed] text-neutral-800'
                          : 'bg-neutral-800/40 border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm block">{item.label}</span>
                        <span className="text-xs text-neutral-400 block mt-0.5">{item.sub}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 11: AI Camera Introduction                           */}
          {/* ============================================================ */}
          {step === 11 && (
            <div className="space-y-4 py-2 text-center">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Vision Engine
                </span>
                <h2
                  className={`text-2xl font-black mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  Snap a photo. We'll do the math.
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                  Point your camera at any meal to identify calories and macros in under 2 seconds.
                </p>
              </div>

              {/* Simulated Camera Viewfinder Card */}
              <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-xl bg-neutral-950 p-4 aspect-4/3 flex flex-col justify-between">
                {/* Viewfinder corners */}
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                  <div className="w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                </div>

                {/* Simulated Detected Plate */}
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto mb-2 text-2xl animate-pulse">
                    🥗
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Mediterranean Salmon Bowl • 480 kcal
                  </div>
                  <div className="flex justify-center gap-3 mt-2 text-[10px] text-neutral-300 font-mono">
                    <span>🍗 42g Protein</span>
                    <span>🌾 38g Carbs</span>
                    <span>🥑 16g Fat</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                  <div className="w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br" />
                </div>
              </div>

              <button
                onClick={nextStep}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                I'm Ready
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 12: Commitment Screen                                */}
          {/* ============================================================ */}
          {step === 12 && (
            <div className="space-y-5 py-4 text-center">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  The Pledge
                </span>
                <h2
                  className={`text-lg sm:text-xl font-extrabold mt-2 leading-snug px-2 ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  "I commit to showing up for myself, one meal at a time. Together, we'll build a healthier, happier me."
                </h2>
                <p className="text-xs text-neutral-400 mt-2">
                  Press and hold to make it official.
                </p>
              </div>

              {/* Interactive Press and Hold Button with Circular Progress */}
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      strokeWidth="6"
                      fill="transparent"
                      className={isDayMode ? 'stroke-neutral-200' : 'stroke-neutral-800'}
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      strokeWidth="6"
                      strokeLinecap="round"
                      fill="transparent"
                      strokeDasharray="402.1"
                      strokeDashoffset={402.1 - (402.1 * holdProgress) / 100}
                      className="stroke-emerald-500 transition-all duration-75"
                    />
                  </svg>

                  <button
                    type="button"
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={() => setIsHolding(true)}
                    onTouchEnd={() => setIsHolding(false)}
                    className={`absolute w-28 h-28 rounded-full flex flex-col items-center justify-center font-bold text-xs select-none transition-transform active:scale-95 cursor-pointer shadow-xl ${
                      isCommitted
                        ? 'bg-emerald-500 text-white'
                        : isHolding
                        ? 'bg-emerald-600 text-white scale-95'
                        : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white'
                    }`}
                  >
                    {isCommitted ? (
                      <Check className="w-8 h-8" />
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 mb-1" />
                        <span>HOLD</span>
                      </>
                    )}
                  </button>
                </div>

                <span className="text-[11px] text-neutral-400 font-mono mt-3">
                  {holdProgress > 0 ? `${holdProgress}% confirmed` : 'Touch & hold the button'}
                </span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SCREEN 13: Personalized Plan Reveal                         */}
          {/* ============================================================ */}
          {step === 13 && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <Award className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Success Blueprint
                </span>
                <h2
                  className={`text-2xl font-black mt-1 tracking-tight ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  Your custom blueprint is ready.
                </h2>
                <p
                  className={`text-xs mt-1.5 max-w-xs mx-auto leading-relaxed ${
                    isDayMode ? 'text-neutral-600' : 'text-neutral-400'
                  }`}
                >
                  Based on your goals, hitting {calculatedCalories.toLocaleString()} calories a day puts you at {displayGoalWeight} {weightUnitLabel} by {targetDateFormatted}.
                </p>
              </div>

              {/* Target Stat Cards */}
              <div className="grid grid-cols-2 gap-2.5 my-3">
                <div
                  className={`p-3.5 rounded-2xl border text-center ${
                    isDayMode ? 'bg-[#f7f9f6] border-[#e2e6e0]' : 'bg-neutral-800/40 border-neutral-800'
                  }`}
                >
                  <span className="text-[10px] text-neutral-400 font-semibold block">DAILY BUDGET</span>
                  <div className="flex items-center justify-center gap-1 mt-1 font-mono">
                    <Flame className="w-4 h-4 text-emerald-500" />
                    <span className="text-xl font-extrabold">{calculatedCalories}</span>
                    <span className="text-xs text-neutral-400">kcal</span>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border text-center ${
                    isDayMode ? 'bg-[#f7f9f6] border-[#e2e6e0]' : 'bg-neutral-800/40 border-neutral-800'
                  }`}
                >
                  <span className="text-[10px] text-neutral-400 font-semibold block">TARGET DATE</span>
                  <div className="flex items-center justify-center gap-1 mt-1 font-mono">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    <span className="text-base font-extrabold">{targetDateFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Macro Trio */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-around ${
                  isDayMode ? 'bg-[#f7f9f6] border-[#e2e6e0]' : 'bg-neutral-800/40 border-neutral-800'
                }`}
              >
                <div>
                  <span className="text-[10px] text-amber-500 font-bold block">CARBS</span>
                  <span className="text-sm font-extrabold font-mono">{targetCarbs}g</span>
                </div>
                <div className="w-[1px] h-6 bg-neutral-200 dark:bg-neutral-800" />
                <div>
                  <span className="text-[10px] text-rose-500 font-bold block">PROTEIN</span>
                  <span className="text-sm font-extrabold font-mono">{targetProtein}g</span>
                </div>
                <div className="w-[1px] h-6 bg-neutral-200 dark:bg-neutral-800" />
                <div>
                  <span className="text-[10px] text-sky-500 font-bold block">FAT</span>
                  <span className="text-sm font-extrabold font-mono">{targetFat}g</span>
                </div>
              </div>

              <button
                onClick={handleFinishBlueprint}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start My Journey</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
