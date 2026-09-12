import React from 'react';
import { X, Heart, Sparkles, Award, Code, Palette, Compass } from 'lucide-react';
import { sound } from '../utils/audio';
import { VeggieIcon } from './VeggieIcon';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="info-credits-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-md select-none p-4 transition-all"
    >
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Banner with Warm Earthy Garden Theme */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-600 via-teal-600 to-amber-700 text-white">
          <button
            id="close-info-modal-btn"
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
              <VeggieIcon type="carrot" className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">VEGGIECRAFT 3D</h2>
              <p className="text-xs text-emerald-100 font-medium">
                The Living Procedural Vegetable Playground
              </p>
            </div>
          </div>

          {/* Prominent Golden Creator Badge */}
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Developer & Designer: <strong className="font-extrabold text-white">Dhurgham Alsaadi</strong></span>
          </div>
        </div>

        {/* Scrollable Story & Details */}
        <div className="p-6 space-y-4 overflow-y-auto text-stone-700 text-xs leading-relaxed">
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>About the Game</span>
            </h3>
            <p className="text-stone-600">
              Welcome to <strong>VeggieCraft 3D</strong>, a playful and tactile 3D browser simulation designed from the ground up by <strong>Dhurgham Alsaadi</strong>. Instead of static 3D models, every vegetable is a living mathematical mesh that squishes, giggles, wiggles, and sculpts organically under your fingertips.
            </p>
          </div>

          {/* Craft Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold">
                <Code className="w-3.5 h-3.5 text-emerald-600" />
                <span>Procedural Physics</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Custom vertex deformation algorithm preserving volume with non-linear spring elasticity and jiggle damping.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-900 font-bold">
                <Palette className="w-3.5 h-3.5 text-amber-600" />
                <span>Human-Centric Art</span>
              </div>
              <p className="text-[11px] text-stone-500">
                Warm studio lighting, handcrafted clay and velvet materials, and 12 organic vegetable companions with 16 bespoke wardrobe accessories.
              </p>
            </div>
          </div>

          {/* Interactive Highlights */}
          <div className="space-y-1.5 pt-1">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Dhurgham's Secret Interaction Tricks</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-stone-600 text-[11px]">
              <li><strong>Tickle Tickle:</strong> Wiggle your mouse quickly over the belly to make the vegetable giggle with joyful heart particles.</li>
              <li><strong>Spring Squish:</strong> Click and drag anywhere on the body to stretch and slingshot the vegetable.</li>
              <li><strong>Real Downward Husk Corn:</strong> Sweet corn now features authentic downward wrapping leaves.</li>
              <li><strong>Protected Eye Zone:</strong> Procedural lumps never distort or obscure the facial features.</li>
              <li><strong>Slow-Motion Mode:</strong> Open the pause menu to experience gelatin physics at 0.35x speed!</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/90 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Sole creator: <strong className="text-stone-800">Dhurgham Alsaadi</strong></span>
          </div>

          <button
            id="close-info-btn-bottom"
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Back to Garden
          </button>
        </div>
      </div>
    </div>
  );
};
