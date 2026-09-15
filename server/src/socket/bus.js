let broadcastFn = null;

export function setBroadcast(fn) {
  broadcastFn = fn;
}

export function broadcastTrail(trail) {
  if (broadcastFn) broadcastFn(trail);
}
