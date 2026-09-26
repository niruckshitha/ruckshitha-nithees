import { useSyncExternalStore } from 'react';
import { getNow } from './time';

// One shared ticker for the whole page, aligned to whole seconds, so every
// counter changes in the same frame.
let now = getNow();
const listeners = new Set<() => void>();
let timer: number | undefined;

function schedule() {
  const delay = 1000 - (getNow().getTime() % 1000) + 5;
  timer = window.setTimeout(() => {
    now = getNow();
    listeners.forEach((l) => l());
    schedule();
  }, delay);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    now = getNow();
    schedule();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.clearTimeout(timer);
  };
}

export function useNow(): Date {
  return useSyncExternalStore(subscribe, () => now, () => now);
}
