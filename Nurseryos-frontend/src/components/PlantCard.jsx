import React from 'react';

export default function PlantCard({ plant, onReserve, nurseryName, nurseryLocation, availableQty }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h5 className="font-bold text-slate-800">{plant.name}</h5>
          <p className="text-xs text-slate-500 mt-0.5">{plant.category?.name} • {plant.variety?.name}</p>
        </div>
        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {plant.bagSize?.size}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 mb-4">
        <div>
          <span className="text-slate-400">Height:</span>
          <span className="ml-1 font-semibold text-slate-700">{plant.heightStandard?.name || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-400">Available:</span>
          <span className="ml-1 font-semibold text-emerald-700">{availableQty ?? '-'}</span>
        </div>
        {nurseryName && (
          <div className="col-span-2">
            <span className="text-slate-400">Source:</span>
            <span className="ml-1 font-semibold text-slate-700">{nurseryName}</span>
          </div>
        )}
        {nurseryLocation && (
          <div className="col-span-2">
            <span className="text-slate-400">Location:</span>
            <span className="ml-1 font-semibold text-slate-700">{nurseryLocation}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <span className="text-xs text-slate-400">Rate</span>
          <p className="text-lg font-bold text-slate-900">₹{parseFloat(plant.unitPrice).toFixed(2)}</p>
        </div>
        <button
          onClick={() => onReserve(plant)}
          disabled={availableQty === 0}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {availableQty === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
