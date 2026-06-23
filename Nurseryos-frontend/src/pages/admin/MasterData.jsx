import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MasterData() {
  const { setSuccess, setError } = useAuth();
  const [categories, setCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [heights, setHeights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newCatName, setNewCatName] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newVarCatId, setNewVarCatId] = useState('');
  const [newSizeName, setNewSizeName] = useState('');
  const [newHeightName, setNewHeightName] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const catRes = await api.categories.list();
      setCategories(catRes.data);

      const varRes = await api.varieties.list();
      setVarieties(varRes.data);

      const sizesRes = await api.bagSizes.list();
      setSizes(sizesRes.data);

      const heightsRes = await api.heights.list();
      setHeights(heightsRes.data);
    } catch (err) {
      console.error('Failed to load master data', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitCategory = async (e) => {
    e.preventDefault();
    try {
      await api.categories.create(newCatName);
      setSuccess('Plant category added.');
      setNewCatName('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitVariety = async (e) => {
    e.preventDefault();
    try {
      await api.varieties.create(newVarName, newVarCatId);
      setSuccess('Plant variety added.');
      setNewVarName('');
      setNewVarCatId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitSize = async (e) => {
    e.preventDefault();
    try {
      await api.bagSizes.create(newSizeName);
      setSuccess('Bag size added.');
      setNewSizeName('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitHeight = async (e) => {
    e.preventDefault();
    try {
      await api.heights.create(newHeightName);
      setSuccess('Height standard added.');
      setNewHeightName('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.categories.delete(id);
      setSuccess('Category removed.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteVariety = async (id) => {
    if (!window.confirm('Are you sure you want to delete this variety?')) return;
    try {
      await api.varieties.delete(id);
      setSuccess('Variety removed.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSize = async (id) => {
    if (!window.confirm('Are you sure you want to delete this size?')) return;
    try {
      await api.bagSizes.delete(id);
      setSuccess('Bag size removed.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteHeight = async (id) => {
    if (!window.confirm('Are you sure you want to delete this height?')) return;
    try {
      await api.heights.delete(id);
      setSuccess('Height standard removed.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading master data...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Category creation & list */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 border-b pb-2 text-md">Plant Categories</h4>
        <form onSubmit={submitCategory} className="flex gap-2">
          <input 
            type="text" 
            placeholder="e.g. Shrubs" 
            value={newCatName} 
            onChange={(e) => setNewCatName(e.target.value)} 
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            required 
          />
          <button 
            type="submit" 
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm flex items-center transition"
          >
            <Plus size={18} />
          </button>
        </form>
        <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
          {categories.map((c) => (
            <div key={c.id} className="flex justify-between items-center p-3 text-sm">
              <span className="font-medium text-slate-700">{c.name}</span>
              <button 
                onClick={() => deleteCategory(c.id)} 
                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {categories.length === 0 && <p className="p-3 text-xs text-slate-400 text-center">No categories found.</p>}
        </div>
      </div>

      {/* Variety creation & list */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 border-b pb-2 text-md">Plant Varieties</h4>
        <form onSubmit={submitVariety} className="space-y-3">
          <select 
            required 
            value={newVarCatId} 
            onChange={(e) => setNewVarCatId(e.target.value)} 
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Select Category...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Areca Palm" 
              value={newVarName} 
              onChange={(e) => setNewVarName(e.target.value)} 
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
              required 
            />
            <button 
              type="submit" 
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm flex items-center transition"
            >
              <Plus size={18} />
            </button>
          </div>
        </form>
        <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
          {varieties.map((v) => (
            <div key={v.id} className="flex justify-between items-center p-3 text-sm">
              <div>
                <span className="font-medium text-slate-700">{v.name}</span>
                <span className="ml-2 text-xs text-slate-400">({v.category?.name || 'Category...'})</span>
              </div>
              <button 
                onClick={() => deleteVariety(v.id)} 
                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {varieties.length === 0 && <p className="p-3 text-xs text-slate-400 text-center">No varieties found.</p>}
        </div>
      </div>

      {/* Sizes creation & list */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 border-b pb-2 text-md">Bag Sizes</h4>
        <form onSubmit={submitSize} className="flex gap-2">
          <input 
            type="text" 
            placeholder="e.g. 18x18" 
            value={newSizeName} 
            onChange={(e) => setNewSizeName(e.target.value)} 
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            required 
          />
          <button 
            type="submit" 
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm flex items-center transition"
          >
            <Plus size={18} />
          </button>
        </form>
        <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
          {sizes.map((s) => (
            <div key={s.id} className="flex justify-between items-center p-3 text-sm">
              <span className="font-medium text-slate-700">{s.size}</span>
              <button 
                onClick={() => deleteSize(s.id)} 
                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {sizes.length === 0 && <p className="p-3 text-xs text-slate-400 text-center">No bag sizes found.</p>}
        </div>
      </div>

      {/* Heights creation & list */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-800 border-b pb-2 text-md">Height Standards</h4>
        <form onSubmit={submitHeight} className="flex gap-2">
          <input 
            type="text" 
            placeholder="e.g. 6 ft" 
            value={newHeightName} 
            onChange={(e) => setNewHeightName(e.target.value)} 
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            required 
          />
          <button 
            type="submit" 
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm flex items-center transition"
          >
            <Plus size={18} />
          </button>
        </form>
        <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
          {heights.map((h) => (
            <div key={h.id} className="flex justify-between items-center p-3 text-sm">
              <span className="font-medium text-slate-700">{h.name}</span>
              <button 
                onClick={() => deleteHeight(h.id)} 
                className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {heights.length === 0 && <p className="p-3 text-xs text-slate-400 text-center">No height standards found.</p>}
        </div>
      </div>
    </div>
  );
}
