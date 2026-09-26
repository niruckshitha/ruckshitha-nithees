import { motion, useScroll, useSpring } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { content, type Chapter } from '../content';
import { SectionHeading } from '../components/SectionHeading';
import { easeOut } from '../lib/motion';

export function Timeline() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] });
  const draw = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const [h, setH] = useState(0);

  // Keep the SVG in real pixels so the stroke draws evenly.
  useLayoutEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section aria-labelledby="story-title" className="section">
      <SectionHeading
        id="story-title"
        kicker="chapter by chapter"
        title="The Story of Us"
        subtitle="Every star on this line is a moment I never want to forget."
      />

      <div className="relative mx-auto max-w-5xl">
        {/* The line that draws itself */}
        <svg
          aria-hidden
          className="pointer-events-none absolute top-0 left-[18px] w-[4px] -translate-x-1/2 overflow-visible md:left-1/2"
          style={{ height: h }}
          viewBox={`0 0 4 ${Math.max(h, 1)}`}
        >
          <line x1="2" y1="0" x2="2" y2={h} stroke="#D4AF6A" strokeOpacity="0.16" strokeWidth="1.5" />
          <motion.line
            x1="2"
            y1="0"
            x2="2"
            y2={h}
            stroke="#E2C58A"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ pathLength: draw }}
          />
        </svg>

        <ol ref={ref} className="relative space-y-16 md:space-y-24">
          {content.timeline.map((c, i) => (
            <ChapterItem key={i} chapter={c} index={i} />
          ))}
        </ol>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1, ease: easeOut }}
          className="relative mt-20 pl-12 font-script text-[2rem] text-gold-soft md:pl-0 md:text-center md:text-5xl"
        >
          …and we're still writing it ✨
        </motion.p>
      </div>
    </section>
  );
}

function ChapterItem({ chapter, index }: { chapter: Chapter; index: number }) {
  const left = index % 2 === 0; // desktop: polaroid on the left
  const tilt = left ? -2.2 : 2;

  return (
    <li className="relative grid grid-cols-1 items-center pl-12 md:grid-cols-2 md:gap-16 md:pl-0">
      {/* star node */}
      <motion.span
        aria-hidden
        className="absolute top-8 left-[18px] -translate-x-1/2 md:top-1/2 md:left-1/2 md:-translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <span className="relative flex h-7 w-7 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-gold/25 blur-[6px]" />
          <span className="relative text-lg leading-none text-gold-soft">✦</span>
        </span>
      </motion.span>

      {/* polaroid */}
      <motion.figure
        className={`relative mx-auto w-full max-w-[330px] md:max-w-[360px] ${left ? 'md:mr-0 md:ml-auto' : 'md:order-2 md:mr-auto md:ml-0'}`}
        initial={{ opacity: 0, x: left ? -40 : 40, rotate: 0 }}
        whileInView={{ opacity: 1, x: 0, rotate: tilt }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ type: 'spring', stiffness: 60, damping: 16 }}
        whileHover={{ rotate: 0, scale: 1.02 }}
      >
        <div className="paper rounded-[4px] p-3 pb-14">
          {/* washi tape */}
          <span
            aria-hidden
            className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] bg-rose/55 shadow-sm"
            style={{ clipPath: 'polygon(3% 0, 97% 4%, 100% 100%, 0 96%)' }}
          />
          <img
            src={chapter.photo}
            alt={chapter.caption}
            width={800}
            height={1000}
            loading="lazy"
            decoding="async"
            className="block aspect-[4/5] w-full rounded-[2px] bg-plum/20 object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-3 text-center font-script text-[1.7rem] leading-none text-ink/85">
            {chapter.date}
          </figcaption>
        </div>
      </motion.figure>

      {/* words */}
      <motion.div
        className={`mt-6 md:mt-0 ${left ? 'md:text-left' : 'md:order-1 md:text-right'}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, delay: 0.15, ease: easeOut }}
      >
        <p className="kicker">{chapter.title}</p>
        <p className="mt-3 max-w-md font-serif text-[1.35rem] leading-snug text-blush/90 italic md:inline-block md:text-2xl">
          {chapter.caption}
        </p>
      </motion.div>
    </li>
  );
}
