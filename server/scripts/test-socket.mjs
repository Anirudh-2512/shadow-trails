import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

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

// dynamic import socket.io-client (server/node_modules)
const { io } = await import('socket.io-client');
const socket = io('http://localhost:5000', { auth: { token: login.token } });

socket.on('connect', () => console.log('SOCKET connected id=' + socket.id));
socket.on('connect_error', (e) => console.error('SOCKET ERR', e.message));
socket.on('trail:new', (t) => {
  console.log('BROADCAST received trail:', t.message);
  kill();
});
socket.on('close', kill);

function kill() {
  child.kill();
  process.exit(0);
}

await sleep(1500);
socket.emit('location:update', { lat: 19.1, lng: 72.9, radius: 50 });

await fetch('http://localhost:5000/api/trails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'socket broadcast test', lat: 19.11, lng: 72.92, expires_in_hours: 1 }),
}) .then(async r => console.log('TRAIL POST', r.status, await r.text()));
console.log('TRAIL created, waiting for broadcast...');
