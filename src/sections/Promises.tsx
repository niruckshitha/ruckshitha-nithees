import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { content } from '../content';
import { SectionHeading } from '../components/SectionHeading';
import { WaxSeal } from '../components/WaxSeal';
import { easeOut, fadeRise, inView, prefersReducedMotion, stagger } from '../lib/motion';

type SlotState = 'sealed' | 'breaking' | 'open';

export function Promises() {
  const [mainDone, setMainDone] = useState(false);
  const special = content.specialPromises;

  return (
    <section aria-labelledby="promises-title" className="section">
      <SectionHeading id="promises-title" kicker="sealed with love" title="My Promises To You" />
      <PromiseSet items={content.promises} doneText="Every promise, sealed with my whole heart ♥" onAllOpened={() => setMainDone(true)} />

      {special.length > 0 && (
        <div className="mt-20 md:mt-24">
          <motion.header variants={stagger(0.12)} {...inView} className="mx-auto mb-10 max-w-md text-center">
            <motion.p variants={fadeRise} className="kicker mb-3 flex items-center justify-center gap-3 !text-rose">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-rose" aria-hidden />
              only for you
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-rose" aria-hidden />
            </motion.p>
            <motion.h3 variants={fadeRise} className="font-script text-5xl leading-tight text-rose md:text-6xl">
              Special Promises
            </motion.h3>
          </motion.header>
          <PromiseSet
            items={special}
            special
            locked={!mainDone}
            lockedText={`Open all ${content.promises.length} promises above to unlock these 🔒`}
            doneText="Sealed, signed and very much promised 😉"
          />
        </div>
      )}
    </section>
  );
}

/** Centres a leftover last seal (odd count on phones, 3n+1 on desktop). */
function loneSlotClass(i: number, n: number): string {
  if (i !== n - 1) return '';
  const cls: string[] = [];
  if (n % 2 === 1) cls.push('col-span-2 mx-auto w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)]');
  if (n % 3 === 1) cls.push('md:col-span-1 md:col-start-2 md:w-full');
  else if (n % 2 === 1) cls.push('md:col-span-1 md:w-full');
  return cls.join(' ');
}

function PromiseSet({
  items,
  special = false,
  locked = false,
  lockedText,
  doneText,
  onAllOpened,
}: {
  items: string[];
  special?: boolean;
  locked?: boolean;
  lockedText?: string;
  doneText: string;
  onAllOpened?: () => void;
}) {
  const total = items.length;
  const [states, setStates] = useState<SlotState[]>(() => items.map(() => 'sealed'));
  const opened = states.filter((s) => s === 'open').length;
  const next = locked ? -1 : states.findIndex((s) => s === 'sealed');
  const busy = states.includes('breaking');
  const allDone = opened === total;

  const crack = (i: number) => {
    if (i !== next || busy) return;
    const set = (s: SlotState) => setStates((prev) => prev.map((p, j) => (j === i ? s : p)));
    set('breaking');
    window.setTimeout(() => {
      set('open');
      if (opened + 1 === total) onAllOpened?.();
    }, prefersReducedMotion() ? 50 : 650);
  };

  const left = total - opened;
  const status = allDone ? doneText : locked && lockedText ? lockedText : `Tap the glowing seal — ${left} left`;

  return (
    <>
      <p
        aria-live="polite"
        className={`mb-10 text-center font-serif text-lg italic md:mb-12 ${special ? 'text-rose/90' : '-mt-6 text-blush/85'}`}
      >
        {status}
      </p>

      <ul className="relative mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        {items.map((text, i) => (
          <li
            key={i}
            className={`relative flex min-h-[210px] items-center justify-center sm:min-h-[230px] ${loneSlotClass(i, total)}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {states[i] === 'open' ? (
                <PromiseCard key="card" index={i} text={text} special={special} />
              ) : (
                <SealButton
                  key="seal"
                  index={i}
                  special={special}
                  glowing={i === next && !busy}
                  breaking={states[i] === 'breaking'}
                  onCrack={() => crack(i)}
                />
              )}
            </AnimatePresence>
          </li>
        ))}
        {allDone && <FloatingHearts />}
      </ul>
    </>
  );
}

function SealButton({
  index,
  special,
  glowing,
  breaking,
  onCrack,
}: {
  index: number;
  special: boolean;
  glowing: boolean;
  breaking: boolean;
  onCrack: () => void;
}) {
  const disabled = !glowing;
  return (
    <motion.button
      type="button"
      onClick={onCrack}
      disabled={disabled && !breaking}
      aria-label={`${glowing ? 'Open' : ''} ${special ? 'special ' : ''}promise ${index + 1}${glowing ? '' : ', still sealed'}`.trim()}
      className="relative flex h-32 w-32 items-center justify-center rounded-full disabled:cursor-default sm:h-36 sm:w-36"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: glowing || breaking ? 1 : 0.5, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      whileTap={glowing ? { scale: 0.92 } : undefined}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      {glowing && (
        <motion.span
          aria-hidden
          className="absolute inset-2 rounded-full"
          style={{ boxShadow: '0 0 30px 8px rgba(232,160,191,0.45), 0 0 60px 16px rgba(212,175,106,0.25)' }}
          animate={{ opacity: [0.45, 1, 0.45], scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {breaking ? (
        <>
          <motion.span
            className="absolute inset-0"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: -26, y: 30, rotate: -28, opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.8, 0.6] }}
          >
            <WaxSeal tone={special ? 'wine' : 'rose'} clip="left" className="h-full w-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.5)]" />
          </motion.span>
          <motion.span
            className="absolute inset-0"
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{ x: 26, y: 34, rotate: 24, opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.8, 0.6] }}
          >
            <WaxSeal tone={special ? 'wine' : 'rose'} clip="right" className="h-full w-full drop-shadow-[0_6px_8px_rgba(0,0,0,0.5)]" />
          </motion.span>
          <Crumbs />
        </>
      ) : (
        <motion.span
          className="relative h-full w-full"
          animate={glowing ? { rotate: [0, -2, 2, 0] } : undefined}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <WaxSeal tone={special ? 'wine' : 'rose'} monogram={special ? '♥' : undefined} className="h-full w-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.55)]" />
        </motion.span>
      )}
    </motion.button>
  );
}

/** Little wax crumbs + gold sparks flying out when a seal cracks. */
function Crumbs() {
  const bits = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + (i % 3) * 0.3;
    const d = 50 + (i % 4) * 14;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, gold: i % 3 === 0, s: 4 + (i % 3) * 2 };
  });
  return (
    <>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: b.s,
            height: b.s,
            marginLeft: -b.s / 2,
            marginTop: -b.s / 2,
            background: b.gold ? '#E9D3A1' : '#A8303F',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: b.x, y: b.y + 20, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

function PromiseCard({ index, text, special }: { index: number; text: string; special: boolean }) {
  return (
    <div className="h-full w-full" style={{ perspective: 900 }}>
      <motion.div
        className={`paper flex h-full w-full origin-top flex-col items-center justify-center rounded-lg px-4 py-5 text-center ${special ? 'ring-2 ring-rose/60' : ''}`}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
      >
        <span className="kicker !text-[0.6rem] !text-seal/80">{special ? 'special' : 'promise'} no. {index + 1}</span>
        <p className="mt-3 font-serif text-[1.12rem] leading-snug text-ink italic sm:text-[1.2rem]">{text}</p>
        <span className="mt-3 text-seal/70" aria-hidden>
          {special ? '🔥' : '♥'}
        </span>
      </motion.div>
    </div>
  );
}

function FloatingHearts() {
  if (prefersReducedMotion()) return null;
  const hearts = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    delay: (i % 6) * 0.35,
    size: 14 + (i % 4) * 6,
    drift: ((i % 5) - 2) * 14,
    color: i % 3 === 0 ? '#D4AF6A' : '#E8A0BF',
  }));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {hearts.map((h, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0"
          style={{ left: h.left, fontSize: h.size, color: h.color }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -320, x: h.drift, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 3.2, delay: h.delay, ease: 'easeOut' }}
        >
          ♥
        </motion.span>
      ))}
    </div>
  );
}
