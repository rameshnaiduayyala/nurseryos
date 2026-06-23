import React, { useState, useEffect } from 'react';
import { Shield, ShieldOff, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Users() {
  const { user: currentUser, setSuccess, setError } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.users.list();
      setUsersList(res.data || []);
    } catch (err) {
      console.error('Failed to load users list', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserActive = async (id, currentVal) => {
    // Prevent admin from deactivating themselves
    if (id === currentUser?.id) {
      setError('You cannot deactivate your own admin account.');
      return;
    }

    try {
      setToggling(id);
      await api.users.updateActiveStatus(id, !currentVal);
      setSuccess(`User ${currentVal ? 'suspended' : 'activated'} successfully.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-fadeIn">
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton h-14 w-full"></div>
        ))}
      </div>
    );
  }

  const roleColors = {
    ADMIN: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    FARMER: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    EXPORTER: 'bg-sky-50 text-sky-700 border border-sky-200',
    SUPERVISOR: 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  return (
    <div className="animate-fadeInUp">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="font-bold text-slate-800 text-lg">User Accounts Registry</h4>
            <p className="text-xs text-slate-400 mt-0.5">{usersList.length} registered accounts</p>
          </div>
          <button
            onClick={() => loadData()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg transition"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b-2 border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                <th className="pb-3 pl-1">User</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="border-b border-slate-50 group">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                          u.isActive ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-slate-300 to-slate-400'
                        }`}>
                          {u.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{u.fullName}</div>
                          {isSelf && <span className="text-[10px] text-emerald-600 font-semibold">(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-500">{u.email}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${roleColors[u.role?.name] || 'bg-slate-50 text-slate-600'}`}>
                        {u.role?.name}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-400'}`}></span>
                        <span className={`text-xs font-semibold ${u.isActive ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      <button
                        onClick={() => handleToggleUserActive(u.id, u.isActive)}
                        disabled={isSelf || toggling === u.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                          u.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title={isSelf ? 'Cannot toggle your own account' : (u.isActive ? 'Suspend this user' : 'Activate this user')}
                      >
                        {toggling === u.id ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : u.isActive ? (
                          <ShieldOff size={13} />
                        ) : (
                          <Shield size={13} />
                        )}
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {usersList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
