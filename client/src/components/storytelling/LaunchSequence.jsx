import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import TrackBackdrop from './TrackBackdrop.jsx';

const SECTORS = [
  { at: 0.06, label: 'FORMATION LAP', text: 'CITY NETWORK TRACKED. SIGNALS SWEEPS ACTIVE.' },
  { at: 0.28, label: 'SECTOR 1', sub: 'GRID CLEARED. ANONYMOUS IDENTITIES REGISTERED.' },
  { at: 0.48, label: 'SECTOR 2', sub: 'TRAILS DEPLOYED AT REAL-WORLD COORDINATES.' },
  { at: 0.66, label: 'SECTOR 3', sub: 'PROXIMITY SCANNING — ONLY NEARBY OPERATORS SEE THEM.' },
  { at: 0.86, label: 'FINAL LAP', sub: 'EVERY TRAIL COUNTS DOWN. NO SECONDS.' },
];

export default function LaunchSequence() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  // telemetry speed 0 -> 340 km/h, revs 0 -> 12000
  const speed = useTransform(scrollYProgress, [0.05, 1], [0, 340]);
  const revs = useTransform(scrollYProgress, [0.05, 1], [1000, 12400]);
  const speedText = useTransform(speed, (v) => `${Math.round(v)}`);
  const revText = useTransform(revs, (v) => `${Math.round(v)}`);

  // 5 lights switch on one by one between 30% & 70%, go dark at 80%
  const lightOn = (i) =>
    useTransform(scrollYProgress, [0.06 + i * 0.09, 0.09 + i * 0.09], [0, 1]);
  const lightsOff = useTransform(scrollYProgress, [0.78, 0.84], [1, 0]);

  const sectorText = (i) =>
    useTransform(scrollYProgress, (v) => {
      let cur = SECTORS[0];
      for (const s of SECTORS) if (v >= s.at) cur = s;
      const line = cur.sub || cur.label;
      return line || '';
    });

  const barWidth = useTransform(scrollYProgress, [0, 1], ['4%', '100%']);

  return (
    <section ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <TrackBackdrop />
        {/* racing stripes */}
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            background:
              'repeating-linear-gradient(115deg, #e11d48 0 40px, transparent 40px 90px)',
          }}
        />
        {/* speed blur side wash */}
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2"
          style={{
            background: 'linear-gradient(90deg, rgba(225,29,72,0.25), transparent)',
            opacity: useTransform(scrollYProgress, [0.2, 0.6, 1], [0, 0.8, 0.2]),
            x: useTransform(scrollYProgress, [0, 1], [-200, 60]),
          }}
        />

        {/* top timing bar */}
        <div className="absolute left-0 right-0 top-16 z-20 px-6 sm:px-10">
          <div className="flex items-center gap-4">
            <span className="font-display text-xs uppercase tracking-[0.4em] text-white/50">
              LIVE TELEMETRY
            </span>
            <div className="h-[3px] flex-1 overflow-hidden rounded bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-400"
                style={{ width: barWidth }}
              />
            </div>
          </div>
        </div>

        {/* start lights */}
        <div className="absolute left-1/2 top-[30%] flex -translate-x-1/2 gap-3 sm:gap-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-10 w-10 rounded-full border-2 border-white/25 sm:h-14 sm:w-14"
              style={{ backgroundColor: useTransform(lightOn(i), [0, 1], ['#1a1a1f', '#e11d48']), opacity: lightsOff }}
            />
          ))}
        </div>

        {/* sector narrative */}
        <motion.div
          className="absolute left-6 top-[55%] z-10 max-w-2xl sm:left-10"
          initial={{ opacity: 0 }}
          whileInView={undefined}
        >
          {SECTORS.map((s) => (
            <Caption key={s.label} at={s.at} label={s.label} text={s.sub || ''} progress={scrollYProgress} />
          ))}
        </motion.div>

        {/* LED odometer */}
        <div className="absolute bottom-24 right-6 text-right sm:right-14">
          <div className="font-display text-7xl leading-none text-white drop-shadow-[0_0_25px_rgba(225,29,72,0.65)] sm:text-9xl">
            <motion.span>{speedText}</motion.span>
            <span className="ml-2 text-lg text-red-500 sm:text-2xl">km/h</span>
          </div>
          <div className="mt-2 font-mono text-xs uppercase tracking-[0.35em] text-white/50 sm:text-sm">
            rev <motion.span className="text-red-400"><motion.span>{revText}</motion.span></motion.span> rpm · trail telemetry
          </div>
        </div>

        {/* LIGHTS OUT */}
        <motion.div
          className="absolute left-0 right-0 top-1/3 z-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          style={{ opacity: useTransform(scrollYProgress, [0.84, 0.9], [0, 1], { clamp: true }) }}
        >
          <h2 className="font-display text-5xl uppercase tracking-widest text-white drop-shadow-[0_0_35px_rgba(225,29,72,0.9)] sm:text-8xl">
            Lights out
          </h2>
          <p className="mt-3 font-display text-sm uppercase tracking-[0.5em] text-red-500 sm:text-xl">
            you are never behind the pack
          </p>
          <Link
            to="/map"
            className="font-display mt-8 inline-block rounded-md bg-red-600 px-10 py-3 text-sm font-semibold uppercase tracking-widest text-black transition hover:shadow-[0_0_40px_rgba(225,29,72,0.8)]"
          >
            Pit exit — Enter the Map
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Caption({ at, label, text, progress }) {
  const inView = useTransform(
    progress,
    [0, at, at + 0.04, at + 0.2, at + 0.26],
    [0, 0, 1, 1, 0]
  );
  return (
    <motion.div
      style={{ opacity: inView, y: 0 }}
      className="absolute left-0 top-[-1.5rem] w-full"
    >
      <span className="font-display text-2xl uppercase tracking-wider text-white sm:text-4xl">
        {label}
      </span>
      <p className="mt-1 max-w-md font-mono text-[11px] leading-relaxed tracking-wider text-red-300/80 sm:text-xs">
        {text}
      </p>
    </motion.div>
  );
}
