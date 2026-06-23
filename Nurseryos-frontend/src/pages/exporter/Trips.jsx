import React, { useState, useEffect } from 'react';
import { ClipboardList, MapPin, PlusCircle, Truck } from 'lucide-react';
import MapView from '../../components/MapView';
import RouteSummary from '../../components/RouteSummary';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const parsePlanNotes = (notes) => {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    return parsed?.kind === 'SOURCING_LIST' ? parsed : null;
  } catch {
    return null;
  }
};

export default function Trips() {
  const { setSuccess, setError } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [nurseries, setNurseries] = useState([]);
  const [plans, setPlans] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState(null);
  const [loadingPlanDetail, setLoadingPlanDetail] = useState(false);

  // Form states
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [tripStops, setTripStops] = useState([{ nurseryId: '', stopOrder: 1 }]);

  const loadData = async () => {
    try {
      setLoading(true);
      const vehicleRes = await api.vehicles.list();
      setVehicles(vehicleRes.data || []);

      const driverRes = await api.drivers.list();
      setDrivers(driverRes.data || []);

      const supervisorRes = await api.supervisors.list();
      setSupervisors(supervisorRes.data || []);

      const nurseriesRes = await api.nurseries.list();
      setNurseries(nurseriesRes.data || []);

      const plansRes = await api.plans.list();
      setPlans((plansRes.data || []).filter((plan) => plan.status !== 'CANCELLED'));

      const tripsRes = await api.trips.list();
      setTripsList(tripsRes.data || []);
    } catch (err) {
      console.error('Failed to load trips dependencies', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      setTripStops([{ nurseryId: '', stopOrder: 1 }]);
      setSelectedPlanDetail(null);
      return;
    }

    const stops = (plan.stops || []).map((stop, idx) => ({
      nurseryId: stop.nurseryId,
      stopOrder: idx + 1,
    }));
    setTripStops(stops.length > 0 ? stops : [{ nurseryId: '', stopOrder: 1 }]);

    const loadDetail = async () => {
      try {
        setLoadingPlanDetail(true);
        const res = await api.plans.getById(planId);
        setSelectedPlanDetail(res.data || null);
      } catch (err) {
        console.error('Failed to load plan detail', err);
        setSelectedPlanDetail(plan);
      } finally {
        setLoadingPlanDetail(false);
      }
    };

    loadDetail();
  };

  const handleTripCreate = async (e) => {
    e.preventDefault();
    try {
      const departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + 1); // tomorrow

      const stops = tripStops
        .filter((st) => st.nurseryId !== '')
        .map((st, idx) => ({
          nurseryId: st.nurseryId,
          stopOrder: idx + 1,
        }));

      if (stops.length === 0) {
        throw new Error('Please add at least one stop node.');
      }

      await api.trips.create({
        vehicleId: selectedVehicle,
        driverId: selectedDriver,
        supervisorId: selectedSupervisor,
        departureDate: departureDate.toISOString(),
        stops: stops,
      });

      setSuccess('Collection trip created! Stops optimized sequentially.');
      setSelectedPlan('');
      setSelectedPlanDetail(null);
      setSelectedVehicle('');
      setSelectedDriver('');
      setSelectedSupervisor('');
      setTripStops([{ nurseryId: '', stopOrder: 1 }]);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading Trips dispatcher...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Truck className="text-emerald-700" size={20} />
          <span>Plan Collection Trip (Route Optimization)</span>
        </h4>
        <form onSubmit={handleTripCreate} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Load Exporter List</label>
            <select
              value={selectedPlan}
              onChange={(e) => handlePlanSelect(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Build trip manually...</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.totalStops} stops)
                </option>
              ))}
            </select>
          </div>

          {selectedPlanDetail && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList size={16} className="text-emerald-700" />
                    <span>{selectedPlanDetail.name}</span>
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedPlanDetail.totalStops} stops, {selectedPlanDetail.totalQuantity || 0} plants
                  </p>
                </div>
                {loadingPlanDetail && (
                  <span className="text-xs text-slate-400">Loading list detail...</span>
                )}
              </div>

              {parsePlanNotes(selectedPlanDetail.notes) && (
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Plant checklist</p>
                  <div className="space-y-2">
                    {(parsePlanNotes(selectedPlanDetail.notes).items || []).map((item, idx) => (
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

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Collection stops</p>
                <div className="space-y-3">
                  {tripStops.map((stop, idx) => {
                    const nursery = nurseries.find((n) => n.id === stop.nurseryId);
                    if (!nursery) return null;
                    const sourceList = parsePlanNotes(selectedPlanDetail.notes);
                    const selectedSources = sourceList?.selectedSources?.filter(
                      (line) => line.nurseryId === nursery.id
                    ) || [];
                    const nurseryDetail = selectedPlanDetail?.stops?.find((s) => s.nurseryId === nursery.id)?.nursery;
                    return (
                      <div key={`${stop.nurseryId}-${idx}`} className="rounded-lg border border-slate-100 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-800">
                              {idx + 1}. {nursery.name}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={12} />
                              <span>{nursery.location}</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Farmer: {nurseryDetail?.farmer?.fullName || 'Unknown farmer'} | {nurseryDetail?.farmer?.email || 'No email'}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Contact: {nurseryDetail?.contactPerson || '-'}{nurseryDetail?.mobileNumber ? ` | ${nurseryDetail.mobileNumber}` : ''}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-emerald-700">Stop {idx + 1}</span>
                        </div>
                        <div className="mt-3 space-y-1">
                          {selectedSources.map((line, lineIdx) => (
                            <div key={`${line.itemId}-${lineIdx}`} className="flex justify-between gap-3 text-xs text-slate-600">
                              <span className="truncate">{line.requestedPlantName}</span>
                              <span className="shrink-0">Qty {line.requestedQuantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {tripStops.some((stop) => nurseries.find((n) => n.id === stop.nurseryId)?.latitude != null) && (
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <MapView
                    center={[
                      nurseries.find((n) => n.id === tripStops[0]?.nurseryId)?.latitude || 45.0,
                      nurseries.find((n) => n.id === tripStops[0]?.nurseryId)?.longitude || -122.0,
                    ]}
                    zoom={12}
                    markers={tripStops
                      .map((stop, idx) => {
                        const nursery = nurseries.find((n) => n.id === stop.nurseryId);
                        if (!nursery?.latitude || !nursery?.longitude) return null;
                        return {
                          lat: nursery.latitude,
                          lng: nursery.longitude,
                          label: `${idx + 1}. ${nursery.name}`,
                          color: '#059669',
                        };
                      })
                      .filter(Boolean)}
                    className="h-72 w-full rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <RouteSummary
                stops={tripStops
                  .map((stop) => ({
                    id: stop.nurseryId,
                    nursery: nurseries.find((n) => n.id === stop.nurseryId),
                  }))
                  .filter((stop) => stop.nursery)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select Lorry/Vehicle</label>
              <select 
                required 
                value={selectedVehicle} 
                onChange={(e) => setSelectedVehicle(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Select Vehicle...</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.model} ({v.licensePlate})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select Driver</label>
              <select 
                required 
                value={selectedDriver} 
                onChange={(e) => setSelectedDriver(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Select Driver...</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.user?.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Assign Supervisor</label>
              <select 
                required 
                value={selectedSupervisor} 
                onChange={(e) => setSelectedSupervisor(e.target.value)} 
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Select Supervisor...</option>
                {supervisors.map((s) => <option key={s.id} value={s.id}>{s.user?.fullName}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-bold text-slate-700">Trip Stop Nodes</h5>
            {tripStops.map((stop, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="flex-1">
                  <select 
                    required 
                    value={stop.nurseryId} 
                    onChange={(e) => {
                      const newStops = [...tripStops];
                      newStops[idx].nurseryId = e.target.value;
                      setTripStops(newStops);
                    }} 
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select Nursery Stop...</option>
                    {nurseries.map((n) => <option key={n.id} value={n.id}>{n.name} ({n.location})</option>)}
                  </select>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    if (tripStops.length > 1) {
                      setTripStops(tripStops.filter((_, i) => i !== idx));
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
              onClick={() => setTripStops([...tripStops, { nurseryId: '', stopOrder: tripStops.length + 1 }])} 
              className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1 mt-2 transition"
            >
              <PlusCircle size={18} />
              <span>Add Stop Node</span>
            </button>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg text-md transition duration-200 shadow-sm"
          >
            Optimize Route & Save Dispatch Trip
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 mb-4 text-md">Planned Collection Trips</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 font-semibold text-slate-500">
                <th className="pb-2">Trip ID</th>
                <th className="pb-2">Lorry</th>
                <th className="pb-2">Driver</th>
                <th className="pb-2">Supervisor</th>
                <th className="pb-2">Departure</th>
                <th className="pb-2">Stops</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {tripsList.map((t) => (
                <tr key={t.id} className="border-b border-slate-100">
                  <td className="py-3 font-semibold">{t.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-3">{t.vehicle?.model || 'N/A'}</td>
                  <td className="py-3">{t.driver?.user?.fullName || 'N/A'}</td>
                  <td className="py-3">{t.supervisor?.user?.fullName || 'N/A'}</td>
                  <td className="py-3 text-slate-500">{new Date(t.departureDate).toLocaleDateString()}</td>
                  <td className="py-3 font-semibold">{t.stops?.length || 0} stops</td>
                  <td className="py-3 font-bold text-emerald-800">{t.status}</td>
                </tr>
              ))}
              {tripsList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400">No trips planned yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
