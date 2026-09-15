import 'dotenv/config';
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  const users = await db.execute(`SELECT id, username FROM users LIMIT 1`);
  const u = users.rows[0];
  if (!u) {
    console.log('no users');
    process.exit(0);
  }
  console.log('inserting trail for user', u.username);
  await db.execute({
    sql: `INSERT INTO trails (id, user_id, message, media_url, lat, lng, expires_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))`,
    args: [crypto.randomUUID(), u.id, 'x', null, 19.0, 72.0, '+24 hours'],
  });
  console.log('insert ok');
} catch (e) {
  console.error('ERR', e.message);
}
process.exit(0);

