import React, { useState } from 'react';
import { Room, RoomBooking, UserProfile } from '../types';
import { downloadBookingICS } from '../utils/icsExporter';
import { 
  Building2, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Check,
  Zap,
  Info,
  Download
} from 'lucide-react';

interface RoomBookingViewProps {
  rooms: Room[];
  bookings: RoomBooking[];
  currentUser: UserProfile;
  onAddBooking: (booking: Omit<RoomBooking, 'id' | 'createdAt'>) => boolean;
  onUpdateBookingStatus?: (bookingId: string, status: any) => void;
  onApproveAllPendingBookings?: () => void;
  selectedRoomForModal?: Room | null;
  onCloseModal: () => void;
  isModalOpen: boolean;
  onOpenModal: (room?: Room) => void;
}

export const RoomBookingView: React.FC<RoomBookingViewProps> = ({
  rooms,
  bookings,
  currentUser,
  onAddBooking,
  onUpdateBookingStatus,
  onApproveAllPendingBookings,
  selectedRoomForModal,
  onCloseModal,
  isModalOpen,
  onOpenModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [minCapacity, setMinCapacity] = useState(0);
  const [selectedDate, setSelectedDate] = useState('2026-11-04');

  // Booking Modal Form state
  const [formData, setFormData] = useState({
    roomId: selectedRoomForModal?.id || rooms[0]?.id || '',
    eventTitle: '',
    agency: currentUser.agency,
    agencyCode: currentUser.agencyCode,
    bookedBy: currentUser.name,
    contactEmail: currentUser.email,
    date: '2026-11-04',
    startDate: '2026-11-04',
    endDate: '2026-11-04',
    startTime: '09:00',
    endTime: '12:00',
    expectedAttendees: 30,
    requestedEquipment: [] as string[],
    purpose: '',
  });

  const [lastSubmittedBooking, setLastSubmittedBooking] = useState<RoomBooking | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [aiRecommending, setAiRecommending] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null);

  // Sync selected room when modal opens
  React.useEffect(() => {
    if (selectedRoomForModal) {
      setFormData((prev) => ({
        ...prev,
        roomId: selectedRoomForModal.id,
        requestedEquipment: selectedRoomForModal.equipment.slice(0, 3),
      }));
    }
  }, [selectedRoomForModal]);

  const allEquipment = Array.from(
    new Set(rooms.flatMap((r) => r.equipment))
  );

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCapacity = room.capacity >= minCapacity;

    const matchesEquipment =
      selectedEquipment.length === 0 ||
      selectedEquipment.every((eq) => room.equipment.includes(eq));

    return matchesSearch && matchesCapacity && matchesEquipment;
  });

  const toggleEquipmentFilter = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((item) => item !== eq) : [...prev, eq]
    );
  };

  const handleEquipmentCheckbox = (eq: string) => {
    setFormData((prev) => ({
      ...prev,
      requestedEquipment: prev.requestedEquipment.includes(eq)
        ? prev.requestedEquipment.filter((item) => item !== eq)
        : [...prev.requestedEquipment, eq],
    }));
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    const targetRoom = rooms.find((r) => r.id === formData.roomId);
    if (!targetRoom) {
      setBookingError('Please select a valid room.');
      return;
    }

    if (formData.expectedAttendees > targetRoom.capacity) {
      setBookingError(
        `Expected attendees (${formData.expectedAttendees}) exceeds room capacity (${targetRoom.capacity}). Please select a larger venue.`
      );
      return;
    }

    const newBookingObj: RoomBooking = {
      id: `book-${Date.now()}`,
      roomId: formData.roomId,
      roomName: targetRoom.name,
      eventTitle: formData.eventTitle,
      agency: formData.agency,
      agencyCode: formData.agencyCode,
      bookedBy: formData.bookedBy,
      contactEmail: formData.contactEmail,
      date: formData.startDate,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      expectedAttendees: Number(formData.expectedAttendees),
      requestedEquipment: formData.requestedEquipment,
      purpose: formData.purpose,
      status: currentUser.role === 'ADMIN' ? 'Approved' : 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const success = onAddBooking(newBookingObj);

    if (success) {
      setLastSubmittedBooking(newBookingObj);
      setBookingSuccess(true);
    } else {
      setBookingError('Schedule Conflict: This room is already reserved for the selected date and time range.');
    }
  };

  // Call Gemini AI Room Allocator Assistant
  const handleAIRoomRecommendation = async () => {
    if (!formData.eventTitle) {
      setBookingError('Please enter an Event Title first so AI can analyze venue requirements.');
      return;
    }

    setAiRecommending(true);
    setBookingError(null);

    try {
      const res = await fetch('/api/gemini/recommend-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.eventTitle,
          participantCount: formData.expectedAttendees,
          requiredEquipment: formData.requestedEquipment,
          format: 'Training Workshop / Conference',
        }),
      });

      const data = await res.json();
      if (data.success && data.recommendation) {
        setAiRecommendation(data.recommendation);
        const matchRoom = rooms.find(
          (r) =>
            r.name.toLowerCase().includes(data.recommendation.roomName?.toLowerCase()) ||
            r.id === data.recommendation.recommendedRoomId
        );
        if (matchRoom) {
          setFormData((prev) => ({ ...prev, roomId: matchRoom.id }));
        }
      }
    } catch (err: any) {
      console.error('AI Room Recommendation failed:', err);
    } finally {
      setAiRecommending(false);
    }
  };

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600" />
            Room Booking & Venue Allocation
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Check live availability, compare hall capacity, and submit booking applications for PDRC halls in Tsirang.
          </p>
        </div>

        <button
          onClick={() => {
            setBookingSuccess(false);
            setLastSubmittedBooking(null);
            onOpenModal();
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-xs flex items-center gap-2 self-start md:self-auto"
        >
          <Building2 className="w-4 h-4" />
          <span>New Room Booking</span>
        </button>
      </div>

      {/* Admin Approval Queue Banner */}
      {bookings.some((b) => b.status === 'Pending') && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-display text-sm">
                RAA
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-display flex items-center gap-2">
                  <span>Pending Room Reservations Review Queue</span>
                  <span className="bg-amber-500 text-slate-950 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {bookings.filter((b) => b.status === 'Pending').length} Pending
                  </span>
                </h3>
                <p className="text-xs text-amber-900 font-medium">
                  Review agency room requests. Administrators can approve or reject bookings instantly.
                </p>
              </div>
            </div>

            {currentUser.role === 'ADMIN' && onApproveAllPendingBookings && (
              <button
                onClick={onApproveAllPendingBookings}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>Approve All Pending ({bookings.filter((b) => b.status === 'Pending').length})</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookings
              .filter((b) => b.status === 'Pending')
              .map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-amber-200 p-4 rounded-xl space-y-2 text-xs shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 font-sans text-sm">{booking.eventTitle}</h4>
                      <div className="text-amber-800 font-mono font-bold">{booking.roomName}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      PENDING
                    </span>
                  </div>

                  <div className="space-y-0.5 text-slate-600 font-mono text-[11px]">
                    <div>Date: <strong>{booking.startDate || booking.date} {booking.endDate && booking.endDate !== (booking.startDate || booking.date) ? `to ${booking.endDate}` : ''}</strong> ({booking.startTime} - {booking.endTime})</div>
                    <div>Agency: <strong>{booking.agency}</strong> ({booking.agencyCode})</div>
                    <div>Applicant: <strong>{booking.bookedBy}</strong> ({booking.expectedAttendees} attendees)</div>
                    {booking.purpose && <div className="text-slate-500 italic mt-1">"{booking.purpose}"</div>}
                  </div>

                  {currentUser.role === 'ADMIN' && onUpdateBookingStatus && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'Rejected')}
                        className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs transition flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'Approved')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Room</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hall name, floor, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-600 font-medium whitespace-nowrap">Min Capacity:</label>
            <input
              type="range"
              min="0"
              max="150"
              step="10"
              value={minCapacity}
              onChange={(e) => setMinCapacity(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <span className="text-xs font-mono font-bold text-amber-700 w-12 text-right">
              {minCapacity}+
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 text-xs text-slate-600 font-medium">
            <span>Date View:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Equipment Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-600 flex items-center gap-1 font-mono font-medium">
            <Filter className="w-3.5 h-3.5 text-amber-600" /> Equipment:
          </span>
          {allEquipment.map((eq) => {
            const isSelected = selectedEquipment.includes(eq);
            return (
              <button
                key={eq}
                onClick={() => toggleEquipmentFilter(eq)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {eq}
              </button>
            );
          })}
          {selectedEquipment.length > 0 && (
            <button
              onClick={() => setSelectedEquipment([])}
              className="text-xs text-slate-500 hover:text-amber-700 underline ml-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Existing Approved Bookings List & .ics Export Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            Approved Room Bookings ({bookings.filter((b) => b.status === 'Approved').length})
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            Download .ics files to import into Google Calendar or Outlook
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900">{booking.eventTitle}</div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {booking.roomName} · {booking.startDate || booking.date}{booking.endDate && booking.endDate !== (booking.startDate || booking.date) ? ` to ${booking.endDate}` : ''} ({booking.startTime} - {booking.endTime})
                </div>
                <div className="text-[10px] text-slate-500">{booking.agency}</div>
              </div>

              <button
                onClick={() => downloadBookingICS(booking)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
                title="Download .ics Calendar File"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .ics</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Timeline Availability Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Visual Time-Slot Availability Schedule ({selectedDate})
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-400" /> Booked
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-mono">
                <th className="py-2.5 px-3 w-48 font-bold">Venue Hall</th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="py-2.5 px-2 text-center w-16">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRooms.map((room) => {
                const roomBookingsToday = bookings.filter(
                  (b) => b.roomId === room.id && b.date === selectedDate && b.status === 'Approved'
                );

                return (
                  <tr key={room.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-sans font-bold text-slate-900">
                      <div>{room.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono font-normal">{room.code}</div>
                    </td>
                    {timeSlots.map((slot) => {
                      const isBooked = roomBookingsToday.some((b) => {
                        return slot >= b.startTime && slot < b.endTime;
                      });

                      return (
                        <td key={slot} className="py-2 px-1 text-center">
                          <div
                            className={`h-7 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${
                              isBooked
                                ? 'bg-amber-100 border-amber-300 text-amber-900'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                            }`}
                            onClick={() => {
                              if (!isBooked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  roomId: room.id,
                                  date: selectedDate,
                                  startTime: slot,
                                }));
                                setBookingSuccess(false);
                                onOpenModal(room);
                              }
                            }}
                            title={isBooked ? 'Reserved Slot' : `Click to book ${room.name} at ${slot}`}
                          >
                            {isBooked ? 'BUSY' : 'FREE'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Showcase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-amber-400 transition-all flex flex-col justify-between group shadow-xs"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/90 text-slate-900 text-[11px] font-mono font-bold px-2.5 py-1 rounded border border-slate-200">
                  {room.code}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 text-slate-900 text-xs font-mono font-bold px-2.5 py-1 rounded border border-slate-200">
                  Nu. {room.hourlyRate.toLocaleString()} / hr
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    {room.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono font-medium">{room.floor}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {room.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-amber-700 font-mono font-bold">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Capacity: {room.capacity} participants</span>
                </div>

                {/* Equipment Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {room.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                Status: <strong className="text-emerald-700 font-bold">{room.status}</strong>
              </span>
              <button
                onClick={() => {
                  setBookingSuccess(false);
                  onOpenModal(room);
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
              >
                Book Hall
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Room Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  Reserve Venue at PDRC Tsirang
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit room booking request for civil service seminars, trainings, or research meetings.
                </p>
              </div>
              <button
                onClick={onCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess && lastSubmittedBooking ? (
              <div className="p-6 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-slate-900 font-display">Booking Application Submitted!</h4>
                <p className="text-xs text-slate-600">
                  Your reservation request has been logged. Admin approval confirmation will be sent to {formData.contactEmail}.
                </p>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => downloadBookingICS(lastSubmittedBooking)}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Calendar Event (.ics)</span>
                  </button>
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-700">Event / Workshop Title *</label>
                      <button
                        type="button"
                        onClick={handleAIRoomRecommendation}
                        disabled={aiRecommending}
                        className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        {aiRecommending ? 'Analyzing...' : 'AI Room Recommender'}
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tsirang District Health & Governance Capacity Building"
                      value={formData.eventTitle}
                      onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  {aiRecommendation && (
                    <div className="sm:col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-amber-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        AI Recommendation: {aiRecommendation.roomName}
                      </div>
                      <p className="text-slate-700">{aiRecommendation.reasoning}</p>
                      <div className="text-[11px] text-amber-800 font-mono font-medium">
                        Suggested Setup: {aiRecommendation.suggestedLayout}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Select Venue Hall *</label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-medium"
                    >
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (Cap: {r.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Organizing Agency *</label>
                    <input
                      type="text"
                      required
                      value={formData.agency}
                      onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Reservation Date: From *</label>
                      <input
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value > formData.endDate ? e.target.value : formData.endDate })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Reservation Date: To *</label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        min={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Start Time *</label>
                      <input
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">End Time *</label>
                      <input
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Expected Attendees *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="250"
                      value={formData.expectedAttendees}
                      onChange={(e) => setFormData({ ...formData, expectedAttendees: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Booked By (Applicant) *</label>
                    <input
                      type="text"
                      required
                      value={formData.bookedBy}
                      onChange={(e) => setFormData({ ...formData, bookedBy: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Purpose & Requirements</label>
                    <textarea
                      rows={2}
                      placeholder="Briefly state training objectives, special seating arrangements, or refreshments required..."
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Equipment Checkbox selection */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <label className="text-xs font-semibold text-slate-700">Requested Equipment & Setup</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allEquipment.map((eq) => (
                      <label key={eq} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.requestedEquipment.includes(eq)}
                          onChange={() => handleEquipmentCheckbox(eq)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span>{eq}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onCloseModal}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs"
                  >
                    Submit Booking
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
