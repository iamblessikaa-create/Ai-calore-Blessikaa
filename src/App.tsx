import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Maximize,
  Flame,
  Crown,
  Camera,
  ScanLine,
  Mic,
  Sliders,
  Sparkles,
  BarChart2,
  Calendar,
  Settings as SettingsIcon,
  Shield,
  HelpCircle,
  Wifi,
  Signal,
  Sun,
  Moon,
} from 'lucide-react';
import {
  FoodItem,
  LoggedMeal,
  DailyGoals,
  StreakInfo,
  PermissionsState,
  SubscriptionState,
  UserProfile,
  MealType,
  AIDetectionResult,
} from './types/nutrition';
import {
  initialUserProfile,
  initialGoals,
  initialStreakInfo,
  initialTodayMeals,
  sampleFoodDatabase,
} from './data/mockData';

// Modals & Views
import { DailyDashboard } from './components/DailyDashboard';
import { DynamicMacroEditor } from './components/DynamicMacroEditor';
import { PermissionModal, PermissionType } from './components/PermissionModal';
import { StreakTracker } from './components/StreakTracker';
import { TimePickerModal } from './components/TimePickerModal';
import { SubscriptionPaywall } from './components/SubscriptionPaywall';
import { AIVisionScanner } from './components/AIVisionScanner';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { VoiceQuickLogModal } from './components/VoiceQuickLogModal';
import { FoodDatabaseModal } from './components/FoodDatabaseModal';
import { AnalyticsView } from './components/AnalyticsView';
import { ProgressScreen } from './components/ProgressScreen';
import { AIAssistantScreen } from './components/AIAssistantScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { SettingsModal } from './components/SettingsModal';
import { QuickLogModal } from './components/QuickLogModal';
import { AIChatModal } from './components/AIChatModal';

export default function App() {
  // Device Preview Mode (Mobile Frame vs Full Canvas)
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'full'>('mobile');

  // Day Vision Mode vs Night Mode (Defaults to true for the screenshot match)
  const [isDayMode, setIsDayMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('blessikaa_day_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Core Data States
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('blessikaa_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.weightKg === 72.5 || !parsed.weightKg) {
          parsed.weightKg = 90;
          parsed.targetWeightKg = 80;
          parsed.heightCm = 180;
        }
        return parsed;
      } catch {
        return initialUserProfile;
      }
    }
    return initialUserProfile;
  });

  const [goals, setGoals] = useState<DailyGoals>(() => {
    const saved = localStorage.getItem('blessikaa_goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [meals, setMeals] = useState<LoggedMeal[]>(() => {
    const saved = localStorage.getItem('blessikaa_meals');
    return saved ? JSON.parse(saved) : initialTodayMeals;
  });

  const [streak, setStreak] = useState<StreakInfo>(() => {
    const saved = localStorage.getItem('blessikaa_streak');
    return saved ? JSON.parse(saved) : initialStreakInfo;
  });

  const [permissions, setPermissions] = useState<PermissionsState>(() => {
    const saved = localStorage.getItem('blessikaa_permissions');
    return saved
      ? JSON.parse(saved)
      : { camera: 'granted', healthSync: 'prompt', notifications: 'prompt' };
  });

  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    const saved = localStorage.getItem('blessikaa_subscription');
    return saved ? JSON.parse(saved) : { isPro: false, plan: null, trialExpiresAt: null };
  });

  const [waterIntake, setWaterIntake] = useState<number>(() => {
    const saved = localStorage.getItem('blessikaa_water');
    return saved ? JSON.parse(saved) : 1750;
  });

  // View state: 'dashboard' vs 'analytics' vs 'ai-chat' vs 'settings'
  const [viewTab, setViewTab] = useState<'dashboard' | 'analytics' | 'ai-chat' | 'settings'>('dashboard');

  // Active Modals
  const [macroEditorItem, setMacroEditorItem] = useState<{ item: FoodItem; mealId?: string } | null>(null);
  const [permissionTypeModal, setPermissionTypeModal] = useState<PermissionType | null>(null);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<{ mealType: MealType; mealId?: string } | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isVisionScannerOpen, setIsVisionScannerOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isVoiceLoggerOpen, setIsVoiceLoggerOpen] = useState(false);
  const [isFoodDatabaseOpen, setIsFoodDatabaseOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('blessikaa_day_mode', JSON.stringify(isDayMode));
  }, [isDayMode]);

  useEffect(() => {
    localStorage.setItem('blessikaa_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('blessikaa_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('blessikaa_meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('blessikaa_streak', JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('blessikaa_permissions', JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem('blessikaa_subscription', JSON.stringify(subscription));
  }, [subscription]);

  useEffect(() => {
    localStorage.setItem('blessikaa_water', JSON.stringify(waterIntake));
  }, [waterIntake]);

  // Handlers for meal operations
  const handleAddWater = (amount: number) => {
    setWaterIntake((prev) => prev + amount);
  };

  const handleToggleDayMode = () => {
    setIsDayMode((prev) => !prev);
  };

  // Logging food item to a meal slot
  const handleLogFoodItem = (item: FoodItem, mealType: MealType) => {
    setMeals((prev) => {
      const existingMeal = prev.find((m) => m.mealType === mealType);
      if (existingMeal) {
        const updatedItems = [...existingMeal.items, item];
        const totalCalories = updatedItems.reduce((s, it) => s + it.calories, 0);
        const totalProtein = updatedItems.reduce((s, it) => s + it.protein, 0);
        const totalCarbs = updatedItems.reduce((s, it) => s + it.carbs, 0);
        const totalFat = updatedItems.reduce((s, it) => s + it.fat, 0);

        return prev.map((m) =>
          m.id === existingMeal.id
            ? { ...m, items: updatedItems, totalCalories, totalProtein, totalCarbs, totalFat }
            : m
        );
      } else {
        const newMeal: LoggedMeal = {
          id: `meal-${Date.now()}`,
          mealType,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          date: new Date().toISOString().split('T')[0],
          items: [item],
          totalCalories: item.calories,
          totalProtein: item.protein,
          totalCarbs: item.carbs,
          totalFat: item.fat,
        };
        return [...prev, newMeal];
      }
    });

    // Update streak if needed
    setStreak((prev) => ({
      ...prev,
      weekHistory: prev.weekHistory.map((w) => (w.isToday ? { ...w, logged: true } : w)),
    }));
  };

  // AI Vision Scanner Meal Confirmation
  const handleConfirmAIVisionMeal = (
    detection: AIDetectionResult,
    mealType: MealType,
    photoUrl?: string
  ) => {
    const foodItems: FoodItem[] = detection.items.map((it, idx) => ({
      id: `ai-item-${Date.now()}-${idx}`,
      name: it.name,
      portion: it.portion,
      portionGrams: Math.round(detection.estimatedWeightGrams / detection.items.length),
      calories: it.calories,
      protein: it.protein,
      carbs: it.carbs,
      fat: it.fat,
    }));

    const newMeal: LoggedMeal = {
      id: `meal-ai-${Date.now()}`,
      mealType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      items: foodItems,
      totalCalories: detection.calories,
      totalProtein: detection.protein,
      totalCarbs: detection.carbs,
      totalFat: detection.fat,
      photoUrl,
      notes: `AI Scan: ${detection.dishName}`,
    };

    setMeals((prev) => [...prev, newMeal]);
  };

  // Save changes from DynamicMacroEditor
  const handleSaveMacroEditor = (updatedItem: FoodItem) => {
    if (!macroEditorItem?.mealId) {
      handleLogFoodItem(updatedItem, 'lunch');
      return;
    }

    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id === macroEditorItem.mealId) {
          const updatedItems = meal.items.map((it) =>
            it.id === updatedItem.id ? updatedItem : it
          );
          return {
            ...meal,
            items: updatedItems,
            totalCalories: updatedItems.reduce((s, it) => s + it.calories, 0),
            totalProtein: updatedItems.reduce((s, it) => s + it.protein, 0),
            totalCarbs: updatedItems.reduce((s, it) => s + it.carbs, 0),
            totalFat: updatedItems.reduce((s, it) => s + it.fat, 0),
          };
        }
        return meal;
      })
    );
  };

  // Delete item from a meal
  const handleDeleteItem = (mealId: string, itemId: string) => {
    setMeals((prev) =>
      prev
        .map((m) => {
          if (m.id === mealId) {
            const items = m.items.filter((it) => it.id !== itemId);
            return {
              ...m,
              items,
              totalCalories: items.reduce((s, it) => s + it.calories, 0),
              totalProtein: items.reduce((s, it) => s + it.protein, 0),
              totalCarbs: items.reduce((s, it) => s + it.carbs, 0),
              totalFat: items.reduce((s, it) => s + it.fat, 0),
            };
          }
          return m;
        })
        .filter((m) => m.items.length > 0)
    );
  };

  // Time picker confirmation
  const handleConfirmTimePicker = (data: { mealType: MealType; time: string; notes: string }) => {
    if (timePickerTarget?.mealId) {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === timePickerTarget.mealId
            ? { ...m, mealType: data.mealType, time: data.time, notes: data.notes || m.notes }
            : m
        )
      );
    }
  };

  // Permissions handling
  const handleAllowPermission = (type: PermissionType) => {
    setPermissions((prev) => ({ ...prev, [type]: 'granted' }));
  };

  const handleDenyPermission = (type: PermissionType) => {
    setPermissions((prev) => ({ ...prev, [type]: 'denied' }));
  };

  // Reset to initial demo
  const handleResetData = () => {
    setMeals(initialTodayMeals);
    setWaterIntake(1750);
    setGoals(initialGoals);
    setUserProfile(initialUserProfile);
    setStreak(initialStreakInfo);
    setIsSettingsOpen(false);
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-start antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300 ${
        isDayMode ? 'bg-[#ecefe9] text-[#19221a]' : 'bg-[#0b0e0c] text-[#f2f6f3]'
      }`}
    >
      {/* Top Global Control Toolbar */}
      <nav
        className={`w-full border-b backdrop-blur-md sticky top-0 z-30 px-4 py-2 flex items-center justify-between transition-colors duration-300 ${
          isDayMode
            ? 'bg-white/90 border-[#e1e5df] text-[#1a231b]'
            : 'bg-[#121814]/90 border-[#222d25] text-[#f2f6f3]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#5dba7d] flex items-center justify-center font-black text-white text-sm shadow-md shadow-emerald-600/20">
            B
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-sm tracking-tight">Blessikaa</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider hidden sm:inline">
              Health & Nutrition
            </span>
          </div>
        </div>

        {/* Viewport Frame Mode Switcher & Quick Links */}
        <div className="flex items-center gap-2">
          {/* Day / Night Vision Mode Switch */}
          <button
            onClick={handleToggleDayMode}
            title={isDayMode ? 'Switch to Night Mode (Dark Theme)' : 'Switch to Day Vision Mode (Screenshot Match)'}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isDayMode
                ? 'bg-[#f7f9f6] border-[#dbe0da] text-neutral-800 hover:bg-[#eef2ec]'
                : 'bg-[#1b231d] border-[#29382b] text-neutral-200 hover:bg-[#232f26]'
            }`}
          >
            {isDayMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden xs:inline">Day Vision</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">Night Mode</span>
              </>
            )}
          </button>

          {/* Dashboard / Analytics / AI Chat Toggle */}
          <div
            className={`flex rounded-xl p-1 border ${
              isDayMode ? 'bg-[#f0f3ee] border-[#dbe0da]' : 'bg-[#161c18] border-[#243026]'
            }`}
          >
            <button
              onClick={() => setViewTab('dashboard')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewTab === 'dashboard'
                  ? isDayMode
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'bg-[#222d25] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setViewTab('analytics')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                viewTab === 'analytics'
                  ? isDayMode
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'bg-[#222d25] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Progress
            </button>
            <button
              onClick={() => setViewTab('ai-chat')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                viewTab === 'ai-chat'
                  ? isDayMode
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'bg-[#222d25] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ai Chat
            </button>
            <button
              onClick={() => setViewTab('settings')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                viewTab === 'settings'
                  ? isDayMode
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'bg-[#222d25] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              Settings
            </button>
          </div>

          {/* Viewport Device Frame Switcher */}
          <button
            onClick={() => setDeviceMode(deviceMode === 'mobile' ? 'full' : 'mobile')}
            title={deviceMode === 'mobile' ? 'Expand to Full Width Canvas' : 'View in Mobile App Frame'}
            className={`p-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              isDayMode
                ? 'bg-white hover:bg-neutral-50 border-[#dbe0da] text-neutral-700'
                : 'bg-[#1a231d] hover:bg-[#232f26] border-[#29382b] text-neutral-300'
            }`}
          >
            {deviceMode === 'mobile' ? (
              <Maximize className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>
        </div>
      </nav>

      {/* Main Container: Conditioned by deviceMode */}
      <main className="w-full flex-1 flex justify-center p-0 sm:p-3 md:p-5">
        <div
          className={`w-full transition-all duration-300 relative ${
            deviceMode === 'mobile'
              ? isDayMode
                ? 'max-w-[430px] bg-[#f8f9f7] border border-[#dce1db] rounded-[2.5rem] p-4 sm:p-5 shadow-2xl ring-1 ring-black/5 min-h-[840px]'
                : 'max-w-[430px] bg-[#0f1411] border border-[#232f25] rounded-[2.5rem] p-4 sm:p-5 shadow-2xl ring-1 ring-white/5 min-h-[840px]'
              : isDayMode
              ? 'max-w-4xl bg-[#f8f9f7] border border-[#dce1db] rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl'
              : 'max-w-4xl bg-[#0f1411] border border-[#232f25] rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl'
          }`}
        >
          {/* Mobile Bezel Header matching exact screenshot status bar: 7:48 AM, Signal, Wifi, 87 Battery */}
          {deviceMode === 'mobile' && (
            <div
              className={`flex items-center justify-between px-2 pt-1 pb-3 -mt-1 text-[11px] font-semibold select-none ${
                isDayMode ? 'text-neutral-900' : 'text-neutral-300'
              }`}
            >
              <span>7:48 AM</span>

              {/* Dynamic Island / speaker notch */}
              <div
                className={`w-20 h-4 rounded-full flex items-center justify-center ${
                  isDayMode ? 'bg-[#e2e6e0]' : 'bg-[#1d2720]'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#5dba7d]" />
              </div>

              {/* Network, WiFi and 87% Battery Pill */}
              <div className="flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div
                  className={`flex items-center border rounded px-1 py-0.5 text-[9px] font-bold leading-none ${
                    isDayMode ? 'border-neutral-800 text-neutral-900' : 'border-neutral-400 text-white'
                  }`}
                >
                  87
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Content: Dashboard, Analytics, or AI Chat */}
          {viewTab === 'dashboard' ? (
            <DailyDashboard
              goals={goals}
              meals={meals}
              streak={streak}
              subscription={subscription}
              permissions={permissions}
              waterIntake={waterIntake}
              isDayMode={isDayMode}
              onToggleDayMode={handleToggleDayMode}
              onOpenStreak={() => setIsStreakModalOpen(true)}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenSettings={() => setViewTab('settings')}
              onOpenAnalytics={() => setViewTab('analytics')}
              onOpenAIChat={() => setViewTab('ai-chat')}
              onOpenQuickLog={() => setIsQuickLogOpen(true)}
              onOpenVisionScanner={() => setIsVisionScannerOpen(true)}
              onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
              onOpenVoiceLogger={() => setIsVoiceLoggerOpen(true)}
              onOpenFoodDatabase={() => setIsFoodDatabaseOpen(true)}
              onOpenTimePicker={(mealType, mealId) =>
                setTimePickerTarget({ mealType, mealId })
              }
              onEditItemInMacroEditor={(item, mealId) =>
                setMacroEditorItem({ item, mealId })
              }
              onDeleteItem={handleDeleteItem}
              onAddMealSlot={(mealType) => {
                setTimePickerTarget({ mealType });
                setIsFoodDatabaseOpen(true);
              }}
            />
          ) : viewTab === 'analytics' ? (
            <ProgressScreen
              userProfile={userProfile}
              goals={goals}
              meals={meals}
              isDayMode={isDayMode}
              onUpdateWeight={(newWeight) =>
                setUserProfile((prev) => ({ ...prev, weightKg: newWeight }))
              }
              onUpdateTargetWeight={(newTarget) =>
                setUserProfile((prev) => ({ ...prev, targetWeightKg: newTarget }))
              }
              onNavigateHome={() => setViewTab('dashboard')}
              onOpenAIChat={() => setViewTab('ai-chat')}
              onOpenQuickLog={() => setIsQuickLogOpen(true)}
              onOpenSettings={() => setViewTab('settings')}
            />
          ) : viewTab === 'ai-chat' ? (
            <AIAssistantScreen
              userProfile={userProfile}
              goals={goals}
              meals={meals}
              isDayMode={isDayMode}
              onNavigateHome={() => setViewTab('dashboard')}
              onOpenAnalytics={() => setViewTab('analytics')}
              onOpenQuickLog={() => setIsQuickLogOpen(true)}
              onOpenSettings={() => setViewTab('settings')}
            />
          ) : (
            <SettingsScreen
              userProfile={userProfile}
              goals={goals}
              permissions={permissions}
              subscription={subscription}
              meals={meals}
              isDayMode={isDayMode}
              onToggleDayMode={handleToggleDayMode}
              onUpdateProfile={setUserProfile}
              onUpdateGoals={setGoals}
              onRequestPermission={(type) => setPermissionTypeModal(type)}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onResetData={handleResetData}
              onNavigateHome={() => setViewTab('dashboard')}
              onOpenAnalytics={() => setViewTab('analytics')}
              onOpenAIChat={() => setViewTab('ai-chat')}
              onOpenQuickLog={() => setIsQuickLogOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Quick Log Modal for Big Green Center FAB */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onOpenVisionScanner={() => setIsVisionScannerOpen(true)}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenVoiceLogger={() => setIsVoiceLoggerOpen(true)}
        onOpenFoodDatabase={() => setIsFoodDatabaseOpen(true)}
        onAddWater={handleAddWater}
        isDayMode={isDayMode}
      />

      {/* Blessikaa AI Chat Modal */}
      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        goals={goals}
        meals={meals}
        userProfile={userProfile}
        isDayMode={isDayMode}
      />

      {/* 1. Dynamic Macro Editor Modal */}
      {macroEditorItem && (
        <DynamicMacroEditor
          isOpen={Boolean(macroEditorItem)}
          initialItem={macroEditorItem.item}
          onClose={() => setMacroEditorItem(null)}
          onSave={handleSaveMacroEditor}
        />
      )}

      {/* 2. System Permission Modal */}
      <PermissionModal
        type={permissionTypeModal}
        isOpen={Boolean(permissionTypeModal)}
        onClose={() => setPermissionTypeModal(null)}
        onAllow={handleAllowPermission}
        onDeny={handleDenyPermission}
      />

      {/* 3. Streak Tracker Modal */}
      <StreakTracker
        streak={streak}
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        onUseFreeze={() => {
          setStreak((prev) => ({
            ...prev,
            freezesLeft: Math.max(0, prev.freezesLeft - 1),
            weekHistory: prev.weekHistory.map((w, i) =>
              i === 0 ? { ...w, freezeUsed: true } : w
            ),
          }));
        }}
        onLogMealClick={() => {
          setIsVisionScannerOpen(true);
        }}
      />

      {/* 4. Time Picker Modal */}
      {timePickerTarget && (
        <TimePickerModal
          isOpen={Boolean(timePickerTarget)}
          initialMealType={timePickerTarget.mealType}
          onClose={() => setTimePickerTarget(null)}
          onConfirm={handleConfirmTimePicker}
        />
      )}

      {/* 5. Subscription Paywall Modal */}
      <SubscriptionPaywall
        subscription={subscription}
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onSubscribe={(plan) => {
          setSubscription({
            isPro: true,
            plan,
            trialExpiresAt: 'In 7 Days',
            renewsAt: 'Sep 16, 2026',
          });
        }}
        onCancelSubscription={() => {
          setSubscription({ isPro: false, plan: null, trialExpiresAt: null });
        }}
      />

      {/* 6. AI Vision Camera Scanner Modal */}
      <AIVisionScanner
        isOpen={isVisionScannerOpen}
        onClose={() => setIsVisionScannerOpen(false)}
        cameraPermissionGranted={permissions.camera === 'granted'}
        onRequestCameraPermission={() => setPermissionTypeModal('camera')}
        onOpenMacroEditor={(item) => {
          setIsVisionScannerOpen(false);
          setMacroEditorItem({ item });
        }}
        onConfirmMealLog={handleConfirmAIVisionMeal}
      />

      {/* 7. Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onLogItem={handleLogFoodItem}
        onOpenMacroEditor={(item) => {
          setIsBarcodeScannerOpen(false);
          setMacroEditorItem({ item });
        }}
      />

      {/* 8. Voice & NLP Quick Logger Modal */}
      <VoiceQuickLogModal
        isOpen={isVoiceLoggerOpen}
        onClose={() => setIsVoiceLoggerOpen(false)}
        onLogParsedItems={(items, mealType, title) => {
          const totalCalories = items.reduce((s, it) => s + it.calories, 0);
          const totalProtein = items.reduce((s, it) => s + it.protein, 0);
          const totalCarbs = items.reduce((s, it) => s + it.carbs, 0);
          const totalFat = items.reduce((s, it) => s + it.fat, 0);

          const newMeal: LoggedMeal = {
            id: `meal-voice-${Date.now()}`,
            mealType,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0],
            items,
            totalCalories,
            totalProtein,
            totalCarbs,
            totalFat,
            notes: title,
          };
          setMeals((prev) => [...prev, newMeal]);
        }}
      />

      {/* 9. Food Database & Custom Food Modal */}
      <FoodDatabaseModal
        isOpen={isFoodDatabaseOpen}
        onClose={() => setIsFoodDatabaseOpen(false)}
        onLogItem={handleLogFoodItem}
        onOpenMacroEditor={(item) => {
          setIsFoodDatabaseOpen(false);
          setMacroEditorItem({ item });
        }}
      />

      {/* 10. Settings & Targets Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        goals={goals}
        permissions={permissions}
        subscription={subscription}
        onUpdateProfile={setUserProfile}
        onUpdateGoals={setGoals}
        onRequestPermission={(type) => setPermissionTypeModal(type)}
        onToggleSubscription={() => {
          setSubscription((prev) => ({
            ...prev,
            isPro: !prev.isPro,
            plan: !prev.isPro ? 'annual' : null,
          }));
        }}
        onResetData={handleResetData}
      />
    </div>
  );
}
