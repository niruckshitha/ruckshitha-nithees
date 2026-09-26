import { AnimatePresence, MotionConfig } from 'framer-motion';
import { lazy, startTransition, Suspense, useEffect, useState } from 'react';
import { content } from './content';
import { MusicToggle } from './components/MusicToggle';
import { Starfield } from './components/Starfield';
import { storyState } from './lib/time';
import { useNow } from './lib/useNow';
import { IntroGate } from './sections/IntroGate';
import { PasswordGate } from './sections/PasswordGate';

const Story = lazy(() => import('./Story'));

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };

export default function App() {
  const [unlocked, setUnlocked] = useState(false); // password accepted
  const [opened, setOpened] = useState(false); // envelope opened
  const [mountStory, setMountStory] = useState(false);
  const now = useNow();
  const story = storyState(now, content.togetherSince, content.anniversaryMonthDay);

  // Nothing behind the gates is loaded until the password is right; then the
  // rest of the page renders quietly while she's on the envelope screen.
  useEffect(() => {
    if (!unlocked) return;
    const w = window as IdleWindow;
    const go = () => startTransition(() => setMountStory(true));
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1200 });
    else window.setTimeout(go, 300);
  }, [unlocked]);

  // Lock scrolling behind the envelope; start at the top once it opens.
  useEffect(() => {
    document.body.classList.toggle('locked', !opened);
    if (opened) window.scrollTo(0, 0);
  }, [opened]);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Starfield />

      <AnimatePresence mode="wait">
        {!unlocked ? (
          <PasswordGate key="password" onUnlock={() => setUnlocked(true)} />
        ) : !opened ? (
          <IntroGate key="gate" onOpen={() => setOpened(true)} />
        ) : null}
      </AnimatePresence>

      {unlocked && (mountStory || opened) && (
        <Suspense fallback={null}>
          <Story opened={opened} story={story} />
        </Suspense>
      )}

      {opened && content.backgroundMusic && <MusicToggle />}
    </MotionConfig>
  );
}
