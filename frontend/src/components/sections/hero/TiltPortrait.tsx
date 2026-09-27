'use client';

import Image from 'next/image';
import { useRef } from 'react';

const MAX_TILT = 7; // degrees

/**
 * Portrait card that tilts in 3D toward the mouse. Mouse only: touch devices and reduced-motion
 * users see a still image. Transforms are written straight to the element (no re-renders).
 */
export function TiltPortrait({ src, alt, name, role }: { src: string; alt: string; name: string; role: string }) {
  const card = useRef<HTMLDivElement>(null);

  const canTilt = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !card.current || !canTilt()) return;
    const rect = card.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5; // -0.5 … 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    card.current.style.transform = `rotateX(${(-py * MAX_TILT * 2).toFixed(2)}deg) rotateY(${(px * MAX_TILT * 2).toFixed(2)}deg)`;
  }

  function onLeave() {
    if (card.current) card.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
  }

  return (
    <figure className="[perspective:1000px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div
        ref={card}
        className="relative aspect-[4/5] w-full overflow-hidden border border-line-strong bg-surface transition-transform duration-300 ease-out [transform-style:preserve-3d]"
      >
        <Image src={src} alt={alt} fill priority sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover object-top" />
        {/* Caption plate sits slightly in front of the photo for depth */}
        <figcaption className="absolute inset-x-0 bottom-0 border-t border-line-strong bg-bg/90 px-4 py-3 [transform:translateZ(30px)]">
          <span className="block text-sm font-semibold">{name}</span>
          {role && <span className="mt-0.5 block font-mono text-[10px] text-muted">{role}</span>}
        </figcaption>
      </div>
    </figure>
  );
}
