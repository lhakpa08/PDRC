import React, { useState } from 'react';
import { Room, RoomBooking, TrainingEvent, ParticipantRecord } from '../types';
import { CertificateModal } from './CertificateModal';
import { downloadAllBookingsICS } from '../utils/icsExporter';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  Printer, 
  BarChart3, 
  Building2, 
  Users, 
  Award, 
  CheckCircle2, 
  Clock, 
  Filter,
  Calendar
} from 'lucide-react';

interface ReportsViewProps {
  rooms: Room[];
  bookings: RoomBooking[];
  trainings: TrainingEvent[];
  participants: ParticipantRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  rooms,
  bookings,
  trainings,
  participants,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<
    'completion' | 'utilization' | 'agency' | 'certificates'
  >('completion');

  // Executive Summarizer State
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>(trainings[0]?.id || '');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiReportSummary, setAiReportSummary] = useState<string | null>(null);

  // Certificate Generator State
  const [certParticipant, setCertParticipant] = useState(participants[0] || null);
  const [showCertModal, setShowCertModal] = useState(false);

  const selectedTraining = trainings.find((t) => t.id === selectedTrainingId) || trainings[0];
  const selectedEventParticipants = participants.filter((p) => p.eventId === selectedTrainingId);
  const presentCount = selectedEventParticipants.filter((p) => p.status === 'Present').length;
  const attendanceRate = selectedEventParticipants.length > 0
    ? Math.round((presentCount / selectedEventParticipants.length) * 100)
    : 95;

  const handleGenerateAISummary = async () => {
    setIsSummarizing(true);
    setAiReportSummary(null);

    try {
      const res = await fetch('/api/gemini/summarize-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: selectedTraining?.title,
          agency: selectedTraining?.agency,
          date: selectedTraining?.startDate,
          participantsCount: presentCount || selectedTraining?.enrolledCount,
          attendanceRate: attendanceRate,
          venue: selectedTraining?.roomName,
          feedbackNotes: 'Participants demonstrated high engagement in digital governance & GNH competency modules.',
        }),
      });

      const data = await res.json();
      if (data.success && data.summary) {
        setAiReportSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).map((val) => `"${val}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Automated Reporting & Analytics Hub
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Generate official PDRC training completion summaries, room utilization analytics, agency participation indexes, and certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => downloadAllBookingsICS(bookings)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Export Master Calendar (.ics)</span>
          </button>
          <button
            onClick={() => exportCSV(bookings, 'PDRC_Room_Bookings_Report')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition border border-slate-300 shadow-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Bookings CSV</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('completion')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeReportTab === 'completion'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Training Completion Report</span>
        </button>

        <button
          onClick={() => setActiveReportTab('utilization')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeReportTab === 'utilization'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Room Utilization Analytics</span>
        </button>

        <button
          onClick={() => setActiveReportTab('agency')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeReportTab === 'agency'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Agency Participation Index</span>
        </button>

        <button
          onClick={() => setActiveReportTab('certificates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeReportTab === 'certificates'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificate Portal</span>
        </button>
      </div>

      {/* 1. Training Completion Report Tab */}
      {activeReportTab === 'completion' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider block">
                  Select Training Course for Report Synthesis:
                </label>
                <select
                  value={selectedTrainingId}
                  onChange={(e) => setSelectedTrainingId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold font-display focus:outline-none"
                >
                  {trainings.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.agencyCode})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateAISummary}
                disabled={isSummarizing}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSummarizing ? 'Synthesizing Report...' : 'Generate Executive Summary'}</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Host Agency</span>
                <span className="font-bold text-slate-900">{selectedTraining?.agency}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Venue Hall</span>
                <span className="font-bold text-amber-800">{selectedTraining?.roomName}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Attended Participants</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {presentCount} / {selectedTraining?.enrolledCount} Enrolled
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Attendance Rate</span>
                <span className="font-bold text-slate-900 tabular-nums">{attendanceRate}%</span>
              </div>
            </div>

            {/* AI Generated Report Output */}
            {aiReportSummary && (
              <div className="bg-amber-50/60 border border-amber-200 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold font-display text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Official PDRC Executive Synthesis Report
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="text-xs text-amber-900 font-bold hover:text-slate-900 flex items-center gap-1 font-mono"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Report
                  </button>
                </div>

                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans space-y-2 font-medium">
                  {aiReportSummary}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Room Utilization Analytics Tab */}
      {activeReportTab === 'utilization' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              Venue Occupancy & Facility Usage Breakdown
            </h2>

            <div className="space-y-4">
              {rooms.map((room) => {
                const roomBookings = bookings.filter((b) => b.roomId === room.id);
                const totalHoursBooked = roomBookings.length * 5;
                const utilizationPercent = Math.min(100, Math.round((totalHoursBooked / 40) * 100));

                return (
                  <div key={room.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{room.name}</span>
                        <span className="text-slate-500 font-mono ml-2">({room.code})</span>
                      </div>
                      <div className="font-mono text-slate-600 font-medium">
                        Total Bookings: <strong className="text-slate-900">{roomBookings.length}</strong> | Hours Booked: <strong className="text-amber-800">{totalHoursBooked} hrs</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full transition-all"
                          style={{ width: `${utilizationPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-800 w-12 text-right">
                        {utilizationPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Agency Participation Index Tab */}
      {activeReportTab === 'agency' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Inter-Agency Participation Index (Tsirang Dzongkhag)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { agency: 'Dzongkhag Administration, Tsirang', code: 'DZO', trained: 142, trainings: 6 },
                { agency: 'Royal Civil Service Commission', code: 'RCSC', trained: 115, trainings: 4 },
                { agency: 'Ministry of Education & Skills', code: 'MoESD', trained: 98, trainings: 3 },
                { agency: 'Ministry of Health', code: 'MoH', trained: 72, trainings: 2 },
                { agency: 'Local Gewog Administrations', code: 'LG-GEWOGS', trained: 55, trainings: 3 },
              ].map((item) => (
                <div key={item.code} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 font-display">{item.agency}</span>
                    <span className="text-amber-800 font-mono font-bold">{item.code}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 pt-1 font-medium">
                    <div>Civil Servants Trained: <strong className="text-slate-900">{item.trained}</strong></div>
                    <div>Trainings Organized: <strong className="text-slate-900">{item.trainings}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Certificate Portal Tab */}
      {activeReportTab === 'certificates' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  Automated Official Certificate Generator
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Issue printable certificates of professional development for verified attendees.
                </p>
              </div>

              {certParticipant && (
                <button
                  onClick={() => setShowCertModal(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Generate Certificate Preview</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-mono font-bold">
                    <th className="py-2.5 px-3">Civil Servant Name & CID</th>
                    <th className="py-2.5 px-3">Agency</th>
                    <th className="py-2.5 px-3">Course Title</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {participants.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-slate-900 text-sm">{p.participantName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">CID: {p.cid}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 text-[11px] font-medium">{p.agency}</td>
                      <td className="py-3 px-3 text-amber-800 text-[11px] font-bold">{p.eventTitle}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setCertParticipant(p);
                            setShowCertModal(true);
                          }}
                          className="px-3 py-1 rounded bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-amber-800 text-xs font-bold transition border border-slate-200"
                        >
                          View Certificate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertModal && certParticipant && (
        <CertificateModal
          participantName={certParticipant.participantName}
          courseTitle={certParticipant.eventTitle}
          agencyName={certParticipant.agency}
          issueDate={new Date().toISOString().substring(0, 10)}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};
