import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, BarChart3, PieChart, Target, Flame, ArrowUpRight, ArrowDownRight, Award, Shield } from 'lucide-react';
import { DailyGoals, LoggedMeal, UserProfile } from '../types/nutrition';

interface AnalyticsViewProps {
  goals: DailyGoals;
  meals: LoggedMeal[];
  userProfile: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  goals,
  meals,
  userProfile,
}) => {
  // Weekly simulated data
  const weeklyData = [
    { day: 'Mon', calories: 2080, target: goals.calories, protein: 155, carbs: 190, fat: 62 },
    { day: 'Tue', calories: 2190, target: goals.calories, protein: 168, carbs: 205, fat: 64 },
    { day: 'Wed', calories: 1950, target: goals.calories, protein: 152, carbs: 180, fat: 58 },
    { day: 'Thu', calories: 2240, target: goals.calories, protein: 162, carbs: 210, fat: 70 },
    { day: 'Fri', calories: 2110, target: goals.calories, protein: 158, carbs: 192, fat: 63 },
    { day: 'Sat', calories: 2150, target: goals.calories, protein: 160, carbs: 195, fat: 65 },
    { day: 'Sun (Est)', calories: 2050, target: goals.calories, protein: 150, carbs: 190, fat: 60 },
  ];

  const totalCaloriesToday = meals.reduce((sum, m) => sum + m.totalCalories, 0);
  const totalProteinToday = meals.reduce((sum, m) => sum + m.totalProtein, 0);
  const totalCarbsToday = meals.reduce((sum, m) => sum + m.totalCarbs, 0);
  const totalFatToday = meals.reduce((sum, m) => sum + m.totalFat, 0);

  // Macro calorie shares
  const pKcal = totalProteinToday * 4;
  const cKcal = totalCarbsToday * 4;
  const fKcal = totalFatToday * 9;
  const sumKcal = pKcal + cKcal + fKcal || 1;

  const proteinRatio = Math.round((pKcal / sumKcal) * 100);
  const carbsRatio = Math.round((cKcal / sumKcal) * 100);
  const fatRatio = Math.max(0, 100 - proteinRatio - carbsRatio);

  const avgCalories = Math.round(
    weeklyData.reduce((sum, d) => sum + d.calories, 0) / weeklyData.length
  );
  const weeklyDeficit = (goals.calories - avgCalories) * 7;
  const projectedWeeklyLoss = (Math.max(0, weeklyDeficit) / 7700).toFixed(2); // 7700 kcal per kg fat

  return (
    <div className="space-y-5 pb-8">
      {/* Overview Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 font-medium">7-Day Avg Intake</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white font-mono">{avgCalories}</span>
            <span className="text-[11px] text-neutral-400">kcal/d</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1">
            <ArrowDownRight className="w-3 h-3" /> Within 1.5% target
          </span>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 font-medium">Weekly Net Deficit</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              -{Math.abs(weeklyDeficit)}
            </span>
            <span className="text-[11px] text-neutral-400">kcal</span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            ~{projectedWeeklyLoss} kg fat loss / wk
          </span>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 font-medium">Protein Consistency</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-white font-mono">94%</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1">
            <Target className="w-3 h-3" /> High recovery index
          </span>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <span className="text-xs text-neutral-400 font-medium">Active Burn / Day</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {goals.burnedCalories}
            </span>
            <span className="text-[11px] text-neutral-400">kcal</span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            Via Health Sync ({goals.steps.toLocaleString()} steps)
          </span>
        </div>
      </div>

      {/* 7-Day Calorie Intake Bar Chart */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">7-Day Calorie Intake vs Budget</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-neutral-400 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Consumed
            </span>
            <span className="flex items-center gap-1 text-neutral-400 text-[11px]">
              <span className="w-2.5 h-0.5 bg-neutral-600 inline-block border-t border-dashed border-neutral-400" /> Target ({goals.calories})
            </span>
          </div>
        </div>

        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
          {weeklyData.map((item, idx) => {
            const maxRef = 2600;
            const heightPct = Math.min(100, Math.round((item.calories / maxRef) * 100));
            const isNearTarget = Math.abs(item.calories - item.target) <= 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-mono text-neutral-400">{item.calories}</span>
                <div className="w-full bg-neutral-800/80 rounded-xl h-full flex items-end overflow-hidden p-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.08 }}
                    className={`w-full rounded-lg transition ${
                      isNearTarget
                        ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                        : item.calories > item.target
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                        : 'bg-gradient-to-t from-teal-600 to-teal-400'
                    }`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-neutral-300">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro Split & Nutrient Densities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Macro Distribution */}
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-white">Current Macro Energy Distribution</h3>
          </div>

          <div className="h-4 w-full rounded-full bg-neutral-800 overflow-hidden flex mb-4 shadow-inner">
            <div style={{ width: `${proteinRatio}%` }} className="bg-emerald-500" />
            <div style={{ width: `${carbsRatio}%` }} className="bg-sky-500" />
            <div style={{ width: `${fatRatio}%` }} className="bg-amber-500" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-white font-medium">Protein ({proteinRatio}%)</span>
              </div>
              <span className="font-mono text-neutral-300">
                {Math.round(totalProteinToday)}g / {goals.protein}g goal
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="text-white font-medium">Carbohydrates ({carbsRatio}%)</span>
              </div>
              <span className="font-mono text-neutral-300">
                {Math.round(totalCarbsToday)}g / {goals.carbs}g goal
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-white font-medium">Dietary Fat ({fatRatio}%)</span>
              </div>
              <span className="font-mono text-neutral-300">
                {Math.round(totalFatToday)}g / {goals.fat}g goal
              </span>
            </div>
          </div>
        </div>

        {/* Health Insights & Body Goal Guidance */}
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Blessikaa AI Metabolic Projection</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Based on your target caloric deficit of <strong>350 kcal/day</strong> and high protein intake ({userProfile.weightKg} kg bodyweight at ~2.2g/kg), you are in the optimal sweet spot for lean body recomposition.
            </p>

            <div className="mt-4 p-3.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Current Weight:</span>
                <span className="text-white font-mono font-bold">{userProfile.weightKg} kg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Target Goal Weight:</span>
                <span className="text-emerald-400 font-mono font-bold">{userProfile.targetWeightKg} kg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Estimated Target Reach:</span>
                <span className="text-white font-mono font-bold">~6 Weeks</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Consistency score: 96% adherence over the last 14 days.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
