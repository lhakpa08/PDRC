import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  User, 
  ArrowRight,
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
      setLoginError('Please enter a valid 11-digit Bhutanese CID.');
      return;
    }

    setCurrentUser(adminUser);
    setLoginSuccessMessage(`Signed in as ${adminUser.name} (Director General)`);

    setTimeout(() => {
      onLoginSuccess();
    }, 600);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-7 shadow-sm space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Admin Sign-In
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Royal Audit Authority Secretariat · PDRC Tsirang
          </p>
        </div>

        {loginSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{loginSuccessMessage}</span>
          </div>
        )}

        {loginError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleAdminSignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Civil Registration ID (CID)
            </label>
            <input
              type="text"
              required
              value={cidInput}
              onChange={(e) => setCidInput(e.target.value)}
              placeholder="11-digit CID Number"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              RAA Passkey
            </label>
            <input
              type="password"
              required
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              placeholder="Admin Security Passkey"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            <span>Authenticate as Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
