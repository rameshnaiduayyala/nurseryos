import React, { useEffect, useState } from 'react';
import { Bell, User2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notifications } from '../services/notifications';

const TAB_LABELS = {
  'dashboard': 'Dashboard',
  'notifications': 'Notifications',
  'admin-approvals': 'Approvals',
  'admin-users': 'User Accounts',
  'admin-master': 'Master Data',
  'admin-customer-ledger': 'Customer Ledgers',
  'admin-farmer-ledger': 'Farmer Ledgers',
  'admin-workflow': 'Workflow Approvals',
  'farmer-blocks': 'Nursery Blocks',
  'farmer-inventory': 'Stock Inventory',
  'farmer-pos': 'POS Checkout',
  'farmer-ledger': 'Financial Ledger',
  'farmer-workflow': 'Approval Requests',
  'exporter-catalog': 'Plant Catalog',
  'exporter-customers': 'Customers',
  'exporter-quotations': 'Proposals',
  'exporter-procurement': 'Procurement',
  'exporter-invoices': 'Invoices & Payments',
  'exporter-ledger': 'Customer Ledger',
  'exporter-logistics': 'Logistics Assets',
  'exporter-trips': 'Trips Dispatch',
  'exporter-plans': 'Operational Plans',
  'exporter-workflow': 'Workflow Approvals',
  'supervisor-trips': 'Assigned Routes',
};

export default function Header({ currentTab, setCurrentTab, user }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notifications.unreadCount();
        setUnreadCount(res.data?.unreadCount || 0);
      } catch (err) {
        // silent fail
      }
    };
    fetchUnread();
  }, [user?.id]);

  if (!user) return null;

  const roleColors = {
    ADMIN: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    FARMER: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    EXPORTER: 'bg-sky-100 text-sky-800 border-sky-300',
    SUPERVISOR: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  const pageTitle = TAB_LABELS[currentTab] || currentTab.replaceAll('-', ' ');

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-slate-800">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <button 
          onClick={() => setCurrentTab('notifications')}
          className="relative text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-100"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${roleColors[user.role] || 'bg-slate-100 text-slate-800'}`}>
            {user.role}
          </span>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
              <User2 size={14} className="text-white" />
            </div>
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold text-slate-800 leading-tight">{user.fullName}</div>
              <div className="text-xs text-slate-400 leading-tight">{user.email}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
