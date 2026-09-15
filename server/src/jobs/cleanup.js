import { db } from '../models/db.js';

export function startTrailCleanup(intervalMs = 60 * 60 * 1000) {
  const purge = async () => {
    try {
      await db.execute(`DELETE FROM trails WHERE expires_at < datetime('now')`);
    } catch (e) {
      console.error('Trail purge failed:', e.message);
    }
  };
  purge();
  const timer = setInterval(purge, intervalMs);
  timer.unref?.();
  return timer;
}
