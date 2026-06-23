import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, TreePine, CheckCircle2, XCircle, RefreshCw, Ban } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Approvals() {
  const { setSuccess, setError } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [nurseriesList, setNurseriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const farmerNurseryMap = useMemo(() => {
    const map = {};
    (nurseriesList || []).forEach((n) => {
      const fid = n?.farmerId;
      if (fid) map[fid] = n.id;
    });
    return map;
  }, [nurseriesList]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, nurseriesRes] = await Promise.all([
        api.users.list(),
        api.nurseries.list(),
      ]);
      setUsersList(Array.isArray(usersRes?.data) ? usersRes.data : []);
      setNurseriesList(Array.isArray(nurseriesRes?.data) ? nurseriesRes.data : []);
    } catch (err) {
      console.error('Failed to load approvals lists', err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveUser = async (userId, roleName, nurseryId) => {
    try {
      setActionId(userId);
      await api.users.approve(userId);
      if (roleName === 'FARMER' && nurseryId) {
        await api.nurseries.approve(nurseryId, true);
      }
      setSuccess(roleName === 'FARMER' ? 'Farmer and nursery approved successfully.' : 'User approved successfully.');
      await loadData();
    } catch (err) {
      setError(err?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const handleSuspendUser = async (userId, roleName, nurseryId) => {
    try {
      setActionId(userId);
      await api.users.updateActiveStatus(userId, false);
      if (roleName === 'FARMER' && nurseryId) {
        await api.nurseries.approve(nurseryId, false);
      }
      setSuccess(roleName === 'FARMER' ? 'Farmer and nursery suspended.' : 'User suspended successfully.');
      await loadData();
    } catch (err) {
      setError(err?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const handleNurseryDecision = async (nurseryId, approve) => {
    try {
      setActionId(nurseryId);
      await api.nurseries.approve(nurseryId, approve);
      setSuccess(approve ? 'Nursery approved and farmer activated.' : 'Nursery registration rejected.');
      await loadData();
    } catch (err) {
      setError(err?.message || 'Action failed');
    } finally {
      setActionId(null);
    }
  };

  const getRoleName = (u) => u?.role?.name || u?.roleName || 'N/A';
  const getUserId = (u) => u?.id || '';

  const pendingUsers = (usersList || []).filter((u) => !u.isActive);
  const pendingNurseries = (nurseriesList || []).filter((n) => !n.isApproved);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="skeleton h-48 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending User Approvals */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-indigo-50">
            <UserCheck size={18} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Pending User Approvals</h4>
            <p className="text-xs text-slate-400">{pendingUsers.length} account{pendingUsers.length !== 1 ? 's' : ''} awaiting review</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b-2 border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                <th className="pb-3">Applicant</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Requested Role</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => {
                const uid = getUserId(u);
                if (!uid) return null;
                const roleName = getRoleName(u);
                const nurseryId = farmerNurseryMap[uid];
                return (
                  <tr key={uid} className="border-b border-slate-50">
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                          {u?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="font-semibold text-slate-800">{u?.fullName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-500">{u?.email || '-'}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {roleName}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApproveUser(uid, roleName, nurseryId)}
                          disabled={actionId === uid}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm disabled:opacity-50"
                        >
                          {actionId === uid ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleSuspendUser(uid, roleName, nurseryId)}
                          disabled={actionId === uid}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm disabled:opacity-50"
                        >
                          {actionId === uid ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Ban size={13} />
                          )}
                          Suspend
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pendingUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-300" />
                    All user accounts are approved.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Nursery Registrations */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-emerald-50">
            <TreePine size={18} className="text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Pending Nursery Registrations</h4>
            <p className="text-xs text-slate-400">{pendingNurseries.length} nurser{pendingNurseries.length !== 1 ? 'ies' : 'y'} awaiting approval</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b-2 border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                <th className="pb-3">Nursery Name</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Farmer</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingNurseries.map((n) => (
                <tr key={n?.id || Math.random()} className="border-b border-slate-50">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                        <TreePine size={14} />
                      </div>
                      <span className="font-semibold text-slate-800">{n?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-500">{n?.location || '-'}</td>
                  <td className="py-3.5 text-slate-500">
                    {n?.farmer?.fullName || n?.farmerId?.slice?.(0, 8) || '-'}
                  </td>
                  <td className="py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleNurseryDecision(n?.id, true)}
                        disabled={!n?.id || actionId === n.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm disabled:opacity-50"
                      >
                        {actionId === n?.id ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleNurseryDecision(n?.id, false)}
                        disabled={!n?.id || actionId === n.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm disabled:opacity-50"
                      >
                        {actionId === n?.id ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <XCircle size={13} />
                        )}
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingNurseries.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-300" />
                    All nursery registrations are approved.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
