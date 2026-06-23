import React, { useState, useEffect, useMemo } from 'react';
import { MapPin, Search, ChevronDown, ChevronUp, Navigation, ShoppingCart, X } from 'lucide-react';
import MapView from '../../components/MapView';
import PlantCard from '../../components/PlantCard';
import NurseryDetailPanel from '../../components/NurseryDetailPanel';
import BatchReserveCart from '../../components/BatchReserveCart';
import RouteSummary from '../../components/RouteSummary';
import AutocompleteInput from '../../components/AutocompleteInput';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Catalog() {
  const { setSuccess, setError } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nurseries, setNurseries] = useState([]);
  const [nearbyNurseries, setNearbyNurseries] = useState([]);
  const [gisLoading, setGisLoading] = useState(false);

  const [gisLat, setGisLat] = useState('45.3');
  const [gisLng, setGisLng] = useState('-122.6');
  const [gisRadius, setGisRadius] = useState('100');

  const [searchName, setSearchName] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedNursery, setSelectedNursery] = useState(null);
  const [selectedNurseryDetail, setSelectedNurseryDetail] = useState(null);
  const [loadingNurseryDetail, setLoadingNurseryDetail] = useState(false);

  const handleNurseryClick = async (nursery) => {
    setSelectedNursery(nursery);
    try {
      setLoadingNurseryDetail(true);
      const res = await api.nurseries.getById(nursery.id);
      setSelectedNurseryDetail(res.data);
    } catch (err) {
      console.error('Failed to load nursery detail', err);
      setSelectedNurseryDetail(nursery);
    } finally {
      setLoadingNurseryDetail(false);
    }
  };

  const [cart, setCart] = useState([]);
  const [showRoute, setShowRoute] = useState(false);

  const loadBaseData = async () => {
    try {
      setLoading(true);
      const [invRes, catRes, nurseriesRes] = await Promise.all([
        api.inventory.list(),
        api.categories.list(),
        api.nurseries.list(),
      ]);
      setInventory(invRes.data || []);
      setCategories(catRes.data || []);
      setNurseries(nurseriesRes.data || []);
    } catch (err) {
      console.error('Failed to load catalog base data', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

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

  const nearbyNurseryIds = useMemo(
    () => new Set(nearbyNurseries.map((n) => n.id)),
    [nearbyNurseries]
  );

  const hasCatalogSearch = useMemo(
    () => searchName.trim().length > 0 || Boolean(filterCategory) || nearbyNurseryIds.size > 0,
    [searchName, filterCategory, nearbyNurseryIds]
  );

  const filteredInventory = useMemo(() => {
    if (!hasCatalogSearch) {
      return [];
    }

    let items = inventory;

    if (nearbyNurseryIds.size > 0) {
      items = items.filter((item) => {
        const nurseryId = item.nurseryBlock?.nursery?.id;
        return nurseryId && nearbyNurseryIds.has(nurseryId);
      });
    }

    if (searchName.trim()) {
      const nameLower = searchName.toLowerCase();
      items = items.filter((item) =>
        item.plant?.name?.toLowerCase().includes(nameLower)
      );
    }

    if (filterCategory) {
      items = items.filter((item) => item.plant?.categoryId === filterCategory);
    }

    return items;
  }, [hasCatalogSearch, inventory, nearbyNurseryIds, searchName, filterCategory]);

  const plantsByNursery = useMemo(() => {
    const map = new Map();
    filteredInventory.forEach((item) => {
      const nurseryId = item.nurseryBlock?.nursery?.id;
      const nurseryName = item.nurseryBlock?.nursery?.name || 'Unknown';
      const nurseryLocation = item.nurseryBlock?.nursery?.location || 'Location not set';
      if (!nurseryId) return;

      if (!map.has(nurseryId)) {
        map.set(nurseryId, {
          nurseryId,
          nurseryName,
          nurseryLocation,
          nursery: item.nurseryBlock?.nursery,
          plants: new Map(),
        });
      }

      const group = map.get(nurseryId);
      const plantId = item.plant?.id;
      if (!plantId) return;

      if (!group.plants.has(plantId)) {
        group.plants.set(plantId, {
          ...item.plant,
          availableQty: 0,
          unitPrice: item.unitPrice,
          nurseryId,
          nurseryName,
          nurseryLocation,
        });
      }

      const existing = group.plants.get(plantId);
      existing.availableQty += item.availableQuantity || 0;
      if (item.unitPrice) existing.unitPrice = item.unitPrice;
    });
    return Array.from(map.values());
  }, [filteredInventory]);

  const handleAddToCart = (plant, nursery) => {
    const key = `${plant.id}-${nursery.id}`;
    setCart((prev) => {
      const exists = prev.find((c) => `${c.plant.id}-${c.nurseryId}` === key);
      if (exists) {
        return prev.map((c) =>
          `${c.plant.id}-${c.nurseryId}` === key
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [
        ...prev,
        {
          plant,
          nurseryId: nursery.id,
          nurseryName: nursery.name,
          quantity: 1,
        },
      ];
    });
    setSuccess(`Added ${plant.name} to reservation cart.`);
  };

  const handleUpdateQty = (plantId, nurseryId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => !(`${c.plant.id}-${c.nurseryId}` === `${plantId}-${nurseryId}`)));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        `${c.plant.id}-${c.nurseryId}` === `${plantId}-${nurseryId}` ? { ...c, quantity: qty } : c
      )
    );
  };

  const handleRemoveFromCart = (plantId, nurseryId) => {
    setCart((prev) => prev.filter((c) => !(`${c.plant.id}-${c.nurseryId}` === `${plantId}-${nurseryId}`)));
  };

  const handleClearCart = () => setCart([]);

  const handleCheckout = async () => {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const promises = cart.map((item) =>
        api.reservations.create(item.plant.id, item.quantity, expiresAt.toISOString())
      );

      await Promise.all(promises);
      const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
      setSuccess(`Successfully reserved ${totalQty} plants across ${cart.length} nursery stops!`);
      setCart([]);
      setShowRoute(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedStopsForRoute = useMemo(() => {
    if (!showRoute) return [];
    return cart
      .map((item) => {
        const nursery = nearbyNurseries.find((n) => n.id === item.nurseryId) ||
          nurseries.find((n) => n.id === item.nurseryId);
        if (!nursery?.latitude || !nursery?.longitude) return null;
        return {
          id: nursery.id,
          nursery,
        };
      })
      .filter(Boolean);
  }, [showRoute, cart, nearbyNurseries, nurseries]);

  if (loading) return <div className="text-slate-500">Loading Plant Catalog...</div>;

  return (
    <div className="space-y-6">
      {/* GIS Search Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MapPin className="text-emerald-700" size={20} />
          <span>Supplier Proximity Search</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
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
            <label className="block text-xs font-semibold text-slate-500 mb-1">Radius (km)</label>
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
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition h-10 shadow-sm disabled:opacity-50"
          >
            <Navigation size={16} />
            {gisLoading ? 'Searching...' : 'Find Nearby'}
          </button>
          {nearbyNurseries.length > 0 && (
            <button
              onClick={() => setNearbyNurseries([])}
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>

        {nearbyNurseries.length > 0 && (
          <div className="mt-5">
            <MapView
              center={gisLat && gisLng ? [parseFloat(gisLat), parseFloat(gisLng)] : undefined}
              zoom={12}
              markers={nearbyNurseries.map((n) => ({
                lat: n.latitude,
                lng: n.longitude,
                label: n.name,
                color: '#059669',
              }))}
            />
          </div>
        )}
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h4 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <Search className="text-emerald-700" size={20} />
            <span>Plant Catalog</span>
            {nearbyNurseries.length > 0 && (
              <span className="text-xs font-normal text-slate-500">
                ({nearbyNurseries.length} nurseries in range)
              </span>
            )}
          </h4>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <AutocompleteInput
              value={searchName}
              onChange={(val) => setSearchName(val)}
              fetchSuggestions={(query) => api.plants.suggest(query).then(res => res.data || [])}
              placeholder="Search plants..."
              displayKey="name"
              subKey="farmerName"
              className="w-full md:w-64"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full md:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {!hasCatalogSearch ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            <Search size={32} className="mx-auto mb-3 text-slate-300" />
            Search for a plant or use supplier proximity search to view matching nurseries and locations.
          </div>
        ) : plantsByNursery.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            <Search size={32} className="mx-auto mb-3 text-slate-300" />
            No plants found. Try adjusting your search or GIS radius.
          </div>
        ) : (
          <div className="space-y-6">
            {plantsByNursery.map((group) => (
              <div key={group.nurseryId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-700"></div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-700">
                        {group.nurseryName}
                      </h5>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} />
                        <span>{group.nurseryLocation}</span>
                        <span className="mx-1">|</span>
                        <span>{group.plants.size} plant variety available</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNurseryClick(group.nursery)}
                    className="text-xs text-emerald-600 font-semibold hover:text-emerald-800 transition"
                  >
                    View Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-6">
                  {Array.from(group.plants.values()).map((plant) => (
                    <PlantCard
                      key={plant.id}
                      plant={plant}
                      nurseryName={group.nurseryName}
                      nurseryLocation={group.nurseryLocation}
                      availableQty={plant.availableQty}
                      onReserve={() => handleAddToCart(plant, { id: group.nurseryId, name: group.nurseryName })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NurseryDetailPanel nursery={selectedNurseryDetail || selectedNursery} onClose={() => { setSelectedNursery(null); setSelectedNurseryDetail(null); }} />

      <BatchReserveCart
        items={cart}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
        onClear={handleClearCart}
      />

      {showRoute && (
        <div className="pb-24">
          <RouteSummary stops={selectedStopsForRoute} />
        </div>
      )}
    </div>
  );
}
