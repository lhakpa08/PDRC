import React, { useState } from 'react';
import { PushNotificationAlert, UserProfile } from '../types';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  Send, 
  X, 
  CheckCircle2, 
  Radio
} from 'lucide-react';

interface AlertNotificationCenterProps {
  alerts: PushNotificationAlert[];
  currentUser: UserProfile;
  onClose: () => void;
  onSendAlert: (alert: Omit<PushNotificationAlert, 'id' | 'timestamp' | 'read'>) => void;
  onMarkAsRead: (id: string) => void;
}

export const AlertNotificationCenter: React.FC<AlertNotificationCenterProps> = ({
  alerts,
  currentUser,
  onClose,
  onSendAlert,
  onMarkAsRead,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [showDispatchForm, setShowDispatchForm] = useState(false);

  // Dispatch Form
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    priority: 'Urgent' as PushNotificationAlert['priority'],
    targetAgency: 'ALL',
  });

  const filteredAlerts = alerts.filter((a) => {
    return filterPriority === 'ALL' || a.priority === filterPriority;
  });

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendAlert({
      title: newAlert.title,
      message: newAlert.message,
      priority: newAlert.priority,
      targetAgency: newAlert.targetAgency,
      sender: currentUser.name,
    });

    setNewAlert({
      title: '',
      message: '',
      priority: 'Urgent',
      targetAgency: 'ALL',
    });
    setShowDispatchForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900 font-display">
              Urgent Push Alerts & Department Notices
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Filter segmented tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['ALL', 'Urgent', 'Notice', 'Info'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  filterPriority === p
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setShowDispatchForm(!showDispatchForm)}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast Alert</span>
            </button>
          )}
        </div>

        {/* Admin Broadcast Alert Form */}
        {showDispatchForm && (
          <form onSubmit={handleDispatchSubmit} className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-3">
            <div className="font-bold text-red-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-red-600 animate-pulse" /> Dispatch Urgent Department Alert
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Alert Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Venue Relocation Notice / Urgent Weather Alert"
                value={newAlert.title}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Priority Level</label>
                <select
                  value={newAlert.priority}
                  onChange={(e) => setNewAlert({ ...newAlert, priority: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono font-medium"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Notice">Notice</option>
                  <option value="Info">Info</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Target Agency</label>
                <select
                  value={newAlert.targetAgency}
                  onChange={(e) => setNewAlert({ ...newAlert, targetAgency: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono font-medium"
                >
                  <option value="ALL">All Agencies & Staff</option>
                  <option value="RCSC">RCSC Civil Servants</option>
                  <option value="DZO">Dzongkhag Administration</option>
                  <option value="MoESD">Ministry of Education</option>
                  <option value="MoH">Ministry of Health</option>
                  <option value="LG-GEWOGS">Local Gewogs</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Alert Content *</label>
              <textarea
                rows={2}
                required
                placeholder="Detailed broadcast announcement details..."
                value={newAlert.message}
                onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDispatchForm(false)}
                className="px-3 py-1 rounded bg-slate-200 text-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Broadcast Now
              </button>
            </div>
          </form>
        )}

        {/* Alerts Feed */}
        <div className="space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No alerts matching priority filter.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isUrgent = alert.priority === 'Urgent';
              return (
                <div
                  key={alert.id}
                  onClick={() => onMarkAsRead(alert.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    !alert.read
                      ? isUrgent
                        ? 'bg-red-50 border-red-300 ring-1 ring-red-300'
                        : 'bg-amber-50 border-amber-300'
                      : 'bg-slate-50 border-slate-200 opacity-90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isUrgent
                            ? 'bg-red-600 text-white border-red-700'
                            : alert.priority === 'Notice'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-blue-100 text-blue-900 border-blue-300'
                        }`}
                      >
                        {alert.priority}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs font-display">
                        {alert.title}
                      </h4>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 font-medium whitespace-nowrap">
                      {alert.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{alert.message}</p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200/80">
                    <span>Sender: {alert.sender}</span>
                    <span>Target: {alert.targetAgency}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
