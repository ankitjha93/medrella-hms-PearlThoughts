"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Appointment } from "@/lib/types";
import { useRole } from "@/components/RoleContext";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  PlusCircle,
  Stethoscope,
  Info,
} from "lucide-react";

export default function PatientAppointmentsPage() {
  const { currentUser, setRole } = useRole();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Scheduled</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Patient Portal Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Patient Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{currentUser.email} • Registered Patient</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAppointments}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
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
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start space-x-3 text-xs text-emerald-900">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong>Demo Workflow Tip:</strong> When you book or cancel an appointment here, switch your role to{" "}
          <button
            onClick={() => setRole("doc-01")}
            className="font-bold underline text-emerald-800 hover:text-emerald-950"
          >
            Dr. Jane Smith
          </button>{" "}
          using the top-right switcher to see the doctor queue dashboard react immediately!
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
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
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
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
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No appointments found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow transition flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-slate-900 text-base">
                      {appt.doctorName || appt.doctor?.name || "Consulting Specialist"}
                    </h3>
                    {getStatusBadge(appt.status)}
                  </div>
                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {appt.doctorSpecialty || appt.doctor?.specialty || appt.doctor?.specialization || "Outpatient Clinical Consultation"}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
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
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">Reason / Symptoms:</span> {appt.symptoms}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-3 self-end md:self-center">
                {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                  <button
                    disabled={actionLoading === appt.id}
                    onClick={() => handleCancel(appt.id)}
                    className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition"
                  >
                    {actionLoading === appt.id ? "Cancelling..." : "Cancel Visit"}
                  </button>
                )}

                {appt.status === "COMPLETED" && (
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Consultation Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
