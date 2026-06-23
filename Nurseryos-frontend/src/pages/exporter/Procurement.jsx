import React, { useState, useEffect } from 'react';
import { PlusCircle, ShoppingCart } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Procurement() {
  const { setSuccess, setError } = useAuth();
  const [plants, setPlants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [procurementOrders, setProcurementOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [procurementItems, setProcurementItems] = useState([{ plantId: '', quantity: 10, unitPrice: 0 }]);

  const loadData = async () => {
    try {
      setLoading(true);
      const plantsRes = await api.plants.list();
      setPlants(plantsRes.data || []);

      const custRes = await api.customers.list();
      setCustomers(custRes.data || []);

      const procurementRes = await api.procurement.list();
      setProcurementOrders(procurementRes.data || []);
    } catch (err) {
      console.error('Failed to load procurement dependencies', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcurement = async (e) => {
    e.preventDefault();
    try {
      const items = procurementItems
        .filter((it) => it.plantId !== '')
        .map((it) => ({
          plantId: it.plantId,
          quantity: parseInt(it.quantity),
          unitPrice: parseFloat(it.unitPrice),
        }));

      if (items.length === 0) {
        throw new Error('Please select at least one plant to order.');
      }

      await api.procurement.create(selectedCustomerId || null, items);
      setSuccess('Procurement order submitted & invoice generated!');
      setProcurementItems([{ plantId: '', quantity: 10, unitPrice: 0 }]);
      setSelectedCustomerId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading Procurement...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShoppingCart className="text-emerald-700" size={20} />
          <span>Create Procurement Order</span>
        </h4>
        <form onSubmit={handleProcurement} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Select Customer</label>
            <select 
              value={selectedCustomerId} 
              onChange={(e) => setSelectedCustomerId(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Retail Sale (No Customer)</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
            </select>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-bold text-slate-700">Order Items</h5>
            {procurementItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="flex-1">
                  <select 
                    required
                    value={item.plantId}
                    onChange={(e) => {
                      const newIt = [...procurementItems];
                      const p = plants.find((x) => x.id === e.target.value);
                      newIt[idx].plantId = e.target.value;
                      newIt[idx].unitPrice = p ? parseFloat(p.unitPrice) : 0;
                      setProcurementItems(newIt);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select Plant...</option>
                    {plants.map((p) => <option key={p.id} value={p.id}>{p.name} (Unit: ₹{p.unitPrice})</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    value={item.quantity} 
                    onChange={(e) => {
                      const newIt = [...procurementItems];
                      newIt[idx].quantity = e.target.value;
                      setProcurementItems(newIt);
                    }} 
                    className="w-full px-3 py-2 border rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  />
                </div>
                <div className="w-32 text-right text-sm font-semibold">₹{(item.quantity * item.unitPrice).toFixed(2)}</div>
                <button 
                  type="button" 
                  onClick={() => {
                    if (procurementItems.length > 1) {
                      setProcurementItems(procurementItems.filter((_, i) => i !== idx));
                    }
                  }} 
                  className="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
                >
                  Remove
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => setProcurementItems([...procurementItems, { plantId: '', quantity: 10, unitPrice: 0 }])} 
              className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1 mt-2 transition"
            >
              <PlusCircle size={18} />
              <span>Add Item</span>
            </button>
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-bold text-slate-700">Total Price:</span>
            <span className="text-xl font-extrabold text-emerald-900">
              ₹{procurementItems.reduce((acc, it) => acc + (parseInt(it.quantity || 0) * parseFloat(it.unitPrice || 0)), 0).toFixed(2)}
            </span>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg text-md transition duration-200"
          >
            Create Order & Invoice
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 text-md">Procurement Log</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 font-semibold text-slate-500">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Created At</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {procurementOrders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100">
                  <td className="py-3 font-semibold">{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-3">{o.customer?.name || 'Retail Customer'}</td>
                  <td className="py-3 text-slate-500">{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="py-3 font-semibold text-emerald-800">{o.status || 'PENDING'}</td>
                </tr>
              ))}
              {procurementOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400">No procurement orders recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
