import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion';
import { useEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { content } from '../content';
import { SectionHeading } from '../components/SectionHeading';
import { easeOut, prefersReducedMotion } from '../lib/motion';

export function ThenNow() {
  const box = useRef<HTMLDivElement>(null);
  const handle = useRef<HTMLDivElement>(null);
  const pos = useMotionValue(50); // % from the left that shows "then"
  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`);
  const left = useTransform(pos, (v) => `${v}%`);
  const dragging = useRef(false);
  const seen = useInView(box, { once: true, amount: 0.6 });

  useMotionValueEvent(pos, 'change', (v) => handle.current?.setAttribute('aria-valuenow', String(Math.round(v))));

  // A gentle "you can drag me" hint the first time it's seen.
  useEffect(() => {
    if (!seen || prefersReducedMotion()) return;
    const c = animate(pos, [50, 32, 68, 50], { duration: 2.2, ease: 'easeInOut', delay: 0.4 });
    return () => c.stop();
  }, [seen, pos]);

  const setFromX = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    pos.stop();
    pos.set(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  const onDown = (e: PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  };
  const onMove = (e: PointerEvent) => dragging.current && setFromX(e.clientX);
  const onUp = () => (dragging.current = false);

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    let v = pos.get();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v -= step;
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v += step;
    else if (e.key === 'Home') v = 0;
    else if (e.key === 'End') v = 100;
    else return;
    e.preventDefault();
    pos.stop();
    animate(pos, Math.min(100, Math.max(0, v)), { duration: 0.2, ease: easeOut });
  };

  return (
    <section aria-labelledby="thennow-title" className="section">
      <SectionHeading
        id="thennow-title"
        kicker="drag the heart"
        title="Then & Now"
        subtitle="Same two hearts. Just a little more in love."
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: easeOut }}
        className="-mx-2 w-[calc(100%+1rem)] max-w-[700px] sm:mx-auto sm:w-full"
      >
        <div
          ref={box}
          className="relative h-[calc((100vw-24px)*4/3)] w-full cursor-ew-resize sm:h-[746.67px] overflow-hidden rounded-[22px] border border-gold/50 select-none"
          style={{ touchAction: 'pan-y', boxShadow: '0 0 50px -12px rgba(212,175,106,0.45), 0 30px 60px -25px rgba(0,0,0,0.8)' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          {/* NOW underneath */}
          <img
            src={content.nowPhoto}
            alt="Us in 2026"
            width={1080}
            height={1440}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* THEN on top, clipped */}
          <motion.img
            src={content.thenPhoto}
            alt="Us in 2024"
            width={1080}
            height={1440}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover object-[center_60%]"
            style={{ clipPath: clip, WebkitClipPath: clip }}
          />

          <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-night/65 px-3 py-1 font-serif text-lg text-gold-soft">
            2024
          </span>
          <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-night/65 px-3 py-1 font-serif text-lg text-gold-soft">
            2026
          </span>

          {/* divider + heart handle */}
          <motion.div className="pointer-events-none absolute top-0 bottom-0 w-0" style={{ left }}>
            <div className="absolute top-0 bottom-0 -left-px w-[2px] bg-gradient-to-b from-gold/0 via-gold-soft to-gold/0" />
            <div
              ref={handle}
              role="slider"
              tabIndex={0}
              aria-label="Compare 2024 and 2026 photos"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={50}
              aria-valuetext="Drag to compare"
              onKeyDown={onKey}
              className="pointer-events-auto absolute top-1/2 left-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #FFF3D6, #D4AF6A 60%, #9C7A38)',
                boxShadow: '0 0 0 4px rgba(11,16,38,0.35), 0 6px 20px rgba(0,0,0,0.5), 0 0 24px rgba(212,175,106,0.6)',
              }}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path d="M12 21s-7.5-4.6-9.3-9.2C1.4 8.4 3.6 5 7 5c2 0 3.6 1.1 5 2.8C13.4 6.1 15 5 17 5c3.4 0 5.6 3.4 4.3 6.8C19.5 16.4 12 21 12 21z" fill="#9E2B3E" />
              </svg>
              <span aria-hidden className="absolute -left-4 text-xs text-gold-soft">‹</span>
              <span aria-hidden className="absolute -right-4 text-xs text-gold-soft">›</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
