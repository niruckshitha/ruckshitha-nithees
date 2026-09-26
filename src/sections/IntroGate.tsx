import { animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { content } from '../content';
import { Confetti } from '../components/Confetti';
import { WaxSeal } from '../components/WaxSeal';
import { unlockAudio } from '../lib/audio';
import { easeOut } from '../lib/motion';

type Stage = 'sealed' | 'opening' | 'open';

export function IntroGate({ onOpen }: { onOpen: () => void }) {
  const [noCount, setNoCount] = useState(0);
  const [stage, setStage] = useState<Stage>('sealed');
  const { question, yes, no, noReplies } = content.gate;

  const sayYes = () => {
    if (stage !== 'sealed') return;
    unlockAudio();
    setStage('opening');
    window.setTimeout(() => setStage('open'), 900);
    window.setTimeout(onOpen, 2300);
  };

  /* ── The "No" button that can never be caught ──
   * It starts next to "Yes". The first time the cursor comes close (or a finger
   * touches it) it breaks free and floats around the screen, always landing
   * somewhere away from the pointer and never on top of "Yes". */
  const noInFlow = useRef<HTMLButtonElement>(null);
  const noFree = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const replyRef = useRef<HTMLParagraphElement>(null);
  const questionRef = useRef<HTMLParagraphElement>(null);
  const noX = useMotionValue(0);
  const noY = useMotionValue(0);
  const [free, setFree] = useState(false);
  const lastDodge = useRef(0);

  const dodge = (px?: number, py?: number) => {
    if (stage !== 'sealed') return;
    const now = performance.now();
    if (now - lastDodge.current < 260) return;
    lastDodge.current = now;

    const el = (free ? noFree.current : noInFlow.current) ?? noInFlow.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!free) {
      noX.set(r.left);
      noY.set(r.top);
      setFree(true);
    }

    const W = window.innerWidth;
    const H = window.innerHeight;
    const m = 16;
    const cx = px ?? r.left + r.width / 2;
    const cy = py ?? r.top + r.height / 2;
    // keep clear of the question, "Yes" and the little reply text
    const avoid = [yesRef.current, replyRef.current, questionRef.current]
      .filter((n): n is HTMLButtonElement | HTMLParagraphElement => n !== null)
      .map((n) => n.getBoundingClientRect());
    let best = { x: m, y: m };
    let bestD = -1;
    for (let i = 0; i < 30; i++) {
      const x = m + Math.random() * Math.max(1, W - r.width - 2 * m);
      const yy = m + Math.random() * Math.max(1, H - r.height - 2 * m);
      const blocked = avoid.some((a) => x < a.right + 20 && x + r.width > a.left - 20 && yy < a.bottom + 20 && yy + r.height > a.top - 20);
      if (blocked) continue;
      const d = Math.hypot(x + r.width / 2 - cx, yy + r.height / 2 - cy);
      if (d > Math.min(W, H) * 0.35) {
        best = { x, y: yy };
        break;
      }
      if (d > bestD) {
        bestD = d;
        best = { x, y: yy };
      }
    }
    const spring = { type: 'spring' as const, stiffness: 260, damping: 20, mass: 0.7 };
    animate(noX, best.x, spring);
    animate(noY, best.y, spring);
    setNoCount((n) => n + 1);
  };

  // Mouse: run away before the cursor even reaches it.
  useEffect(() => {
    if (stage !== 'sealed') return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = free ? noFree.current : noInFlow.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) < 70) dodge(e.clientX, e.clientY);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  });

  // Keep it on screen if the window is resized or the phone rotates.
  useEffect(() => {
    if (!free) return;
    const onResize = () => {
      const el = noFree.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      noX.set(Math.min(Math.max(16, noX.get()), window.innerWidth - r.width - 16));
      noY.set(Math.min(Math.max(16, noY.get()), window.innerHeight - r.height - 16));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [free, noX, noY]);

  // Touch / click / keyboard: it slips away the instant it's touched.
  const noPointerDown = (e: ReactPointerEvent) => {
    e.preventDefault();
    dodge(e.clientX, e.clientY);
  };
  const noClick = () => {
    if (performance.now() - lastDodge.current > 500) dodge();
  };

  const noClass =
    'inline-flex min-h-[48px] min-w-[7rem] items-center justify-center rounded-full border border-gold/40 bg-night px-6 font-sans text-[0.95rem] font-medium tracking-wide text-blush/85 select-none touch-none';

  // Every "no" makes the "yes" a little more tempting.
  const yesScale = Math.min(1 + noCount * 0.08, 1.4);

  const opening = stage !== 'sealed';

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className="fixed inset-0 z-50 overflow-y-auto"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
    >
      {/* soft vignette so the envelope glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(42,27,61,0.55), rgba(11,16,38,0.2) 55%, rgba(5,8,20,0.7))' }}
      />

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 py-10">
        {/* Envelope */}
        <motion.div
          className="relative mb-9"
          initial={{ opacity: 0.001, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: easeOut }}
        >
          <motion.div
            animate={opening ? { y: 0 } : { y: [0, -9, 0] }}
            transition={opening ? { duration: 0.4 } : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
            style={{ perspective: 900 }}
          >
            <Envelope stage={stage} />
          </motion.div>
          {/* glow under the envelope */}
          <div aria-hidden className="absolute -bottom-6 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-[50%] bg-gold/20 blur-xl" />
        </motion.div>

        <motion.div
          className="w-full max-w-sm text-center"
          initial={{ opacity: 0.001, y: 10 }}
          animate={opening ? { opacity: 0, y: 12 } : { opacity: 1, y: 0 }}
          transition={{ duration: opening ? 0.5 : 0.9, ease: easeOut }}
        >
          <h1 id="gate-title" className="mb-1">
            <span className="block font-script text-[2.9rem] leading-tight text-gold-soft">For {content.herName}</span>
            <span className="mt-1 block font-serif text-xl text-blush/85 italic">open when you're ready.</span>
          </h1>

          <div className="mt-8">
            <p ref={questionRef} id="gate-question" className="mb-5 font-serif text-xl text-blush/90">
              {question}
            </p>
            <div className="flex items-center justify-center gap-4" role="group" aria-labelledby="gate-question">
              <motion.button
                ref={yesRef}
                layout
                type="button"
                onClick={sayYes}
                disabled={opening}
                className="btn-gold min-w-[8.5rem]"
                animate={{ scale: yesScale }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                {yes} <span aria-hidden>♥</span>
              </motion.button>
              {/* in-flow "No": leaves the row once it breaks free (then "Yes" glides to the centre) */}
              {!free && (
                <button
                  ref={noInFlow}
                  type="button"
                  onPointerDown={noPointerDown}
                  onClick={noClick}
                  disabled={opening}
                  className={noClass}
                >
                  {no}
                </button>
              )}
            </div>
            <p ref={replyRef} aria-live="polite" className="mt-5 min-h-[3rem] font-serif text-lg text-rose italic">
              {noCount > 0 && (
                <motion.span key={noCount} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="block">
                  {noReplies[(noCount - 1) % noReplies.length]}
                </motion.span>
              )}
            </p>
          </div>
        </motion.div>
      </div>

      {free &&
        !opening &&
        createPortal(
          <motion.button
            ref={noFree}
            type="button"
            onPointerDown={noPointerDown}
            onClick={noClick}
            className={`${noClass} fixed top-0 left-0 z-[70] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)]`}
            style={{ x: noX, y: noY }}
          >
            {no}
          </motion.button>,
          document.body,
        )}

      {stage === 'open' && <Confetti mode="burst" origin={{ x: 0.5, y: 0.32 }} count={110} shapes={['star', 'dot', 'star', 'rect']} />}
    </motion.div>
  );
}

function Envelope({ stage }: { stage: Stage }) {
  const opening = stage !== 'sealed';
  return (
    <div className="relative h-[178px] w-[270px] sm:h-[196px] sm:w-[300px]">
      {/* letter peeking out */}
      <motion.div
        className="paper absolute inset-x-4 top-3 bottom-3 flex items-start justify-center rounded-md pt-5"
        initial={false}
        animate={stage === 'open' ? { y: -96, opacity: 1 } : { y: 0, opacity: opening ? 1 : 0 }}
        transition={{ duration: 0.9, ease: easeOut }}
        style={{ zIndex: 1 }}
      >
        <span className="font-script text-3xl text-ink">for you ♥</span>
      </motion.div>

      {/* envelope back + pocket */}
      <div className="absolute inset-0 rounded-lg" style={{ background: 'linear-gradient(160deg, #f3e6d6, #e6d2bb)', zIndex: 0 }} />
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          zIndex: 2,
          background: 'linear-gradient(180deg, #f8ede0, #ecdcc8)',
          clipPath: 'polygon(0 30%, 50% 62%, 100% 30%, 100% 100%, 0 100%)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)',
        }}
      />
      {/* side folds */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{ zIndex: 2, background: 'linear-gradient(90deg, rgba(0,0,0,0.06), transparent 30%, transparent 70%, rgba(0,0,0,0.06))', clipPath: 'polygon(0 30%, 50% 62%, 100% 30%, 100% 100%, 0 100%)' }}
      />
      {/* gold edge */}
      <div className="pointer-events-none absolute inset-0 rounded-lg border border-gold/60" style={{ zIndex: 4 }} />

      {/* flap */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[62%] origin-top"
        style={{ zIndex: opening ? 0 : 3, transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateX: opening ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #efe0cd, #e2cdb4)',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.15))',
          }}
        />
      </motion.div>

      {/* seal */}
      <motion.div
        className="absolute left-1/2 top-[62%] h-16 w-16 -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 5 }}
        initial={false}
        animate={opening ? { scale: 0.4, opacity: 0, rotate: -25 } : { scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
      >
        <WaxSeal className="h-full w-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]" />
      </motion.div>
    </div>
  );
}
