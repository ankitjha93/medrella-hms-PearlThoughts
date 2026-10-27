"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

export default function DoctorsDirectoryPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("RATING");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
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
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty =
        specialtyFilter === "ALL" || spec === specialtyFilter;
      return matchesSearch && matchesSpecialty;
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
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Medrella Outpatient Directory</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Find Specialists</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified medical doctors, inspect consultation fees, and schedule real-time visits.
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start md:self-auto">
          Showing <span className="font-semibold text-slate-900">{filteredDoctors.length}</span> doctors
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Specialty Dropdown */}
          <div className="relative md:col-span-3">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 appearance-none font-medium"
            >
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === "ALL" ? "All Specialties" : spec}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="relative md:col-span-3">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 appearance-none font-medium"
            >
              <option value="RATING">Highest Rated</option>
              <option value="FEE_ASC">Consultation Fee: Low to High</option>
              <option value="FEE_DESC">Consultation Fee: High to Low</option>
              <option value="EXPERIENCE">Years of Experience</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <p className="text-slate-600 font-medium">No doctors found matching your filters.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSpecialtyFilter("ALL");
            }}
            className="text-xs text-emerald-700 font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-4">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 text-amber-500 text-xs font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400">({doc.reviewCount || doc.reviewsCount})</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mt-1 truncate">{doc.name}</h3>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                      {doc.specialty || doc.specialization}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.hospital}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{doc.experience || `${doc.experienceYears} years`} clinical experience</span>
                  </div>
                  <p className="text-slate-500 pt-1 line-clamp-2">{doc.bio || doc.about}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Session Fee</span>
                  <span className="text-lg font-bold text-slate-900">${doc.fee || doc.consultationFee}</span>
                </div>
                <button
                  onClick={() => handleBook(doc)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          ))}
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
