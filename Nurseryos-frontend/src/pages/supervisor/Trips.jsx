import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, Navigation, Camera, ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Trips() {
  const { setSuccess, setError } = useAuth();
  const [supervisorTrips, setSupervisorTrips] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stop progression states
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState('');
  const [collectionPlantId, setCollectionPlantId] = useState('');
  const [collectionQuantity, setCollectionQuantity] = useState('');
  const [collectionPhoto, setCollectionPhoto] = useState(null);
  const [submittingCollection, setSubmittingCollection] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const tripsRes = await api.trips.list();
      setSupervisorTrips(tripsRes.data || []);
      
      const plantsRes = await api.plants.list();
      setPlants(plantsRes.data || []);
    } catch (err) {
      console.error('Failed to load supervisor trips', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewTripDetails = async (trip) => {
    try {
      const res = await api.trips.getTripById(trip.id);
      setSelectedTrip(res.data);
      if (res.data.stops && res.data.stops.length > 0) {
        setSelectedStopId(res.data.stops[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdvanceTripStatus = async () => {
    if (!selectedTrip) return;
    try {
      const nextStat = selectedTrip.status === 'PLANNED' ? 'IN_TRANSIT' : 'COMPLETED';
      await api.trips.updateStatus(selectedTrip.id, nextStat);
      setSuccess(`Trip status advanced to ${nextStat}.`);
      
      // reload trip details
      const details = await api.trips.getTripById(selectedTrip.id);
      setSelectedTrip(details.data);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const changeStopStatus = async (stopId, status) => {
    try {
      await api.collections.updateStopStatus(stopId, status);
      setSuccess(`Stop marked as ${status}`);
      if (selectedTrip) {
        const details = await api.trips.getTripById(selectedTrip.id);
        setSelectedTrip(details.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStopId) {
      setError('Please select a stop to log collection.');
      return;
    }
    try {
      setSubmittingCollection(true);
      const formData = new FormData();
      formData.append('tripStopId', selectedStopId);
      formData.append('plantId', collectionPlantId);
      formData.append('quantityCollected', collectionQuantity);
      if (collectionPhoto) {
        formData.append('photo', collectionPhoto);
      }

      await api.collections.collect(formData);
      setSuccess('Collection logged and stock updated.');
      setCollectionQuantity('');
      setCollectionPlantId('');
      setCollectionPhoto(null);
      
      // refresh trip details
      const details = await api.trips.getTripById(selectedTrip.id);
      setSelectedTrip(details.data);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingCollection(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading supervisor routes...</div>;

  if (selectedTrip) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedTrip(null)}
          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold text-sm transition"
        >
          <ChevronLeft size={16} />
          <span>Back to Assigned Trips</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h4 className="text-md font-bold text-slate-800">
                  Trip Stop Progression: {selectedTrip.id.slice(0, 8).toUpperCase()}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Lorry: {selectedTrip.vehicle?.model} ({selectedTrip.vehicle?.licensePlate}) | Driver: {selectedTrip.driver?.user?.fullName}
                </p>
              </div>
              
              <button 
                onClick={handleAdvanceTripStatus} 
                disabled={selectedTrip.status === 'COMPLETED'}
                className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded transition"
              >
                Advance Status: {selectedTrip.status}
              </button>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
              {selectedTrip.stops.map((stop, idx) => (
                <div key={stop.id} className="relative">
                  <span className="absolute -left-10 top-0.5 bg-white border-2 border-emerald-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-emerald-800 shadow-sm">
                    {idx + 1}
                  </span>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h5 className="font-bold text-sm text-slate-800">{stop.nursery?.name}</h5>
                      <p className="text-xs text-slate-500">{stop.nursery?.location}</p>
                      <div className="text-xs font-bold text-slate-600 mt-1">Status: {stop.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        disabled={stop.status !== 'PENDING'} 
                        onClick={() => changeStopStatus(stop.id, 'ARRIVED')} 
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded transition duration-200"
                      >
                        Mark Arrived
                      </button>
                      <button 
                        disabled={stop.status !== 'ARRIVED'} 
                        onClick={() => changeStopStatus(stop.id, 'DEPARTED')} 
                        className="bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded transition duration-200"
                      >
                        Mark Departed
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h4 className="text-md font-bold text-slate-800 mb-4">Record Stop Collection</h4>
            <form onSubmit={handleCollectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Stop Node</label>
                <select 
                  required
                  value={selectedStopId}
                  onChange={(e) => setSelectedStopId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {selectedTrip.stops.map((stop) => (
                    <option key={stop.id} value={stop.id}>{stop.nursery?.name} ({stop.status})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select Plant Collected</label>
                <select 
                  required 
                  value={collectionPlantId} 
                  onChange={(e) => setCollectionPlantId(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select Plant...</option>
                  {plants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Quantity Collected</label>
                <input 
                  type="number" 
                  required 
                  min="1" 
                  value={collectionQuantity} 
                  onChange={(e) => setCollectionQuantity(e.target.value)} 
                  placeholder="e.g. 50" 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Collection Receipt Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setCollectionPhoto(e.target.files[0])} 
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
              <button 
                type="submit" 
                disabled={submittingCollection}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 rounded-lg text-sm transition disabled:opacity-50"
              >
                {submittingCollection ? 'Logging...' : 'Log Collection & Deduct Stock'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h4 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Truck className="text-emerald-700" size={20} />
        <span>Assigned Routes & Collection Trips</span>
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold text-sm">
              <th className="pb-3">Trip ID</th>
              <th className="pb-3">Vehicle</th>
              <th className="pb-3">Driver</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Stops</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {supervisorTrips.map((trip) => (
              <tr key={trip.id} className="border-b border-slate-100 text-slate-700 text-sm">
                <td className="py-3 font-medium">{trip.id.slice(0, 8).toUpperCase()}</td>
                <td className="py-3">{trip.vehicle?.model || 'N/A'}</td>
                <td className="py-3">{trip.driver?.user?.fullName || 'N/A'}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    trip.status === 'COMPLETED' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {trip.status}
                  </span>
                </td>
                <td className="py-3">{trip.stops?.length || 0} stops</td>
                <td className="py-3">
                  <button 
                    onClick={() => handleViewTripDetails(trip)} 
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition duration-200 shadow-sm"
                  >
                    Open Stop Routing
                  </button>
                </td>
              </tr>
            ))}
            {supervisorTrips.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400">No trips assigned yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
