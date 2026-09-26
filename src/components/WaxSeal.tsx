import { useId } from 'react';

// Irregular, drippy wax outline (deterministic so every seal is the same shape).
function blob(cx: number, cy: number, r: number, seed: number): string {
  const n = 36;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wobble =
      Math.sin(a * 5 + seed) * 0.045 + Math.sin(a * 9 + seed * 2.3) * 0.03 + Math.sin(a * 3 + seed * 0.7) * 0.025;
    const rr = r * (1 + wobble);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  // smooth closed curve through the points
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    if (i === 0) d += `M${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return `${d}Z`;
}

const OUTER = blob(60, 60, 50, 1.7);

/** Rose-red wax seal with a gold N♥R monogram. `clip` renders only one half. */
const TONES = {
  rose: { hi: '#D2566C', mid: '#A8303F', lo: '#6B1624', in1: '#8E2433', in2: '#B53A4C', edge: '#5E121E' },
  wine: { hi: '#B03A6A', mid: '#7A1C45', lo: '#420A24', in1: '#5E1234', in2: '#8C2553', edge: '#360717' },
};

export function WaxSeal({
  className = '',
  clip,
  monogram = 'N♥R',
  tone = 'rose',
}: {
  className?: string;
  clip?: 'left' | 'right';
  monogram?: string;
  tone?: keyof typeof TONES;
}) {
  const id = useId().replace(/:/g, '');
  const t = TONES[tone];
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <radialGradient id={`w${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor={t.hi} />
          <stop offset="45%" stopColor={t.mid} />
          <stop offset="100%" stopColor={t.lo} />
        </radialGradient>
        <radialGradient id={`i${id}`} cx="60%" cy="65%" r="70%">
          <stop offset="0%" stopColor={t.in1} />
          <stop offset="100%" stopColor={t.in2} />
        </radialGradient>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF0C8" />
          <stop offset="45%" stopColor="#D4AF6A" />
          <stop offset="100%" stopColor="#9C7A38" />
        </linearGradient>
        {clip && (
          <clipPath id={`c${id}`}>
            {clip === 'left' ? (
              <path d="M0 0 H62 L55 30 L66 52 L54 74 L63 96 L58 120 H0 Z" />
            ) : (
              <path d="M62 0 H120 V120 H58 L63 96 L54 74 L66 52 L55 30 Z" />
            )}
          </clipPath>
        )}
      </defs>
      <g clipPath={clip ? `url(#c${id})` : undefined}>
        <path d={OUTER} fill={`url(#w${id})`} />
        <circle cx="60" cy="60" r="35" fill={`url(#i${id})`} />
        <circle cx="60" cy="60" r="35" fill="none" stroke={t.edge} strokeOpacity="0.45" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="31.5" fill="none" stroke={`url(#g${id})`} strokeWidth="0.8" strokeDasharray="1.2 2.2" />
        <text
          x="60"
          y="67"
          textAnchor="middle"
          fontFamily="'Cormorant Garamond', serif"
          fontSize={monogram.length <= 2 ? 30 : 21}
          fontWeight="600"
          fill={`url(#g${id})`}
          letterSpacing="0.5"
        >
          {monogram}
        </text>
        {/* glossy highlight */}
        <ellipse cx="42" cy="34" rx="16" ry="8" fill="#fff" opacity="0.14" transform="rotate(-30 42 34)" />
      </g>
    </svg>
  );
}
