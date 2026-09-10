import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Plus,
  BarChart2,
  Settings,
  Sparkles,
  Utensils,
  Coffee,
  Dumbbell,
  Wheat,
  Droplets,
  Beef,
  Trash2,
  Sliders,
  Clock,
  Sun,
  Moon,
  Home,
  CheckCircle2,
  ChevronRight,
  Eye,
  Camera,
} from 'lucide-react';
import {
  DailyGoals,
  LoggedMeal,
  FoodItem,
  MealType,
  StreakInfo,
  SubscriptionState,
  PermissionsState,
} from '../types/nutrition';

interface DailyDashboardProps {
  goals: DailyGoals;
  meals: LoggedMeal[];
  streak: StreakInfo;
  subscription: SubscriptionState;
  permissions: PermissionsState;
  waterIntake: number;
  isDayMode: boolean;
  onToggleDayMode: () => void;
  onOpenStreak: () => void;
  onOpenPaywall: () => void;
  onOpenSettings: () => void;
  onOpenAnalytics: () => void;
  onOpenAIChat: () => void;
  onOpenQuickLog: () => void;
  onOpenVisionScanner: () => void;
  onOpenBarcodeScanner: () => void;
  onOpenVoiceLogger: () => void;
  onOpenFoodDatabase: () => void;
  onOpenTimePicker: (mealType: MealType, mealId?: string) => void;
  onEditItemInMacroEditor: (item: FoodItem, mealId: string) => void;
  onDeleteItem: (mealId: string, itemId: string) => void;
  onAddMealSlot: (mealType: MealType) => void;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({
  goals,
  meals,
  streak,
  subscription,
  permissions,
  waterIntake,
  isDayMode,
  onToggleDayMode,
  onOpenStreak,
  onOpenPaywall,
  onOpenSettings,
  onOpenAnalytics,
  onOpenAIChat,
  onOpenQuickLog,
  onOpenVisionScanner,
  onOpenBarcodeScanner,
  onOpenVoiceLogger,
  onOpenFoodDatabase,
  onOpenTimePicker,
  onEditItemInMacroEditor,
  onDeleteItem,
  onAddMealSlot,
}) => {
  // Aggregate daily consumed macros
  const consumedCalories = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const consumedProtein = meals.reduce((sum, m) => sum + m.totalProtein, 0);
  const consumedCarbs = meals.reduce((sum, m) => sum + m.totalCarbs, 0);
  const consumedFat = meals.reduce((sum, m) => sum + m.totalFat, 0);

  // Remaining macros & calories
  const remainingCalories = Math.max(0, goals.calories - consumedCalories);
  const remainingProtein = Math.max(0, goals.protein - Math.round(consumedProtein));
  const remainingCarbs = Math.max(0, goals.carbs - Math.round(consumedCarbs));
  const remainingFat = Math.max(0, goals.fat - Math.round(consumedFat));

  // Progress percentage for ring
  const caloriePct = Math.min(100, Math.round((consumedCalories / goals.calories) * 100));

  // Carousel slide: 0 = 'Hero Calorie Budget & Macro Columns', 1 = 'Sep [Day] Consumption (Linear Bars)'
  const [carouselSlide, setCarouselSlide] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 35) {
      // Swipe left -> go to consumption slide 1
      setCarouselSlide(1);
    } else if (diff < -35) {
      // Swipe right -> go to budget slide 0
      setCarouselSlide(0);
    }
    setTouchStartX(null);
  };

  // Carousel view mode for Macro card inside slide 0: 0 = 'left' (remaining), 1 = 'consumed & goals'
  const [macroCarouselIndex, setMacroCarouselIndex] = useState<number>(0);

  // Selected Day in the 7-day strip (index 3 is 'Today, 10' as shown in screenshot)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(3);

  // Optional preview toggle to view the empty state even if meals are logged
  const [forceEmptyStateView, setForceEmptyStateView] = useState<boolean>(false);

  // Days of the week matching the exact screenshot: Mon 7, Tue 8, Wed 9, Today 10, Fri 11, Sat 12, Sun 13
  const weekDays = [
    { label: 'Mon', num: 7, isToday: false },
    { label: 'Tue', num: 8, isToday: false },
    { label: 'Wed', num: 9, isToday: false },
    { label: 'Today', num: 10, isToday: true },
    { label: 'Fri', num: 11, isToday: false },
    { label: 'Sat', num: 12, isToday: false },
    { label: 'Sun', num: 13, isToday: false },
  ];

  // Meal categories
  const mealCategories: { type: MealType; label: string; icon: any }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: Coffee },
    { type: 'lunch', label: 'Lunch', icon: Utensils },
    { type: 'dinner', label: 'Dinner', icon: Beef },
    { type: 'snack', label: 'Snacks', icon: Dumbbell },
  ];

  // Whether the currently selected view should render empty state
  const isSelectedDayEmpty = selectedDayIndex !== 3 || forceEmptyStateView || meals.length === 0;

  return (
    <div
      className={`min-h-full transition-colors duration-300 ${
        isDayMode ? 'text-[#19221a]' : 'text-[#f2f6f3]'
      }`}
    >
      {/* 1. Header Row: "Today" serif title + Streak capsule & Vision Mode toggle */}
      <div className="flex items-center justify-between pt-1 pb-3 px-1">
        <h1
          className={`font-display-serif text-3xl sm:text-4xl font-bold tracking-tight ${
            isDayMode ? 'text-[#1a231b]' : 'text-[#f4f7f5]'
          }`}
        >
          {weekDays[selectedDayIndex].isToday ? 'Today' : `${weekDays[selectedDayIndex].label} ${weekDays[selectedDayIndex].num}`}
        </h1>

        <div className="flex items-center gap-2">
          {/* Day / Night Vision Mode Toggle */}
          <button
            onClick={onToggleDayMode}
            title={isDayMode ? 'Switch to Night Mode' : 'Switch to Day Vision Mode'}
            className={`p-2 rounded-full border transition cursor-pointer flex items-center justify-center ${
              isDayMode
                ? 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-xs'
                : 'bg-[#1a231d] border-[#29382b] text-neutral-300 hover:text-white shadow-xs'
            }`}
          >
            {isDayMode ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          {/* Streak Counter Capsule */}
          <button
            onClick={onOpenStreak}
            title="Open Streak Tracker"
            className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
              isDayMode
                ? 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-900'
                : 'bg-[#18211b] border-[#29382c] hover:border-emerald-500/40 text-white'
            }`}
          >
            <Flame className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            <span className="font-bold">{streak.currentStreak}</span>
          </button>
        </div>
      </div>

      {/* 2. Horizontal Calendar Strip (Exact Ditto: Mon 7, Tue 8, Wed 9, Today 10, Fri 11, Sat 12, Sun 13) */}
      <div className="flex items-center justify-between py-2 px-1 mb-3">
        {weekDays.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => setSelectedDayIndex(idx)}
              className="flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer group"
            >
              {/* Day Label (e.g. Mon, Today, Fri) */}
              <span
                className={`text-[11px] sm:text-xs mb-1 transition ${
                  isSelected
                    ? isDayMode
                      ? 'font-bold text-neutral-900'
                      : 'font-bold text-white'
                    : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                }`}
              >
                {day.label}
              </span>

              {/* Day Number inside Pill Capsule if Selected */}
              {isSelected ? (
                <span
                  className={`px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm transition ${
                    isDayMode
                      ? 'bg-neutral-900 text-white'
                      : 'bg-white text-neutral-950'
                  }`}
                >
                  {day.num}
                </span>
              ) : (
                <span
                  className={`text-xs sm:text-sm font-semibold transition py-1 ${
                    isDayMode
                      ? 'text-neutral-700 group-hover:text-neutral-900'
                      : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                >
                  {day.num}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Swipeable / Scrollable Carousel Container (Slide 0: Hero Budget, Slide 1: Sep [Day] Consumption) */}
      <div
        className="relative overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {carouselSlide === 0 ? (
            /* SLIDE 0: Hero Calorie Budget Sage Green Card + 3 Macro Columns */
            <motion.div
              key="slide-budget"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              {/* Hero Calorie Budget Sage Green Card (Exact Ditto) */}
              <div
                className={`p-5 sm:p-6 rounded-[26px] shadow-sm relative overflow-hidden transition-all duration-300 ${
                  isDayMode
                    ? 'bg-[#dce9dc] text-[#1c291f]'
                    : 'bg-gradient-to-br from-[#162319] via-[#1a2c1f] to-[#121f16] border border-[#243a29] text-[#f2f6f3]'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left Column: Big Calorie Number + "Calories left" */}
                  <div className="space-y-1">
                    <div className="flex items-baseline">
                      <span className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                        {remainingCalories}
                      </span>
                    </div>
                    <p
                      className={`text-sm font-medium ${
                        isDayMode ? 'text-[#384a3c]' : 'text-[#8ea593]'
                      }`}
                    >
                      Calories left
                    </p>
                  </div>

                  {/* Right Column: Circular Gauge with Center Flame */}
                  <div className="relative w-24 h-24 sm:w-26 sm:h-26 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Gauge Background Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="7"
                        fill="transparent"
                        className={isDayMode ? 'stroke-[#c5d8c6]' : 'stroke-[#233527]'}
                      />
                      {/* Gauge Active Progress Stroke */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="7"
                        strokeLinecap="round"
                        fill="transparent"
                        strokeDasharray="251.2"
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * caloriePct) / 100 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className={isDayMode ? 'stroke-[#4ba368]' : 'stroke-emerald-400'}
                      />
                    </svg>

                    {/* Centered Flame Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center ${
                          isDayMode
                            ? 'bg-[#c5d8c6]/40 text-[#1f2c22]'
                            : 'bg-[#233628] text-emerald-400'
                        }`}
                      >
                        <Flame className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Macronutrients Card (3 Columns: Carbs, Protein, Fat) */}
              <div
                className={`mt-3.5 p-4 sm:p-5 rounded-2xl shadow-xs border transition-all duration-300 ${
                  isDayMode
                    ? 'bg-white border-neutral-100 text-neutral-800'
                    : 'bg-[#18211b] border-[#263529] text-neutral-100'
                }`}
              >
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  {/* Column 1: Carbs */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                      <span className="text-amber-500 text-base sm:text-lg">🌾</span>
                      <span>{macroCarouselIndex === 0 ? `${remainingCarbs}g` : `${Math.round(consumedCarbs)}g`}</span>
                    </div>
                    {/* Soft Pastel Progress Line */}
                    <div className="h-1 w-full bg-amber-100 dark:bg-amber-950/60 rounded-full mt-2 mb-1.5 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (consumedCarbs / goals.carbs) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      {macroCarouselIndex === 0 ? 'Carbs left' : `Carbs (${goals.carbs}g)`}
                    </span>
                  </div>

                  {/* Column 2: Protein */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                      <span className="text-rose-500 text-base sm:text-lg">🍗</span>
                      <span>{macroCarouselIndex === 0 ? `${remainingProtein}g` : `${Math.round(consumedProtein)}g`}</span>
                    </div>
                    {/* Soft Pastel Progress Line */}
                    <div className="h-1 w-full bg-rose-100 dark:bg-rose-950/60 rounded-full mt-2 mb-1.5 overflow-hidden">
                      <div
                        className="h-full bg-rose-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (consumedProtein / goals.protein) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      {macroCarouselIndex === 0 ? 'Protein left' : `Protein (${goals.protein}g)`}
                    </span>
                  </div>

                  {/* Column 3: Fat */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                      <span className="text-sky-500 text-base sm:text-lg">💧</span>
                      <span>{macroCarouselIndex === 0 ? `${remainingFat}g` : `${Math.round(consumedFat)}g`}</span>
                    </div>
                    {/* Soft Pastel Progress Line */}
                    <div className="h-1 w-full bg-sky-100 dark:bg-sky-950/60 rounded-full mt-2 mb-1.5 overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (consumedFat / goals.fat) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      {macroCarouselIndex === 0 ? 'Fat left' : `Fat (${goals.fat}g)`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* SLIDE 1: The Missing Scrollable Section - "Sep [Day] Consumption" Card (Exact Ditto to IMG_20260910_081907.jpg) */
            <motion.div
              key="slide-consumption"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className={`p-5 sm:p-6 rounded-3xl shadow-xs border transition-all duration-300 ${
                isDayMode
                  ? 'bg-white border-neutral-100 text-neutral-900'
                  : 'bg-[#18211b] border-[#263529] text-neutral-100'
              }`}
            >
              {/* Card Title: e.g. "Sep 10 Consumption" */}
              <h3 className="font-bold text-base sm:text-lg tracking-tight mb-5">
                Sep {weekDays[selectedDayIndex]?.num || 10} Consumption
              </h3>

              {/* 4 Linear Progress Rows */}
              <div className="space-y-4">
                {/* Row 1: Kcal */}
                <div>
                  <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#5dba7d] fill-[#5dba7d]" />
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">Kcal</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      {consumedCalories} / {goals.calories}Kcal
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (consumedCalories / goals.calories) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-[#5dba7d] rounded-full"
                    />
                  </div>
                </div>

                {/* Row 2: Carbs */}
                <div>
                  <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">🌾</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">Carbs</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      {Math.round(consumedCarbs)} / {goals.carbs}g
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (consumedCarbs / goals.carbs) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-[#f5a623] rounded-full"
                    />
                  </div>
                </div>

                {/* Row 3: Protein */}
                <div>
                  <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">🍗</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">Protein</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      {Math.round(consumedProtein)} / {goals.protein}g
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (consumedProtein / goals.protein) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-[#eb5757] rounded-full"
                    />
                  </div>
                </div>

                {/* Row 4: Fat */}
                <div>
                  <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-500 flex items-center justify-center text-[9px] font-bold">
                        💧
                      </div>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">Fat</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      {Math.round(consumedFat)} / {goals.fat}g
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (consumedFat / goals.fat) * 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-[#4a90e2] rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Carousel Dots (Exact Ditto: 2 dots matching IMG_20260910_081907.jpg) */}
      <div className="flex items-center justify-center gap-2 mt-3.5 mb-5">
        <button
          onClick={() => setCarouselSlide(0)}
          className={`h-2 rounded-full transition-all cursor-pointer ${
            carouselSlide === 0
              ? 'w-4 bg-[#5dba7d]'
              : 'w-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400'
          }`}
          aria-label="Slide 1: Calorie Budget & Macro Breakdown"
        />
        <button
          onClick={() => setCarouselSlide(1)}
          className={`h-2 rounded-full transition-all cursor-pointer ${
            carouselSlide === 1
              ? 'w-4 bg-[#5dba7d]'
              : 'w-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400'
          }`}
          aria-label="Slide 2: Consumption Progress Bars"
        />
      </div>

      {/* 5. Section Header: "Previously logged" in editorial serif font */}
      <div className="flex items-center justify-between mt-5 mb-3 px-1">
        <h2
          className={`font-display-serif text-xl sm:text-2xl font-bold tracking-tight ${
            isDayMode ? 'text-[#1a231b]' : 'text-[#f4f7f5]'
          }`}
        >
          Previously logged
        </h2>

        {/* Quick toggle to preview empty state or active logged meals */}
        {meals.length > 0 && selectedDayIndex === 3 && (
          <button
            onClick={() => setForceEmptyStateView(!forceEmptyStateView)}
            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            <span>{forceEmptyStateView ? 'Show Logged' : 'Show Empty State'}</span>
          </button>
        )}
      </div>

      {/* 6. Previously Logged Body: Either Exact Empty State OR Logged Meals Card */}
      {isSelectedDayEmpty ? (
        /* EXACT DITTO EMPTY STATE FROM SCREENSHOT */
        <div
          className={`rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center shadow-xs border relative ${
            isDayMode
              ? 'bg-white border-neutral-100'
              : 'bg-[#18211b] border-[#263529]'
          }`}
        >
          {/* Top Row of 3 soft gray icons: Fork & Knife, Glass/Mug, Dumbbell */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 pt-2">
            <div className="text-neutral-300 dark:text-neutral-600 flex items-center justify-center">
              <Utensils className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
            </div>
            <div className="text-neutral-300 dark:text-neutral-600 flex items-center justify-center">
              <Coffee className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
            </div>
            <div className="text-neutral-300 dark:text-neutral-600 flex items-center justify-center">
              <Dumbbell className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5]" />
            </div>
          </div>

          {/* Primary Empty State Heading */}
          <h3
            className={`font-bold text-base sm:text-lg mt-4 ${
              isDayMode ? 'text-neutral-900' : 'text-neutral-100'
            }`}
          >
            You haven't logged anything!
          </h3>

          {/* Subtitle Description */}
          <p
            className={`text-xs sm:text-sm mt-1.5 max-w-xs leading-relaxed ${
              isDayMode ? 'text-neutral-500' : 'text-neutral-400'
            }`}
          >
            Start tracking today's meals by taking a quick picture.
          </p>

          {/* Hand-Drawn Doodle Arrow pointing down to the big green FAB! */}
          <div className="mt-4 flex flex-col items-center justify-center">
            <svg
              className={`w-16 h-16 sm:w-20 sm:h-20 animate-gentle-bob ${
                isDayMode ? 'text-neutral-800' : 'text-emerald-400'
              }`}
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Playful curved loop doodle path curving downwards towards the bottom center */}
              <path d="M 28 15 C 65 5, 82 28, 70 52 C 60 70, 42 62, 45 80 L 48 88" />
              {/* Arrowhead pointing down-left toward the FAB */}
              <path d="M 38 78 L 48 88 L 56 78" />
            </svg>
          </div>
        </div>
      ) : (
        /* LOGGED MEALS DETAILED LIST */
        <div className="space-y-3 pb-8">
          {mealCategories.map((category) => {
            const categoryMeals = meals.filter((m) => m.mealType === category.type);
            const categoryCalories = categoryMeals.reduce((sum, m) => sum + m.totalCalories, 0);
            const CategoryIcon = category.icon;

            return (
              <div
                key={category.type}
                className={`rounded-2xl p-4 border transition ${
                  isDayMode
                    ? 'bg-white border-neutral-100 shadow-xs'
                    : 'bg-[#18211b] border-[#263529]'
                }`}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isDayMode ? 'bg-[#f0f4ef] text-neutral-700' : 'bg-[#222d25] text-neutral-200'
                      }`}
                    >
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{category.label}</h4>
                      <span className="text-[11px] text-neutral-400">
                        {categoryCalories > 0 ? `${categoryCalories} kcal` : 'No food logged'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddMealSlot(category.type)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Items in this category */}
                {categoryMeals.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                    {categoryMeals.map((meal) => (
                      <div key={meal.id} className="space-y-1.5">
                        {meal.time && (
                          <div className="flex items-center justify-between text-[10px] text-neutral-400 px-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {meal.time}
                            </span>
                            {meal.notes && <span className="italic">{meal.notes}</span>}
                          </div>
                        )}

                        {meal.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                              isDayMode
                                ? 'bg-[#f8faf7] border-neutral-100 hover:border-neutral-200'
                                : 'bg-[#1e2721] border-[#29382d] hover:border-[#334739]'
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <span className="text-xs font-semibold block truncate">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                                <span>{item.portion}</span>
                                <span>•</span>
                                <span className="text-rose-500 font-medium">P:{item.protein}g</span>
                                <span className="text-amber-500 font-medium">C:{item.carbs}g</span>
                                <span className="text-sky-500 font-medium">F:{item.fat}g</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-bold text-xs">
                                {item.calories} <span className="text-[10px] text-neutral-400 font-normal">kcal</span>
                              </span>

                              {/* Edit in Macro Editor */}
                              <button
                                onClick={() => onEditItemInMacroEditor(item, meal.id)}
                                title="Edit in Dynamic Macro Editor"
                                className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-emerald-500 transition cursor-pointer"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete item */}
                              <button
                                onClick={() => onDeleteItem(meal.id, item.id)}
                                title="Remove item"
                                className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-rose-500 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Extra spacing at the bottom so content doesn't hide behind the sticky navigation bar */}
      <div className="h-20" />

      {/* 7. Bottom Navigation Bar & Big Green Floating Action Button (FAB) (Exact Ditto) */}
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
            onClick={() => {}}
            className={`flex flex-col items-center flex-1 py-1 cursor-pointer transition ${
              isDayMode ? 'text-neutral-900 font-semibold' : 'text-emerald-400 font-semibold'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] mt-0.5 font-medium">Home</span>
          </button>

          {/* Tab 2: Progress */}
          <button
            onClick={onOpenAnalytics}
            className="flex flex-col items-center flex-1 py-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
          >
            <BarChart2 className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 font-medium">Progress</span>
          </button>

          {/* Tab 3: Center Elevated Big Green FAB (+) */}
          <div className="flex-1 flex justify-center -mt-7 relative z-50">
            <button
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
            onClick={onOpenAIChat}
            className="flex flex-col items-center flex-1 py-1 cursor-pointer hover:text-neutral-900 dark:hover:text-white transition"
          >
            <Sparkles className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-0.5 font-medium">Ai Chat</span>
          </button>

          {/* Tab 5: Settings */}
          <button
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
