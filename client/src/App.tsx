import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet.markercluster'
import axios from 'axios'

const PH_CENTER = [12.0, 122.0]

function depthColor(depth: number | undefined) {
  if (depth === undefined || depth === null) return '#999'
  if (depth <= 70) return '#e53935'
  if (depth <= 300) return '#fb8c00'
  return '#1e88e5'
}

export default function App() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletMap = useRef<L.Map | null>(null)
  const clusterGroup = useRef<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [minMag, setMinMag] = useState<number>(0)
  const [maxDepth, setMaxDepth] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return
    leafletMap.current = L.map(mapRef.current).setView(PH_CENTER as any, 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(leafletMap.current)
    // prepare cluster group
    // @ts-ignore
    clusterGroup.current = (L as any).markerClusterGroup()
    clusterGroup.current.addTo(leafletMap.current)
    return () => leafletMap.current && leafletMap.current.remove()
  }, [])

  async function fetchEvents(options: { refresh?: boolean } = {}) {
    try {
      setLoading(true)
      const url = options.refresh ? '/api/earthquakes?refresh=true' : '/api/earthquakes'
      const res = await axios.get(url)
      const data = res.data.data || []
      setEvents(data)
      setLastUpdated(new Date().toISOString())
      setLoading(false)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    const iv = setInterval(() => fetchEvents(), 60_000)
    return () => clearInterval(iv)
  }, [])

  // client-side filtering
  useEffect(() => {
    const out = events.filter(ev => {
      if (typeof ev.mag === 'number' && ev.mag < minMag) return false
      if (typeof maxDepth === 'number' && typeof ev.depth_km === 'number' && ev.depth_km > maxDepth) return false
      return true
    })
    setFiltered(out)
  }, [events, minMag, maxDepth])

  // render markers into cluster group
  useEffect(() => {
    if (!leafletMap.current || !clusterGroup.current) return
    const map = leafletMap.current
    const cg = clusterGroup.current
    cg.clearLayers()
    filtered.forEach(ev => {
      if (typeof ev.lat !== 'number' || typeof ev.lon !== 'number') return
      const color = depthColor(ev.depth_km)
      const r = Math.max(6, (ev.mag || 1) * 6)
      const marker = L.circleMarker([ev.lat, ev.lon], {
        radius: r,
        color: '#333',
        weight: 1,
        fillColor: color,
        fillOpacity: 0.8
      })
      const time = ev.time
      marker.bindPopup(`<b>${ev.place}</b><br/>Mag: ${ev.mag}<br/>Depth: ${ev.depth_km} km<br/>Time: ${time}`)
      cg.addLayer(marker)
    })
    return () => { /* clusterGroup persists */ }
  }, [filtered])

  return (
    <div className="app">
      <div className="map" ref={mapRef} id="map"></div>
      <div className="panel">
        <h3>Earthquakes (last day)</h3>
        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
          <div><b>Total:</b> {filtered.length}</div>
          <button onClick={() => fetchEvents({ refresh: true })} disabled={loading} style={{marginLeft:8}}>{loading? 'Refreshing...':'Refresh now'}</button>
        </div>
        <div style={{marginBottom:8}}><b>Last updated:</b> {lastUpdated || '—'}</div>

        <div style={{marginBottom:8}}>
          <label>Min Magnitude: <input type="number" value={minMag} step="0.1" onChange={e => setMinMag(Number(e.target.value))} style={{width:80,marginLeft:8}} /></label>
        </div>
        <div style={{marginBottom:8}}>
          <label>Max Depth (km): <input type="number" placeholder="any" value={maxDepth ?? ''} onChange={e => setMaxDepth(e.target.value === '' ? null : Number(e.target.value))} style={{width:80,marginLeft:8}} /></label>
        </div>

        <div style={{marginTop:12}}>
          <b>Legend</b>
          <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:6}}>
            <div><span style={{display:'inline-block',width:16,height:12,background:'#e53935',marginRight:8}}></span>Shallow (&le;70 km)</div>
            <div><span style={{display:'inline-block',width:16,height:12,background:'#fb8c00',marginRight:8}}></span>Intermediate (70–300 km)</div>
            <div><span style={{display:'inline-block',width:16,height:12,background:'#1e88e5',marginRight:8}}></span>Deep (&gt;300 km)</div>
          </div>
        </div>

        <hr />
        <div style={{maxHeight: '50vh', overflow: 'auto'}}>
          <ul>
            {filtered.slice(0, 200).map(ev => (
              <li key={ev.id} style={{marginBottom:6}}>{new Date(ev.time).toLocaleString()} — {ev.place} — M {ev.mag} — {ev.depth_km} km</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
