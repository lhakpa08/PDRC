export type UserRole = 'ADMIN' | 'AGENCY_REP' | 'FACILITATOR' | 'PARTICIPANT';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  agency: string;
  agencyCode: string;
  email: string;
  avatar: string;
  cid: string;
}

export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export interface Room {
  id: string;
  name: string;
  code: string;
  capacity: number;
  floor: string;
  status: RoomStatus;
  hourlyRate: number; // in Ngultrum (Nu.)
  equipment: string[];
  isAccessible: boolean; // Fully disabled-friendly / wheelchair accessible
  image: string;
  description: string;
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  type: 'Executive Suite' | 'Single Suite' | 'Shared Twin Room' | 'Accessible Suite';
  capacity: number;
  floor: string;
  nightlyRate: number; // in Nu.
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
  amenities: string[];
  isAccessible: boolean;
}

export interface HostelBooking {
  id: string;
  hostelRoomId: string;
  roomNumber: string;
  guestName: string;
  agency: string;
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  status: 'Confirmed' | 'Pending' | 'Checked-In' | 'Completed';
  contactPhone: string;
}

export type BookingStatus = 'Approved' | 'Pending' | 'Rejected' | 'Cancelled';

export interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  eventTitle: string;
  agency: string;
  agencyCode: string;
  bookedBy: string;
  contactEmail: string;
  date: string; // YYYY-MM-DD (maintained for backwards compatibility)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  expectedAttendees: number;
  requestedEquipment: string[];
  purpose: string;
  status: BookingStatus;
  createdAt: string;
}

export interface TrainingSession {
  id?: string;
  time: string;
  module: string;
  description: string;
  trainer: string;
}

export interface TrainingAgendaDay {
  day: number;
  sessions: TrainingSession[];
}

export interface TrainingEvent {
  id: string;
  title: string;
  category: 'Public Sector Auditing' | 'Leadership & Governance' | 'Digital Skills & AIMS' | 'Gewog Financial Management' | 'Environmental Auditing' | 'Health & Safety';
  agency: string;
  agencyCode: string;
  roomId: string;
  roomName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  facilitator: string;
  totalSeats: number;
  enrolledCount: number;
  status: 'Upcoming' | 'In-Progress' | 'Completed' | 'Postponed';
  description: string;
  learningOutcomes: string[];
  agenda?: TrainingAgendaDay[];
}

export type AttendanceStatus = 'Present' | 'Late' | 'Excused' | 'Absent';

export interface ParticipantRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  participantName: string;
  cid: string;
  agency: string;
  email: string;
  phone: string;
  status: AttendanceStatus;
  checkInTime?: string;
  qrToken: string;
}

export type AlertPriority = 'Urgent' | 'Notice' | 'Info';

export interface PushNotificationAlert {
  id: string;
  title: string;
  message: string;
  priority: AlertPriority;
  targetAgency: string; // 'ALL' or specific agency code
  sender: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  imageUrl?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  category: 'Announcement' | 'Press Release' | 'Infrastructure Update' | 'Training Alert' | 'Cafeteria Notice';
  content: string;
  imageUrl: string;
  author: string;
  date: string; // YYYY-MM-DD
  isPinned: boolean;
  targetAgency: string;
}

export interface CafeteriaFacility {
  id: string;
  facilityName: string;
  totalCapacity: number;
  currentMenu: string;
  operatingHours: string;
  imageUrl: string;
  dietaryServices: string[];
}

export interface OfflineQueueItem {
  id: string;
  type: 'ATTENDANCE_CHECKIN' | 'ROOM_BOOKING_DRAFT' | 'HOSTEL_BOOKING_DRAFT' | 'ALERT_DISPATCH';
  payload: any;
  timestamp: string;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
}

export interface ResearchPublication {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  summary: string;
  downloadUrl: string;
}
