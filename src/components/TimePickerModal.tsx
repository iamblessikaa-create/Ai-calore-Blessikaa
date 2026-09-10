import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Check, X, Coffee, Utensils, Moon, Apple, Calendar, ArrowLeft } from 'lucide-react';
import { MealType } from '../types/nutrition';

interface TimePickerModalProps {
  isOpen: boolean;
  initialMealType?: MealType;
  initialTime?: string;
  initialNotes?: string;
  onClose: () => void;
  onConfirm: (data: { mealType: MealType; time: string; notes: string }) => void;
  isDayMode?: boolean;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  initialMealType = 'breakfast',
  initialTime,
  initialNotes = '',
  onClose,
  onConfirm,
  isDayMode = false,
}) => {
  // Parse initialTime if provided or default to current time
  const getInitialTimeParts = () => {
    if (initialTime && initialTime.includes(':')) {
      const [timePart, period] = initialTime.split(' ');
      const [h, m] = timePart.split(':');
      return {
        hour: h.padStart(2, '0'),
        minute: m.padStart(2, '0'),
        period: (period || 'AM').toUpperCase() as 'AM' | 'PM',
      };
    }
    const now = new Date();
    let hours = now.getHours();
    const period: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = Math.floor(now.getMinutes() / 5) * 5;
    return {
      hour: hours.toString().padStart(2, '0'),
      minute: minutes.toString().padStart(2, '0'),
      period,
    };
  };

  const initialParts = getInitialTimeParts();
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [hour, setHour] = useState(initialParts.hour);
  const [minute, setMinute] = useState(initialParts.minute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialParts.period);
  const [notes, setNotes] = useState(initialNotes);

  const handleSetCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const p: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    setHour(hours.toString().padStart(2, '0'));
    setMinute(now.getMinutes().toString().padStart(2, '0'));
    setPeriod(p);
  };

  const setPreset = (type: MealType, h: string, m: string, p: 'AM' | 'PM') => {
    setMealType(type);
    setHour(h);
    setMinute(m);
    setPeriod(p);
  };

  const handleSave = () => {
    const formattedTime = `${hour}:${minute} ${period}`;
    onConfirm({ mealType, time: formattedTime, notes });
    onClose();
  };

  if (!isOpen) return null;

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto border transition-colors duration-200 ${
          isDayMode
            ? 'bg-white border-[#e2e6e0] text-[#19221a]'
            : 'bg-neutral-900 border-neutral-800 text-neutral-100'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-3 border-b sticky top-0 backdrop-blur-md z-10 -mx-1 px-1 ${
            isDayMode
              ? 'bg-white/95 border-[#e8ece6]'
              : 'bg-neutral-900/95 border-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isDayMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3
                className={`font-bold text-sm sm:text-base ${
                  isDayMode ? 'text-neutral-900' : 'text-white'
                }`}
              >
                Meal Time & Slot
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-1.5 rounded-full transition cursor-pointer ${
              isDayMode
                ? 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Category Selection Tabs */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Select Meal Slot
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { type: 'breakfast' as MealType, label: 'Breakfast', icon: Coffee, color: 'emerald' },
              { type: 'lunch' as MealType, label: 'Lunch', icon: Utensils, color: 'sky' },
              { type: 'dinner' as MealType, label: 'Dinner', icon: Moon, color: 'amber' },
              { type: 'snack' as MealType, label: 'Snack', icon: Apple, color: 'rose' },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = mealType === m.type;
              return (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => setMealType(m.type)}
                  className={`flex flex-col items-center p-3 rounded-2xl border text-center transition cursor-pointer ${
                    isSelected
                      ? isDayMode
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-md shadow-emerald-500/10'
                        : 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : isDayMode
                      ? 'bg-[#f7f9f6] border-[#e2e6e0] text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      : 'bg-neutral-800/40 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-emerald-500' : 'text-neutral-400'}`} />
                  <span className="text-[11px] font-semibold">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Time Selector Wheels */}
        <div
          className={`mt-5 p-4 rounded-2xl border ${
            isDayMode
              ? 'bg-[#f7f9f6] border-[#e2e6e0]'
              : 'bg-neutral-950/80 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-400">Time of Consumption</span>
            <button
              type="button"
              onClick={handleSetCurrentTime}
              className="text-xs text-emerald-500 hover:text-emerald-600 font-semibold cursor-pointer"
            >
              Set to Current Time
            </button>
          </div>

          <div className="flex items-center justify-center gap-3">
            {/* Hour select */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 mb-1">HOUR</span>
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className={`w-20 py-2 px-3 rounded-xl text-center text-lg font-mono font-bold border focus:outline-none focus:border-emerald-500 ${
                  isDayMode
                    ? 'bg-white border-neutral-300 text-neutral-900'
                    : 'bg-neutral-900 border-neutral-700 text-white'
                }`}
              >
                {hoursList.map((h) => (
                  <option key={h} value={h} className={isDayMode ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xl font-bold text-neutral-400 mt-4">:</span>

            {/* Minute select */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 mb-1">MINUTE</span>
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className={`w-20 py-2 px-3 rounded-xl text-center text-lg font-mono font-bold border focus:outline-none focus:border-emerald-500 ${
                  isDayMode
                    ? 'bg-white border-neutral-300 text-neutral-900'
                    : 'bg-neutral-900 border-neutral-700 text-white'
                }`}
              >
                {minutesList.map((m) => (
                  <option key={m} value={m} className={isDayMode ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* AM/PM Toggle */}
            <div className="flex flex-col items-center ml-1">
              <span className="text-[10px] text-neutral-400 mb-1">PERIOD</span>
              <div
                className={`flex rounded-xl border p-1 ${
                  isDayMode ? 'bg-white border-neutral-300' : 'bg-neutral-900 border-neutral-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPeriod('AM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    period === 'AM'
                      ? 'bg-emerald-500 text-white shadow'
                      : isDayMode
                      ? 'text-neutral-500 hover:text-neutral-800'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod('PM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    period === 'PM'
                      ? 'bg-emerald-500 text-white shadow'
                      : isDayMode
                      ? 'text-neutral-500 hover:text-neutral-800'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>

          {/* Quick Presets Pills */}
          <div
            className={`flex items-center justify-between gap-1.5 mt-4 pt-3 border-t text-[10px] ${
              isDayMode ? 'border-neutral-200 text-neutral-500' : 'border-neutral-800/80 text-neutral-400'
            }`}
          >
            <span className="font-medium">Quick:</span>
            <button
              type="button"
              onClick={() => setPreset('breakfast', '08', '00', 'AM')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                isDayMode ? 'bg-white hover:bg-neutral-200 border border-neutral-200 text-neutral-700' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              8:00 AM (Bk)
            </button>
            <button
              type="button"
              onClick={() => setPreset('lunch', '12', '30', 'PM')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                isDayMode ? 'bg-white hover:bg-neutral-200 border border-neutral-200 text-neutral-700' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              12:30 PM (Lu)
            </button>
            <button
              type="button"
              onClick={() => setPreset('dinner', '07', '00', 'PM')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                isDayMode ? 'bg-white hover:bg-neutral-200 border border-neutral-200 text-neutral-700' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
              }`}
            >
              7:00 PM (Di)
            </button>
          </div>
        </div>

        {/* Meal Notes Input */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Meal Notes / Context (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Post-workout breakfast, eating out with friends..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500 border ${
              isDayMode
                ? 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400'
                : 'bg-neutral-800/70 border-neutral-700/80 text-white placeholder:text-neutral-500'
            }`}
          />
        </div>

        {/* Actions */}
        <div
          className={`flex items-center gap-3 mt-6 pt-4 border-t ${
            isDayMode ? 'border-neutral-200' : 'border-neutral-800'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isDayMode
                ? 'border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                : 'border-neutral-700 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Confirm Time & Slot
          </button>
        </div>
      </motion.div>
    </div>
  );
};
