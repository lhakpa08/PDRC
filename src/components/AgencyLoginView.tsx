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
  Sparkles, 
  Calendar,
  Lock,
  Layers,
  FileCheck
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
  const participantUser = DEMO_USERS.find((u) => u.role === 'PARTICIPANT') || DEMO_USERS[3];
  const trainerUser = DEMO_USERS.find((u) => u.role === 'FACILITATOR') || DEMO_USERS[2];

  const BHUTAN_AGENCIES = [
    { code: 'DZO', name: 'Dzongkhag Administration, Tsirang', rep: 'Dechen Pem' },
    { code: 'RAA', name: 'Royal Audit Authority (RAA)', rep: 'Karma Dorji' },
    { code: 'LG-GEWOGS', name: 'Gewog Local Administrations (12 Gewogs)', rep: 'Kinley Zangmo' },
    { code: 'MoF', name: 'Ministry of Finance (MoF)', rep: 'Sonam Norbu' },
    { code: 'RCSC', name: 'Royal Civil Service Commission (RCSC)', rep: 'Tashi Wangmo' },
    { code: 'MoESD', name: 'Ministry of Education & Skills Dev', rep: 'Pema Tshering' },
  ];

  const handleAgencySignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!cidInput.trim() || cidInput.length < 5) {
      setLoginError('Please enter a valid 11-digit Bhutanese Civil Registration ID (CID).');
      return;
    }

    // Authenticate as Agency Representative
    const targetUser = DEMO_USERS.find(u => u.agencyCode === selectedAgency) || agencyUser;
    setCurrentUser(targetUser);
    setLoginSuccessMessage(`Authentication successful! Logged in as ${targetUser.name} (${targetUser.title}, ${targetUser.agency}).`);

    setTimeout(() => {
      onLoginSuccess();
    }, 1100);
  };

  const handleQuickSwitch = (user: UserProfile) => {
    setCurrentUser(user);
    setLoginSuccessMessage(`Switched profile to ${user.name} (${user.role} · ${user.agencyCode}).`);
    setTimeout(() => {
      onLoginSuccess();
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-4">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1 rounded-full text-xs font-mono font-bold">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>ROYAL GOVERNMENT OF BHUTAN · AGENCY & DEPT PORTAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Inter-Agency & Department Representative Sign-In
        </h1>
        <p className="text-xs text-slate-600 max-w-xl mx-auto font-medium">
          Centralized authentication portal for Dzongkhag officers, Gewog representatives, line ministries, and audit facilitators requesting venue access and training schedules at PDRC Tsirang.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Agency Login Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center font-display text-lg shadow-xs">
                DZO
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base font-display">
                  Agency Representative Sign-In
                </h2>
                <div className="text-[11px] text-blue-700 font-mono font-bold">
                  Tsirang Dzongkhag & Inter-Ministry Access
                </div>
              </div>
            </div>
            <Lock className="w-5 h-5 text-blue-600" />
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

          <form onSubmit={handleAgencySignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Select Royal Government Agency / Ministry
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
                Civil Registration ID (CID) Number
              </label>
              <input
                type="text"
                required
                value={cidInput}
                onChange={(e) => setCidInput(e.target.value)}
                placeholder="Enter 11-digit Bhutanese CID"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                Agency Passcode / PIN
              </label>
              <input
                type="password"
                required
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                placeholder="Enter agency security passkey"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-slate-600 font-mono space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-blue-600" /> Agency Representative Access Capabilities:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Submit Room & Seminar Hall Reservations</li>
                <li>Book Trainee Hostel Lodging for Visiting Staff</li>
                <li>Register Gewog Officers for AIMS Training</li>
                <li>Export .ics Calendar Events & Attendance Records</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Authenticate as Agency Representative</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch to Admin Login Link */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Are you the PDRC Director General?</span>
            <button
              onClick={onNavigateToAdmin}
              className="font-bold text-amber-700 hover:text-amber-900 font-mono flex items-center gap-1 hover:underline"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Go to Admin Sign-In</span>
            </button>
          </div>
        </div>

        {/* Demo Switcher & Profiles */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Quick Agency Profile Sign-In
            </h2>

            <p className="text-xs text-slate-600 font-medium">
              Click any agency user profile to test agency reservations and training registration instantly:
            </p>

            <div className="space-y-3">
              {[agencyUser, trainerUser, participantUser].map((user) => {
                const isActive = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleQuickSwitch(user)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs font-sans">{user.name}</div>
                        <div className="text-[11px] text-slate-600 font-medium">{user.title}</div>
                        <div className="text-[10px] text-blue-800 font-mono font-bold">{user.agency}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-900 text-amber-300">
                      {user.agencyCode}
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
