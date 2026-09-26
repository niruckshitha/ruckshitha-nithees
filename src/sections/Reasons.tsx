import { motion } from 'framer-motion';
import { useState } from 'react';
import { content } from '../content';
import { SectionHeading } from '../components/SectionHeading';
import { easeOut, fadeRise, inView, prefersReducedMotion, stagger } from '../lib/motion';

const DOODLES = ['♥', '✿', '☆', '♡', '✎', '❀', '✦'];

/** Centres a leftover last card (odd count on phones, 3n+1 on desktop). */
function loneCardClass(i: number, n: number): string {
  if (i !== n - 1) return '';
  const cls: string[] = [];
  if (n % 2 === 1) cls.push('col-span-2 mx-auto w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.625rem)]');
  if (n % 3 === 1) cls.push('md:col-span-1 md:col-start-2 md:w-full');
  else if (n % 2 === 1) cls.push('md:col-span-1 md:w-full');
  return cls.join(' ');
}

export function Reasons() {
  // 4 per row on desktop when the cards divide evenly (e.g. 8), otherwise 3
  const fourUp = content.reasons.length % 4 === 0 && content.reasons.length % 3 !== 0;
  return (
    <section aria-labelledby="reasons-title" className="section">
      <SectionHeading
        id="reasons-title"
        kicker="tap each card"
        title="Reasons I Still Choose You"
      />

      <motion.ul variants={stagger(0.1)} {...inView} className={`mx-auto grid grid-cols-2 gap-3 sm:gap-5 ${fourUp ? 'max-w-4xl md:grid-cols-4' : 'max-w-3xl md:grid-cols-3'}`}>
        {content.reasons.map((r, i) => (
          <motion.li key={i} variants={fadeRise} className={loneCardClass(i, content.reasons.length)}>
            <FlipCard index={i} text={r} />
          </motion.li>
        ))}
      </motion.ul>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 1.2, ease: easeOut }}
        className="mt-12 text-center font-serif text-xl text-blush/80 italic"
      >
        …and a thousand more I'm still discovering.
      </motion.p>
    </section>
  );
}

function FlipCard({ index, text }: { index: number; text: string }) {
  const [open, setOpen] = useState(false);
  const reduced = prefersReducedMotion();
  const tilt = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.9][index % 6];

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-pressed={open}
      aria-label={open ? `Reason ${index + 1}: ${text}` : `Reason number ${index + 1}, tap to open`}
      className="group block aspect-[3/4] w-full rounded-xl text-left"
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="preserve-3d relative h-full w-full"
        initial={false}
        animate={reduced ? {} : { rotateY: open ? 180 : 0, rotateZ: open ? 0 : tilt }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      >
        {/* front */}
        <motion.div
          className="paper backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-xl p-4 text-center"
          animate={reduced ? { opacity: open ? 0 : 1 } : {}}
        >
          <span className="pointer-events-none absolute inset-2 rounded-lg border border-dashed border-gold/45" aria-hidden />
          <span className="font-serif text-5xl text-seal/85 transition-transform duration-300 group-hover:scale-110 md:text-6xl" aria-hidden>
            {DOODLES[index % DOODLES.length]}
          </span>
          <span className="mt-4 font-serif text-lg text-ink italic">reason no. {index + 1}</span>
          <span className="mt-1 font-sans text-[0.62rem] tracking-[0.2em] text-ink/55 uppercase">tap to open</span>
        </motion.div>

        {/* back */}
        <motion.div
          className="paper backface-hidden absolute inset-0 flex items-center justify-center rounded-xl p-4 text-center"
          style={reduced ? undefined : { transform: 'rotateY(180deg)' }}
          animate={reduced ? { opacity: open ? 1 : 0 } : {}}
          aria-hidden={!open}
        >
          <span className="pointer-events-none absolute top-2.5 right-3 font-serif text-sm text-seal/60" aria-hidden>
            {DOODLES[index % DOODLES.length]}
          </span>
          <p
            className={`font-script leading-[1.22] text-ink ${
              text.length > 80 ? 'text-[1.2rem] sm:text-[1.4rem]' : text.length > 55 ? 'text-[1.32rem] sm:text-[1.5rem]' : 'text-[1.5rem] sm:text-[1.65rem]'
            }`}
          >
            {text}
          </p>
        </motion.div>
      </motion.div>
    </button>
  );
}
