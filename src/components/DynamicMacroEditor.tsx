import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Check, RotateCcw, Flame, Dumbbell, Wheat, Droplets, Info, ArrowLeft } from 'lucide-react';
import { FoodItem } from '../types/nutrition';

interface DynamicMacroEditorProps {
  initialItem: FoodItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: FoodItem) => void;
  title?: string;
}

export const DynamicMacroEditor: React.FC<DynamicMacroEditorProps> = ({
  initialItem,
  isOpen,
  onClose,
  onSave,
  title = "Dynamic Macro Editor",
}) => {
  const [name, setName] = useState(initialItem.name);
  const [portionGrams, setPortionGrams] = useState(initialItem.portionGrams || 100);
  const [portionMultiplier, setPortionMultiplier] = useState(1.0);
  
  // Base macros per 1.0 multiplier
  const [baseProtein, setBaseProtein] = useState(initialItem.protein);
  const [baseCarbs, setBaseCarbs] = useState(initialItem.carbs);
  const [baseFat, setBaseFat] = useState(initialItem.fat);
  const [baseFiber, setBaseFiber] = useState(initialItem.fiber || 0);
  const [baseSugar, setBaseSugar] = useState(initialItem.sugar || 0);
  const [baseSodium, setBaseSodium] = useState(initialItem.sodium || 0);

  // Active adjusted values
  const [protein, setProtein] = useState(initialItem.protein);
  const [carbs, setCarbs] = useState(initialItem.carbs);
  const [fat, setFat] = useState(initialItem.fat);
  const [fiber, setFiber] = useState(initialItem.fiber || 0);
  const [sugar, setSugar] = useState(initialItem.sugar || 0);
  const [sodium, setSodium] = useState(initialItem.sodium || 0);

  // Sync state when initialItem changes
  useEffect(() => {
    setName(initialItem.name);
    const grams = initialItem.portionGrams || 100;
    setPortionGrams(grams);
    setPortionMultiplier(1.0);
    setBaseProtein(initialItem.protein);
    setBaseCarbs(initialItem.carbs);
    setBaseFat(initialItem.fat);
    setBaseFiber(initialItem.fiber || 0);
    setBaseSugar(initialItem.sugar || 0);
    setBaseSodium(initialItem.sodium || 0);
    setProtein(initialItem.protein);
    setCarbs(initialItem.carbs);
    setFat(initialItem.fat);
    setFiber(initialItem.fiber || 0);
    setSugar(initialItem.sugar || 0);
    setSodium(initialItem.sodium || 0);
  }, [initialItem]);

  // When portion multiplier slider moves, adjust values proportionally
  const handleMultiplierChange = (newMultiplier: number) => {
    setPortionMultiplier(newMultiplier);
    const round = (val: number) => Math.round(val * 10) / 10;
    setProtein(round(baseProtein * newMultiplier));
    setCarbs(round(baseCarbs * newMultiplier));
    setFat(round(baseFat * newMultiplier));
    setFiber(round(baseFiber * newMultiplier));
    setSugar(round(baseSugar * newMultiplier));
    setSodium(Math.round(baseSodium * newMultiplier));
    setPortionGrams(Math.round((initialItem.portionGrams || 100) * newMultiplier));
  };

  // Dynamic live calorie calculation: (Protein * 4) + (Carbs * 4) + (Fat * 9)
  const computedCalories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));

  // Percentage breakdown of calories
  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  const totalKcal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinPct = Math.round((proteinKcal / totalKcal) * 100);
  const carbsPct = Math.round((carbsKcal / totalKcal) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  const handleReset = () => {
    setPortionMultiplier(1.0);
    setPortionGrams(initialItem.portionGrams || 100);
    setProtein(initialItem.protein);
    setCarbs(initialItem.carbs);
    setFat(initialItem.fat);
    setFiber(initialItem.fiber || 0);
    setSugar(initialItem.sugar || 0);
    setSodium(initialItem.sodium || 0);
  };

  const handleSave = () => {
    const updated: FoodItem = {
      ...initialItem,
      name,
      portionGrams,
      portion: `${portionGrams}g (${portionMultiplier.toFixed(1)}x serving)`,
      calories: computedCalories,
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
      sugar: Math.round(sugar * 10) / 10,
      sodium: Math.round(sodium),
    };
    onSave(updated);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl relative text-neutral-100 flex flex-col max-h-[92vh] my-auto overflow-hidden"
      >
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-white">{title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              title="Reset to original"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Food Name & Portion info */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Food / Dish Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-800/80 border border-neutral-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Dynamic Calorie & Macro Distribution Header Card */}
          <div className="bg-neutral-950/80 border border-neutral-800/90 rounded-2xl p-4.5">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-xs text-neutral-400 font-medium">Computed Calories</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {computedCalories}
                  </span>
                  <span className="text-xs text-neutral-400">kcal</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400">Portion Size</span>
                <div className="text-sm font-semibold text-emerald-400 font-mono">
                  {portionGrams}g <span className="text-neutral-500 font-normal">({portionMultiplier.toFixed(1)}x)</span>
                </div>
              </div>
            </div>

            {/* Visual Macro Percentage Multi-Segment Bar */}
            <div className="h-3.5 w-full rounded-full bg-neutral-800 overflow-hidden flex shadow-inner mb-2.5">
              <div
                style={{ width: `${proteinPct}%` }}
                className="bg-emerald-500 transition-all duration-300 relative group"
                title={`Protein: ${proteinPct}%`}
              />
              <div
                style={{ width: `${carbsPct}%` }}
                className="bg-sky-500 transition-all duration-300 relative group"
                title={`Carbs: ${carbsPct}%`}
              />
              <div
                style={{ width: `${fatPct}%` }}
                className="bg-amber-500 transition-all duration-300 relative group"
                title={`Fat: ${fatPct}%`}
              />
            </div>

            {/* Macro Distribution Legend */}
            <div className="grid grid-cols-3 text-center gap-2 pt-1 border-t border-neutral-800/60">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Protein
                </div>
                <span className="text-xs font-mono font-bold text-white mt-0.5">{proteinPct}%</span>
                <span className="text-[10px] text-neutral-500">({proteinKcal} kcal)</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-[11px] text-sky-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                  Carbs
                </div>
                <span className="text-xs font-mono font-bold text-white mt-0.5">{carbsPct}%</span>
                <span className="text-[10px] text-neutral-500">({carbsKcal} kcal)</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Fat
                </div>
                <span className="text-xs font-mono font-bold text-white mt-0.5">{fatPct}%</span>
                <span className="text-[10px] text-neutral-500">({fatKcal} kcal)</span>
              </div>
            </div>
          </div>

          {/* Portion Multiplier Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-300 font-medium">Scale Portion Multiplier</span>
              <span className="text-emerald-400 font-mono font-semibold">{portionMultiplier.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="3.0"
              step="0.05"
              value={portionMultiplier}
              onChange={(e) => handleMultiplierChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-neutral-500">
              <button
                type="button"
                onClick={() => handleMultiplierChange(0.5)}
                className="hover:text-neutral-300 cursor-pointer"
              >
                0.5x (Snack)
              </button>
              <button
                type="button"
                onClick={() => handleMultiplierChange(1.0)}
                className="hover:text-neutral-300 cursor-pointer text-emerald-400 font-medium"
              >
                1.0x (Regular)
              </button>
              <button
                type="button"
                onClick={() => handleMultiplierChange(1.5)}
                className="hover:text-neutral-300 cursor-pointer"
              >
                1.5x (Hearty)
              </button>
              <button
                type="button"
                onClick={() => handleMultiplierChange(2.0)}
                className="hover:text-neutral-300 cursor-pointer"
              >
                2.0x (Double)
              </button>
            </div>
          </div>

          {/* Granular Macro Sliders & Direct Value Inputs */}
          <div className="space-y-3.5 pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Fine-Tune Grams
            </span>

            {/* Protein Slider */}
            <div className="p-3 bg-neutral-800/40 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Dumbbell className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-neutral-200">Protein</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="300"
                    step="0.5"
                    value={protein}
                    onChange={(e) => setProtein(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-right font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-neutral-400">g</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="0.5"
                value={protein}
                onChange={(e) => setProtein(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Carbs Slider */}
            <div className="p-3 bg-neutral-800/40 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Wheat className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-neutral-200">Carbohydrates</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="400"
                    step="0.5"
                    value={carbs}
                    onChange={(e) => setCarbs(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-right font-mono text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-xs text-neutral-400">g</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="0.5"
                value={carbs}
                onChange={(e) => setCarbs(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>

            {/* Fat Slider */}
            <div className="p-3 bg-neutral-800/40 border border-neutral-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-neutral-200">Dietary Fat</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="0.5"
                    value={fat}
                    onChange={(e) => setFat(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 px-2 py-1 bg-neutral-900 border border-neutral-700 rounded-lg text-right font-mono text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs text-neutral-400">g</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="0.5"
                value={fat}
                onChange={(e) => setFat(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Secondary Micronutrients (Collapsible / Compact) */}
          <div className="pt-2">
            <span className="text-xs font-medium text-neutral-400 mb-2 block">
              Micronutrients & Satiety Factors
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-neutral-800/40 border border-neutral-800 rounded-xl">
                <span className="text-[10px] text-neutral-400 block">Dietary Fiber</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={fiber}
                    onChange={(e) => setFiber(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono text-xs text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500">g</span>
                </div>
              </div>

              <div className="p-2.5 bg-neutral-800/40 border border-neutral-800 rounded-xl">
                <span className="text-[10px] text-neutral-400 block">Sugars</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={sugar}
                    onChange={(e) => setSugar(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono text-xs text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500">g</span>
                </div>
              </div>

              <div className="p-2.5 bg-neutral-800/40 border border-neutral-800 rounded-xl">
                <span className="text-[10px] text-neutral-400 block">Sodium</span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    value={sodium}
                    onChange={(e) => setSodium(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent font-mono text-xs text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-neutral-500">mg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="sticky bottom-0 z-30 p-4 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};
