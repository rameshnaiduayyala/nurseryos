import React from 'react';
import { X, MapPin, Phone, User, TreePine, ExternalLink } from 'lucide-react';
import MapView from './MapView';

export default function NurseryDetailPanel({ nursery, onClose }) {
  if (!nursery) return null;

  const mapMarkers = [];
  if (nursery.latitude && nursery.longitude) {
    mapMarkers.push({
      lat: nursery.latitude,
      lng: nursery.longitude,
      label: nursery.name,
      color: '#059669',
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto animate-fadeInRight">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <h3 className="font-bold text-slate-800 text-lg">Nursery Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xl font-bold text-slate-800">{nursery.name}</h4>
            <p className="text-sm text-slate-500 mt-1">{nursery.location}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${nursery.isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {nursery.isApproved ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
          </div>

          {mapMarkers.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                <MapPin size={14} className="inline mr-1" />
                Location Map
              </h5>
              <MapView
                center={[nursery.latitude, nursery.longitude]}
                zoom={15}
                markers={mapMarkers}
                className="h-48 w-full"
              />
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Farmer / Owner Info</h5>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <User size={18} className="text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{nursery.farmer?.fullName || 'N/A'}</p>
                <p className="text-xs text-slate-500">{nursery.farmer?.email || 'No email'}</p>
              </div>
            </div>
            {nursery.contactPerson && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <User size={14} className="text-slate-400" />
                <span>{nursery.contactPerson}</span>
              </div>
            )}
            {nursery.mobileNumber && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone size={14} className="text-slate-400" />
                <span>{nursery.mobileNumber}</span>
              </div>
            )}
            {nursery.gst && (
              <div className="text-xs text-slate-500">
                <span className="font-semibold">GST:</span> {nursery.gst}
              </div>
            )}
          </div>

          {nursery.blocks && nursery.blocks.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                <TreePine size={14} className="inline mr-1" />
                Nursery Blocks & Inventory
              </h5>
              <div className="space-y-3">
                {nursery.blocks.map((block) => (
                  <div key={block.id} className="bg-white border border-slate-200 rounded-lg p-3">
                    <h6 className="text-sm font-semibold text-slate-700">{block.name}</h6>
                    {block.inventoryBatches && block.inventoryBatches.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {block.inventoryBatches.map((batch) => (
                          <div key={batch.id} className="flex items-center justify-between text-xs bg-slate-50 rounded px-3 py-2">
                            <div>
                              <span className="font-semibold text-slate-700">{batch.plant?.name}</span>
                              <span className="text-slate-400 ml-2">x{batch.availableQuantity} avail</span>
                            </div>
                            <span className="font-bold text-emerald-700">₹{parseFloat(batch.unitPrice).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1">No active inventory</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {nursery.latitude && nursery.longitude && (
            <div className="text-xs text-slate-600 font-mono">
              <MapPin size={14} className="inline mr-1 text-slate-400" />
              {nursery.latitude}, {nursery.longitude}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
