import React, { useState, useEffect, useMemo } from 'react';
import {
  PackagePlus, Search, Filter, Layers, TreePine, TrendingUp,
  History, Edit3, Trash2, Eye, X, ChevronDown, RefreshCw,
  Boxes, IndianRupee
} from 'lucide-react';
import Modal from '../../components/Modal';
import { useToast, ToastContainer } from '../../components/Toast';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Inventory() {
  const { user } = useAuth();
  const { toasts, addToast } = useToast();

  const [inventoryList, setInventoryList] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [bagSizes, setBagSizes] = useState([]);
  const [heightStandards, setHeightStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlock, setFilterBlock] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCreatePlantModal, setShowCreatePlantModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [formData, setFormData] = useState({
    nurseryBlockId: '',
    plantId: '',
    quantity: '',
    unitPrice: '',
    addQuantity: '',
  });

  const [plantForm, setPlantForm] = useState({
    name: '',
    categoryId: '',
    varietyId: '',
    bagSizeId: '',
    heightStandardId: '',
    unitPrice: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, blockRes, plantsRes, catRes, varRes, bagRes, htRes] = await Promise.all([
        api.inventory.list(),
        api.nurseryBlocks.list(),
        api.plants.list(),
        api.categories.list(),
        api.varieties.list(),
        api.bagSizes.list(),
        api.heights.list(),
      ]);
      setInventoryList(invRes.data || []);
      setBlocks(blockRes.data || []);
      setPlants(plantsRes.data || []);
      setCategories(catRes.data || []);
      setVarieties(varRes.data || []);
      setBagSizes(bagRes.data || []);
      setHeightStandards(htRes.data || []);
    } catch (err) {
      console.error('Failed to load inventory', err);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.plant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nurseryBlock?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBlock = !filterBlock || item.nurseryBlockId === filterBlock;
      return matchesSearch && matchesBlock;
    });
  }, [inventoryList, searchTerm, filterBlock]);

  const stats = useMemo(() => {
    const totalBatches = inventoryList.length;
    const totalPhysical = inventoryList.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const totalAvailable = inventoryList.reduce((sum, i) => sum + (i.availableQuantity || 0), 0);
    const totalValue = inventoryList.reduce((sum, i) => sum + (i.quantity || 0) * parseFloat(i.unitPrice || 0), 0);
    return { totalBatches, totalPhysical, totalAvailable, totalValue };
  }, [inventoryList]);

  const resetForm = () => {
    setFormData({ nurseryBlockId: '', plantId: '', quantity: '', unitPrice: '', addQuantity: '' });
    setSelectedBatch(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (batch) => {
    setSelectedBatch(batch);
    setFormData({
      nurseryBlockId: batch.nurseryBlockId,
      plantId: batch.plantId,
      quantity: batch.quantity,
      unitPrice: batch.unitPrice,
      addQuantity: '',
    });
    setShowEditModal(true);
  };

  const openHistoryModal = async (batch) => {
    setSelectedBatch(batch);
    setLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const res = await api.inventory.getTransactions(batch.id);
      setTransactions(res.data || []);
    } catch (err) {
      addToast('Failed to load transaction history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.inventory.create(formData.nurseryBlockId, formData.plantId, parseInt(formData.quantity), parseFloat(formData.unitPrice));
      addToast('Inventory batch created successfully', 'success');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCreatePlant = async (e) => {
    e.preventDefault();
    try {
      await api.plants.create(plantForm);
      addToast('Plant created in your catalog', 'success');
      setShowCreatePlantModal(false);
      setPlantForm({ name: '', categoryId: '', varietyId: '', bagSizeId: '', heightStandardId: '', unitPrice: '' });
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {};
      if (formData.quantity) updateData.quantity = parseInt(formData.quantity);
      if (formData.unitPrice) updateData.unitPrice = parseFloat(formData.unitPrice);
      if (formData.addQuantity) {
        updateData.quantity = (selectedBatch.quantity || 0) + parseInt(formData.addQuantity);
      }

      await api.inventory.update(selectedBatch.id, updateData);
      addToast('Batch updated successfully', 'success');
      setShowEditModal(false);
      resetForm();
      loadData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const typeBadge = (type) => {
    const map = {
      IN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      OUT: 'bg-rose-50 text-rose-700 border-rose-200',
      RESERVED: 'bg-amber-50 text-amber-700 border-amber-200',
      RELEASED: 'bg-sky-50 text-sky-700 border-sky-200',
    };
    return map[type] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50">
              <Boxes size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Batches</p>
              <p className="text-xl font-bold text-slate-800">{stats.totalBatches}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Available Stock</p>
              <p className="text-xl font-bold text-slate-800">{stats.totalAvailable.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <Layers size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Physical Stock</p>
              <p className="text-xl font-bold text-slate-800">{stats.totalPhysical.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-50">
              <IndianRupee size={20} className="text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Portfolio Value</p>
              <p className="text-xl font-bold text-slate-800">₹{stats.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by plant or block..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={filterBlock}
                onChange={(e) => setFilterBlock(e.target.value)}
                className="pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
              >
                <option value="">All Blocks</option>
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.nursery?.name})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm font-semibold flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreatePlantModal(true)}
              className="px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition text-sm font-semibold shadow-sm flex items-center gap-2"
            >
              <TreePine size={16} />
              New Plant
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm flex items-center gap-2 transition"
            >
              <PackagePlus size={16} />
              Add Batch
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-100 text-xs uppercase tracking-wider text-slate-400 font-semibold bg-slate-50/50">
                <th className="px-5 py-3.5">Block</th>
                <th className="px-5 py-3.5">Plant</th>
                <th className="px-5 py-3.5">Unit Price</th>
                <th className="px-5 py-3.5 text-center">Physical</th>
                <th className="px-5 py-3.5 text-center">Available</th>
                <th className="px-5 py-3.5 text-center">Reserved</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    <Layers size={32} className="mx-auto mb-3 text-slate-300" />
                    No inventory batches found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const reserved = (item.quantity || 0) - (item.availableQuantity || 0);
                  const stockValue = (item.quantity || 0) * parseFloat(item.unitPrice || 0);
                  const statusColor = item.availableQuantity === 0
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : item.availableQuantity < (item.quantity || 0) * 0.2
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <TreePine size={14} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{item.nurseryBlock?.name}</p>
                            <p className="text-[11px] text-slate-400">{item.nurseryBlock?.nursery?.name || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{item.plant?.name}</p>
                        <p className="text-[11px] text-slate-400">{item.plant?.category?.name} • {item.plant?.bagSize?.size}</p>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700">₹{parseFloat(item.unitPrice).toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-center font-semibold">{item.quantity}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-emerald-700">{item.availableQuantity}</td>
                      <td className="px-5 py-3.5 text-center font-semibold text-slate-600">
                        {reserved > 0 && <span className="text-amber-600">{reserved}</span>}
                        {reserved === 0 && <span className="text-slate-400">0</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColor}`}>
                          {item.status || 'AVAILABLE'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openHistoryModal(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Transaction History"
                          >
                            <History size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Update Batch"
                          >
                            <Edit3 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Batch Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create Inventory Batch">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nursery Block</label>
            <select
              required
              value={formData.nurseryBlockId}
              onChange={(e) => setFormData({ ...formData, nurseryBlockId: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Block...</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>{b.name} — {b.nursery?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Plant Variety</label>
            <select
              required
              value={formData.plantId}
              onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Plant...</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.bagSize?.size})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Unit Price (₹)</label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. 350"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition shadow-sm">Create Batch</button>
          </div>
        </form>
      </Modal>

      {/* Edit Batch Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); resetForm(); }} title={`Update Batch — ${selectedBatch?.plant?.name || 'Batch'}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">New Total Quantity</label>
            <input
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Override quantity"
            />
            <p className="text-[11px] text-slate-400 mt-1">Current: {selectedBatch?.quantity} | Available: {selectedBatch?.availableQuantity}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Add to Stock (+)</label>
            <input
              type="number"
              min="1"
              value={formData.addQuantity}
              onChange={(e) => setFormData({ ...formData, addQuantity: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 50 units received"
            />
            <p className="text-[11px] text-slate-400 mt-1">Leaving both empty will only update unit price.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">New Unit Price (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 400"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition shadow-sm">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Transaction History Modal */}
      <Modal isOpen={showHistoryModal} onClose={() => { setShowHistoryModal(false); setTransactions([]); }} title="Transaction History" width="max-w-2xl">
        {loadingHistory ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 w-full rounded-lg"></div>)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            <History size={28} className="mx-auto mb-3 text-slate-300" />
            No transactions recorded for this batch.
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${typeBadge(tx.type)}`}>
                    {tx.type}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Qty: {tx.quantity}</p>
                    <p className="text-[11px] text-slate-400">{tx.description || 'No description'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Create Plant Modal */}
      <Modal isOpen={showCreatePlantModal} onClose={() => setShowCreatePlantModal(false)} title="Create New Plant (Your Catalog)">
        <form onSubmit={handleCreatePlant} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Plant Name</label>
            <input
              type="text"
              required
              value={plantForm.name}
              onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Rose, Mango, Teak"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select
                required
                value={plantForm.categoryId}
                onChange={(e) => setPlantForm({ ...plantForm, categoryId: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Variety</label>
              <select
                required
                value={plantForm.varietyId}
                onChange={(e) => setPlantForm({ ...plantForm, varietyId: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select...</option>
                {varieties.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Bag Size</label>
              <select
                required
                value={plantForm.bagSizeId}
                onChange={(e) => setPlantForm({ ...plantForm, bagSizeId: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select...</option>
                {bagSizes.map((b) => <option key={b.id} value={b.id}>{b.size}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Height Standard</label>
              <select
                required
                value={plantForm.heightStandardId}
                onChange={(e) => setPlantForm({ ...plantForm, heightStandardId: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select...</option>
                {heightStandards.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Your Base Rate (₹)</label>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={plantForm.unitPrice}
              onChange={(e) => setPlantForm({ ...plantForm, unitPrice: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 350"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreatePlantModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition shadow-sm">Create Plant</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
