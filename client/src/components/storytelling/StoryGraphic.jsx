import { motion } from 'framer-motion';

const drawIn = { hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1 } };

function MapScene() {
  // city tile grid with a dropped trail pin
  return (
    <svg viewBox="0 0 260 220" className="h-40 w-full">
      {/* map tiles */}
      {[0, 1, 2, 3, 4].map((i) =>
        [0, 1, 2, 3].map((j) => (
          <motion.rect
            key={`${i}-${j}`}
            x={20 + i * 44}
            y={18 + j * 44}
            width={42}
            height={42}
            fill="none"
            stroke="#2b2b38"
            strokeWidth={1.2}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 * (i + j), duration: 0.5 }}
          />
        ))
      )}
      {/* roads */}
      <motion.path
        d="M20 105 H240 M105 18 V200 M180 18 V186"
        stroke="#3d3d4d"
        strokeWidth={2.4}
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      {/* dropped trail pin */}
      <motion.g
        initial={{ y: -60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, type: 'spring', bounce: 0.55, duration: 0.9 }}
      >
        <path
          d="M180 132 c-12 0 -22 10 -22 22 0 16 22 34 22 34 s22 -18 22 -34 c0 -12 -10 -22 -22 -22 z"
          fill="#a855f7"
          opacity="0.92"
        />
        <circle cx="180" cy="154" r="7" fill="#050507" />
      </motion.g>
      {/* impact ripples */}
      <motion.circle
        cx="180" cy="162" r="12" fill="none" stroke="#22d3ee" strokeWidth={2}
        initial={{ opacity: 0.9, scale: 0.6 }}
        whileInView={{ opacity: 0, scale: 3.2 }}
        viewport={{ once: true }}
        transition={{ delay: 0.95, duration: 1.3, repeat: 1, repeatDelay: 0.35 }}
        style={{ transformOrigin: '180px 162px' }}
      />
    </svg>
  );
}

function NoteScene() {
  // a padded message card being written onto map note
  return (
    <svg viewBox="0 0 260 210" className="h-40 w-40">
      <motion.rect
        x="52" y="26" width="156" height="112" rx="9"
        fill="#10101a" stroke="#a855f7" strokeWidth="1.6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      />
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={66}
          y={46 + i * 18}
          width={i === 2 ? 88 : 124}
          height={6}
          rx={3}
          fill="#22d3ee" opacity={0.5}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          style={{ transformOrigin: '66px' }}
          transition={{ delay: 0.45 + 0.32 * i, duration: 0.5 }}
        />
      ))}
      {/* pin marker below */}
      <motion.path
        d="M120 118 a14 14 0 1 1 2 0 l-1 66 -1 0 z M102 168 l40 0 -19 12 z"
        fill="#a855f7"
        initial={{ opacity: 0, scaleY: 0.3 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.5, duration: 0.6, ease: 'easeOut' }}
        style={{ transformOrigin: '120px 118px' }}
      />
    </svg>
  );
}

function RadarScene() {
  // proximity scanner with blips
  return (
    <svg viewBox="0 0 260 210" className="h-40 w-40">
      <motion.g
        initial={{ opacity: 0.25 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {[36, 72, 108].map((r) => (
          <circle key={r} cx={130} cy={105} r={r} fill="none" stroke="#22d3ee" strokeWidth="1.4" strokeDasharray="3 5" />
        ))}
      </motion.g>
      {/* scanning wedge */}
      <motion.path
        d="M130 105 L242 105 A112 112 0 0 0 186 17 Z"
        fill="#22d3ee"
        opacity="0.18"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 4.2, ease: 'linear', repeat: Infinity }} style={{ transformOrigin: '130px 105px' }}
      />
      {[{x:193,y:63},{x:74,y:147},{x:160,y:150}].map((b, i) => (
        <motion.circle
          key={i}
          cx={b.x} cy={b.y} r={5}
          fill="#a855f7"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 1, 0.45, 1] }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 + i * 0.5, duration: 1.4, repeat: Infinity, repeatDelay: 2.1 }}
        />
      ))}
      <circle cx="130" cy="105" r="6" fill="#e5e7eb" />
    </svg>
  );
}

function FadeScene() {
  // expiry clock draining the trail
  return (
    <svg viewBox="0 0 260 210" className="h-40 w-40">
      <motion.circle
        cx={130} cy={92} r={62} fill="none" stroke="#2b2b38" strokeWidth={3}
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      />
      <motion.circle
        cx={130} cy={92} r={62} fill="none" stroke="#fb923c" strokeWidth={3.4}
        strokeLinecap="round"
        initial={{ pathLength: 1, opacity: 0 }}
        whileInView={{ pathLength: [1, 0.12], opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 2.6, ease: 'easeInOut' }}
        style={{ transformOrigin: '130px 92px', rotate: '-90deg' }}
      />
      <motion.text
        x={130} y={100} textAnchor="middle" fill="#e5e7eb" fontSize={22} fontFamily="Oswald, sans-serif"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        00:24
      </motion.text>
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 2.1, duration: 1.2 }}
      >
        <circle cx={130} cy={170} r={5} fill="#a855f7" />
        {[8, 20, 34].map((r) => (
          <circle key={r} cx={130 + r * (r % 2 ? 1 : -1)} cy={176} r={2.2} fill="#7c7c8f" />
        ))}
      </motion.g>
      <motion.line
        x1={70} y1={132} x2={190} y2={132}
        stroke="#e11d48" strokeWidth={2}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 2.5, duration: 0.7 }}
      />
      <motion.text
        x={130} y={152} textAnchor="middle" fill="#f87171" fontSize={10} fontFamily="Oswald, sans-serif" letterSpacing="2"
        initial={{ opacity: 0 }} whileInView={{ opacity: 0.85 }} viewport={{ once: true }}
        transition={{ delay: 3 }}
      >
        EXPIRED · GONE
      </motion.text>
    </svg>
  );
}

const SCENES = {
  concept: MapScene,
  fade: FadeScene,
  discover: RadarScene,
  note: NoteScene,
};

export default function StoryGraphic({ id }) {
  const Scene = SCENES[id];
  if (!Scene) return null;
  return (
    <div className="shrink-0">
      <Scene />
    </div>
  );
}
