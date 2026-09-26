import { animate, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

const fmt = new Intl.NumberFormat('en-IN');

/** Counts up from 0 when scrolled into view, then follows the live value. */
export function CountUp({ value, duration = 2.2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const done = useRef(false);
  const latest = useRef(value);
  latest.current = value;

  // The text is written straight to the DOM so counting never re-renders React.
  useEffect(() => {
    if (!seen || !ref.current) return;
    const el = ref.current;
    if (prefersReducedMotion()) {
      done.current = true;
      el.textContent = fmt.format(latest.current);
      return;
    }
    const controls = animate(0, latest.current, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = fmt.format(Math.round(v))),
      onComplete: () => {
        done.current = true;
        el.textContent = fmt.format(latest.current);
      },
    });
    return () => controls.stop();
  }, [seen, duration]);

  useEffect(() => {
    if (done.current && ref.current) ref.current.textContent = fmt.format(value);
  }, [value]);

  return <span ref={ref} className="nums">0</span>;
}
