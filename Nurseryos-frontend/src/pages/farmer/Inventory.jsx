import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Inventory() {
  const { setSuccess, setError } = useAuth();
  const [inventoryList, setInventoryList] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newInvBlockId, setNewInvBlockId] = useState('');
  const [newInvPlantId, setNewInvPlantId] = useState('');
  const [newInvQuantity, setNewInvQuantity] = useState('');
  const [newInvPrice, setNewInvPrice] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const invRes = await api.inventory.list();
      setInventoryList(invRes.data || []);

      const blockRes = await api.nurseryBlocks.list();
      setBlocks(blockRes.data || []);

      const plantsRes = await api.plants.list();
      setPlants(plantsRes.data || []);
    } catch (err) {
      console.error('Failed to load inventory data', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitInventory = async (e) => {
    e.preventDefault();
    try {
      await api.inventory.create(
        newInvBlockId,
        newInvPlantId,
        parseInt(newInvQuantity),
        parseFloat(newInvPrice)
      );
      setSuccess('Inventory stock batch added.');
      setNewInvQuantity('');
      setNewInvPrice('');
      setNewInvBlockId('');
      setNewInvPlantId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading Inventory...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h4 className="text-md font-bold text-slate-800 mb-4">Add Inventory Batch</h4>
        <form onSubmit={submitInventory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nursery Block</label>
            <select 
              required 
              value={newInvBlockId} 
              onChange={(e) => setNewInvBlockId(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select block...</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.nursery?.name})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Select Plant</label>
            <select 
              required 
              value={newInvPlantId} 
              onChange={(e) => setNewInvPlantId(e.target.value)} 
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select plant...</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (Unit: ₹{p.unitPrice})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Stock Quantity</label>
            <input 
              type="number" 
              required 
              min="1" 
              value={newInvQuantity} 
              onChange={(e) => setNewInvQuantity(e.target.value)} 
              placeholder="e.g. 150" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Unit Price (₹)</label>
            <input 
              type="number" 
              required 
              step="0.01" 
              min="0.01" 
              value={newInvPrice} 
              onChange={(e) => setNewInvPrice(e.target.value)} 
              placeholder="e.g. 450" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 rounded-lg text-sm transition"
          >
            Add Batch
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-md font-bold text-slate-800 mb-4">Stock Holdings</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-sm">
                <th className="pb-3">Block</th>
                <th className="pb-3">Plant Name</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Physical Qty</th>
                <th className="pb-3">Available Qty</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-100 text-slate-700 text-sm">
                  <td className="py-3 font-medium">{inv.nurseryBlock?.name}</td>
                  <td className="py-3">{inv.plant?.name}</td>
                  <td className="py-3">₹{parseFloat(inv.unitPrice).toFixed(2)}</td>
                  <td className="py-3">{inv.quantity}</td>
                  <td className="py-3">{inv.availableQuantity}</td>
                </tr>
              ))}
              {inventoryList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">No inventory batches registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
