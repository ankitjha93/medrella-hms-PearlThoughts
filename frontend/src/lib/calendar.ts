import { Appointment } from './types';

function parseTimeToHoursAndMinutes(timeStr: string): { hours: number; minutes: number } {
  // Format e.g. "10:00 AM" or "02:30 PM"
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return { hours: 10, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

function formatICSDate(dateStr: string, hours: number, minutes: number): string {
  // dateStr is "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-').map(Number);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
}

export function generateICS(appointment: Appointment): string {
  const { hours, minutes } = parseTimeToHoursAndMinutes(appointment.time || appointment.timeSlot || '10:00 AM');
  const startStamp = formatICSDate(appointment.date, hours, minutes);

  // Default duration 30 minutes
  const endMinutesTotal = minutes + (appointment.durationMinutes || 30);
  const endHours = hours + Math.floor(endMinutesTotal / 60);
  const endMins = endMinutesTotal % 60;
  const endStamp = formatICSDate(appointment.date, endHours, endMins);

  const tokenInfo = appointment.tokenNumber ? `\\nQueue Token: #OPD-${String(appointment.tokenNumber).padStart(2, '0')}` : '';
  const symptomsInfo = appointment.symptoms ? `\\nReason for Visit: ${appointment.symptoms.replace(/\n/g, ' ')}` : '';

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Medrella Healthcare System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:medrella-${appointment.id}@medrella.com`,
    `DTSTAMP:${formatICSDate('2026-10-28', 12, 0)}Z`,
    `DTSTART:${startStamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:Medical Consultation with ${appointment.doctorName}`,
    `DESCRIPTION:Consultation with ${appointment.doctorName} (${appointment.doctorSpecialty})${tokenInfo}${symptomsInfo}\\nPlease arrive 10 minutes before your scheduled appointment time.`,
    `LOCATION:Medrella Medical Pavilion, Room 402, City General Hospital`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Upcoming consultation at Medrella',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return icsLines.join('\r\n');
}

export function downloadCalendarEvent(appointment: Appointment) {
  const icsContent = generateICS(appointment);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `medrella-appointment-${appointment.date}-${appointment.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

