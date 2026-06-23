import React from 'react';
import { 
  Leaf, UserCheck, Users, Settings, Layers, ShoppingCart, 
  Landmark, Search, FileText, FileClock, Truck, LogOut, BarChart3,
  ClipboardList, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-emerald-900 text-emerald-100 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-emerald-800">
        <Leaf size={28} className="text-emerald-400" />
        <span className="text-xl font-bold tracking-tight">NurseryOS</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <button 
          onClick={() => setCurrentTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
            currentTab === 'dashboard' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
          }`}
        >
          <BarChart3 size={18} />
          <span>Dashboard</span>
        </button>

       <button 
         onClick={() => setCurrentTab('notifications')}
         className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
           currentTab === 'notifications' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
         }`}
       >
         <Bell size={18} />
         <span>Notifications</span>
       </button>

        {user.role === 'ADMIN' && (
          <>
            <button 
              onClick={() => setCurrentTab('admin-approvals')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'admin-approvals' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <UserCheck size={18} />
              <span>Approvals</span>
            </button>
            <button 
              onClick={() => setCurrentTab('admin-users')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'admin-users' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Users size={18} />
              <span>User Accounts</span>
            </button>
            <button 
              onClick={() => setCurrentTab('admin-master')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'admin-master' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Settings size={18} />
              <span>Master Data</span>
            </button>
            <button 
              onClick={() => setCurrentTab('admin-customer-ledger')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'admin-customer-ledger' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Landmark size={18} />
              <span>Customer Ledgers</span>
            </button>
              <button 
                onClick={() => setCurrentTab('admin-farmer-ledger')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                  currentTab === 'admin-farmer-ledger' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
                }`}
              >
                <Landmark size={18} />
                <span>Farmer Ledgers</span>
              </button>
              <button 
                onClick={() => setCurrentTab('admin-workflow')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                  currentTab === 'admin-workflow' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
                }`}
              >
                <ClipboardList size={18} />
                <span>Workflow Approvals</span>
              </button>
            </>
        )}

        {user.role === 'FARMER' && (
          <>
            <button 
              onClick={() => setCurrentTab('farmer-blocks')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'farmer-blocks' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Settings size={18} />
              <span>Nursery Blocks</span>
            </button>
            <button 
              onClick={() => setCurrentTab('farmer-inventory')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'farmer-inventory' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Layers size={18} />
              <span>Stock inventory</span>
            </button>
            <button 
              onClick={() => setCurrentTab('farmer-pos')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'farmer-pos' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <ShoppingCart size={18} />
              <span>POS Checkout</span>
            </button>
            <button 
              onClick={() => setCurrentTab('farmer-ledger')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'farmer-ledger' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Landmark size={18} />
              <span>Financial Ledger</span>
            </button>
            <button 
              onClick={() => setCurrentTab('farmer-workflow')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'farmer-workflow' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <ClipboardList size={18} />
              <span>Approval Requests</span>
            </button>
          </>
        )}

        {user.role === 'EXPORTER' && (
          <>
            <button 
              onClick={() => setCurrentTab('exporter-catalog')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-catalog' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Search size={18} />
              <span>Plant Catalog</span>
            </button>
            <button 
              onClick={() => setCurrentTab('exporter-customers')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-customers' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Users size={18} />
              <span>Customers</span>
            </button>
            <button 
              onClick={() => setCurrentTab('exporter-quotations')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-quotations' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <FileText size={18} />
              <span>Proposals</span>
            </button>
            <button 
              onClick={() => setCurrentTab('exporter-procurement')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-procurement' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <ShoppingCart size={18} />
              <span>Procurement</span>
            </button>
            <button 
              onClick={() => setCurrentTab('exporter-invoices')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-invoices' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <FileClock size={18} />
              <span>Invoices & Payments</span>
            </button>
            <button 
              onClick={() => setCurrentTab('exporter-ledger')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-ledger' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Landmark size={18} />
              <span>Customer Ledger</span>
            </button>
            <button 
              onClick={() => setCurrentTab('exporter-logistics')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-logistics' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Truck size={18} />
              <span>Logistics Assets</span>
            </button>
            <button 
              onClick={() => setCurrentTab('exporter-trips')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-trips' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Truck size={18} />
              <span>Trips Dispatch</span>
            </button>
            <button 
              onClick={() => setCurrentTab('exporter-plans')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-plans' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <ClipboardList size={18} />
              <span>Operational Plans</span>
            </button>
            <button 
              onClick={() => setCurrentTab('exporter-workflow')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'exporter-workflow' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <FileText size={18} />
              <span>Workflow Approvals</span>
            </button>
          </>
        )}

        {user.role === 'SUPERVISOR' && (
          <>
            <button 
              onClick={() => setCurrentTab('supervisor-trips')}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition duration-200 ${
                currentTab === 'supervisor-trips' ? 'bg-emerald-800 text-white font-semibold' : 'hover:bg-emerald-800/50'
              }`}
            >
              <Truck size={18} />
              <span>Assigned Routes</span>
            </button>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-emerald-800">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-rose-900 rounded-lg text-left text-emerald-200 hover:text-white transition duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
