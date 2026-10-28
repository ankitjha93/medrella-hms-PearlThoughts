"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Appointment } from "@/lib/types";
import { useRole } from "@/components/RoleContext";
import { downloadCalendarEvent } from "@/lib/calendar";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  PlusCircle,
  Stethoscope,
  Info,
  CalendarPlus,
  FileText,
  Printer,
  X,
  Pill,
  Activity,
  HeartPulse,
  BadgeAlert,
  ShieldCheck,
} from "lucide-react";

export default function PatientAppointmentsPage() {
  const { currentUser, setRole } = useRole();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [prescriptionAppt, setPrescriptionAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [currentUser]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const pId = currentUser.patientId || "pat-01";
      const res = await fetch(`/api/appointments?patientId=${pId}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Failed to load patient appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to cancel appointment");
      }

      await fetchAppointments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error cancelling appointment");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    if (filter === "UPCOMING") return appt.status === "CONFIRMED" || appt.status === "SCHEDULED" || (appt.status as string) === "PENDING";
    if (filter === "COMPLETED") return appt.status === "COMPLETED";
    if (filter === "CANCELLED") return appt.status === "CANCELLED";
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Booking CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Patient Portal & Appointments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active Patient: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</span> ({currentUser.email})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/doctors"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>
      </div>

      {/* Demo Tip Banner */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-start space-x-3 text-xs text-emerald-900 dark:text-emerald-200">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong>Demo Workflow Tip:</strong> When you book or cancel an appointment here, switch your role to{" "}
          <button
            onClick={() => setRole("doc-01")}
            className="font-bold underline text-emerald-800 dark:text-emerald-300 hover:text-emerald-950"
          >
            Dr. Jane Smith
          </button>{" "}
          using the top-right persona switcher to see the doctor OPD queue, consultation desk, and prescription workflow react immediately!
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { key: "ALL", label: "All Bookings" },
          { key: "UPCOMING", label: "Upcoming / Confirmed" },
          { key: "COMPLETED", label: "Completed" },
          { key: "CANCELLED", label: "Cancelled" },
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

      {/* Appointments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">No appointments found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You don't have any appointments matching this category. Ready to see a doctor?
          </p>
          <Link
            href="/doctors"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule First Visit</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {appt.doctorName || appt.doctor?.name || "Consulting Specialist"}
                    </h3>
                    {getStatusBadge(appt.status)}
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Token #OPD-{String(appt.tokenNumber || 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {appt.doctorSpecialty || appt.doctor?.specialty || appt.doctor?.specialization || "Outpatient Clinical Consultation"}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.date}</span>
                    </span>
                    <span className="flex items-center space-x-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{appt.timeSlot || appt.time}</span>
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">Ref: {appt.id}</span>
                  </div>

                  {appt.symptoms && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Reason / Symptoms:</span> {appt.symptoms}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                {/* Add to Calendar (.ics) for active visits */}
                {appt.status !== "CANCELLED" && (
                  <button
                    onClick={() => downloadCalendarEvent(appt)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 transition"
                    title="Export .ics Calendar Event"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Calendar (.ics)</span>
                  </button>
                )}

                {/* View Prescription if completed */}
                {appt.status === "COMPLETED" && appt.prescription && (
                  <button
                    onClick={() => setPrescriptionAppt(appt)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Prescription Slip</span>
                  </button>
                )}

                {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                  <button
                    disabled={actionLoading === appt.id}
                    onClick={() => handleCancel(appt.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 transition"
                  >
                    {actionLoading === appt.id ? "Cancelling..." : "Cancel Visit"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hospital Medical Slip & Prescription Modal */}
      {prescriptionAppt && prescriptionAppt.prescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm tracking-wide">Official Medical Consultation Slip</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 text-slate-200 border border-slate-700 transition"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setPrescriptionAppt(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
              {/* Hospital Letterhead */}
              <div className="border-b-2 border-emerald-600 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                      MED<span className="text-emerald-600">RELLA</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                      Outpatient Clinic
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Metropolitan Hospital Center • 402 Health Avenue • Tel: (555) 019-8372
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    TOKEN #OPD-{String(prescriptionAppt.tokenNumber || 1).padStart(2, "0")}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Date: {prescriptionAppt.date}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Ref: {prescriptionAppt.id}
                  </div>
                </div>
              </div>

              {/* Patient & Doctor Demographics */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Patient Details</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{prescriptionAppt.patientName}</div>
                  <div className="text-slate-500 dark:text-slate-400">Contact: {prescriptionAppt.patientPhone}</div>
                  <div className="text-slate-500 dark:text-slate-400">Email: {prescriptionAppt.patientEmail}</div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Consulting Physician</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{prescriptionAppt.doctorName}</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold">{prescriptionAppt.doctorSpecialty}</div>
                  <div className="text-slate-500 dark:text-slate-400">Cardiology & Internal Medicine Desk</div>
                </div>
              </div>

              {/* Clinical Diagnosis */}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clinical Diagnosis / Assessment</span>
                </span>
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl font-semibold text-slate-900 dark:text-white text-sm">
                  {prescriptionAppt.prescription.diagnosis}
                </div>
              </div>

              {/* Prescription / Rx Section */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Pill className="w-3.5 h-3.5 text-blue-600" />
                  <span>Rx — Prescribed Medications</span>
                </span>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Medicine</th>
                        <th className="py-2.5 px-3">Dosage</th>
                        <th className="py-2.5 px-3">Frequency</th>
                        <th className="py-2.5 px-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {prescriptionAppt.prescription.medicines.map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{med.medicineName}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{med.dosage}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{med.frequency}</td>
                          <td className="py-2.5 px-3 font-medium text-emerald-700 dark:text-emerald-400">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Advice & Follow-Up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prescriptionAppt.prescription.advice && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">Doctor's Advice & Guidelines</span>
                    <p className="text-slate-600 dark:text-slate-400">{prescriptionAppt.prescription.advice}</p>
                  </div>
                )}
                {prescriptionAppt.prescription.followUpDate && (
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900 text-xs space-y-1">
                    <span className="font-bold text-blue-900 dark:text-blue-300 uppercase text-[10px]">Next Follow-up Consultation</span>
                    <div className="font-semibold text-blue-800 dark:text-blue-200 text-sm">{prescriptionAppt.prescription.followUpDate}</div>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400">Book through patient portal 3 days in advance.</p>
                  </div>
                )}
              </div>

              {/* Digital Signature Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Electronic Health Record (EHR)</span>
                </div>
                <div className="text-right">
                  <div className="font-serif italic font-bold text-slate-900 dark:text-white text-sm">
                    {prescriptionAppt.doctorName}
                  </div>
                  <div className="text-[10px] text-slate-400">Lic. #MD-2039-MEDRELLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
