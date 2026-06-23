import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

const TOAST_LIMIT = 4;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return { toasts, addToast };
};

export function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />,
    error: <XCircle size={18} className="text-rose-600 shrink-0" />,
    warning: <AlertCircle size={18} className="text-amber-600 shrink-0" />,
    info: <Info size={18} className="text-sky-600 shrink-0" />,
  };

  const bgMap = {
    success: 'border-emerald-200 bg-emerald-50',
    error: 'border-rose-200 bg-rose-50',
    warning: 'border-amber-200 bg-amber-50',
    info: 'border-sky-200 bg-sky-50',
  };

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-3" style={{ maxWidth: '380px' }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-fadeInRight ${bgMap[toast.type] || bgMap.info}`}
        >
          {iconMap[toast.type] || iconMap.info}
          <p className="text-sm font-medium text-slate-800 flex-1">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 hover:bg-white/60 rounded-lg transition text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
