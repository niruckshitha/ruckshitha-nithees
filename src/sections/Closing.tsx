import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { content } from '../content';
import { easeOut, fadeRise, inView, prefersReducedMotion, stagger } from '../lib/motion';

export function Closing() {
  const playAgain = () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });

  return (
    <section aria-labelledby="closing-title" className="relative flex min-h-[100svh] flex-col items-center justify-center px-5 pt-16 pb-8 text-center">
      <HeartConstellation />

      <motion.div variants={stagger(0.2, 0.6)} {...inView} className="relative -mt-4 max-w-xl">
        <motion.h2 id="closing-title" variants={fadeRise} className="foil font-serif text-[2.1rem] leading-tight font-medium text-balance sm:text-5xl">
          {content.closingLine}
        </motion.h2>
        <motion.p variants={fadeRise} className="mt-6 font-script text-5xl text-cream sm:text-6xl">
          {content.myName} <span className="text-rose">♥</span> {content.herName}
        </motion.p>
        <motion.div variants={fadeRise} className="mt-10">
          <button type="button" onClick={playAgain} className="btn-gold">
            <span aria-hidden>↺</span> Play it again
          </button>
        </motion.div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 1.2, ease: easeOut }}
        className="mt-auto pt-20 font-sans text-xs tracking-wide text-blush/55"
      >
        Made with love by {content.myName}, for {content.herName}.
      </motion.footer>
    </section>
  );
}

/** Stars drift in from the night sky and settle into a heart, then join up like a constellation. */
function HeartConstellation() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduced = prefersReducedMotion();
    const N = 64;
    let W = 0;
    let H = 0;
    let raf = 0;
    let startT = -1;
    let visible = false;

    // heart outline points (classic parametric heart)
    const target = Array.from({ length: N }, (_, i) => {
      const t = (i / N) * Math.PI * 2;
      const x = 16 * Math.sin(t) ** 3;
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return { x: x / 17, y: (y - 2.5) / 17 };
    });
    const from = target.map(() => ({ x: Math.random() * 2.4 - 1.2, y: Math.random() * 2.4 - 1.4 }));
    const meta = target.map((_, i) => ({
      delay: Math.random() * 0.9,
      r: i % 8 === 0 ? 1.9 : 0.9 + Math.random() * 0.8,
      tw: 0.8 + Math.random() * 1.5,
      ph: Math.random() * 6,
    }));

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ease = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3));

    const draw = (now: number) => {
      if (startT < 0) startT = now;
      const t = reduced ? 99 : (now - startT) / 1000;
      ctx.clearRect(0, 0, W, H);
      const scale = Math.min(W, H) * 0.42;
      const cx = W / 2;
      const cy = H / 2;
      const pts = target.map((p, i) => {
        const k = ease((t - meta[i].delay) / 2.6);
        return {
          x: cx + (from[i].x + (p.x - from[i].x) * k) * scale,
          y: cy + (from[i].y + (p.y - from[i].y) * k) * scale,
        };
      });

      // constellation lines fade in once the stars have settled
      const lineA = Math.max(0, Math.min(1, (t - 3.2) / 1.5));
      if (lineA > 0) {
        ctx.strokeStyle = `rgba(212,175,106,${0.45 * lineA})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.stroke();
        // soft inner glow
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale);
        g.addColorStop(0, `rgba(232,160,191,${0.12 * lineA})`);
        g.addColorStop(1, 'rgba(232,160,191,0)');
        ctx.fillStyle = g;
        ctx.fill();
      }

      pts.forEach((p, i) => {
        const m = meta[i];
        const tw = 0.6 + 0.4 * Math.sin(t * m.tw + m.ph);
        ctx.globalAlpha = tw;
        ctx.fillStyle = i % 8 === 0 ? '#FFF3D6' : '#EEF0FF';
        ctx.beginPath();
        ctx.arc(p.x, p.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        if (m.r > 1.5) {
          ctx.globalAlpha = tw * 0.2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, m.r * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      draw(now);
      if (!reduced) raf = requestAnimationFrame(loop);
    };

    size();
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && !document.hidden) raf = requestAnimationFrame(loop);
      },
      { threshold: 0.3 },
    );
    io.observe(canvas);
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const onResize = () => {
      size();
      if (reduced) draw(performance.now());
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none h-[min(78vw,360px)] w-full max-w-[520px]" />;
}
