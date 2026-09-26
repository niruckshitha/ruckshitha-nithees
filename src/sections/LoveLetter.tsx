import { motion } from 'framer-motion';
import { content } from '../content';
import { SectionHeading } from '../components/SectionHeading';
import { easeOut } from '../lib/motion';

export function LoveLetter() {
  const paragraphs = content.letter
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [salutation, ...body] = paragraphs;

  return (
    <section aria-labelledby="letter-title" className="section">
      <SectionHeading id="letter-title" kicker="read slowly" title="A Letter For You" />

      <div className="mx-auto max-w-xl" style={{ perspective: 1400 }}>
        <motion.article
          className="paper origin-top rounded-[6px] px-6 py-10 sm:px-10 sm:py-12"
          initial={{ rotateX: -75, scaleY: 0.55, opacity: 0 }}
          whileInView={{ rotateX: 0, scaleY: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 1.3, ease: easeOut }}
        >
          {/* fold creases */}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-gradient-to-r from-transparent via-ink/10 to-transparent" />

          <Line className="mb-6 font-script text-[2.1rem] leading-tight text-ink">{salutation}</Line>
          {body.map((p, i) => (
            <Line key={i} className="mb-5 font-serif text-[1.22rem] leading-[1.7] text-ink/90 sm:text-[1.3rem]">
              {p}
            </Line>
          ))}
          <Line className="mt-8 text-right font-script text-[2.3rem] text-seal">— {content.myName}</Line>
        </motion.article>
      </div>

    </section>
  );
}

function Line({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <motion.p
      className={`whitespace-pre-line ${className}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1, ease: easeOut }}
    >
      {children}
    </motion.p>
  );
}
