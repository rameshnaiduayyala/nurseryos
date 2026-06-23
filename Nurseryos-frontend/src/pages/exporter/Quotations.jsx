import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { API_URL } from '../../services/base';
import { useAuth } from '../../context/AuthContext';

export default function Quotations() {
  const { token, setSuccess, setError } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newQuoteCustId, setNewQuoteCustId] = useState('');
  const [newQuoteAmount, setNewQuoteAmount] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const quotesRes = await api.quotations.list();
      setQuotations(quotesRes.data || []);

      const custRes = await api.customers.list();
      setCustomers(custRes.data || []);
    } catch (err) {
      console.error('Failed to load quotations data', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitQuotation = async (e) => {
    e.preventDefault();
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 10); // 10-day validity

      await api.quotations.create(
        newQuoteCustId,
        parseFloat(newQuoteAmount),
        expiresAt.toISOString()
      );
      setSuccess('Customer quotation created successfully.');
      setNewQuoteAmount('');
      setNewQuoteCustId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading Proposals...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h4 className="font-bold text-slate-800 mb-4 text-md flex items-center gap-2">
          <FileText className="text-emerald-700 font-semibold" size={18} />
          <span>Create Proposal Quotation</span>
        </h4>
        <form onSubmit={submitQuotation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Customer</label>
            <select 
              required 
              value={newQuoteCustId} 
              onChange={(e) => setNewQuoteCustId(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select customer...</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Total Quoted Amount (₹)</label>
            <input 
              type="number" 
              required 
              min="1" 
              value={newQuoteAmount} 
              onChange={(e) => setNewQuoteAmount(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg text-sm font-semibold transition"
          >
            Issue Quotation
          </button>
        </form>
      </div>

      <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 text-md">Quotations Log</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 font-semibold text-slate-500">
                <th className="pb-2">Quote ID</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Export</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} className="border-b border-slate-100">
                  <td className="py-3 font-semibold">{q.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-3">{q.customer?.name || 'N/A'}</td>
                  <td className="py-3 font-semibold text-slate-900">₹{parseFloat(q.totalAmount).toFixed(2)}</td>
                  <td className="py-3">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-semibold">
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <a 
                      href={`${API_URL}/quotations/${q.id}/pdf?token=${token}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-xs transition"
                    >
                      <Download size={14} /> PDF
                    </a>
                  </td>
                </tr>
              ))}
              {quotations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">No quotations logged.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
