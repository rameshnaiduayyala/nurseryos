import React, { useState } from 'react';
import { Leaf, AlertCircle, CheckCircle, Zap, MapPin, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LocationPicker from '../../components/LocationPicker';

const DEMO_ACCOUNTS = [
  { email: 'admin@nurseryos.com', password: 'Password123', label: 'Admin', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { email: 'farmer@nurseryos.com', password: 'Password123', label: 'Farmer', color: 'bg-emerald-600 hover:bg-emerald-700' },
  { email: 'exporter@nurseryos.com', password: 'Password123', label: 'Exporter', color: 'bg-sky-600 hover:bg-sky-700' },
  { email: 'supervisor@nurseryos.com', password: 'Password123', label: 'Supervisor', color: 'bg-amber-600 hover:bg-amber-700' },
];

export default function AuthPage() {
  const { login, register, loading, error, success, setError, setSuccess } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleName, setRoleName] = useState('EXPORTER');
  const [nurseryName, setNurseryName] = useState('');
  const [nurseryLocation, setNurseryLocation] = useState('');
  const [nurseryAddress, setNurseryAddress] = useState('');
  const [nurseryGst, setNurseryGst] = useState('');
  const [nurseryContactPerson, setNurseryContactPerson] = useState('');
  const [nurseryMobileNumber, setNurseryMobileNumber] = useState('');
  const [nurseryLat, setNurseryLat] = useState('');
  const [nurseryLng, setNurseryLng] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      // Error is set in AuthContext
    }
  };

  const handleQuickLogin = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(
        email,
        password,
        fullName,
        roleName,
        nurseryName,
        nurseryLocation,
        nurseryLat,
        nurseryLng,
        nurseryAddress,
        nurseryGst,
        nurseryContactPerson,
        nurseryMobileNumber
      );
      setIsRegister(false);
    } catch (err) {
      // Error is set in AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-emerald-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-100 p-3 rounded-full mb-3 text-emerald-700">
            <Leaf size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-emerald-900 tracking-tight text-center">NurseryOS</h1>
          <p className="text-sm text-emerald-600 mt-1">Enterprise Nursery Logistics Hub</p>
        </div>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded mb-6 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-teal-50 border-l-4 border-teal-500 text-teal-800 p-4 rounded mb-6 text-sm flex items-start gap-2">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {!isRegister ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nurseryos.com"
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold">Quick Demo Login</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickLogin(demo)}
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-semibold transition duration-200 disabled:opacity-50 ${demo.color}`}
                >
                  <Zap size={14} />
                  {demo.label}
                </button>
              ))}
            </div>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
                className="text-emerald-700 hover:underline text-sm font-medium"
              >
                Create new partner account
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-1">Full Name</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@nurseryos.com"
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-1">Business Role</label>
              <select 
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="EXPORTER">Exporter Partner</option>
                <option value="FARMER">Farmer (Nursery Owner)</option>
                <option value="SUPERVISOR">Logistics Supervisor</option>
              </select>
            </div>

            {roleName === 'FARMER' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-emerald-800 mb-1">Nursery Name <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={nurseryName}
                    onChange={(e) => setNurseryName(e.target.value)}
                    placeholder="My Green Nursery"
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-800 mb-1">Nursery Location</label>
                  <LocationPicker
                    onChange={(loc) => {
                      setNurseryLocation(loc?.label || '');
                      if (loc?.lat) setNurseryLat(String(loc.lat));
                      if (loc?.lng) setNurseryLng(String(loc.lng));
                    }}
                    height="200px"
                  />
                  <input
                    type="text"
                    required
                    value={nurseryLocation}
                    onChange={(e) => setNurseryLocation(e.target.value)}
                    placeholder="Selected nursery location"
                    className="w-full mt-2 px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-800 mb-1">Nursery Address</label>
                  <textarea
                    value={nurseryAddress}
                    onChange={(e) => setNurseryAddress(e.target.value)}
                    placeholder="Village, mandal, district, state"
                    rows={2}
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-800 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={nurseryGst}
                      onChange={(e) => setNurseryGst(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-800 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={nurseryContactPerson}
                      onChange={(e) => setNurseryContactPerson(e.target.value)}
                      placeholder="Owner or manager"
                      className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-800 mb-1">Mobile Number <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={nurseryMobileNumber}
                    onChange={(e) => setNurseryMobileNumber(e.target.value)}
                    placeholder="Nursery contact mobile"
                    className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Register'}
            </button>
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
                className="text-emerald-700 hover:underline text-sm font-medium"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
