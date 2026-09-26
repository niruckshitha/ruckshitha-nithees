import { AnimatePresence, motion } from 'framer-motion';

/** A single digit that rolls when it changes. */
function Digit({ d }: { d: string }) {
  return (
    <span className="relative inline-block h-[1.1em] w-[0.62em] overflow-hidden align-bottom">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={d}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {d}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function RollingNumber({ value, pad = 2, className = '' }: { value: number; pad?: number; className?: string }) {
  const s = String(value).padStart(pad, '0');
  return (
    <span className={`inline-flex nums ${className}`} aria-hidden>
      {s.split('').map((d, i) => (
        <Digit key={s.length - i} d={d} />
      ))}
    </span>
  );
}
