import React, { useState, useEffect } from 'react';
import { Sparkles, Play, ShieldCheck, Heart, Leaf } from 'lucide-react';
import { sound } from '../utils/audio';
import { VeggieIcon } from './VeggieIcon';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LOADING_TIPS = [
  'Germinating organic Three.js vertices...',
  'Centering the shiny avocado pit inside the belly...',
  'Calibrating plump tomato squish dynamics...',
  'Spreading real downward sweet corn husks...',
  'Fluffing fresh broccoli florets & protecting eyes...',
  'Fitting custom crowns, shades & party hats...',
  'Applying handcrafted clay & velvet shaders...',
  'Garden ready for tactile play!',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 14) + 8;
        if (next >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return next;
      });
    }, 180);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const step = Math.min(
      LOADING_TIPS.length - 1,
      Math.floor((progress / 100) * (LOADING_TIPS.length - 1))
    );
    setTipIndex(step);
  }, [progress]);

  const handleStart = () => {
    sound.playPop();
    sound.playChime();
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 550);
  };

  return (
    <div
      id="game-loading-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fbf9f5] select-none transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Soft Organic Garden Halos */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-100/60 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-50/50 blur-3xl" />
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 max-w-md w-full mx-4 p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/90 shadow-2xl flex flex-col items-center text-center">
        {/* Animated Brand Logo Icon */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-orange-500 via-amber-500 to-emerald-600 p-[2.5px] shadow-lg shadow-orange-500/20 flex items-center justify-center transform hover:rotate-3 transition-transform">
            <div className="w-full h-full bg-gradient-to-b from-orange-50 to-amber-50/90 rounded-[22px] flex items-center justify-center overflow-hidden border border-orange-200/50">
              <VeggieIcon type="carrot" className="w-12 h-12 text-orange-600 stroke-[2.2] animate-pulse" />
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full p-1.5 shadow-md">
            <Leaf className="w-4 h-4" />
          </div>
        </div>

        {/* Game Title */}
        <h1 className="text-3xl font-black tracking-tight text-stone-900 mb-1 uppercase">
          VEGGIECRAFT <span className="text-emerald-600 font-extrabold">3D</span>
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-600 mb-3">
          Tactile 3D Procedural Sculpting Toy
        </p>

        {/* Developer & Designer Credit Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-900 text-xs font-medium mb-6">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Designed & Built by <strong className="font-bold text-stone-900">Dhurgham Alsaadi</strong></span>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-full space-y-2 mb-6">
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-medium text-stone-600 px-1">
            <span className="truncate max-w-[280px] text-stone-700">{LOADING_TIPS[tipIndex]}</span>
            <span className="font-mono font-bold text-stone-800">{progress}%</span>
          </div>
        </div>

        {/* Action Button */}
        {isReady ? (
          <button
            id="start-garden-game-btn"
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Enter Vegetable Garden</span>
          </button>
        ) : (
          <div className="w-full py-3 px-4 rounded-2xl bg-stone-50 border border-stone-100 text-stone-600 text-xs font-medium flex items-center justify-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Cultivating the garden...</span>
          </div>
        )}

        {/* Human Design Assurance Tag */}
        <div className="mt-6 flex items-center gap-2 text-[10px] text-stone-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-time Three.js vertex spring deformation & organic acoustics</span>
        </div>
      </div>
    </div>
  );
};
