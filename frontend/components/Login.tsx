import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Mail, Lock, LogIn, UserPlus, User as UserIcon, AlertCircle, Briefcase, Wifi, WifiOff } from 'lucide-react';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { users, login, register, isOffline, connectionError, apiUrl } = useData();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.MEMBER);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!name || !email || !password) {
        setError('All fields are required.');
        return;
      }
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('User with this email already exists.');
        return;
      }
      register(name, email, role);
    } else {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && password) {
        login(user.email);
      } else {
        // Only allow login if we are ONLINE and can verify with backend, OR if we found them in offline mock data
        if (isOffline && user) {
             login(user.email);
        } else if (!isOffline) {
            login(email); // Try backend
        } else {
            setError('Invalid credentials.');
        }
      }
    }
  };

  const prefill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setIsRegistering(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            CollabFlow
          </h1>
          <p className="text-gray-500">
            {isRegistering ? 'Create a new account' : 'Sign in to your account'}
          </p>
        </div>

        {/* CONNECTION STATUS BADGE */}
        <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 text-sm ${isOffline ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <div className="flex-1">
                <span className="font-semibold">{isOffline ? 'Offline / Demo Mode' : 'Connected to Server'}</span>
                {connectionError && <p className="text-xs opacity-80 mt-1">{connectionError}</p>}
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors text-gray-900"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors text-gray-900"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors text-gray-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase size={18} className="text-gray-400" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-colors text-gray-900 appearance-none"
                >
                  <option value={UserRole.MEMBER}>Member (Standard Access)</option>
                  <option value={UserRole.MANAGER}>Manager (Can Assign Tasks)</option>
                  <option value={UserRole.ADMIN}>Admin (Full Control)</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm shadow-indigo-200"
          >
            {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegistering ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Create one'}
          </button>
        </div>
        
        {!isRegistering && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-center text-gray-400 mb-3">Available Demo Accounts:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => prefill(u.email)}
                  className="px-2 py-1 text-xs bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded border border-gray-200 transition-colors"
                  title={`Role: ${u.role}`}
                >
                  {u.name} ({u.role[0]})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DEBUG BOX */}
      <div className="mt-8 p-4 bg-slate-900 text-slate-300 rounded-lg text-xs font-mono max-w-md w-full opacity-80">
        <p className="mb-1 font-bold text-slate-100">Backend Configuration:</p>
        <p>Target URL: <span className="text-cyan-400">{apiUrl}</span></p>
        <p>Status: {isOffline ? 'Disconnected' : 'Connected'}</p>
        <p className="mt-2 italic text-[10px] text-slate-500">
            Note: If deployment just finished, wait 60s for Render to wake up.
        </p>
      </div>
    </div>
  );
};
