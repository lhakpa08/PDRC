import { RoomBooking, TrainingEvent } from '../types';

/**
 * Formats YYYY-MM-DD and HH:mm into iCalendar DTSTART / DTEND string (YYYYMMDDTHHmm00)
 */
function formatICSTimestamp(dateStr: string, timeStr: string): string {
  // dateStr: "2026-11-04", timeStr: "09:00"
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Escapes characters according to iCalendar format specifications (RFC 5545)
 */
function escapeICSField(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates valid iCalendar (.ics) content string for a Room Booking
 */
export function generateBookingICSContent(booking: RoomBooking): string {
  const dtStart = formatICSTimestamp(booking.date, booking.startTime);
  const dtEnd = formatICSTimestamp(booking.date, booking.endTime);
  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${booking.id}@pdrc.tsirang.gov.bt`;

  const summary = escapeICSField(booking.eventTitle);
  const location = escapeICSField(`${booking.roomName}, PDRC Tsirang, Bhutan`);
  const description = escapeICSField(
    `Organizing Agency: ${booking.agency}\nBooked By: ${booking.bookedBy} (${booking.contactEmail})\nAttendees: ${booking.expectedAttendees}\nPurpose: ${booking.purpose || 'Civil Service Training/Meeting'}`
  );

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PDRC Tsirang//Room Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    `STATUS:${booking.status === 'Approved' ? 'CONFIRMED' : 'TENTATIVE'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Generates valid iCalendar (.ics) content string for a Training Workshop Event
 */
export function generateTrainingICSContent(event: TrainingEvent): string {
  const dtStart = formatICSTimestamp(event.startDate, event.startTime);
  const dtEnd = formatICSTimestamp(event.endDate || event.startDate, event.endTime);
  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `${event.id}@pdrc.tsirang.gov.bt`;

  const summary = escapeICSField(event.title);
  const location = escapeICSField(`${event.roomName}, PDRC Tsirang, Bhutan`);
  const description = escapeICSField(
    `Organizing Agency: ${event.agency}\nFacilitator: ${event.facilitator}\nCategory: ${event.category}\nDescription: ${event.description}`
  );

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PDRC Tsirang//Training Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers a browser file download of the generated .ics file
 */
export function downloadBookingICS(booking: RoomBooking): void {
  const content = generateBookingICSContent(booking);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const cleanTitle = booking.eventTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const filename = `PDRC_Booking_${cleanTitle}_${booking.date}.ics`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a browser file download of a Training Workshop .ics file
 */
export function downloadTrainingICS(event: TrainingEvent): void {
  const content = generateTrainingICSContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const cleanTitle = event.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const filename = `PDRC_Training_${cleanTitle}_${event.startDate}.ics`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a master iCalendar file containing all approved bookings
 */
export function downloadAllBookingsICS(bookings: RoomBooking[]): void {
  const approvedBookings = bookings.filter((b) => b.status === 'Approved');
  if (approvedBookings.length === 0) return;

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const eventsList = approvedBookings.map((b) => {
    const dtStart = formatICSTimestamp(b.date, b.startTime);
    const dtEnd = formatICSTimestamp(b.date, b.endTime);
    const uid = `${b.id}@pdrc.tsirang.gov.bt`;
    const summary = escapeICSField(b.eventTitle);
    const location = escapeICSField(`${b.roomName}, PDRC Tsirang, Bhutan`);
    const description = escapeICSField(
      `Agency: ${b.agency}\nBooked By: ${b.bookedBy}\nAttendees: ${b.expectedAttendees}`
    );

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const masterContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PDRC Tsirang//All Master Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...eventsList,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([masterContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `PDRC_Master_Bookings_Calendar.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
