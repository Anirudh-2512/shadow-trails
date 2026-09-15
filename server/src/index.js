import 'dotenv/config';
import http from 'node:http';
import app from './app.js';
import { initSocket } from './socket/index.js';
import { setBroadcast } from './socket/bus.js';
import { startTrailCleanup } from './jobs/cleanup.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

if (process.env.ENABLE_SOCKET !== 'false') {
  const io = initSocket(server);
  setBroadcast(io.broadcastTrail);
}
startTrailCleanup();

server.listen(PORT, () => {
  console.log(`Shadow Trails API listening on http://localhost:${PORT}`);
});
