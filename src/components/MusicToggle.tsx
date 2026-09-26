import { motion } from 'framer-motion';
import { useState } from 'react';
import { music, setMusic } from '../lib/audio';

/** Soft background-music toggle (only shown when content.backgroundMusic is set). Off by default. */
export function MusicToggle() {
  const [on, setOn] = useState(false);
  if (!music) return null;
  const toggle = () => {
    setMusic(!on);
    setOn(!on);
  };
  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Turn music off' : 'Turn soft music on'}
      className="glass fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full text-gold-soft"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5 }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path d="M9 18V6l11-2v12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
        <circle cx="17.5" cy="16" r="2.5" fill="currentColor" />
        {!on && <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      </svg>
    </motion.button>
  );
}
