import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Missing token'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join('trail:updates');

    socket.on('location:update', ({ lat, lng, radius }) => {
      const box = { lat: Number(lat), lng: Number(lng), radius: Number(radius) || 5 };
      socket.data.locationBox = box;
    });

    socket.on('disconnect', () => {});
  });

  io.broadcastTrail = (trail) => {
    for (const [, s] of io.of('/').sockets) {
      const box = s.data.locationBox;
      if (!box) continue;
      const dLat = (box.radius * 1000) / 111320;
      const dLng = dLat / Math.max(Math.cos((box.lat * Math.PI) / 180), 0.01);
      if (
        trail.lat >= box.lat - dLat &&
        trail.lat <= box.lat + dLat &&
        trail.lng >= box.lng - dLng &&
        trail.lng <= box.lng + dLng
      ) {
        s.emit('trail:new', trail);
      }
    }
  };

  return io;
}
