import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { content } from '../content';
import { Confetti } from '../components/Confetti';
import { easeOut } from '../lib/motion';

const { prompt, value, hint, wrongReplies } = content.password;
const isRight = (guess: string) => guess.trim().toLowerCase() === value.trim().toLowerCase();

/** The very first screen: "Give me the password, madam…" */
export function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [guess, setGuess] = useState('');
  const [show, setShow] = useState(false);
  const [wrong, setWrong] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const shake = useAnimationControls();
  const input = useRef<HTMLInputElement>(null);

  // On a laptop, put the cursor straight in the box. (On phones we don't, so
  // the keyboard doesn't jump up before she's even seen the screen.)
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true });
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (unlocked) return;
    if (isRight(guess)) {
      input.current?.blur();
      setUnlocked(true);
      window.setTimeout(onUnlock, 1300);
    } else {
      setWrong((w) => w + 1);
      shake.start({ x: [0, -12, 10, -8, 6, -3, 0], transition: { duration: 0.5 } });
      input.current?.select();
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pw-title"
      className="fixed inset-0 z-50 overflow-y-auto"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: 'easeInOut' } }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(42,27,61,0.55), rgba(11,16,38,0.2) 55%, rgba(5,8,20,0.7))' }}
      />

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 py-10">
        <motion.div
          className="w-full max-w-sm text-center"
          initial={{ opacity: 0.001, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut }}
        >
          <Lock open={unlocked} />

          <p className="kicker mt-8">private · for {content.herName} only</p>
          <h1 id="pw-title" className="mt-3 font-script text-[2.6rem] leading-[1.15] text-gold-soft sm:text-5xl">
            {prompt}
          </h1>

          <motion.form animate={shake} onSubmit={submit} className="mt-8" noValidate>
            <label htmlFor="pw" className="sr-only">
              Password
            </label>
            <div className="relative">
              <input
                ref={input}
                id="pw"
                type={show ? 'text' : 'password'}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Password"
                disabled={unlocked}
                aria-invalid={wrong > 0 && !unlocked}
                aria-describedby="pw-msg"
                className="h-14 w-full rounded-full border border-gold/40 bg-night/70 pr-14 pl-6 text-center font-sans text-lg tracking-[0.12em] text-cream placeholder:tracking-normal placeholder:text-blush/40 outline-none transition focus:border-gold focus:shadow-[0_0_0_4px_rgba(212,175,106,0.18)]"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? 'Hide password' : 'Show password'}
                aria-pressed={show}
                className="absolute top-1/2 right-1.5 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-gold-soft/80 transition hover:text-gold-soft"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                  {!show && <path d="M4 4l16 16" strokeLinecap="round" />}
                </svg>
              </button>
            </div>

            <button type="submit" className="btn-gold mt-4 w-full" disabled={unlocked}>
              {unlocked ? 'Welcome, my love ♥' : <>Unlock <span aria-hidden>🔓</span></>}
            </button>

            <p id="pw-msg" aria-live="polite" className="mt-5 min-h-[3.5rem] font-serif text-lg text-rose italic">
              {wrong > 0 && !unlocked && (
                <motion.span key={wrong} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="block">
                  {wrongReplies[(wrong - 1) % wrongReplies.length]}
                  {wrong >= 2 && <span className="mt-1 block text-base text-blush/75">{hint}</span>}
                </motion.span>
              )}
            </p>
          </motion.form>
        </motion.div>
      </div>

      {unlocked && <Confetti mode="burst" origin={{ x: 0.5, y: 0.22 }} count={70} shapes={['star', 'dot', 'heart']} />}
    </motion.div>
  );
}

/** Gold padlock whose shackle springs open on the right password. */
function Lock({ open }: { open: boolean }) {
  return (
    <motion.div
      className="relative mx-auto h-24 w-24"
      animate={open ? { scale: [1, 1.12, 1] } : { y: [0, -5, 0] }}
      transition={open ? { duration: 0.6 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span aria-hidden className="absolute inset-2 rounded-full bg-gold/20 blur-2xl" />
      <svg viewBox="0 0 96 96" className="relative h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id="lock-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF0C8" />
            <stop offset="45%" stopColor="#D4AF6A" />
            <stop offset="100%" stopColor="#9C7A38" />
          </linearGradient>
        </defs>
        <motion.path
          d="M32 44V32a16 16 0 0 1 32 0v12"
          fill="none"
          stroke="url(#lock-gold)"
          strokeWidth="7"
          strokeLinecap="round"
          initial={false}
          animate={open ? { y: -12, rotate: -28 } : { y: 0, rotate: 0 }}
          style={{ originX: '64px', originY: '44px' }}
          transition={{ type: 'spring', stiffness: 220, damping: 12 }}
        />
        <rect x="20" y="42" width="56" height="42" rx="10" fill="url(#lock-gold)" />
        <rect x="20" y="42" width="56" height="42" rx="10" fill="none" stroke="#FFF3D6" strokeOpacity="0.5" />
        <path d="M48 70s-9-5.4-9-11.2c0-3 2.3-5.3 5-5.3 1.8 0 3.2 1 4 2.4.8-1.4 2.2-2.4 4-2.4 2.7 0 5 2.3 5 5.3C57 64.6 48 70 48 70z" fill="#9E2B3E" />
      </svg>
    </motion.div>
  );
}
