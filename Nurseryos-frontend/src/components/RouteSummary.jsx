import React from 'react';
import MapView from './MapView';

export default function RouteSummary({ stops }) {
  const validStops = (stops || []).filter(
    (s) => s.nursery?.latitude != null && s.nursery?.longitude != null
  );

  if (validStops.length === 0) return null;

  const markers = validStops.map((s, idx) => ({
    lat: s.nursery.latitude,
    lng: s.nursery.longitude,
    label: `${idx + 1}. ${s.nursery.name}`,
    color: '#059669',
  }));

  const center =
    markers.length > 0
      ? [markers[0].lat, markers[0].lng]
      : [45.0, -122.0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">R</span>
          Route Summary
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Optimized route across {validStops.length} nursery stop{validStops.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="p-4">
        <MapView center={center} zoom={12} markers={markers} className="h-64 w-full" />
      </div>

      <div className="px-5 pb-5 space-y-2">
        {validStops.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-3 text-sm">
            <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{s.nursery.name}</p>
              <p className="text-xs text-slate-500 truncate">{s.nursery.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
