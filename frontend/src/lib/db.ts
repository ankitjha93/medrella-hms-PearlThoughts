import fs from 'fs';
import path from 'path';
import { 
  Doctor, 
  Appointment, 
  DoctorAvailability, 
  TimeSlot, 
  AppointmentStatus, 
  Prescription, 
  DoctorReview,
  BillingInvoice,
  InvoiceItem,
  InvoiceStatus,
  Department,
  AuditLog,
  PatientProfile,
  HospitalKPIs,
  SOAPEncounter
} from './types';
import { 
  INITIAL_DOCTORS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_AVAILABILITIES,
  INITIAL_DEPARTMENTS,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_PATIENT_PROFILES
} from './mockData';

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  doctors: Doctor[];
  appointments: Appointment[];
  availabilities: DoctorAvailability[];
  departments: Department[];
  invoices: BillingInvoice[];
  auditLogs: AuditLog[];
  patientProfiles: PatientProfile[];
}

// In-memory fallback / cache
let cachedDb: DatabaseSchema | null = null;

function loadDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      cachedDb = {
        doctors: parsed.doctors || [...INITIAL_DOCTORS],
        appointments: parsed.appointments || [...INITIAL_APPOINTMENTS],
        availabilities: parsed.availabilities || [...INITIAL_AVAILABILITIES],
        departments: parsed.departments || [...INITIAL_DEPARTMENTS],
        invoices: parsed.invoices || [...INITIAL_INVOICES],
        auditLogs: parsed.auditLogs || [...INITIAL_AUDIT_LOGS],
        patientProfiles: parsed.patientProfiles || [...INITIAL_PATIENT_PROFILES],
      };
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
    departments: [...INITIAL_DEPARTMENTS],
    invoices: [...INITIAL_INVOICES],
    auditLogs: [...INITIAL_AUDIT_LOGS],
    patientProfiles: [...INITIAL_PATIENT_PROFILES],
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
    reviews: d.reviews || [],
  };
}

function normalizeAppointment(a: Appointment): Appointment {
  return {
    ...a,
    tokenNumber: a.tokenNumber || 1,
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

export function addDoctorReview(
  doctorId: string,
  review: { patientName?: string; rating: number; comment: string }
): { doctor: Doctor; review: DoctorReview } {
  const db = loadDatabase();
  const doctor = db.doctors.find(d => d.id === doctorId);
  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const newReview: DoctorReview = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    doctorId,
    patientName: review.patientName?.trim() || 'Verified Patient',
    rating: Math.min(5, Math.max(1, review.rating)),
    comment: review.comment,
    date: new Date().toISOString().split('T')[0],
    verifiedVisit: true,
  };

  const currentReviews = doctor.reviews || [];
  currentReviews.unshift(newReview);
  doctor.reviews = currentReviews;

  // Recalculate average rating & reviewsCount
  const totalRating = currentReviews.reduce((acc, r) => acc + r.rating, 0);
  doctor.reviewsCount = currentReviews.length;
  doctor.reviewCount = currentReviews.length;
  doctor.rating = Math.round((totalRating / currentReviews.length) * 10) / 10;

  saveDatabase(db);
  return { doctor: normalizeDoctor(doctor), review: newReview };
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

  const appointmentDate = data.date;
  const doctorAppointmentsOnDate = db.appointments.filter(
    a => a.doctorId === data.doctorId && a.date === appointmentDate && a.status !== 'CANCELLED'
  );
  const nextToken = (doctorAppointmentsOnDate.length || 0) + 1;

  const newAppointment: Appointment = {
    ...data,
    tokenNumber: data.tokenNumber || nextToken,
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
  cancellationReason?: string,
  prescription?: Prescription
): Appointment | null {
  const db = loadDatabase();
  const index = db.appointments.findIndex(a => a.id === id);

  if (index === -1) return null;

  db.appointments[index].status = status;
  if (cancellationReason) {
    db.appointments[index].cancellationReason = cancellationReason;
  }
  if (prescription) {
    db.appointments[index].prescription = prescription;
  }

  saveDatabase(db);
  return normalizeAppointment(db.appointments[index]);
}

export function rescheduleAppointment(
  id: string,
  newDate: string,
  newTime: string,
  reason?: string
): Appointment | null {
  const db = loadDatabase();
  const index = db.appointments.findIndex(a => a.id === id);

  if (index === -1) return null;
  const current = db.appointments[index];

  if (current.status === 'COMPLETED' || current.status === 'CANCELLED') {
    throw new Error(`Cannot reschedule an appointment that is already ${current.status}`);
  }

  // Check if target slot is already occupied on target date
  const isConflict = db.appointments.some(
    a => a.id !== id &&
         a.doctorId === current.doctorId &&
         a.date === newDate &&
         (a.time === newTime || a.timeSlot === newTime) &&
         a.status !== 'CANCELLED'
  );

  if (isConflict) {
    throw new Error('The selected time slot is already reserved. Please choose another slot.');
  }

  // Calculate new token for new date
  const doctorDateAppts = db.appointments.filter(
    a => a.id !== id &&
         a.doctorId === current.doctorId &&
         a.date === newDate &&
         a.status !== 'CANCELLED'
  );
  const nextToken = doctorDateAppts.length + 1;

  db.appointments[index] = {
    ...current,
    previousDate: current.date,
    previousTime: current.time,
    date: newDate,
    time: newTime,
    timeSlot: newTime,
    tokenNumber: nextToken,
    rescheduledAt: new Date().toISOString(),
    symptoms: reason ? `${current.symptoms} (Rescheduled: ${reason})` : current.symptoms,
  };

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

  // Check doctor blackout / leave dates
  const doctorAvail = db.availabilities.find(a => a.doctorId === doctorId);
  const isBlackedOut = doctorAvail?.blackoutDates?.includes(date);

  if (isBlackedOut) {
    return DEFAULT_TIME_SLOTS.map(time => ({
      time,
      isAvailable: false,
      available: false,
      period: time.includes('AM') ? 'MORNING' : 'AFTERNOON',
    }));
  }

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
    period: time.includes('AM') ? 'MORNING' : 'AFTERNOON',
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

// --- CREATE DOCTOR ---
export function createDoctor(doctorData: Omit<Doctor, 'id' | 'rating' | 'reviewsCount' | 'reviews'>): Doctor {
  const db = loadDatabase();
  const newDoctor: Doctor = {
    ...doctorData,
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    rating: 5.0,
    reviewsCount: 0,
    reviewCount: 0,
    reviews: [],
  };

  db.doctors.push(newDoctor);

  // Setup default availability for the new doctor
  const defaultAvailabilities: DoctorAvailability[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => ({
    id: `av_${newDoctor.id}_${idx + 1}`,
    doctorId: newDoctor.id,
    dayOfWeek: day,
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 30,
    maxCapacity: 1,
    isActive: true,
  }));
  db.availabilities.push(...defaultAvailabilities);

  // Add audit log
  addAuditLog({
    action: 'DOCTOR_ONBOARDED',
    actor: { id: 'user_admin_1', name: 'Sarah Jenkins', role: 'ADMIN' },
    resource: `Doctor ${newDoctor.name} (${newDoctor.specialization})`,
    details: `New specialist added with fee $${newDoctor.consultationFee}. Hospital: ${newDoctor.hospital}.`,
    severity: 'INFO',
  });

  saveDatabase(db);
  return normalizeDoctor(newDoctor);
}

// --- DEPARTMENTS ---
export function getDepartments(): Department[] {
  const db = loadDatabase();
  return db.departments || [];
}

// --- BILLING & INVOICES ---
export function getInvoices(filters?: { patientId?: string; status?: string }): BillingInvoice[] {
  const db = loadDatabase();
  let list = db.invoices || [];

  if (filters?.patientId) {
    list = list.filter(inv => inv.patientId === filters.patientId);
  }

  if (filters?.status && filters.status !== 'ALL') {
    list = list.filter(inv => inv.status.toUpperCase() === filters.status?.toUpperCase());
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getInvoiceById(id: string): BillingInvoice | undefined {
  const db = loadDatabase();
  return (db.invoices || []).find(inv => inv.id === id || inv.invoiceNumber === id);
}

export function createInvoice(data: Omit<BillingInvoice, 'id' | 'createdAt' | 'invoiceNumber'>): BillingInvoice {
  const db = loadDatabase();
  const count = (db.invoices?.length || 0) + 1;
  const newInvoice: BillingInvoice = {
    ...data,
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    invoiceNumber: `INV-2026-${1000 + count}`,
    createdAt: new Date().toISOString(),
  };

  db.invoices = db.invoices || [];
  db.invoices.unshift(newInvoice);

  addAuditLog({
    action: 'INVOICE_GENERATED',
    actor: { id: 'system', name: 'Billing Engine', role: 'ADMIN' },
    resource: `Invoice ${newInvoice.invoiceNumber}`,
    details: `Generated for ${newInvoice.patientName} (${newInvoice.patientMRN}) - Total $${newInvoice.total}.`,
    severity: 'INFO',
  });

  saveDatabase(db);
  return newInvoice;
}

export function updateInvoiceStatus(id: string, status: InvoiceStatus, paymentMethod?: string): BillingInvoice | null {
  const db = loadDatabase();
  const invoice = (db.invoices || []).find(inv => inv.id === id || inv.invoiceNumber === id);

  if (!invoice) return null;

  invoice.status = status;
  if (paymentMethod) invoice.paymentMethod = paymentMethod as any;
  if (status === 'PAID') {
    invoice.paidAt = new Date().toISOString();
  }

  addAuditLog({
    action: status === 'PAID' ? 'INVOICE_SETTLED' : 'INVOICE_STATUS_UPDATED',
    actor: { id: 'user_admin_1', name: 'Sarah Jenkins', role: 'ADMIN' },
    resource: `Invoice ${invoice.invoiceNumber}`,
    details: `Status set to ${status}${paymentMethod ? ` via ${paymentMethod}` : ''}.`,
    severity: 'INFO',
  });

  saveDatabase(db);
  return invoice;
}

// --- AUDIT LOGS ---
export function getAuditLogs(limit: number = 50): AuditLog[] {
  const db = loadDatabase();
  const logs = db.auditLogs || [];
  return logs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const db = loadDatabase();
  const newLog: AuditLog = {
    ...entry,
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  db.auditLogs = db.auditLogs || [];
  db.auditLogs.unshift(newLog);

  // Keep max 500 audit logs to prevent runaway file size
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }

  saveDatabase(db);
  return newLog;
}

// --- PATIENT PROFILES ---
export function getPatientProfile(patientId: string): PatientProfile | undefined {
  const db = loadDatabase();
  return (db.patientProfiles || []).find(p => p.id === patientId);
}

// --- HOSPITAL KPIS (EXECUTIVE OVERVIEW) ---
export function getHospitalKPIs(): HospitalKPIs {
  const db = loadDatabase();
  const doctors = db.doctors || [];
  const appointments = db.appointments || [];
  const invoices = db.invoices || [];

  const todayStr = new Date().toISOString().split('T')[0];
  const activeAppointmentsToday = appointments.filter(
    a => a.date === todayStr && a.status !== 'CANCELLED'
  ).length;

  const completedVisits = appointments.filter(a => a.status === 'COMPLETED');

  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingInvoicesCount = invoices.filter(inv => inv.status === 'PENDING').length;

  // Mocked realistic hospital metrics
  const uniquePatients = new Set(appointments.map(a => a.patientId)).size;

  return {
    totalDoctors: doctors.length,
    activeAppointmentsToday,
    totalPatients: Math.max(uniquePatients, db.patientProfiles?.length || 1),
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    pendingInvoicesCount,
    occupancyRate: 84, // 84% OPD capacity utilization
    averageConsultationTimeMinutes: 18,
    completedVisitsCount: completedVisits.length,
  };
}

// --- SOAP CLINICAL ENCOUNTER ---
export function recordSOAPEncounter(
  appointmentId: string, 
  data: {
    vitals?: any;
    diagnosis: string;
    medicines: any[];
    advice?: string;
    followUpDate?: string;
    labOrders?: string[];
    doctorNotes?: string;
    chiefComplaint?: string;
  }
): { appointment: Appointment; invoice?: BillingInvoice } {
  const db = loadDatabase();
  const apptIndex = db.appointments.findIndex(a => a.id === appointmentId);
  if (apptIndex === -1) {
    throw new Error('Appointment not found');
  }

  const appt = db.appointments[apptIndex];

  // Build prescription
  const prescription: Prescription = {
    diagnosis: data.diagnosis,
    medicines: data.medicines || [],
    advice: data.advice,
    followUpDate: data.followUpDate,
    prescribedAt: new Date().toISOString(),
    doctorNotes: data.doctorNotes,
    vitals: data.vitals,
    labOrders: data.labOrders,
  };

  // Build SOAP encounter object
  const encounter: SOAPEncounter = {
    id: `enc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    appointmentId,
    patientId: appt.patientId,
    doctorId: appt.doctorId,
    doctorName: appt.doctorName,
    date: appt.date,
    subjective: {
      chiefComplaint: data.chiefComplaint || appt.symptoms,
      historyOfPresentIllness: appt.symptoms,
    },
    objective: {
      vitals: data.vitals,
    },
    assessment: {
      diagnosis: data.diagnosis,
      clinicalNotes: data.doctorNotes,
    },
    plan: {
      prescription: data.medicines,
      labOrders: data.labOrders,
      lifestyleAdvice: data.advice,
      followUpDate: data.followUpDate,
    },
    createdAt: new Date().toISOString(),
  };

  appt.status = 'COMPLETED';
  appt.prescription = prescription;
  appt.encounter = encounter;

  // Auto-generate invoice if not already generated
  let invoice = db.invoices.find(inv => inv.appointmentId === appointmentId);
  if (!invoice) {
    const consultationFee = appt.fee || 75;
    const labFee = (data.labOrders?.length || 0) * 35;
    const items: InvoiceItem[] = [
      {
        id: `item_${Date.now()}_1`,
        description: `Consultation - ${appt.doctorSpecialty} (${appt.doctorName})`,
        category: 'CONSULTATION',
        quantity: 1,
        unitPrice: consultationFee,
        total: consultationFee,
      },
    ];

    if (labFee > 0) {
      items.push({
        id: `item_${Date.now()}_2`,
        description: `Ordered Diagnostic Labs (${data.labOrders?.join(', ')})`,
        category: 'LAB_TEST',
        quantity: data.labOrders?.length || 1,
        unitPrice: 35,
        total: labFee,
      });
    }

    const subtotal = consultationFee + labFee;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;

    const patientProfile = db.patientProfiles?.find(p => p.id === appt.patientId);

    invoice = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invoiceNumber: `INV-2026-${1000 + (db.invoices.length + 1)}`,
      appointmentId,
      patientId: appt.patientId,
      patientName: appt.patientName,
      patientMRN: patientProfile?.mrn || 'MRN-2026-0941',
      doctorId: appt.doctorId,
      doctorName: appt.doctorName,
      date: appt.date,
      items,
      subtotal,
      discount: 0,
      tax,
      total,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.invoices.unshift(invoice);
  }

  // Audit event
  addAuditLog({
    action: 'CLINICAL_ENCOUNTER_COMPLETED',
    actor: { id: appt.doctorId, name: appt.doctorName, role: 'DOCTOR' },
    resource: `Appointment ${appointmentId} (${appt.patientName})`,
    details: `SOAP Encounter signed off. Diagnosis: ${data.diagnosis}. ${data.medicines.length} medications prescribed.`,
    severity: 'INFO',
  });

  saveDatabase(db);
  return { appointment: normalizeAppointment(appt), invoice };
}
