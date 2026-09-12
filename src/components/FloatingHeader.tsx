import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Camera,
  Move3d,
  HandMetal,
  Pause,
  Info,
  Sparkles,
  Lightbulb,
  Music,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { VeggieType } from '../types';
import { VeggieIcon } from './VeggieIcon';

interface FloatingHeaderProps {
  isMuted: boolean;
  onToggleSound: () => void;
  isBgmPlaying: boolean;
  onToggleBgm: () => void;
  isOrbitMode: boolean;
  onToggleOrbitMode: () => void;
  onResetPose: () => void;
  onTakeSnapshot: () => void;
  currentVeggieName: string;
  currentVeggieType: VeggieType;
  onOpenPauseMenu: () => void;
  onOpenInfoModal: () => void;
}

const VEGGIE_FACTS: Record<string, string[]> = {
  Carrot: [
    'Carrots were originally purple and yellow before the 17th century!',
    'Crunchy, sweet, and super rich in beta-carotene.',
    'Pinch my top greens to give me an elastic jiggle!',
  ],
  Tomato: [
    'Tomatoes are botanically fruits, but culinarily treated as vegetables!',
    'My 5-point star calyx rests right on my squishy head.',
    'Give my plump cheeks a gentle tickle!',
  ],
  Avocado: [
    'Avocados are single-seeded giant berries with a shiny embedded pit!',
    'My pit now stays firmly nested inside my belly as you twist.',
    'Smooth, creamy, and high in delicious healthy fats.',
  ],
  Broccoli: [
    'Broccoli is a member of the cabbage family with edible flower heads!',
    'My fluffy green florets keep their canopy clean and protected from eyes.',
    'Rich in vitamin C, K, and fibrous goodness.',
  ],
  'Sweet Corn': [
    'My green leaves now wrap naturally downwards around my base!',
    'Corn always has an even number of rows on every ear.',
    'Each silk tuft at the top connects to a single juicy kernel.',
  ],
  Pumpkin: [
    'Pumpkins are 90% water and can grow to weigh over 2,000 pounds!',
    'My curly vine tendril spirals right from the stem.',
  ],
  Chili: [
    'Capsaicin gives chilies their fiery spice sensation!',
    'Check out my sharp arched stem and vibrant ruby gloss.',
  ],
  Mushroom: [
    'Mushrooms are biologically closer to animals than to green plants!',
    'Adorned with velvety amber cap and sweet fairy dots.',
  ],
};

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  isMuted,
  onToggleSound,
  isBgmPlaying,
  onToggleBgm,
  isOrbitMode,
  onToggleOrbitMode,
  onResetPose,
  onTakeSnapshot,
  currentVeggieName,
  currentVeggieType,
  onOpenPauseMenu,
  onOpenInfoModal,
}) => {
  const [showFactBubble, setShowFactBubble] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

  const facts = VEGGIE_FACTS[currentVeggieName] || [
    'A living procedural 3D companion created by Dhurgham Alsaadi!',
    'Grab and drag my body to see organic spring elasticity in real-time.',
  ];

  const handleVeggieClick = () => {
    sound.playPop();
    setFactIndex((prev) => (prev + 1) % facts.length);
    setShowFactBubble(true);
    setTimeout(() => setShowFactBubble(false), 4000);
  };

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Brand Logo & Interactive Character Badge */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div
          id="interactive-veggie-badge"
          onClick={handleVeggieClick}
          className="relative group flex items-center gap-3 bg-white/95 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-stone-200/80 hover:border-orange-300/80 hover:shadow-[0_8px_25px_rgba(249,115,22,0.12)] transition-all cursor-pointer select-none active:scale-[0.98]"
          title="Click to interact with fun veggie trivia!"
        >
          {/* Handcrafted Human-Designed Carrot Brand Icon */}
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-b from-orange-500 via-amber-500 to-emerald-600 p-[1.5px] shadow-sm shadow-orange-500/20 shrink-0">
            <div className="w-full h-full bg-gradient-to-b from-orange-50 to-amber-50/90 rounded-[14px] flex items-center justify-center border border-orange-200/50">
              <div className="text-orange-600 group-hover:scale-110 transition-transform duration-200">
                <VeggieIcon type={currentVeggieType} className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-black tracking-wider text-stone-900 leading-tight uppercase">
                VEGGIECRAFT <span className="text-emerald-600 font-extrabold">3D</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200/80 text-[9px] font-bold text-orange-800">
                {currentVeggieName}
              </span>
            </div>
            <p className="text-[10px] font-medium text-stone-500 group-hover:text-stone-700 transition-colors flex items-center gap-1">
              <span>By <strong className="text-stone-800 font-semibold">Dhurgham Alsaadi</strong></span>
              <span className="text-stone-300">•</span>
              <span className="text-emerald-700 font-semibold">Living 3D Toy</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </div>

          {/* Interactive Text Popover Bubble */}
          {showFactBubble && (
            <div className="absolute top-full left-0 mt-2.5 w-68 p-3.5 rounded-2xl bg-stone-900/95 backdrop-blur-md text-white text-xs shadow-2xl border border-stone-700/80 animate-in fade-in slide-in-from-top-1 z-30 pointer-events-none">
              <div className="flex items-start gap-1.5 mb-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.2 text-amber-400" />
                <span>{currentVeggieName} Trivia #{factIndex + 1}</span>
              </div>
              <p className="text-stone-200 text-[11px] leading-relaxed">
                {facts[factIndex]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls Toolbar */}
      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xl p-1.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-stone-200/80 pointer-events-auto">
        {/* Interaction Mode Toggle */}
        <button
          id="toggle-orbit-mode-btn"
          onClick={onToggleOrbitMode}
          title={isOrbitMode ? 'Switch to Grab & Squish Mode' : 'Switch to Camera Orbit Mode'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isOrbitMode
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
              : 'bg-stone-100/90 text-stone-700 hover:bg-stone-200/80'
          }`}
        >
          {isOrbitMode ? (
            <>
              <Move3d className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Camera Orbit</span>
            </>
          ) : (
            <>
              <HandMetal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Squish & Drag</span>
            </>
          )}
        </button>

        {/* Pause Button */}
        <button
          id="pause-game-btn"
          onClick={onOpenPauseMenu}
          title="Pause Game & Slow-Mo (Space or P)"
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <Pause className="w-4 h-4" />
        </button>

        {/* Reset */}
        <button
          id="reset-pose-btn"
          onClick={onResetPose}
          title="Reset Pose & Camera"
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Snapshot */}
        <button
          id="take-snapshot-btn"
          onClick={onTakeSnapshot}
          title="Snap High-Res Photo"
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Sound FX Toggle */}
        <button
          id="toggle-sound-btn"
          onClick={onToggleSound}
          title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          className={`p-2 rounded-xl transition-colors ${
            isMuted ? 'text-stone-400 hover:bg-stone-100' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Cozy Garden Background Music Toggle */}
        <button
          id="toggle-bgm-btn"
          onClick={onToggleBgm}
          title={isBgmPlaying ? 'Pause Garden Background Music' : 'Play Cozy Garden Background Music'}
          className={`p-2 rounded-xl transition-all ${
            isBgmPlaying
              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-300 shadow-xs'
              : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Music className={`w-4 h-4 ${isBgmPlaying ? 'animate-pulse text-amber-600' : ''}`} />
        </button>

        {/* Game Info & Credits */}
        <button
          id="open-credits-btn"
          onClick={onOpenInfoModal}
          title="Game Info & Dhurgham Alsaadi Credits"
          className="p-2 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

