import React, { useState } from 'react';
import { TrainingEvent, UserProfile, Room } from '../types';
import { downloadTrainingICS } from '../utils/icsExporter';
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Plus, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  X,
  Building,
  Tag,
  Download
} from 'lucide-react';

interface TrainingScheduleViewProps {
  trainings: TrainingEvent[];
  rooms: Room[];
  currentUser: UserProfile;
  onAddTraining: (training: Omit<TrainingEvent, 'id' | 'enrolledCount' | 'status'>) => void;
}

export const TrainingScheduleView: React.FC<TrainingScheduleViewProps> = ({
  trainings,
  rooms,
  currentUser,
  onAddTraining,
}) => {
  const [selectedAgency, setSelectedAgency] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTrainingModal, setSelectedTrainingModal] = useState<TrainingEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State for Proposing Training
  const [formState, setFormState] = useState({
    title: '',
    category: 'Leadership & Governance' as TrainingEvent['category'],
    agency: currentUser.agency,
    agencyCode: currentUser.agencyCode,
    roomId: rooms[0]?.id || '',
    startDate: '2026-11-12',
    endDate: '2026-11-13',
    startTime: '09:00',
    endTime: '16:00',
    facilitator: currentUser.name,
    totalSeats: 40,
    description: '',
    learningOutcomes: [] as string[],
  });

  const [aiGeneratingAgenda, setAiGeneratingAgenda] = useState(false);
  const [generatedAgendaData, setGeneratedAgendaData] = useState<any | null>(null);

  const agenciesList = [
    { code: 'ALL', name: 'All Agencies' },
    { code: 'RCSC', name: 'Royal Civil Service Commission (RCSC)' },
    { code: 'DZO', name: 'Dzongkhag Admin Tsirang' },
    { code: 'MoESD', name: 'Ministry of Education & Skills' },
    { code: 'MoH', name: 'Ministry of Health' },
    { code: 'LG-GEWOGS', name: 'Gewog Administrations' },
  ];

  const categoriesList = [
    'ALL',
    'Leadership & Governance',
    'Digital Skills & ICT',
    'Public Administration',
    'Pedagogy & Teaching',
    'Health & Safety',
  ];

  const filteredTrainings = trainings.filter((t) => {
    const matchesAgency = selectedAgency === 'ALL' || t.agencyCode === selectedAgency;
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesAgency && matchesCategory;
  });

  const handleCreateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    const roomObj = rooms.find((r) => r.id === formState.roomId);

    onAddTraining({
      title: formState.title,
      category: formState.category,
      agency: formState.agency,
      agencyCode: formState.agencyCode,
      roomId: formState.roomId,
      roomName: roomObj?.name || 'GNH Main Hall',
      startDate: formState.startDate,
      endDate: formState.endDate,
      startTime: formState.startTime,
      endTime: formState.endTime,
      facilitator: formState.facilitator,
      totalSeats: Number(formState.totalSeats),
      description: formState.description,
      learningOutcomes: formState.learningOutcomes.length > 0 ? formState.learningOutcomes : ['Gain competency in core public administration standards'],
      agenda: generatedAgendaData?.schedule || [],
    });

    setShowCreateModal(false);
  };

  // Call Gemini AI Agenda Generator
  const handleAIGenerateAgenda = async () => {
    if (!formState.title) {
      alert('Please provide a Training Title first.');
      return;
    }

    setAiGeneratingAgenda(true);
    try {
      const res = await fetch('/api/gemini/generate-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: formState.title,
          targetAgency: formState.agency,
          durationDays: 2,
          targetAudience: 'Civil Servants and Local Officers',
        }),
      });

      const data = await res.json();
      if (data.success && data.agenda) {
        setGeneratedAgendaData(data.agenda);
        if (data.agenda.learningOutcomes) {
          setFormState((prev) => ({
            ...prev,
            learningOutcomes: data.agenda.learningOutcomes,
            description: data.agenda.overview || prev.description,
          }));
        }
      }
    } catch (err) {
      console.error('AI Agenda generation error:', err);
    } finally {
      setAiGeneratingAgenda(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Inter-Agency Training Schedule & Coordination
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Centralized calendar of professional development workshops, governance seminars, and technical capacity programs in Tsirang.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-xs flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Propose Training Workshop</span>
        </button>
      </div>

      {/* Agency Filter Tabs & Category Pills */}
      <div className="space-y-3">
        {/* Agency Segmented Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
          {agenciesList.map((a) => {
            const isSelected = selectedAgency === a.code;
            return (
              <button
                key={a.code}
                onClick={() => setSelectedAgency(a.code)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {a.name}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <span className="text-xs text-slate-600 font-mono font-medium flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-amber-600" /> Domain:
          </span>
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Master Training Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTrainings.map((event) => {
          const isInProgress = event.status === 'In-Progress';
          const isCompleted = event.status === 'Completed';

          return (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {event.agencyCode} · {event.category}
                  </span>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isInProgress
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
                        : isCompleted
                        ? 'bg-slate-100 text-slate-600 border-slate-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base font-display leading-snug">
                  {event.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{event.startDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-slate-900 font-bold">{event.roomName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-mono text-slate-600 font-medium">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>
                    <strong className="text-slate-900">{event.enrolledCount}</strong> / {event.totalSeats} Enrolled
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadTrainingICS(event)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    title="Add workshop to personal calendar (.ics)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.ics</span>
                  </button>

                  <button
                    onClick={() => setSelectedTrainingModal(event)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>View Agenda</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Training & Agenda Drawer Modal */}
      {selectedTrainingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 my-8">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {selectedTrainingModal.agencyCode} · {selectedTrainingModal.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-display mt-2">
                  {selectedTrainingModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrainingModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-500 block">Host Agency</span>
                  <span className="font-bold text-slate-900">{selectedTrainingModal.agency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Lead Facilitator</span>
                  <span className="font-bold text-slate-900">{selectedTrainingModal.facilitator}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location Venue</span>
                  <span className="font-bold text-amber-800">{selectedTrainingModal.roomName}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1 font-mono text-amber-700">
                  Workshop Overview
                </h4>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedTrainingModal.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2 font-mono text-emerald-700">
                  Key Learning Outcomes
                </h4>
                <ul className="space-y-1.5 text-slate-700 list-disc list-inside font-medium">
                  {selectedTrainingModal.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedTrainingModal.agenda && selectedTrainingModal.agenda.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider font-mono text-blue-700">
                    Day-by-Day Agenda Breakdown
                  </h4>
                  {selectedTrainingModal.agenda.map((dayObj) => (
                    <div key={dayObj.day} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-mono text-amber-800 font-bold">
                        Day {dayObj.day} Schedule
                      </div>
                      <div className="space-y-2">
                        {dayObj.sessions.map((sess, sIdx) => (
                          <div key={sIdx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-1.5 text-slate-700 font-medium">
                            <span className="font-mono text-amber-700 text-[11px] w-32 shrink-0 font-bold">{sess.time}</span>
                            <span className="font-semibold text-slate-900 flex-1">{sess.module}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{sess.trainer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => downloadTrainingICS(selectedTrainingModal)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export to iCal / Outlook (.ics)</span>
              </button>

              <button
                onClick={() => setSelectedTrainingModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Training Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Propose Agency Training Program
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit a new training course for civil servants and local officials in Tsirang.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTraining} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700">Training Title *</label>
                    <button
                      type="button"
                      onClick={handleAIGenerateAgenda}
                      disabled={aiGeneratingAgenda}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      {aiGeneratingAgenda ? 'Drafting Agenda...' : 'AI Agenda Builder'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tsirang Gewog Financial Auditing & Public Standards"
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Competency Category *</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-medium"
                  >
                    <option value="Leadership & Governance">Leadership & Governance</option>
                    <option value="Digital Skills & ICT">Digital Skills & ICT</option>
                    <option value="Public Administration">Public Administration</option>
                    <option value="Pedagogy & Teaching">Pedagogy & Teaching</option>
                    <option value="Health & Safety">Health & Safety</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Venue Room *</label>
                  <select
                    value={formState.roomId}
                    onChange={(e) => setFormState({ ...formState, roomId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-medium"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formState.startDate}
                    onChange={(e) => setFormState({ ...formState, startDate: e.target.value, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Total Participant Seats *</label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="200"
                    value={formState.totalSeats}
                    onChange={(e) => setFormState({ ...formState, totalSeats: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Facilitator / Lead Trainer *</label>
                  <input
                    type="text"
                    required
                    value={formState.facilitator}
                    onChange={(e) => setFormState({ ...formState, facilitator: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Course Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide overview of workshop content and targeted civil service competencies..."
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {generatedAgendaData && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Generated Agenda Ready!
                  </div>
                  <p className="text-slate-700">{generatedAgendaData.overview}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
                >
                  Publish Training
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
