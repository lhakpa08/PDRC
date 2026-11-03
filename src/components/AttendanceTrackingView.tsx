import React, { useState } from 'react';
import { ParticipantRecord, TrainingEvent, AttendanceStatus } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { 
  UserCheck, 
  QrCode, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  UserPlus, 
  WifiOff, 
  RefreshCw,
  Sparkles,
  Download
} from 'lucide-react';

interface AttendanceTrackingViewProps {
  participants: ParticipantRecord[];
  trainings: TrainingEvent[];
  onlineStatus: ReturnType<typeof useOnlineStatus>;
  onUpdateAttendance: (id: string, status: AttendanceStatus, checkInTime?: string) => void;
  onAddParticipant: (participant: Omit<ParticipantRecord, 'id' | 'qrToken'>) => void;
}

export const AttendanceTrackingView: React.FC<AttendanceTrackingViewProps> = ({
  participants,
  trainings,
  onlineStatus,
  onUpdateAttendance,
  onAddParticipant,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(trainings[0]?.id || 'train-201');
  const [searchTerm, setSearchTerm] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [qrScanSuccess, setQrScanSuccess] = useState<string | null>(null);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);

  const { isOnline, enqueueOfflineAction } = onlineStatus;

  // New Participant Form
  const [newPart, setNewPart] = useState({
    participantName: '',
    cid: '',
    agency: 'Dzongkhag Administration, Tsirang',
    email: '',
    phone: '',
  });

  const selectedEvent = trainings.find((t) => t.id === selectedEventId) || trainings[0];
  const eventParticipants = participants.filter((p) => p.eventId === selectedEventId);

  const presentCount = eventParticipants.filter((p) => p.status === 'Present').length;
  const lateCount = eventParticipants.filter((p) => p.status === 'Late').length;
  const excusedCount = eventParticipants.filter((p) => p.status === 'Excused').length;
  const absentCount = eventParticipants.filter((p) => p.status === 'Absent').length;

  const filteredParticipants = eventParticipants.filter(
    (p) =>
      p.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cid.includes(searchTerm) ||
      p.agency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (participantId: string, newStatus: AttendanceStatus) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (!isOnline) {
      enqueueOfflineAction('ATTENDANCE_CHECKIN', {
        participantId,
        status: newStatus,
        timestamp,
      });
    }

    onUpdateAttendance(participantId, newStatus, newStatus === 'Absent' ? undefined : timestamp);
  };

  const handleQRScan = (e: React.FormEvent) => {
    e.preventDefault();
    setQrScanSuccess(null);

    const match = eventParticipants.find(
      (p) => p.qrToken === qrInput.trim() || p.cid === qrInput.trim()
    );

    if (match) {
      handleStatusChange(match.id, 'Present');
      setQrScanSuccess(`Check-In Verified: ${match.participantName} (${match.agency}) marked Present.`);
      setQrInput('');
    } else {
      setQrScanSuccess(`Invalid QR Code or Participant CID not enrolled for this workshop.`);
    }
  };

  const handleAddParticipantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddParticipant({
      eventId: selectedEventId,
      eventTitle: selectedEvent?.title || 'Training Workshop',
      participantName: newPart.participantName,
      cid: newPart.cid,
      agency: newPart.agency,
      email: newPart.email || `${newPart.cid}@tsirang.gov.bt`,
      phone: newPart.phone || '+975 17 000 000',
      status: 'Present',
      checkInTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    setNewPart({
      participantName: '',
      cid: '',
      agency: 'Dzongkhag Administration, Tsirang',
      email: '',
      phone: '',
    });
    setShowAddParticipantModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            Digital Attendance Roll-Call & QR Scanner
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Real-time participant check-in, QR token scanner, and offline attendance logging for remote Gewogs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddParticipantModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-xs flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Walk-In Registration</span>
          </button>
        </div>
      </div>

      {/* Workshop Selector & Roll-Call Summary */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider block">
              Active Workshop Session:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold font-display focus:outline-none focus:border-emerald-500"
            >
              {trainings.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.agencyCode})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-600 font-mono text-right font-medium">
            <span>Location: </span>
            <strong className="text-amber-800">{selectedEvent?.roomName}</strong>
            <br />
            <span>Enrolled: </span>
            <strong className="text-slate-900">{eventParticipants.length} Civil Servants</strong>
          </div>
        </div>

        {/* Attendance Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center space-y-1">
            <span className="text-[11px] text-emerald-800 font-mono block font-bold">PRESENT</span>
            <span className="text-2xl font-extrabold text-emerald-900 font-mono tabular-nums">{presentCount}</span>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center space-y-1">
            <span className="text-[11px] text-amber-800 font-mono block font-bold">LATE</span>
            <span className="text-2xl font-extrabold text-amber-900 font-mono tabular-nums">{lateCount}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center space-y-1">
            <span className="text-[11px] text-blue-800 font-mono block font-bold">EXCUSED</span>
            <span className="text-2xl font-extrabold text-blue-900 font-mono tabular-nums">{excusedCount}</span>
          </div>

          <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-center space-y-1">
            <span className="text-[11px] text-red-800 font-mono block font-bold">ABSENT</span>
            <span className="text-2xl font-extrabold text-red-900 font-mono tabular-nums">{absentCount}</span>
          </div>
        </div>
      </div>

      {/* QR Scanner Simulator & Search Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Scanner Simulation */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <QrCode className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 font-display">
              QR Code Roll-Call Scanner
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Scan participant QR badge or enter Civil Registration ID (CID) for automatic instant check-in.
          </p>

          <form onSubmit={handleQRScan} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Scan or enter QR token / CID..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
            >
              Verify Check-In Token
            </button>
          </form>

          {qrScanSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-mono font-bold">
              {qrScanSuccess}
            </div>
          )}

          {/* Sample Scannable Tokens quick test list */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] text-slate-500 font-mono font-bold block">Sample Quick Scan Tokens:</span>
            {eventParticipants.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => setQrInput(p.qrToken)}
                className="w-full text-left text-[11px] font-mono bg-slate-50 hover:bg-slate-100 p-2 rounded border border-slate-200 text-amber-800 font-semibold flex justify-between items-center"
              >
                <span>{p.participantName}</span>
                <span className="text-slate-500">{p.cid}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Participant Roster Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter roster by participant name, CID, or agency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            {!isOnline && (
              <span className="text-[11px] text-amber-800 font-mono font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                <WifiOff className="w-3.5 h-3.5" /> Offline Sync Active
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-mono font-bold">
                  <th className="py-2.5 px-3">Participant Name & CID</th>
                  <th className="py-2.5 px-3">Agency</th>
                  <th className="py-2.5 px-3">Check-In Time</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredParticipants.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-slate-900 text-sm">{p.participantName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">CID: {p.cid}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 text-[11px] font-medium">
                        {p.agency}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {p.checkInTime ? p.checkInTime : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            p.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : p.status === 'Late'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : p.status === 'Excused'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStatusChange(p.id, 'Present')}
                            title="Mark Present"
                            className={`p-1 rounded ${
                              p.status === 'Present'
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-slate-200'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(p.id, 'Late')}
                            title="Mark Late"
                            className={`p-1 rounded ${
                              p.status === 'Late'
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-100 text-slate-500 hover:text-amber-600 hover:bg-slate-200'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(p.id, 'Absent')}
                            title="Mark Absent"
                            className={`p-1 rounded ${
                              p.status === 'Absent'
                                ? 'bg-red-600 text-white font-bold'
                                : 'bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-slate-200'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Walk-in Registration Modal */}
      {showAddParticipantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Walk-In Participant Registration
              </h3>
              <button
                onClick={() => setShowAddParticipantModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddParticipantSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Participant Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tshering Dema"
                  value={newPart.participantName}
                  onChange={(e) => setNewPart({ ...newPart, participantName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Civil Registration ID (CID) *</label>
                <input
                  type="text"
                  required
                  placeholder="11-digit Bhutanese CID"
                  value={newPart.cid}
                  onChange={(e) => setNewPart({ ...newPart, cid: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Agency / Gewog Administration *</label>
                <input
                  type="text"
                  required
                  value={newPart.agency}
                  onChange={(e) => setNewPart({ ...newPart, agency: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddParticipantModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                >
                  Register & Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
