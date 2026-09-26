import { Fragment, startTransition, useEffect, useState } from 'react';
import { content } from './content';
import { ConstellationDivider } from './components/ConstellationDivider';
import type { StoryState } from './lib/time';
import { Closing } from './sections/Closing';
import { Celebration } from './sections/Countdown';
import { Gallery } from './sections/Gallery';
import { Hero } from './sections/Hero';
import { LiveCounter } from './sections/LiveCounter';
import { LoveLetter } from './sections/LoveLetter';
import { Promises } from './sections/Promises';
import { Reasons } from './sections/Reasons';
import { ThenNow } from './sections/ThenNow';
import { Timeline } from './sections/Timeline';

// Warm the hero photo as soon as this chunk loads (it's hidden behind the envelope until then).
if (typeof window !== 'undefined') {
  const img = new Image();
  img.decoding = 'async';
  img.src = content.heroPhoto;
}

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };

/** Everything behind the envelope. Loaded as its own chunk so the gate paints fast. */
export default function Story({ opened, story }: { opened: boolean; story: StoryState }) {
  const sections = [
    <Hero key="hero" revealed={opened} story={story} />,
    <LiveCounter key="counter" />,
    <Timeline key="timeline" />,
    <ThenNow key="thennow" />,
    <Reasons key="reasons" />,
    <LoveLetter key="letter" />,
    <Promises key="promises" />,
    story.isAnniversary ? <Celebration key="celebrate" story={story} /> : null,
    <Gallery key="gallery" />,
    <Closing key="closing" />,
  ].filter((x) => x !== null);

  // Mount sections one by one in idle time, so a slow phone never stutters.
  const [count, setCount] = useState(1);
  useEffect(() => {
    if (count >= sections.length) return;
    const w = window as IdleWindow;
    const next = () => startTransition(() => setCount((c) => c + 1));
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(next, { timeout: 400 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(next, 60);
    return () => window.clearTimeout(t);
  }, [count, sections.length]);

  return (
    <main aria-hidden={!opened} inert={!opened} style={{ visibility: opened ? 'visible' : 'hidden' }} className="relative">
      {sections.slice(0, count).map((section, i) => (
        <Fragment key={section.key}>
          {i > 0 && <ConstellationDivider variant={(i - 1) % 4} />}
          {section}
        </Fragment>
      ))}
    </main>
  );
}
