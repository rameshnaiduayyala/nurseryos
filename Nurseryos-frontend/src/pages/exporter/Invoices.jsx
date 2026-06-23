import React, { useState, useEffect } from 'react';
import { Download, CreditCard } from 'lucide-react';
import { api } from '../../services/api';
import { API_URL } from '../../services/base';
import { useAuth } from '../../context/AuthContext';

export default function Invoices() {
  const { token, setSuccess, setError } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment popup/form states
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payReference, setPayReference] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const invoiceRes = await api.invoices.list();
      setInvoices(invoiceRes.data || []);
    } catch (err) {
      console.error('Failed to load invoices', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      await api.payments.create(
        selectedInvoice.id,
        payAmount,
        payMethod,
        payReference
      );
      setSuccess('Payment processed successfully. Ledgers updated.');
      setSelectedInvoice(null);
      setPayAmount('');
      setPayReference('');
      setPayMethod('UPI');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading Invoices...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 text-md flex items-center gap-2">
          <CreditCard className="text-emerald-700" size={18} />
          <span>Invoice Billing Manager</span>
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 font-semibold text-slate-500">
                <th className="pb-2">Invoice #</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Total Due</th>
                <th className="pb-2">Paid</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100">
                  <td className="py-3 font-semibold">{inv.invoiceNumber}</td>
                  <td className="py-3">{inv.customer?.name || 'Retail Customer'}</td>
                  <td className="py-3 font-semibold text-slate-900">₹{parseFloat(inv.amountDue).toFixed(2)}</td>
                  <td className="py-3 text-emerald-800 font-semibold">₹{parseFloat(inv.amountPaid).toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      inv.status === 'PAID' ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
                    }`}>{inv.status}</span>
                  </td>
                  <td className="py-3 flex gap-3">
                    <button 
                      disabled={inv.status === 'PAID'}
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPayAmount((parseFloat(inv.amountDue) - parseFloat(inv.amountPaid)).toFixed(2));
                      }}
                      className="text-emerald-700 disabled:opacity-50 hover:underline font-semibold text-xs transition"
                    >
                      Pay
                    </button>
                    <a 
                      href={`${API_URL}/invoices/${inv.id}/pdf?token=${token}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-slate-700 hover:underline flex items-center gap-0.5 font-semibold text-xs transition"
                    >
                      <Download size={14} /> PDF
                    </a>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">No invoices generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment popup */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h4 className="font-bold text-slate-800 mb-4 text-md">Record Invoice Payment</h4>
        {selectedInvoice ? (
          <form onSubmit={submitPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Invoice Number</label>
              <input 
                type="text" 
                disabled 
                value={selectedInvoice.invoiceNumber} 
                className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Amount (₹)</label>
              <input 
                type="number" 
                required 
                min="0.01" 
                step="0.01" 
                value={payAmount} 
                onChange={(e) => setPayAmount(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Method</label>
              <select 
                value={payMethod} 
                onChange={(e) => setPayMethod(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card Payment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Transaction Reference / ID</label>
              <input 
                type="text" 
                value={payReference} 
                onChange={(e) => setPayReference(e.target.value)} 
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="w-2/3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 rounded-lg text-sm transition"
              >
                Submit Payment
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center p-6 text-slate-400 text-sm">
            Select an outstanding invoice from the list to record a customer payment.
          </div>
        )}
      </div>
    </div>
  );
}
