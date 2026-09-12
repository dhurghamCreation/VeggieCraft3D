/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { SceneManager } from './three/SceneManager';
import { FloatingHeader } from './components/FloatingHeader';
import { QuickActionDock } from './components/QuickActionDock';
import { ControlDrawer } from './components/ControlDrawer';
import { InteractionGuide } from './components/InteractionGuide';
import { SnapshotToast } from './components/SnapshotToast';
import { LoadingScreen } from './components/LoadingScreen';
import { PauseMenu } from './components/PauseMenu';
import { InfoModal } from './components/InfoModal';
import { CustomCursor } from './components/CustomCursor';
import {
  VeggieType,
  ExpressionType,
  AccessoryType,
  MaterialStyle,
  ShapeMorphParams,
  AnimationAction,
  BackdropTheme,
} from './types';
import { VEGGIE_PRESETS, BACKDROP_THEMES } from './data/veggiePresets';
import { sound } from './utils/audio';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // Character and scene state
  const [selectedVeggie, setSelectedVeggie] = useState<VeggieType>('carrot');
  const [shapeParams, setShapeParams] = useState<ShapeMorphParams>(VEGGIE_PRESETS[0].defaultShape);
  const [expression, setExpression] = useState<ExpressionType>('happy');
  const [accessory, setAccessory] = useState<AccessoryType>('sprout');
  const [primaryColor, setPrimaryColor] = useState<string>(VEGGIE_PRESETS[0].primaryColor);
  const [materialStyle, setMaterialStyle] = useState<MaterialStyle>('clay');
  const [currentTheme, setCurrentTheme] = useState<string>(BACKDROP_THEMES[0].id);

  // Interaction / Sound / Camera state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);
  const [isOrbitMode, setIsOrbitMode] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<AnimationAction>('idle');
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  // App Phase & Modals
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSlowMotion, setIsSlowMotion] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // User-selected mood is preserved across drags and physics squishes
  const userChosenMoodRef = useRef<ExpressionType>('happy');

  const currentPreset = VEGGIE_PRESETS.find((v) => v.id === selectedVeggie) || VEGGIE_PRESETS[0];

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new SceneManager(containerRef.current, {
      onGrabStart: () => {
        // Only trigger momentary reaction if not sleeping, without overwriting user's chosen mood!
        if (userChosenMoodRef.current !== 'sleepy') {
          manager.character.setExpression('surprised');
        }
      },
      onGrabEnd: (pullDist) => {
        // Return back to user-chosen mood (with a brief dizzy reaction if pulled hard)
        if (pullDist > 0.85 && userChosenMoodRef.current !== 'sleepy') {
          manager.character.setExpression('dizzy');
          setTimeout(() => {
            manager.character.setExpression(userChosenMoodRef.current);
          }, 900);
        } else {
          manager.character.setExpression(userChosenMoodRef.current);
        }
      },
      onTickle: () => {
        if (userChosenMoodRef.current !== 'sleepy') {
          manager.character.setExpression('cheeky');
          setTimeout(() => {
            manager.character.setExpression(userChosenMoodRef.current);
          }, 800);
        }
      },
      onActionComplete: () => {
        setCurrentAction('idle');
        manager.character.setExpression(userChosenMoodRef.current);
      },
    });

    sceneManagerRef.current = manager;

    // Apply initial preset parameters
    manager.character.applyVeggieType('carrot');
    manager.character.setShapeParams(VEGGIE_PRESETS[0].defaultShape);
    manager.character.setColor(VEGGIE_PRESETS[0].primaryColor);
    manager.character.setAccessory('sprout');
    manager.character.setExpression('happy');
    manager.character.setMaterialStyle('clay');

    // Handle container resize
    const resizeObserver = new ResizeObserver(() => {
      manager.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Veggie archetype change
  const handleSelectVeggie = useCallback((type: VeggieType) => {
    const preset = VEGGIE_PRESETS.find((v) => v.id === type);
    if (!preset || !sceneManagerRef.current) return;

    setSelectedVeggie(type);
    setShapeParams(preset.defaultShape);
    setPrimaryColor(preset.primaryColor);
    setAccessory(preset.defaultAccessory);
    userChosenMoodRef.current = 'happy';
    setExpression('happy');

    const char = sceneManagerRef.current.character;
    char.applyVeggieType(type);
    char.setShapeParams(preset.defaultShape);
    char.setColor(preset.primaryColor);
    char.setAccessory(preset.defaultAccessory);
    char.setExpression('happy');
    char.triggerJiggle(1.2);
    sound.playPop();
  }, []);

  // Real-time shape sculpting
  const handleUpdateShape = useCallback((params: Partial<ShapeMorphParams>) => {
    setShapeParams((prev) => {
      const updated = { ...prev, ...params };
      if (sceneManagerRef.current) {
        sceneManagerRef.current.character.setShapeParams(updated);
      }
      return updated;
    });
  }, []);

  const handleResetShape = useCallback(() => {
    const preset = VEGGIE_PRESETS.find((v) => v.id === selectedVeggie);
    if (!preset || !sceneManagerRef.current) return;

    setShapeParams(preset.defaultShape);
    sceneManagerRef.current.character.setShapeParams(preset.defaultShape);
    sceneManagerRef.current.character.triggerJiggle(0.8);
    sound.playPop();
  }, [selectedVeggie]);

  // Mood / Expression
  const handleSelectExpression = useCallback((expr: ExpressionType) => {
    userChosenMoodRef.current = expr;
    setExpression(expr);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.character.setExpression(expr);
      if (expr === 'love') {
        sound.playHeartbeat();
        sound.playSqueak(1.4);
      } else {
        sound.playSqueak(expr === 'happy' ? 1.2 : expr === 'surprised' ? 1.4 : 0.9);
      }
    }
  }, []);

  // Accessory / Hat
  const handleSelectAccessory = useCallback((acc: AccessoryType) => {
    setAccessory(acc);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.character.setAccessory(acc);
      sceneManagerRef.current.character.triggerJiggle(0.6);
      sound.playPop();
    }
  }, []);

  // Color selection
  const handleSelectColor = useCallback((color: string) => {
    setPrimaryColor(color);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.character.setColor(color);
    }
  }, []);

  // Material style selection
  const handleSelectMaterialStyle = useCallback((style: MaterialStyle) => {
    setMaterialStyle(style);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.character.setMaterialStyle(style);
      sound.playPop();
    }
  }, []);

  // Theme selection
  const handleSelectTheme = useCallback((theme: BackdropTheme) => {
    setCurrentTheme(theme.id);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.applyTheme(theme);
      sound.playPop();
    }
  }, []);

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      sound.setMuted(next);
      return next;
    });
  }, []);

  // Garden Soundtrack BGM Toggle
  const handleToggleBgm = useCallback(() => {
    const active = sound.toggleBGM();
    setIsBgmPlaying(active);
  }, []);

  // Camera Orbit vs Squish Drag mode toggle
  const handleToggleOrbitMode = useCallback(() => {
    setIsOrbitMode((prev) => {
      const next = !prev;
      if (sceneManagerRef.current) {
        sceneManagerRef.current.isCameraOrbitMode = next;
      }
      return next;
    });
  }, []);

  // Reset Pose & Camera
  const handleResetPose = useCallback(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.resetOrbit();
      sceneManagerRef.current.character.triggerJiggle(0.7);
      sound.playBoing(0.8);
    }
  }, []);

  // Trigger special moves
  const handleTriggerAction = useCallback((action: AnimationAction) => {
    setCurrentAction(action);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.triggerAction(action);
      if (action === 'sneeze') setExpression('surprised');
      else if (action === 'dance') setExpression('love');
      else if (action === 'bounce') setExpression('happy');
    }
  }, []);

  // Poke / Tickle
  const handleTriggerPoke = useCallback(() => {
    if (sceneManagerRef.current) {
      sound.playGiggle();
      sceneManagerRef.current.character.triggerJiggle(1.8);
      setExpression('cheeky');
      setTimeout(() => setExpression(userChosenMoodRef.current), 1500);
    }
  }, []);

  // Pause and Slow-Motion Handlers
  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      if (sceneManagerRef.current) {
        sceneManagerRef.current.isPaused = next;
      }
      return next;
    });
  }, []);

  const handleToggleSlowMotion = useCallback(() => {
    setIsSlowMotion((prev) => {
      const next = !prev;
      if (sceneManagerRef.current) {
        sceneManagerRef.current.isSlowMotion = next;
      }
      return next;
    });
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' || e.code === 'KeyP') {
        e.preventDefault();
        handleTogglePause();
      } else if (e.code === 'Escape') {
        if (isInfoOpen) {
          setIsInfoOpen(false);
        } else {
          handleTogglePause();
        }
      } else if (e.code === 'KeyM') {
        handleToggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePause, handleToggleSound, isInfoOpen]);

  // High-res snapshot capture
  const handleTakeSnapshot = useCallback(() => {
    if (!sceneManagerRef.current) return;
    sound.playChime();
    const dataUrl = sceneManagerRef.current.takeSnapshot();
    setSnapshotUrl(dataUrl);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-[#fdfbf7]">
      {/* Custom Spring Animated Tactile Cursor */}
      <CustomCursor />

      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        id="three-canvas-container"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating Header */}
      <FloatingHeader
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isBgmPlaying={isBgmPlaying}
        onToggleBgm={handleToggleBgm}
        isOrbitMode={isOrbitMode}
        onToggleOrbitMode={handleToggleOrbitMode}
        onResetPose={handleResetPose}
        onTakeSnapshot={handleTakeSnapshot}
        currentVeggieName={currentPreset.name}
        currentVeggieType={selectedVeggie}
        onOpenPauseMenu={handleTogglePause}
        onOpenInfoModal={() => setIsInfoOpen(true)}
      />

      {/* Interaction Guide */}
      <InteractionGuide />

      {/* Bottom Floating Quick Actions Dock */}
      <QuickActionDock
        currentAction={currentAction}
        onTriggerAction={handleTriggerAction}
        onTriggerPoke={handleTriggerPoke}
      />

      {/* Right Customization Drawer */}
      <ControlDrawer
        selectedVeggie={selectedVeggie}
        onSelectVeggie={handleSelectVeggie}
        shapeParams={shapeParams}
        onUpdateShape={handleUpdateShape}
        onResetShape={handleResetShape}
        expression={expression}
        onSelectExpression={handleSelectExpression}
        accessory={accessory}
        onSelectAccessory={handleSelectAccessory}
        primaryColor={primaryColor}
        onSelectColor={handleSelectColor}
        materialStyle={materialStyle}
        onSelectMaterialStyle={handleSelectMaterialStyle}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        currentAction={currentAction}
        onTriggerAction={handleTriggerAction}
      />

      {/* Snapshot Modal Toast */}
      <SnapshotToast
        imageUrl={snapshotUrl}
        onClose={() => setSnapshotUrl(null)}
        veggieName={currentPreset.name}
      />

      {/* Pause Menu Modal */}
      <PauseMenu
        isOpen={isPaused}
        onResume={handleTogglePause}
        isSlowMotion={isSlowMotion}
        onToggleSlowMotion={handleToggleSlowMotion}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isBgmPlaying={isBgmPlaying}
        onToggleBgm={handleToggleBgm}
        onResetPose={handleResetPose}
        onResetShape={handleResetShape}
        selectedVeggie={selectedVeggie}
        onSelectVeggie={handleSelectVeggie}
        onOpenCredits={() => setIsInfoOpen(true)}
      />

      {/* Info & Dhurgham Alsaadi Creator Tribute Modal */}
      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Fantastic Intro Loading Screen & Brand Reveal */}
      {isLoading && (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      )}
    </main>
  );
}
