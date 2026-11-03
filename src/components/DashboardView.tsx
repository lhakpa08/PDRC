import React, { useState } from 'react';
import { UserProfile, Room, RoomBooking, TrainingEvent, NewsItem, CafeteriaFacility } from '../types';
import { downloadBookingICS } from '../utils/icsExporter';
import { 
  Building2, 
  Calendar, 
  UserCheck, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingUp,
  AlertCircle,
  Activity,
  ChevronRight,
  Search,
  Filter,
  Layers,
  Award,
  Download,
  Newspaper,
  Utensils,
  Pin,
  Settings,
  ShieldCheck
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: UserProfile;
  rooms: Room[];
  bookings: RoomBooking[];
  trainings: TrainingEvent[];
  news: NewsItem[];
  cafeteria: CafeteriaFacility;
  onNavigate: (tab: string) => void;
  onOpenBookingModal: (room?: Room) => void;
  onUpdateBookingStatus?: (bookingId: string, status: any) => void;
  onApproveAllPendingBookings?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  rooms,
  bookings,
  trainings,
  news,
  cafeteria,
  onNavigate,
  onOpenBookingModal,
  onUpdateBookingStatus,
  onApproveAllPendingBookings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'floorplan' | 'venues' | 'trainings' | 'activity'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const availableRoomsCount = rooms.filter((r) => r.status === 'Available').length;
  const occupiedRoomsCount = rooms.filter((r) => r.status === 'Occupied').length;
  const reservedRoomsCount = rooms.filter((r) => r.status === 'Reserved').length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;

  const currentActiveEvent = trainings.find((t) => t.status === 'In-Progress') || trainings[0];

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        {/* Subtle Bhutan Accent Light Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Kuzu Zangpo, {currentUser.name} ({currentUser.agencyCode})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              PDRC Operational Dashboard
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed font-medium">
              Professional Development & Research Centre · Tsirang Dzongkhag Administration, Bhutan.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            {currentUser.role === 'ADMIN' && (
              <button
                onClick={() => onNavigate('admin-customizer')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md flex items-center gap-2 border border-amber-300"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Customize News & Facilities</span>
              </button>
            )}
            <button
              onClick={() => onOpenBookingModal()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Book Venue</span>
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs transition shadow-xs flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Attendance Scanner</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition border border-slate-300 shadow-xs flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Room Occupancy Rate</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {Math.round((occupiedRoomsCount / rooms.length) * 100)}%
            </span>
            <span className="text-[11px] text-emerald-600 font-mono font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8%
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${(occupiedRoomsCount / rooms.length) * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-mono font-medium flex justify-between">
              <span>{occupiedRoomsCount} Occupied</span>
              <span>{availableRoomsCount} Available</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Workshops</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {trainings.length}
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-semibold">4 Agencies</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Capacity programs scheduled this month</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Civil Servants Trained</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              482
            </span>
            <span className="text-[11px] text-emerald-700 font-mono font-bold">12 Gewogs</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">100% verified digital attendance</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Pending Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-700 font-mono tabular-nums">
              {pendingBookingsCount}
            </span>
            <span className="text-[11px] text-amber-800 font-mono font-bold">Action Needed</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Room requests awaiting PDRC review</p>
        </div>
      </div>

      {/* Dashboard Segmented Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Live Session
          </button>
          <button
            onClick={() => setActiveSubTab('floorplan')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'floorplan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Floor Plan
          </button>
          <button
            onClick={() => setActiveSubTab('venues')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'venues'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Venue Availability ({availableRoomsCount} Free)
          </button>
          <button
            onClick={() => setActiveSubTab('trainings')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'trainings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trainings Schedule ({trainings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('activity')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeSubTab === 'activity'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recent Bookings Log
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search hall or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Tab Content: Interactive Floor Plan */}
      {activeSubTab === 'floorplan' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                PDRC Tsirang Real-Time Campus Floor Plan
              </h2>
              <p className="text-xs text-slate-500">
                Live building layout showing vacant and occupied halls across all campus wings. Click any room for instant one-click booking.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" /> Vacant / Available ({availableRoomsCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" /> Occupied / Reserved ({occupiedRoomsCount + reservedRoomsCount})
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {Array.from(new Set(rooms.map((r) => r.floor))).map((floorName) => {
              const floorRooms = rooms.filter((r) => r.floor === floorName);
              return (
                <div key={floorName} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      {floorName}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      {floorRooms.length} {floorRooms.length === 1 ? 'Venue' : 'Venues'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {floorRooms.map((room) => {
                      const isAvailable = room.status === 'Available';
                      return (
                        <div
                          key={room.id}
                          onClick={() => onOpenBookingModal(room)}
                          className={`bg-white border rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-md group ${
                            isAvailable
                              ? 'border-emerald-200 hover:border-emerald-400'
                              : 'border-amber-200 hover:border-amber-400'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                {room.code}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                  isAvailable
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                                {room.status}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-900 text-sm font-display group-hover:text-amber-700 transition">
                                {room.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {room.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 pt-1">
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-amber-600" /> {room.capacity} seats
                              </span>
                              <span>·</span>
                              <span className="font-semibold text-slate-900">Nu. {room.hourlyRate}/hr</span>
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-[11px] font-mono text-slate-400">Click to book</span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center gap-1 shadow-xs">
                              <span>Book Now</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Active Session Highlight */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Live Session in Progress
                </h2>
              </div>
              <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 font-bold">
                {currentActiveEvent.roomName}
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                {currentActiveEvent.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10px]">ORGANIZING AGENCY</span>
                  <span className="font-semibold text-slate-900">{currentActiveEvent.agency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LEAD FACILITATOR</span>
                  <span className="font-semibold text-slate-900">{currentActiveEvent.facilitator}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PARTICIPANTS</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {currentActiveEvent.enrolledCount} / {currentActiveEvent.totalSeats} Enrolled
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {currentActiveEvent.description}
              </p>

              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100">
                <span className="text-slate-500 font-mono">Schedule: {currentActiveEvent.startTime} - {currentActiveEvent.endTime}</span>
                <button
                  onClick={() => onNavigate('attendance')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>Launch Roll-Call</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Campus Snapshot */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>PDRC Campus Status</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">LIVE</span>
              </h2>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                  <span className="text-slate-600">Available Halls:</span>
                  <span className="text-emerald-700 font-bold">{availableRoomsCount} Rooms</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                  <span className="text-slate-600">Occupied Halls:</span>
                  <span className="text-amber-700 font-bold">{occupiedRoomsCount} Rooms</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                  <span className="text-slate-600">Cafeteria Capacity:</span>
                  <span className="text-blue-700 font-bold">{cafeteria.totalCapacity} Guests</span>
                </div>
              </div>
            </div>

            {/* Cafeteria Summary Box */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-900 font-display">
                <span className="flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  Today's Dining Menu
                </span>
                <span className="text-[10px] font-mono text-slate-600">{cafeteria.operatingHours}</span>
              </div>
              <p className="text-[11px] text-amber-950 font-medium line-clamp-2">
                {cafeteria.currentMenu}
              </p>
            </div>

            <button
              onClick={() => onNavigate('rooms')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-200 transition flex items-center justify-center gap-2"
            >
              <span>View Interactive Room Grid</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Institutional News & Picture Updates Section (Full Width Below) */}
          <div className="lg:col-span-3 space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-amber-600" />
                  PDRC Institutional News & Photo Updates
                </h2>
                <p className="text-xs text-slate-500">
                  Latest campus announcements, facility upgrades, and press releases published by PDRC Administration.
                </p>
              </div>

              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => onNavigate('admin-customizer')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Manage News & Photos</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="bg-slate-950/80 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                          {item.category}
                        </span>
                        {item.isPinned && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Pinned
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-slate-900 text-sm font-display leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{item.date}</span>
                    <span className="font-semibold text-slate-700">{item.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Venues Grid */}
      {activeSubTab === 'venues' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const isAvailable = room.status === 'Available';
            const isOccupied = room.status === 'Occupied';

            return (
              <div
                key={room.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-amber-400 transition flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 text-slate-900 text-[11px] font-mono font-bold px-2.5 py-1 rounded border border-slate-200">
                      {room.code}
                    </div>
                    <div
                      className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isOccupied
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}
                    >
                      {room.status}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-base font-display">
                      {room.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>

                    <div className="text-xs font-mono text-amber-700 font-bold pt-1">
                      Capacity: {room.capacity} seats · Nu. {room.hourlyRate}/hr
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">{room.floor}</span>
                  <button
                    onClick={() => onOpenBookingModal(room)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
                  >
                    Reserve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content 3: Trainings Schedule */}
      {activeSubTab === 'trainings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainings.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  {event.agencyCode} · {event.category}
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">{event.status}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-base font-display">
                {event.title}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>Date: <strong className="text-slate-900">{event.startDate}</strong></div>
                <div>Venue: <strong className="text-amber-800">{event.roomName}</strong></div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-mono">Enrolled: {event.enrolledCount}/{event.totalSeats}</span>
                <button
                  onClick={() => onNavigate('trainings')}
                  className="text-amber-700 hover:text-amber-900 font-bold text-xs flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content 4: Recent Bookings Activity */}
      {activeSubTab === 'activity' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Recent Room Booking Requests & Approvals Log
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Export .ics calendar files for your personal schedule
            </span>
          </div>

          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm font-sans">{booking.eventTitle}</div>
                  <div className="text-slate-600">
                    Venue: <span className="text-amber-800 font-bold">{booking.roomName}</span> · Date: {booking.date} ({booking.startTime} - {booking.endTime})
                  </div>
                  <div className="text-slate-500">Applicant: {booking.bookedBy} ({booking.agency})</div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => downloadBookingICS(booking)}
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    title="Export .ics file for calendar import"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.ics</span>
                  </button>

                  {currentUser.role === 'ADMIN' && booking.status === 'Pending' && onUpdateBookingStatus && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'Approved')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'Rejected')}
                        className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded border ${
                      booking.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : booking.status === 'Pending'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
