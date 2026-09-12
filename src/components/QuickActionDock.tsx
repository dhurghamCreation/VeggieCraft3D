import React from 'react';
import { AnimationAction } from '../types';
import {
  Sparkles,
  Music,
  Wind,
  Repeat,
  Zap,
  HeartHandshake,
  Footprints,
  Activity,
  Radio,
  SunMedium,
} from 'lucide-react';

interface QuickActionDockProps {
  currentAction: AnimationAction;
  onTriggerAction: (action: AnimationAction) => void;
  onTriggerPoke: () => void;
}

export const QuickActionDock: React.FC<QuickActionDockProps> = ({
  currentAction,
  onTriggerAction,
  onTriggerPoke,
}) => {
  const actions: { id: AnimationAction; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'dance',
      label: 'Disco Dance',
      icon: <Music className="w-4 h-4 text-emerald-500" />,
      color: 'hover:border-emerald-400 hover:text-emerald-700',
    },
    {
      id: 'jiggle',
      label: 'Jelly Jiggle',
      icon: <Sparkles className="w-4 h-4 text-pink-500" />,
      color: 'hover:border-pink-400 hover:text-pink-700',
    },
    {
      id: 'moonwalk',
      label: 'Moonwalk',
      icon: <Footprints className="w-4 h-4 text-purple-500" />,
      color: 'hover:border-purple-400 hover:text-purple-700',
    },
    {
      id: 'wave',
      label: 'Wiggle Wave',
      icon: <Activity className="w-4 h-4 text-cyan-500" />,
      color: 'hover:border-cyan-400 hover:text-cyan-700',
    },
    {
      id: 'heartbeat',
      label: 'Heartbeat',
      icon: <HeartHandshake className="w-4 h-4 text-rose-500" />,
      color: 'hover:border-rose-400 hover:text-rose-700',
    },
    {
      id: 'zen',
      label: 'Zen Levitate',
      icon: <SunMedium className="w-4 h-4 text-amber-500" />,
      color: 'hover:border-amber-400 hover:text-amber-700',
    },
    {
      id: 'beatbox',
      label: 'Beatbox',
      icon: <Radio className="w-4 h-4 text-blue-500" />,
      color: 'hover:border-blue-400 hover:text-blue-700',
    },
    {
      id: 'bounce',
      label: 'Boing Flip!',
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      color: 'hover:border-amber-400 hover:text-amber-700',
    },
    {
      id: 'spin',
      label: '360° Spin',
      icon: <Repeat className="w-4 h-4 text-indigo-500" />,
      color: 'hover:border-indigo-400 hover:text-indigo-700',
    },
    {
      id: 'sneeze',
      label: 'Achoo Sneeze',
      icon: <Wind className="w-4 h-4 text-orange-500" />,
      color: 'hover:border-orange-400 hover:text-orange-700',
    },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg shadow-stone-900/5 border border-stone-200/80 max-w-[calc(100vw-2rem)] overflow-x-auto no-scrollbar">
      {/* Quick poke button */}
      <button
        id="action-poke-btn"
        onClick={onTriggerPoke}
        title="Poke or Tickle Veggie"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shrink-0 active:scale-95 shadow-xs"
      >
        <HeartHandshake className="w-4 h-4 text-rose-500" />
        <span>Poke!</span>
      </button>

      <div className="w-[1px] h-6 bg-stone-200 my-auto shrink-0" />

      {actions.map((act) => {
        const isActive = currentAction === act.id;
        return (
          <button
            key={act.id}
            id={`action-${act.id}-btn`}
            onClick={() => onTriggerAction(act.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 border ${
              isActive
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : `bg-stone-50 text-stone-700 border-stone-200/60 ${act.color} hover:bg-white`
            }`}
          >
            {act.icon}
            <span className="whitespace-nowrap">{act.label}</span>
          </button>
        );
      })}
    </div>
  );
};
