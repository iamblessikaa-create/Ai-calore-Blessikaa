import React, { useRef, useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface WeightRulerProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: 'kg' | 'lbs';
  onChange: (val: number) => void;
  isDayMode?: boolean;
}

export const WeightRuler: React.FC<WeightRulerProps> = ({
  value,
  min = 30,
  max = 200,
  step = 1,
  unit = 'kg',
  onChange,
  isDayMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const startValueRef = useRef<number>(value);

  // Handle drag / slide gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startValueRef.current = value;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    // Every 12px drag corresponds to 1 step
    const deltaSteps = Math.round(-deltaX / 12);
    const newValue = Math.min(max, Math.max(min, startValueRef.current + deltaSteps * step));
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Generate tick marks around the current value
  // We show a window of ticks from (value - 12) to (value + 12)
  const windowRadius = 14;
  const tickItems: number[] = [];
  for (let v = value - windowRadius; v <= value + windowRadius; v += step) {
    if (v >= min && v <= max) {
      tickItems.push(v);
    }
  }

  return (
    <div className="w-full select-none">
      {/* Quick Adjustment Stepper for accessibility and precise mouse control */}
      <div className="flex items-center justify-center gap-6 mb-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          aria-label="Decrease weight"
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition active:scale-90 cursor-pointer ${
            isDayMode
              ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
              : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
          }`}
        >
          <Minus className="w-4 h-4" />
        </button>

        <span className="text-xs font-semibold text-neutral-400">
          Slide ruler or use buttons ({unit})
        </span>

        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          aria-label="Increase weight"
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition active:scale-90 cursor-pointer ${
            isDayMode
              ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700'
              : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Ruler Scale */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full h-20 overflow-hidden cursor-grab active:cursor-grabbing flex items-end justify-center px-4 rounded-xl ${
          isDayMode ? 'bg-neutral-50/50' : 'bg-neutral-900/30'
        }`}
      >
        {/* Center Indicator Needle (Bright Green, exactly like screenshot) */}
        <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-[2.5px] bg-[#5dba7d] rounded-full z-20 shadow-xs pointer-events-none" />

        {/* Dynamic Ruler Ticks */}
        <div className="flex items-end justify-center gap-[10px] w-full pb-2">
          {tickItems.map((val) => {
            const isCenter = val === value;
            const isTen = val % 10 === 0;
            const isFive = val % 5 === 0;

            let tickHeight = 'h-5';
            let tickColor = isDayMode ? 'bg-neutral-300' : 'bg-neutral-700';

            if (isTen) {
              tickHeight = 'h-10';
              tickColor = isDayMode ? 'bg-neutral-500' : 'bg-neutral-400';
            } else if (isFive) {
              tickHeight = 'h-7';
              tickColor = isDayMode ? 'bg-neutral-400' : 'bg-neutral-500';
            }

            if (isCenter) {
              tickColor = 'bg-[#5dba7d]';
            }

            return (
              <div
                key={val}
                onClick={() => onChange(val)}
                className="flex flex-col items-center justify-end cursor-pointer group py-1"
              >
                <div
                  className={`w-[1.5px] rounded-full transition-all ${tickHeight} ${tickColor}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
