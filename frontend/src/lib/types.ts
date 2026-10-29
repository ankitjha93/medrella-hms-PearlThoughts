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
  reviews?: DoctorReview[];
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  patientName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedVisit?: boolean;
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
  blackoutDates?: string[]; // e.g. ["2026-11-10", "2026-11-11"]
}

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';

export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  diagnosis: string;
  medicines: PrescriptionItem[];
  advice?: string;
  followUpDate?: string;
  prescribedAt: string;
  doctorNotes?: string;
}

export interface Appointment {
  id: string;
  tokenNumber?: number; // OPD Queue Token e.g. 1, 2, 3
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
  prescription?: Prescription;
  rescheduledAt?: string;
  previousDate?: string;
  previousTime?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  available?: boolean;
  appointmentId?: string;
  period?: 'MORNING' | 'AFTERNOON';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'APPOINTMENT' | 'PRESCRIPTION' | 'QUEUE';
}
