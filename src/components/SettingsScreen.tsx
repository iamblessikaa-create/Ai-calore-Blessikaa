import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  User,
  Shield,
  Bell,
  Camera,
  Heart,
  Crown,
  Check,
  X,
  RotateCcw,
  Sliders,
  Sparkles,
  Calculator,
  Target,
  Droplets,
  Flame,
  Utensils,
  Clock,
  Dumbbell,
  Activity,
  Sun,
  Moon,
  ArrowLeft,
  ChevronRight,
  Download,
  Trash2,
  HelpCircle,
  MessageSquare,
  Lock,
  Info,
  Home,
  BarChart2,
  Plus,
  Smartphone,
  Gauge,
  Copy,
  CheckCircle2,
  TrendingUp,
  Mic,
  Pencil,
} from 'lucide-react';
import {
  UserProfile,
  DailyGoals,
  PermissionsState,
  SubscriptionState,
  LoggedMeal,
} from '../types/nutrition';
import { WeightRuler } from './WeightRuler';
import { PermissionType } from './PermissionModal';

interface SettingsScreenProps {
  userProfile: UserProfile;
  goals: DailyGoals;
  permissions: PermissionsState;
  subscription: SubscriptionState;
  meals?: LoggedMeal[];
  isDayMode: boolean;
  onToggleDayMode: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onUpdateGoals: (updated: DailyGoals) => void;
  onRequestPermission: (type: PermissionType) => void;
  onOpenPaywall: () => void;
  onResetData: () => void;
  onNavigateHome: () => void;
  onOpenAnalytics: () => void;
  onOpenAIChat: () => void;
  onOpenQuickLog: () => void;
  onClose?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userProfile,
  goals,
  permissions,
  subscription,
  meals = [],
  isDayMode,
  onToggleDayMode,
  onUpdateProfile,
  onUpdateGoals,
  onRequestPermission,
  onOpenPaywall,
  onResetData,
  onNavigateHome,
  onOpenAnalytics,
  onOpenAIChat,
  onOpenQuickLog,
  onClose,
}) => {
  // Navigation sub-view inside Settings
  const [subView, setSubView] = useState<
    'main' | 'profile' | 'targets' | 'weight' | 'goalWeight' | 'reminders' | 'export' | 'deleteConfirm' | 'faq'
  >('main');

  // Form states for profile and goals
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [activeGoals, setActiveGoals] = useState<DailyGoals>(goals);

  // Temporary weight state for weight rulers
  const [tempWeight, setTempWeight] = useState<number>(userProfile.weightKg || 90);
  const [tempGoal, setTempGoal] = useState<number>(userProfile.targetWeightKg || 80);

  // Preference switches
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [waterReminderEnabled, setWaterReminderEnabled] = useState(true);
  const [streakShieldAlert, setStreakShieldAlert] = useState(true);

  // Reminder times
  const [breakfastTime, setBreakfastTime] = useState('08:00 AM');
  const [lunchTime, setLunchTime] = useState('01:00 PM');
  const [dinnerTime, setDinnerTime] = useState('07:30 PM');

  // Copy feedback state
  const [copied, setCopied] = useState(false);

  // Dynamic BMI Calculation
  const heightM = (profile.heightCm || 180) / 100;
  const currentBmi = Number((profile.weightKg / (heightM * heightM)).toFixed(1));
  const bmiCategory =
    currentBmi < 18.5
      ? 'Underweight'
      : currentBmi < 25
      ? 'Normal weight'
      : currentBmi < 30
      ? 'Overweight'
      : 'Obese';

  // Mifflin-St Jeor TDEE & Macro Calculation Engine
  const calculateTDEE = (
    weight: number,
    height: number,
    age: number,
    sex: string,
    activity: string,
    goal: string
  ) => {
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr += sex === 'male' ? 5 : -161;

    const mults: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very_active: 1.725,
    };
    const tdee = Math.round(bmr * (mults[activity] || 1.55));

    let targetCal = tdee;
    if (goal === 'cut') targetCal -= 450;
    if (goal === 'bulk') targetCal += 350;

    // Macro calculation (e.g. 2.0g - 2.2g protein per kg)
    const targetProtein = Math.round(weight * 2.0);
    const proteinKcal = targetProtein * 4;
    const fatKcal = Math.round(targetCal * 0.25);
    const targetFat = Math.round(fatKcal / 9);
    const carbsKcal = targetCal - proteinKcal - fatKcal;
    const targetCarbs = Math.max(50, Math.round(carbsKcal / 4));

    return {
      calories: targetCal,
      protein: targetProtein,
      carbs: targetCarbs,
      fat: targetFat,
      waterMl: Math.round(weight * 35),
    };
  };

  const handleAutoRecalculate = () => {
    const computed = calculateTDEE(
      profile.weightKg,
      profile.heightCm,
      profile.age,
      profile.sex,
      profile.activityLevel,
      profile.goal
    );
    setActiveGoals((prev) => ({
      ...prev,
      calories: computed.calories,
      protein: computed.protein,
      carbs: computed.carbs,
      fat: computed.fat,
      waterMl: computed.waterMl,
    }));
  };

  const handleSaveProfile = () => {
    onUpdateProfile(profile);
    setSubView('main');
  };

  const handleSaveTargets = () => {
    onUpdateGoals(activeGoals);
    setSubView('main');
  };

  const handleSaveWeight = () => {
    const updated = { ...profile, weightKg: tempWeight };
    setProfile(updated);
    onUpdateProfile(updated);
    setSubView('main');
  };

  const handleSaveGoal = () => {
    const updated = { ...profile, targetWeightKg: tempGoal };
    setProfile(updated);
    onUpdateProfile(updated);
    setSubView('main');
  };

  const handleCopyExport = () => {
    const exportData = {
      profile,
      goals: activeGoals,
      todayConsumed: {
        totalCalories: meals.reduce((acc, m) => acc + m.totalCalories, 0),
        totalProtein: meals.reduce((acc, m) => acc + m.totalProtein, 0),
        totalCarbs: meals.reduce((acc, m) => acc + m.totalCarbs, 0),
        totalFat: meals.reduce((acc, m) => acc + m.totalFat, 0),
        loggedMealCount: meals.length,
      },
      exportTimestamp: new Date().toISOString(),
    };
    navigator.clipboard?.writeText(JSON.stringify(exportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // SUBVIEW: "How much do you Weigh Today?" (Exact ditto Weight Ruler)
  // -------------------------------------------------------------
  if (subView === 'weight') {
    return (
      <div className="flex flex-col min-h-[780px] justify-between pb-6 px-1 pt-1">
        <div>
          {/* Top Back Button */}
          <button
            type="button"
            onClick={() => setSubView('main')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isDayMode
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1
            className={`text-2xl sm:text-3xl font-bold mt-7 mb-10 tracking-tight ${
              isDayMode ? 'text-neutral-900' : 'text-white'
            }`}
          >
            How much do you Weigh Today?
          </h1>

          {/* Center Card with Value & Ruler */}
          <div
            className={`w-full rounded-3xl p-6 sm:p-8 border shadow-xs text-center transition ${
              isDayMode
                ? 'bg-white border-neutral-100 shadow-neutral-200/50'
                : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            <span className="text-xs font-semibold text-neutral-400 block mb-1">
              In kg
            </span>
            <div
              className={`text-6xl sm:text-7xl font-extrabold tracking-tight mb-6 font-mono ${
                isDayMode ? 'text-neutral-900' : 'text-white'
              }`}
            >
              {tempWeight}
            </div>

            <WeightRuler
              value={tempWeight}
              min={40}
              max={180}
              step={1}
              onChange={setTempWeight}
              isDayMode={isDayMode}
            />
          </div>
        </div>

        {/* Bottom Save Action Button */}
        <div className="pt-8">
          <button
            type="button"
            onClick={handleSaveWeight}
            className="w-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-[0.99] text-white py-4 rounded-full font-bold text-base shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            Save Weight
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUBVIEW: "What is your weight goal?" (Exact ditto Weight Ruler)
  // -------------------------------------------------------------
  if (subView === 'goalWeight') {
    return (
      <div className="flex flex-col min-h-[780px] justify-between pb-6 px-1 pt-1">
        <div>
          {/* Top Back Button */}
          <button
            type="button"
            onClick={() => setSubView('main')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isDayMode
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1
            className={`text-2xl sm:text-3xl font-bold mt-7 mb-10 tracking-tight ${
              isDayMode ? 'text-neutral-900' : 'text-white'
            }`}
          >
            What is your weight goal?
          </h1>

          {/* Center Card with Value & Ruler */}
          <div
            className={`w-full rounded-3xl p-6 sm:p-8 border shadow-xs text-center transition ${
              isDayMode
                ? 'bg-white border-neutral-100 shadow-neutral-200/50'
                : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            <span className="text-xs font-semibold text-neutral-400 block mb-1">
              In kg
            </span>
            <div
              className={`text-6xl sm:text-7xl font-extrabold tracking-tight mb-6 font-mono ${
                isDayMode ? 'text-neutral-900' : 'text-white'
              }`}
            >
              {tempGoal}
            </div>

            <WeightRuler
              value={tempGoal}
              min={35}
              max={160}
              step={1}
              onChange={setTempGoal}
              isDayMode={isDayMode}
            />
          </div>
        </div>

        {/* Bottom Save Action Button */}
        <div className="pt-8">
          <button
            type="button"
            onClick={handleSaveGoal}
            className="w-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-[0.99] text-white py-4 rounded-full font-bold text-base shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            Save Target Goal
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUBVIEW: Edit Profile
  // -------------------------------------------------------------
  if (subView === 'profile') {
    return (
      <div className="flex flex-col min-h-[780px] justify-between pb-6 px-1 pt-1">
        <div className="space-y-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSubView('main')}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold">Edit Profile</h2>
            <div className="w-11" />
          </div>

          <div
            className={`p-5 rounded-3xl border space-y-4 ${
              isDayMode ? 'bg-white border-neutral-200 shadow-xs' : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#5dba7d] ${
                  isDayMode
                    ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                    : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#5dba7d] ${
                  isDayMode
                    ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                    : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Biological Sex
                </label>
                <select
                  value={profile.sex}
                  onChange={(e) => setProfile({ ...profile, sex: e.target.value as any })}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#5dba7d] ${
                    isDayMode
                      ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                      : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                  }`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Age (years)
                </label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 25 })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#5dba7d] ${
                    isDayMode
                      ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                      : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={profile.heightCm}
                onChange={(e) => setProfile({ ...profile, heightCm: parseInt(e.target.value) || 175 })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[#5dba7d] ${
                  isDayMode
                    ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                    : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Activity Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'sedentary', label: 'Sedentary', sub: 'Desk job, low exercise' },
                  { id: 'light', label: 'Light', sub: '1-2 workouts/week' },
                  { id: 'moderate', label: 'Moderate', sub: '3-5 workouts/week' },
                  { id: 'very_active', label: 'Very Active', sub: '6-7 heavy sessions' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, activityLevel: act.id as any })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      profile.activityLevel === act.id
                        ? 'border-[#5dba7d] bg-[#5dba7d]/10 text-[#5dba7d]'
                        : isDayMode
                        ? 'border-neutral-200 bg-[#f7f9f6] text-neutral-700'
                        : 'border-[#29382b] bg-[#1a231d] text-neutral-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{act.label}</span>
                    <span className="text-[10px] text-neutral-400">{act.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                Transformation Goal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cut', label: 'Fat Loss', sub: '-450 kcal' },
                  { id: 'maintain', label: 'Maintain', sub: 'Equilibrium' },
                  { id: 'bulk', label: 'Lean Mass', sub: '+350 kcal' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setProfile({ ...profile, goal: g.id as any })}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      profile.goal === g.id
                        ? 'border-[#5dba7d] bg-[#5dba7d]/10 text-[#5dba7d]'
                        : isDayMode
                        ? 'border-neutral-200 bg-[#f7f9f6] text-neutral-700'
                        : 'border-[#29382b] bg-[#1a231d] text-neutral-300'
                    }`}
                  >
                    <span className="text-xs font-bold block">{g.label}</span>
                    <span className="text-[10px] text-neutral-400">{g.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="w-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-[0.99] text-white py-4 rounded-full font-bold text-base shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            Save Profile
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUBVIEW: Edit Daily Targets & Macros
  // -------------------------------------------------------------
  if (subView === 'targets') {
    return (
      <div className="flex flex-col min-h-[780px] justify-between pb-6 px-1 pt-1">
        <div className="space-y-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSubView('main')}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold">Daily Targets & Macros</h2>
            <div className="w-11" />
          </div>

          {/* Auto Calculate TDEE Card */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isDayMode
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-emerald-950/20 border-emerald-900/40'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-[#5dba7d] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Auto-Compute (Mifflin-St Jeor)
              </span>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Calculates from {profile.weightKg}kg bodyweight & {profile.goal} goal
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoRecalculate}
              className="px-3 py-1.5 bg-[#5dba7d] hover:bg-[#50a76e] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              Compute
            </button>
          </div>

          <div
            className={`p-5 rounded-3xl border space-y-4 ${
              isDayMode ? 'bg-white border-neutral-200 shadow-xs' : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            {/* Daily Calorie Budget */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-500" /> Daily Calorie Budget (kcal)
              </label>
              <input
                type="number"
                value={activeGoals.calories}
                onChange={(e) =>
                  setActiveGoals({ ...activeGoals, calories: parseInt(e.target.value) || 0 })
                }
                className={`w-full px-3.5 py-2.5 rounded-xl border text-base font-mono font-bold focus:outline-none focus:border-[#5dba7d] ${
                  isDayMode
                    ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                    : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                }`}
              />
            </div>

            {/* 3 Macro Columns */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-rose-500 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={activeGoals.protein}
                  onChange={(e) =>
                    setActiveGoals({ ...activeGoals, protein: parseInt(e.target.value) || 0 })
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:border-rose-500 ${
                    isDayMode
                      ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                      : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                  }`}
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  {Math.round(((activeGoals.protein * 4) / (activeGoals.calories || 1)) * 100)}% kcal
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-500 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={activeGoals.carbs}
                  onChange={(e) =>
                    setActiveGoals({ ...activeGoals, carbs: parseInt(e.target.value) || 0 })
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:border-amber-500 ${
                    isDayMode
                      ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                      : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                  }`}
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  {Math.round(((activeGoals.carbs * 4) / (activeGoals.calories || 1)) * 100)}% kcal
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-sky-500 mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={activeGoals.fat}
                  onChange={(e) =>
                    setActiveGoals({ ...activeGoals, fat: parseInt(e.target.value) || 0 })
                  }
                  className={`w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:border-sky-500 ${
                    isDayMode
                      ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                      : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                  }`}
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  {Math.round(((activeGoals.fat * 9) / (activeGoals.calories || 1)) * 100)}% kcal
                </span>
              </div>
            </div>

            {/* Water Target */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-500" /> Daily Water Intake (ml)
              </label>
              <input
                type="number"
                step="100"
                value={activeGoals.waterMl}
                onChange={(e) =>
                  setActiveGoals({ ...activeGoals, waterMl: parseInt(e.target.value) || 0 })
                }
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold focus:outline-none focus:border-sky-500 ${
                  isDayMode
                    ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-900'
                    : 'bg-[#1d2620] border-[#2b3a2e] text-white'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={handleSaveTargets}
            className="w-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-[0.99] text-white py-4 rounded-full font-bold text-base shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            Save Targets
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUBVIEW: Meal & Hydration Reminders
  // -------------------------------------------------------------
  if (subView === 'reminders') {
    return (
      <div className="flex flex-col min-h-[780px] justify-between pb-6 px-1 pt-1">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSubView('main')}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold">Meal Reminders</h2>
            <div className="w-11" />
          </div>

          <div
            className={`p-5 rounded-3xl border divide-y ${
              isDayMode
                ? 'bg-white border-neutral-200 divide-neutral-100'
                : 'bg-[#151c17] border-[#243026] divide-[#243026]'
            }`}
          >
            {/* Breakfast Reminder */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Breakfast Reminder</h4>
                <p className="text-xs text-neutral-400">Log morning meal & fuel your day</p>
              </div>
              <input
                type="text"
                value={breakfastTime}
                onChange={(e) => setBreakfastTime(e.target.value)}
                className={`w-24 text-center px-2 py-1 rounded-lg border text-xs font-bold font-mono ${
                  isDayMode ? 'bg-[#f7f9f6] border-neutral-200' : 'bg-[#1d2620] border-[#2b3a2e]'
                }`}
              />
            </div>

            {/* Lunch Reminder */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Lunch Reminder</h4>
                <p className="text-xs text-neutral-400">Midday nutrition check-in</p>
              </div>
              <input
                type="text"
                value={lunchTime}
                onChange={(e) => setLunchTime(e.target.value)}
                className={`w-24 text-center px-2 py-1 rounded-lg border text-xs font-bold font-mono ${
                  isDayMode ? 'bg-[#f7f9f6] border-neutral-200' : 'bg-[#1d2620] border-[#2b3a2e]'
                }`}
              />
            </div>

            {/* Dinner Reminder */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Dinner Reminder</h4>
                <p className="text-xs text-neutral-400">Evening meal & macro reconciliation</p>
              </div>
              <input
                type="text"
                value={dinnerTime}
                onChange={(e) => setDinnerTime(e.target.value)}
                className={`w-24 text-center px-2 py-1 rounded-lg border text-xs font-bold font-mono ${
                  isDayMode ? 'bg-[#f7f9f6] border-neutral-200' : 'bg-[#1d2620] border-[#2b3a2e]'
                }`}
              />
            </div>

            {/* Water Reminder */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Hydration Reminders</h4>
                <p className="text-xs text-neutral-400">Periodic water intake nudge (every 2 hrs)</p>
              </div>
              <button
                type="button"
                onClick={() => setWaterReminderEnabled(!waterReminderEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  waterReminderEnabled ? 'bg-[#5dba7d]' : isDayMode ? 'bg-neutral-300' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    waterReminderEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Streak Shield Alert */}
            <div className="py-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold">Streak Freeze Alert</h4>
                <p className="text-xs text-neutral-400">9:00 PM notice before streak break</p>
              </div>
              <button
                type="button"
                onClick={() => setStreakShieldAlert(!streakShieldAlert)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  streakShieldAlert ? 'bg-[#5dba7d]' : isDayMode ? 'bg-neutral-300' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    streakShieldAlert ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={() => setSubView('main')}
            className="w-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-[0.99] text-white py-4 rounded-full font-bold text-base shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            Apply Reminder Settings
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUBVIEW: Export Nutrition Data
  // -------------------------------------------------------------
  if (subView === 'export') {
    return (
      <div className="flex flex-col min-h-[780px] justify-between pb-6 px-1 pt-1">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSubView('main')}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold">Export Health Data</h2>
            <div className="w-11" />
          </div>

          <div
            className={`p-5 rounded-3xl border space-y-4 ${
              isDayMode ? 'bg-white border-neutral-200 shadow-xs' : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-[#5dba7d] flex items-center justify-center mx-auto mb-2">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Your Data, Under Your Control</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                Export all logged meals, daily macro targets, current weight history, and hydration records in standard JSON format.
              </p>
            </div>

            <div
              className={`p-3.5 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-48 border ${
                isDayMode
                  ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-700'
                  : 'bg-[#1a231d] border-[#29382b] text-neutral-300'
              }`}
            >
              <pre>
                {JSON.stringify(
                  {
                    profile: {
                      name: profile.name,
                      weightKg: profile.weightKg,
                      targetWeightKg: profile.targetWeightKg,
                      heightCm: profile.heightCm,
                    },
                    goals: {
                      calories: activeGoals.calories,
                      protein: activeGoals.protein,
                      carbs: activeGoals.carbs,
                      fat: activeGoals.fat,
                    },
                    totalMealsLoggedToday: meals.length,
                    status: 'verified_backup',
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-2">
          <button
            type="button"
            onClick={handleCopyExport}
            className="w-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-[0.99] text-white py-4 rounded-full font-bold text-base shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-5 h-5" /> Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" /> Copy Data to Clipboard
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUBVIEW: Delete Account Confirmation Dialog
  // -------------------------------------------------------------
  if (subView === 'deleteConfirm') {
    return (
      <div className="flex flex-col min-h-[780px] justify-center items-center pb-6 px-4">
        <div
          className={`w-full max-w-sm p-6 rounded-3xl border text-center space-y-4 shadow-xl ${
            isDayMode ? 'bg-white border-neutral-200' : 'bg-[#161d18] border-[#2b3a2e]'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Trash2 className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-rose-500">Delete Account & Data?</h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              This will permanently delete all your meal logs, weight graph data, streak milestones, and custom macro targets. This action cannot be undone.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                onResetData();
                setSubView('main');
              }}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-sm transition cursor-pointer shadow-lg shadow-rose-600/20"
            >
              Yes, Delete All My Data
            </button>
            <button
              type="button"
              onClick={() => setSubView('main')}
              className={`w-full py-3 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PRIMARY SETTINGS SCREEN (Exact Ditto matching Screenshot Style)
  // -------------------------------------------------------------
  return (
    <div
      className={`w-full min-h-[780px] flex flex-col justify-between transition-colors duration-300 ${
        isDayMode ? 'text-neutral-900' : 'text-neutral-100'
      }`}
    >
      <div className="space-y-6">
        {/* Top Header with Editorial Typography */}
        <div className="pt-1 flex items-baseline justify-between">
          <div>
            <h1
              className={`font-display-serif text-3xl sm:text-4xl font-bold tracking-tight ${
                isDayMode ? 'text-[#19221a]' : 'text-[#f2f6f3]'
              }`}
            >
              Settings
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Personal targets, preferences & health synchronization
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick theme toggle */}
            <button
              type="button"
              onClick={onToggleDayMode}
              title={isDayMode ? 'Switch to Night Mode' : 'Switch to Day Vision'}
              className={`p-2 rounded-full border transition cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
              }`}
            >
              {isDayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-full border transition cursor-pointer ${
                  isDayMode
                    ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
                    : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1. User Profile Hero Card */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition ${
            isDayMode
              ? 'bg-white border-neutral-200/80 shadow-xs'
              : 'bg-[#151c17] border-[#243026]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {/* Profile Avatar with status dot */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-[#5dba7d]/20 text-[#5dba7d] font-black text-lg flex items-center justify-center ring-2 ring-[#5dba7d]/30">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#5dba7d] ring-2 ring-white dark:ring-[#151c17]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base tracking-tight">{profile.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">{profile.email}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Goal: {profile.goal === 'cut' ? 'Fat Loss' : profile.goal === 'bulk' ? 'Muscle Gain' : 'Maintain'} • {profile.weightKg}kg → {profile.targetWeightKg}kg
                </p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={() => setSubView('profile')}
              className={`p-2.5 rounded-2xl border transition cursor-pointer hover:border-[#5dba7d] ${
                isDayMode
                  ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  : 'bg-[#1d2620] border-[#29382b] text-neutral-300 hover:bg-[#232f26]'
              }`}
              title="Edit Profile"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Blessikaa Pro / Cal AI Pro Membership Card */}
        <div
          onClick={onOpenPaywall}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-[#5dba7d]/20 to-amber-500/15 border border-[#5dba7d]/40 flex items-center justify-between cursor-pointer hover:border-[#5dba7d] transition group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-[#5dba7d] text-neutral-950 flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
              <Crown className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm tracking-tight text-white">
                  Cal AI Pro Membership
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5dba7d] text-neutral-950 font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Unlimited AI meal scanning, macro editor & AI coach
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition group-hover:translate-x-0.5" />
        </div>

        {/* 3. GROUP: Nutrition & Daily Targets */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            Nutrition & Daily Targets
          </h3>
          <div
            className={`rounded-3xl border divide-y overflow-hidden ${
              isDayMode
                ? 'bg-white border-neutral-200/80 divide-neutral-100 shadow-xs'
                : 'bg-[#151c17] border-[#243026] divide-[#243026]'
            }`}
          >
            {/* Daily Calorie Budget */}
            <div
              onClick={() => setSubView('targets')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#5dba7d] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Calorie Target</h4>
                  <p className="text-xs text-neutral-400">Daily energy budget</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#5dba7d]">
                  {activeGoals.calories} <span className="text-xs font-normal text-neutral-400">kcal</span>
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

            {/* Macronutrient Split */}
            <div
              onClick={() => setSubView('targets')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Macro Ratio</h4>
                  <p className="text-xs text-neutral-400">Protein, carbs & healthy fats</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-xs font-semibold">
                  <span className="text-rose-500">{activeGoals.protein}g P</span> •{' '}
                  <span className="text-amber-500">{activeGoals.carbs}g C</span> •{' '}
                  <span className="text-sky-500">{activeGoals.fat}g F</span>
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

            {/* Daily Water Intake */}
            <div
              onClick={() => setSubView('targets')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Daily Hydration</h4>
                  <p className="text-xs text-neutral-400">Baseline water target</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-sky-500">
                  {activeGoals.waterMl} <span className="text-xs font-normal text-neutral-400">ml</span>
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

            {/* Auto-Compute TDEE */}
            <div
              onClick={() => setSubView('targets')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Metabolic Calculator</h4>
                  <p className="text-xs text-neutral-400">Mifflin-St Jeor TDEE formula</p>
                </div>
              </div>
              <span className="text-xs text-[#5dba7d] font-bold">Compute</span>
            </div>
          </div>
        </div>

        {/* 4. GROUP: Body Metrics & Weight (Interactive Rulers) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            Body Metrics & Progress
          </h3>
          <div
            className={`rounded-3xl border divide-y overflow-hidden ${
              isDayMode
                ? 'bg-white border-neutral-200/80 divide-neutral-100 shadow-xs'
                : 'bg-[#151c17] border-[#243026] divide-[#243026]'
            }`}
          >
            {/* Current Weight (Opens Ruler) */}
            <div
              onClick={() => {
                setTempWeight(profile.weightKg);
                setSubView('weight');
              }}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#5dba7d]/10 text-[#5dba7d] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Current Weight</h4>
                  <p className="text-xs text-neutral-400">Tap to slide interactive ruler</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm">{profile.weightKg} kg</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

            {/* Weight Goal (Opens Ruler) */}
            <div
              onClick={() => {
                setTempGoal(profile.targetWeightKg);
                setSubView('goalWeight');
              }}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Target Weight Goal</h4>
                  <p className="text-xs text-neutral-400">Target deficit goal</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-emerald-500">
                  {profile.targetWeightKg} kg
                </span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
            </div>

            {/* Height & BMI */}
            <div
              onClick={() => setSubView('profile')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Height & BMI</h4>
                  <p className="text-xs text-neutral-400">
                    {profile.heightCm} cm • BMI {currentBmi} ({bmiCategory})
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>

            {/* Activity Level */}
            <div
              onClick={() => setSubView('profile')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Activity Level</h4>
                  <p className="text-xs text-neutral-400 capitalize">{profile.activityLevel} exercise</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>
          </div>
        </div>

        {/* 5. GROUP: Reminders & Alerts */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            Reminders & Schedule
          </h3>
          <div
            className={`rounded-3xl border divide-y overflow-hidden ${
              isDayMode
                ? 'bg-white border-neutral-200/80 divide-neutral-100 shadow-xs'
                : 'bg-[#151c17] border-[#243026] divide-[#243026]'
            }`}
          >
            {/* Meal Logging Reminders */}
            <div
              onClick={() => setSubView('reminders')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Meal Logging Reminders</h4>
                  <p className="text-xs text-neutral-400">
                    Breakfast {breakfastTime} • Lunch {lunchTime} • Dinner {dinnerTime}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>

            {/* Push Notifications Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#5dba7d] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Push Notifications</h4>
                  <p className="text-xs text-neutral-400">Timely logging alerts & streak badges</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPushEnabled(!pushEnabled);
                  onRequestPermission('notifications');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  pushEnabled ? 'bg-[#5dba7d]' : isDayMode ? 'bg-neutral-300' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    pushEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 6. GROUP: Health & Device Integrations */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            Device & Health Integrations
          </h3>
          <div
            className={`rounded-3xl border divide-y overflow-hidden ${
              isDayMode
                ? 'bg-white border-neutral-200/80 divide-neutral-100 shadow-xs'
                : 'bg-[#151c17] border-[#243026] divide-[#243026]'
            }`}
          >
            {/* Apple Health & Google Fit */}
            <div
              onClick={() => onRequestPermission('healthSync')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Apple Health & Google Fit</h4>
                  <p className="text-xs text-neutral-400">
                    Syncs 8,450 steps & 420 kcal active burn
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#5dba7d] px-2.5 py-1 rounded-full bg-[#5dba7d]/10">
                Connected ✓
              </span>
            </div>

            {/* Camera Access */}
            <div
              onClick={() => onRequestPermission('camera')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Camera Recognition</h4>
                  <p className="text-xs text-neutral-400">AI Food plate scanning & barcodes</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#5dba7d] px-2.5 py-1 rounded-full bg-[#5dba7d]/10">
                Granted ✓
              </span>
            </div>
          </div>
        </div>

        {/* 7. GROUP: Preferences */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            Preferences & Appearance
          </h3>
          <div
            className={`rounded-3xl border divide-y overflow-hidden ${
              isDayMode
                ? 'bg-white border-neutral-200/80 divide-neutral-100 shadow-xs'
                : 'bg-[#151c17] border-[#243026] divide-[#243026]'
            }`}
          >
            {/* Units Segmented Control */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-500/10 text-neutral-400 flex items-center justify-center">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Measurement Units</h4>
                  <p className="text-xs text-neutral-400">Metric (kg, cm, ml) vs Imperial</p>
                </div>
              </div>
              <div
                className={`flex rounded-xl p-1 border text-xs font-bold ${
                  isDayMode ? 'bg-neutral-100 border-neutral-200' : 'bg-[#1d2620] border-[#29382b]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setUnits('metric')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    units === 'metric' ? 'bg-[#5dba7d] text-white shadow-xs' : 'text-neutral-400'
                  }`}
                >
                  Metric
                </button>
                <button
                  type="button"
                  onClick={() => setUnits('imperial')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    units === 'imperial' ? 'bg-[#5dba7d] text-white shadow-xs' : 'text-neutral-400'
                  }`}
                >
                  Imperial
                </button>
              </div>
            </div>

            {/* Theme Switcher */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  {isDayMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-emerald-400" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold">Theme Appearance</h4>
                  <p className="text-xs text-neutral-400">
                    {isDayMode ? 'Day Vision (Screenshot Light Match)' : 'Night Mode (OLED Dark)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleDayMode}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  isDayMode
                    ? 'bg-[#f7f9f6] border-neutral-200 text-neutral-800'
                    : 'bg-[#1d2620] border-[#29382b] text-neutral-200'
                }`}
              >
                {isDayMode ? 'Day Vision' : 'Night Mode'}
              </button>
            </div>

            {/* Sound & Haptics */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-500/10 text-neutral-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Haptic Feedback</h4>
                  <p className="text-xs text-neutral-400">Vibrations on quick log & ruler</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHapticsEnabled(!hapticsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  hapticsEnabled ? 'bg-[#5dba7d]' : isDayMode ? 'bg-neutral-300' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                    hapticsEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 8. GROUP: Data, Privacy & Danger Zone */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            Data & Privacy
          </h3>
          <div
            className={`rounded-3xl border divide-y overflow-hidden ${
              isDayMode
                ? 'bg-white border-neutral-200/80 divide-neutral-100 shadow-xs'
                : 'bg-[#151c17] border-[#243026] divide-[#243026]'
            }`}
          >
            {/* Export Data */}
            <div
              onClick={() => setSubView('export')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#5dba7d] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Export Nutrition Data</h4>
                  <p className="text-xs text-neutral-400">Download backup of logs & goals</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>

            {/* Reset Demo Meals */}
            <div
              onClick={onResetData}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Reset Demo Meals</h4>
                  <p className="text-xs text-neutral-400">Restore today&apos;s meals to default slots</p>
                </div>
              </div>
              <span className="text-xs text-amber-500 font-bold">Reset</span>
            </div>

            {/* Delete Account (Red Danger Button) */}
            <div
              onClick={() => setSubView('deleteConfirm')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-rose-500/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-500">Delete Account & Data</h4>
                  <p className="text-xs text-neutral-400">Permanently erase all stored logs</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-500" />
            </div>
          </div>
        </div>

        {/* 9. GROUP: About & Support */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 px-1">
            About & Support
          </h3>
          <div
            className={`rounded-3xl border divide-y overflow-hidden ${
              isDayMode
                ? 'bg-white border-neutral-200/80 divide-neutral-100 shadow-xs'
                : 'bg-[#151c17] border-[#243026] divide-[#243026]'
            }`}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-500/10 text-neutral-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Help Center & FAQ</h4>
                  <p className="text-xs text-neutral-400">Guides for AI food scanning & macro targets</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-neutral-500/10 text-neutral-400 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">App Version</h4>
                  <p className="text-xs text-neutral-400">Blessikaa Nutrition Engine</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-400">v2.4.1 (Build 500)</span>
            </div>
          </div>
        </div>

        {/* Spacing for bottom navigation bar */}
        <div className="h-20" />
      </div>

      {/* 10. Sticky Bottom Navigation Bar (Matching Screenshot with Settings Active) */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-4 py-2 transition-colors duration-300 ${
          isDayMode
            ? 'bg-white/95 border-neutral-200 text-neutral-600'
            : 'bg-[#131914]/95 border-[#232f25] text-neutral-400'
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          {/* Tab 1: Home */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex flex-col items-center flex-1 py-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
          >
            <Home className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 font-medium">Home</span>
          </button>

          {/* Tab 2: Progress */}
          <button
            type="button"
            onClick={onOpenAnalytics}
            className="flex flex-col items-center flex-1 py-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
          >
            <BarChart2 className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 font-medium">Progress</span>
          </button>

          {/* Tab 3: Elevated Center Green FAB (+) */}
          <div className="flex-1 flex justify-center -mt-7 relative z-50">
            <button
              type="button"
              onClick={onOpenQuickLog}
              title="Log Meal with AI"
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition ring-4 cursor-pointer ${
                isDayMode ? 'ring-[#f6f7f5]' : 'ring-[#0d110e]'
              }`}
            >
              <Plus className="w-7 h-7 stroke-[3]" />
            </button>
          </div>

          {/* Tab 4: Ai Chat */}
          <button
            type="button"
            onClick={onOpenAIChat}
            className="flex flex-col items-center flex-1 py-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
          >
            <Sparkles className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 font-medium">Ai Chat</span>
          </button>

          {/* Tab 5: Settings (Active Highlighted!) */}
          <button
            type="button"
            className={`flex flex-col items-center flex-1 py-1 cursor-pointer transition ${
              isDayMode ? 'text-neutral-900 font-semibold' : 'text-emerald-400 font-semibold'
            }`}
          >
            <Settings className="w-5 h-5 stroke-[2.2] text-[#5dba7d]" />
            <span className="text-[10px] mt-0.5 font-bold text-[#5dba7d]">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
