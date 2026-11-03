import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  User, 
  Building2, 
  ArrowRight,
  Shield,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AdminLoginViewProps {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  onLoginSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  currentUser,
  setCurrentUser,
  onLoginSuccess,
}) => {
  const [cidInput, setCidInput] = useState('10903001892');
  const [passkeyInput, setPasskeyInput] = useState('••••••••');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  const adminUser = DEMO_USERS.find((u) => u.role === 'ADMIN') || DEMO_USERS[0];

  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!cidInput.trim()) {
      setLoginError('Please enter a valid 11-digit Bhutanese Civil Registration ID (CID).');
      return;
    }

    // Authenticate as Admin Director General
    setCurrentUser(adminUser);
    setLoginSuccessMessage(`Authentication successful! Logged in as ${adminUser.name} (${adminUser.title}, PDRC Tsirang).`);

    setTimeout(() => {
      onLoginSuccess();
    }, 1200);
  };

  const handleQuickSwitch = (user: UserProfile) => {
    setCurrentUser(user);
    setLoginSuccessMessage(`Switched profile to ${user.name} (${user.role}).`);
    setTimeout(() => {
      onLoginSuccess();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-4">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>ROYAL AUDIT AUTHORITY (RAA) · SECURE ADMIN PORTAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          PDC Tsirang Administrative Sign-In
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto font-medium">
          Authorized personnel authentication portal for room booking approvals, urgency alert broadcasts, and global training analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Admin Login Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-display text-lg shadow-xs">
                RAA
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base font-display">
                  Director General & Admin Sign-In
                </h2>
                <div className="text-[11px] text-amber-700 font-mono font-bold">
                  PDC Tsirang Secretariat Access
                </div>
              </div>
            </div>
            <Lock className="w-5 h-5 text-amber-600" />
          </div>

          {loginSuccessMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{loginSuccessMessage}</span>
            </div>
          )}

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                Civil Registration ID (CID) Number
              </label>
              <input
                type="text"
                required
                value={cidInput}
                onChange={(e) => setCidInput(e.target.value)}
                placeholder="Enter 11-digit Bhutanese CID"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                RAA Security Passkey
              </label>
              <input
                type="password"
                required
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter RAA admin passkey"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 font-mono space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-600" /> Admin Privileges Granted:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Approve/Reject Venue & Room Reservations</li>
                <li>Broadcast Urgent Department Alerts</li>
                <li>Manage Trainee Hostel & Lodging Allocation</li>
                <li>Generate Master Audit & Completion Reports</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Authenticate as PDRC Admin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Demo Switcher & Account Profiles */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Instant Profile Sign-In & Role Testing
            </h2>

            <p className="text-xs text-slate-600 font-medium">
              Select any pre-configured institutional profile to test role-based permissions immediately:
            </p>

            <div className="space-y-3">
              {DEMO_USERS.map((user) => {
                const isActive = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickSwitch(user)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-amber-500 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs font-sans">{user.name}</div>
                        <div className="text-[11px] text-slate-600 font-medium">{user.title}</div>
                        <div className="text-[10px] text-amber-800 font-mono font-bold">{user.agency}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-900 text-amber-300">
                      {user.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
