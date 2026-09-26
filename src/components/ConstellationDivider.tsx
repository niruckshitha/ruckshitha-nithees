import { motion } from 'framer-motion';

// A few hand-placed "star maps" that link one section to the next.
const MAPS: [number, number][][] = [
  [[50, 4], [38, 30], [58, 52], [44, 78], [50, 116]],
  [[50, 4], [64, 26], [46, 48], [60, 74], [50, 116]],
  [[50, 4], [42, 22], [54, 40], [36, 64], [52, 88], [50, 116]],
  [[50, 4], [58, 34], [40, 56], [62, 80], [50, 116]],
];

export function ConstellationDivider({ variant = 0 }: { variant?: number }) {
  const pts = MAPS[variant % MAPS.length];
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  return (
    <div aria-hidden className="pointer-events-none flex justify-center py-2">
      <svg viewBox="0 0 100 120" className="h-28 w-24 overflow-visible md:h-36 md:w-28">
        <motion.path
          d={d}
          fill="none"
          stroke="#D4AF6A"
          strokeWidth={0.6}
          strokeOpacity={0.55}
          strokeDasharray="0.1 0"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
        {pts.map(([x, y], i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.25 + i * 0.3, type: 'spring', stiffness: 260, damping: 14 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
          >
            <circle cx={x} cy={y} r={i === 0 || i === pts.length - 1 ? 1.6 : 2.2} fill="#FFF3D6" />
            <circle cx={x} cy={y} r={5} fill="#D4AF6A" opacity={0.18} />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
