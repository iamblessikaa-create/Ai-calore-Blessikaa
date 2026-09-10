import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pencil,
  ArrowLeft,
  Home,
  BarChart2,
  Plus,
  Sparkles,
  Settings,
  Scale,
  Flame,
  PieChart,
} from 'lucide-react';
import { UserProfile, DailyGoals, LoggedMeal } from '../types/nutrition';
import { WeightRuler } from './WeightRuler';

interface ProgressScreenProps {
  userProfile: UserProfile;
  goals: DailyGoals;
  meals: LoggedMeal[];
  isDayMode: boolean;
  onUpdateWeight: (newWeight: number) => void;
  onUpdateTargetWeight: (newTarget: number) => void;
  onNavigateHome: () => void;
  onOpenAIChat: () => void;
  onOpenQuickLog: () => void;
  onOpenSettings: () => void;
}

// Stylized classic weight scale icon
const ScaleWeightIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2a3.5 3.5 0 0 0-3.5 3.5c0 .36.06.7.16 1.02L6.1 19.5A2.5 2.5 0 0 0 8.5 22h7a2.5 2.5 0 0 0 2.4-2.5l-2.56-12.98c.1-.32.16-.66.16-1.02A3.5 3.5 0 0 0 12 2zm0 2a1.5 1.5 0 0 1 1.5 1.5c0 .24-.06.46-.16.66l-1.34-.16-1.34.16c-.1-.2-.16-.42-.16-.66A1.5 1.5 0 0 1 12 4z" />
  </svg>
);

// Scale weight icon with a checkmark badge matching "Weight Goal"
const ScaleGoalIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M11 2a3.5 3.5 0 0 0-3.5 3.5c0 .36.06.7.16 1.02L5.1 19.5A2.5 2.5 0 0 0 7.5 22h6.2a6.45 6.45 0 0 1-.7-2H7.5l2.4-12.2c-.22-.38-.4-.83-.4-1.3A3.5 3.5 0 0 1 11 2zm0 2a1.5 1.5 0 0 1 1.5 1.5c0 .24-.06.46-.16.66l-1.34-.16-1.34.16c-.1-.2-.16-.42-.16-.66A1.5 1.5 0 0 1 11 4z" />
    <path
      d="M18 13a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm2.2 3.3l-2.7 2.7-1.2-1.2a.75.75 0 1 0-1.06 1.06l1.73 1.73c.3.3.77.3 1.06 0l3.23-3.23a.75.75 0 1 0-1.06-1.06z"
      fill="#22c55e"
    />
  </svg>
);

interface NutritionDataPoint {
  label: string;
  subLabel?: string;
  calories: number;
  carbs: number; // in grams
  protein: number; // in grams
  fat: number; // in grams
  isToday?: boolean;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  userProfile,
  goals,
  meals,
  isDayMode,
  onUpdateWeight,
  onUpdateTargetWeight,
  onNavigateHome,
  onOpenAIChat,
  onOpenQuickLog,
  onOpenSettings,
}) => {
  // Navigation sub-state for editing weight / goal
  const [subView, setSubView] = useState<'progress' | 'logWeight' | 'weightGoal'>('progress');

  // Category view filter: 'all' | 'weight' | 'nutrition'
  const [sectionFilter, setSectionFilter] = useState<'all' | 'weight' | 'nutrition'>('all');

  // Temporary weight state for rulers
  const [tempWeight, setTempWeight] = useState<number>(userProfile.weightKg);
  const [tempGoal, setTempGoal] = useState<number>(userProfile.targetWeightKg);

  // Segmented control tabs for individual sections
  const [weightTab, setWeightTab] = useState<'week' | 'month' | 'all'>('week');
  const [nutritionTab, setNutritionTab] = useState<'week' | 'month' | 'all'>('week');

  // Interactive selected bar for nutrition details tooltip
  const [selectedNutritionDay, setSelectedNutritionDay] = useState<number | null>(null);

  // Dynamic BMI Calculation
  const heightM = (userProfile.heightCm || 180) / 100;
  const currentBmi = Number((userProfile.weightKg / (heightM * heightM)).toFixed(1));

  let bmiCategory = 'Healthy';
  let bmiBadgeBg = 'bg-[#34c759]';
  let needlePercent = 50;

  if (currentBmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiBadgeBg = 'bg-[#007aff]';
    needlePercent = Math.max(5, (currentBmi / 18.5) * 25);
  } else if (currentBmi <= 24.9) {
    bmiCategory = 'Healthy';
    bmiBadgeBg = 'bg-[#34c759]';
    needlePercent = 25 + ((currentBmi - 18.5) / 6.4) * 25;
  } else if (currentBmi <= 29.9) {
    bmiCategory = 'Overweight';
    bmiBadgeBg = 'bg-[#ff9500]';
    needlePercent = 50 + ((currentBmi - 25.0) / 4.9) * 25;
  } else {
    bmiCategory = 'Obese';
    bmiBadgeBg = 'bg-[#ff3b30]';
    needlePercent = Math.min(95, 75 + ((currentBmi - 30.0) / 10.0) * 25);
  }

  // Handle saving logged weight
  const handleSaveWeight = () => {
    onUpdateWeight(tempWeight);
    setSubView('progress');
  };

  // Handle saving target goal
  const handleSaveGoal = () => {
    onUpdateTargetWeight(tempGoal);
    setSubView('progress');
  };

  // Dynamic Nutrition Calculations based on today's logged meals
  const todayCalories = meals.reduce((s, m) => s + m.totalCalories, 0) || 1680;
  const todayProtein = meals.reduce((s, m) => s + m.totalProtein, 0) || 142;
  const todayCarbs = meals.reduce((s, m) => s + m.totalCarbs, 0) || 188;
  const todayFat = meals.reduce((s, m) => s + m.totalFat, 0) || 44;

  // 1. Weekly Nutrition Data (matching Sat, Sun, Mon, Tue, Wed, Today, Fri)
  const weeklyNutritionData: NutritionDataPoint[] = [
    { label: 'Sat', calories: 1620, carbs: 180, protein: 130, fat: 42 },
    { label: 'Sun', calories: 1740, carbs: 195, protein: 145, fat: 42 },
    { label: 'Mon', calories: 1580, carbs: 175, protein: 135, fat: 38 },
    { label: 'Tue', calories: 1690, carbs: 190, protein: 140, fat: 41 },
    { label: 'Wed', calories: 1780, carbs: 200, protein: 150, fat: 42 },
    { label: 'Today', calories: todayCalories, carbs: todayCarbs, protein: todayProtein, fat: todayFat, isToday: true },
    { label: 'Fri', calories: 1650, carbs: 185, protein: 138, fat: 40 },
  ];

  // 2. Monthly Nutrition Data (odd days: 1, 3, 5, 7, 9, 11, ... 29)
  const monthlyNutritionData: NutritionDataPoint[] = [
    { label: '1', calories: 1650, carbs: 180, protein: 135, fat: 40 },
    { label: '3', calories: 1720, carbs: 190, protein: 145, fat: 42 },
    { label: '5', calories: 1590, carbs: 175, protein: 132, fat: 39 },
    { label: '7', calories: 1680, carbs: 185, protein: 140, fat: 41 },
    { label: '9', calories: todayCalories, carbs: todayCarbs, protein: todayProtein, fat: todayFat, isToday: true },
    { label: '11', calories: 1640, carbs: 182, protein: 138, fat: 40 },
    { label: '13', calories: 1710, carbs: 188, protein: 144, fat: 42 },
    { label: '15', calories: 1600, carbs: 176, protein: 135, fat: 38 },
    { label: '17', calories: 1670, carbs: 184, protein: 142, fat: 40 },
    { label: '19', calories: 1730, carbs: 192, protein: 146, fat: 43 },
    { label: '21', calories: 1610, carbs: 178, protein: 136, fat: 39 },
    { label: '23', calories: 1690, carbs: 186, protein: 143, fat: 41 },
    { label: '25', calories: 1720, carbs: 190, protein: 145, fat: 42 },
    { label: '27', calories: 1630, carbs: 180, protein: 137, fat: 40 },
    { label: '29', calories: 1660, carbs: 183, protein: 141, fat: 41 },
  ];

  // 3. All Time Nutrition Data (Aug 2026, Sep 2026, Oct 2026)
  const allTimeNutritionData: NutritionDataPoint[] = [
    { label: 'Aug 2026', calories: 1710, carbs: 190, protein: 142, fat: 42 },
    { label: 'Sep 2026', calories: 1680, carbs: 185, protein: 145, fat: 40, isToday: true },
    { label: 'Oct 2026', calories: 1650, carbs: 180, protein: 150, fat: 38 },
  ];

  const currentNutritionData =
    nutritionTab === 'week'
      ? weeklyNutritionData
      : nutritionTab === 'month'
      ? monthlyNutritionData
      : allTimeNutritionData;

  // Max ceiling for Y-axis is 1,800
  const maxCalorieAxis = 1800;

  // Average weekly macro ratios
  const avgCals = Math.round(
    weeklyNutritionData.reduce((acc, d) => acc + d.calories, 0) / weeklyNutritionData.length
  );
  const avgCarbs = Math.round(
    weeklyNutritionData.reduce((acc, d) => acc + d.carbs, 0) / weeklyNutritionData.length
  );
  const avgProtein = Math.round(
    weeklyNutritionData.reduce((acc, d) => acc + d.protein, 0) / weeklyNutritionData.length
  );
  const avgFat = Math.round(
    weeklyNutritionData.reduce((acc, d) => acc + d.fat, 0) / weeklyNutritionData.length
  );

  // -------------------------------------------------------------
  // SUBVIEW: "How much do you Weigh Today?" (Screenshot 7)
  // -------------------------------------------------------------
  if (subView === 'logWeight') {
    return (
      <div className="flex flex-col min-h-[780px] justify-between pb-6 px-1 pt-1">
        <div>
          {/* Top Back Navigation */}
          <button
            type="button"
            onClick={() => setSubView('progress')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isDayMode
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Heading */}
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

            {/* Interactive Weight Ruler */}
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

        {/* Bottom Full-Width Pill Action Button */}
        <div className="pt-8">
          <button
            type="button"
            onClick={handleSaveWeight}
            className="w-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-[0.99] text-white py-4 rounded-full font-bold text-base shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            Log my weight
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUBVIEW: "What is your weight goal?" (Screenshot 8)
  // -------------------------------------------------------------
  if (subView === 'weightGoal') {
    return (
      <div className="flex flex-col min-h-[780px] justify-between pb-6 px-1 pt-1">
        <div>
          {/* Top Back Navigation */}
          <button
            type="button"
            onClick={() => setSubView('progress')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isDayMode
                ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Heading */}
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

            {/* Interactive Weight Ruler */}
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

        {/* Bottom Full-Width Pill Action Button */}
        <div className="pt-8">
          <button
            type="button"
            onClick={handleSaveGoal}
            className="w-full bg-[#5dba7d] hover:bg-[#50a76e] active:scale-[0.99] text-white py-4 rounded-full font-bold text-base shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PRIMARY PROGRESS SCREEN (Screenshots 1 - 6)
  // Layout Order:
  // 1. Header: "Progress"
  // 2. Section Selector: [ All | Weight | Nutrition ]
  // 3. Weight Section (Current Weight Graph + Weight Goal)
  // 4. Nutrition Section (Functional Stacked Bar Chart with Carbs/Protein/Fat)
  // 5. BMI Section (Gauge and status)
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header Title: "Progress" in Editorial Serif */}
      <div className="pt-1 flex items-baseline justify-between">
        <h1
          className={`font-serif text-3xl sm:text-4xl font-normal tracking-tight ${
            isDayMode ? 'text-[#19221a]' : 'text-white'
          }`}
        >
          Progress
        </h1>

        {/* Category Focus Switcher: All / Weight / Nutrition */}
        <div
          className={`flex rounded-xl p-0.5 border ${
            isDayMode ? 'bg-[#f0f3ee] border-[#dbe0da]' : 'bg-[#161c18] border-[#243026]'
          }`}
        >
          {(['all', 'weight', 'nutrition'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setSectionFilter(filter)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                sectionFilter === filter
                  ? isDayMode
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'bg-[#222d25] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. WEIGHT SECTION (Strictly FIRST, exactly matching layout) */}
      {/* ----------------------------------------------------------- */}
      {(sectionFilter === 'all' || sectionFilter === 'weight') && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2
              className={`text-base font-bold ${
                isDayMode ? 'text-[#19221a]' : 'text-neutral-100'
              }`}
            >
              Weight
            </h2>
          </div>

          {/* Segmented Control for Weight: [ Week | Month | All time ] */}
          <div
            className={`w-full rounded-xl p-1 border flex items-center shadow-2xs ${
              isDayMode
                ? 'bg-white border-neutral-200/90'
                : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            <button
              type="button"
              onClick={() => setWeightTab('week')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                weightTab === 'week'
                  ? 'bg-[#212522] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              Week
            </button>

            <div
              className={`w-[1px] h-3.5 mx-0.5 ${
                isDayMode ? 'bg-neutral-200' : 'bg-neutral-800'
              }`}
            />

            <button
              type="button"
              onClick={() => setWeightTab('month')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                weightTab === 'month'
                  ? 'bg-[#212522] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              Month
            </button>

            <div
              className={`w-[1px] h-3.5 mx-0.5 ${
                isDayMode ? 'bg-neutral-200' : 'bg-neutral-800'
              }`}
            />

            <button
              type="button"
              onClick={() => setWeightTab('all')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                weightTab === 'all'
                  ? 'bg-[#212522] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              All time
            </button>
          </div>

          {/* Current Weight Card with Strictly Bounded Interactive SVG Chart */}
          <div
            className={`rounded-2xl p-4 sm:p-5 border shadow-xs transition overflow-hidden ${
              isDayMode
                ? 'bg-white border-neutral-100/90'
                : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            {/* Card Top Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`p-1.5 rounded-lg ${
                    isDayMode
                      ? 'bg-neutral-100 text-neutral-800'
                      : 'bg-neutral-800 text-neutral-200'
                  }`}
                >
                  <ScaleWeightIcon className="w-4 h-4" />
                </span>
                <span
                  className={`text-sm font-semibold ${
                    isDayMode ? 'text-neutral-800' : 'text-neutral-200'
                  }`}
                >
                  Current Weight
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    isDayMode ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-950/40 text-emerald-400'
                  }`}
                >
                  {userProfile.weightKg} kg
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTempWeight(userProfile.weightKg);
                  setSubView('logWeight');
                }}
                title="Edit Current Weight"
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* Strictly Contained Weight Chart Area (No SVG Overflow) */}
            <div className="relative w-full h-44 sm:h-48 pt-4 pb-1 overflow-hidden">
              {weightTab === 'week' && (
                <div className="w-full h-full flex flex-col justify-between relative">
                  {/* 7-Day Grid & SVG Area Graph */}
                  <div className="relative flex-1 w-full overflow-hidden">
                    {/* Vertical Dashed Lines for: Sat, Sun, Mon, Tue, Wed, Today, Fri */}
                    <div className="absolute inset-0 flex justify-between px-3 pointer-events-none">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className={`w-[1px] h-full border-r border-dashed ${
                            isDayMode ? 'border-neutral-200' : 'border-neutral-800'
                          }`}
                        />
                      ))}
                    </div>

                    {/* SVG Green Curve & Shaded Area */}
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="weightGreenGradWeek" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5dba7d" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#5dba7d" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      {/* Area under curve leading up to Wednesday/Today (x = 68%) */}
                      <path
                        d="M 5 50 L 68 50 L 68 100 L 5 100 Z"
                        fill="url(#weightGreenGradWeek)"
                      />
                      {/* Line leading to Wednesday */}
                      <line
                        x1="5"
                        y1="50"
                        x2="68"
                        y2="50"
                        stroke="#5dba7d"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Dot on Wednesday with "90 kg" Label (Matching Screenshot 1) */}
                    <div
                      className="absolute z-10 flex flex-col items-center pointer-events-none"
                      style={{ left: '68%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 -mt-6 mb-1 whitespace-nowrap bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                        {userProfile.weightKg} kg
                      </span>
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5dba7d] border-2 border-white ring-2 ring-[#5dba7d]/30 shadow-xs" />
                    </div>
                  </div>

                  {/* X-Axis Ticks: Sat, Sun, Mon, Tue, Wed, Today, Fri */}
                  <div className="flex justify-between px-1 pt-3 text-[11px] font-medium text-neutral-500 select-none">
                    <span>Sat</span>
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">Today</span>
                    <span>Fri</span>
                  </div>
                </div>
              )}

              {weightTab === 'month' && (
                <div className="w-full h-full flex flex-col justify-between relative">
                  {/* Month Grid with odd dates: 1, 3, 5, 7, 9, 11, ... 29 */}
                  <div className="relative flex-1 w-full overflow-hidden">
                    <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                      {[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29].map((d) => (
                        <div
                          key={d}
                          className={`w-[1px] h-full border-r border-dashed ${
                            isDayMode ? 'border-neutral-200' : 'border-neutral-800'
                          }`}
                        />
                      ))}
                    </div>

                    {/* SVG Line & Area up to Day 9 (around 31% width) */}
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="weightGradMonthUnique" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5dba7d" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#5dba7d" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 3 50 L 31 50 L 31 100 L 3 100 Z"
                        fill="url(#weightGradMonthUnique)"
                      />
                      <line
                        x1="3"
                        y1="50"
                        x2="31"
                        y2="50"
                        stroke="#5dba7d"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Dot on Day 9 with "90" Label (Matching Screenshot 3) */}
                    <div
                      className="absolute z-10 flex flex-col items-center pointer-events-none"
                      style={{ left: '31%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 -mt-6 mb-1 whitespace-nowrap bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                        {userProfile.weightKg} kg
                      </span>
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5dba7d] border-2 border-white ring-2 ring-[#5dba7d]/30 shadow-xs" />
                    </div>
                  </div>

                  {/* X-Axis Ticks: 1 3 5 7 9 11 13 15 17 19 21 23 25 27 29 */}
                  <div className="flex justify-between px-0.5 pt-3 text-[10px] font-medium text-neutral-400 select-none">
                    {[1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {weightTab === 'all' && (
                <div className="w-full h-full flex flex-col justify-between relative">
                  {/* All Time Grid: Aug 2026, Sep 2026, Oct 2026 */}
                  <div className="relative flex-1 w-full overflow-hidden">
                    <div className="absolute inset-0 flex justify-between px-8 pointer-events-none">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`w-[1px] h-full border-r border-dashed ${
                            isDayMode ? 'border-neutral-200' : 'border-neutral-800'
                          }`}
                        />
                      ))}
                    </div>

                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="weightGradAllUnique" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5dba7d" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#5dba7d" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 12 50 L 50 50 L 50 100 L 12 100 Z"
                        fill="url(#weightGradAllUnique)"
                      />
                      <line
                        x1="12"
                        y1="50"
                        x2="50"
                        y2="50"
                        stroke="#5dba7d"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Dot on Sep 2026 with "90 kg" Label (Matching Screenshot 5) */}
                    <div
                      className="absolute z-10 flex flex-col items-center pointer-events-none"
                      style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                      <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 -mt-6 mb-1 whitespace-nowrap bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                        {userProfile.weightKg} kg
                      </span>
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5dba7d] border-2 border-white ring-2 ring-[#5dba7d]/30 shadow-xs" />
                    </div>
                  </div>

                  {/* X-Axis Ticks: Aug 2026, Sep 2026, Oct 2026 */}
                  <div className="flex justify-between px-4 pt-3 text-[11px] font-medium text-neutral-500 select-none">
                    <span>Aug 2026</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">Sep 2026</span>
                    <span>Oct 2026</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weight Goal Strip Card (Screenshots 1, 2, 3, 4, 5, 6) */}
          <div
            className={`rounded-2xl px-4 py-3.5 border shadow-xs flex items-center justify-between transition ${
              isDayMode
                ? 'bg-white border-neutral-100/90'
                : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`p-1.5 rounded-lg ${
                  isDayMode
                    ? 'bg-neutral-100 text-neutral-800'
                    : 'bg-neutral-800 text-neutral-200'
                }`}
              >
                <ScaleGoalIcon className="w-4 h-4" />
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-sm font-semibold ${
                    isDayMode ? 'text-neutral-800' : 'text-neutral-200'
                  }`}
                >
                  Weight Goal
                </span>
                <span
                  className={`text-sm font-bold ${
                    isDayMode ? 'text-neutral-900' : 'text-white'
                  }`}
                >
                  {userProfile.targetWeightKg} kg
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTempGoal(userProfile.targetWeightKg);
                setSubView('weightGoal');
              }}
              title="Edit Weight Goal"
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 3. NUTRITION SECTION (Strictly SECOND, below Weight)        */}
      {/* Fully Functional Interactive Stacked Bar Chart               */}
      {/* ----------------------------------------------------------- */}
      {(sectionFilter === 'all' || sectionFilter === 'nutrition') && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2
              className={`text-base font-bold ${
                isDayMode ? 'text-[#19221a]' : 'text-neutral-100'
              }`}
            >
              Nutrition
            </h2>
            <span className="text-xs text-neutral-400 font-medium">
              Daily Target: {goals.calories} kcal
            </span>
          </div>

          {/* Segmented Control for Nutrition: [ Week | Month | All time ] */}
          <div
            className={`w-full rounded-xl p-1 border flex items-center shadow-2xs ${
              isDayMode
                ? 'bg-white border-neutral-200/90'
                : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setNutritionTab('week');
                setSelectedNutritionDay(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                nutritionTab === 'week'
                  ? 'bg-[#212522] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              Week
            </button>

            <div
              className={`w-[1px] h-3.5 mx-0.5 ${
                isDayMode ? 'bg-neutral-200' : 'bg-neutral-800'
              }`}
            />

            <button
              type="button"
              onClick={() => {
                setNutritionTab('month');
                setSelectedNutritionDay(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                nutritionTab === 'month'
                  ? 'bg-[#212522] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              Month
            </button>

            <div
              className={`w-[1px] h-3.5 mx-0.5 ${
                isDayMode ? 'bg-neutral-200' : 'bg-neutral-800'
              }`}
            />

            <button
              type="button"
              onClick={() => {
                setNutritionTab('all');
                setSelectedNutritionDay(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                nutritionTab === 'all'
                  ? 'bg-[#212522] text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              All time
            </button>
          </div>

          {/* Nutrition Chart Card with Functional Stacked Bars and Y-Axis (1,800 to 0) */}
          <div
            className={`rounded-2xl p-4 sm:p-5 border shadow-xs transition ${
              isDayMode
                ? 'bg-white border-neutral-100/90'
                : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            {/* Popover / Tooltip info row when a bar is selected */}
            <div className="min-h-[26px] mb-2 flex items-center justify-between text-xs">
              {selectedNutritionDay !== null && currentNutritionData[selectedNutritionDay] ? (
                <div className="flex items-center gap-3 w-full justify-between bg-neutral-100 dark:bg-neutral-800/80 px-3 py-1 rounded-lg">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {currentNutritionData[selectedNutritionDay].label}:{' '}
                    <span className="text-emerald-500">
                      {currentNutritionData[selectedNutritionDay].calories} kcal
                    </span>
                  </span>
                  <div className="flex items-center gap-2.5 font-medium text-[11px]">
                    <span className="text-[#f5a623]">
                      C: {currentNutritionData[selectedNutritionDay].carbs}g
                    </span>
                    <span className="text-[#eb5757]">
                      P: {currentNutritionData[selectedNutritionDay].protein}g
                    </span>
                    <span className="text-[#4a90e2]">
                      F: {currentNutritionData[selectedNutritionDay].fat}g
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-[11px] text-neutral-400 font-medium">
                  Tap any bar for macro breakdown
                </span>
              )}
            </div>

            <div className="relative w-full h-56 sm:h-60 flex flex-col justify-between pt-1">
              {/* Chart Grid Area with Y-Ticks on Left */}
              <div className="relative flex-1 flex">
                {/* Y-Axis Labels: 1,800, 1,500, 1,200, 900, 600, 300, 0 */}
                <div className="w-11 h-full flex flex-col justify-between text-[11px] text-neutral-400 font-mono pr-2 select-none">
                  <span>1,800</span>
                  <span>1,500</span>
                  <span>1,200</span>
                  <span>900</span>
                  <span>600</span>
                  <span>300</span>
                  <span>0</span>
                </div>

                {/* Chart Body with Horizontal Dashed Lines AND Real Stacked Bars */}
                <div className="relative flex-1 h-full flex flex-col justify-between">
                  {/* 7 Horizontal Dashed Lines */}
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`w-full border-b border-dashed ${
                        isDayMode ? 'border-neutral-200/90' : 'border-neutral-800'
                      }`}
                    />
                  ))}

                  {/* Absolute Overlay Container for Stacked Bars */}
                  <div className="absolute inset-0 flex items-end justify-around px-1 z-10">
                    {currentNutritionData.map((item, idx) => {
                      // Total calorie height % relative to 1,800 max
                      const barHeightPercent = Math.min(
                        100,
                        Math.max(8, (item.calories / maxCalorieAxis) * 100)
                      );

                      // Calories from each macro: 4 kcal/g carbs, 4 kcal/g protein, 9 kcal/g fat
                      const carbKcal = item.carbs * 4;
                      const proteinKcal = item.protein * 4;
                      const fatKcal = item.fat * 9;
                      const totalKcal = carbKcal + proteinKcal + fatKcal || item.calories;

                      const carbsPct = Math.round((carbKcal / totalKcal) * 100);
                      const proteinPct = Math.round((proteinKcal / totalKcal) * 100);
                      const fatPct = Math.max(5, 100 - carbsPct - proteinPct);

                      const isSelected = selectedNutritionDay === idx;

                      // Bar widths based on tab
                      const barWidthClass =
                        nutritionTab === 'week'
                          ? 'w-6 sm:w-8'
                          : nutritionTab === 'month'
                          ? 'w-2.5 sm:w-3'
                          : 'w-14 sm:w-16';

                      return (
                        <div
                          key={idx}
                          onClick={() =>
                            setSelectedNutritionDay(isSelected ? null : idx)
                          }
                          className={`flex flex-col justify-end items-center cursor-pointer transition-transform duration-200 ${
                            isSelected ? 'scale-105' : 'hover:opacity-90'
                          }`}
                          style={{ height: `${barHeightPercent}%` }}
                          title={`${item.label}: ${item.calories} kcal (Carbs: ${item.carbs}g, Protein: ${item.protein}g, Fat: ${item.fat}g)`}
                        >
                          {/* Stacked Bar Container */}
                          <div
                            className={`${barWidthClass} h-full flex flex-col justify-end rounded-t-md overflow-hidden shadow-2xs transition ring-offset-1 ${
                              isSelected
                                ? 'ring-2 ring-emerald-500'
                                : item.isToday
                                ? 'ring-1 ring-emerald-400/60'
                                : ''
                            }`}
                          >
                            {/* 1. Fat Segment (Top - Sky Blue) */}
                            <div
                              className="w-full bg-[#4a90e2] rounded-t-sm transition-all"
                              style={{ height: `${fatPct}%` }}
                            />

                            {/* 2. Protein Segment (Middle - Coral Red) */}
                            <div
                              className="w-full bg-[#eb5757] transition-all"
                              style={{ height: `${proteinPct}%` }}
                            />

                            {/* 3. Carbs Segment (Bottom - Amber/Yellow) */}
                            <div
                              className="w-full bg-[#f5a623] rounded-b-xs transition-all"
                              style={{ height: `${carbsPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* X-Axis Ticks */}
              <div className="pl-11 pt-2.5">
                {nutritionTab === 'week' && (
                  <div className="flex justify-around text-[11px] font-medium text-neutral-500 select-none">
                    {weeklyNutritionData.map((d, i) => (
                      <span
                        key={i}
                        className={
                          d.isToday
                            ? 'font-bold text-neutral-900 dark:text-neutral-100 underline decoration-emerald-500 decoration-2 underline-offset-4'
                            : ''
                        }
                      >
                        {d.label}
                      </span>
                    ))}
                  </div>
                )}

                {nutritionTab === 'month' && (
                  <div className="flex justify-around text-[10px] font-medium text-neutral-400 select-none">
                    {monthlyNutritionData.map((d) => (
                      <span
                        key={d.label}
                        className={
                          d.isToday
                            ? 'font-bold text-emerald-500'
                            : ''
                        }
                      >
                        {d.label}
                      </span>
                    ))}
                  </div>
                )}

                {nutritionTab === 'all' && (
                  <div className="flex justify-around px-4 text-[11px] font-medium text-neutral-500 select-none">
                    {allTimeNutritionData.map((d) => (
                      <span
                        key={d.label}
                        className={
                          d.isToday
                            ? 'font-bold text-neutral-800 dark:text-neutral-100'
                            : ''
                        }
                      >
                        {d.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Legend at Bottom-Right (Carbs: yellow, Protein: coral, Fat: sky blue) */}
              <div className="flex items-center justify-end gap-3.5 pt-3 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f5a623]" />
                  <span>Carbs</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eb5757]" />
                  <span>Protein</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4a90e2]" />
                  <span>Fat</span>
                </span>
              </div>
            </div>

            {/* Quick Macro Summary Chips underneath the Chart */}
            <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-800/80 text-center">
              <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/60">
                <span className="text-[10px] text-neutral-400 font-medium block">Avg Intake</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {avgCals} kcal
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium block">Carbs Avg</span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  {avgCarbs}g
                </span>
              </div>
              <div className="p-2 rounded-xl bg-red-500/10">
                <span className="text-[10px] text-red-600 dark:text-red-400 font-medium block">Protein Avg</span>
                <span className="text-xs font-bold text-red-700 dark:text-red-300">
                  {avgProtein}g
                </span>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block">Fat Avg</span>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  {avgFat}g
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 4. BMI SECTION (Strictly THIRD, below Nutrition)             */}
      {/* ----------------------------------------------------------- */}
      {(sectionFilter === 'all' || sectionFilter === 'weight') && (
        <section className="space-y-2.5">
          <h2
            className={`text-base font-bold ${
              isDayMode ? 'text-[#19221a]' : 'text-neutral-100'
            }`}
          >
            BMI
          </h2>

          <div
            className={`rounded-2xl p-5 border shadow-xs transition ${
              isDayMode
                ? 'bg-white border-neutral-100/90'
                : 'bg-[#151c17] border-[#243026]'
            }`}
          >
            {/* Header Row: "Your weight is [ Overweight / Healthy ]" */}
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  isDayMode ? 'text-neutral-800' : 'text-neutral-200'
                }`}
              >
                Your weight is
              </span>
              <span
                className={`text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs ${bmiBadgeBg}`}
              >
                {bmiCategory}
              </span>
            </div>

            {/* Large BMI Number: 27.8 */}
            <div
              className={`text-4xl sm:text-5xl font-extrabold tracking-tight mt-2 mb-4 font-mono ${
                isDayMode ? 'text-neutral-900' : 'text-white'
              }`}
            >
              {currentBmi}
            </div>

            {/* Rainbow Gradient Bar with Precision Needle Indicator */}
            <div className="relative w-full my-4 py-2">
              <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-[#007aff] via-[#34c759] via-45% via-[#ff9500] to-[#ff3b30]" />

              {/* Vertical Needle Marker */}
              <div
                className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none transition-all duration-300"
                style={{ left: `${needlePercent}%`, transform: 'translateX(-50%)' }}
              >
                <div
                  className={`w-0.5 h-6 rounded-full shadow-xs ${
                    isDayMode ? 'bg-neutral-900' : 'bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Legend Row */}
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600 dark:text-neutral-300 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#007aff]" />
                <span>Underweight</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34c759]" />
                <span>Healthy</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff9500]" />
                <span>Overweight</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff3b30]" />
                <span>Obese</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Spacing for Fixed Bottom Navigation */}
      <div className="h-16" />

      {/* 5. Sticky Bottom Navigation Bar matching Screenshot exactly */}
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

          {/* Tab 2: Progress (ACTIVE) */}
          <button
            type="button"
            className={`flex flex-col items-center flex-1 py-1 cursor-pointer transition ${
              isDayMode ? 'text-neutral-900 font-semibold' : 'text-emerald-400 font-semibold'
            }`}
          >
            <BarChart2 className="w-5 h-5 stroke-[2.4]" />
            <span className="text-[10px] mt-0.5 font-bold">Progress</span>
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

          {/* Tab 5: Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex flex-col items-center flex-1 py-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
          >
            <Settings className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
