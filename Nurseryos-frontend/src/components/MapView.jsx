import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView({ center, zoom = 13, markers = [], className = 'h-96 w-full rounded-xl border border-slate-200' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(center || [45.0, -122.0], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (center) {
      map.setView(center, zoom);
    }

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((marker) => {
      const { lat, lng, label, color = '#059669' } = marker;
      if (lat == null || lng == null) return;

      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          width: 28px; height: 28px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 11px; font-weight: bold;
        ">${label ? label.charAt(0).toUpperCase() : ''}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const m = L.marker([lat, lng], { icon }).addTo(map);
      if (label) {
        m.bindPopup(`<strong>${label}</strong>`);
      }
      markersRef.current.push(m);
    });
  }, [center, zoom, markers]);

  return <div ref={containerRef} className={className} />;
}
