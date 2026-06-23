import React, { useState, useEffect } from 'react';
import { Landmark, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Ledger() {
  const { setError } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.reports.getCustomerLedger();
        setEntries(res.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 animate-fadeIn">
        {[1,2,3].map(i => <div key={i} className="skeleton h-14 w-full rounded-lg"></div>)}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fadeInUp">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-sky-50">
          <Landmark size={18} className="text-sky-600" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">Customer Ledger</h4>
          <p className="text-xs text-slate-400">{entries.length} transaction{entries.length !== 1 ? 's' : ''} recorded</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead>
            <tr className="border-b-2 border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold">
              <th className="pb-3">Date</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Description</th>
              <th className="pb-3">Type</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((l) => (
              <tr key={l.id} className="border-b border-slate-50">
                <td className="py-3.5 text-slate-500 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                <td className="py-3.5 font-semibold text-slate-800">{l.customer?.name || 'Unknown'}</td>
                <td className="py-3.5 text-slate-500">{l.description}</td>
                <td className="py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${
                    l.type === 'DEBIT' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {l.type === 'DEBIT' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                    {l.type}
                  </span>
                </td>
                <td className="py-3.5 text-right font-bold text-slate-900 font-mono">₹{parseFloat(l.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                  <Landmark size={24} className="mx-auto mb-2 opacity-30" />
                  No ledger entries posted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
