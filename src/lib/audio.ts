import { content } from '../content';

/*
 * Audio elements are created once, up front, so the gate tap can "unlock"
 * them inside a user gesture (iOS Safari / Chrome Android autoplay rules).
 */

function make(src: string, loop = false): HTMLAudioElement | null {
  if (typeof window === 'undefined' || !src) return null;
  const a = new Audio();
  a.preload = 'metadata';
  a.loop = loop;
  a.src = src;
  return a;
}

export const music = make(content.backgroundMusic, true);

/** Call inside the gate's click/tap handler. */
export function unlockAudio() {
  for (const a of [music]) {
    if (!a) continue;
    const wasMuted = a.muted;
    a.muted = true;
    const p = a.play();
    const reset = () => {
      a.pause();
      a.currentTime = 0;
      a.muted = wasMuted;
    };
    if (p) p.then(reset).catch(() => { a.muted = wasMuted; });
    else reset();
  }
}

export function setMusic(on: boolean) {
  if (!music) return;
  if (on) {
    music.volume = 0.45;
    music.play().catch(() => {});
  } else {
    music.pause();
  }
}
