'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const hasFinePointer = () => window.matchMedia(FINE_POINTER).matches;
const subscribeFinePointer = (onChange: () => void) => {
  const query = window.matchMedia(FINE_POINTER);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

const INTERACTIVE = 'a, button, [role="button"], label, select, summary, [data-cursor-label]';
const TEXT_ENTRY = 'input, textarea, [contenteditable="true"]';

type Mode = 'default' | 'link' | 'hidden';

const MAX_TILT = 60; // degrees
const TILT_PER_PX = 2.2; // degrees of tilt per px of movement in one frame
const SETTLE = 0.14; // how quickly the ring eases back towards the target tilt (0–1)

/**
 * 3D gyroscope cursor for mouse/trackpad users: a ring with an inner ring set at an angle, tilting in
 * perspective toward the direction of movement and settling back flat. The centre dot sits exactly on
 * the pointer, so clicking stays precise. Touch devices keep their native behaviour; text fields keep
 * the I-beam; reduced-motion users get the ring without the tilt.
 */
export function CustomCursor() {
  const positionRef = useRef<HTMLDivElement>(null);
  const gimbalRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(subscribeFinePointer, hasFinePointer, () => false);
  const [mode, setMode] = useState<Mode>('hidden');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let x = 0;
    let y = 0;
    let lastX = 0;
    let lastY = 0;
    let tiltX = 0;
    let tiltY = 0;
    let frame = 0;

    const clamp = (value: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, value));

    const tick = () => {
      const dx = x - lastX;
      const dy = y - lastY;
      lastX = x;
      lastY = y;
      // Moving right tilts the ring around the Y axis, moving down around the X axis.
      const targetY = reduceMotion ? 0 : clamp(dx * TILT_PER_PX);
      const targetX = reduceMotion ? 0 : clamp(-dy * TILT_PER_PX);
      tiltX += (targetX - tiltX) * SETTLE;
      tiltY += (targetY - tiltY) * SETTLE;
      if (gimbalRef.current) {
        gimbalRef.current.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      }
      // Keep animating only while the ring is still moving back to rest.
      if (Math.abs(tiltX) > 0.05 || Math.abs(tiltY) > 0.05 || dx !== 0 || dy !== 0) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX;
      y = event.clientY;
      const position = `translate3d(${x}px, ${y}px, 0)`;
      if (positionRef.current) positionRef.current.style.transform = position;
      if (labelRef.current) labelRef.current.style.transform = position;
      if (!frame) frame = requestAnimationFrame(tick);

      const target = event.target instanceof Element ? event.target : null;
      if (!target || target.closest(TEXT_ENTRY)) {
        setMode('hidden');
        return;
      }
      const interactive = target.closest(INTERACTIVE);
      setMode(interactive ? 'link' : 'default');
      setLabel(interactive?.closest('[data-cursor-label]')?.getAttribute('data-cursor-label') ?? '');
    };
    const onLeave = () => setMode('hidden');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  const link = mode === 'link';
  const size = link ? 44 : 30;
  const ring = 'border-white';

  return (
    <>
      {/* White + difference blend keeps the cursor visible on any background, including gold hover
          states. The blend mode must sit on the fixed element itself. */}
      <div
        ref={positionRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] mix-blend-difference"
        style={{ visibility: mode === 'hidden' ? 'hidden' : 'visible' }}
      >
        <div className="absolute" style={{ left: -size / 2, top: -size / 2, width: size, height: size, perspective: 160 }}>
          <div ref={gimbalRef} className="relative size-full" style={{ transformStyle: 'preserve-3d' }}>
            {/* Outer ring */}
            <div className={`absolute inset-0 rounded-full border-[1.5px] ${ring}`} />
            {/* Inner ring set at an angle: gives the gyroscope its depth */}
            <div
              className={`absolute inset-[3px] rounded-full border ${ring} opacity-60`}
              style={{ transform: 'rotateX(68deg)' }}
            />
          </div>
        </div>
        {/* Centre dot: the exact click point */}
        <div className={`absolute -top-[2px] -left-[2px] size-1 rounded-full bg-white`} />
      </div>

      {/* Label rendered separately so its colours are not inverted. */}
      <div
        ref={labelRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100]"
        style={{ visibility: label && link ? 'visible' : 'hidden' }}
      >
        <span className="absolute top-6 left-6 bg-fg px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-bg">{label}</span>
      </div>
    </>
  );
}
