import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Layout({ currentTab, setCurrentTab, children, user }) {
  const { error, success, setError, setSuccess } = useAuth();

  // Automatically clear messages after 5 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="min-h-screen bg-slate-50 flex w-full">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentTab={currentTab} setCurrentTab={setCurrentTab} user={user} />

        <main className="flex-1 p-8 overflow-y-auto">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded mb-6 text-sm flex items-start gap-2 shadow-sm animate-fadeIn">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-teal-50 border-l-4 border-teal-500 text-teal-800 p-4 rounded mb-6 text-sm flex items-start gap-2 shadow-sm animate-fadeIn">
              <CheckCircle size={18} className="shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
