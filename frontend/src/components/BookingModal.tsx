"use client";

import { useState, useEffect } from "react";
import { Doctor, TimeSlot, Appointment } from "@/lib/types";
import { useRole } from "./RoleContext";
import { downloadCalendarEvent } from "@/lib/calendar";
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  CalendarPlus,
  Ticket,
  Sun,
  Sunset,
  Sparkles,
} from "lucide-react";

interface BookingModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (appointment: Appointment) => void;
}

export function BookingModal({ doctor, isOpen, onClose, onSuccess }: BookingModalProps) {
  const { currentUser } = useRole();
  
  const [date, setDate] = useState<string>("");
  const [todayStr, setTodayStr] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successAppt, setSuccessAppt] = useState<Appointment | null>(null);

  const quickSymptoms = [
    "Routine Checkup",
    "Prescription Renewal",
    "Blood Pressure Review",
    "Persistent Cough / Cold",
    "Skin Rash / Allergy",
    "Headache & Fatigue",
  ];

  // Initialize dates safely in client effect
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const todayFormatted = now.toISOString().split("T")[0];
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

      setTodayStr(todayFormatted);
      setDate(tomorrowFormatted);
      setSuccessAppt(null);
      setError(null);
      setSymptoms("");
      setSelectedSlot("");
    }
  }, [isOpen]);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (!isOpen || !doctor || !date) return;

    let isMounted = true;
    setLoadingSlots(true);
    setError(null);
    setSelectedSlot("");

    fetch(`/api/doctors/${doctor.id}?date=${date}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load doctor slots");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setSlots(data.slots || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to fetch slots");
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, doctor, date]);

  if (!isOpen || !doctor) return null;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Please select an available time slot.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientId: currentUser.patientId || "pat_1",
          patientName: currentUser.name,
          patientEmail: currentUser.email,
          patientPhone: "+1 (555) 019-2834",
          doctorName: doctor.name,
          doctorSpecialty: doctor.specialty || doctor.specialization,
          date,
          time: selectedSlot,
          timeSlot: selectedSlot,
          symptoms: symptoms || "Routine consultation & checkup",
          fee: doctor.fee || doctor.consultationFee,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Slot is no longer available. Please select another time.");
      }

      setSuccessAppt(data.appointment);
      if (onSuccess) onSuccess(data.appointment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error reserving appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const morningSlots = slots.filter((s) => s.time.includes("AM"));
  const afternoonSlots = slots.filter((s) => s.time.includes("PM"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Schedule Consultation</h3>
              <p className="text-xs text-slate-400">Medrella Real-time Outpatient Booking Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-100 dark:bg-slate-800/60 px-6 py-2.5 flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${successAppt ? "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300" : "bg-emerald-600 text-white"}`}>
              1
            </span>
            <span className={successAppt ? "text-slate-500" : "font-bold text-slate-900 dark:text-white"}>Date & Time</span>
          </div>
          <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center space-x-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${successAppt ? "bg-emerald-600 text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>
              2
            </span>
            <span className={successAppt ? "font-bold text-slate-900 dark:text-white" : "text-slate-500"}>Confirmation & Token</span>
          </div>
        </div>

        {/* Success screen */}
        {successAppt ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">Appointment Confirmed!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Your consultation with <span className="font-semibold text-slate-900 dark:text-white">{doctor.name}</span> has been confirmed for{" "}
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{successAppt.date} at {successAppt.timeSlot || successAppt.time}</span>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-semibold flex items-center space-x-1">
                  <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                  <span>OPD Queue Token:</span>
                </span>
                <span className="font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                  #OPD-{String(successAppt.tokenNumber || 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{successAppt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{successAppt.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{doctor.name} ({doctor.specialty || doctor.specialization})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">${doctor.fee || doctor.consultationFee} (Pay at clinic / Insurance)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
              <button
                onClick={() => downloadCalendarEvent(successAppt)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border border-slate-200 dark:border-slate-700 transition"
              >
                <CalendarPlus className="w-4 h-4 text-emerald-600" />
                <span>Add to Calendar (.ics)</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 dark:hover:bg-emerald-500 transition shadow-sm"
              >
                Done & View Appointments
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Doctor mini-card */}
            <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{doctor.name}</h4>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-sm bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    ${doctor.fee || doctor.consultationFee}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">{doctor.specialty || doctor.specialization}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{doctor.hospital} • {doctor.experience || `${doctor.experienceYears} years`} experience</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Date selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                1. Select Consultation Date
              </label>
              <input
                type="date"
                min={todayStr || undefined}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Shift-categorized Time Slot selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Choose Consultation Slot
                </label>
                {loadingSlots && (
                  <span className="text-[11px] text-emerald-600 animate-pulse font-medium">Checking live schedule...</span>
                )}
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                  No slots available on this day. Please select another date.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Morning Slots */}
                  {morningSlots.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Morning Shift (09:00 AM - 12:00 PM)</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {morningSlots.map((s) => {
                          const isAvail = s.isAvailable !== false && s.available !== false;
                          const isSelected = selectedSlot === s.time;
                          return (
                            <button
                              type="button"
                              key={s.time}
                              disabled={!isAvail}
                              onClick={() => setSelectedSlot(s.time)}
                              className={`p-2 rounded-xl text-xs font-semibold text-center transition border ${
                                isSelected
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                  : isAvail
                                  ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50"
                                  : "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed line-through"
                              }`}
                            >
                              {s.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {afternoonSlots.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                        <Sunset className="w-3.5 h-3.5 text-teal-500" />
                        <span>Afternoon Shift (02:00 PM - 05:00 PM)</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {afternoonSlots.map((s) => {
                          const isAvail = s.isAvailable !== false && s.available !== false;
                          const isSelected = selectedSlot === s.time;
                          return (
                            <button
                              type="button"
                              key={s.time}
                              disabled={!isAvail}
                              onClick={() => setSelectedSlot(s.time)}
                              className={`p-2 rounded-xl text-xs font-semibold text-center transition border ${
                                isSelected
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                  : isAvail
                                  ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50"
                                  : "bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed line-through"
                              }`}
                            >
                              {s.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Symptoms Chips */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Reason for Visit / Intake
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickSymptoms.map((qs) => (
                  <button
                    key={qs}
                    type="button"
                    onClick={() => setSymptoms(qs)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                  >
                    + {qs}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe your primary symptoms, observations, or ongoing concerns..."
                className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-sm"
              >
                {submitting ? (
                  <span>Securing Slot...</span>
                ) : (
                  <>
                    <span>Confirm & Book</span>
                    <span className="bg-emerald-700/80 px-1.5 py-0.5 rounded text-[11px]">${doctor.fee || doctor.consultationFee}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
