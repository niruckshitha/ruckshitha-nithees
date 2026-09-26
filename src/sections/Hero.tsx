import { motion } from 'framer-motion';
import { content } from '../content';
import { Confetti } from '../components/Confetti';
import { easeOut } from '../lib/motion';
import type { StoryState } from '../lib/time';

export function Hero({ revealed, story }: { revealed: boolean; story: StoryState }) {
  const show = revealed ? 'show' : 'hidden';
  const item = (delay: number) => ({
    variants: {
      hidden: { opacity: 0, y: 24 },
      show: { opacity: 1, y: 0, transition: { duration: 1.1, delay, ease: easeOut } },
    },
    initial: 'hidden',
    animate: show,
  });

  return (
    <section
      aria-labelledby="hero-names"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pt-10 pb-24 text-center"
    >
      {/* Arched photo */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={revealed ? { opacity: 1, scale: 1, y: 0 } : undefined}
        transition={{ duration: 1.6, ease: easeOut }}
      >
        {/* outer decorative arch line */}
        <div
          aria-hidden
          className="absolute -inset-3 rounded-t-full rounded-b-[28px] border border-gold/30"
          style={{ boxShadow: '0 0 60px -10px rgba(212,175,106,0.35)' }}
        />
        <div
          className="relative rounded-t-full rounded-b-[22px] p-[3px]"
          style={{
            background: 'linear-gradient(160deg, #F1DCAA, #D4AF6A 40%, #8f6e33 70%, #E9D3A1)',
            boxShadow: '0 0 40px -6px rgba(212,175,106,0.55), 0 30px 60px -20px rgba(0,0,0,0.8)',
            width: 'min(82vw, 430px, 50svh)',
          }}
        >
          <img
            src={content.heroPhoto}
            alt={`${content.myName} and ${content.herName}, smiling together`}
            width={825}
            height={1100}
            fetchPriority="high"
            decoding="async"
            className="block aspect-[3/4] w-full rounded-t-full rounded-b-[20px] object-cover"
          />
        </div>
        {/* tiny sparkles on the arch */}
        {[
          ['-6%', '18%', 0.2],
          ['102%', '30%', 1.1],
          ['96%', '-2%', 2],
        ].map(([l, t, d]) => (
          <motion.span
            key={String(l)}
            aria-hidden
            className="absolute text-gold-soft"
            style={{ left: l as string, top: t as string, fontSize: 14 }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, delay: d as number }}
          >
            ✦
          </motion.span>
        ))}
      </motion.div>

      <motion.p {...item(0.5)} className="kicker mt-10">
        {story.heroLine}
      </motion.p>

      <motion.h1
        {...item(0.75)}
        id="hero-names"
        className="mt-3 font-script leading-[1.15] text-cream"
        style={{ fontSize: 'clamp(2.3rem, 10vw, 4.4rem)' }}
      >
        {content.myName}{' '}
        <motion.span
          className="inline-block text-rose"
          animate={{ scale: [1, 1.14, 1, 1.1, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
          aria-label="loves"
        >
          ♥
        </motion.span>{' '}
        {content.herName}
      </motion.h1>

      <motion.p {...item(1)} className="mt-4 max-w-sm font-serif text-xl text-blush/85 italic md:text-2xl">
        “{content.heroQuote}”
      </motion.p>

      {/* falling-star scroll hint */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : undefined}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="relative h-12 w-px overflow-hidden">
          <motion.div
            className="absolute left-0 h-6 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, #FFF3D6)' }}
            animate={{ y: [-24, 48] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeIn', repeatDelay: 0.6 }}
          />
        </div>
        <span className="font-sans text-[0.65rem] tracking-[0.35em] text-gold/80 uppercase">scroll</span>
      </motion.div>

      {revealed && story.isAnniversary && <Confetti mode="burst" origin={{ x: 0.5, y: 0.35 }} count={140} fireKey="hero" />}
    </section>
  );
}
