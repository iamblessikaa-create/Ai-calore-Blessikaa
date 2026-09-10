import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ScanLine, Search, Check, X, Sliders, AlertCircle, Dumbbell, Wheat, Droplets, ArrowLeft } from 'lucide-react';
import { FoodItem, MealType } from '../types/nutrition';
import { sampleBarcodes } from '../data/mockData';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogItem: (item: FoodItem, mealType: MealType) => void;
  onOpenMacroEditor: (item: FoodItem) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onLogItem,
  onOpenMacroEditor,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scannedItem, setScannedItem] = useState<FoodItem | null>(sampleBarcodes[0].item);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('snack');
  const [notFoundError, setNotFoundError] = useState(false);

  const handleScanSample = (code: string) => {
    setIsScanning(true);
    setNotFoundError(false);
    setTimeout(() => {
      const match = sampleBarcodes.find((b) => b.code === code);
      if (match) {
        setScannedItem(match.item);
      } else {
        setNotFoundError(true);
      }
      setIsScanning(false);
    }, 500);
  };

  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScanSample(manualCode.trim());
  };

  const handleConfirmLog = () => {
    if (!scannedItem) return;
    onLogItem(scannedItem, selectedMealType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-neutral-100 flex flex-col max-h-[92vh] my-auto overflow-hidden relative"
      >
        {/* Sticky Top Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-5 py-3.5 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-7 h-7 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Barcode Scanner</h3>
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

        {/* Barcode Camera Viewport Simulator */}
        <div className="mt-4 relative bg-black rounded-2xl h-44 border border-neutral-800 overflow-hidden flex items-center justify-center">
          {/* Animated red laser scanning line */}
          <motion.div
            initial={{ top: '15%' }}
            animate={{ top: ['15%', '85%', '15%'] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="absolute left-6 right-6 h-0.5 bg-rose-500 shadow-[0_0_10px_#ef4444]"
          />

          {/* Barcode graphic in background */}
          <div className="opacity-25 flex items-center gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="bg-white h-20"
                style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }}
              />
            ))}
          </div>

          <div className="absolute bottom-2.5 px-3 py-1 rounded-full bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 text-[10px] text-neutral-300">
            Center barcode in viewfinder
          </div>
        </div>

        {/* Quick Sample Barcodes */}
        <div className="mt-3">
          <span className="text-[11px] text-neutral-400 font-medium block mb-1.5">
            Test Sample Products:
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {sampleBarcodes.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleScanSample(item.code)}
                className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/80 text-[11px] text-neutral-300 text-left transition truncate cursor-pointer"
              >
                <span className="block font-semibold text-white truncate">{item.item.name}</span>
                <span className="text-[9px] text-neutral-500 font-mono">{item.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Barcode Input */}
        <form onSubmit={handleManualLookup} className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Or enter barcode number manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            Lookup
          </button>
        </form>

        {notFoundError && (
          <div className="mt-2 p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Product not found in local cache. Try one of the test samples.</span>
          </div>
        )}

        {/* Scanned Food Card */}
        {scannedItem && (
          <div className="mt-4 p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">
                  Verified Barcode Match
                </span>
                <h4 className="font-bold text-sm text-white">{scannedItem.name}</h4>
                <span className="text-[11px] text-neutral-400">{scannedItem.portion}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white font-mono">{scannedItem.calories}</span>
                <span className="text-xs text-neutral-400 ml-1">kcal</span>
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                  <Dumbbell className="w-3 h-3" /> Protein
                </span>
                <span className="text-xs font-mono font-bold text-white block mt-0.5">
                  {scannedItem.protein}g
                </span>
              </div>
              <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                <span className="text-[10px] text-sky-400 flex items-center justify-center gap-1">
                  <Wheat className="w-3 h-3" /> Carbs
                </span>
                <span className="text-xs font-mono font-bold text-white block mt-0.5">
                  {scannedItem.carbs}g
                </span>
              </div>
              <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 text-center">
                <span className="text-[10px] text-amber-400 flex items-center justify-center gap-1">
                  <Droplets className="w-3 h-3" /> Fat
                </span>
                <span className="text-xs font-mono font-bold text-white block mt-0.5">
                  {scannedItem.fat}g
                </span>
              </div>
            </div>

            {/* Meal Slot Selector */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-neutral-400">Meal Slot:</span>
              <div className="flex gap-1">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMealType(m)}
                    className={`px-2 py-0.5 rounded-lg capitalize text-[11px] transition ${
                      selectedMealType === m
                        ? 'bg-sky-500 text-neutral-950 font-bold'
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

        </div>

        {/* Sticky Bottom Actions */}
        <div className="sticky bottom-0 z-30 p-4 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (scannedItem) onOpenMacroEditor(scannedItem);
            }}
            className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-700 bg-neutral-800/70 hover:bg-neutral-800 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            Edit Macros
          </button>
          <button
            type="button"
            onClick={handleConfirmLog}
            className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Log Item
          </button>
        </div>
      </motion.div>
    </div>
  );
};
