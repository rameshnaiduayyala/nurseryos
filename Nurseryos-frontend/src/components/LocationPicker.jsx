import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LocationPicker({
  value = null,
  onChange,
  height = '280px',
  className = '',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(value ? { lat: value.lat, lng: value.lng } : null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter = coords ? [coords.lat, coords.lng] : [20.5937, 78.9629];
    const map = L.map(containerRef.current).setView(defaultCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    const handleClick = (e) => {
      const { lat, lng } = e.latlng;
      setCoords({ lat, lng });
      updateMarker(lat, lng);
      onChange?.({ lat, lng, label: coords?.label || `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
    };

    map.on('click', handleClick);

    if (coords) {
      updateMarker(coords.lat, coords.lng);
    }

    return () => {
      map.off('click', handleClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const updateMarker = (lat, lng) => {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="
          width: 32px; height: 32px;
          background: #059669;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.4);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 13px; font-weight: bold;
        ">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);

      markerRef.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setCoords({ lat, lng });
        onChange?.({ lat, lng, label: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      });
    }
  };

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        updateMarker(lat, lng);
        mapRef.current?.setView([lat, lng], 16);
        onChange?.({ lat, lng, label: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onChange]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div ref={containerRef} style={{ height, width: '100%' }} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition text-sm font-semibold disabled:opacity-50"
        >
          {locating ? 'Locating...' : '📍 Use Current Location'}
        </button>

        {coords && (
          <span className="text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        )}

        {!coords && (
          <span className="text-xs text-slate-400 italic">Click on the map to drop a pin, or use current location</span>
        )}
      </div>
    </div>
  );
}
