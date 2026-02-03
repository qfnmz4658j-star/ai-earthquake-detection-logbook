# Deployment Guide — Share Your App

To share the app with others via Facebook Messenger or any platform, deploy it to a free hosting service.

## Option 1: Railway (Easiest)
1. Go to https://railway.app
2. Sign up with GitHub
3. Create a new project → Deploy from GitHub
4. Select this repo and deploy
5. Railway automatically assigns a public URL (e.g., `https://your-app-12345.railway.app`)
6. Share that URL in Messenger

## Option 2: Vercel (for static build)
1. Go to https://vercel.com
2. Import your GitHub repo
3. Deploy
4. Get a public URL automatically

## Option 3: Heroku (Legacy, may require payment)
1. Go to https://heroku.com
2. Create a new app
3. Deploy from GitHub or using CLI
4. Get a public dyno URL

## For Local Testing on Your Phone
While developing, you can use:
- **ngrok**: `npx ngrok@latest http 3000` (requires free account at ngrok.com)
- **Tunnel to WiFi**: If on same network, use your Mac's IP (e.g., `http://192.168.1.X:3000`)

## Environment Variables (if needed)
Copy `.env.example` to `.env` and adjust:
```
PORT=3000
CACHE_TTL=300
USGS_FEED=https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
```

## Current Local Status
- Server: http://localhost:3000
- Client: Built and deployed to `server/public`

Once deployed, share the public URL (e.g., `https://xxx.railway.app`) in Messenger and your friends can open it on any device.
