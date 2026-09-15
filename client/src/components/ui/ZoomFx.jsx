import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CAPTIONS = [
  { max: 3, title: 'ORBIT', sub: 'SCANNING THE CITY FROM ABOVE' },
  { max: 5, title: 'HIGH VANTAGE', sub: 'DIVE WHEN READY' },
  { max: 8, title: 'STREET SWEEP', sub: 'SIGNATURES NEARBY' },
  { max: 12, title: 'INSIDE THE GRID', sub: 'EVERY TRAIL COUNTS' },
  { max: 99, title: 'ON THE GROUND', sub: 'DROP. WATCH IT FADE.' },
];

function captionFor(zoom) {
  return CAPTIONS.find((c) => zoom < c.max);
}

export default function ZoomFx({ mapRef, enabled = true }) {
  const [kinetic, setKinetic] = useState(false);
  const [caption, setCaption] = useState(null);
  const [pulseKey, setPulseKey] = useState(0);
  const timerRef = useRef(null);
  const lastZoom = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const map = mapRef.current;
    if (!map) return;

    const showCaption = () => {
      const z = map.getZoom();
      const c = captionFor(z);
      if (c) setCaption(c);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCaption(null), 2600);
    };

    let lastBand = -1;
    const onZoomStart = () => {
      setKinetic(true);
      showCaption();
    };
    const onZoomEnd = () => {
      setKinetic(false);
      const band = captionFor(map.getZoom())?.title;
      if (band !== lastBand) {
        lastBand = band;
        setPulseKey((k) => k + 1);
      }
    };
    const onMoveStart = () => setKinetic(true);
    const onMoveEnd = () => setKinetic(false);

    map.on('zoomstart', onZoomStart);
    map.on('zoomend', onZoomEnd);
    map.on('movestart', () => setKinetic(true));
    map.on('moveend', () => setKinetic(false));

    return () => {
      clearTimeout(timerRef.current);
      map.off('zoomstart', onZoomStart);
      map.off('zoomend', onZoomEnd);
    };
  }, [enabled]);

  return (
    <>
      {/* vignette — intensifies while moving, like a cinematic lens */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[5]"
        animate={{
          boxShadow: `inset 0 0 ${kinetic ? 220 : 140}px ${kinetic ? 90 : 50}px rgba(0,0,0,0.${kinetic ? 9 : 75})`,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      {/* speed blur edges while moving */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[5]"
        animate={{ opacity: kinetic ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(168,85,247,0.10) 100%)',
        }}
      />

      {/* scanlines + grain */}
      <div
        className="pointer-events-none absolute inset-0 z-[5] opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)',
        }}
      />

      {/* superhero zoom caption */}
      <AnimatePresence>
        {caption && (
          <motion.div
            key={caption.title}
            initial={{ opacity: 0, x: -60, skewX: -12 }}
            animate={{ opacity: 1, x: 0, skewX: 0 }}
            exit={{ opacity: 0, x: 40, skewX: 12, scale: 1.08 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute left-4 top-[21%] z-[15] select-none sm:left-8"
          >
            <h2 className="font-display text-4xl uppercase tracking-wider text-white drop-shadow-[0_0_18px_rgba(168,85,247,0.8)] sm:text-7xl">
              {caption.title}
            </h2>
            <div className="mt-1 h-[2px] w-40 bg-gradient-to-r from-neon-purple to-neon-cyan" />
            <p className="mt-2 font-display text-xs uppercase tracking-[0.35em] text-neon-cyan/80 sm:text-sm">
              {caption.sub}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* zoom pulse rings */}
      <AnimatePresence>
        {pulseKey > 0 && (
          <motion.div
            key={pulseKey}
            initial={{ opacity: 0.7, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.4 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="pointer-events-none"
            className="pointer-events-none absolute left-1/2 top-1/2 z-[6] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neon-cyan"
          />
        )}
      </AnimatePresence>
    </>
  );
}
