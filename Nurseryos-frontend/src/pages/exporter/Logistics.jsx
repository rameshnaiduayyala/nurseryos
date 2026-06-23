import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Logistics() {
  const { setSuccess, setError } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleCapacity, setNewVehicleCapacity] = useState('');
  const [newDriverUserId, setNewDriverUserId] = useState('');
  const [newDriverLicense, setNewDriverLicense] = useState('');
  const [newSupervisorUserId, setNewSupervisorUserId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const vehicleRes = await api.vehicles.list();
      setVehicles(vehicleRes.data || []);

      const driverRes = await api.drivers.list();
      setDrivers(driverRes.data || []);

      const supervisorRes = await api.supervisors.list();
      setSupervisors(supervisorRes.data || []);

      const usersRes = await api.users.list();
      setUsersList(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load logistics assets data', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.vehicles.create(newVehiclePlate, newVehicleModel, newVehicleCapacity);
      setSuccess('Lorry added to fleet.');
      setNewVehiclePlate('');
      setNewVehicleModel('');
      setNewVehicleCapacity('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitDriver = async (e) => {
    e.preventDefault();
    try {
      await api.drivers.create(newDriverUserId, newDriverLicense);
      setSuccess('Driver profile registered successfully.');
      setNewDriverUserId('');
      setNewDriverLicense('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitSupervisor = async (e) => {
    e.preventDefault();
    try {
      await api.supervisors.create(newSupervisorUserId);
      setSuccess('Supervisor profile registered successfully.');
      setNewSupervisorUserId('');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading Logistics Registry...</div>;

  return (
    <div className="space-y-8">
      {/* Vehicles Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Lorry Fleet Management</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h4 className="font-bold text-slate-800 mb-4 text-sm">Register Lorry to Fleet</h4>
            <form onSubmit={submitVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">License Plate</label>
                <input 
                  type="text" 
                  placeholder="e.g. CA-992-OS" 
                  value={newVehiclePlate} 
                  onChange={(e) => setNewVehiclePlate(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Model / Specifications</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ford F-350" 
                  value={newVehicleModel} 
                  onChange={(e) => setNewVehicleModel(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Capacity Weight (kg)</label>
                <input 
                  type="number" 
                  value={newVehicleCapacity} 
                  onChange={(e) => setNewVehicleCapacity(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg text-sm font-semibold transition"
              >
                Register Vehicle
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 text-sm">Active Vehicle Fleet</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 font-semibold text-slate-500">
                    <th className="pb-2">Lorry Plate</th>
                    <th className="pb-2">Specifications</th>
                    <th className="pb-2">Capacity</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="border-b border-slate-100">
                      <td className="py-3 font-semibold">{v.licensePlate}</td>
                      <td className="py-3">{v.model}</td>
                      <td className="py-3">{v.capacity} kg</td>
                      <td className="py-3 font-semibold text-emerald-800">{v.status}</td>
                    </tr>
                  ))}
                  {vehicles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">No vehicles registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Drivers Directory</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h4 className="font-bold text-slate-800 mb-4 text-sm">Designate User as Driver</h4>
            <form onSubmit={submitDriver} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select User Profile</label>
                <select 
                  required 
                  value={newDriverUserId} 
                  onChange={(e) => setNewDriverUserId(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select user...</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">License Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. DL-12345" 
                  value={newDriverLicense} 
                  onChange={(e) => setNewDriverLicense(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg text-sm font-semibold transition"
              >
                Create Driver Profile
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 text-sm">Active Drivers</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 font-semibold text-slate-500">
                    <th className="pb-2">Driver Name</th>
                    <th className="pb-2">License Number</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100">
                      <td className="py-3 font-semibold">{d.user?.fullName || 'User Profile Loaded...'}</td>
                      <td className="py-3">{d.licenseNumber}</td>
                      <td className="py-3 font-semibold text-emerald-800">{d.status}</td>
                    </tr>
                  ))}
                  {drivers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400">No active drivers registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Supervisors Section */}
      <div className="border-t border-slate-200 pt-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Supervisors Directory</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h4 className="font-bold text-slate-800 mb-4 text-sm">Designate User as Supervisor</h4>
            <form onSubmit={submitSupervisor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Select User Profile</label>
                <select 
                  required 
                  value={newSupervisorUserId} 
                  onChange={(e) => setNewSupervisorUserId(e.target.value)} 
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select user...</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg text-sm font-semibold transition"
              >
                Create Supervisor Profile
              </button>
            </form>
          </div>
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 text-sm">Active Supervisors</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 font-semibold text-slate-500">
                    <th className="pb-2">Supervisor Name</th>
                    <th className="pb-2">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {supervisors.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-3 font-semibold">{s.user?.fullName || 'User Profile Loaded...'}</td>
                      <td className="py-3">{s.user?.email || 'N/A'}</td>
                    </tr>
                  ))}
                  {supervisors.length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-4 text-center text-slate-400">No active supervisors registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
