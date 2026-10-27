export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  doctorId?: string; // if user is a doctor
  patientId?: string; // if user is a patient
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  specialty?: string; // alias
  experienceYears: number;
  experience?: string; // alias e.g. "12 years"
  consultationFee: number;
  fee?: number; // alias
  rating: number;
  reviewsCount: number;
  reviewCount?: number; // alias
  avatar: string;
  about: string;
  bio?: string; // alias
  education: string;
  location: string;
  hospital: string;
  availableDays: string[]; // e.g. ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
}

export interface DoctorAvailability {
  id?: string;
  doctorId: string;
  dayOfWeek?: string;
  daysOfWeek?: string[];
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDurationMinutes: number; // 30
  maxCapacity?: number; // 1
  isActive?: boolean;
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  doctor?: Doctor;
  date: string; // "2026-10-28"
  time: string; // "10:00 AM"
  timeSlot?: string; // alias for time
  durationMinutes: number;
  fee: number;
  status: AppointmentStatus;
  symptoms: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  available?: boolean;
  appointmentId?: string;
}
