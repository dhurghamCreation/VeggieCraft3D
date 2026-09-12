import React, { useState } from 'react';
import {
  VeggieType,
  ExpressionType,
  AccessoryType,
  MaterialStyle,
  ShapeMorphParams,
  BackdropTheme,
  AnimationAction,
} from '../types';
import { VEGGIE_PRESETS, BACKDROP_THEMES } from '../data/veggiePresets';
import {
  Sparkles,
  Smile,
  Glasses,
  Palette,
  Sliders,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Music,
  Footprints,
  Activity,
  HeartHandshake,
  SunMedium,
  Radio,
  Zap,
  Repeat,
  Wind,
  Carrot,
  Crown,
  ChefHat,
  PartyPopper,
  Wand2,
  Headphones,
  Shirt,
  Flower2,
  Flower,
  Gem,
  Ribbon,
  Sprout,
  Ban,
  Search,
  Moon,
  Laugh,
  Heart,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { VeggieIcon } from './VeggieIcon';

interface ControlDrawerProps {
  selectedVeggie: VeggieType;
  onSelectVeggie: (type: VeggieType) => void;
  shapeParams: ShapeMorphParams;
  onUpdateShape: (params: Partial<ShapeMorphParams>) => void;
  onResetShape: () => void;
  expression: ExpressionType;
  onSelectExpression: (expr: ExpressionType) => void;
  accessory: AccessoryType;
  onSelectAccessory: (acc: AccessoryType) => void;
  primaryColor: string;
  onSelectColor: (color: string) => void;
  materialStyle: MaterialStyle;
  onSelectMaterialStyle: (style: MaterialStyle) => void;
  currentTheme: string;
  onSelectTheme: (theme: BackdropTheme) => void;
  currentAction?: AnimationAction;
  onTriggerAction?: (action: AnimationAction) => void;
}

type TabType = 'veggies' | 'shape' | 'mood' | 'wardrobe' | 'features' | 'style';

export const ControlDrawer: React.FC<ControlDrawerProps> = ({
  selectedVeggie,
  onSelectVeggie,
  shapeParams,
  onUpdateShape,
  onResetShape,
  expression,
  onSelectExpression,
  accessory,
  onSelectAccessory,
  primaryColor,
  onSelectColor,
  materialStyle,
  onSelectMaterialStyle,
  currentTheme,
  onSelectTheme,
  currentAction = 'idle',
  onTriggerAction,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('shape');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'veggies', label: 'Veggie', icon: <Carrot className="w-3.5 h-3.5 text-orange-500" /> },
    { id: 'shape', label: 'Sculpt', icon: <Sliders className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'mood', label: 'Mood', icon: <Smile className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'wardrobe', label: 'Wardrobe', icon: <Crown className="w-3.5 h-3.5 text-purple-500" /> },
    { id: 'features', label: 'Moves', icon: <Zap className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'style', label: 'Studio', icon: <Palette className="w-3.5 h-3.5 text-cyan-600" /> },
  ];

  const expressions: { id: ExpressionType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'happy', label: 'Happy', icon: <Smile className="w-5 h-5" />, color: 'text-emerald-500' },
    { id: 'surprised', label: 'Shocked', icon: <Flame className="w-5 h-5" />, color: 'text-amber-500' },
    { id: 'cheeky', label: 'Cheeky', icon: <Laugh className="w-5 h-5" />, color: 'text-pink-500' },
    { id: 'sleepy', label: 'Sleepy', icon: <Moon className="w-5 h-5" />, color: 'text-indigo-400' },
    { id: 'dizzy', label: 'Dizzy', icon: <RotateCcw className="w-5 h-5" />, color: 'text-violet-500' },
    { id: 'love', label: 'Loving', icon: <Heart className="w-5 h-5 fill-rose-500" />, color: 'text-rose-500' },
  ];

  const accessories: { id: AccessoryType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'none', label: 'None', icon: <Ban className="w-4 h-4" />, color: 'text-stone-400' },
    { id: 'chef', label: 'Chef Hat', icon: <ChefHat className="w-4 h-4" />, color: 'text-amber-600' },
    { id: 'sunglasses', label: 'Shades', icon: <Glasses className="w-4 h-4" />, color: 'text-stone-800' },
    { id: 'crown', label: 'Crown', icon: <Crown className="w-4 h-4" />, color: 'text-amber-500' },
    { id: 'partyhat', label: 'Party Hat', icon: <PartyPopper className="w-4 h-4" />, color: 'text-pink-500' },
    { id: 'wizard', label: 'Wizard', icon: <Wand2 className="w-4 h-4" />, color: 'text-purple-600' },
    { id: 'mustache', label: 'Mustache', icon: <Smile className="w-4 h-4" />, color: 'text-stone-700' },
    { id: 'monocle', label: 'Monocle', icon: <Search className="w-4 h-4" />, color: 'text-amber-600' },
    { id: 'headphones', label: 'Headphones', icon: <Headphones className="w-4 h-4" />, color: 'text-cyan-600' },
    { id: 'beanie', label: 'Beanie', icon: <Shirt className="w-4 h-4" />, color: 'text-sky-600' },
    { id: 'flower', label: 'Daisy', icon: <Flower2 className="w-4 h-4" />, color: 'text-amber-500' },
    { id: 'flowercrown', label: 'Flora Ring', icon: <Flower className="w-4 h-4" />, color: 'text-emerald-600' },
    { id: 'tophat', label: 'Top Hat', icon: <Gem className="w-4 h-4" />, color: 'text-stone-800' },
    { id: 'bowtie', label: 'Bowtie', icon: <Ribbon className="w-4 h-4" />, color: 'text-red-500' },
    { id: 'sprout', label: 'Sprout', icon: <Sprout className="w-4 h-4" />, color: 'text-emerald-500' },
    { id: 'retro3d', label: '3D Glasses', icon: <Glasses className="w-4 h-4" />, color: 'text-red-500' },
  ];

  const materialStyles: { id: MaterialStyle; label: string; desc: string }[] = [
    { id: 'clay', label: 'Clay', desc: 'Soft Pixar-like toy' },
    { id: 'jelly', label: 'Jelly', desc: 'Glossy & squishy' },
    { id: 'matte', label: 'Velvet', desc: 'Smooth matte finish' },
    { id: 'gold', label: 'Gold', desc: 'Metallic trophy' },
    { id: 'neon', label: 'Neon', desc: 'Vibrant pop' },
  ];

  const shapePresets = [
    {
      name: 'Mega Chubby',
      params: { squashStretch: -0.3, chubbiness: 1.7, taper: 0, twist: 0, lumpiness: 0.1, bend: 0 },
    },
    {
      name: 'Noodle Spire',
      params: { squashStretch: 0.8, chubbiness: 0.65, taper: 0.2, twist: 0.1, lumpiness: 0.05, bend: 0.3 },
    },
    {
      name: 'Swirly Pear',
      params: { squashStretch: 0.1, chubbiness: 1.3, taper: 0.8, twist: 1.4, lumpiness: 0.15, bend: 0.1 },
    },
    {
      name: 'Lumpy Spud',
      params: { squashStretch: -0.15, chubbiness: 1.3, taper: 0.1, twist: 0.3, lumpiness: 0.8, bend: -0.2 },
    },
  ];

  const colorPalette = [
    '#ff7020', // Carrot orange
    '#e63946', // Tomato red
    '#ea580c', // Pumpkin deep orange
    '#84cc16', // Avocado lime
    '#15803d', // Broccoli forest green
    '#22c55e', // Scallion crisp green
    '#6b21a8', // Eggplant purple
    '#c28b51', // Potato russet
    '#facc15', // Sweetcorn yellow
    '#b45309', // Mushroom warm amber
    '#f8fafc', // Garlic clove white
    '#dc2626', // Chili pepper ruby
    '#f43f5e', // Berry pink
    '#06b6d4', // Cyan fresh
    '#3b82f6', // Indigo blue
  ];

  return (
    <div
      className={`absolute top-20 right-4 bottom-24 z-20 flex transition-all duration-300 pointer-events-auto ${
        isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-2.5rem)]'
      }`}
    >
      {/* Drawer Toggle Handle */}
      <button
        id="toggle-control-drawer-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Collapse panel' : 'Open panel'}
        className="self-start mt-2 w-9 h-12 bg-white/95 backdrop-blur-md rounded-l-2xl shadow-md border-y border-l border-stone-200/80 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Main Drawer Container */}
      <div className="w-80 md:w-92 h-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-200/80 flex flex-col overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-100 bg-stone-50/60 p-1.5 gap-1 shrink-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}-btn`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200/70'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-white/50'
                }`}
              >
                <div className="mb-0.5">{tab.icon}</div>
                <span className="text-[10px] leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-stone-800">
          {/* TAB 1: VEGGIES */}
          {activeTab === 'veggies' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Choose Vegetable
                </h3>
                <p className="text-xs text-stone-600">
                  Select a vegetable buddy to morph and play with:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {VEGGIE_PRESETS.map((preset) => {
                  const isSelected = selectedVeggie === preset.id;
                  return (
                    <button
                      key={preset.id}
                      id={`veggie-preset-${preset.id}-btn`}
                      onClick={() => onSelectVeggie(preset.id)}
                      className={`p-3 rounded-xl text-left border transition-all flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-white/15 text-white shadow-inner'
                              : 'bg-orange-50 text-orange-600 group-hover:scale-105 border border-orange-100'
                          }`}
                        >
                          <VeggieIcon type={preset.id} className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                      </div>
                      <span className="text-xs font-bold truncate mt-0.5">{preset.name}</span>
                      <span
                        className={`text-[10px] line-clamp-2 leading-tight ${
                          isSelected ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {preset.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SHAPE SCULPTOR */}
          {activeTab === 'shape' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                    Shape Sculptor
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Pull, stretch, twist, or lumpify your 3D veggie:
                  </p>
                </div>
                <button
                  id="reset-shape-btn"
                  onClick={onResetShape}
                  title="Reset Shape to Default"
                  className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-3 bg-stone-50/80 p-3 rounded-xl border border-stone-200/60">
                {/* Squash & Stretch */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Squash & Stretch</span>
                    <span className="text-stone-500 text-[11px]">
                      {shapeParams.squashStretch > 0
                        ? `+${Math.round(shapeParams.squashStretch * 100)}%`
                        : `${Math.round(shapeParams.squashStretch * 100)}%`}
                    </span>
                  </div>
                  <input
                    id="slider-squash-stretch"
                    type="range"
                    min="-0.7"
                    max="0.9"
                    step="0.02"
                    value={shapeParams.squashStretch}
                    onChange={(e) => onUpdateShape({ squashStretch: parseFloat(e.target.value) })}
                    className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-stone-400 mt-0.5">
                    <span>Squishy Chubby</span>
                    <span>Tall Stretchy</span>
                  </div>
                </div>

                {/* Chubbiness */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Chubbiness / Girth</span>
                    <span className="text-stone-500 text-[11px]">
                      {shapeParams.chubbiness.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    id="slider-chubbiness"
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={shapeParams.chubbiness}
                    onChange={(e) => onUpdateShape({ chubbiness: parseFloat(e.target.value) })}
                    className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Taper (Cone vs Bulb) */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Taper (Top vs Base)</span>
                    <span className="text-stone-500 text-[11px]">
                      {shapeParams.taper > 0 ? 'Pointy Tip' : 'Bulbous Head'}
                    </span>
                  </div>
                  <input
                    id="slider-taper"
                    type="range"
                    min="-0.8"
                    max="0.8"
                    step="0.05"
                    value={shapeParams.taper}
                    onChange={(e) => onUpdateShape({ taper: parseFloat(e.target.value) })}
                    className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Spiral Twist */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Spiral Twist</span>
                    <span className="text-stone-500 text-[11px]">
                      {shapeParams.twist.toFixed(2)} rad
                    </span>
                  </div>
                  <input
                    id="slider-twist"
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.05"
                    value={shapeParams.twist}
                    onChange={(e) => onUpdateShape({ twist: parseFloat(e.target.value) })}
                    className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Organic Lumpiness */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Lumpiness / Surface Noise</span>
                    <span className="text-stone-500 text-[11px]">
                      {Math.round(shapeParams.lumpiness * 100)}%
                    </span>
                  </div>
                  <input
                    id="slider-lumpiness"
                    type="range"
                    min="0"
                    max="0.9"
                    step="0.05"
                    value={shapeParams.lumpiness}
                    onChange={(e) => onUpdateShape({ lumpiness: parseFloat(e.target.value) })}
                    className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Spine Bend */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Spine Bend & Lean</span>
                    <span className="text-stone-500 text-[11px]">
                      {shapeParams.bend > 0 ? 'Right' : shapeParams.bend < 0 ? 'Left' : 'Straight'}
                    </span>
                  </div>
                  <input
                    id="slider-bend"
                    type="range"
                    min="-0.6"
                    max="0.6"
                    step="0.05"
                    value={shapeParams.bend}
                    onChange={(e) => onUpdateShape({ bend: parseFloat(e.target.value) })}
                    className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Fun Presets */}
              <div>
                <span className="text-xs font-bold text-stone-600 block mb-2">
                  Fun Shape Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {shapePresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => onUpdateShape(preset.params)}
                      className="px-2.5 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 transition-colors text-center"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MOOD & EXPRESSION */}
          {activeTab === 'mood' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Facial Mood
                </h3>
                <p className="text-xs text-stone-600">
                  Pick an expressive animated face:
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {expressions.map((item) => {
                  const isSelected = expression === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`expression-${item.id}-btn`}
                      onClick={() => onSelectExpression(item.id)}
                      className={`p-3 rounded-xl text-center border transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : `bg-stone-100/90 ${item.color} border border-stone-200/60`
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold">Interactive Tip:</span> Hover your mouse or touch
                  screen anywhere in the 3D world—the eyes and pupils will actively track your cursor!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: WARDROBE & ACCESSORIES */}
          {activeTab === 'wardrobe' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Dress-Up & Hats
                </h3>
                <p className="text-xs text-stone-600">
                  Accessorize your vegetable creation:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {accessories.map((acc) => {
                  const isSelected = accessory === acc.id;
                  return (
                    <button
                      key={acc.id}
                      id={`accessory-${acc.id}-btn`}
                      onClick={() => onSelectAccessory(acc.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : `bg-stone-100 ${acc.color} border border-stone-200/50`
                        }`}
                      >
                        {acc.icon}
                      </div>
                      <span className="text-xs font-semibold truncate">{acc.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: FEATURES & ANIMATED MOVES */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                  Features & Moves
                </h3>
                <p className="text-[11px] text-stone-500">
                  Trigger dance grooves, jelly physics, and playful animations:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'dance' as AnimationAction,
                    name: 'Disco Dance',
                    tag: 'Beat Hops & Confetti',
                    desc: 'Groovy 4-on-the-floor disco rhythm with confetti shower',
                    icon: <Music className="w-4 h-4 text-emerald-500" />,
                    bg: 'bg-emerald-50/70 border-emerald-200/80',
                  },
                  {
                    id: 'jiggle' as AnimationAction,
                    name: 'Jelly Jiggle',
                    tag: 'Gel Elasticity',
                    desc: 'Rapid jelly wobble ripples with squishy physics damping',
                    icon: <Sparkles className="w-4 h-4 text-pink-500" />,
                    bg: 'bg-pink-50/70 border-pink-200/80',
                  },
                  {
                    id: 'moonwalk' as AnimationAction,
                    name: 'Moonwalk Shuffle',
                    tag: 'Smooth Slide',
                    desc: 'Smooth lateral slide with jaunty lean and snappy 360° finish',
                    icon: <Footprints className="w-4 h-4 text-purple-500" />,
                    bg: 'bg-purple-50/70 border-purple-200/80',
                  },
                  {
                    id: 'wave' as AnimationAction,
                    name: 'Wiggle Wave',
                    tag: 'Serpentine Hula',
                    desc: 'Sinusoidal continuous body bend and harmonic wave',
                    icon: <Activity className="w-4 h-4 text-cyan-500" />,
                    bg: 'bg-cyan-50/70 border-cyan-200/80',
                  },
                  {
                    id: 'heartbeat' as AnimationAction,
                    name: 'Heartbeat Throb',
                    tag: 'Lub-Dub Pulse',
                    desc: 'Rhythmic double pulse throb with floating heart sparkles',
                    icon: <HeartHandshake className="w-4 h-4 text-rose-500" />,
                    bg: 'bg-rose-50/70 border-rose-200/80',
                  },
                  {
                    id: 'zen' as AnimationAction,
                    name: 'Zen Levitate',
                    tag: 'Singing Bowl',
                    desc: 'Serene aerial float in a figure-8 with singing bowl chime',
                    icon: <SunMedium className="w-4 h-4 text-amber-500" />,
                    bg: 'bg-amber-50/70 border-amber-200/80',
                  },
                  {
                    id: 'beatbox' as AnimationAction,
                    name: 'Veggie Beatbox',
                    tag: 'Kick & Snare',
                    desc: 'Punchy rhythmic head bops down and forward to the groove',
                    icon: <Radio className="w-4 h-4 text-blue-500" />,
                    bg: 'bg-blue-50/70 border-blue-200/80',
                  },
                  {
                    id: 'bounce' as AnimationAction,
                    name: 'Boing Flip!',
                    tag: 'Acrobatic Jump',
                    desc: 'High spring parabola with complete 360° aerial backflip',
                    icon: <Zap className="w-4 h-4 text-amber-500" />,
                    bg: 'bg-amber-50/70 border-amber-200/80',
                  },
                  {
                    id: 'spin' as AnimationAction,
                    name: '360° Spin',
                    tag: 'Double Pirouette',
                    desc: 'Fast double centrifugal spin with playful vertical lift',
                    icon: <Repeat className="w-4 h-4 text-indigo-500" />,
                    bg: 'bg-indigo-50/70 border-indigo-200/80',
                  },
                  {
                    id: 'sneeze' as AnimationAction,
                    name: 'Achoo Sneeze!',
                    tag: 'Explosive Burst',
                    desc: 'Squashed windup followed by an energetic sneeze blast',
                    icon: <Wind className="w-4 h-4 text-orange-500" />,
                    bg: 'bg-orange-50/70 border-orange-200/80',
                  },
                ].map((act) => {
                  const isPlaying = currentAction === act.id;
                  return (
                    <button
                      key={act.id}
                      id={`feature-action-${act.id}-btn`}
                      onClick={() => onTriggerAction?.(act.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-start gap-2.5 ${
                        isPlaying
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : `${act.bg} hover:border-stone-400 text-stone-800`
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isPlaying ? 'bg-stone-800 text-white' : 'bg-white shadow-xs'
                        }`}
                      >
                        {act.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold truncate">{act.name}</span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                              isPlaying
                                ? 'bg-stone-800 text-stone-200'
                                : 'bg-white/80 text-stone-600 border border-stone-200/60'
                            }`}
                          >
                            {act.tag}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] line-clamp-1 mt-0.5 ${
                            isPlaying ? 'text-stone-300' : 'text-stone-500'
                          }`}
                        >
                          {act.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: MATERIAL & THEME */}
          {activeTab === 'style' && (
            <div className="space-y-4">
              {/* Color Swatches */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Skin Color
                </h3>
                <div className="flex flex-wrap gap-2 items-center">
                  {colorPalette.map((col) => (
                    <button
                      key={col}
                      onClick={() => onSelectColor(col)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        primaryColor.toLowerCase() === col.toLowerCase()
                          ? 'ring-2 ring-stone-900 scale-110 shadow-sm'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                  {/* Custom color input */}
                  <label className="w-7 h-7 rounded-full border-2 border-dashed border-stone-300 hover:border-stone-500 flex items-center justify-center cursor-pointer overflow-hidden">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => onSelectColor(e.target.value)}
                      className="opacity-0 w-0 h-0"
                    />
                    <Sparkles className="w-3.5 h-3.5 text-stone-400" />
                  </label>
                </div>
              </div>

              {/* Shading Material Style */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Material Finish
                </h3>
                <div className="grid grid-cols-1 gap-1.5">
                  {materialStyles.map((mat) => {
                    const isSelected = materialStyle === mat.id;
                    return (
                      <button
                        key={mat.id}
                        onClick={() => onSelectMaterialStyle(mat.id)}
                        className={`px-3 py-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : 'border-stone-200 bg-stone-50 hover:bg-white text-stone-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{mat.label}</span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? 'text-stone-300' : 'text-stone-500'
                          }`}
                        >
                          {mat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Backdrop Theme */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Studio Environment
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {BACKDROP_THEMES.map((theme) => {
                    const isSelected = currentTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => onSelectTheme(theme)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'border-stone-900 ring-2 ring-stone-900/10'
                            : 'border-stone-200'
                        }`}
                        style={{ backgroundColor: theme.bgColor }}
                      >
                        <span className="text-xs font-bold block text-stone-800">
                          {theme.name}
                        </span>
                        <div className="flex gap-1 mt-1">
                          <span
                            className="w-3 h-3 rounded-full border border-stone-300"
                            style={{ backgroundColor: theme.floorColor }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-stone-300"
                            style={{ backgroundColor: theme.ambientColor }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
