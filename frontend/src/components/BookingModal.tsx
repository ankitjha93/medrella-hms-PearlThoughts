"use client";

import { useState, useEffect } from "react";
import { Doctor, TimeSlot, Appointment } from "@/lib/types";
import { useRole } from "./RoleContext";
import { X, Calendar, Clock, DollarSign, AlertCircle, CheckCircle, Stethoscope } from "lucide-react";

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
          patientId: currentUser.patientId || "pat-01",
          patientName: currentUser.name,
          patientEmail: currentUser.email,
          patientPhone: "+1 (555) 019-2834",
          date,
          timeSlot: selectedSlot,
          symptoms: symptoms.trim() || "Routine clinical check-up",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      setSuccessAppt(data.appointment);
      if (onSuccess) {
        onSuccess(data.appointment);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating appointment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Schedule Appointment</h3>
              <p className="text-xs text-slate-400">Schedula Real-time Outpatient Booking Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success screen */}
        {successAppt ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your appointment with <span className="font-semibold text-slate-900">{doctor.name}</span> has been confirmed for{" "}
              <span className="font-semibold text-emerald-700">{successAppt.date} at {successAppt.timeSlot || successAppt.time}</span>.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-medium text-slate-800">{successAppt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-medium text-slate-800">{successAppt.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-medium text-slate-800">{doctor.name} ({doctor.specialty || doctor.specialization})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Status:</span>
                <span className="font-medium text-emerald-600">${doctor.fee || doctor.consultationFee} (Pay on visit / Insurance)</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition shadow-sm"
              >
                Close & View Portal
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Doctor mini-card */}
            <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 text-base">{doctor.name}</h4>
                  <span className="text-emerald-700 font-bold text-sm bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ${doctor.fee || doctor.consultationFee}
                  </span>
                </div>
                <p className="text-xs text-emerald-700 font-medium">{doctor.specialty || doctor.specialization}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{doctor.hospital} • {doctor.experience || `${doctor.experienceYears} years`} experience</p>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Date selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Visit Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Slots selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  2. Select Available Slot
                </label>
                {loadingSlots && <span className="text-xs text-emerald-600 animate-pulse">Checking live availability...</span>}
              </div>

              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center text-xs text-amber-800">
                  No slots available on this date or doctor is not on duty. Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {slots.map((s) => {
                    const isAvailable = s.isAvailable !== undefined ? s.isAvailable : s.available;
                    return (
                      <button
                        key={s.time}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(s.time)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition flex items-center justify-center space-x-1.5 ${
                          !isAvailable
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through"
                            : selectedSlot === s.time
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{s.time}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Symptoms and Notes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                3. Primary Symptoms / Reason for Visit
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="E.g., High blood pressure checkup, chest tightness, recurring headache..."
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition shadow-sm"
              >
                {submitting ? (
                  <span>Securing Slot...</span>
                ) : (
                  <>
                    <span>Confirm & Book</span>
                    <span className="bg-emerald-700/60 px-1.5 py-0.5 rounded text-[11px]">${doctor.fee || doctor.consultationFee}</span>
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
