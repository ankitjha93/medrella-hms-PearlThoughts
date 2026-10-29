"use client";

import { useState, useEffect } from "react";
import { Appointment, DoctorAvailability, PrescriptionItem } from "@/lib/types";
import { useRole } from "@/components/RoleContext";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  Activity,
  Check,
  RefreshCw,
  Settings,
  ShieldAlert,
  Stethoscope,
  X,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Printer,
  Pill,
  PhoneCall,
  BarChart2,
  TrendingUp,
  CalendarOff,
} from "lucide-react";

interface ClinicalPreset {
  id: string;
  label: string;
  category: string;
  diagnosis: string;
  advice: string;
  followUpDays: number;
  medicines: PrescriptionItem[];
}

const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: "pre-hypertension",
    label: "Stage 1 Pre-hypertension",
    category: "Cardiology",
    diagnosis: "Stage 1 Pre-hypertension (Resting BP 138/88 mmHg)",
    advice: "Initiate low-sodium DASH diet. 30 mins moderate aerobic walking daily. Record morning and evening home BP.",
    followUpDays: 30,
    medicines: [
      { medicineName: "Metoprolol Succinate 25mg", dosage: "1 Tablet", frequency: "Once daily in the morning", duration: "30 days" },
      { medicineName: "Amlodipine Besylate 5mg", dosage: "1 Tablet", frequency: "Once daily at night", duration: "30 days" },
    ],
  },
  {
    id: "sinus-tachycardia",
    label: "Sinus Tachycardia / Palpitations",
    category: "Cardiology",
    diagnosis: "Benign Sinus Tachycardia (Secondary to stress/fatigue)",
    advice: "Strictly avoid high-caffeine beverages & energy drinks. Ensure 8 hours rest. Hydrate with 2.5L water daily.",
    followUpDays: 14,
    medicines: [
      { medicineName: "Propranolol Hydrochloride 10mg", dosage: "1 Tablet", frequency: "SOS as needed for palpitations", duration: "14 days" },
      { medicineName: "Magnesium Glycinate 200mg", dosage: "1 Capsule", frequency: "Once daily before bedtime", duration: "30 days" },
    ],
  },
  {
    id: "bronchitis",
    label: "Acute Tracheobronchitis",
    category: "Pulmonology",
    diagnosis: "Acute Viral Tracheobronchitis with productive cough",
    advice: "Steam inhalation twice daily. Warm fluids and honey. Avoid cold air exposure. Complete antibiotic course.",
    followUpDays: 7,
    medicines: [
      { medicineName: "Azithromycin 500mg", dosage: "1 Tablet", frequency: "Once daily 1 hour before meal", duration: "5 days" },
      { medicineName: "Levocetirizine 5mg", dosage: "1 Tablet", frequency: "Once daily at bedtime", duration: "7 days" },
      { medicineName: "Dextromethorphan Cough Syrup", dosage: "10 ml", frequency: "Thrice daily after meals", duration: "5 days" },
    ],
  },
  {
    id: "contact-dermatitis",
    label: "Allergic Contact Dermatitis",
    category: "Dermatology",
    diagnosis: "Erythematous Allergic Contact Dermatitis",
    advice: "Discontinue any new soaps or topical detergents. Apply moisturizing barrier cream within 3 mins post-bath.",
    followUpDays: 10,
    medicines: [
      { medicineName: "Hydrocortisone 1% Topical Cream", dosage: "Thin layer", frequency: "Twice daily after cleaning", duration: "7 days" },
      { medicineName: "Bilastine 20mg", dosage: "1 Tablet", frequency: "Once daily in the morning", duration: "10 days" },
    ],
  },
  {
    id: "tension-migraine",
    label: "Episodic Tension Migraine",
    category: "Neurology",
    diagnosis: "Episodic Tension Headache with Migrainous Features",
    advice: "Rest in a quiet, dark room during onset. Keep a headache trigger log. Maintain ergonomic screen height.",
    followUpDays: 21,
    medicines: [
      { medicineName: "Naproxen Sodium 500mg", dosage: "1 Tablet", frequency: "SOS with meal at pain onset", duration: "5 days" },
      { medicineName: "Pantoprazole 40mg", dosage: "1 Tablet", frequency: "Once daily 30 min before breakfast", duration: "7 days" },
    ],
  },
];

export default function DoctorDashboardPage() {
  const { currentUser, setRole } = useRole();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [newBlackoutDate, setNewBlackoutDate] = useState<string>("");

  // Consultation Desk & Prescription Modal State
  const [consultationAppt, setConsultationAppt] = useState<Appointment | null>(null);
  const [viewPrescriptionAppt, setViewPrescriptionAppt] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [advice, setAdvice] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [doctorNotes, setDoctorNotes] = useState<string>("");
  const [vitals, setVitals] = useState({
    bloodPressure: "124/82 mmHg",
    heartRate: "72 bpm",
    temperature: "98.6 °F",
    oxygenSaturation: "99%",
    weightKg: "70 kg",
  });
  const [labOrders, setLabOrders] = useState<string[]>([]);
  const [medicines, setMedicines] = useState<PrescriptionItem[]>([
    { medicineName: "", dosage: "", frequency: "Twice daily after meals", duration: "5 days" },
  ]);

  // If not logged in as doctor, default doctorId to 'doc_1'
  const activeDoctorId = currentUser.doctorId || "doc_1";

  useEffect(() => {
    fetchDoctorData();
  }, [currentUser]);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [apptRes, availRes] = await Promise.all([
        fetch(`/api/appointments?doctorId=${activeDoctorId}`),
        fetch(`/api/availability?doctorId=${activeDoctorId}`),
      ]);

      const apptData = await apptRes.json();
      const availData = await availRes.json();

      setAppointments(apptData.appointments || []);
      setAvailability(availData.availability || null);
    } catch (err) {
      console.error("Failed to load doctor dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    setActionLoading(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      await fetchDoctorData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating appointment status");
    } finally {
      setActionLoading(null);
    }
  };

  const openConsultationDesk = (appt: Appointment) => {
    setConsultationAppt(appt);
    setDiagnosis(appt.symptoms ? `Clinical evaluation for: ${appt.symptoms}` : "");
    setAdvice("Maintain adequate hydration, rest, and complete full prescribed course of medication.");
    setFollowUpDate("2026-11-15");
    setDoctorNotes("Patient examined in OPD Room 402. Vitals stable.");
    setMedicines([
      { medicineName: "Amoxicillin-Clavulanate 625mg", dosage: "1 Tablet", frequency: "Twice daily after meals", duration: "5 days" },
      { medicineName: "Paracetamol 650mg", dosage: "1 Tablet", frequency: "SOS for pain or temperature > 99F", duration: "3 days" },
    ]);
  };

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { medicineName: "", dosage: "", frequency: "Once daily", duration: "7 days" }]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof PrescriptionItem, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleCompleteWithPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultationAppt) return;

    setActionLoading(consultationAppt.id);
    try {
      const validMedicines = medicines.filter((m) => m.medicineName.trim().length > 0);
      const res = await fetch(`/api/appointments/${consultationAppt.id}/encounter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vitals,
          diagnosis: diagnosis || "Consultation Completed",
          medicines: validMedicines,
          advice,
          followUpDate,
          doctorNotes,
          labOrders,
          chiefComplaint: consultationAppt.symptoms,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to finalize consultation");
      }

      setConsultationAppt(null);
      await fetchDoctorData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving prescription");
    } finally {
      setActionLoading(null);
    }
  };

  const applyPreset = (preset: ClinicalPreset) => {
    setDiagnosis(preset.diagnosis);
    setAdvice(preset.advice);
    setMedicines(preset.medicines);
    const followUp = new Date();
    followUp.setDate(followUp.getDate() + preset.followUpDays);
    setFollowUpDate(followUp.toISOString().split("T")[0]);
    setDoctorNotes(`Consultation completed using clinical guidance protocol for ${preset.label}.`);
  };

  const handleAddBlackoutDate = (date: string) => {
    if (!availability || !date) return;
    const current = availability.blackoutDates || [];
    if (!current.includes(date)) {
      setAvailability({
        ...availability,
        blackoutDates: [...current, date],
      });
    }
    setNewBlackoutDate("");
  };

  const handleRemoveBlackoutDate = (date: string) => {
    if (!availability) return;
    const current = availability.blackoutDates || [];
    setAvailability({
      ...availability,
      blackoutDates: current.filter((d) => d !== date),
    });
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availability) return;

    setSavingSettings(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: activeDoctorId,
          daysOfWeek: availability.daysOfWeek || [availability.dayOfWeek || "Monday"],
          startTime: availability.startTime,
          endTime: availability.endTime,
          slotDurationMinutes: availability.slotDurationMinutes,
          blackoutDates: availability.blackoutDates || [],
        }),
      });

      if (!res.ok) throw new Error("Failed to update availability");
      setShowSettingsModal(false);
      await fetchDoctorData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving schedule");
    } finally {
      setSavingSettings(false);
    }
  };

  // KPI Calculations
  const totalBookings = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const cancelledCount = appointments.filter((a) => a.status === "CANCELLED").length;
  const docFee = 75;
  const totalRevenue = (confirmedCount + completedCount) * docFee;

  const filteredAppointments = appointments.filter((appt) => {
    if (filter === "PENDING" || filter === "SCHEDULED") {
      return appt.status === "SCHEDULED" || (appt.status as string) === "PENDING";
    }
    if (filter === "CONFIRMED") return appt.status === "CONFIRMED";
    if (filter === "COMPLETED") return appt.status === "COMPLETED";
    if (filter === "CANCELLED") return appt.status === "CANCELLED";
    return true;
  });

  // Current active patient in queue (Next to be seen)
  const activeQueuePatient = appointments.find((a) => a.status === "CONFIRMED" || a.status === "SCHEDULED");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Switch role alert if current user is patient */}
      {currentUser.role !== "DOCTOR" && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You are currently browsing as <strong>{currentUser.name} (Patient)</strong>. You are previewing Dr. Jane Smith's queue.
            </span>
          </div>
          <button
            onClick={() => setRole("user_doc_1")}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0 transition"
          >
            Switch to Dr. Jane Smith
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Medrella Outpatient Clinic Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {currentUser.role === "DOCTOR" ? currentUser.name : "Dr. Jane Smith"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cardiology Department • City General Hospital • OPD Station 402 Active
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDoctorData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition shadow-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Shift & Availability</span>
          </button>
        </div>
      </div>

      {/* Live OPD Queue Banner: Now Serving */}
      {activeQueuePatient ? (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="animate-pulse flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-200">
                LIVE OPD QUEUE • NOW SERVING
              </span>
            </div>
            <div className="text-2xl font-black flex items-center space-x-3">
              <span className="bg-white/20 px-3 py-0.5 rounded-lg text-lg font-mono">
                TOKEN #OPD-{String(activeQueuePatient.tokenNumber || 1).padStart(2, "0")}
              </span>
              <span>{activeQueuePatient.patientName}</span>
            </div>
            <p className="text-xs text-emerald-100 flex items-center space-x-4">
              <span>Time: {activeQueuePatient.timeSlot || activeQueuePatient.time}</span>
              <span>•</span>
              <span>Reason: {activeQueuePatient.symptoms || "Regular Follow-up"}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                alert(`Calling Token #OPD-${String(activeQueuePatient.tokenNumber || 1).padStart(2, "0")}: ${activeQueuePatient.patientName} to OPD Consultation Room 402!`);
                openConsultationDesk(activeQueuePatient);
              }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-sm transition"
              title="Call next patient in queue"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>Call Next Patient</span>
            </button>
            <button
              onClick={() => openConsultationDesk(activeQueuePatient)}
              className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs rounded-xl flex items-center space-x-2 shadow-sm transition"
            >
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span>Consultation Desk & Rx</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>OPD queue is currently clear. All registered patients for today have completed consultations!</span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalBookings}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Across all clinical slots</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Queue / Confirmed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{confirmedCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Awaiting consultation today</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <Check className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">{completedCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Discharged consultations</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated Revenue</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-teal-700 dark:text-teal-400">${totalRevenue}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Based on ${docFee} / consult</div>
        </div>
      </div>

      {/* Weekly Clinical Volume Analytics Mini-Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Weekly Consultation Volume & Department Throughput
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live capacity and queue distribution across current clinical rota
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Completion Rate: {totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0}%</span>
            </span>
            <span className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Avg Consult: 18m</span>
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2">
          {[
            { day: "Mon", count: 8, pct: "80%" },
            { day: "Tue", count: 11, pct: "100%" },
            { day: "Wed", count: 9, pct: "85%" },
            { day: "Thu", count: 7, pct: "70%" },
            { day: "Fri", count: 10, pct: "95%" },
            { day: "Sat", count: 4, pct: "40%" },
            { day: "Sun", count: 0, pct: "0%" },
          ].map((bar) => (
            <div key={bar.day} className="flex flex-col items-center space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-24 p-1 flex items-end justify-center">
                <div
                  style={{ height: bar.pct }}
                  className={`w-full rounded-lg transition-all duration-500 ${
                    bar.count > 0
                      ? bar.day === "Wed"
                        ? "bg-gradient-to-t from-emerald-600 to-teal-400"
                        : "bg-emerald-500/80 hover:bg-emerald-600"
                      : "bg-slate-200 dark:bg-slate-700/40"
                  }`}
                  title={`${bar.day}: ${bar.count} Visits`}
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{bar.day}</div>
                <div className="text-[10px] text-slate-400 font-mono">{bar.count} pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { key: "ALL", label: `All (${totalBookings})` },
          { key: "CONFIRMED", label: `Confirmed (${confirmedCount})` },
          { key: "PENDING", label: `Pending/Scheduled (${appointments.filter(a => a.status === 'SCHEDULED' || (a.status as string) === 'PENDING').length})` },
          { key: "COMPLETED", label: `Completed (${completedCount})` },
          { key: "CANCELLED", label: `Cancelled (${cancelledCount})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === t.key
                ? "bg-slate-900 dark:bg-emerald-600 text-white"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Appointment Queue Table / Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-white">No appointments in this view</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Patients will appear here automatically upon booking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-white text-base">{appt.patientName}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      appt.status === "CONFIRMED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                        : appt.status === "COMPLETED"
                        ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                        : appt.status === "CANCELLED"
                        ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                        : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {appt.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Token #OPD-{String(appt.tokenNumber || 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appt.date}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appt.timeSlot || appt.time}</span>
                  </span>
                  <span>Contact: {appt.patientEmail}</span>
                  <span className="text-slate-400 font-mono text-[11px]">Ref: {appt.id}</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Clinical Reason:</span> {appt.symptoms || "General visit"}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                {(appt.status === "SCHEDULED" || (appt.status as string) === "PENDING") && (
                  <button
                    disabled={actionLoading === appt.id}
                    onClick={() => handleStatusChange(appt.id, "CONFIRMED")}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                )}

                {appt.status === "CONFIRMED" && (
                  <button
                    disabled={actionLoading === appt.id}
                    onClick={() => openConsultationDesk(appt)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Consultation Desk & Rx</span>
                  </button>
                )}

                {appt.status === "COMPLETED" && appt.prescription && (
                  <button
                    onClick={() => setViewPrescriptionAppt(appt)}
                    className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Prescription</span>
                  </button>
                )}

                {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                  <button
                    disabled={actionLoading === appt.id}
                    onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Consultation Desk & Prescription Modal */}
      {consultationAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Doctor Consultation Desk & Prescription Builder</h3>
                  <p className="text-[11px] text-slate-400">
                    Patient: {consultationAppt.patientName} • Token #OPD-{String(consultationAppt.tokenNumber || 1).padStart(2, "0")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConsultationAppt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Prescription Form */}
            <form onSubmit={handleCompleteWithPrescription} className="p-6 overflow-y-auto space-y-5">
              {/* Patient Complaint Reminder */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Patient Symptoms / Chief Complaint:</span>{" "}
                <span className="text-slate-600 dark:text-slate-400">{consultationAppt.symptoms || "Regular consultation"}</span>
              </div>

              {/* 1-Click Clinical Guidance Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Click Clinical Guidance Presets (Auto-fills Rx & Advice)</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CLINICAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Objective: Patient Clinical Vitals */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Objective Clinical Vitals</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Triage Bedside Entry</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Blood Pressure</label>
                    <input
                      type="text"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                      placeholder="120/80"
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Heart Rate</label>
                    <input
                      type="text"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                      placeholder="72 bpm"
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Temperature</label>
                    <input
                      type="text"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                      placeholder="98.6 °F"
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">SpO2 Oxygen</label>
                    <input
                      type="text"
                      value={vitals.oxygenSaturation}
                      onChange={(e) => setVitals({ ...vitals, oxygenSaturation: e.target.value })}
                      placeholder="99%"
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Patient Weight</label>
                    <input
                      type="text"
                      value={vitals.weightKg}
                      onChange={(e) => setVitals({ ...vitals, weightKg: e.target.value })}
                      placeholder="70 kg"
                      className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Stage 1 Essential Hypertension / Acute Bronchitis"
                />
              </div>

              {/* Diagnostic Lab Orders */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Diagnostic Lab Investigations (Order to Pathology)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Complete Blood Count (CBC)",
                    "Comprehensive Lipid Panel",
                    "12-Lead Electrocardiogram (ECG)",
                    "Liver Function Test (LFT)",
                    "Fasting Blood Glucose",
                    "Chest X-Ray (PA View)",
                  ].map((test) => {
                    const isChecked = labOrders.includes(test);
                    return (
                      <button
                        key={test}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setLabOrders(labOrders.filter((t) => t !== test));
                          } else {
                            setLabOrders([...labOrders, test]);
                          }
                        }}
                        className={`p-2 rounded-xl text-left text-xs font-medium border transition flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700"
                            : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{test}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Medicines / Rx Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <Pill className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prescribed Medications (Rx)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Medication #{idx + 1}</span>
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove Medicine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Medicine name (e.g. Paracetamol 650mg)"
                          value={med.medicineName}
                          onChange={(e) => handleMedicineChange(idx, "medicineName", e.target.value)}
                          className="p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 1 Tablet)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                          className="p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Frequency (e.g. Twice daily after food)"
                          value={med.frequency}
                          onChange={(e) => handleMedicineChange(idx, "frequency", e.target.value)}
                          className="p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 5 days)"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                          className="p-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice & Dietary Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Doctor's Advice & Patient Instructions
                </label>
                <textarea
                  rows={2}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  placeholder="Dietary changes, rest recommendations, water intake..."
                />
              </div>

              {/* Follow-up Date & Clinical Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Follow-Up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Internal Clinical Notes (EHR)
                  </label>
                  <input
                    type="text"
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                    placeholder="Vitals stable, normal heart sounds..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange(consultationAppt.id, "COMPLETED");
                    setConsultationAppt(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Complete Without Rx
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setConsultationAppt(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === consultationAppt.id}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoading === consultationAppt.id ? "Saving..." : "Save Rx & Complete Visit"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor View Prescription Slip Modal */}
      {viewPrescriptionAppt && viewPrescriptionAppt.prescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Prescription Record</h3>
              </div>
              <button
                onClick={() => setViewPrescriptionAppt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3 text-slate-700 dark:text-slate-300">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">Patient:</span>{" "}
                <span className="font-semibold">{viewPrescriptionAppt.patientName}</span>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Diagnosis:</span>{" "}
                {viewPrescriptionAppt.prescription.diagnosis}
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px]">Prescribed Medications:</span>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  {viewPrescriptionAppt.prescription.medicines.map((m, i) => (
                    <li key={i} className="text-slate-800 dark:text-slate-200 font-medium">
                      {m.medicineName} — {m.dosage} ({m.frequency}, {m.duration})
                    </li>
                  ))}
                </ul>
              </div>

              {viewPrescriptionAppt.prescription.advice && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Advice:</span>{" "}
                  {viewPrescriptionAppt.prescription.advice}
                </div>
              )}

              {viewPrescriptionAppt.prescription.followUpDate && (
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Follow-Up:</span>{" "}
                  {viewPrescriptionAppt.prescription.followUpDate}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setViewPrescriptionAppt(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift & Availability Settings Modal */}
      {showSettingsModal && availability && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-base">Doctor Shift & Slot Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAvailability} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
              {/* Practicing Days of the Week */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Practicing Days of the Week
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                    const days = availability.daysOfWeek || [availability.dayOfWeek || "Monday"];
                    const isChecked = days.includes(day);
                    return (
                      <label
                        key={day}
                        className={`flex items-center space-x-2 p-2 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                          isChecked
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : "bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAvailability({
                                ...availability,
                                daysOfWeek: [...days, day],
                              });
                            } else {
                              setAvailability({
                                ...availability,
                                daysOfWeek: days.filter((d) => d !== day),
                              });
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{day}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Shift Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Start Shift Hour
                  </label>
                  <input
                    type="text"
                    value={availability.startTime}
                    onChange={(e) =>
                      setAvailability({ ...availability, startTime: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="09:00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    End Shift Hour
                  </label>
                  <input
                    type="text"
                    value={availability.endTime}
                    onChange={(e) =>
                      setAvailability({ ...availability, endTime: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="17:00"
                    required
                  />
                </div>
              </div>

              {/* Consultation Slot Duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Consultation Slot Duration (Minutes)
                </label>
                <select
                  value={availability.slotDurationMinutes}
                  onChange={(e) =>
                    setAvailability({
                      ...availability,
                      slotDurationMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              {/* Leave & Vacation Blackout Dates Manager */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <CalendarOff className="w-4 h-4 text-rose-500" />
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Doctor Leave & Vacation Blackout Dates
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Slots on these dates will be blocked from patient bookings without changing your standard weekly schedule.
                </p>

                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={newBlackoutDate}
                    onChange={(e) => setNewBlackoutDate(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={!newBlackoutDate}
                    onClick={() => handleAddBlackoutDate(newBlackoutDate)}
                    className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold disabled:opacity-50 transition"
                  >
                    + Block Date
                  </button>
                </div>

                {/* Active Blackout Dates List */}
                {availability.blackoutDates && availability.blackoutDates.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {availability.blackoutDates.map((date) => (
                      <span
                        key={date}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      >
                        <span>{date}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlackoutDate(date)}
                          className="hover:text-rose-900 dark:hover:text-white"
                          title="Unblock date"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No leave dates currently scheduled.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {savingSettings ? "Updating..." : "Save Shift & Leave Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
