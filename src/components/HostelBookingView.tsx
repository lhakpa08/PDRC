import React, { useState } from 'react';
import { HostelRoom, HostelBooking, UserProfile } from '../types';
import { 
  BedDouble, 
  Calendar, 
  Users, 
  CheckCircle2, 
  X, 
  Check, 
  ShieldCheck, 
  MapPin, 
  Coffee, 
  Wifi,
  Sparkles,
  Phone
} from 'lucide-react';

interface HostelBookingViewProps {
  hostelRooms: HostelRoom[];
  hostelBookings: HostelBooking[];
  currentUser: UserProfile;
  onAddHostelBooking: (booking: Omit<HostelBooking, 'id' | 'status'>) => void;
  onUpdateHostelBookingStatus?: (id: string, status: any) => void;
  onApproveAllPendingHostelBookings?: () => void;
}

export const HostelBookingView: React.FC<HostelBookingViewProps> = ({
  hostelRooms,
  hostelBookings,
  currentUser,
  onAddHostelBooking,
  onUpdateHostelBookingStatus,
  onApproveAllPendingHostelBookings,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<HostelRoom | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    guestName: currentUser.name,
    agency: currentUser.agency,
    checkInDate: '2026-11-04',
    checkOutDate: '2026-11-06',
    guestsCount: 1,
    contactPhone: '+975 17 654 321',
  });

  const [reservationSuccess, setReservationSuccess] = useState(false);

  const filteredRooms = hostelRooms.filter((r) => {
    return selectedType === 'ALL' || r.type === selectedType;
  });

  const handleOpenReserve = (room: HostelRoom) => {
    setSelectedRoom(room);
    setReservationSuccess(false);
    setShowReserveModal(true);
  };

  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    onAddHostelBooking({
      hostelRoomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      guestName: formData.guestName,
      agency: formData.agency,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      guestsCount: Number(formData.guestsCount),
      contactPhone: formData.contactPhone,
    });

    setReservationSuccess(true);
    setTimeout(() => {
      setReservationSuccess(false);
      setShowReserveModal(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-amber-600" />
            PDC Tsirang Trainee Hostel & Lodging
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Self-catering trainee accommodation for multi-day workshops and residential audit seminars in Tsirang.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>100+ Trainee Bed Capacity · Dining Hall & All-Inclusive Accessibility</span>
        </div>
      </div>

      {/* Admin Hostel Approval Queue Banner */}
      {hostelBookings.some((hb) => hb.status === 'Pending') && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-display text-sm">
                RAA
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-display flex items-center gap-2">
                  <span>Pending Trainee Hostel Lodging Review Queue</span>
                  <span className="bg-amber-500 text-slate-950 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {hostelBookings.filter((hb) => hb.status === 'Pending').length} Pending
                  </span>
                </h3>
                <p className="text-xs text-amber-900 font-medium">
                  Approve trainee lodging suites for visiting agency delegates and seminar participants.
                </p>
              </div>
            </div>

            {currentUser.role === 'ADMIN' && onApproveAllPendingHostelBookings && (
              <button
                onClick={onApproveAllPendingHostelBookings}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>Approve All Pending ({hostelBookings.filter((hb) => hb.status === 'Pending').length})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hostelBookings
              .filter((hb) => hb.status === 'Pending')
              .map((hb) => (
                <div key={hb.id} className="bg-white border border-amber-200 p-4 rounded-xl space-y-2 text-xs shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 font-sans text-sm">{hb.guestName}</h4>
                      <div className="text-amber-800 font-mono font-bold">{hb.roomNumber} ({hb.agency})</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      PENDING
                    </span>
                  </div>

                  <div className="space-y-0.5 text-slate-600 font-mono text-[11px]">
                    <div>Dates: <strong>{hb.checkInDate} to {hb.checkOutDate}</strong></div>
                    <div>Guests: <strong>{hb.guestsCount} Delegate(s)</strong> · Phone: {hb.contactPhone}</div>
                  </div>

                  {currentUser.role === 'ADMIN' && onUpdateHostelBookingStatus && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => onUpdateHostelBookingStatus(hb.id, 'Cancelled')}
                        className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs transition flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => onUpdateHostelBookingStatus(hb.id, 'Confirmed')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Suite</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-xs">
        {['ALL', 'Executive Suite', 'Single Suite', 'Shared Twin Room', 'Accessible Suite'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
              selectedType === type
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Hostel Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredRooms.map((room) => {
          const isAvailable = room.status === 'Available';
          return (
            <div
              key={room.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs hover:border-amber-400 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    {room.roomNumber}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    {room.type}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{room.floor}</div>
                </div>

                <div className="text-sm font-extrabold text-slate-900 font-mono">
                  Nu. {room.nightlyRate.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ night</span>
                </div>

                {room.isAccessible && (
                  <div className="text-[11px] text-emerald-700 font-mono font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Barrier-Free & Wheelchair Friendly</span>
                  </div>
                )}

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500 font-mono font-bold block">Room Amenities:</span>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.map((a) => (
                      <span
                        key={a}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenReserve(room)}
                  disabled={!isAvailable}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                    isAvailable
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isAvailable ? 'Reserve Trainee Suite' : 'Currently Occupied'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Trainee Reservations List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 font-display border-b border-slate-100 pb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          Active Trainee Hostel Reservations ({hostelBookings.length})
        </h2>

        <div className="space-y-3">
          {hostelBookings.map((hb) => (
            <div
              key={hb.id}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono font-medium"
            >
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm font-sans">{hb.guestName} ({hb.agency})</div>
                <div className="text-slate-600">
                  Assigned: <span className="text-amber-800 font-bold">{hb.roomNumber}</span> · Check-In: {hb.checkInDate} to {hb.checkOutDate}
                </div>
                <div className="text-slate-500">Contact: {hb.contactPhone}</div>
              </div>

              <span className="text-[10px] font-bold px-3 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 self-start sm:self-auto">
                {hb.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Modal */}
      {showReserveModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Reserve Trainee Suite: {selectedRoom.roomNumber}
                </h3>
                <p className="text-xs text-slate-500">{selectedRoom.type} · Nu. {selectedRoom.nightlyRate}/night</p>
              </div>
              <button
                onClick={() => setShowReserveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reservationSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-slate-900 font-display">Hostel Suite Reserved!</h4>
                <p className="text-xs text-slate-600">
                  Reservation confirmed for {formData.guestName}. Key card pickup available at PDC Tsirang Reception.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReservation} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Trainee / Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Agency / Dzongkhag *</label>
                  <input
                    type="text"
                    required
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Check-In Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.checkInDate}
                      onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Check-Out Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Contact Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReserveModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs"
                  >
                    Confirm Lodging
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
