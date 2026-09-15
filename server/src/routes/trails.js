import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../models/db.js';
import { requireAuth } from '../middleware/auth.js';
import { broadcastTrail } from '../socket/bus.js';

const router = Router();

const DURATIONS = { 1: 1, 6: 6, 24: 24, 72: 72 };

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { message, media_url, lat, lng, expires_in_hours } = req.body || {};
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum) || Math.abs(latNum) > 90 || Math.abs(lngNum) > 180) {
      return res.status(400).json({ error: 'Valid lat/lng required' });
    }
    const hours = DURATIONS[expires_in_hours] || 24;
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const id = randomUUID();
    await db.execute({
      sql: `INSERT INTO trails (id, user_id, message, media_url, lat, lng, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        req.user.sub,
        (typeof message === 'string' ? message : '').slice(0, 280) || null,
        media_url || null,
        latNum,
        lngNum,
        expiresAt,
      ],
    });
    res.status(201).json({ id, expires_in_hours: hours });
    broadcastTrail({
      id,
      message: (typeof message === 'string' ? message : '').slice(0, 280) || null,
      media_url: media_url || null,
      lat: latNum,
      lng: lngNum,
      expires_at: expiresAt,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      username: req.user.username,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/nearby', requireAuth, async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'Valid lat/lng query params required' });
    }
    const radiusKm = Math.min(Math.max(parseFloat(req.query.radius) || 5, 0.1), 50);
    const dLat = (radiusKm * 1000) / 111320;
    const dLng = dLat / Math.max(Math.cos((lat * Math.PI) / 180), 0.01);

    const result = await db.execute({
      sql: `SELECT t.id, t.user_id, t.message, t.media_url, t.lat, t.lng,
                   t.expires_at, t.created_at, u.username
            FROM trails t
            JOIN users u ON u.id = t.user_id
            WHERE t.expires_at > datetime('now')
              AND t.lat BETWEEN ? AND ?
              AND t.lng BETWEEN ? AND ?`,
      args: [lat - dLat, lat + dLat, lng - dLng, lng + dLng],
    });

    const trails = result.rows
      .map((r) => {
        const distance = 6371 * 2 * Math.asin(
          Math.sqrt(
            Math.sin(((lat - r.lat) * Math.PI) / 360) ** 2 +
              Math.cos((lat * Math.PI) / 180) *
                Math.cos((r.lat * Math.PI) / 180) *
                Math.sin(((lng - r.lng) * Math.PI) / 360) ** 2
          )
        );
        return { ...r, distance_km: Number(distance.toFixed(3)) };
      })
      .filter((t) => t.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);

    res.json({ trails });
  } catch (err) {
    next(err);
  }
});

export default router;
