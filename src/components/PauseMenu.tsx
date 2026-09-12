import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Info,
  X,
  Sparkles,
  Heart,
  Sliders,
  Smile,
  Music,
} from 'lucide-react';
import { VeggieType } from '../types';
import { VEGGIE_PRESETS } from '../data/veggiePresets';
import { VeggieIcon } from './VeggieIcon';
import { sound } from '../utils/audio';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  isSlowMotion: boolean;
  onToggleSlowMotion: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  isBgmPlaying: boolean;
  onToggleBgm: () => void;
  onResetPose: () => void;
  onResetShape: () => void;
  selectedVeggie: VeggieType;
  onSelectVeggie: (type: VeggieType) => void;
  onOpenCredits: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onResume,
  isSlowMotion,
  onToggleSlowMotion,
  isMuted,
  onToggleSound,
  isBgmPlaying,
  onToggleBgm,
  onResetPose,
  onResetShape,
  selectedVeggie,
  onSelectVeggie,
  onOpenCredits,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="pause-menu-modal"
      className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/40 backdrop-blur-md select-none transition-all p-4"
    >
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-200/80 flex items-center justify-center text-stone-700">
              <Pause className="w-4 h-4 fill-stone-700" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 leading-none">
                Game Paused
              </h2>
              <p className="text-[11px] font-medium text-stone-500 mt-0.5">
                VeggieCraft 3D Garden Lounge
              </p>
            </div>
          </div>

          <button
            id="pause-close-btn"
            onClick={onResume}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Main Primary Resume Button */}
          <button
            id="pause-resume-btn"
            onClick={() => {
              sound.playPop();
              onResume();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Playing</span>
          </button>

          {/* Quick Gameplay Toggles */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Slow Motion Physics */}
            <button
              id="toggle-slowmo-btn"
              onClick={() => {
                sound.playPop();
                onToggleSlowMotion();
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                isSlowMotion
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-stone-50/70 border-stone-200/80 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${isSlowMotion ? 'bg-amber-200' : 'bg-stone-200/80'}`}>
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Slow-Mo Physics</p>
                <p className="text-[10px] text-stone-500">
                  {isSlowMotion ? '0.35x Half Speed' : '1.0x Realtime'}
                </p>
              </div>
            </button>

            {/* Sound Mute */}
            <button
              id="pause-sound-btn"
              onClick={() => {
                sound.playPop();
                onToggleSound();
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                !isMuted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                  : 'bg-stone-50/70 border-stone-200/80 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${!isMuted ? 'bg-emerald-200' : 'bg-stone-200/80'}`}>
                {isMuted ? <VolumeX className="w-4 h-4 text-stone-500" /> : <Volume2 className="w-4 h-4 text-emerald-800" />}
              </div>
              <div>
                <p className="text-xs font-bold">Sound FX</p>
                <p className="text-[10px] text-stone-500">
                  {isMuted ? 'Muted' : 'Synthesized FX'}
                </p>
              </div>
            </button>

            {/* Garden Soundtrack BGM */}
            <button
              id="pause-bgm-btn"
              onClick={() => {
                sound.playPop();
                onToggleBgm();
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                isBgmPlaying
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm ring-1 ring-amber-400/40'
                  : 'bg-stone-50/70 border-stone-200/80 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${isBgmPlaying ? 'bg-amber-200' : 'bg-stone-200/80'}`}>
                <Music className={`w-4 h-4 ${isBgmPlaying ? 'text-amber-800 animate-pulse' : 'text-stone-500'}`} />
              </div>
              <div>
                <p className="text-xs font-bold">Garden Music</p>
                <p className="text-[10px] text-stone-500">
                  {isBgmPlaying ? 'Playing Acoustic' : 'Off'}
                </p>
              </div>
            </button>

            {/* Reset Camera & Pose */}
            <button
              id="pause-reset-pose-btn"
              onClick={() => {
                onResetPose();
                sound.playBoing(0.8);
              }}
              className="p-3 rounded-2xl border border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition-all flex items-center gap-3 text-left"
            >
              <div className="p-2 rounded-xl bg-stone-200/80">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Reset Camera</p>
                <p className="text-[10px] text-stone-500">Center view & angle</p>
              </div>
            </button>

            {/* Reset Sculpting Shape */}
            <button
              id="pause-reset-shape-btn"
              onClick={() => {
                onResetShape();
                sound.playPop();
              }}
              className="p-3 rounded-2xl border border-stone-200/80 bg-stone-50/70 hover:bg-stone-100 text-stone-700 transition-all flex items-center gap-3 text-left"
            >
              <div className="p-2 rounded-xl bg-stone-200/80">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">Default Shape</p>
                <p className="text-[10px] text-stone-500">Revert morphs</p>
              </div>
            </button>
          </div>

          {/* Quick Character Picker */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Select Companion
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {VEGGIE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    onSelectVeggie(preset.id);
                    sound.playPop();
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    selectedVeggie === preset.id
                      ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-2 ring-emerald-400/30'
                      : 'border-stone-200 bg-stone-50 hover:bg-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center border border-stone-200/60 shadow-xs">
                    <VeggieIcon type={preset.id} className="w-4 h-4 text-emerald-700" />
                  </div>
                  <span className="text-[10px] font-semibold text-stone-700 truncate max-w-full">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Controls Cheat-Sheet */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs text-stone-600">
            <p className="font-bold text-stone-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Keyboard & Mouse Shortcuts</span>
            </p>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-500">
              <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-300 font-mono text-[10px]">Click + Drag</kbd> Squish & Stretch</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-300 font-mono text-[10px]">Fast Wiggle</kbd> Tickle Giggle</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-300 font-mono text-[10px]">Space / P</kbd> Pause Menu</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-300 font-mono text-[10px]">M</kbd> Mute Audio</div>
            </div>
          </div>
        </div>

        {/* Footer with Developer Credits */}
        <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-600">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Developer & Designer: <strong className="font-bold text-stone-900">Dhurgham Alsaadi</strong></span>
          </div>

          <button
            id="pause-open-info-btn"
            onClick={() => {
              onResume();
              onOpenCredits();
            }}
            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Game Story</span>
          </button>
        </div>
      </div>
    </div>
  );
};
