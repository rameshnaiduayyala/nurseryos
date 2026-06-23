import React, { useState, useEffect } from 'react';
import { PlusCircle, Truck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Trips() {
  const { setSuccess, setError } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [nurseries, setNurseries] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
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
