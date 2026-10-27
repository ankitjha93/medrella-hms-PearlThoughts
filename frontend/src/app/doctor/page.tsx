"use client";

import { useState, useEffect } from "react";
import { Appointment, DoctorAvailability } from "@/lib/types";
import { useRole } from "@/components/RoleContext";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  Activity,
  Check,
  RefreshCw,
  Settings,
  AlertCircle,
  ShieldAlert,
  Stethoscope,
  X,
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

  // If not logged in as doctor, default doctorId to 'doc-01'
  const activeDoctorId = currentUser.doctorId || "doc-01";

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
  // Estimated revenue from confirmed/completed
  const docFee = currentUser.role === "DOCTOR" ? 180 : 180;
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Switch role alert if current user is patient */}
      {currentUser.role !== "DOCTOR" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You are currently browsing as <strong>{currentUser.name} (Patient)</strong>. You are previewing Dr. Jane Smith's queue.
            </span>
          </div>
          <button
            onClick={() => setRole("doc-01")}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0"
          >
            Switch to Dr. Jane Smith
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Schedula Outpatient Clinic Management</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            {currentUser.role === "DOCTOR" ? currentUser.name : "Dr. Jane Smith"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cardiology Department • St. Jude Medical Center • OPD Shift Active
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{totalBookings}</div>
          <div className="text-[11px] text-slate-500">Across all clinical slots</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider">In Queue / Confirmed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{confirmedCount}</div>
          <div className="text-[11px] text-slate-500">Awaiting consultation today</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <Check className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700">{completedCount}</div>
          <div className="text-[11px] text-slate-500">Discharged consultations</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-teal-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Estimated Revenue</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-teal-700">${totalRevenue}</div>
          <div className="text-[11px] text-slate-500">Based on ${docFee} / consult</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
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
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
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
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No appointments in this view</h3>
          <p className="text-xs text-slate-500">Patients will appear here automatically upon booking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow transition flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-900 text-base">{appt.patientName}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      appt.status === "CONFIRMED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : appt.status === "COMPLETED"
                        ? "bg-blue-50 text-blue-800 border-blue-200"
                        : appt.status === "CANCELLED"
                        ? "bg-red-50 text-red-800 border-red-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appt.date}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{appt.timeSlot || appt.time}</span>
                  </span>
                  <span>Contact: {appt.patientEmail}</span>
                  <span className="text-slate-400 font-mono text-[11px]">ID: {appt.id}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Clinical Reason:</span> {appt.symptoms || "General visit"}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 self-end md:self-center">
                {(appt.status === "SCHEDULED" || (appt.status as string) === "PENDING") && (
                  <button
                    disabled={actionLoading === appt.id}
                    onClick={() => handleStatusChange(appt.id, "CONFIRMED")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                )}

                {appt.status === "CONFIRMED" && (
                  <button
                    disabled={actionLoading === appt.id}
                    onClick={() => handleStatusChange(appt.id, "COMPLETED")}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}

                {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                  <button
                    disabled={actionLoading === appt.id}
                    onClick={() => handleStatusChange(appt.id, "CANCELLED")}
                    className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shift & Availability Settings Modal */}
      {showSettingsModal && availability && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
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
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Start Shift Hour
                </label>
                <input
                  type="text"
                  value={availability.startTime}
                  onChange={(e) =>
                    setAvailability({ ...availability, startTime: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-medium"
                  placeholder="09:00"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  End Shift Hour
                </label>
                <input
                  type="text"
                  value={availability.endTime}
                  onChange={(e) =>
                    setAvailability({ ...availability, endTime: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-medium"
                  placeholder="17:00"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
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
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-medium"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
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
