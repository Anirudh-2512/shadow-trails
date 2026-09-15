import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.PROD ? '' : import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function useTrailSocket({ onNewTrail, onStatus, enabled }) {
  const socketRef = useRef(null);
  const handlerRef = useRef(onNewTrail);
  const statusRef = useRef(onStatus);
  handlerRef.current = onNewTrail;
  statusRef.current = onStatus;

  useEffect(() => {
    if (!enabled) return;
    const socket = io(API_URL, {
      auth: { token: localStorage.getItem('st_token') },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
    socketRef.current = socket;
    socket.on('trail:new', (trail) => handlerRef.current?.(trail));
    socket.on('connect', () => statusRef.current?.('connected'));
    socket.on('disconnect', () => statusRef.current?.('disconnected'));
    socket.io.on('reconnect_attempt', () => statusRef.current?.('reconnecting'));
    return () => socket.disconnect();
  }, [enabled]);

  return socketRef;
}
