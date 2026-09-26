import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { content } from '../content';
import { SectionHeading } from '../components/SectionHeading';
import { easeOut } from '../lib/motion';
import sizes from '../gallery-sizes.json';

const dims = sizes as Record<string, { w: number; h: number }>;
const small = (src: string) => src.replace(/\.webp$/, '-sm.webp');

/** "Our Memories" — a soft masonry wall of photos with a full-screen viewer. */
export function Gallery() {
  const photos = content.gallery;
  const [open, setOpen] = useState<number | null>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(() => {
    setOpen((i) => {
      if (i !== null) window.setTimeout(() => thumbs.current[i]?.focus({ preventScroll: true }), 0);
      return null;
    });
  }, []);

  if (photos.length === 0) return null;

  return (
    <section aria-labelledby="gallery-title" className="section">
      <SectionHeading
        id="gallery-title"
        kicker="moments to keep"
        title="Our Memories"
        subtitle="Tap any photo to see it up close."
      />

      <ul className="mx-auto max-w-5xl columns-2 gap-3 sm:gap-4 md:columns-3 md:gap-5">
        {photos.map((p, i) => {
          const d = dims[p.photo];
          return (
            <motion.li
              key={p.photo}
              className="mb-3 break-inside-avoid sm:mb-4 md:mb-5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, delay: (i % 3) * 0.08, ease: easeOut }}
            >
              <button
                ref={(el) => {
                  thumbs.current[i] = el;
                }}
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Open photo ${i + 1}: ${p.caption}`}
                className="group relative block w-full overflow-hidden rounded-2xl border border-gold/35 bg-plum/30 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.85)]"
              >
                <img
                  src={small(p.photo)}
                  srcSet={`${small(p.photo)} 600w, ${p.photo} 1200w`}
                  sizes="(min-width: 768px) 320px, 50vw"
                  width={d?.w}
                  height={d?.h}
                  alt={p.caption}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                {/* soft vignette + little heart on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/45 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-3 bottom-2 text-lg text-blush/0 transition-colors duration-500 group-hover:text-blush/90"
                >
                  ♥
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 1.2, ease: easeOut }}
        className="mt-10 text-center font-script text-3xl text-gold-soft md:text-4xl"
      >
        …and so many more to make ✨
      </motion.p>

      {createPortal(
        <AnimatePresence>
          {open !== null && <Lightbox key="lightbox" index={open} onIndex={setOpen} onClose={close} />}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}

function Lightbox({ index, onIndex, onClose }: { index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const photos = content.gallery;
  const n = photos.length;
  const [dir, setDir] = useState(0);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (step: number) => {
      setDir(step);
      onIndex((index + step + n) % n);
    },
    [index, n, onIndex],
  );

  // keyboard, scroll lock, focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  useEffect(() => {
    document.body.classList.add('lightbox-open');
    closeBtn.current?.focus({ preventScroll: true });
    return () => document.body.classList.remove('lightbox-open');
  }, []);

  // warm the neighbours so swiping feels instant
  useEffect(() => {
    for (const k of [index + 1, index - 1]) {
      const img = new Image();
      img.src = photos[(k + n) % n].photo;
    }
  }, [index, n, photos]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -70 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 70 || info.velocity.x > 400) go(-1);
  };

  const p = photos[index];
  const d = dims[p.photo];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[80] flex flex-col bg-[#070a1a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <span className="font-sans text-xs tracking-[0.25em] text-gold/90 nums">
          {index + 1} / {n}
        </span>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          className="flex h-12 w-12 items-center justify-center rounded-full text-2xl text-blush/90 transition hover:bg-white/5"
        >
          ✕
        </button>
      </div>

      {/* photo */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-3"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={p.photo}
            src={p.photo}
            width={d?.w}
            height={d?.h}
            alt={p.caption}
            custom={dir}
            variants={{
              enter: (dd: number) => ({ opacity: 0, x: dd * 80, scale: 0.98 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (dd: number) => ({ opacity: 0, x: dd * -80, scale: 0.98 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: easeOut }}
            drag={n > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={onDragEnd}
            draggable={false}
            className="max-h-[calc(100svh-11rem)] w-auto max-w-full cursor-grab touch-pan-y rounded-xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] select-none active:cursor-grabbing"
          />
        </AnimatePresence>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 flex h-12 w-12 items-center justify-center rounded-full bg-night/70 text-2xl text-gold-soft ring-1 ring-gold/30 transition hover:bg-night md:left-6"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-full bg-night/70 text-2xl text-gold-soft ring-1 ring-gold/30 transition hover:bg-night md:right-6"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* caption */}
      <div className="px-6 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={p.caption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-md font-serif text-lg text-blush/90 italic md:text-xl"
          >
            {p.caption}
          </motion.p>
        </AnimatePresence>
        <p className="mt-1 font-sans text-[0.65rem] tracking-[0.2em] text-blush/40 uppercase md:hidden">swipe for more</p>
      </div>
    </motion.div>
  );
}
