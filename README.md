## How this prototype works

- `server` runs a small Express server with endpoints:
  - `/api/earthquakes` — proxies the USGS GeoJSON feed and normalizes events.
  - `/api/status` — simple health check and cache info.
- `client` is a Vite + React app that fetches `/api/earthquakes` and displays events on a Leaflet map centered on the Philippines (lat 12.0, lon 122.0).

Run locally:

```bash
# from the project root
npm run install-all
npm run dev
```

Client dev server: http://localhost:5173
Server: http://localhost:3000

Files to review:
- Server: [server/index.js](server/index.js)
- Client: [client/src/App.tsx](client/src/App.tsx)
# AI Earthquake Detection — Prototype

This is a small full-stack prototype showing recent earthquakes on a map centered on the Philippines.

Run locally (instructions below).
