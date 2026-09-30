'use client';

import { ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/types/api';

const meta = (item: GalleryItem) => [item.location, item.year].filter(Boolean).join(' · ');

/** One photo card in a gliding row. Duplicates (for the seamless loop) are hidden from assistive tech. */
function Card({ item, onOpen, duplicate }: { item: GalleryItem; onOpen: () => void; duplicate?: boolean }) {
  return (
    <li className="shrink-0" aria-hidden={duplicate || undefined}>
      <button
        type="button"
        tabIndex={duplicate ? -1 : undefined}
        onClick={onOpen}
        data-cursor-label="Open"
        className="group relative block h-56 w-[18rem] overflow-hidden bg-surface sm:h-72 sm:w-[24rem]"
      >
        <Image
          src={item.image.url}
          alt={duplicate ? '' : item.image.alt || item.title}
          fill
          sizes="(min-width: 640px) 24rem, 18rem"
          className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
        />
        {/* Caption slides up on hover (always visible on touch screens). */}
        <span className="absolute inset-x-0 bottom-0 translate-y-0 bg-bg/85 px-4 py-3 text-left transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] [@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:translate-y-0">
          <span className="block truncate text-sm font-medium text-fg">{item.title}</span>
          {meta(item) && <span className="mt-0.5 block truncate font-mono text-[11px] text-muted">{meta(item)}</span>}
        </span>
      </button>
    </li>
  );
}

/** Row that glides sideways forever (content duplicated for a seamless loop); pauses on hover. */
function GlidingRow({ items, reverse, onOpen }: { items: GalleryItem[]; reverse?: boolean; onOpen: (id: string) => void }) {
  // Repeat short lists so one copy is always wider than the screen.
  const base = items.length < 5 ? [...items, ...items, ...items] : items;
  const seconds = Math.max(30, base.length * 7);

  return (
    <div className="group/row overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <ul
        className="atlas-track flex w-max gap-4 group-hover/row:[animation-play-state:paused] group-focus-within/row:[animation-play-state:paused]"
        style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? 'reverse' : 'normal' } as React.CSSProperties}
      >
        {[0, 1].map((copy) =>
          base.map((item, index) => (
            <Card key={`${copy}-${index}-${item.id}`} item={item} duplicate={copy === 1 || index >= items.length} onOpen={() => onOpen(item.id)} />
          )),
        )}
      </ul>
    </div>
  );
}

/** Full-screen viewer with keyboard support (←/→ to browse, Esc to close) and a focus trap. */
function Lightbox({ items, index, onClose, onMove }: { items: GalleryItem[]; index: number; onClose: () => void; onMove: (step: number) => void }) {
  const item = items[index]!;
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    closeButton.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') onMove(1);
      else if (event.key === 'ArrowLeft') onMove(-1);
      else if (event.key === 'Tab' && dialog.current) {
        const focusable = dialog.current.querySelectorAll<HTMLElement>('button');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onMove]);

  const control = 'grid size-11 place-items-center border border-line-strong bg-bg/70 text-fg transition-colors hover:border-accent hover:text-accent';

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} (${index + 1} of ${items.length})`}
      className="fixed inset-0 z-[90] flex flex-col bg-bg/95"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <p className="font-mono text-xs text-muted">
          The Growth Atlas <span className="text-fg">{String(index + 1).padStart(2, '0')}</span> / {String(items.length).padStart(2, '0')}
        </p>
        <button ref={closeButton} type="button" onClick={onClose} aria-label="Close" className={control}>
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onClick={(event) => event.target === event.currentTarget && onClose()}>
        {/* key re-runs the wipe-in animation for every photo */}
        <figure key={item.id} className="lightbox-in relative h-full max-h-[72vh] w-full max-w-5xl">
          <Image src={item.image.url} alt={item.image.alt || item.title} fill sizes="100vw" className="object-contain" priority />
        </figure>
        {items.length > 1 && (
          <>
            <button type="button" onClick={() => onMove(-1)} aria-label="Previous photo" className={cn(control, 'absolute left-4 sm:left-8')}>
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => onMove(1)} aria-label="Next photo" className={cn(control, 'absolute right-4 sm:right-8')}>
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      <div key={`caption-${item.id}`} className="mx-auto w-full max-w-5xl px-4 pt-4 pb-8 sm:px-20">
        <p className="overflow-hidden text-xl font-semibold tracking-[-0.02em]">
          <span className="load-rise block">{item.title}</span>
        </p>
        {(meta(item) || item.image.caption) && (
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {meta(item) && (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                <MapPin aria-hidden className="size-3.5 text-accent" />
                {meta(item)}
              </span>
            )}
            {item.image.caption && <span>{item.image.caption}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

/** "The Growth Atlas": admin-managed photo gallery with gliding rows and a full-screen viewer. */
export function GrowthAtlas({ items, index = '02' }: { items: GalleryItem[]; index?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = useCallback((id: string) => setOpenIndex(items.findIndex((item) => item.id === id)), [items]);
  const close = useCallback(() => setOpenIndex(null), []);
  const move = useCallback(
    (step: number) => setOpenIndex((current) => (current === null ? null : (current + step + items.length) % items.length)),
    [items.length],
  );

  if (items.length === 0) return null;

  // Two rows moving in opposite directions; with few photos both rows show everything.
  const half = Math.ceil(items.length / 2);
  const rowA = items.length >= 6 ? items.slice(0, half) : items;
  const rowB = items.length >= 6 ? items.slice(half) : [...items].reverse();

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="screen-section overflow-hidden py-20 sm:py-24">
      <Container>
        <SectionHeading
          index={index}
          label="Photo gallery"
          id="gallery-title"
          title="The Growth Atlas"
          description="Moments from the shop floor, audits, global meetings and community work. Select a photo to view it."
        />
      </Container>

      <div data-reveal="rise" className="mt-14 space-y-4">
        <GlidingRow items={rowA} onOpen={open} />
        <GlidingRow items={rowB} onOpen={open} reverse />
      </div>

      {openIndex !== null && openIndex >= 0 && <Lightbox items={items} index={openIndex} onClose={close} onMove={move} />}
    </section>
  );
}
