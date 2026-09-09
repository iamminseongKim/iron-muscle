import { useEffect } from 'react';

// Keyboard-driven scrolling must never blur or disable the active input.
export function useKeyboardViewport() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let fullHeight = window.innerHeight;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = viewport?.height ?? window.innerHeight;
        const top = viewport?.offsetTop ?? 0;
        const active = document.activeElement as HTMLElement | null;
        const editing = Boolean(active?.matches('input, textarea, select, [contenteditable="true"]'));
        if (!editing) fullHeight = window.innerHeight;
        else fullHeight = Math.max(fullHeight, window.innerHeight);
        root.style.setProperty('--input-viewport-height', `${height}px`);
        root.style.setProperty('--input-viewport-top', `${top}px`);
        root.dataset.keyboardOpen = String(editing && fullHeight - height > 120);
      });
    };
    const revealInput = () => {
      update();
      const active = document.activeElement as HTMLElement | null;
      if (!active?.matches('input, textarea, select')) return;
      const bounds = active.getBoundingClientRect();
      const top = viewport?.offsetTop ?? 0;
      const bottom = top + (viewport?.height ?? window.innerHeight);
      if (bounds.bottom > bottom - 16 || bounds.top < top + 60) {
        active.scrollIntoView({ block: 'center', behavior: 'auto' });
      }
    };
    update();
    viewport?.addEventListener('resize', revealInput);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', revealInput);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', revealInput);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', revealInput);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
      delete root.dataset.keyboardOpen;
      root.style.removeProperty('--input-viewport-height');
      root.style.removeProperty('--input-viewport-top');
    };
  }, []);
}
