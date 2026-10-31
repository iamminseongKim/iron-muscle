import { useEffect, useRef, useState } from 'react';

type Placement = 'before' | 'after';
type DragView = { sourceId: string; targetId: string | null; placement: Placement; x: number; y: number };
type Gesture = { kind: 'pressing'; sourceId: string; x: number; y: number; timer: ReturnType<typeof setTimeout> } | { kind: 'dragging'; view: DragView } | null;

export function useExerciseDrag(sessionId: string | undefined, onDrop: (sourceId: string, targetId: string, placement: Placement) => void) {
  const [drag, setDrag] = useState<DragView | null>(null);
  const dropRef = useRef(onDrop);
  dropRef.current = onDrop;
  useEffect(() => {
    if (!sessionId) return;
    let gesture: Gesture = null;
    let frame = 0;
    let suppressClickUntil = 0;
    let suppressedCardId: string | null = null;
    const stop = (commit: boolean) => {
      if (gesture?.kind === 'pressing') clearTimeout(gesture.timer);
      if (gesture?.kind === 'dragging') {
        suppressClickUntil = Date.now() + 700;
        const { sourceId, targetId, placement } = gesture.view;
        suppressedCardId = sourceId;
        if (commit && targetId) dropRef.current(sourceId, targetId, placement);
      }
      gesture = null;
      cancelAnimationFrame(frame);
      setDrag(null);
    };
    const hit = (x: number, y: number) => {
      if (gesture?.kind !== 'dragging') return;
      const sourceId = gesture.view.sourceId;
      const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-workout-exercise]'))
        .filter(card => card.dataset.workoutExercise !== sourceId);
      const next = cards.find(card => {
        const rect = card.getBoundingClientRect();
        return y < rect.top + rect.height / 2;
      });
      const target = next || cards[cards.length - 1];
      const view: DragView = { sourceId, x, y, targetId: target?.dataset.workoutExercise || null, placement: next ? 'before' : 'after' };
      gesture = { kind: 'dragging', view };
      setDrag(view);
    };
    const scroll = () => {
      if (gesture?.kind !== 'dragging') return;
      const { x, y } = gesture.view;
      const delta = y < 100 ? -12 : y > innerHeight - 100 ? 12 : 0;
      if (delta) { window.scrollBy(0, delta); hit(x, y); }
      frame = requestAnimationFrame(scroll);
    };
    const start = (target: EventTarget | null, x: number, y: number) => {
      if (!(target instanceof Element) || gesture) return;
      const card = target.closest<HTMLElement>('[data-workout-exercise]');
      const sourceId = card?.dataset.workoutExercise;
      if (!sourceId) return;
      const title = target.closest('[data-exercise-header] h3');
      if (!title && target.closest('button, input, select, textarea, a, summary, label, [contenteditable]')) return;
      const timer = setTimeout(() => {
        const view: DragView = { sourceId, targetId: null, placement: 'before', x, y };
        gesture = { kind: 'dragging', view };
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        window.getSelection()?.removeAllRanges();
        setDrag(view);
        frame = requestAnimationFrame(scroll);
      }, 450);
      gesture = { kind: 'pressing', sourceId, x, y, timer };
    };
    const move = (x: number, y: number, event: Event) => {
      if (gesture?.kind === 'pressing' && Math.hypot(x - gesture.x, y - gesture.y) > 10) stop(false);
      else if (gesture?.kind === 'dragging') { if (event.cancelable) event.preventDefault(); hit(x, y); }
    };
    const touchStart = (event: TouchEvent) => { if (event.touches.length === 1) start(event.target, event.touches[0].clientX, event.touches[0].clientY); else stop(false); };
    const touchMove = (event: TouchEvent) => { if (event.touches.length === 1) move(event.touches[0].clientX, event.touches[0].clientY, event); else stop(false); };
    const touchEnd = () => stop(true);
    const cancel = () => stop(false);
    const pointerStart = (event: PointerEvent) => { if (event.pointerType !== 'touch' && event.button === 0) start(event.target, event.clientX, event.clientY); };
    const pointerMove = (event: PointerEvent) => { if (event.pointerType !== 'touch') move(event.clientX, event.clientY, event); };
    const pointerEnd = (event: PointerEvent) => { if (event.pointerType !== 'touch') stop(true); };
    const click = (event: MouseEvent) => {
      const card = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-workout-exercise]') : null;
      if (card?.dataset.workoutExercise === suppressedCardId && Date.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        suppressedCardId = null;
      }
    };
    const context = (event: MouseEvent) => { if (gesture) event.preventDefault(); };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') stop(false); };
    document.addEventListener('touchstart', touchStart, { passive: true });
    document.addEventListener('touchmove', touchMove, { passive: false });
    document.addEventListener('touchend', touchEnd);
    document.addEventListener('touchcancel', cancel);
    document.addEventListener('pointerdown', pointerStart);
    document.addEventListener('pointermove', pointerMove);
    document.addEventListener('pointerup', pointerEnd);
    document.addEventListener('click', click, true);
    document.addEventListener('contextmenu', context);
    document.addEventListener('keydown', key);
    document.addEventListener('visibilitychange', cancel);
    window.addEventListener('blur', cancel);
    return () => {
      stop(false);
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchmove', touchMove);
      document.removeEventListener('touchend', touchEnd);
      document.removeEventListener('touchcancel', cancel);
      document.removeEventListener('pointerdown', pointerStart);
      document.removeEventListener('pointermove', pointerMove);
      document.removeEventListener('pointerup', pointerEnd);
      document.removeEventListener('click', click, true);
      document.removeEventListener('contextmenu', context);
      document.removeEventListener('keydown', key);
      document.removeEventListener('visibilitychange', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, [sessionId]);
  return drag;
}
