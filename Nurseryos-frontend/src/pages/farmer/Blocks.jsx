import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Blocks() {
  const { setSuccess, setError } = useAuth();
  const [nurseries, setNurseries] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newBlockName, setNewBlockName] = useState('');
  const [newBlockNurseryId, setNewBlockNurseryId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const nurseryRes = await api.nurseries.list();
      setNurseries(nurseryRes.data || []);
      
      const blockRes = await api.nurseryBlocks.list();
      setBlocks(blockRes.data || []);
    } catch (err) {
      console.error('Failed to load blocks data', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitBlock = async (e) => {
    e.preventDefault();
    try {
      await api.nurseryBlocks.create(newBlockName, newBlockNurseryId);
      setSuccess('Nursery Block created.');
      setNewBlockName('');
      setNewBlockNurseryId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading Blocks...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h4 className="font-bold text-slate-800 mb-4 text-md">Add Nursery Block</h4>
        <form onSubmit={submitBlock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Select Nursery</label>
            <select 
              required 
              value={newBlockNurseryId} 
              onChange={(e) => setNewBlockNurseryId(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select Nursery...</option>
              {nurseries.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Block Name</label>
            <input 
              type="text" 
              placeholder="e.g. Palm Block" 
              value={newBlockName} 
              onChange={(e) => setNewBlockName(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg text-sm font-semibold transition"
          >
            Create Block
          </button>
        </form>
      </div>
      
      <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 text-md">Active Blocks</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 font-semibold text-slate-500">
                <th className="pb-2">Block Name</th>
                <th className="pb-2">Nursery</th>
                <th className="pb-2">Location</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.id} className="border-b border-slate-100">
                  <td className="py-3 font-semibold">{b.name}</td>
                  <td className="py-3">{b.nursery?.name || 'N/A'}</td>
                  <td className="py-3 text-slate-500">{b.nursery?.location || 'N/A'}</td>
                </tr>
              ))}
              {blocks.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-slate-400">No blocks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
