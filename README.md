# Shadow Trails

**GPS anonymous social mapping platform** — drop temporary trails (notes + media) at real-world locations; nearby users discover them on a live dark-mode map. Trails auto-expire, leaving no permanent trace.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind v4 + Framer Motion + React Three Fiber |
| Maps | MapLibre GL (dark CARTO raster) |
| Backend | Node.js + Express + Socket.IO |
| Database | Turso (libSQL / SQLite) |
| Media | Cloudinary (signed, server-side) |
| Realtime | Socket.IO (viewport-box geo filter) |
| Auth | JWT + bcrypt |
| Hosting | Vercel (frontend) + Render/Railway (API) |

## Structure

```
client/   React app (pages, 3d/, hooks/, lib/)
server/   Express + Socket.IO API (routes, middleware?, models, socket, jobs)
```

## Local setup

```bash
# 1. env files
cp .env.example server/.env   # fill Turso/Cloudinary/JWT values
# client/.env                  # VITE_API_URL + VITE_MAPBOX_TOKEN

# 2. server
cd server && npm install && npm run init-db && npm run dev   # :5000

# 3. client
cd client && npm install && npm run dev                      # :5173
```

Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## API

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/health` | GET | — | Health check |
| `/api/auth/register` `login` | POST | — | JWT issue |
| `/api/upload/image` | POST | ✔ | Cloudinary upload (multipart `image`) |
| `/api/trails` | POST | ✔ | Create trail (`lat`, `lng`, `message`, `media_url`, `expires_in_hours` 1/6/24/72) |
| `/api/trails/nearby?lat&lng&radius` | GET | ✔ | Bounding-box + Haversine filtered trails ≤ 50 km |

**Socket.IO** — auth via `? token` handshake; emit `location:update {lat,lng,radius}`; receive `trail:new` when a trail drops in your viewport.

## Key design notes

- Trails expire via stored `expires_at` + hourly purge job (`server/src/jobs/cleanup.js`); every read filters expired rows.
- Nearby = bbox pre-filter in SQL + Haversine filter/sort in JS (SQLite has no geo index).
- Cloudinary uploads are server-side; the API secret never reaches the browser.

## Deployment

**Frontend (Vercel)** — repo root `vercel.json` points to `client`. Set `VITE_API_URL` + `VITE_MAPBOX_TOKEN` env vars in Vercel.

**API (Render)** — `render.yaml` in root; set the env vars marked `sync: false`. Render keeps the persistent WebSocket connection that serverless can't.

## Security checklist

- [x] `.env`, `.env.local`, `local.db` gitignored
- [x] Helmet, CORS (`CLIENT_URL`), rate limiting on auth/upload
- [x] Signed Cloudinary uploads, secrets server-only
- [ ] Rotate any key ever shared publicly before go-live
