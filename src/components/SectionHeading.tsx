import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeRise, inView, stagger } from '../lib/motion';

interface Props {
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
  id?: string;
}

export function SectionHeading({ kicker, title, subtitle, id }: Props) {
  return (
    <motion.header variants={stagger(0.12)} {...inView} className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
      <motion.p variants={fadeRise} className="kicker mb-4 flex items-center justify-center gap-3">
        <span className="gold-hairline w-8" aria-hidden />
        {kicker}
        <span className="gold-hairline w-8" aria-hidden />
      </motion.p>
      <motion.h2
        id={id}
        variants={fadeRise}
        className="foil font-serif text-[2.4rem] leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl md:text-6xl"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeRise} className="mx-auto mt-4 max-w-md font-serif text-lg text-blush/75 italic md:text-xl">
          {subtitle}
        </motion.p>
      )}
    </motion.header>
  );
}
