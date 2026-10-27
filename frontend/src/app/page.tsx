"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Doctor } from "@/lib/types";
import { BookingModal } from "@/components/BookingModal";
import { useRole } from "@/components/RoleContext";
import {
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Activity,
  ArrowRight,
  HeartPulse,
  Baby,
  Brain,
  Bone,
  Sparkles,
  CheckCircle2,
  Video,
  UserCheck,
} from "lucide-react";

const SPECIALTIES = [
  { name: "All Specialties", icon: Sparkles },
  { name: "Cardiology", icon: HeartPulse },
  { name: "Dermatology", icon: Activity },
  { name: "Pediatrics", icon: Baby },
  { name: "Orthopedics", icon: Bone },
  { name: "Neurology", icon: Brain },
];

export default function HomePage() {
  const { currentUser, setRole } = useRole();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const spec = doc.specialty || doc.specialization;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" ||
      spec.toLowerCase() === selectedSpecialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  const handleBook = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />

        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Medrella Clinic Engine • Built on Schedula Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Seamless Outpatient Care & Instant{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Doctor Appointments
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Eliminate clinic waiting times. Book verified specialists with live slot synchronization,
            track clinical history, and manage daily OPD queues effortlessly.
          </p>

          {/* Quick interactive search banner */}
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col sm:flex-row gap-2 mt-8">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by doctor name, specialty, or clinic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <Link
              href="/doctors"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition shadow-md shrink-0"
            >
              <span>Explore Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Metrics Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-emerald-400">5+</div>
              <div className="text-xs text-slate-400">Board Specialists</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-teal-400">100%</div>
              <div className="text-xs text-slate-400">Live Slots Available</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-emerald-400">0 min</div>
              <div className="text-xs text-slate-400">Double-Booking Lag</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-2xl font-bold text-teal-400">24/7</div>
              <div className="text-xs text-slate-400">Patient Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialty Filter Pills */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {SPECIALTIES.map((spec) => {
              const Icon = spec.icon;
              const isSelected = selectedSpecialty === spec.name;
              return (
                <button
                  key={spec.name}
                  onClick={() => setSelectedSpecialty(spec.name)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{spec.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Verified Doctors</h2>
            <p className="text-sm text-slate-500">
              Showing specialists available for outpatient consultation
            </p>
          </div>
          <Link
            href="/doctors"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm">No doctors found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/20"
                    />
                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400">({doc.reviewCount || doc.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-bold text-lg text-slate-900">{doc.name}</h3>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      {doc.specialty || doc.specialization}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{doc.hospital}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2.5">{doc.bio || doc.about}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Consultation Fee</span>
                    <span className="text-base font-bold text-slate-900">${doc.fee || doc.consultationFee}</span>
                  </div>
                  <button
                    onClick={() => handleBook(doc)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Medrella Demo Walkthrough & Role Switcher Explanation Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-slate-700">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Interactive Dual-Role Demonstration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Test Real-Time Synchronization Across Roles
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Use the <span className="font-semibold text-white">Role Switcher in the top right</span> to switch between
              <strong> John Doe (Patient)</strong> and <strong>Dr. Jane Smith (Cardiologist)</strong>.
              Book an appointment as a patient, switch to Dr. Jane Smith, and confirm or complete it instantly in the clinical queue!
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/patient"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow"
              >
                Go to Patient Portal
              </Link>
              <Link
                href="/doctor"
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition"
              >
                Go to Doctor Queue Dashboard
              </Link>
              <a
                href="https://www.loom.com/share/9fd476977c814355898fb42bc4f835ad"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Watch Loom Video Walkthrough</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Core Schedula Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900">Core Scheduling Engine Capabilities</h2>
          <p className="text-sm text-slate-500 mt-2">
            Engineered using the Schedula outpatient architecture for enterprise hospitals & clinics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Dynamic Slot Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Slots are generated strictly based on doctor shifts and verified against already booked consultations
              to prevent double-booking.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">State Persistence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every appointment lifecycle state (PENDING, CONFIRMED, COMPLETED, CANCELLED) persists reliably across server restarts.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900">Clinical Queue Manager</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Doctors manage daily outpatient queues with 1-click status transitions and live consultation revenue tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        doctor={selectedDoctor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchDoctors();
        }}
      />
    </div>
  );
}
