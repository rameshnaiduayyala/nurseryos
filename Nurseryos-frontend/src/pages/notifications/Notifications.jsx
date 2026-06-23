import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Trash2, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const readParam = filterRead === 'true' ? true : filterRead === 'false' ? false : undefined;
      const res = await api.notifications.list(readParam);
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterRead]);

  const handleMarkRead = async (id) => {
    try {
      await api.notifications.markAsRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.notifications.delete(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  if (loading) return <div className="text-slate-500">Loading notifications...</div>;

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50">
              <Bell size={18} className="text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Notifications</h4>
              <p className="text-xs text-slate-400">
                {items.filter((n) => !n.read).length} unread
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">All Notifications</option>
              <option value="true">Read</option>
              <option value="false">Unread</option>
            </select>
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm"
            >
              <Check size={16} />
              Mark All Read
            </button>
          </div>
        </div>

        {items.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-sm">
            <Bell size={32} className="mx-auto mb-3 text-slate-300" />
            No notifications found.
          </div>
        )}

        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition ${
                n.read ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-200 shadow-sm'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h6 className={`text-sm font-semibold truncate ${n.read ? 'text-slate-600' : 'text-slate-800'}`}>
                    {n.title}
                  </h6>
                  {!n.read && (
                    <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0"></span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                    title="Mark as read"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
