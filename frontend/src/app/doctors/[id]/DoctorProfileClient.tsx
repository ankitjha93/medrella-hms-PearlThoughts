"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Doctor } from "@/lib/types";
import { BookingModal } from "@/components/BookingModal";
import { useRole } from "@/components/RoleContext";
import {
  Star,
  Calendar,
  Clock,
  MapPin,
  Building2,
  GraduationCap,
  Award,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  Phone,
  HeartPulse,
  Sparkles,
  Send,
  UserCheck,
} from "lucide-react";

export default function DoctorProfileClient({ id }: { id: string }) {
  const { currentUser } = useRole();
  const doctorId = id;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  // Review form state
  const [userRating, setUserRating] = useState<number>(5);
  const [userComment, setUserComment] = useState<string>("");
  const [reviewerName, setReviewerName] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (currentUser?.name && !reviewerName) {
      setReviewerName(currentUser.name);
    }
  }, [currentUser, reviewerName]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/doctors/${doctorId}`);
      if (!res.ok) {
        throw new Error("Physician profile not found");
      }
      const data = await res.json();
      setDoctor(data.doctor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading doctor profile");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !userComment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      const res = await fetch(`/api/doctors/${doctorId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: reviewerName || currentUser?.name || "Verified Patient",
          rating: userRating,
          comment: userComment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setReviewMessage({ type: "success", text: "Thank you! Your verified review has been published." });
      setUserComment("");
      setDoctor(data.doctor);
    } catch (err) {
      setReviewMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to post review",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
          <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Physician Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {error || "The requested doctor profile does not exist or may have relocated."}
        </p>
        <Link
          href="/doctors"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Specialists Catalog</span>
        </Link>
      </div>
    );
  }

  const reviewsList = doctor.reviews || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-emerald-600 transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/doctors" className="hover:text-emerald-600 transition">
          Specialists
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-900 dark:text-white">{doctor.name}</span>
      </nav>

      {/* Hero Profile Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative shrink-0">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-md"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900" title="Verified Specialist">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {doctor.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {doctor.specialty || doctor.specialization}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {doctor.experienceYears} Years Exp.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center space-x-1.5 font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-slate-900 dark:text-white text-sm">{doctor.rating}</span>
                  <span className="text-slate-400 font-normal">({doctor.reviewCount || doctor.reviewsCount || reviewsList.length} verified ratings)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{doctor.hospital}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{doctor.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Direct Booking CTA */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 gap-3">
            <div className="text-left sm:text-right">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consultation Fee</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                ${doctor.fee || doctor.consultationFee}
                <span className="text-xs font-normal text-slate-400"> / 30 mins</span>
              </div>
            </div>
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Clinical Content & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography & Focus */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>About Physician & Clinical Focus</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {doctor.bio || doctor.about}
            </p>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Education & Fellowships</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{doctor.education}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hospital Department</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{doctor.hospital} • OPD Station</div>
                </div>
              </div>
            </div>
          </div>

          {/* Shift Schedule */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>OPD Consultation Schedule</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consultations are scheduled in conflict-free 30-minute intervals with sequential OPD token allocation.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                const isPracticing = doctor.availableDays.includes(day);
                return (
                  <div
                    key={day}
                    className={`p-3 rounded-2xl border text-center transition ${
                      isPracticing
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through"
                    }`}
                  >
                    <div className="text-xs font-bold">{day}</div>
                    <div className="text-[11px] mt-0.5 font-medium">
                      {isPracticing ? "09:00 - 17:00" : "Off Duty"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patient Reviews & Ratings */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span>Verified Patient Reviews</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real feedback from outpatient clinic encounters
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-2xl">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <div>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{doctor.rating}</span>
                  <span className="text-xs text-slate-500 font-medium ml-1">/ 5.0</span>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviewsList.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No reviews submitted yet. Be the first to leave feedback!</p>
              ) : (
                reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{rev.patientName}</span>
                        {rev.verifiedVisit && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Verified Visit</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Write a Review Form */}
            <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Leave Patient Feedback</h3>
              </div>

              {reviewMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    reviewMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300"
                  }`}
                >
                  {reviewMessage.text}
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Select Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-110 transition"
                      title={`${star} Stars`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-300 dark:text-slate-700 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {userRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Reviewer Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Clinical Experience & Feedback
                </label>
                <textarea
                  required
                  rows={3}
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Share details of your consultation, wait time, or treatment outcome..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReview ? "Submitting..." : "Submit Verified Review"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar (1 Col): Quick Booking Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 sticky top-24">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consultation Fee</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                ${doctor.fee || doctor.consultationFee}
                <span className="text-xs font-normal text-slate-400"> / 30 mins</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant OPD Queue Token Assigned</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Double-Booking Guarantee</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1-Click Calendar Sync (.ics)</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified EHR Printable Medical Slip</span>
              </div>
            </div>

            <button
              onClick={() => setIsBookingOpen(true)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Now</span>
            </button>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1 text-center">
              <div>Need hospital assistance?</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>(555) 019-8372 • OPD Desk 402</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && doctor && (
        <BookingModal
          doctor={doctor}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
}

