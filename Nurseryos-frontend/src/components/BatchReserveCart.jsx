import React, { useState } from 'react';
import { Minus, Plus, Trash2, Send } from 'lucide-react';

export default function BatchReserveCart({ items, onUpdateQty, onRemove, onCheckout, onClear }) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * parseFloat(item.plant.unitPrice), 0);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h4 className="font-bold text-slate-800">Reservation Cart</h4>
            <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              {totalItems} plants
            </span>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {items.map((item) => (
            <div
              key={`${item.plant.id}-${item.nurseryId}`}
              className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200 min-w-[320px]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.plant.name}</p>
                <p className="text-xs text-slate-500 truncate">{item.nurseryName}</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  ₹{parseFloat(item.plant.unitPrice).toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQty(item.plant.id, item.nurseryId, Math.max(0, item.quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold text-slate-800 w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.plant.id, item.nurseryId, item.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => onRemove(item.plant.id, item.nurseryId)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-500">Total Value: </span>
            <span className="text-lg font-bold text-slate-900">₹{totalValue.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClear}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Clear
            </button>
            <button
              onClick={onCheckout}
              className="px-6 py-2 rounded-lg text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm flex items-center gap-2"
            >
              <Send size={16} />
              Submit All Reservations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
