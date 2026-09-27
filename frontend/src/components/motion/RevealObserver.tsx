'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const SELECTOR = '[data-reveal]:not(.is-revealed)';

/**
 * Adds `.is-revealed` to `[data-reveal]` elements the first time they come into view (styles in
 * globals.css). Positions are measured directly: IntersectionObserver treats elements that are masked
 * to zero area (clip-path / scaleX(0), i.e. exactly our hidden state) as never intersecting.
 * Also picks up elements added later, e.g. project cards after filtering.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    let frame = 0;

    const check = () => {
      frame = 0;
      const limit = window.innerHeight * 0.92;
      document.querySelectorAll(SELECTOR).forEach((element) => {
        // Anything in view or already scrolled past is revealed, so content above the viewport is never
        // left hidden (e.g. after a fast scroll before scripts loaded, or when opening a /#section link).
        if (element.getBoundingClientRect().top < limit) element.classList.add('is-revealed');
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
