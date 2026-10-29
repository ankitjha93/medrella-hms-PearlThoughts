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
  MapPin,
  ChevronRight,
  Stethoscope,
  Building2,
  Users,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Ticket,
  FileText,
  BadgeCheck,
  Zap,
} from "lucide-react";

const SPECIALTIES = [
  { name: "All Specialties", icon: Sparkles, tag: "All Doctors" },
  { name: "Cardiology", icon: HeartPulse, tag: "Heart & Vascular" },
  { name: "Dermatology", icon: Activity, tag: "Skin & Care" },
  { name: "Pediatrics", icon: Baby, tag: "Child Health" },
  { name: "Orthopedics", icon: Bone, tag: "Joints & Bones" },
  { name: "Neurology", icon: Brain, tag: "Brain & Nerves" },
];

const FAQS = [
  {
    q: "How does Medrella prevent appointment double-bookings?",
    a: "Medrella employs an in-memory set collision engine. When you select a date, open slots are calculated in real time based on active physician shift windows. Once booked, that slot is instantly locked across the system with an atomic check, preventing concurrent scheduling.",
  },
  {
    q: "What is the Outpatient (OPD) Queue Token System?",
    a: "Every confirmed booking receives an auto-incrementing daily queue token (e.g. #OPD-01, #OPD-02). Doctors monitor the live queue via their clinical dashboard with a 'Now Serving' banner, ensuring zero waiting room confusion.",
  },
  {
    q: "Can I download and print my doctor's prescription?",
    a: "Yes! Once your doctor completes the consultation, an official verified Electronic Health Record (EHR) prescription slip is generated on hospital letterhead. You can view, save as PDF, or print directly using the 'Print Slip' button in your Patient Portal.",
  },
  {
    q: "Can I add booked consultations to my personal calendar?",
    a: "Absolutely. Medrella generates an RFC 5545 compliant .ics calendar invite compatible with Google Calendar, Apple Calendar, and Microsoft Outlook, complete with hospital location, room number, and a 30-minute reminder alarm.",
  },
  {
    q: "Can I reschedule my appointment if my plans change?",
    a: "Yes. From your Patient Portal, simply click 'Reschedule Visit' on any confirmed appointment. You can choose a new date and open time slot. The old slot is released immediately for other patients.",
  },
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

  // Interactive Triage State
  const [triageInput, setTriageInput] = useState("");
  const [triageResult, setTriageResult] = useState<{
    specialty: string;
    doctor: Doctor | null;
    reason: string;
    urgency: string;
  } | null>(null);

  // Stepper State
  const [activeStep, setActiveStep] = useState(0);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

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

  const handleTriage = (symptomText: string) => {
    const text = symptomText.toLowerCase();
    let matchedSpec = "Cardiology";
    let urgency = "Routine Consultation";
    let reason = "Evaluation for cardiovascular health and rhythm monitoring.";

    if (text.includes("rash") || text.includes("skin") || text.includes("itch") || text.includes("acne") || text.includes("eczema")) {
      matchedSpec = "Dermatology";
      urgency = "Standard Clinical Visit";
      reason = "Clinical dermatology evaluation for dermatological health.";
    } else if (text.includes("child") || text.includes("baby") || text.includes("vaccin") || text.includes("infant") || text.includes("pediatric")) {
      matchedSpec = "Pediatrics";
      urgency = "Pediatric Care";
      reason = "Child health and developmental wellness examination.";
    } else if (text.includes("knee") || text.includes("bone") || text.includes("joint") || text.includes("back pain") || text.includes("fracture") || text.includes("spine")) {
      matchedSpec = "Orthopedics";
      urgency = "Orthopedic Assessment";
      reason = "Musculoskeletal examination and joint stability assessment.";
    } else if (text.includes("headache") || text.includes("migraine") || text.includes("nerve") || text.includes("dizz") || text.includes("brain")) {
      matchedSpec = "Neurology";
      urgency = "Neurological Consultation";
      reason = "Neurological screening for cranial and peripheral nerve symptoms.";
    } else if (text.includes("chest") || text.includes("heart") || text.includes("bp") || text.includes("palpitation") || text.includes("breath")) {
      matchedSpec = "Cardiology";
      urgency = "Priority Outpatient";
      reason = "Preventive cardiovascular screening and blood pressure evaluation.";
    }

    const matchedDoctor = doctors.find((d) => (d.specialty || d.specialization).toLowerCase() === matchedSpec.toLowerCase()) || doctors[0] || null;

    setTriageResult({
      specialty: matchedSpec,
      doctor: matchedDoctor,
      reason,
      urgency,
    });
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

  const steps = [
    {
      title: "1. Discover Specialist",
      desc: "Browse verified outpatient specialists with credentials, consultation fees, and hospital affiliations.",
      badge: "Real-time Directory",
    },
    {
      title: "2. Lock Time Slot",
      desc: "Select available shifts with guaranteed conflict prevention and double-booking protection.",
      badge: "Zero Collisions",
    },
    {
      title: "3. Live OPD Queue",
      desc: "Receive sequential token (#OPD-01) and follow 'Now Serving' status on the clinic station monitor.",
      badge: "Transparent Queue",
    },
    {
      title: "4. Digital Prescription",
      desc: "Doctor inputs diagnosis and Rx medications, generating an official printable EHR clinical slip.",
      badge: "Official EHR Slip",
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Content & Interactive Triage */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold tracking-wide">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Modern Clinical Outpatient Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Smarter Outpatient <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500">
                  Appointments & Clinical OPD
                </span>
              </h1>

              <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Experience guaranteed conflict-free scheduling, live sequential OPD queue tokens, digital doctor prescriptions, and one-click calendar sync.
              </p>

              {/* Interactive Symptom Triage Widget */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Interactive Symptom Triage Assistant
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Instant Specialist Match
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={triageInput}
                    onChange={(e) => {
                      setTriageInput(e.target.value);
                      if (e.target.value.length > 2) handleTriage(e.target.value);
                    }}
                    placeholder="Describe your symptoms (e.g. chest discomfort, eczema rash, child fever)..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Quick Symptom Chips */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Select:</span>
                  {[
                    "Chest Tightness",
                    "Skin Rash",
                    "Child Wellness",
                    "Joint Pain",
                    "Migraine",
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setTriageInput(s);
                        handleTriage(s);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 font-medium transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Triage Recommendation Result */}
                {triageResult && (
                  <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in duration-200">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                          Recommended Department: {triageResult.specialty}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.2 rounded-md">
                          {triageResult.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{triageResult.reason}</p>
                    </div>

                    {triageResult.doctor && (
                      <button
                        onClick={() => handleBook(triageResult.doctor!)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shrink-0 shadow-sm transition"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Book with {triageResult.doctor.name}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/doctors"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/25 transition"
                >
                  <Search className="w-4 h-4" />
                  <span>Browse Specialist Directory</span>
                </Link>
                <Link
                  href="/patient"
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl text-xs font-semibold flex items-center space-x-2 transition border border-slate-200 dark:border-slate-700"
                >
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>View My Appointments</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Live OPD Outpatient Monitor Simulator */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Live Hospital OPD Monitor
                    </span>
                  </div>
                  <span className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-Time Feed</span>
                  </span>
                </div>

                {/* Active Station Card 1 */}
                <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Station 402 • Cardiology</span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                      Now Serving
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-extrabold text-white">Dr. Jane Smith</div>
                      <div className="text-[11px] text-slate-400">Attending: John Doe</div>
                    </div>
                    <div className="text-lg font-mono font-black text-emerald-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
                      #OPD-01
                    </div>
                  </div>
                </div>

                {/* Active Station Card 2 */}
                <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400">Station 301 • Dermatology</span>
                    <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                      In Consultation
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-extrabold text-white">Dr. Robert Chen</div>
                      <div className="text-[11px] text-slate-400">Attending: Michael Brown</div>
                    </div>
                    <div className="text-lg font-mono font-black text-cyan-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
                      #OPD-01
                    </div>
                  </div>
                </div>

                {/* Clinic Guarantee Badges */}
                <div className="grid grid-cols-2 gap-2 text-center text-[11px] text-slate-300 pt-1">
                  <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span>Zero Double-Booking</span>
                  </div>
                  <div className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800">
                    <FileText className="w-4 h-4 text-teal-400 mx-auto mb-1" />
                    <span>Verified EHR Slips</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialty Filter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Clinical Departments
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Browse Doctors by Specialty
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select a specialty to instantly filter consulting doctors on this page.
            </p>
          </div>

          <Link
            href="/doctors"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Doctors ({doctors.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Specialty Pills */}
        <div className="flex flex-wrap gap-2.5">
          {SPECIALTIES.map((spec) => {
            const Icon = spec.icon;
            const isSelected = selectedSpecialty === spec.name;
            return (
              <button
                key={spec.name}
                type="button"
                onClick={() => setSelectedSpecialty(spec.name)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-emerald-600"}`} />
                <span>{spec.name}</span>
              </button>
            );
          })}
        </div>

        {/* Filtered Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                        {doc.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {doc.specialty || doc.specialization}
                      </p>
                      <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{doc.rating}</span>
                        <span className="text-slate-400 font-normal">({doc.reviewCount || doc.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    ${doc.fee || doc.consultationFee}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {doc.bio || doc.about}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.hospital}</span>
                  </span>
                  <span>{doc.experience || `${doc.experienceYears} yrs`} exp</span>
                </div>
              </div>

              <button
                onClick={() => handleBook(doc)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive 4-Step Patient Journey */}
      <section className="bg-slate-50 dark:bg-slate-900/60 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Interactive Workflow
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              The Medrella Outpatient Experience
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click through the 4 stages to preview how Medrella coordinates outpatient encounters.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((st, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveStep(i)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  activeStep === i
                    ? "bg-white dark:bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                    : "bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                  {st.badge}
                </span>
                <div className="font-bold text-xs text-slate-900 dark:text-white">{st.title}</div>
              </button>
            ))}
          </div>

          {/* Active Step Preview Card */}
          <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in duration-200">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Phase {activeStep + 1}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {steps[activeStep].title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {steps[activeStep].desc}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <Link
                href="/doctors"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Test in Live Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-emerald-600 mx-auto" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Everything you need to know about scheduling, tokens, and digital prescriptions.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDoctor(null);
          }}
          onSuccess={() => {
            fetchDoctors();
          }}
        />
      )}
    </div>
  );
}
