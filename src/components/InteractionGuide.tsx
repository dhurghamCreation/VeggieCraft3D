import React, { useState, useEffect } from 'react';
import { Sparkles, MousePointer, Smile, X } from 'lucide-react';

export const InteractionGuide: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss or allow quick close
  useEffect(() => {
    const timer = setTimeout(() => {
      // Keep it available, but dismissable
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="absolute top-20 left-4 z-10 max-w-xs bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-sm border border-stone-200/80 pointer-events-auto transition-all animate-fade-in hidden sm:block">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Interactive Controls</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-stone-400 hover:text-stone-600 p-0.5 rounded-lg"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <ul className="space-y-1.5 text-[11px] text-stone-600 leading-tight">
        <li className="flex items-start gap-1.5">
          <MousePointer className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <span><strong>Grab & Stretch:</strong> Click and drag directly on the veggie to squish and rubber-band release!</span>
        </li>
        <li className="flex items-start gap-1.5">
          <Smile className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
          <span><strong>Eye Tracking & Tickle:</strong> Move cursor around—eyes follow you! Wiggle cursor fast to tickle.</span>
        </li>
      </ul>
    </div>
  );
};
