import { motion } from 'framer-motion';
import { content } from '../content';
import { CountUp } from '../components/CountUp';
import { RollingNumber } from '../components/RollingDigit';
import { SectionHeading } from '../components/SectionHeading';
import { fadeRise, inView, stagger } from '../lib/motion';
import { calendarDiff, wholeDaysBetween } from '../lib/time';
import { useNow } from '../lib/useNow';

const since = new Date(content.togetherSince);

export function LiveCounter() {
  const now = useNow();
  const d = calendarDiff(since, now);
  const ms = Math.max(0, now.getTime() - since.getTime());
  const days = wholeDaysBetween(since, now);

  const units: [string, number][] = [
    ['Years', d.years],
    ['Months', d.months],
    ['Days', d.days],
    ['Hours', d.hours],
    ['Minutes', d.minutes],
    ['Seconds', d.seconds],
  ];

  const stats: { emoji: string; label: string; value: number | null }[] = [
    { emoji: '🌅', label: 'Days Together', value: days },
    { emoji: '🥞', label: 'Weekends Shared', value: Math.floor(days / 7) },
    { emoji: '⏳', label: 'Hours of Us', value: Math.floor(ms / 3_600_000) },
    { emoji: '💓', label: 'Heartbeats Together', value: Math.floor(ms / 60_000) * 72 },
    { emoji: '📸', label: 'Memories Made', value: null },
  ];

  const summary = `${d.years} years, ${d.months} months, ${d.days} days, ${d.hours} hours, ${d.minutes} minutes`;

  return (
    <section aria-labelledby="counter-title" className="section">
      <SectionHeading id="counter-title" kicker="every second counts" title="Together for" />

      <p className="sr-only">{summary}</p>

      <motion.ol
        variants={stagger(0.08)}
        {...inView}
        className="mx-auto grid max-w-4xl grid-cols-3 gap-3 sm:gap-4 md:grid-cols-6"
      >
        {units.map(([label, v]) => (
          <motion.li
            key={label}
            variants={fadeRise}
            className="glass flex flex-col items-center justify-center rounded-2xl px-1 py-5 md:py-7"
          >
            <RollingNumber
              value={v}
              pad={label === 'Years' || label === 'Months' || label === 'Days' ? 1 : 2}
              className="font-serif text-[2.6rem] leading-none font-medium text-cream md:text-5xl"
            />
            <span className="mt-2 font-sans text-[0.65rem] tracking-[0.22em] text-gold uppercase">{label}</span>
          </motion.li>
        ))}
      </motion.ol>

      <motion.ul
        variants={stagger(0.1, 0.1)}
        {...inView}
        className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-5"
      >
        {stats.map((s, i) => (
          <motion.li
            key={s.label}
            variants={fadeRise}
            className={`flex flex-col items-center text-center ${i === stats.length - 1 ? 'col-span-2 md:col-span-1' : ''}`}
          >
            <span className="mb-2 text-3xl" aria-hidden>
              {s.emoji}
            </span>
            <span className="font-serif text-3xl leading-none font-medium text-gold-soft md:text-[2rem]">
              {s.value === null ? <span className="text-4xl">∞</span> : <CountUp value={s.value} />}
            </span>
            <span className="mt-2 font-sans text-xs tracking-wide text-blush/70">{s.label}</span>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
