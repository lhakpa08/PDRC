/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserProfile, 
  Room, 
  HostelRoom,
  HostelBooking,
  RoomBooking, 
  TrainingEvent, 
  ParticipantRecord, 
  PushNotificationAlert, 
  AttendanceStatus,
  NewsItem,
  CafeteriaFacility,
  BookingStatus
} from './types';
import { 
  DEMO_USERS, 
  INITIAL_ROOMS, 
  INITIAL_HOSTEL_ROOMS,
  INITIAL_HOSTEL_BOOKINGS,
  INITIAL_BOOKINGS, 
  INITIAL_TRAINING_EVENTS, 
  INITIAL_PARTICIPANTS, 
  INITIAL_ALERTS,
  INITIAL_NEWS,
  INITIAL_CAFETERIA
} from './data/mockData';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Navbar } from './components/Navbar';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { DashboardView } from './components/DashboardView';
import { RoomBookingView } from './components/RoomBookingView';
import { HostelBookingView } from './components/HostelBookingView';
import { TrainingScheduleView } from './components/TrainingScheduleView';
import { AttendanceTrackingView } from './components/AttendanceTrackingView';
import { ResearchPublicationsView } from './components/ResearchPublicationsView';
import { ReportsView } from './components/ReportsView';
import { AlertNotificationCenter } from './components/AlertNotificationCenter';
import { AdminLoginView } from './components/AdminLoginView';
import { AdminFacilityCustomizer } from './components/AdminFacilityCustomizer';
import { AgencyLoginView } from './components/AgencyLoginView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[1]); // Dechen Pem (Agency Rep)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('agency-login');

  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>(INITIAL_HOSTEL_ROOMS);
  const [hostelBookings, setHostelBookings] = useState<HostelBooking[]>(INITIAL_HOSTEL_BOOKINGS);
  const [bookings, setBookings] = useState<RoomBooking[]>(INITIAL_BOOKINGS);
  const [trainings, setTrainings] = useState<TrainingEvent[]>(INITIAL_TRAINING_EVENTS);
  const [participants, setParticipants] = useState<ParticipantRecord[]>(INITIAL_PARTICIPANTS);
  const [alerts, setAlerts] = useState<PushNotificationAlert[]>(INITIAL_ALERTS);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [cafeteria, setCafeteria] = useState<CafeteriaFacility>(INITIAL_CAFETERIA);

  // Modal controls
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForModal, setSelectedRoomForModal] = useState<Room | null>(null);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);

  // Custom Hooks
  const onlineStatus = useOnlineStatus();

  const handleOpenBookingModal = (room?: Room) => {
    setSelectedRoomForModal(room || null);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedRoomForModal(null);
  };

  // Add new Room Booking
  const handleAddBooking = (newBookingData: Omit<RoomBooking, 'id' | 'createdAt'>): boolean => {
    const hasConflict = bookings.some((b) => {
      if (b.roomId !== newBookingData.roomId || b.status === 'Rejected') {
        return false;
      }
      const bStart = b.startDate || b.date;
      const bEnd = b.endDate || b.date;
      const newStart = newBookingData.startDate || newBookingData.date;
      const newEnd = newBookingData.endDate || newBookingData.date;

      const datesOverlap = newStart <= bEnd && newEnd >= bStart;
      if (!datesOverlap) return false;

      return newBookingData.startTime < b.endTime && newBookingData.endTime > b.startTime;
    });

    if (hasConflict) {
      return false;
    }

    const newBooking: RoomBooking = {
      ...newBookingData,
      id: `book-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setBookings((prev) => [newBooking, ...prev]);

    const newAlert: PushNotificationAlert = {
      id: `alert-${Date.now()}`,
      title: 'New Venue Reservation Request',
      message: `${newBookingData.eventTitle} requested by ${newBookingData.bookedBy} (${newBookingData.agencyCode}) for ${newBookingData.date}.`,
      priority: 'Notice',
      targetAgency: 'PDC-RAA',
      sender: newBookingData.bookedBy,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);

    return true;
  };

  // Add Trainee Hostel Lodging Reservation
  const handleAddHostelBooking = (newHostelBookingData: Omit<HostelBooking, 'id' | 'status'>) => {
    const created: HostelBooking = {
      ...newHostelBookingData,
      id: `hbook-${Date.now()}`,
      status: 'Confirmed',
    };
    setHostelBookings((prev) => [created, ...prev]);

    // Update hostel room status
    setHostelRooms((prev) =>
      prev.map((hr) => (hr.id === newHostelBookingData.hostelRoomId ? { ...hr, status: 'Occupied' } : hr))
    );
  };

  // Approve / Reject / Cancel Room Booking
  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );

    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (targetBooking) {
      const alertNotice: PushNotificationAlert = {
        id: `alert-${Date.now()}`,
        title: `Room Reservation ${newStatus}: ${targetBooking.eventTitle}`,
        message: `Your booking request for ${targetBooking.roomName} on ${targetBooking.date} has been marked as ${newStatus} by PDRC Secretariat.`,
        priority: newStatus === 'Approved' ? 'Notice' : 'Urgent',
        targetAgency: targetBooking.agencyCode,
        sender: `${currentUser.name} (PDRC Admin)`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        read: false,
      };
      setAlerts((prev) => [alertNotice, ...prev]);
    }
  };

  // Batch Approve All Pending Room Bookings
  const handleApproveAllPendingBookings = () => {
    setBookings((prev) =>
      prev.map((b) => (b.status === 'Pending' ? { ...b, status: 'Approved' } : b))
    );

    const alertNotice: PushNotificationAlert = {
      id: `alert-${Date.now()}`,
      title: 'Batch Approval Notice',
      message: 'All pending room reservation requests have been approved by PDRC Secretariat.',
      priority: 'Notice',
      targetAgency: 'ALL',
      sender: `${currentUser.name} (PDRC Admin)`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };
    setAlerts((prev) => [alertNotice, ...prev]);
  };

  // Approve / Update Trainee Hostel Booking Status
  const handleUpdateHostelBookingStatus = (hostelBookingId: string, newStatus: HostelBooking['status']) => {
    setHostelBookings((prev) =>
      prev.map((hb) => (hb.id === hostelBookingId ? { ...hb, status: newStatus } : hb))
    );
  };

  // Batch Approve All Pending Trainee Hostel Bookings
  const handleApproveAllPendingHostelBookings = () => {
    setHostelBookings((prev) =>
      prev.map((hb) => (hb.status === 'Pending' ? { ...hb, status: 'Confirmed' } : hb))
    );
  };

  // Add new Training Program
  const handleAddTraining = (newTrainingData: Omit<TrainingEvent, 'id' | 'enrolledCount' | 'status'>) => {
    const newTraining: TrainingEvent = {
      ...newTrainingData,
      id: `train-${Date.now()}`,
      enrolledCount: 0,
      status: 'Upcoming',
    };
    setTrainings((prev) => [newTraining, ...prev]);
  };

  // Update Participant Attendance Status
  const handleUpdateAttendance = (
    participantId: string, 
    newStatus: AttendanceStatus, 
    checkInTime?: string
  ) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              status: newStatus,
              checkInTime: checkInTime !== undefined ? checkInTime : p.checkInTime,
            }
          : p
      )
    );
  };

  // Add Walk-in Participant
  const handleAddParticipant = (newPart: Omit<ParticipantRecord, 'id' | 'qrToken'>) => {
    const created: ParticipantRecord = {
      ...newPart,
      id: `part-${Date.now()}`,
      qrToken: `QR-PDRC-${newPart.cid}-${newPart.eventId.replace('train-', '')}`,
    };
    setParticipants((prev) => [created, ...prev]);

    setTrainings((prev) =>
      prev.map((t) => (t.id === newPart.eventId ? { ...t, enrolledCount: t.enrolledCount + 1 } : t))
    );
  };

  // Broadcast Alert Notification
  const handleSendAlert = (alertData: Omit<PushNotificationAlert, 'id' | 'timestamp' | 'read'>) => {
    const created: PushNotificationAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };
    setAlerts((prev) => [created, ...prev]);
  };

  const handleMarkAlertAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentTab('agency-login');
  };

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-900">
      {/* Offline Connectivity Status Bar */}
      <OfflineSyncBanner onlineStatus={onlineStatus} />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        unreadAlertCount={unreadAlertCount}
        onOpenAlerts={() => setShowAlertsDrawer(true)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />

      {/* View Router - Gated by Authentication */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {!isAuthenticated ? (
          /* Unauthenticated Users can ONLY see Login Views */
          currentTab === 'admin' ? (
            <AdminLoginView
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onLoginSuccess={handleLoginSuccess}
            />
          ) : (
            <AgencyLoginView
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              onLoginSuccess={handleLoginSuccess}
              onNavigateToAdmin={() => setCurrentTab('admin')}
            />
          )
        ) : (
          /* Authenticated Operational Views */
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                rooms={rooms}
                bookings={bookings}
                trainings={trainings}
                news={news}
                cafeteria={cafeteria}
                onNavigate={setCurrentTab}
                onOpenBookingModal={handleOpenBookingModal}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onApproveAllPendingBookings={handleApproveAllPendingBookings}
              />
            )}

            {currentTab === 'admin-customizer' && (
              <AdminFacilityCustomizer
                currentUser={currentUser}
                rooms={rooms}
                setRooms={setRooms}
                hostelRooms={hostelRooms}
                setHostelRooms={setHostelRooms}
                news={news}
                setNews={setNews}
                cafeteria={cafeteria}
                setCafeteria={setCafeteria}
                alerts={alerts}
                setAlerts={setAlerts}
              />
            )}

            {currentTab === 'rooms' && (
              <RoomBookingView
                rooms={rooms}
                bookings={bookings}
                currentUser={currentUser}
                onAddBooking={handleAddBooking}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onApproveAllPendingBookings={handleApproveAllPendingBookings}
                selectedRoomForModal={selectedRoomForModal}
                isModalOpen={isBookingModalOpen}
                onOpenModal={handleOpenBookingModal}
                onCloseModal={handleCloseBookingModal}
              />
            )}

            {currentTab === 'hostel' && (
              <HostelBookingView
                hostelRooms={hostelRooms}
                hostelBookings={hostelBookings}
                currentUser={currentUser}
                onAddHostelBooking={handleAddHostelBooking}
                onUpdateHostelBookingStatus={handleUpdateHostelBookingStatus}
                onApproveAllPendingHostelBookings={handleApproveAllPendingHostelBookings}
              />
            )}

            {currentTab === 'trainings' && (
              <TrainingScheduleView
                trainings={trainings}
                rooms={rooms}
                currentUser={currentUser}
                onAddTraining={handleAddTraining}
              />
            )}

            {currentTab === 'attendance' && (
              <AttendanceTrackingView
                participants={participants}
                trainings={trainings}
                onlineStatus={onlineStatus}
                onUpdateAttendance={handleUpdateAttendance}
                onAddParticipant={handleAddParticipant}
              />
            )}

            {currentTab === 'publications' && (
              <ResearchPublicationsView />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                rooms={rooms}
                bookings={bookings}
                trainings={trainings}
                participants={participants}
              />
            )}

            {currentTab === 'admin' && (
              <AdminLoginView
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                onLoginSuccess={handleLoginSuccess}
              />
            )}

            {currentTab === 'agency-login' && (
              <AgencyLoginView
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                onLoginSuccess={handleLoginSuccess}
                onNavigateToAdmin={() => setCurrentTab('admin')}
              />
            )}
          </>
        )}
      </main>

      {/* Alert Notification Center Drawer */}
      {showAlertsDrawer && (
        <AlertNotificationCenter
          alerts={alerts}
          currentUser={currentUser}
          onClose={() => setShowAlertsDrawer(false)}
          onSendAlert={handleSendAlert}
          onMarkAsRead={handleMarkAlertAsRead}
        />
      )}

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="font-bold text-slate-900 font-display">
              Professional Development Centre (PDC) · Royal Audit Authority (RAA)
            </div>
            <div className="font-medium text-slate-600">Damphu, Tsirang Dzongkhag, Royal Government of Bhutan</div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-500 font-medium">
            <span>© 2026 PDC Tsirang · RAA Bhutan</span>
            <span>·</span>
            <span>AIMS Integrated Portal</span>
            <span>·</span>
            <span>Public Sector Financial Integrity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
