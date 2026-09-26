import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

type Shape = 'rect' | 'dot' | 'star' | 'heart';

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  shape: Shape;
  life: number;
  max: number;
  flip: number;
}

const GOLD = ['#D4AF6A', '#E9D3A1', '#FFF3D6', '#B8914A', '#F6D6E0'];
const ROSE = ['#E8A0BF', '#F6D6E0', '#D4AF6A', '#FFF7EE'];

interface Props {
  mode: 'burst' | 'continuous';
  /** Fixed to the viewport (default) or absolute inside the parent. */
  fixed?: boolean;
  /** Burst origin as fractions of the canvas. */
  origin?: { x: number; y: number };
  count?: number;
  palette?: 'gold' | 'rose';
  shapes?: Shape[];
  /** Change this to fire another burst. */
  fireKey?: number | string;
  onDone?: () => void;
}

export function Confetti({
  mode,
  fixed = true,
  origin = { x: 0.5, y: 0.45 },
  count = 90,
  palette = 'gold',
  shapes = ['rect', 'dot', 'star'],
  fireKey,
  onDone,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (prefersReducedMotion()) {
      doneRef.current?.();
      return;
    }
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const colors = palette === 'gold' ? GOLD : ROSE;
    let W = 0;
    let H = 0;
    let raf = 0;
    let visible = true;
    let running = false;
    const parts: P[] = [];

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const box = fixed ? { width: window.innerWidth, height: window.innerHeight } : canvas.parentElement!.getBoundingClientRect();
      W = box.width;
      H = box.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

    const spawnBurst = () => {
      const ox = origin.x * W;
      const oy = origin.y * H;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 3 + Math.random() * 7;
        parts.push({
          x: ox,
          y: oy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 3,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          size: 3 + Math.random() * 5,
          color: pick(colors),
          shape: pick(shapes),
          life: 0,
          max: 90 + Math.random() * 60,
          flip: Math.random() * Math.PI,
        });
      }
    };

    const spawnRain = () => {
      parts.push({
        x: Math.random() * W,
        y: -10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.8 + Math.random() * 1.2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.08,
        size: 3 + Math.random() * 4,
        color: pick(colors),
        shape: pick(shapes),
        life: 0,
        max: Infinity,
        flip: Math.random() * Math.PI,
      });
    };

    const drawShape = (p: P) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      const s = p.size;
      switch (p.shape) {
        case 'rect': {
          const sx = Math.abs(Math.cos(p.flip));
          ctx.fillRect(-s / 2, (-s * 0.35) * sx, s, s * 0.7 * sx + 0.5);
          break;
        }
        case 'dot':
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'star': {
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? s * 0.7 : s * 0.18;
            const a = (i * Math.PI) / 4;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'heart': {
          const k = s / 10;
          ctx.beginPath();
          ctx.moveTo(0, 3 * k);
          ctx.bezierCurveTo(-7 * k, -2 * k, -3 * k, -8 * k, 0, -4 * k);
          ctx.bezierCurveTo(3 * k, -8 * k, 7 * k, -2 * k, 0, 3 * k);
          ctx.fill();
          break;
        }
      }
      ctx.restore();
    };

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      frame++;
      if (mode === 'continuous' && frame % 5 === 0 && parts.length < 70) spawnRain();
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        if (mode === 'burst') {
          p.vx *= 0.985;
          p.vy = p.vy * 0.985 + 0.12;
        } else {
          p.vx += Math.sin((frame + i * 13) / 40) * 0.01;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.flip += 0.08;
        const fade = mode === 'burst' ? Math.max(0, 1 - p.life / p.max) : 0.85;
        ctx.globalAlpha = fade;
        drawShape(p);
        if (p.life > p.max || p.y > H + 20) parts.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      if (mode === 'burst' && parts.length === 0) {
        running = false;
        doneRef.current?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    size();
    if (mode === 'burst') spawnBurst();
    start();

    const onResize = () => size();
    const onVis = () => (document.hidden ? stop() : start());
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);

    let io: IntersectionObserver | undefined;
    if (!fixed) {
      io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) start();
        else stop();
      });
      io.observe(canvas.parentElement!);
    }

    return () => {
      stop();
      io?.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [mode, fireKey]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none ${fixed ? 'fixed inset-0 z-[60]' : 'absolute inset-0'}`}
    />
  );
}
