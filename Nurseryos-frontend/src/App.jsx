import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AuthPage from './pages/auth/AuthPage';
import Dashboard from './pages/dashboard/Dashboard';

// Admin pages
import Approvals from './pages/admin/Approvals';
import Users from './pages/admin/Users';
import MasterData from './pages/admin/MasterData';
import { CustomerLedgers, FarmerLedgers } from './pages/admin/Ledgers';
import WorkflowApprovals from './pages/admin/WorkflowApprovals';

// Farmer pages
import Blocks from './pages/farmer/Blocks';
import Inventory from './pages/farmer/Inventory';
import POS from './pages/farmer/POS';
import FarmerLedger from './pages/farmer/Ledger';
import FarmerWorkflow from './pages/farmer/WorkflowApprovals';

// Exporter pages
import Catalog from './pages/exporter/Catalog';
import Customers from './pages/exporter/Customers';
import Quotations from './pages/exporter/Quotations';
import Procurement from './pages/exporter/Procurement';
import Invoices from './pages/exporter/Invoices';
import ExporterLedger from './pages/exporter/Ledger';
import Logistics from './pages/exporter/Logistics';
import Trips from './pages/exporter/Trips';
import Plans from './pages/exporter/Plans';
import ExporterWorkflow from './pages/exporter/WorkflowApprovals';

// Supervisor pages
import SupervisorTrips from './pages/supervisor/Trips';

// Shared pages
import Notifications from './pages/notifications/Notifications';

function AppContent() {
  const { user, token, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!token || !user) {
    return <AuthPage />;
  }

  const renderActivePage = () => {
    // Shared tabs
    if (currentTab === 'dashboard') {
      return <Dashboard />;
    }
    if (currentTab === 'notifications') {
      return <Notifications />;
    }

    // Role-based pages
    switch (user.role) {
      case 'ADMIN':
        switch (currentTab) {
          case 'admin-approvals':
            return <Approvals />;
          case 'admin-users':
            return <Users />;
          case 'admin-master':
            return <MasterData />;
          case 'admin-customer-ledger':
            return <CustomerLedgers />;
          case 'admin-farmer-ledger':
            return <FarmerLedgers />;
          case 'admin-workflow':
            return <WorkflowApprovals />;
          default:
            return <Dashboard />;
        }

      case 'FARMER':
        switch (currentTab) {
          case 'farmer-blocks':
            return <Blocks />;
          case 'farmer-inventory':
            return <Inventory />;
          case 'farmer-pos':
            return <POS />;
          case 'farmer-ledger':
            return <FarmerLedger />;
          case 'farmer-workflow':
            return <FarmerWorkflow />;
          default:
            return <Dashboard />;
        }

      case 'EXPORTER':
        switch (currentTab) {
          case 'exporter-catalog':
            return <Catalog />;
          case 'exporter-customers':
            return <Customers />;
          case 'exporter-quotations':
            return <Quotations />;
          case 'exporter-procurement':
            return <Procurement />;
          case 'exporter-invoices':
            return <Invoices />;
          case 'exporter-ledger':
            return <ExporterLedger />;
          case 'exporter-logistics':
            return <Logistics />;
          case 'exporter-trips':
            return <Trips />;
          case 'exporter-plans':
            return <Plans />;
          case 'exporter-workflow':
            return <ExporterWorkflow />;
          default:
            return <Dashboard />;
        }

      case 'SUPERVISOR':
        switch (currentTab) {
          case 'supervisor-trips':
            return <SupervisorTrips />;
          default:
            return <Dashboard />;
        }

      default:
        return <div className="p-4 text-slate-500">Unauthorized role or access.</div>;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab} user={user}>
      {renderActivePage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
