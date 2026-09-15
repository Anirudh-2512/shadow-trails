import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { db } from '../models/db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

router.post('/register', async (req, res, next) => {
  try {
    const username = (req.body?.username || '').trim();
    const password = req.body?.password || '';
    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 chars (letters, numbers, _)' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const id = randomUUID();
    try {
      await db.execute({
        sql: 'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
        args: [id, username, passwordHash],
      });
    } catch (e) {
      if (String(e).includes('UNIQUE')) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      throw e;
    }
    const token = signToken({ id, username });
    res.status(201).json({ token, user: { id, username } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const username = (req.body?.username || '').trim();
    const password = req.body?.password || '';
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const result = await db.execute({
      sql: 'SELECT id, username, password_hash FROM users WHERE username = ?',
      args: [username],
    });
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken(user);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    next(err);
  }
});

export default router;
