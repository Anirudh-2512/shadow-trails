import { motion } from 'framer-motion';

// Animated F1-style racing track background: a curvy circuit with moving dash-lines,
// drifting speed streaks and a pulsing start/finish strip. Transparent-friendly (over bg-void).
export default function TrackBackdrop({ className = '' }) {
  const path =
    'M -60 420 C 90 380, 150 300, 300 300 S 520 300, 560 210 S 640 90, 480 70 S 220 60, 150 130 S 10 210, -60 240';

  const dashes = [
    { dur: 1.6, delay: 0, opacity: 0.8, w: 3, color: '#f43f5e' },
    { dur: 2.1, delay: 0.5, opacity: 0.45, w: 2, color: '#f43f5e' },
    { dur: 2.6, delay: 1.1, opacity: 0.3, w: 2, color: '#fb923c' },
    { dur: 3.3, delay: 0.2, opacity: 0.2, w: 5, color: '#22d3ee' },
  ];

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* speed wash */}
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 70% 50%, rgba(225,29,72,0.85), transparent 70%)',
        }}
      />
      <svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-[0.28]">
        {/* asphalt track */}
        <path d={path} fill="none" stroke="#14141b" strokeWidth="56" strokeLinecap="round" />
        {/* red/white kerb dashes */}
        <path d={path} fill="none" stroke="#241c26" strokeWidth="48" strokeLinecap="butt" />
        <path d={path} fill="none" stroke="#7f1d2f" strokeWidth="48" strokeLinecap="butt" strokeDasharray="10 8" opacity="0.35" />
        <path d={path} fill="none" stroke="#17171f" strokeWidth="40" strokeLinecap="round" />
        {/* moving dash lines */}
        {dashes.map((d, i) => (
          <motion.path
            key={i}
            d={path}
            fill="none"
            stroke={d.color}
            strokeWidth={d.w}
            strokeLinecap="round"
            strokeDasharray="26 90"
            opacity={d.opacity}
            style={{ strokeDashoffset: 116, translateX: 0 }}
            animate={{ strokeDashoffset: [116, -1300], opacity: [d.opacity, d.opacity, 0.06, d.opacity] }}
            transition={{ duration: d.dur * 6, repeat: Infinity, ease: 'linear', delay: d.delay }}
          />
        ))}
        {/* start / finish */}
        <g opacity="0.85">
          <rect x="292" y="56" width="12" height="30" fill="#444" transform="rotate(18 298 71)" />
          <rect x="292" y="56" width="12" height="8" fill="#e5e7eb" transform="rotate(18 298 71)" />
          <rect x="292" y="70" height="8" width="12" fill="#e5e7eb" transform="rotate(18 298 71)" />
          <rect x="306" y="56" width="12" height="30" fill="#444" transform="rotate(18 298 71)" />
        </g>
        {/* car light streaks */}
        <motion.circle
          r="2.6" fill="#fda4af"
          animate={{ pathLength: 0 }}
        />
      </svg>
      {/* sideways streaks */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background:
            'repeating-linear-gradient(115deg, transparent 0 60px, rgba(244,63,94,0.9) 60px 62px, transparent 62px 140px)',
        }}
      />
    </div>
  );
}
