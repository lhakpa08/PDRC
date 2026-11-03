import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { DEMO_USERS } from '../data/mockData';
import { 
  Building2, 
  Calendar, 
  UserCheck, 
  FileSpreadsheet, 
  Bell, 
  User, 
  ShieldCheck, 
  ChevronDown,
  LayoutDashboard,
  BedDouble,
  BookOpen,
  Settings,
  LogOut,
  Lock
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  setCurrentUser,
  unreadAlertCount,
  onOpenAlerts,
  isAuthenticated,
  onLogout,
}) => {
  const [showRoleModal, setShowRoleModal] = useState(false);

  // If user is authenticated, show operational tabs. If unauthenticated, show ONLY login tabs.
  const navItems = isAuthenticated
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'rooms', label: 'Room Booking', icon: Building2 },
        { id: 'hostel', label: 'Trainee Hostel', icon: BedDouble },
        { id: 'trainings', label: 'Training Schedule', icon: Calendar },
        { id: 'attendance', label: 'Attendance Roll-Call', icon: UserCheck },
        { id: 'publications', label: 'Research & Audits', icon: BookOpen },
        { id: 'reports', label: 'Reports & Certificates', icon: FileSpreadsheet },
        ...(currentUser.role === 'ADMIN' ? [{ id: 'admin-customizer', label: 'Facility & News Control', icon: Settings }] : []),
      ]
    : [
        { id: 'agency-login', label: 'Agency Representative Sign-In', icon: Building2 },
        { id: 'admin', label: 'Director General Admin Sign-In', icon: ShieldCheck },
      ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* Top Bar Contract (3 Zones) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => {
              if (isAuthenticated) {
                setCurrentTab('dashboard');
              } else {
                setCurrentTab('agency-login');
              }
            }}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-bold text-lg font-display shadow-md group-hover:scale-105 transition-transform">
              PDC
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 font-display leading-tight tracking-tight whitespace-nowrap">
                PDC Tsirang
              </div>
              <div className="text-[11px] text-amber-700 font-mono font-bold whitespace-nowrap">
                Royal Audit Authority (RAA)
              </div>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-extrabold border border-slate-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & User Profile Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {isAuthenticated ? (
              <>
                {/* Notification Alert Bell */}
                <button
                  onClick={onOpenAlerts}
                  className="relative p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition border border-slate-200"
                  title="Urgent Alerts & Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadAlertCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold font-mono flex items-center justify-center shadow-xs">
                      {unreadAlertCount}
                    </span>
                  )}
                </button>

                {/* User Profile / Role Switcher Trigger */}
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-left transition"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-amber-500 shrink-0"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="font-semibold text-slate-900 text-xs truncate max-w-[120px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-amber-700 font-mono font-bold truncate max-w-[120px]">
                      {currentUser.role} · {currentUser.agencyCode}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs transition"
                  title="Sign Out of PDC Portal"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-amber-900">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Sign-In Required</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="xl:hidden border-t border-slate-200 px-4 py-2 flex items-center justify-around overflow-x-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] whitespace-nowrap ${
                  isActive ? 'text-amber-700 font-bold' : 'text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Switch User Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  Select User Role & Portal Access
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Switch between administrative, agency coordinator, trainer, and participant profiles.
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {DEMO_USERS.map((user) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setShowRoleModal(false);
                    }}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm truncate">{user.name}</span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-amber-300">
                          {user.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 truncate mt-0.5 font-medium">{user.title}</div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">{user.agency}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setCurrentTab('agency-login');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Building2 className="w-4 h-4 text-white" />
                  <span>Agency Login</span>
                </button>

                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setCurrentTab('admin');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Admin Login</span>
                </button>
              </div>

              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
