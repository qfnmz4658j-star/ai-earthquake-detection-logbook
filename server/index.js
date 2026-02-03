const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory cache
let cache = { data: null, expires: 0 };
const TTL = parseInt(process.env.CACHE_TTL || '300', 10) * 1000;

async function fetchUSGS() {
  const url = process.env.USGS_FEED || 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
  const res = await axios.get(url, { timeout: 10000 });
  return res.data;
}

function normalize(geojson) {
  if (!geojson || !geojson.features) return [];
  return geojson.features.map(f => {
    const props = f.properties || {};
    const coords = (f.geometry && f.geometry.coordinates) || [];
    return {
      id: f.id || props.code || `${coords[0]}-${coords[1]}-${props.time}`,
      mag: props.mag,
      depth_km: coords[2],
      time: new Date(props.time).toISOString(),
      lat: coords[1],
      lon: coords[0],
      place: props.place || props.title || '',
      source: 'usgs'
    };
  });
}

app.get('/api/earthquakes', async (req, res) => {
  try {
    const now = Date.now();
    const force = req.query.refresh === 'true' || req.query.force === 'true';
    if (!force && cache.data && cache.expires > now) {
      return res.json({ source: 'cache', cachedUntil: cache.expires, data: cache.data });
    }
    const raw = await fetchUSGS();
    const data = normalize(raw);
    cache = { data, expires: Date.now() + TTL };
    res.json({ source: 'usgs', cachedUntil: cache.expires, data });
  } catch (err) {
    console.error('error fetching feed', err && err.message);
    if (cache.data) {
      // return stale cache if available
      return res.json({ source: 'cache-stale', cachedUntil: cache.expires, data: cache.data });
    }
    res.status(500).json({ error: 'failed to fetch feed' });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', cachedUntil: cache.expires });
});

app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
