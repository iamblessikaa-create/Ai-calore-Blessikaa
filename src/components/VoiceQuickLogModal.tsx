import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, Sparkles, Check, X, Send, Volume2, Dumbbell, Wheat, Droplets } from 'lucide-react';
import { FoodItem, MealType } from '../types/nutrition';

interface VoiceQuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogParsedItems: (items: FoodItem[], mealType: MealType, title: string) => void;
}

export const VoiceQuickLogModal: React.FC<VoiceQuickLogModalProps> = ({
  isOpen,
  onClose,
  onLogParsedItems,
}) => {
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const [parsedPreview, setParsedPreview] = useState<{
    dishName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    items: FoodItem[];
  } | null>(null);

  const samplePrompts = [
    '2 poached eggs with 1 slice sourdough bread and half an avocado',
    '200g grilled chicken breast with 1 cup cooked quinoa and steamed broccoli',
    'Whey protein shake with 1 medium banana and 1 tbsp peanut butter',
    'Large bowl of oatmeal with blueberries, honey, and almond butter',
  ];

  const handleSimulateVoice = () => {
    setIsListening(true);
    const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setTextInput('');

    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < randomPrompt.length) {
        setTextInput((prev) => prev + randomPrompt.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(interval);
        setIsListening(false);
        parseMealText(randomPrompt);
      }
    }, 30);
  };

  const parseMealText = async (promptToParse: string) => {
    const query = promptToParse || textInput;
    if (!query.trim()) return;

    setIsProcessing(true);
    try {
      // Call server backend or fallback
      const response = await fetch('/api/ai/parse-text-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textInput: query }),
      });
      const res = await response.json();

      if (res.success && res.data?.calories) {
        const d = res.data;
        const foodItems: FoodItem[] = (d.items || []).map((it: any, i: number) => ({
          id: `nlp-${Date.now()}-${i}`,
          name: it.name,
          portion: it.portion || '1 serving',
          portionGrams: 100,
          calories: it.calories || 100,
          protein: it.protein || 5,
          carbs: it.carbs || 10,
          fat: it.fat || 3,
        }));

        setParsedPreview({
          dishName: d.dishName || 'Logged Meal',
          calories: d.calories,
          protein: d.protein,
          carbs: d.carbs,
          fat: d.fat,
          items: foodItems,
        });
      } else {
        // Fallback intelligent parser
        parseLocally(query);
      }
    } catch (err) {
      parseLocally(query);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseLocally = (query: string) => {
    const q = query.toLowerCase();
    let calories = 350;
    let protein = 25;
    let carbs = 30;
    let fat = 12;
    const items: FoodItem[] = [];

    if (q.includes('egg')) {
      items.push({
        id: `egg-${Date.now()}`,
        name: 'Eggs (Prepared)',
        portion: '2 large',
        portionGrams: 100,
        calories: 144,
        protein: 12.6,
        carbs: 0.8,
        fat: 10,
      });
    }
    if (q.includes('toast') || q.includes('sourdough') || q.includes('bread')) {
      items.push({
        id: `bread-${Date.now()}`,
        name: 'Sourdough Toast Slice',
        portion: '1 slice (60g)',
        portionGrams: 60,
        calories: 150,
        protein: 5,
        carbs: 28,
        fat: 1,
      });
    }
    if (q.includes('avocado')) {
      items.push({
        id: `avo-${Date.now()}`,
        name: 'Fresh Avocado',
        portion: '1/2 medium (75g)',
        portionGrams: 75,
        calories: 120,
        protein: 1.5,
        carbs: 6,
        fat: 11,
      });
    }
    if (q.includes('chicken') || q.includes('breast')) {
      items.push({
        id: `chk-${Date.now()}`,
        name: 'Grilled Chicken Breast',
        portion: '180g',
        portionGrams: 180,
        calories: 290,
        protein: 55,
        carbs: 0,
        fat: 6,
      });
    }
    if (q.includes('salmon')) {
      items.push({
        id: `sal-${Date.now()}`,
        name: 'Atlantic Salmon Fillet',
        portion: '170g',
        portionGrams: 170,
        calories: 320,
        protein: 34,
        carbs: 0,
        fat: 18,
      });
    }
    if (q.includes('protein') || q.includes('shake')) {
      items.push({
        id: `pro-${Date.now()}`,
        name: 'Whey Protein Isolate',
        portion: '1 scoop (30g)',
        portionGrams: 30,
        calories: 120,
        protein: 25,
        carbs: 2,
        fat: 1,
      });
    }

    if (items.length === 0) {
      items.push({
        id: `gen-${Date.now()}`,
        name: query.slice(0, 30),
        portion: '1 meal serving',
        portionGrams: 250,
        calories: 420,
        protein: 30,
        carbs: 45,
        fat: 14,
      });
    }

    calories = items.reduce((sum, it) => sum + it.calories, 0);
    protein = items.reduce((sum, it) => sum + it.protein, 0);
    carbs = items.reduce((sum, it) => sum + it.carbs, 0);
    fat = items.reduce((sum, it) => sum + it.fat, 0);

    setParsedPreview({
      dishName: query.slice(0, 45),
      calories,
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      items,
    });
  };

  const handleConfirm = () => {
    if (!parsedPreview) return;
    onLogParsedItems(parsedPreview.items, selectedMealType, parsedPreview.dishName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-neutral-100 relative my-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Voice & Natural Language Logger</h3>
              <p className="text-xs text-neutral-400">Speak or describe what you ate in everyday words</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice recording button & waveform simulator */}
        <div className="mt-5 p-5 bg-neutral-950/80 border border-neutral-800 rounded-2xl text-center">
          <button
            type="button"
            onClick={handleSimulateVoice}
            disabled={isListening || isProcessing}
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20'
            }`}
          >
            <Mic className="w-7 h-7" />
          </button>

          <span className="text-xs font-semibold text-neutral-200 block mt-3">
            {isListening ? 'Listening... Speak naturally' : 'Tap Microphone to Speak'}
          </span>
          <span className="text-[11px] text-neutral-500 block mt-0.5">
            Or type your meal description below
          </span>

          {/* Animated audio wave bars when listening */}
          {isListening && (
            <div className="flex items-center justify-center gap-1 mt-3">
              {[40, 75, 90, 50, 80, 100, 65, 45, 95, 30].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [8, h * 0.28, 8] }}
                  transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.08 }}
                  className="w-1 bg-emerald-400 rounded-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* Text Input area */}
        <div className="mt-4 space-y-2">
          <div className="relative">
            <textarea
              rows={2}
              placeholder="e.g. 2 fried eggs, 2 slices turkey bacon, and a cup of whole milk latte..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-3 bg-neutral-800/80 border border-neutral-700/80 rounded-2xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
            <button
              type="button"
              onClick={() => parseMealText(textInput)}
              disabled={isProcessing || !textInput.trim()}
              className="absolute right-2.5 bottom-3 p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prompt sample chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] text-neutral-500 shrink-0">Try:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTextInput(p);
                  parseMealText(p);
                }}
                className="text-[10px] px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap transition cursor-pointer"
              >
                {p.slice(0, 24)}...
              </button>
            ))}
          </div>
        </div>

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="my-4 p-4 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>AI is parsing nutrients and estimating portions...</span>
          </div>
        )}

        {/* Parsed Result Preview */}
        {parsedPreview && !isProcessing && (
          <div className="mt-4 p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">
                  AI Extracted Meal
                </span>
                <h4 className="font-bold text-sm text-white capitalize">{parsedPreview.dishName}</h4>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white font-mono">{parsedPreview.calories}</span>
                <span className="text-xs text-neutral-400 ml-1">kcal</span>
              </div>
            </div>

            {/* Macro tags */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                  <Dumbbell className="w-3 h-3" /> Protein
                </span>
                <span className="text-xs font-mono font-bold text-white block mt-0.5">
                  {parsedPreview.protein}g
                </span>
              </div>
              <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                <span className="text-[10px] text-sky-400 flex items-center justify-center gap-1">
                  <Wheat className="w-3 h-3" /> Carbs
                </span>
                <span className="text-xs font-mono font-bold text-white block mt-0.5">
                  {parsedPreview.carbs}g
                </span>
              </div>
              <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                <span className="text-[10px] text-amber-400 flex items-center justify-center gap-1">
                  <Droplets className="w-3 h-3" /> Fat
                </span>
                <span className="text-xs font-mono font-bold text-white block mt-0.5">
                  {parsedPreview.fat}g
                </span>
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-1">
              {parsedPreview.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-neutral-900/60"
                >
                  <span className="text-neutral-200">
                    {it.name} <span className="text-neutral-500 text-[10px]">({it.portion})</span>
                  </span>
                  <span className="font-mono text-neutral-300 font-semibold">{it.calories} kcal</span>
                </div>
              ))}
            </div>

            {/* Meal Slot Selector */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/60">
              <span className="text-neutral-400">Meal Slot:</span>
              <div className="flex gap-1">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMealType(m)}
                    className={`px-2 py-0.5 rounded-lg capitalize text-[11px] transition ${
                      selectedMealType === m
                        ? 'bg-emerald-500 text-neutral-950 font-bold'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parsedPreview}
            onClick={handleConfirm}
            className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Confirm & Log Voice Meal
          </button>
        </div>
      </motion.div>
    </div>
  );
};
