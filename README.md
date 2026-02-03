# AI Earthquake Detection — Philippines

A real-time interactive web app that displays earthquake events on a map centered on the Philippines. Live data from the USGS GeoJSON feed.

**Live Demo:** (Will be available after deployment to Railway)

## Features

✅ **Live Earthquake Map**
- Interactive slippy map centered on the Philippines (Leaflet.js)
- Clustered markers for dense event areas
- Circle size represents magnitude; color represents depth
- Click markers for detailed event info (magnitude, depth, location, time)

✅ **Real-Time Data**
- Proxies live USGS earthquake feed (past 24 hours, ~258 events/day)
- Server-side caching (5-minute TTL, configurable)
- Client polls every 60 seconds; "Refresh now" button bypasses cache
- "Last updated" timestamp visible in right panel

✅ **Interactive Filters**
- **Min Magnitude** slider to filter by minimum magnitude
- **Max Depth** filter to show only shallow/intermediate/deep earthquakes
- Real-time map and event count updates
- Client-side filtering (fast for current dataset sizes)

✅ **Legend & Styling**
- Color-coded depth legend:
  - **Red** (≤70 km): Shallow
  - **Orange** (70–300 km): Intermediate
  - **Blue** (>300 km): Deep
- Responsive layout: map on left, control panel on right
- Event list shows time, location, magnitude, and depth

✅ **Production-Ready**
- Node.js/Express backend with static file serving
- React + TypeScript frontend with Vite
- Deployable to Railway, Vercel, or Heroku (see [DEPLOYMENT.md](DEPLOYMENT.md))

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  User Browser (React + Leaflet)                     │
│  - Interactive map, clustering, filters             │
│  - Polls /api/earthquakes every 60s                │
└─────────────┬───────────────────────────────────────┘
              │ HTTP/HTTPS
              ▼
┌─────────────────────────────────────────────────────┐
│  Express Server (Node.js)                           │
│  - GET /api/earthquakes  → Proxy USGS + normalize   │
│  - GET /api/status       → Cache info & health      │
│  - Serves static files (React build)                │
│  - 5-minute server-side cache (configurable)        │
└─────────────┬───────────────────────────────────────┘
              │ HTTPS
              ▼
         USGS GeoJSON Feed
   (earthquake.usgs.gov/earthquakes/...)
```

### Data Flow

1. **User opens app** → Browser loads React app from Express
2. **React mounts** → Calls `GET /api/earthquakes`
3. **Server fetches** → Hits USGS feed (or returns cached data)
4. **Data normalized** → Standardized to `{ id, mag, depth_km, time, lat, lon, place, source }`
5. **Client renders** → Markers clustered, colored by depth, sized by magnitude
6. **Client polls** → Every 60 seconds (or click "Refresh now" to bypass cache)

### Data Accuracy

✅ **Live & Accurate**: App uses official USGS earthquake feed (updated continuously by USGS)
✅ **Recent**: Shows earthquakes from the past 24 hours (~250–300 events/day globally)
✅ **Verified**: USGS is the authoritative source for earthquake data

---

## Setup & Installation

### Prerequisites

- **Node.js v20+** (LTS recommended)  
- **npm** v11+  
- **Git**

### 1. Clone or download the repo

```bash
git clone https://github.com/qfnmz4658j-star/ai-earthquake-detection.git
cd "AI Earthquake Detection"
```

### 2. Install dependencies

```bash
npm install
npm run install-all
```

This installs:
- Root dev tools (`concurrently`)
- Server dependencies (`express`, `axios`)
- Client dependencies (`react`, `leaflet`, `leaflet.markercluster`, `vite`, `typescript`)

### 3. Run locally

**Development mode** (Vite dev server + nodemon):
```bash
npm run dev
```

Then open http://localhost:5173 (Vite client) or http://localhost:3000 (Express server).

**Production build:**
```bash
npm run build
npm run start
```

Open http://localhost:3000

---

## Project Structure

```
ai-earthquake-detection/
├── README.md                          # This file
├── DEPLOYMENT.md                      # Deploy to Railway/Vercel/Heroku
├── Procfile                           # Heroku/Railway entry point
├── package.json                       # Root scripts
├── .gitignore                         # Git ignore rules
│
├── server/
│   ├── package.json                   # Server dependencies
│   ├── index.js                       # Express server + API
│   ├── .env.example                   # Environment variables template
│   ├── public/                        # Served static files (React build)
│   └── node_modules/
│
└── client/
    ├── package.json                   # Client dependencies
    ├── index.html                     # HTML entry
    ├── vite.config.ts                 # Vite config (proxy to /api → :3000)
    ├── tsconfig.json                  # TypeScript config
    ├── src/
    │   ├── main.tsx                   # React entry point
    │   ├── App.tsx                    # Main app (map, filters, panel)
    │   ├── styles.css                 # Styles
    │   └── ...
    ├── dist/                          # Built files (after `npm run build`)
    └── node_modules/
```

---

## API Endpoints

### `GET /api/earthquakes`

Fetch earthquake events with optional cache bypass.

**Query Parameters:**
- `refresh=true` — Bypass server cache and fetch live data

**Response:**
```json
{
  "source": "usgs" | "cache" | "cache-stale",
  "cachedUntil": 1770121366134,
  "data": [
    {
      "id": "tx2026cjmujd",
      "mag": 1.4,
      "depth_km": 3.9275,
      "time": "2026-02-03T11:58:40.127Z",
      "lat": 31.896,
      "lon": -101.757,
      "place": "26 km S of Stanton, Texas",
      "source": "usgs"
    },
    ...
  ]
}
```

### `GET /api/status`

Check server health and cache expiry.

**Response:**
```json
{
  "status": "ok",
  "cachedUntil": 1770121366134
}
```

---

## Environment Variables

Create a `.env` file in the `server/` directory (see `.env.example`):

```
PORT=3000
CACHE_TTL=300
USGS_FEED=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
```

- **PORT**: Express server port (default: 3000)
- **CACHE_TTL**: Server cache time-to-live in seconds (default: 300 = 5 min)
- **USGS_FEED**: USGS feed URL (default: all earthquakes from past 24 hours)

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guides to deploy to:

- **Railway** (recommended, free tier, instant deploys)
- **Vercel** (for static builds)
- **Heroku** (legacy, may require payment)

Quick Railway deploy:
1. Push code to GitHub
2. Go to https://railway.app
3. Import this GitHub repo
4. Click "Deploy"
5. Railway assigns a public URL (e.g., `https://ai-earthquake-detection-production.up.railway.app`)

---

## Features & Future Enhancements

### Current
- ✅ Live earthquake map (Leaflet + clustering)
- ✅ Real-time USGS data
- ✅ Interactive filters (magnitude, depth)
- ✅ Responsive layout
- ✅ Cache management & refresh button
- ✅ Deployable to cloud

### Planned
- 📋 Date-range filtering
- 📋 Slider controls (magnitude, depth)
- 📋 Nearest-city lookup
- 📋 Server-side filtering for efficiency
- 📋 WebSocket/Server-Sent Events for real-time updates
- 📋 ML classifier for noise vs. seismic events
- 📋 Mobile app (React Native)

---

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (bundler)
- Leaflet.js (map)
- leaflet.markercluster (clustering)
- Axios (HTTP client)

**Backend:**
- Node.js (v20+)
- Express.js (HTTP server)
- Axios (HTTP client)
- Nodemon (dev auto-reload)

**DevOps:**
- npm workspaces (monorepo)
- Concurrently (run multiple processes)
- Procfile (deployment)

**Data:**
- USGS GeoJSON feed (earthquake data)

---

## Local Development Workflow

### Edit code and see live changes

**Option 1: Development mode (with hot reload)**
```bash
npm run dev
```
Opens Vite dev server on port 5173 (hot module replacement) + Express on port 3000.

**Option 2: Production mode (static build)**
```bash
npm run build
npm run start
```
Bundles React, serves from Express on port 3000.

### Rebuild client only
```bash
npm run build --prefix client
```

### Restart server
```bash
npm run start --prefix server
```

---

## Testing

### Manual Testing

1. **Open map**: http://localhost:3000 (or deployed URL)
2. **Verify data loads**: Should show 200–300 earthquake markers
3. **Test filters**: Adjust min magnitude or max depth
4. **Test refresh**: Click "Refresh now" and watch event count update
5. **Test marker cluster**: Zoom in/out, click clusters

### API Testing

```bash
# Fetch live data (bypasses cache)
curl 'http://localhost:3000/api/earthquakes?refresh=true' | jq

# Check server status
curl 'http://localhost:3000/api/status' | jq

# Count events
curl 'http://localhost:3000/api/earthquakes' | jq '.data | length'
```

---

## Troubleshooting

### "Site couldn't be reached" on phone
- You're using `localhost:3000` which only works on your computer
- Deploy to Railway/Vercel (see [DEPLOYMENT.md](DEPLOYMENT.md)) to get a shareable public URL

### Map is blank or tiles not loading
- Hard-refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Check browser console for errors: F12 → Console tab
- Ensure `leaflet/dist/leaflet.css` is imported in `client/src/main.tsx`

### Events not showing
- Click "Refresh now" to fetch fresh data
- Check `/api/earthquakes` endpoint: `curl http://localhost:3000/api/earthquakes | jq '.data | length'`
- Verify USGS feed is accessible: `curl 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson' | jq '.metadata.count'`

### Server won't start
- Check port 3000 is not in use: `lsof -iTCP:3000`
- Kill existing process: `kill -9 <PID>`
- Reinstall deps: `rm -rf server/node_modules && npm install --prefix server`

---

## Contributing

Found a bug or have a feature idea? 
- Open an issue on GitHub
- Submit a pull request

---

## License

MIT (free to use, modify, share)

---

## Contact & Support

- **GitHub**: https://github.com/qfnmz4658j-star/ai-earthquake-detection
- **Questions**: Open an issue or contact the maintainer

---

## Data Sources

- **Earthquakes**: [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)
- **Map**: [OpenStreetMap](https://openstreetmap.org)

---

**Last Updated**: February 3, 2026
