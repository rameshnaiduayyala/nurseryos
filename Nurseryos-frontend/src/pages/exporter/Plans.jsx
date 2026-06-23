import React, { useState, useEffect, useMemo } from 'react';
import { Check, ClipboardList, MapPin, PlusCircle, Search, Trash2, Route } from 'lucide-react';
import MapView from '../../components/MapView';
import RouteSummary from '../../components/RouteSummary';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const newListItem = () => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  plantName: '',
  quantity: 1,
});

const parsePlanNotes = (notes) => {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    return parsed?.kind === 'SOURCING_LIST' ? parsed : null;
  } catch {
    return null;
  }
};

export default function Plans() {
  const { setSuccess, setError } = useAuth();
  const [plansList, setPlansList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formMode, setFormMode] = useState('LIST');

  const [nurseries, setNurseries] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPlannedDate, setFormPlannedDate] = useState('');
  const [landscaperName, setLandscaperName] = useState('');
  const [listItems, setListItems] = useState([newListItem()]);
  const [sourceSelections, setSourceSelections] = useState({});
  const [formStops, setFormStops] = useState([{ nurseryId: '', plannedQuantity: 0, notes: '' }]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, nurseriesRes, inventoryRes] = await Promise.all([
        api.plans.list(),
        api.nurseries.list(),
        api.inventory.list(),
      ]);
      setPlansList(plansRes.data || []);
      setNurseries(nurseriesRes.data || []);
      setInventory(inventoryRes.data || []);
    } catch (err) {
      console.error('Failed to load plans', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sourcingPlans = useMemo(
    () => plansList.map((plan) => ({ plan, sourceList: parsePlanNotes(plan.notes) })),
    [plansList]
  );

  const getCandidatesForItem = (item) => {
    const query = item.plantName.trim().toLowerCase();
    if (!query) return [];

    const grouped = new Map();
    inventory.forEach((batch) => {
      const plantName = batch.plant?.name || '';
      const nursery = batch.nurseryBlock?.nursery;
      if (!nursery || !plantName.toLowerCase().includes(query) || (batch.availableQuantity || 0) <= 0) {
        return;
      }

      const key = `${batch.plant.id}-${nursery.id}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          plantId: batch.plant.id,
          plantName,
          nurseryId: nursery.id,
          nurseryName: nursery.name,
          nurseryLocation: nursery.location,
          farmerName: nursery.farmer?.fullName || 'Unknown farmer',
          farmerEmail: nursery.farmer?.email || 'No email',
          contactPerson: nursery.contactPerson || '',
          mobileNumber: nursery.mobileNumber || '',
          availableQuantity: 0,
          unitPrice: batch.unitPrice,
        });
      }

      const candidate = grouped.get(key);
      candidate.availableQuantity += batch.availableQuantity || 0;
      if (batch.unitPrice) candidate.unitPrice = batch.unitPrice;
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.nurseryName.localeCompare(b.nurseryName)
    );
  };

  const isCandidateSelected = (itemId, candidate) =>
    Boolean(
      sourceSelections[itemId]?.some(
        (selection) =>
          selection.plantId === candidate.plantId && selection.nurseryId === candidate.nurseryId
      )
    );

  const toggleCandidate = (itemId, candidate) => {
    setSourceSelections((prev) => {
      const existing = prev[itemId] || [];
      const selected = existing.some(
        (selection) =>
          selection.plantId === candidate.plantId && selection.nurseryId === candidate.nurseryId
      );

      return {
        ...prev,
        [itemId]: selected
          ? existing.filter(
              (selection) =>
                !(selection.plantId === candidate.plantId && selection.nurseryId === candidate.nurseryId)
            )
          : [...existing, candidate],
      };
    });
  };

  const handleCandidateClick = (itemId, candidate) => {
    const selected = isCandidateSelected(itemId, candidate);

    if (selected) {
      toggleCandidate(itemId, candidate);
      return;
    }

    const quantityInput = window.prompt(
      `How many ${candidate.plantName} plants do you want from ${candidate.nurseryName}?`,
      '1'
    );
    if (quantityInput == null) return;

    const quantity = Number(quantityInput);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError('Please enter a valid quantity greater than zero.');
      return;
    }

    setListItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, plantName: candidate.plantName, quantity }
          : item
      )
    );

    setSourceSelections((prev) => {
      const existing = prev[itemId] || [];
      const alreadySelected = existing.some(
        (selection) =>
          selection.plantId === candidate.plantId && selection.nurseryId === candidate.nurseryId
      );

      if (alreadySelected) return prev;

      return {
        ...prev,
        [itemId]: [...existing, candidate],
      };
    });
  };

  const getSelectedCandidatesForItem = (itemId) => sourceSelections[itemId] || [];

  const resetListForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPlannedDate('');
    setLandscaperName('');
    setListItems([newListItem()]);
    setSourceSelections({});
    setFormStops([{ nurseryId: '', plannedQuantity: 0, notes: '' }]);
  };

  const handleAddListItem = () => {
    setListItems((prev) => [...prev, newListItem()]);
  };

  const handleListItemChange = (itemId, field, value) => {
    setListItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveListItem = (itemId) => {
    setListItems((prev) => prev.filter((item) => item.id !== itemId));
    setSourceSelections((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleAddStop = () => {
    setFormStops([...formStops, { nurseryId: '', plannedQuantity: 0, notes: '' }]);
  };

  const handleRemoveStop = (idx) => {
    setFormStops(formStops.filter((_, i) => i !== idx));
  };

  const handleStopChange = (idx, field, value) => {
    const newStops = [...formStops];
    newStops[idx][field] = value;
    setFormStops(newStops);
  };

  const openPlanDetail = async (plan) => {
    try {
      const res = await api.plans.getById(plan.id);
      setSelectedPlan(res.data || plan);
    } catch (err) {
      console.error('Failed to load plan detail', err);
      setSelectedPlan(plan);
    }
  };

  const handleCreateListPlan = async (e) => {
    e.preventDefault();
    try {
      const validItems = listItems.filter((item) => item.plantName.trim());
      const selectedLines = validItems.flatMap((item) =>
        (sourceSelections[item.id] || []).map((selection) => ({
          itemId: item.id,
          requestedPlantName: item.plantName.trim(),
          requestedQuantity: item.quantity,
          ...selection,
        }))
      );

      if (validItems.length === 0) {
        throw new Error('Add at least one plant to the landscaper list.');
      }

      if (selectedLines.length === 0) {
        throw new Error('Tick at least one nursery source before saving the list.');
      }

      const stopMap = new Map();
      selectedLines.forEach((line) => {
        if (!stopMap.has(line.nurseryId)) {
          stopMap.set(line.nurseryId, {
            nurseryId: line.nurseryId,
            plannedQuantity: 0,
            notes: [],
          });
        }

        const stop = stopMap.get(line.nurseryId);
        stop.plannedQuantity += Number(line.requestedQuantity) || 0;
        stop.notes.push(`${line.requestedPlantName} x ${line.requestedQuantity}`);
      });

      const res = await api.plans.create({
        name: formName || `${landscaperName || 'Landscaper'} sourcing list`,
        description: formDescription || `Plant sourcing list for ${landscaperName || 'landscaper'}`,
        type: 'COLLECTION',
        plannedDate: formPlannedDate ? new Date(formPlannedDate).toISOString() : undefined,
        notes: JSON.stringify({
          kind: 'SOURCING_LIST',
          landscaperName,
          items: validItems,
          selectedSources: selectedLines,
        }),
        stops: Array.from(stopMap.values()).map((stop) => ({
          nurseryId: stop.nurseryId,
          plannedQuantity: stop.plannedQuantity,
          notes: stop.notes.join(', '),
        })),
      });

      setSuccess('Sourcing list saved as a collection plan.');
      setSelectedPlan(res.data || null);
      resetListForm();
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateManualPlan = async (e) => {
    e.preventDefault();
    try {
      const validStops = formStops.filter((s) => s.nurseryId);
      if (validStops.length === 0) {
        throw new Error('At least one nursery stop is required');
      }
      const res = await api.plans.create({
        name: formName,
        description: formDescription,
        type: 'COLLECTION',
        plannedDate: formPlannedDate ? new Date(formPlannedDate).toISOString() : undefined,
        stops: validStops,
      });
      setSuccess('Operational plan created successfully.');
      setSelectedPlan(res.data || null);
      resetListForm();
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.plans.updateStatus(id, status);
      setSuccess(`Plan status updated to ${status}`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadPlanPdf = async () => {
    if (!selectedPlanDetail) return;
    try {
      const blob = await api.plans.downloadPdf(selectedPlanDetail.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `route-sheet-${selectedPlanDetail.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess('Route sheet PDF downloaded.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading plans...</div>;

  const selectedPlanDetail = selectedPlan;
  const selectedPlanSourceList = selectedPlanDetail ? parsePlanNotes(selectedPlanDetail.notes) : null;
  const selectedPlanStops = selectedPlanDetail?.stops || [];
  const selectedNurseryLoads = selectedPlanStops.map((stop) => {
    const selectedSources = selectedPlanSourceList?.selectedSources?.filter(
      (line) => line.nurseryId === stop.nurseryId
    ) || [];
    return {
      ...stop,
      selectedSources,
      totalPlants:
        stop.plannedQuantity ||
        selectedSources.reduce((sum, line) => sum + (Number(line.requestedQuantity) || 0), 0),
    };
  });
  const selectedPlanMarkers = selectedPlanStops.filter(
    (stop) => stop.nursery?.latitude != null && stop.nursery?.longitude != null
  );
  const selectedPlanCenter = selectedPlanMarkers.length > 0
    ? [selectedPlanMarkers[0].nursery.latitude, selectedPlanMarkers[0].nursery.longitude]
    : [45.0, -122.0];

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50">
            <ClipboardList className="text-emerald-700" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Sourcing Lists & Plans</h4>
            <p className="text-xs text-slate-400">Plant checklist, nursery ticks, route map, and dispatch planning</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm"
        >
          {showForm ? 'Cancel' : 'Create List'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h5 className="text-sm font-bold text-slate-800">New Exporter List</h5>
            <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setFormMode('LIST')}
                className={`px-3 py-1.5 text-xs font-semibold ${
                  formMode === 'LIST' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600'
                }`}
              >
                Plant List
              </button>
              <button
                type="button"
                onClick={() => setFormMode('STOPS')}
                className={`px-3 py-1.5 text-xs font-semibold ${
                  formMode === 'STOPS' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-600'
                }`}
              >
                Manual Stops
              </button>
            </div>
          </div>

          <form onSubmit={formMode === 'LIST' ? handleCreateListPlan : handleCreateManualPlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">List Name</label>
                <input
                  type="text"
                  required={formMode === 'STOPS'}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Project or list name"
                />
              </div>
              {formMode === 'LIST' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Landscaper</label>
                  <input
                    type="text"
                    value={landscaperName}
                    onChange={(e) => setLandscaperName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Customer or landscaper"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Planned Date</label>
                <input
                  type="date"
                  value={formPlannedDate}
                  onChange={(e) => setFormPlannedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows={2}
              />
            </div>

            {formMode === 'LIST' ? (
              <div className="space-y-4">
                {listItems.map((item, idx) => {
                  const candidates = getCandidatesForItem(item);
                  const selectedCandidates = getSelectedCandidatesForItem(item.id);
                  return (
                    <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3 items-end">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <label className="block text-xs font-semibold text-slate-500">Plant {idx + 1}</label>
                            <span className="text-[11px] text-slate-400">
                              Edit until submit
                            </span>
                          </div>
                          <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={item.plantName}
                              onChange={(e) => handleListItemChange(item.id, 'plantName', e.target.value)}
                              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              placeholder="Search plant to load available farmers"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleListItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveListItem(item.id)}
                          disabled={listItems.length === 1}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {candidates.map((candidate) => {
                          const selected = isCandidateSelected(item.id, candidate);
                          return (
                            <button
                              key={`${candidate.plantId}-${candidate.nurseryId}`}
                              type="button"
                              onClick={() => handleCandidateClick(item.id, candidate)}
                              className={`text-left rounded-lg border p-3 transition ${
                                selected
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-slate-200 hover:border-emerald-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{candidate.nurseryName}</p>
                                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                    <MapPin size={12} />
                                    {candidate.nurseryLocation || 'Location not set'}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    Farmer: {candidate.farmerName}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {candidate.farmerEmail}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {candidate.contactPerson || '-'}{candidate.mobileNumber ? ` | ${candidate.mobileNumber}` : ''}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {candidate.plantName} - {candidate.availableQuantity} available
                                  </p>
                                </div>
                                <span
                                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                                    selected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                                  }`}
                                >
                                  {selected && <Check size={13} />}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {selectedCandidates.length > 0 && (
                        <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                          <p className="text-xs font-semibold text-emerald-800 mb-2">Selected sources</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedCandidates.map((candidate) => (
                              <button
                                key={`${candidate.plantId}-${candidate.nurseryId}`}
                                type="button"
                                onClick={() => toggleCandidate(item.id, candidate)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-emerald-700 border border-emerald-200"
                              >
                                <Check size={12} />
                                <span>{candidate.nurseryName}</span>
                                <span className="text-emerald-400">qty {item.quantity}</span>
                                <Trash2 size={12} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.plantName.trim() && candidates.length === 0 && (
                        <p className="text-xs text-slate-400 mt-3">No nursery stock found for this plant search.</p>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddListItem}
                  className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1 transition"
                >
                  <PlusCircle size={18} />
                  <span>Add Plant</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <h6 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Stop Nodes</h6>
                {formStops.map((stop, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Nursery</label>
                      <select
                        required
                        value={stop.nurseryId}
                        onChange={(e) => handleStopChange(idx, 'nurseryId', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Select Nursery...</option>
                        {nurseries.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name} ({n.location})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Planned Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={stop.plannedQuantity}
                        onChange={(e) => handleStopChange(idx, 'plannedQuantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Notes</label>
                      <input
                        type="text"
                        value={stop.notes}
                        onChange={(e) => handleStopChange(idx, 'notes', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold px-2 py-1.5 rounded hover:bg-rose-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1 mt-2 transition"
                >
                  <ClipboardList size={18} />
                  <span>Add Stop Node</span>
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg text-md transition duration-200 shadow-sm"
            >
              Save Collection Plan
            </button>
          </form>
        </div>
      )}

      {selectedPlanDetail && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={16} className="text-emerald-700" />
                  <span>{selectedPlanDetail.name}</span>
                </h5>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedPlanDetail.totalStops} stops, {selectedPlanDetail.totalQuantity || 0} plants
                </p>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Close Details
              </button>
            </div>
            <button
              type="button"
              onClick={handleDownloadPlanPdf}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm"
            >
              Download Route PDF
            </button>

            {selectedPlanSourceList && (
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                  {selectedPlanSourceList.landscaperName || 'Landscaper'} plant checklist
                </p>
                <div className="space-y-2">
                  {(selectedPlanSourceList.items || []).map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{item.plantName}</span>
                      </div>
                      <span className="text-xs text-slate-500 shrink-0">Qty {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h6 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Selected Nurseries</h6>
                <span className="text-xs text-slate-400">{selectedNurseryLoads.length} stops</span>
              </div>
              <div className="space-y-3">
                {selectedNurseryLoads.map((stop, idx) => (
                  <div key={stop.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800">
                          {idx + 1}. {stop.nursery?.name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} />
                          <span>{stop.nursery?.location}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Farmer: {stop.nursery?.farmer?.fullName || 'Unknown farmer'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {stop.nursery?.farmer?.email || 'No email'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Contact: {stop.nursery?.contactPerson || '-'}{stop.nursery?.mobileNumber ? ` | ${stop.nursery.mobileNumber}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">
                        {stop.totalPlants} plants
                      </span>
                    </div>
                    <div className="mt-3 space-y-1">
                      {stop.selectedSources.map((line, lineIdx) => (
                        <div key={`${line.itemId}-${lineIdx}`} className="flex justify-between gap-3 text-xs text-slate-600">
                          <span className="truncate">{line.requestedPlantName}</span>
                          <span className="shrink-0">Qty {line.requestedQuantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center gap-2 mb-3">
                <Route size={16} className="text-emerald-700" />
                <h6 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Collection route</h6>
              </div>
              {selectedPlanStops.length > 0 ? (
                <div className="space-y-3">
                  {selectedPlanStops.map((stop, idx) => {
                    const stopDetail = selectedPlanSourceList?.selectedSources?.filter(
                      (line) => line.nurseryId === stop.nurseryId
                    ) || [];
                    const farmerName = stop.nursery?.farmer?.fullName || 'Unknown farmer';
                    const farmerEmail = stop.nursery?.farmer?.email || 'No email';
                    return (
                      <div key={stop.id} className="rounded-lg border border-slate-100 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800">
                              {idx + 1}. {stop.nursery?.name}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={12} />
                              <span>{stop.nursery?.location}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Farmer: {farmerName} | {farmerEmail}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Contact: {stop.nursery?.contactPerson || '-'}{stop.nursery?.mobileNumber ? ` | ${stop.nursery.mobileNumber}` : ''}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700">
                            {stop.plannedQuantity || 0} plants
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-1 text-xs text-slate-600">
                          {stopDetail.map((line, lineIdx) => (
                            <div key={`${line.itemId}-${lineIdx}`} className="flex justify-between gap-3">
                              <span className="truncate">{line.requestedPlantName}</span>
                              <span className="shrink-0">Qty {line.requestedQuantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No collection stops were generated for this list.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <MapView
                center={selectedPlanCenter}
                zoom={12}
                markers={selectedPlanMarkers.map((stop, idx) => ({
                  lat: stop.nursery.latitude,
                  lng: stop.nursery.longitude,
                  label: `${idx + 1}. ${stop.nursery.name} - ${stop.plannedQuantity || 0} plants`,
                  color: '#059669',
                }))}
                className="h-72 w-full rounded-xl border border-slate-200"
              />
              <p className="text-xs text-slate-400 mt-2">
                Map shows the optimized collection line-up for the saved list.
              </p>
            </div>
            <RouteSummary stops={selectedPlanStops} />
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h5 className="text-sm font-bold text-slate-800 mb-4">Saved Lists</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 font-semibold text-slate-500">
                <th className="pb-2">List</th>
                <th className="pb-2">Landscaper</th>
                <th className="pb-2">Stops</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Planned Date</th>
                <th className="pb-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sourcingPlans.map(({ plan, sourceList }) => (
                <tr
                  key={plan.id}
                  onClick={() => openPlanDetail(plan)}
                  className={`border-b border-slate-100 cursor-pointer transition ${
                    selectedPlan?.id === plan.id ? 'bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 font-semibold">{plan.name}</td>
                  <td className="py-3 text-slate-500">{sourceList?.landscaperName || '-'}</td>
                  <td className="py-3 font-semibold">{plan.totalStops}</td>
                  <td className="py-3 font-bold text-emerald-800">{plan.status}</td>
                  <td className="py-3 text-slate-500">
                    {plan.plannedDate ? new Date(plan.plannedDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {plan.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(plan.id, 'ACTIVE');
                            }}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                          >
                            Activate
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(plan.id, 'CANCELLED');
                            }}
                            className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {plan.status === 'ACTIVE' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(plan.id, 'COMPLETED');
                          }}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {plansList.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">
                    No lists created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
