"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  UserCheck,
  Check,
  MapPin,
  ChevronRight,
  ShieldAlert,
  CalendarCheck,
  Stethoscope,
  Building2,
  Users,
} from "lucide-react";

const SPECIALTIES = [
  { name: "All Specialties", icon: Sparkles, tag: "All Doctors" },
  { name: "Cardiology", icon: HeartPulse, tag: "Heart & Vascular" },
  { name: "Dermatology", icon: Activity, tag: "Skin & Care" },
  { name: "Pediatrics", icon: Baby, tag: "Child Health" },
  { name: "Orthopedics", icon: Bone, tag: "Joints & Bones" },
  { name: "Neurology", icon: Brain, tag: "Brain & Nerves" },
];

export default function HomePage() {
  const router = useRouter();
  const { currentUser, switchUser } = useRole();
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

  const handleQuickSwitch = (userId: string, targetPath: string) => {
    switchUser(userId);
    router.push(targetPath);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-white pt-16 pb-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline, Value Proposition & Search */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Medrella Outpatient Platform • Schedula Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                World-Class Clinical Care & Instant{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Doctor Appointments
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                Eliminate clinic waiting lines. Book verified specialists with live slot synchronization,
                prevent double-booking conflicts, and manage outpatient queues seamlessly.
              </p>

              {/* Instant Search Bar */}
              <div className="max-w-2xl bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-2xl flex flex-col sm:flex-row gap-2 mx-auto lg:mx-0">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search doctor, specialty, or hospital..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Link
                  href="/doctors"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition shadow-md shrink-0"
                >
                  <span>Find Specialists</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto lg:mx-0 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-left">
                  <div className="text-2xl font-extrabold text-emerald-400">5+</div>
                  <div className="text-[11px] text-slate-400 font-medium">Board Specialists</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-left">
                  <div className="text-2xl font-extrabold text-teal-400">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Live Slot Check</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-left">
                  <div className="text-2xl font-extrabold text-cyan-400">&lt; 1 min</div>
                  <div className="text-[11px] text-slate-400 font-medium">Booking Speed</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-left">
                  <div className="text-2xl font-extrabold text-emerald-400">0 min</div>
                  <div className="text-[11px] text-slate-400 font-medium">Queue Delay</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Clinical Preview Widget */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-slate-900/90 rounded-3xl border border-slate-700/80 shadow-2xl p-6 backdrop-blur-xl text-slate-100 space-y-5">
                {/* Widget Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Live OPD Queue</h4>
                      <p className="text-[11px] text-slate-400">St. Jude Medical Center</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-time Active</span>
                  </span>
                </div>

                {/* Queue Item 1 - Active */}
                <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120"
                        alt="Dr. Jane Smith"
                        className="w-11 h-11 rounded-xl object-cover border border-slate-600"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Dr. Jane Smith</div>
                      <div className="text-[11px] text-emerald-400 font-medium">Cardiology • On Duty</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Slot: 10:00 AM (In Progress)</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg">
                    Consulting
                  </span>
                </div>

                {/* Queue Item 2 - Up Next */}
                <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/40 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                      JD
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">John Doe (Patient)</div>
                      <div className="text-[11px] text-slate-400">Cardiology Checkup</div>
                      <div className="text-[10px] text-amber-400 mt-0.5">Next in Queue: 10:30 AM</div>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 rounded-lg">
                    Confirmed
                  </span>
                </div>

                {/* Queue Summary Footer */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Average Consultation: <strong>30 mins</strong></span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-[11px]">8 Slots Open</span>
                </div>

                {/* Fast Action */}
                <button
                  onClick={() => {
                    const doc = doctors[0];
                    if (doc) handleBook(doc);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-900/30"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Immediate Slot with Dr. Jane Smith</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Specialty Filter Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
            Browse by Clinical Specialty
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {SPECIALTIES.map((spec) => {
              const Icon = spec.icon;
              const isSelected = selectedSpecialty === spec.name;
              return (
                <button
                  key={spec.name}
                  onClick={() => setSelectedSpecialty(spec.name)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl text-xs font-semibold transition border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                      : "bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? "text-emerald-400" : "text-emerald-600"}`} />
                  <span className="text-center font-bold">{spec.name}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {spec.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* "How It Works" 3-Step Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Frictionless Healthcare Journey</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How Medrella Booking Works</h2>
          <p className="text-sm text-slate-500 mt-2">
            Engineered on Schedula architecture for instantaneous outpatient booking and verified OPD queues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-5 shadow-sm group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Discover Verified Specialists</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse board-certified doctors by department, consultation fee, hospital affiliation, and patient ratings.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
              <span>5 Specialties Covered</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-lg mb-5 shadow-sm group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Select Live Conflict-Free Slot</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our dynamic slot engine checks the doctor's active shifts in real-time, instantly preventing double-booking conflicts.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-teal-700 font-semibold flex items-center space-x-1">
              <span>0% Double Booking Guarantee</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-extrabold text-lg mb-5 shadow-sm group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">Join Digital OPD Queue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Get an instant confirmation ticket. The appointment updates the doctor's queue dashboard live for consultation.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-cyan-700 font-semibold flex items-center space-x-1">
              <span>Instant Confirmation</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Available Specialists</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Verified Doctors</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing specialists ready for outpatient consultation
            </p>
          </div>
          <Link
            href="/doctors"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition self-start sm:self-auto shadow-sm"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">No doctors found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialty("All Specialties");
              }}
              className="mt-3 text-xs text-emerald-700 font-bold hover:underline"
            >
              Reset search & filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-sm"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviewCount || doc.reviewsCount})</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition">
                      {doc.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {doc.specialty || doc.specialization}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {doc.experience || `${doc.experienceYears} yrs`} exp
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-2.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.hospital}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                      {doc.bio || doc.about}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Session Fee</span>
                    <span className="text-lg font-extrabold text-slate-900">${doc.fee || doc.consultationFee}</span>
                  </div>
                  <button
                    onClick={() => handleBook(doc)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
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

      {/* Dual-Role Interactive Showcase (Replaced Loom Banner with Instant Role Switching) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
              <span>Real-Time Cross-Dashboard Synchronization</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Test Real-Time Clinical Synchronization Between Patient & Doctor
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Experience the dual-sided outpatient workflow in action. Book an appointment as a patient,
              switch roles immediately to the physician, and watch the consultation ticket arrive in the queue dashboard!
            </p>

            {/* Side-by-Side Dual-Role Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              {/* Patient Card */}
              <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    JD
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">John Doe (Patient)</h4>
                    <p className="text-xs text-slate-400">Self-Service Patient Portal</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  Book slots with specialists, review consultation dates, and self-manage cancellations with instant status updates.
                </p>
                <button
                  onClick={() => handleQuickSwitch("user_pat_1", "/patient")}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow"
                >
                  <span>Launch as Patient (John Doe)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Doctor Card */}
              <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    JS
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Dr. Jane Smith (Cardiologist)</h4>
                    <p className="text-xs text-slate-400">Outpatient EMR & Queue</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  Inspect incoming OPD queues, mark visits confirmed/completed, and manage weekly clinical shifts and slot duration.
                </p>
                <button
                  onClick={() => handleQuickSwitch("user_doc_1", "/doctor")}
                  className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
                >
                  <span>Launch as Doctor (Dr. Jane Smith)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Schedula Architectural Strengths */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Core Scheduling Architecture</h2>
          <p className="text-sm text-slate-500 mt-2">
            Built using the proven Schedula hospital scheduling schema for enterprise clinic reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Dynamic Slot Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates slot availability dynamically from doctor shifts, consultation durations, and booked appointments.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Resilient JSON Persistence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              State transitions (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED) persist reliably across restarts with zero data corruption.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center shadow-sm">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Physician Queue Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides OPD physicians with instant status toggle buttons, consultation metrics, and patient clinical history.
            </p>
          </div>
        </div>
      </section>

      {/* Enterprise Clinic Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-base">
                M
              </div>
              <span className="font-extrabold text-lg text-slate-900">Medrella</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Schedula HMS
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Next-generation outpatient healthcare appointment booking and clinical schedule management platform.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/doctors" className="hover:text-emerald-700 transition">
                  Find Specialists
                </Link>
              </li>
              <li>
                <Link href="/patient" className="hover:text-emerald-700 transition">
                  Patient Appointments Portal
                </Link>
              </li>
              <li>
                <Link href="/doctor" className="hover:text-emerald-700 transition">
                  Doctor Queue Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Clinical Hours</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Outpatient OPD: Mon - Fri (09:00 - 17:00)<br />
              Saturday: 09:00 - 14:00<br />
              Sunday: Emergency Ward Only
            </p>
          </div>
        </div>

        {/* Medical Emergency Disclaimer */}
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center space-x-3 text-xs text-amber-900 mb-6">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Medical Notice:</strong> If you are experiencing a life-threatening medical emergency, please call your local emergency hotline (e.g. 911 / 112) or proceed to the nearest emergency room immediately.
          </span>
        </div>

        <div className="text-center text-xs text-slate-400 pb-4">
          &copy; 2026 Medrella Clinical Booking Platform. Built on Schedula Architecture.
        </div>
      </footer>

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
