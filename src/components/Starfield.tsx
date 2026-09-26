import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

interface Star {
  x: number; // 0..1
  y: number; // 0..1
  r: number;
  a: number; // base alpha
  tw: number; // twinkle speed
  ph: number; // twinkle phase
  layer: 0 | 1 | 2;
  warm: boolean;
}

interface Shooting {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
}

const PARALLAX = [0.02, 0.05, 0.1];

/** Fixed, full-screen twinkling starfield with parallax and shooting stars. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    const reduced = prefersReducedMotion();
    let W = 0;
    let H = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let shooting: Shooting | null = null;
    let nextShoot = performance.now() + 3000 + Math.random() * 4000;
    let raf = 0;
    let running = false;

    const seed = () => {
      const count = Math.min(340, Math.round((W * H) / 3200));
      stars = Array.from({ length: count }, () => {
        const layer = (Math.random() < 0.6 ? 0 : Math.random() < 0.7 ? 1 : 2) as 0 | 1 | 2;
        return {
          x: Math.random(),
          y: Math.random(),
          r: layer === 0 ? 0.35 + Math.random() * 0.45 : layer === 1 ? 0.6 + Math.random() * 0.5 : 0.9 + Math.random() * 0.7,
          a: 0.35 + Math.random() * 0.6,
          tw: 0.4 + Math.random() * 1.6,
          ph: Math.random() * Math.PI * 2,
          layer,
          warm: Math.random() < 0.18,
        };
      });
    };

    let lastW = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Only re-seed when the width really changes (not when the mobile URL bar hides).
      if (Math.abs(W - lastW) > 40 || stars.length === 0) {
        lastW = W;
        seed();
      }
      if (!running) draw(performance.now());
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const scroll = window.scrollY;
      const time = t / 1000;
      for (const s of stars) {
        let y = s.y * H - (reduced ? 0 : scroll * PARALLAX[s.layer]);
        y = ((y % H) + H) % H;
        const x = s.x * W;
        const twinkle = reduced ? 1 : 0.65 + 0.35 * Math.sin(time * s.tw + s.ph);
        ctx.globalAlpha = s.a * twinkle;
        ctx.fillStyle = s.warm ? '#F3DDB0' : '#EEF0FF';
        if (s.r < 0.8) {
          ctx.fillRect(x - s.r, y - s.r, s.r * 2, s.r * 2);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, s.r, 0, Math.PI * 2);
          ctx.fill();
          if (s.layer === 2) {
            ctx.globalAlpha *= 0.18;
            ctx.beginPath();
            ctx.arc(x, y, s.r * 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (!reduced) {
        if (!shooting && t > nextShoot) {
          const fromLeft = Math.random() < 0.5;
          const speed = 9 + Math.random() * 5;
          const angle = (18 + Math.random() * 18) * (Math.PI / 180);
          shooting = {
            x: fromLeft ? Math.random() * W * 0.5 : W * 0.5 + Math.random() * W * 0.5,
            y: Math.random() * H * 0.4,
            vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            max: 55 + Math.random() * 25,
          };
        }
        if (shooting) {
          const s = shooting;
          s.life += 1;
          s.x += s.vx;
          s.y += s.vy;
          const p = s.life / s.max;
          const alpha = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
          const tail = 14;
          const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
          g.addColorStop(0, `rgba(255, 244, 220, ${alpha})`);
          g.addColorStop(1, 'rgba(212, 175, 106, 0)');
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
          ctx.stroke();
          if (s.life >= s.max) {
            shooting = null;
            nextShoot = t + 5000 + Math.random() * 5000;
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <>
      {/* soft nebula glow behind the stars */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 15% 10%, rgba(42,27,61,0.9), transparent 60%),' +
            'radial-gradient(ellipse 70% 45% at 90% 75%, rgba(42,27,61,0.75), transparent 60%),' +
            'radial-gradient(ellipse 60% 40% at 50% 110%, rgba(232,160,191,0.10), transparent 70%),' +
            'linear-gradient(180deg, #0B1026 0%, #0d1230 50%, #0B1026 100%)',
        }}
      />
      <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />
    </>
  );
}
