import React, { useState, useEffect } from 'react';
import { 
  TreePine, Users, Package, TrendingUp, ShoppingCart, 
  Truck, Clock, ArrowUpRight, Layers, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color, suffix = '' }) => (
  <div className="stat-card bg-white p-6 rounded-xl border border-slate-200 shadow-sm card-hover animate-fadeInUp">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-extrabold text-slate-800 mt-2">
          {suffix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.dashboard.getStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="skeleton h-8 w-60"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-fadeIn">
        <Package size={48} className="mb-3 opacity-40" />
        <p className="text-lg font-semibold">Unable to load statistics</p>
        <p className="text-sm mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Partner'}
          </h3>
          <p className="text-sm text-slate-400 mt-0.5">Here's what's happening with your operations today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'ADMIN' && (
          <>
            <StatCard icon={TreePine} label="Total Nurseries" value={stats.totalNurseries || 0} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
            <StatCard icon={Users} label="Exporter Partners" value={stats.totalExporters || 0} color="bg-gradient-to-br from-sky-500 to-sky-600" />
            <StatCard icon={Layers} label="Global Inventory" value={stats.totalInventory || 0} color="bg-gradient-to-br from-violet-500 to-violet-600" />
            <StatCard icon={TrendingUp} label="Revenue" value={stats.revenue || 0} suffix="₹" color="bg-gradient-to-br from-amber-500 to-amber-600" />
          </>
        )}

        {user?.role === 'FARMER' && (
          <>
            <StatCard icon={Package} label="Plants Stock" value={stats.inventoryCount || 0} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
            <StatCard icon={Clock} label="Pending Reservations" value={stats.reservationRequests || 0} color="bg-gradient-to-br from-amber-500 to-amber-600" />
            <StatCard icon={ShoppingCart} label="Completed Collections" value={stats.collections || 0} color="bg-gradient-to-br from-sky-500 to-sky-600" />
          </>
        )}

        {user?.role === 'EXPORTER' && (
          <>
            <StatCard icon={ShoppingCart} label="Active Orders" value={stats.activeOrders || 0} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
            <StatCard icon={Package} label="Reserved Stocks" value={stats.pendingReservations || 0} color="bg-gradient-to-br from-amber-500 to-amber-600" />
            <StatCard icon={Truck} label="Dispatched Trips" value={stats.trips || 0} color="bg-gradient-to-br from-sky-500 to-sky-600" />
          </>
        )}

        {user?.role === 'SUPERVISOR' && (
          <>
            <StatCard icon={Truck} label="Active Routes" value={stats.activeRoutes || 0} color="bg-gradient-to-br from-emerald-500 to-emerald-600" />
            <StatCard icon={Package} label="Pending Deliveries" value={stats.pendingDeliveries || 0} color="bg-gradient-to-br from-amber-500 to-amber-600" />
          </>
        )}
      </div>
    </div>
  );
}
