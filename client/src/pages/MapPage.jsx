import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import api from '../lib/api.js';
import useTrailSocket from '../hooks/useTrailSocket.js';
import { Link } from 'react-router-dom';
import { isWebGLAvailable } from '../lib/webgl.js';
import ZoomFx from '../components/ui/ZoomFx.jsx';
import { ImagePlus, X, RotateCcw } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function loadStyle() {
  if (MAPBOX_TOKEN) {
    return {
      version: 8,
      sources: {
        dark: {
          type: 'raster',
          tiles: [
            `https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/512/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
          ],
          tileSize: 512,
          maxzoom: 20,
          attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; OpenStreetMap contributors',
        },
      },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': '#050507' } },
        { id: 'streets', type: 'raster', source: 'dark', paint: { 'raster-opacity': 0.92, 'raster-fade-duration': 300 } },
      ],
    };
  }
  return {
    version: 8,
    sources: {},
    layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#050507' } }],
  };
}

export default function MapPage() {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const [trails, setTrails] = useState([]);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState(null); // {lat,lng}
  const [message, setMessage] = useState('');
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState(null);
  const [socketStatus, setSocketStatus] = useState('connected');
  const [photo, setPhoto] = useState(null); // { url, uploading, error }
  const fileInputRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const username = JSON.parse(localStorage.getItem('st_user') || '{}').username;
  const token = localStorage.getItem('st_token');

  const socketRef = useTrailSocket({
    enabled: !!token,
    onNewTrail: (trail) => {
      setTrails((prev) => (prev.some((t) => t.id === trail.id) ? prev : [trail, ...prev]));
      setToast(`New trail dropped by @${trail.username}`);
      setTimeout(() => setToast(null), 4000);
    },
    onStatus: setSocketStatus,
  });

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onMoveEnd = () => {
      const socket = socketRef.current;
      if (!socket?.connected) return;
      const c = map.getCenter();
      socket.emit('location:update', { lat: c.lat, lng: c.lng, radius: 50 });
    };
    map.on('moveend', onMoveEnd);
    return () => map.off('moveend', onMoveEnd);
  }, []);


  useEffect(() => {
    if (!isWebGLAvailable()) return;
    let map;
    map = new maplibregl.Map({
      container: containerRef.current,
      style: loadStyle(),
      center: [-14, 22],
      zoom: 2.3,
      pitch: 0,
      fadeDuration: 0,
    });
    // cinematic dive-in: orbit heights → street level
    map.once('load', () => {
      setTimeout(() => {
        map.easeTo({ center: [72.8777, 19.076], zoom: 11, duration: 4200, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }, 700);
      if (token) loadNearby(map.getCenter());
    });
    setMapReady(true);
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.GeolocateControl({ trackUserLocation: true }), 'top-right');

    map.on('click', (e) => {
      setDraft({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      map?.remove();
    };
  }, []);

  async function loadNearby(center) {
    try {
      const { data } = await api.get('/api/trails/nearby', {
        params: { lat: center.lat, lng: center.lng, radius: 50 },
      });
      setTrails(data.trails || []);
    } catch {
      setError('Failed to load trails');
    }
  }

  useEffect(() => {
    if (!token) return;
    const map = mapRef.current;
    if (!map) return;
    const onMoveEnd = () => loadNearby(map.getCenter());
    loadNearby(map.getCenter());
    map.on('moveend', onMoveEnd);
    return () => map.off('moveend', onMoveEnd);
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = trails.map((t) =>
      new maplibregl.Marker({ color: '#a855f7' })
        .setLngLat([t.lng, t.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 12 })
            .setHTML(
              `<div style="font-family:sans-serif;max-width:220px">
                 ${t.media_url ? `<img src="${t.media_url}" style="width:100%;border-radius:6px;margin-bottom:6px"/>` : ''}
                 <div style="color:#a855f7;font-weight:600;font-size:12px">@${t.username}</div>
                 <div style="color:#e5e7eb;font-size:14px">${t.message || ''}</div>
                 <div style="color:#6b7280;font-size:11px;margin-top:4px">expires ${t.expires_at}</div>
               </div>`
            )
        )
        .addTo(map)
    );
  }, [trails]);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhoto({ error: 'Only image files are allowed' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhoto({ error: 'Image must be under 10 MB' });
      return;
    }
    setPhoto({ uploading: true });
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/api/upload/image', form);
      setPhoto({ url: data.url });
    } catch (err) {
      setPhoto({ error: err.response?.data?.error || 'Upload failed' });
    }
  }

  function resetPhoto() {
    setPhoto(null);
  }

  async function dropTrail() {
    if (!draft) return;
    setPosting(true);
    setError('');
    try {
      await api.post('/api/trails', {
        message,
        media_url: photo?.url || undefined,
        lat: draft.lat,
        lng: draft.lng,
        expires_in_hours: 24,
      });
      setDraft(null);
      setMessage('');
      resetPhoto();
      loadNearby(mapRef.current.getCenter());
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to drop trail');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="relative h-screen w-full">
      {!isWebGLAvailable() && (
        <div className="absolute inset-0 flex items-center justify-center bg-void px-6 text-center">
          <div className="max-w-md rounded-xl border border-neon-orange/40 bg-smoke/90 p-8 backdrop-blur">
            <h1 className="font-display text-2xl uppercase tracking-widest text-white">
              WebGL unavailable
            </h1>
            <p className="mt-4 text-sm text-white/50">
              This Chrome can't run the 3D map. Try:{" "}
              <span className="text-neon-cyan">
                chrome://settings → System → "Use hardware acceleration" → Relaunch
              </span>
              , or use Edge/another browser. Your 3D city and map both need WebGL.
            </p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-screen w-full" />
      {!username && (
        <div className="absolute left-1/2 top-14 z-20 w-[85vw] max-w-xs -translate-x-1/2 rounded-md border border-neon-orange/40 bg-asphalt/90 px-4 py-2 text-center text-xs uppercase tracking-widest text-neon-orange backdrop-blur sm:left-1/2 sm:top-4 sm:w-auto sm:max-w-none sm:translate-x-[-50%]">
          <Link to="/auth">Sign in to drop trails →</Link>
        </div>
      )}
      {mapReady && <ZoomFx mapRef={mapRef} enabled={socketStatus !== ''} />}
      <div className="absolute bottom-6 left-4 right-4 z-[10] rounded-xl border border-white/10 bg-smoke/90 p-4 backdrop-blur sm:left-6 sm:right-auto sm:w-80">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm uppercase tracking-widest text-white">
            Drop a Trail
          </h2>
          <span className="text-[10px] uppercase tracking-widest text-white/40 sm:hidden">
            {trails.length} nearby
          </span>
        </div>
        {draft ? (
          <>
            <p className="mt-1 text-xs text-neon-cyan">
              {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="What's happening here?"
              className="mt-3 w-full resize-none rounded-md border border-white/10 bg-asphalt px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-neon-cyan"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />

            <div className="mt-3">
              {photo?.uploading ? (
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-asphalt px-3 py-2 text-xs text-white/50">
                  <ImagePlus size={14} className="animate-pulse text-neon-cyan" /> Uploading photo...
                </div>
              ) : photo?.error ? (
                <div className="flex items-center justify-between rounded-md border border-neon-orange/40 bg-asphalt px-3 py-2 text-xs text-neon-orange">
                  <span>{photo.error}</span>
                  <button onClick={resetPhoto} className="text-white/40 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ) : photo?.url ? (
                <div className="relative rounded-md border border-neon-purple/30 overflow-hidden">
                  <img src={photo.url} className="w-full h-28 object-cover" />
                  <button
                    onClick={resetPhoto}
                    className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white/80 hover:text-white"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!username}
                  className="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-white/20 bg-asphalt px-3 py-2.5 text-xs uppercase tracking-widest text-white/50 transition hover:border-neon-cyan hover:text-neon-cyan disabled:opacity-40"
                >
                  <ImagePlus size={14} /> Add Photo
                </button>
              )}
            </div>

            {error && <p className="text-xs text-neon-orange">{error}</p>}
            <div className="mt-3 flex gap-2">
              <button
                onClick={dropTrail}
                disabled={posting || !username}
                className="font-display flex-1 rounded-md bg-neon-purple py-2 text-xs font-semibold uppercase tracking-widest text-black disabled:opacity-40"
              >
                {posting ? '...' : 'Drop'}
              </button>
              <button
                onClick={() => {
                  setDraft(null);
                  resetPhoto();
                }}
                className="font-display rounded-md border border-white/15 px-3 py-2 text-xs uppercase tracking-widest text-white/60"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-white/40">Tap or click the map to place a trail.</p>
        )}
      </div>
      <div className="absolute bottom-6 right-6 z-10 hidden rounded-md border border-white/10 bg-smoke/90 px-3 py-2 text-[10px] uppercase tracking-widest text-white/40 backdrop-blur sm:block">
        {trails.length} trails nearby
      </div>
      <div className="absolute top-4 right-14 z-[10] rounded-md border border-white/10 bg-smoke/80 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-white/60 backdrop-blur">
        <span
          className={`mr-2 inline-block h-2 w-2 rounded-full ${
            socketStatus === 'connected'
              ? 'bg-neon-cyan'
              : socketStatus === 'reconnecting'
                ? 'bg-neon-orange animate-pulse'
                : 'bg-white/30'
          }`}
        />
        {socketStatus === 'connected' ? 'Live' : socketStatus}
      </div>
      {toast && (
        <div className="absolute left-1/2 top-14 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-neon-cyan/40 bg-asphalt/90 px-4 py-2 text-xs uppercase tracking-widest text-neon-cyan backdrop-blur sm:top-4">
          {toast}
        </div>
      )}
    </div>
  );
}
