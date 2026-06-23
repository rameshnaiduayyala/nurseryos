import React, { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle, Printer, ShoppingCart } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function POS() {
  const { setSuccess, setError } = useAuth();
  const [plants, setPlants] = useState([]);
  const [nurseries, setNurseries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [posCustomerName, setPosCustomerName] = useState('Walk-in Customer');
  const [posCustomerPhone, setPosCustomerPhone] = useState('');
  const [posNurseryId, setPosNurseryId] = useState('');
  const [posItems, setPosItems] = useState([{ plantId: '', quantity: 1, unitPrice: 0 }]);
  const [printedReceiptUrl, setPrintedReceiptUrl] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const plantRes = await api.plants.list();
      setPlants(plantRes.data || []);

      const nurseryRes = await api.nurseries.list();
      setNurseries(nurseryRes.data || []);
    } catch (err) {
      console.error('Failed to load POS assets', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePosSale = async (e) => {
    e.preventDefault();
    try {
      const saleItems = posItems
        .filter((it) => it.plantId !== '')
        .map((it) => ({
          plantId: it.plantId,
          quantity: parseInt(it.quantity),
          unitPrice: parseFloat(it.unitPrice),
        }));

      if (saleItems.length === 0) {
        throw new Error('Please add at least one item to the cart.');
      }

      const res = await api.pos.create({
        nurseryId: posNurseryId,
        customerName: posCustomerName,
        customerPhone: posCustomerPhone,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        items: saleItems,
      });

      setSuccess('POS Sale Completed successfully!');
      setPrintedReceiptUrl(api.pos.printUrl(res.data.id));
      setPosItems([{ plantId: '', quantity: 1, unitPrice: 0 }]);
      setPosCustomerName('Walk-in Customer');
      setPosCustomerPhone('');
      setPosNurseryId('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading POS billing systems...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShoppingCart className="text-emerald-700" size={20} />
          <span>POS Billing Cart</span>
        </h4>
        <form onSubmit={handlePosSale} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nursery Outlet</label>
              <select 
                required 
                value={posNurseryId} 
                onChange={(e) => setPosNurseryId(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Select Nursery...</option>
                {nurseries.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Name</label>
              <input 
                type="text" 
                required 
                value={posCustomerName} 
                onChange={(e) => setPosCustomerName(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Phone</label>
              <input 
                type="text" 
                value={posCustomerPhone} 
                onChange={(e) => setPosCustomerPhone(e.target.value)} 
                placeholder="e.g. +91 99008811" 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-bold text-slate-700">Cart Items</h5>
            {posItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="flex-1">
                  <select 
                    required
                    value={item.plantId}
                    onChange={(e) => {
                      const newIt = [...posItems];
                      const p = plants.find((x) => x.id === e.target.value);
                      newIt[idx].plantId = e.target.value;
                      newIt[idx].unitPrice = p ? parseFloat(p.unitPrice) : 0;
                      setPosItems(newIt);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      const newIt = [...posItems];
                      newIt[idx].quantity = e.target.value;
                      setPosItems(newIt);
                    }} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  />
                </div>
                <div className="w-32 text-right text-sm font-semibold">₹{(item.quantity * item.unitPrice).toFixed(2)}</div>
                <button 
                  type="button" 
                  onClick={() => {
                    if (posItems.length > 1) {
                      setPosItems(posItems.filter((_, i) => i !== idx));
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
              onClick={() => setPosItems([...posItems, { plantId: '', quantity: 1, unitPrice: 0 }])} 
              className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1 mt-2 transition"
            >
              <PlusCircle size={18} />
              <span>Add Cart Item</span>
            </button>
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-bold text-slate-700">Total Price:</span>
            <span className="text-xl font-extrabold text-emerald-900">
              ₹{posItems.reduce((acc, it) => acc + (parseInt(it.quantity || 0) * parseFloat(it.unitPrice || 0)), 0).toFixed(2)}
            </span>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg text-md transition duration-200 shadow-sm"
          >
            Checkout & Print Bill
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
        <h4 className="text-md font-bold text-slate-800 mb-4">Print Receipts</h4>
        {printedReceiptUrl ? (
          <div className="text-center p-4 border border-dashed border-emerald-300 bg-emerald-50 rounded-xl space-y-4">
            <CheckCircle className="text-emerald-600 mx-auto" size={48} />
            <div className="text-sm font-semibold text-emerald-800">Checkout Completed!</div>
            <a 
              href={printedReceiptUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition duration-200 shadow-sm"
            >
              <Printer size={18} />
              <span>Open Printable Bill</span>
            </a>
          </div>
        ) : (
          <div className="text-center p-6 text-slate-400 text-sm">Create a sale checkout cart to print.</div>
        )}
      </div>
    </div>
  );
}
