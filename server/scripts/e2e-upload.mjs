import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { writeFileSync, unlinkSync } from 'node:fs';

const child = spawn('node', ['src/index.js'], { stdio: 'ignore' });
await sleep(2000);

const login = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'map_tester', password: 'password123' }),
}).then((r) => r.json());

if (!login.token) {
  console.error('LOGIN FAILED', login);
  process.exit(1);
}
console.log('LOGIN ok');

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);
writeFileSync('test.png', png);

const form = new FormData();
form.append('image', new Blob([png], { type: 'image/png' }), 'test.png');

const up = await fetch('http://localhost:5000/api/upload/image', {
  method: 'POST',
  headers: { Authorization: `Bearer ${login.token}` },
  body: form,
}).then((r) => r.json());

if (!up.url) {
  console.error('UPLOAD FAILED', up);
} else {
  console.log('UPLOAD ok', up.url);
}

const trail = await fetch('http://localhost:5000/api/trails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'trail with image', media_url: up.url, lat: 19.2, lng: 73.0, expires_in_hours: 24 }),
}).then((r) => r.json());
console.log('TRAIL', trail.id ? `created ${trail.id}` : JSON.stringify(trail));

unlinkSync('test.png');
process.exit(0);
