import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Customers() {
  const { setSuccess, setError } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustType, setNewCustType] = useState('LANDSCAPER');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.customers.list();
      setCustomers(res.data || []);
    } catch (err) {
      console.error('Failed to load customers', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.customers.create(
        newCustName,
        newCustEmail,
        newCustPhone,
        newCustAddress,
        newCustType
      );
      setSuccess('Customer client added successfully.');
      setNewCustName('');
      setNewCustEmail('');
      setNewCustPhone('');
      setNewCustAddress('');
      setNewCustType('LANDSCAPER');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading Customers...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h4 className="font-bold text-slate-800 mb-4 text-md">Register Customer</h4>
        <form onSubmit={submitCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Company/Client Name</label>
            <input 
              type="text" 
              placeholder="e.g. Eco Landscape" 
              value={newCustName} 
              onChange={(e) => setNewCustName(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="client@domain.com" 
              value={newCustEmail} 
              onChange={(e) => setNewCustEmail(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
            <input 
              type="text" 
              placeholder="e.g. +91..." 
              value={newCustPhone} 
              onChange={(e) => setNewCustPhone(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Address</label>
            <input 
              type="text" 
              placeholder="123 Main St, Portland, OR" 
              value={newCustAddress} 
              onChange={(e) => setNewCustAddress(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Business Type</label>
            <select 
              value={newCustType} 
              onChange={(e) => setNewCustType(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="LANDSCAPER">Landscaper</option>
              <option value="GOVERNMENT_PROJECT">Government Project</option>
              <option value="BUILDER">Builder / Developer</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg text-sm font-semibold transition"
          >
            Add Customer
          </button>
        </form>
      </div>
      
      <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 text-md">Customer Directory</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 font-semibold text-slate-500">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Phone</th>
                <th className="pb-2">Address</th>
                <th className="pb-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-3 font-semibold">{c.name}</td>
                  <td className="py-3">{c.email}</td>
                  <td className="py-3">{c.phone || 'N/A'}</td>
                  <td className="py-3 text-xs text-slate-500">{c.address || 'N/A'}</td>
                  <td className="py-3 font-medium text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded w-fit">{c.type}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">No customers registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
