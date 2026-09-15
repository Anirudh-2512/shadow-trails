import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import CityScene from '../components/3d/CityScene.jsx';

const BEATS = [
  {
    id: 'vibe',
    text: 'The city is full of stories nobody ever hears.',
  },
  {
    id: 'concept',
    title: 'Drop a trail',
    text: 'Leave an anonymous note — a confession, a warning, a memory — anywhere you stand. Together with media, pinned to real coordinates.',
  },
  {
    id: 'discover',
    title: 'Discover what lingers',
    text: 'Only people physically nearby can see your trail. No followers. No feed. Presence is the algorithm.',
  },
  {
    id: 'fade',
    title: 'Then it fades',
    text: 'Every trail has a countdown. Live for hours, not forever. When it expires, it is gone — no archive, no trace.',
  },
];

function Beat({ beat, index }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30%' }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className={`flex min-h-[70vh] items-center px-6 ${index % 2 ? 'justify-end' : 'justify-start'}`}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="max-w-xl rounded-2xl border border-white/10 bg-smoke/70 p-8 backdrop-blur-md sm:p-10"
      >
        {beat.title ? (
          <h2 className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
            <span className="bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
              {beat.title}
            </span>
          </h2>
        ) : null}
        <p className="mt-4 text-lg leading-relaxed text-white/60">{beat.text}</p>
      </motion.div>
    </motion.section>
  );
}

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.1]);

  return (
    <div className="bg-void">
      <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-4 sm:px-10">
        <span className="font-display text-xl uppercase tracking-widest text-white drop-shadow">
          Shadow<span className="text-neon-purple">Trails</span>
        </span>
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="font-display text-sm uppercase tracking-widest text-white/60 transition hover:text-neon-cyan"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="relative">
        <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="sticky top-0 h-screen overflow-hidden">
          <CityScene />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8))]" />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="font-display pointer-events-none text-5xl uppercase leading-tight text-white sm:text-7xl lg:text-8xl"
            >
              You are never
              <br />
              <span className="bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-orange bg-clip-text text-transparent">
                alone in the city
              </span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="pointer-events-auto mt-10 flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
            >
              <Link
                to="/map"
                className="font-display w-full text-center rounded-md bg-neon-purple px-10 py-3 text-sm font-semibold uppercase tracking-widest text-black transition hover:shadow-[0_0_40px_rgba(168,85,247,0.7)]"
              >
                Enter the Map
              </Link>
              <Link
                to="/auth"
                className="font-display w-full text-center rounded-md border border-white/15 px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:text-white"
              >
                Create Identity
              </Link>
            </motion.div>
          </div>
          <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-white/40">
            ↓ scroll
          </div>
        </motion.section>

        {BEATS.map((beat, i) => (
          <Beat key={beat.id} beat={beat} index={i} />
        ))}

        <footer className="py-12 text-center text-xs uppercase tracking-widest text-white/20">
          Trails auto-expire · No trace left behind
        </footer>
      </main>
    </div>
  );
}
