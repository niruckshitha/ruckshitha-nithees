import { motion } from 'framer-motion';
import { content } from '../content';
import { Confetti } from '../components/Confetti';
import { fadeRise, inView, stagger } from '../lib/motion';
import { istParts, type StoryState } from '../lib/time';

/** Anniversary-day celebration panel (only rendered on the anniversary itself). */
export function Celebration({ story }: { story: StoryState }) {
  return (
    <section aria-labelledby="celebrate-title" className="section relative overflow-hidden">
      <Confetti mode="continuous" fixed={false} palette="gold" shapes={['star', 'dot', 'rect', 'heart']} />
      <motion.div variants={stagger(0.18)} {...inView} className="relative mx-auto max-w-xl text-center">
        <motion.p variants={fadeRise} className="kicker">
          {content.anniversaryMonthDay.split('-').reverse().join(' · ')} · {istParts(story.next).y - 1}
        </motion.p>
        <motion.div variants={fadeRise} aria-hidden className="relative mx-auto my-4">
          {/* soft pulsing glow (opacity only, so it stays smooth) */}
          <motion.span
            className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'radial-gradient(closest-side, rgba(212,175,106,0.4), rgba(212,175,106,0.12) 55%, rgba(212,175,106,0) 100%)' }}
            animate={{ opacity: [0.45, 1, 0.45], scale: [0.95, 1.08, 0.95] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="foil relative font-serif leading-none font-semibold" style={{ fontSize: 'clamp(9rem, 42vw, 15rem)' }}>
            {story.years}
          </span>
        </motion.div>
        <motion.h2 id="celebrate-title" variants={fadeRise} className="font-serif text-4xl leading-tight text-cream md:text-5xl">
          Today is our day <span aria-hidden>💫</span>
        </motion.h2>
        <motion.p variants={fadeRise} className="mt-3 font-script text-[2.6rem] leading-tight text-gold-soft md:text-6xl">
          Happy {story.yearsOrdinal} Anniversary
        </motion.p>
        <motion.p variants={fadeRise} className="mx-auto mt-5 max-w-sm font-serif text-lg text-blush/80 italic">
          {content.myName} &amp; {content.herName} — {story.years} years, and still the best part of every day.
        </motion.p>
      </motion.div>
    </section>
  );
}
