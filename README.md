# Shadow Trails

**GPS anonymous social mapping platform** — drop temporary trails (notes + media) at real-world locations; nearby users discover them on a live dark-mode map. Trails auto-expire, leaving no permanent trace.

🌐 **Live**: https://shadowtrail-anirudh-anirudh-2512s-projects.vercel.app

---

## The Theory of the Project

### 1. The core idea — *presence is the algorithm*

Every social platform today ranks content by engagement: likes, follows, watch-time. Shadow Trails removes all of that. There is no feed, no follower count, no popularity ranking — **the only ranking variable is physical proximity**.

A trail exists at one fixed point on Earth. You can see it if, and only if, you are physically close enough. When you walk away, it disappears from your world. Nobody with a link in Mumbai can read something dropped in Tokyo. This makes the platform *geographically honest* — what you see is what surrounds you, not what an algorithm picked for you.

### 2. Ephemeral by design — *data is a liability*

Most platforms retain every post forever, because data is their business model. Shadow Trails takes the opposite stance: **permanence causes clutter, surveillance risk, and social anxiety** (people post to feeds as if writing a permanent résumé).

Every trail carries a mandatory `expires_at` timestamp — it lives for hours, not years. Expiry is enforced at three layers:

1. Every read query filters `expires_at > now` (so an expired trail can never be displayed or found);
2. A background cleanup job **deletes the row entirely** once it expires — no archive, no backups;
3. Nothing identifies you beyond a chosen username; no email, phone, or real name is ever collected.

**The result:** content behaves like a whisper in a city street — discoverable in the moment, then gone.

### 3. Anonymity with accountability — *the identity spectrum*

Fully anonymous platforms (4chan-style) drift into chaos; fully identified platforms (real-name policy) kill creativity and confession. Shadow Trails runs on a **middle theory**:

- You create an *identity* — a self-chosen username + password. Nothing else.
- Two identities can interact repeatedly without knowing each other's offline persona.
- Abuse is traceable per-account (rate limits, bans possible) but *not* personally identifiable — you can start a new identity when you want a new reputation.

This mirrors how people behave in a night city: you might become a "regular" somewhere — a face folk recognize — while remaining anonymous to the street.

### 4. Media grounded in reality — *the world becomes the interface*

A trail is not an abstract card in a grid; it is **physically pinned to real coordinates**. The design theory here borrows from *situated media* (like Geocaching, Pokémon GO, and classic Dead Drops): information gains meaning from being experienced *in the place it was created*.

Reading a confession in the metro station it was written in is a fundamentally different experience from reading it at home. Shadow Trails tries to preserve that emotional layer: the content and the geography are inseparable.

### 5. Why anonymity + media + place + decay matters together

| Ingredient | Alone | Combined |
|---|---|---|
| Anonymity | Trolling risk | Freedom to be honest |
| Location pinning | Privacy risk | Relevance & emotional grounding |
| Auto-expiry |Weak archival value | Safety + a "what's happening NOW" feel |
| Photos/media | Doxxing risk | Proof-of-moment storytelling |

Together they create a space where **a confession after a storm, a warning about a bad route, or a memory of a rooftop sunset** can exist without becoming permanent online baggage.

### 6. The user journey (as designed in the UI philosophy)

The landing page is itself a storytelling essay, walking through the theory as a narrative:

1. **3D neon city hero** — you "arrive" as a night-city character (GTA-style cinematic).
2. ***"You are never alone in the city"* — the emotional hook.**
3. **"Drop a trail"** — an animated map-tile city where a pin springs down: content belongs to places, not feeds.
4. **F1 launch sequence** — 5 start lights, rev-counter, 0→340 km/h telemetry ramp, sector captions: *Formation lap → Sector 1 → 2 → 3 → Final lap* — the platform as a race against algorithmic loneliness.
5. **"Discover what lingers"** — a proximity radar sweeps; anonymous blips pulse. Only nearby operators see you.
6. **"Then it fades"** — the expiry clock drains and stamps *EXPIRED · GONE*: honesty about impermanence.
7. **"Pit exit — Enter the map"** — into the live experience.

### 7. Design language — *cinematic, not corporate*

Dark night city, neon purple/cyan/orange on near-black, film-grain scanlines, chromatic vignette, bold condensed display type (Oswald), and playful analog motifs (F1 telemetry, GTA-ish drifting camera, street-mapping cartography). The theory of the app — *presence, traces, decay* — is literally reflected in the visual system: everything glows briefly, then dissolves into grain.

---

## Concept of the Website

A **GPS-powered anonymous social map** where the world itself is the canvas:

- **Drop a trail**: click anywhere on the map → pin appears → write up to 280 characters, optionally attach a photo (signed Cloudinary upload), and choose a 24-hour expiry. That trail is anchored in Turso with `lat`, `lng`, `expires_at`.
- **Explore**: a MapLibre dark map renders active trails as neon markers with popups (photo + message + expiry). Pan/zoom = "nearby" recomputes.
- **Search radius up to 50 km**, sorted by distance (Haversine) after a spatial bounding-box pre-filter.
- **Realtime** (with a socket-capable host): drops inside your viewport announce themselves instantly over Socket.IO.
- **Privacy**: no email, phone, or real name — ever. The account *is* the username.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind v4 + Framer Motion + React Three Fiber |
| Maps | MapLibre GL + Mapbox dark raster tiles |
| Backend | Node.js + Express + Socket.IO |
| Database | Turso (libSQL / SQLite) |
| Media | Cloudinary (signed, server-side) |
| Realtime | Socket.IO (viewport-box geo filter; REST-mode on serverless) |
| Auth | JWT + bcrypt |
| Hosting | Vercel (single-link deploy; frontend hosts a REST API proxy) |

## Structure

```
client/                 React app (pages, 3d/, hooks/, lib/, api proxy+)
  api/index.js          /api reverse-proxy function (Vercel static → backend)
server/                 Express + Socket.IO API (routes, models, socket, jobs)
api-on-render-if-socket you want live sockets: deploy via Render/Railway and set ENABLE_SOCKET=true
```

## API

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/health` | GET | — | Liveness ping |
| `/api/auth/register` `login` | POST | — | JWT issue |
| `/api/upload/image` | POST | ✔ | Cloudinary multipart upload |
| `/api/trails` | POST | ✔ | Create trail |
| `/api/trails/nearby?lat&lng&radius` | GET | ✔ | Bounding box + Haversine trails |

**Socket.IO** — auth via handshake token; emit `location:update {lat,lng,radius}`; receive `trail:new` for trails inside your viewport.

## Local setup

```bash
# server
cd server && npm install && npm run init-db && npm run dev   # :5000

# frontend
cd client && npm install && npm run dev                      # :5173
```

Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## Security checklist

- [x] `.env`, `.env.local`, `local.db` gitignored
- [x] Helmet, CORS (`CLIENT_URL` list), rate limiting on auth/upload
- [x] Signed Cloudinary uploads (secret server-only)
- [x] Deployment protection bypass turned off, no secrets in code
- [ ] Rotate any credentials ever shared publicly before commercial launch

## Deployment summary

- Fronend: Vercel project `shadowtrail-anirudh` (single-link frontend + API proxy)
- API: Vercel project `shadowtrail-anirudh-api` (REST mode; sockets off)
- Database: Turso (`shadowtrail-annii-777`), schema includes `users` and `trails`
