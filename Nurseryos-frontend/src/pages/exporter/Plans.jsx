import React, { useState, useEffect } from 'react';
import { MapPin, ClipboardList, Search, ChevronDown, ChevronUp } from 'lucide-react';
import MapView from '../../components/MapView';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Plans() {
  const { setSuccess, setError } = useAuth();
  const [plansList, setPlansList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [nurseries, setNurseries] = useState([]);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPlannedDate, setFormPlannedDate] = useState('');
  const [formStops, setFormStops] = useState([{ nurseryId: '', plannedQuantity: 0, notes: '' }]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, nurseriesRes] = await Promise.all([
        api.plans.list(),
        api.nurseries.list(),
      ]);
      setPlansList(plansRes.data || []);
      setNurseries(nurseriesRes.data || []);
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

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const validStops = formStops.filter((s) => s.nurseryId);
      if (validStops.length === 0) {
        throw new Error('At least one nursery stop is required');
      }
      await api.plans.create({
        name: formName,
        description: formDescription,
        plannedDate: formPlannedDate || undefined,
        stops: validStops,
      });
      setSuccess('Operational plan created successfully!');
      setFormName('');
      setFormDescription('');
      setFormPlannedDate('');
      setFormStops([{ nurseryId: '', plannedQuantity: 0, notes: '' }]);
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

  if (loading) return <div className="text-slate-500">Loading plans...</div>;

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50">
            <ClipboardList className="text-emerald-700" size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Operational Plans</h4>
            <p className="text-xs text-slate-400">Location-wise planning & stop tracking</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm"
        >
          {showForm ? 'Cancel' : 'Create Plan'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h5 className="text-sm font-bold text-slate-800 mb-4">New Operational Plan</h5>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Enter plan name"
                />
              </div>
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
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows={2}
              />
            </div>

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
                        <option key={n.id} value={n.id}>{n.name} ({n.location})</option>
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

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg text-md transition duration-200 shadow-sm"
            >
              Save Operational Plan
            </button>
          </form>
        </div>
      )}

      {selectedPlan && (() => {
        const stopsWithCoords = (selectedPlan.stops || []).filter(
          (s) => s.nursery?.latitude != null && s.nursery?.longitude != null
        );
        const markers = stopsWithCoords.map((s) => ({
          lat: s.nursery.latitude,
          lng: s.nursery.longitude,
          label: s.nursery.name,
          color: '#059669',
        }));
        const center =
          markers.length > 0
            ? [markers[0].lat, markers[0].lng]
            : [45.0, -122.0];

        return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-sm font-bold text-slate-800">
                Route Map: {selectedPlan.name}
              </h5>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                Close Map
              </button>
            </div>
            <MapView center={center} zoom={12} markers={markers} />
            {stopsWithCoords.length === 0 && (
              <p className="text-xs text-slate-400 mt-2">
                No coordinates available for this plan's stops.
              </p>
            )}
          </div>
        );
      })()}

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h5 className="text-sm font-bold text-slate-800 mb-4">Saved Plans</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 font-semibold text-slate-500">
                <th className="pb-2">Plan</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Stops</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Planned Date</th>
                <th className="pb-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plansList.map((plan) => (
                <tr
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`border-b border-slate-100 cursor-pointer transition ${
                    selectedPlan?.id === plan.id
                      ? 'bg-emerald-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 font-semibold">{plan.name}</td>
                  <td className="py-3 text-slate-500">{plan.type}</td>
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
                  <td colSpan={6} className="py-4 text-center text-slate-400">No plans created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
