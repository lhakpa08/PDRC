import React, { useState } from 'react';
import { UserProfile } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { 
  Building2, 
  User, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Building, 
  Lock
} from 'lucide-react';

interface AgencyLoginViewProps {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  onLoginSuccess: () => void;
  onNavigateToAdmin: () => void;
}

export const AgencyLoginView: React.FC<AgencyLoginViewProps> = ({
  currentUser,
  setCurrentUser,
  onLoginSuccess,
  onNavigateToAdmin,
}) => {
  const [selectedAgency, setSelectedAgency] = useState('DZO');
  const [cidInput, setCidInput] = useState('11802004512');
  const [passkeyInput, setPasskeyInput] = useState('••••••••');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  const agencyUser = DEMO_USERS.find((u) => u.role === 'AGENCY_REP') || DEMO_USERS[1];

  const BHUTAN_AGENCIES = [
    { code: 'DZO', name: 'Dzongkhag Administration, Tsirang' },
    { code: 'RAA', name: 'Royal Audit Authority (RAA)' },
    { code: 'LG-GEWOGS', name: 'Gewog Local Administrations' },
    { code: 'MoF', name: 'Ministry of Finance (MoF)' },
    { code: 'RCSC', name: 'Royal Civil Service Commission (RCSC)' },
    { code: 'MoESD', name: 'Ministry of Education & Skills Dev' },
  ];

  const handleAgencySignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!cidInput.trim() || cidInput.length < 5) {
      setLoginError('Please enter a valid 11-digit Bhutanese CID.');
      return;
    }

    const targetUser = DEMO_USERS.find(u => u.agencyCode === selectedAgency) || agencyUser;
    setCurrentUser(targetUser);
    setLoginSuccessMessage(`Signed in as ${targetUser.name} (${targetUser.agencyCode})`);

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
            Agency Sign-In
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Professional Development Centre · Tsirang
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

        <form onSubmit={handleAgencySignIn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              Government Agency / Ministry
            </label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
            >
              {BHUTAN_AGENCIES.map((agency) => (
                <option key={agency.code} value={agency.code}>
                  {agency.name} ({agency.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Civil Registration ID (CID)
            </label>
            <input
              type="text"
              required
              value={cidInput}
              onChange={(e) => setCidInput(e.target.value)}
              placeholder="11-digit CID Number"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              Passcode
            </label>
            <input
              type="password"
              required
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              placeholder="Security Passcode"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Switch to Admin Login Link */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            onClick={onNavigateToAdmin}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1.5 hover:underline"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Admin Sign-In Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
