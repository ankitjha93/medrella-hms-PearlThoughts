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
} from "lucide-react";

export default function DoctorDashboardPage() {
  const { currentUser, setRole } = useRole();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Consultation Desk & Prescription Modal State
  const [consultationAppt, setConsultationAppt] = useState<Appointment | null>(null);
  const [viewPrescriptionAppt, setViewPrescriptionAppt] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [advice, setAdvice] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [doctorNotes, setDoctorNotes] = useState<string>("");
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
      const res = await fetch(`/api/appointments/${consultationAppt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          prescription: {
            diagnosis: diagnosis || "Consultation Completed",
            medicines: validMedicines,
            advice,
            followUpDate,
            doctorNotes,
            prescribedAt: new Date().toISOString(),
          },
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

          <div className="flex items-center space-x-3 shrink-0">
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

            <form onSubmit={handleSaveAvailability} className="p-6 space-y-4">
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  {savingSettings ? "Updating..." : "Save Shift Hours"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
