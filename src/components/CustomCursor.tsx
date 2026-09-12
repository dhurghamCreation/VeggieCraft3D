import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  const pos = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only show custom cursor on devices that support hover (fine pointer, e.g. desktop mouse)
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      pos.current.targetX = e.clientX;
      pos.current.targetY = e.clientY;

      // Check if hovering clickable
      const target = e.target as HTMLElement | null;
      const isClickable = Boolean(
        target &&
          (target.tagName === 'BUTTON' ||
            target.tagName === 'A' ||
            target.tagName === 'INPUT' ||
            target.closest('button') ||
            target.closest('a') ||
            target.getAttribute('role') === 'button' ||
            target.id === 'three-canvas-container')
      );
      setIsHoveringClickable(isClickable);
    };

    const onMouseDown = () => setIsPointerDown(true);
    const onMouseUp = () => setIsPointerDown(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    // Smooth animation loop for trailing ring
    const loop = () => {
      pos.current.x += (pos.current.targetX - pos.current.x) * 0.35;
      pos.current.y += (pos.current.targetY - pos.current.y) * 0.35;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${pos.current.targetX}px, ${pos.current.targetY}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(loop);
    };
    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Lagging Spring Aura Ring */}
      <div
        ref={ringRef}
        className={`absolute -top-4 -left-4 w-8 h-8 rounded-full border-2 transition-all duration-150 ease-out will-change-transform ${
          isPointerDown
            ? 'scale-75 border-amber-500 bg-amber-500/20'
            : isHoveringClickable
            ? 'scale-125 border-emerald-500 bg-emerald-500/10'
            : 'scale-100 border-stone-400/40 bg-transparent'
        }`}
      />

      {/* Direct Sharp Pointer Core Dot */}
      <div
        ref={cursorRef}
        className={`absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full transition-all duration-75 will-change-transform ${
          isPointerDown
            ? 'scale-50 bg-amber-600 shadow-sm'
            : isHoveringClickable
            ? 'scale-110 bg-emerald-600 shadow-sm'
            : 'scale-100 bg-stone-800'
        }`}
      />
    </div>
  );
};
