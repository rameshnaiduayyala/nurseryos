import React, { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Catalog() {
  const { setSuccess, setError } = useAuth();
  const [catalogPlants, setCatalogPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [catalogFilters, setCatalogFilters] = useState({ name: '', categoryId: '', location: '', radiusKm: '', minAvailability: '' });

  // GIS Search states
  const [gisLat, setGisLat] = useState('45.3');
  const [gisLng, setGisLng] = useState('-122.6');
  const [gisRadius, setGisRadius] = useState('100');
  const [nearbyNurseries, setNearbyNurseries] = useState([]);
  const [gisLoading, setGisLoading] = useState(false);

  const loadPlants = async (filters = {}) => {
    try {
      const res = await api.plants.list(filters);
      setCatalogPlants(res.data || []);
    } catch (err) {
      console.error('Failed to load plants', err);
      setError(err.message);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await loadPlants();
      const catRes = await api.categories.list();
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load catalog data', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...catalogFilters, [name]: value };
    setCatalogFilters(newFilters);
    loadPlants(newFilters);
  };

  const handleGisSearch = async () => {
    try {
      setGisLoading(true);
      setError('');
      const res = await api.nurseries.nearby(gisLat, gisLng, gisRadius);
      setNearbyNurseries(res.data || []);
      setSuccess(`Found ${res.data?.length || 0} suppliers nearby.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGisLoading(false);
    }
  };

  const handleReserveStock = async (plantId, quantity) => {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24hr reservation hold
      await api.reservations.create(plantId, parseInt(quantity), expiresAt.toISOString());
      setSuccess(`Reserved ${quantity} plants successfully!`);
      loadPlants(catalogFilters);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-slate-500">Loading Plant Catalog...</div>;

  return (
    <div className="space-y-8">
      {/* GIS Proximity search */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="text-emerald-700" size={20} />
          <span>GIS Proximity Search (Nearby Suppliers)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Center Latitude</label>
            <input 
              type="text" 
              value={gisLat} 
              onChange={(e) => setGisLat(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Center Longitude</label>
            <input 
              type="text" 
              value={gisLng} 
              onChange={(e) => setGisLng(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Search Radius (km)</label>
            <input 
              type="number" 
              value={gisRadius} 
              onChange={(e) => setGisRadius(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
            />
          </div>
          <button 
            onClick={handleGisSearch} 
            disabled={gisLoading}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition duration-200 h-10 shadow-sm disabled:opacity-55"
          >
            <MapPin size={18} />
            <span>{gisLoading ? 'Searching...' : 'Search Nearby'}</span>
          </button>
        </div>

        {nearbyNurseries.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <h5 className="text-sm font-bold text-slate-700 mb-2">Matching Nearby Suppliers</h5>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-xs">
                  <th className="pb-2">Nursery</th>
                  <th className="pb-2">Location</th>
                  <th className="pb-2">Distance (km)</th>
                </tr>
              </thead>
              <tbody>
                {nearbyNurseries.map((n) => (
                  <tr key={n.id} className="border-b border-slate-100 text-slate-700 text-xs">
                    <td className="py-2 font-medium">{n.name}</td>
                    <td className="py-2">{n.location}</td>
                    <td className="py-2 font-semibold text-emerald-800">{parseFloat(n.distance).toFixed(2)} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plant catalog search */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h4 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <Search className="text-emerald-700" size={20} />
            <span>Exporter Plant Catalog Search</span>
          </h4>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <input 
              type="text" 
              name="name"
              placeholder="Search by name..." 
              value={catalogFilters.name}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full md:w-48"
            />
            <select 
              name="categoryId"
              value={catalogFilters.categoryId}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full md:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input 
              type="text" 
              name="location"
              placeholder="Center (lat,lng)" 
              value={catalogFilters.location}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full md:w-48"
            />
            <input 
              type="number" 
              name="radiusKm"
              placeholder="Radius (km)" 
              value={catalogFilters.radiusKm}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full md:w-32"
            />
            <input 
              type="number" 
              name="minAvailability"
              placeholder="Min Qty Available" 
              value={catalogFilters.minAvailability}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full md:w-40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold text-sm">
                <th className="pb-3">Plant Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Bag Size</th>
                <th className="pb-3">Height</th>
                <th className="pb-3">Base Price</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {catalogPlants.map((plant) => (
                <tr key={plant.id} className="border-b border-slate-100 text-slate-700 text-sm">
                  <td className="py-3 font-medium">{plant.name}</td>
                  <td className="py-3 text-slate-500">{plant.plantCategory?.name || plant.category?.name || 'N/A'}</td>
                  <td className="py-3">{plant.bagSize?.size}</td>
                  <td className="py-3">{plant.heightStandard?.name}</td>
                  <td className="py-3 font-semibold text-slate-900">₹{parseFloat(plant.unitPrice).toFixed(2)}</td>
                  <td className="py-3">
                    <button 
                      onClick={() => handleReserveStock(plant.id, 50)} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition duration-200 shadow-sm"
                    >
                      Reserve 50 Plants
                    </button>
                  </td>
                </tr>
              ))}
              {catalogPlants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400">No plants match the search filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
