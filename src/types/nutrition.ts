export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  portionGrams: number;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber?: number;  // in grams
  sugar?: number;  // in grams
  sodium?: number; // in mg
  barcode?: string;
  category?: string;
  photoUrl?: string;
  confidence?: number;
}

export interface LoggedMeal {
  id: string;
  mealType: MealType;
  time: string; // e.g. "08:30 AM"
  timestamp: number;
  date: string; // "YYYY-MM-DD"
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  photoUrl?: string;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  burnedCalories: number;
  steps: number;
}

export interface StreakMilestone {
  id: string;
  name: string;
  daysRequired: number;
  unlocked: boolean;
  icon: string;
  description: string;
  unlockedDate?: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  freezesLeft: number;
  lastLoggedDate: string;
  weekHistory: {
    day: string; // 'M', 'T', 'W', 'T', 'F', 'S', 'S'
    label: string; // 'Mon', 'Tue', ...
    date: string;
    logged: boolean;
    freezeUsed: boolean;
    isToday: boolean;
  }[];
  milestones: StreakMilestone[];
}

export type PermissionStatus = 'prompt' | 'granted' | 'denied';

export interface PermissionsState {
  camera: PermissionStatus;
  healthSync: PermissionStatus;
  notifications: PermissionStatus;
}

export interface SubscriptionState {
  isPro: boolean;
  plan: 'annual' | 'monthly' | null;
  trialExpiresAt: string | null;
  renewsAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  weightKg: number;
  targetWeightKg: number;
  heightCm: number;
  age: number;
  sex: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  goal: 'cut' | 'maintain' | 'bulk';
  dietType: 'balanced' | 'high_protein' | 'keto' | 'vegan' | 'custom';
}

export interface AIDetectionResult {
  dishName: string;
  confidenceScore: number;
  estimatedWeightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  healthScore?: number;
  items: {
    name: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  nutritionAdvice?: string;
}
