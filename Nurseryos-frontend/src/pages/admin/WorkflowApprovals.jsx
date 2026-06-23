import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, XCircle, Clock, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function WorkflowApprovals() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.approvalRequests.list();
      setRequests(res.data || []);
    } catch (err) {
      console.error('Failed to load approval requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (id, status) => {
    try {
      setReviewingId(id);
      await api.approvalRequests.review(id, status, reviewNotes[id] || '');
      setSuccess && setSuccess(`Approval request ${status.toLowerCase()}.`);
      setReviewNotes((prev) => ({ ...prev, [id]: '' }));
      await loadData();
    } catch (err) {
      console.error('Failed to review request', err);
    } finally {
      setReviewingId(null);
    }
  };

  const { setSuccess, setError } = useAuth();

  const canReview = user.role === 'ADMIN' || (user.role === 'FARMER');
  const isExporter = user.role === 'EXPORTER';

  const statusBadge = (status) => {
    const map = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
      APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return map[status] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  if (loading) {
    return <div className="text-slate-500">Loading workflow...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-indigo-50">
            <ClipboardList size={18} className="text-indigo-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">
              {isExporter ? 'My Approval Requests' : 'Approval Workflow'}
            </h4>
            <p className="text-xs text-slate-400">
              {isExporter
                ? 'Track and manage your submitted requests'
                : `${requests.length} request${requests.length !== 1 ? 's' : ''} in workflow`}
            </p>
          </div>
        </div>

        {requests.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-sm">
            <ClipboardList size={32} className="mx-auto mb-3 text-slate-300" />
            No approval requests found.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b-2 border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                <th className="pb-3">Entity Type</th>
                <th className="pb-3">Requester</th>
                <th className="pb-3">Entity ID</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Note</th>
                <th className="pb-3">Submitted At</th>
                {canReview && <th className="pb-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-slate-50">
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {req.entityType}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                        {req.requester?.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className="font-semibold text-slate-800">{req.requester?.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 font-mono text-xs text-slate-500">{req.entityId?.slice(0, 8).toUpperCase()}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-600">{req.priority}</td>
                  <td className="py-3.5 text-slate-500 max-w-xs truncate">{req.note || '-'}</td>
                  <td className="py-3.5 text-slate-500 text-xs">{new Date(req.createdAt).toLocaleString()}</td>
                  {canReview && (
                    <td className="py-3.5">
                      {(req.status === 'PENDING' || req.status === 'UNDER_REVIEW') ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleReview(req.id, 'APPROVED')}
                            disabled={reviewingId === req.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(req.id, 'REJECTED')}
                            disabled={reviewingId === req.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm disabled:opacity-50"
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center justify-center gap-1">
                          <Clock size={13} />
                          Reviewed
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
