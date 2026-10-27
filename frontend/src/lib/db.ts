import fs from 'fs';
import path from 'path';
import { Doctor, Appointment, DoctorAvailability, TimeSlot, AppointmentStatus } from './types';
import { INITIAL_DOCTORS, INITIAL_APPOINTMENTS, INITIAL_AVAILABILITIES } from './mockData';

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  doctors: Doctor[];
  appointments: Appointment[];
  availabilities: DoctorAvailability[];
}

// In-memory fallback / cache
let cachedDb: DatabaseSchema | null = null;

function loadDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(data);
      return cachedDb!;
    }
  } catch (err) {
    console.warn('Error reading from disk database, using seed:', err);
  }

  // Seed default database
  cachedDb = {
    doctors: [...INITIAL_DOCTORS],
    appointments: [...INITIAL_APPOINTMENTS],
    availabilities: [...INITIAL_AVAILABILITIES],
  };

  saveDatabase(cachedDb);
  return cachedDb;
}

function saveDatabase(db: DatabaseSchema) {
  cachedDb = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist to file system (e.g. read-only serverless environment):', err);
  }
}

function normalizeDoctor(d: Doctor): Doctor {
  return {
    ...d,
    specialty: d.specialty || d.specialization,
    fee: d.fee !== undefined ? d.fee : d.consultationFee,
    experience: d.experience || `${d.experienceYears} years`,
    bio: d.bio || d.about,
    reviewCount: d.reviewCount !== undefined ? d.reviewCount : d.reviewsCount,
  };
}

function normalizeAppointment(a: Appointment): Appointment {
  return {
    ...a,
    timeSlot: a.timeSlot || a.time,
  };
}

// --- DOCTORS ---
export function getDoctors(search?: string, specialty?: string): Doctor[] {
  const db = loadDatabase();
  let list = db.doctors;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialization.toLowerCase().includes(q) ||
      (d.specialty && d.specialty.toLowerCase().includes(q)) ||
      d.hospital.toLowerCase().includes(q)
    );
  }

  if (specialty && specialty !== 'All' && specialty !== 'ALL') {
    list = list.filter(d => 
      d.specialization.toLowerCase() === specialty.toLowerCase() ||
      (d.specialty && d.specialty.toLowerCase() === specialty.toLowerCase())
    );
  }

  return list.map(normalizeDoctor);
}

export function getDoctorById(id: string): Doctor | undefined {
  const db = loadDatabase();
  const found = db.doctors.find(d => d.id === id);
  return found ? normalizeDoctor(found) : undefined;
}

// --- APPOINTMENTS ---
export function getAppointments(filters?: { patientId?: string; doctorId?: string }): Appointment[] {
  const db = loadDatabase();
  let list = db.appointments;

  if (filters?.patientId) {
    list = list.filter(a => a.patientId === filters.patientId);
  }

  if (filters?.doctorId) {
    list = list.filter(a => a.doctorId === filters.doctorId);
  }

  // Sort descending by date and time
  return list
    .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
    .map(normalizeAppointment);
}

export function createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment {
  const db = loadDatabase();

  const newAppointment: Appointment = {
    ...data,
    time: data.time || data.timeSlot || '10:00 AM',
    timeSlot: data.timeSlot || data.time || '10:00 AM',
    id: `apt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  db.appointments.unshift(newAppointment);
  saveDatabase(db);
  return normalizeAppointment(newAppointment);
}

export function updateAppointmentStatus(
  id: string, 
  status: AppointmentStatus, 
  cancellationReason?: string
): Appointment | null {
  const db = loadDatabase();
  const index = db.appointments.findIndex(a => a.id === id);

  if (index === -1) return null;

  db.appointments[index].status = status;
  if (cancellationReason) {
    db.appointments[index].cancellationReason = cancellationReason;
  }

  saveDatabase(db);
  return normalizeAppointment(db.appointments[index]);
}

// --- DYNAMIC SLOTS GENERATOR ---
const DEFAULT_TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

export function getAvailableSlots(doctorId: string, date: string): TimeSlot[] {
  const db = loadDatabase();

  // Find existing bookings on this date for this doctor that are active
  const bookedTimes = new Set(
    db.appointments
      .filter(a => a.doctorId === doctorId && a.date === date && a.status !== 'CANCELLED')
      .map(a => a.time)
  );

  return DEFAULT_TIME_SLOTS.map(time => ({
    time,
    isAvailable: !bookedTimes.has(time),
    available: !bookedTimes.has(time),
  }));
}

// --- AVAILABILITY RULES ---
export function getDoctorAvailability(doctorId: string): DoctorAvailability[] {
  const db = loadDatabase();
  return db.availabilities.filter(av => av.doctorId === doctorId);
}

export function updateDoctorAvailability(doctorId: string, updated: DoctorAvailability[]): DoctorAvailability[] {
  const db = loadDatabase();
  db.availabilities = db.availabilities.filter(av => av.doctorId !== doctorId).concat(updated);
  saveDatabase(db);
  return getDoctorAvailability(doctorId);
}
