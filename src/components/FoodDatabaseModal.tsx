import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Sliders, Check, X, Filter, Sparkles, Dumbbell, Wheat, Droplets, ArrowLeft } from 'lucide-react';
import { FoodItem, MealType } from '../types/nutrition';
import { sampleFoodDatabase } from '../data/mockData';

interface FoodDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogItem: (item: FoodItem, mealType: MealType) => void;
  onOpenMacroEditor: (item: FoodItem) => void;
}

export const FoodDatabaseModal: React.FC<FoodDatabaseModalProps> = ({
  isOpen,
  onClose,
  onLogItem,
  onOpenMacroEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customPortion, setCustomPortion] = useState('1 serving (100g)');
  const [customPortionGrams, setCustomPortionGrams] = useState(100);
  const [customCalories, setCustomCalories] = useState(200);
  const [customProtein, setCustomProtein] = useState(20);
  const [customCarbs, setCustomCarbs] = useState(15);
  const [customFat, setCustomFat] = useState(5);

  const categories = ['All', 'High Protein', 'Breakfast', 'Snacks', 'Veggies', 'Grains', 'Beverages'];

  const filteredFoods = sampleFoodDatabase.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      portion: customPortion,
      portionGrams: customPortionGrams,
      calories: customCalories,
      protein: customProtein,
      carbs: customCarbs,
      fat: customFat,
      category: 'Custom',
    };

    onLogItem(newItem, selectedMealType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-neutral-100 flex flex-col max-h-[92vh] my-auto overflow-hidden relative"
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
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Food Catalog</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'search'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Verified Database
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'custom'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            + Create Custom Food
          </button>
        </div>

        {/* Meal Slot Selector */}
        <div className="flex items-center justify-between mt-4 px-1 text-xs">
          <span className="text-neutral-400 font-medium">Log into meal:</span>
          <div className="flex gap-1.5">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMealType(m)}
                className={`px-2.5 py-1 rounded-lg capitalize text-xs transition ${
                  selectedMealType === m
                    ? 'bg-emerald-500 text-neutral-950 font-bold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'search' ? (
          <div className="mt-4 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search salmon, oatmeal, chicken breast, yogurt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                      : 'bg-neutral-800/60 border border-neutral-700/60 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Foods List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredFoods.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800/90 hover:border-neutral-700 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>
                      {item.category && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">{item.portion}</span>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                      <span className="text-emerald-400 font-semibold">P: {item.protein}g</span>
                      <span className="text-sky-400 font-semibold">C: {item.carbs}g</span>
                      <span className="text-amber-400 font-semibold">F: {item.fat}g</span>
                    </div>
                  </div>

                  {/* Calories & Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-white font-mono">{item.calories}</span>
                      <span className="text-[10px] text-neutral-500 block">kcal</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenMacroEditor(item)}
                      title="Fine-tune in Macro Editor"
                      className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLogItem(item, selectedMealType);
                        onClose();
                      }}
                      title="Quick log"
                      className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition shadow-md shadow-emerald-500/20"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateCustom} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Custom Food Name</label>
              <input
                type="text"
                placeholder="e.g. Homemade Protein Pancakes"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Portion Label</label>
                <input
                  type="text"
                  placeholder="e.g. 2 pancakes (120g)"
                  value={customPortion}
                  onChange={(e) => setCustomPortion(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Weight (g)</label>
                <input
                  type="number"
                  value={customPortionGrams}
                  onChange={(e) => setCustomPortionGrams(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">Calories</label>
                <input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-emerald-400 mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-sky-400 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-amber-400 mb-1">Fat (g)</label>
                <input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Save & Log Custom Food
            </button>
          </form>
        )}
        </div>

        {/* Sticky Bottom Bar */}
        <div className="sticky bottom-0 z-30 p-3.5 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] text-neutral-400">
            {activeTab === 'search' ? `${filteredFoods.length} verified foods` : 'Custom nutrition entry'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
