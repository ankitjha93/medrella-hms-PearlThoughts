"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Doctor } from "@/lib/types";
import { BookingModal } from "@/components/BookingModal";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Stethoscope,
  LayoutGrid,
  List,
  Building2,
  GraduationCap,
  ShieldCheck,
  X,
  CheckCircle2,
  DollarSign,
  HeartPulse,
} from "lucide-react";

export default function DoctorsDirectoryPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("" );
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("ALL");
  const [feeFilter, setFeeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("RATING");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  
  // Modals state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
      console.error("Failed to load doctor directory", err);
    } finally {
      setLoading(false);
    }
  };

  const specialties = [
    "ALL",
    ...Array.from(new Set(doctors.map((d) => d.specialty || d.specialization))),
  ];

  const filteredDoctors = doctors
    .filter((doc) => {
      const spec = doc.specialty || doc.specialization;
      const fee = doc.fee !== undefined ? doc.fee : doc.consultationFee;

      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        specialtyFilter === "ALL" || spec === specialtyFilter;

      let matchesFee = true;
      if (feeFilter === "UNDER_70") matchesFee = fee < 70;
      else if (feeFilter === "70_TO_80") matchesFee = fee >= 70 && fee <= 80;
      else if (feeFilter === "OVER_80") matchesFee = fee > 80;

      return matchesSearch && matchesSpecialty && matchesFee;
    })
    .sort((a, b) => {
      const feeA = a.fee !== undefined ? a.fee : a.consultationFee;
      const feeB = b.fee !== undefined ? b.fee : b.consultationFee;
      if (sortBy === "FEE_ASC") return feeA - feeB;
      if (sortBy === "FEE_DESC") return feeB - feeA;
      if (sortBy === "EXPERIENCE") {
        return b.experienceYears - a.experienceYears;
      }
      return b.rating - a.rating;
    });

  const handleBook = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Medrella Verified Specialist Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Find Your Doctor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare verified medical specialists, inspect consultation fees, view clinical profiles, and book conflict-free visits.
          </p>
        </div>

        {/* View mode toggle & counter */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "GRID"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "LIST"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            Showing <span className="font-bold text-emerald-600 dark:text-emerald-400">{filteredDoctors.length}</span> doctors
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search doctor name, hospital, or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Specialty Dropdown */}
          <div className="relative md:col-span-3">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === "ALL" ? "All Specialties" : spec}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Filter */}
          <div className="relative md:col-span-2">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="ALL">All Fees</option>
              <option value="UNDER_70">&lt; $70</option>
              <option value="70_TO_80">$70 - $80</option>
              <option value="OVER_80">&gt; $80</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative md:col-span-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="RATING">Highest Rated</option>
              <option value="EXPERIENCE">Most Experienced</option>
              <option value="FEE_ASC">Fee: Low to High</option>
              <option value="FEE_DESC">Fee: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick specialty pills */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialtyFilter(spec)}
              className={`text-[11px] px-3 py-1 rounded-xl font-semibold transition ${
                specialtyFilter === spec
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {spec === "ALL" ? "All Specialties" : spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid / List View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">No doctors found matching your filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSpecialtyFilter("ALL");
              setFeeFilter("ALL");
            }}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{doc.rating}</span>
                        <span className="text-slate-400 font-normal">({doc.reviewCount || doc.reviewsCount})</span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 leading-tight">{doc.name}</h3>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mt-1">
                        {doc.specialty || doc.specialization}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    ${doc.fee || doc.consultationFee}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.bio || doc.about}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospital}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{doc.experience || `${doc.experienceYears} years`} clinical practicing</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Link
                  href={`/doctors/${doc.id}`}
                  className="flex-1 py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Full Profile
                </Link>
                <button
                  onClick={() => handleBook(doc)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Visit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{doc.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {doc.specialty || doc.specialization}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviewCount || doc.reviewsCount})</span>
                    </span>
                    <span>•</span>
                    <span>{doc.hospital}</span>
                    <span>•</span>
                    <span>{doc.experience || `${doc.experienceYears} yrs`} exp</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end md:self-center">
                <div className="text-right mr-2 hidden sm:block">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Fee</span>
                  <div className="font-extrabold text-base text-slate-900 dark:text-white">${doc.fee || doc.consultationFee}</div>
                </div>
                <Link
                  href={`/doctors/${doc.id}`}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Full Profile
                </Link>
                <button
                  onClick={() => handleBook(doc)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Visit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Full-Profile Modal */}
      {profileDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Physician Clinical Profile</h3>
              </div>
              <button
                onClick={() => setProfileDoctor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
              <div className="flex items-center space-x-4">
                <img
                  src={profileDoctor.avatar}
                  alt={profileDoctor.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{profileDoctor.name}</h3>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {profileDoctor.specialty || profileDoctor.specialization}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1.5">
                    <span className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{profileDoctor.rating}</span>
                      <span className="text-slate-400 font-normal">({profileDoctor.reviewCount || profileDoctor.reviewsCount} reviews)</span>
                    </span>
                    <span>•</span>
                    <span>{profileDoctor.experience || `${profileDoctor.experienceYears} years`} practicing</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">About & Practice Focus</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {profileDoctor.bio || profileDoctor.about}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px] flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Education & Fellowship</span>
                  </span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{profileDoctor.education}</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px] flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hospital Station</span>
                  </span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{profileDoctor.location || profileDoctor.hospital}</div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Outpatient Consultation Fee</span>
                  <div className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    ${profileDoctor.fee || profileDoctor.consultationFee} <span className="text-[11px] font-normal text-slate-500">(Pay at clinic / Insurance)</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
                  Verified Specialist
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setProfileDoctor(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const doc = profileDoctor;
                  setProfileDoctor(null);
                  handleBook(doc);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book with {profileDoctor.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
