import { useEffect, useState } from 'react';

export default function WebGlLostNotice() {
  const [lost, setLost] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault?.();
      setLost(true);
    };
    document.addEventListener('webglcontextlost', handler, true);
    return () => document.removeEventListener('webglcontextlost', handler);
  }, []);

  if (!lost) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur"
      style={{ pointerEvents: 'none' }}
    >
      <div className="rounded-xl border border-neon-orange/50 bg-smoke p-8 text-center">
        <h1 className="font-display text-2xl uppercase tracking-widest text-white">
          Graphics context lost
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/60">
          Your GPU/driver dropped WebGL. Reopen the site in a fresh tab, or enable hardware
          acceleration in browser settings.
        </p>
      </div>
    </div>
  );
}
