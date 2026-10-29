"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/RoleContext";
import {
  User as UserIcon,
  ShieldCheck,
  KeyRound,
  Mail,
  Phone,
  Building2,
  Activity,
  CheckCircle2,
  AlertCircle,
  Save,
  LogOut,
  HeartPulse,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  FileBadge,
  Sparkles,
  Laptop,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateProfile, updatePassword, signOut, isSupabaseConfigured } = useRole();

  // Active Tab: 'personal' | 'security'
  const [activeTab, setActiveTab] = useState<"personal" | "security">("personal");

  // Personal Info Form State
  const [name, setName] = useState(currentUser.name || "");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [avatar, setAvatar] = useState(currentUser.avatar || "");
  const [bloodGroup, setBloodGroup] = useState("O+ Positive");
  const [emergencyContact, setEmergencyContact] = useState("Jane Doe (Spouse) - +1 (555) 982-1100");
  const [department, setDepartment] = useState(
    currentUser.role === "DOCTOR" ? "Cardiovascular & Thoracic OPD" : "General Medicine"
  );
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState<string | null>(null);

  // Security Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Password Strength Calculation
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const passedCriteria = [hasMinLength, hasNumber, hasUpper, hasSpecial].filter(Boolean).length;
  let strengthLabel = "Weak";
  let strengthColor = "bg-rose-500 text-rose-500";
  let strengthWidth = "w-1/4";

  if (passedCriteria === 2) {
    strengthLabel = "Fair";
    strengthColor = "bg-amber-500 text-amber-500";
    strengthWidth = "w-2/4";
  } else if (passedCriteria === 3) {
    strengthLabel = "Good";
    strengthColor = "bg-blue-500 text-blue-500";
    strengthWidth = "w-3/4";
  } else if (passedCriteria === 4) {
    strengthLabel = "Strong";
    strengthColor = "bg-emerald-500 text-emerald-500";
    strengthWidth = "w-full";
  }

  // Handle Personal Details Update
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPersonal(true);
    setPersonalSuccess(null);

    try {
      const result = await updateProfile({
        name,
        avatar,
      });

      if (result.error) {
        setPersonalSuccess(null);
      } else {
        setPersonalSuccess("Clinical profile successfully updated and synchronized.");
        setTimeout(() => setPersonalSuccess(null), 4000);
      }
    } finally {
      setSavingPersonal(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);

    if (newPassword.length < 8) {
      setSecurityError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords do not match. Please re-enter.");
      return;
    }

    setUpdatingPass(true);
    try {
      const result = await updatePassword(newPassword);
      if (result.error) {
        setSecurityError(result.error);
      } else {
        setSecuritySuccess("Password updated successfully. Your new credentials are now active.");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSecuritySuccess(null), 5000);
      }
    } finally {
      setUpdatingPass(false);
    }
  };

  // Avatar Presets
  const avatarPresets = [
    { label: "Male Clinician", url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250" },
    { label: "Female Specialist", url: "https://images.unsplash.com/photo-1594824813575-f852e6d97c72?auto=format&fit=crop&q=80&w=250" },
    { label: "Patient Portrait 1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250" },
    { label: "Patient Portrait 2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">Home</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white">User Profile & Security</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Clinical Account & Security Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage verified medical identity, biometric contact details, and cryptographic session protection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={currentUser.role === "ADMIN" ? "/admin" : currentUser.role === "DOCTOR" ? "/doctor" : "/patient"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs transition"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Back to Portal</span>
            </Link>
            <button
              onClick={async () => {
                await signOut();
                router.push("/login");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Identity Overview Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={avatar || currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-md bg-white/10"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-teal-800 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-teal-900" />
                </span>
              </div>
              
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{currentUser.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-teal-100 mt-1 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 opacity-80" />
                  <span>{currentUser.email || "clinical.user@medrella.internal"}</span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-teal-200">
                  <span className="flex items-center gap-1">
                    <FileBadge className="w-3.5 h-3.5" />
                    <span>ID: {currentUser.patientId || currentUser.doctorId || currentUser.id.slice(0, 8)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>HIPAA Verified</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Account Status Badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-center sm:min-w-[200px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">Auth Engine</span>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span className="font-extrabold text-sm text-white">
                  {isSupabaseConfigured ? "Supabase Cloud" : "Demo Persona Engine"}
                </span>
              </div>
              <span className="text-[10px] text-teal-100 mt-0.5">Session: Encrypted & Active</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
          <button
            onClick={() => setActiveTab("personal")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "personal"
                ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Personal & Clinical Details</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "security"
                ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Security & Workstation Access</span>
          </button>
        </div>

        {/* Tab 1: Personal & Clinical Information */}
        {activeTab === "personal" && (
          <div className="space-y-6">
            {personalSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{personalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePersonal} className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Identity & Contact Attributes</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update your display name, biometric contact lines, and clinical avatar.
                    </p>
                  </div>
                  <UserIcon className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Legal Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Primary Clinical Email <span className="text-[10px] text-slate-400">(Read-Only)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={currentUser.email || "clinical.user@medrella.internal"}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-medium cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Primary Contact Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                      />
                    </div>
                  </div>

                  {/* Role Specific Field */}
                  {currentUser.role === "PATIENT" ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Blood Group</label>
                      <div className="relative">
                        <HeartPulse className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                        >
                          <option value="A+ Positive">A+ Positive</option>
                          <option value="A- Negative">A- Negative</option>
                          <option value="B+ Positive">B+ Positive</option>
                          <option value="B- Negative">B- Negative</option>
                          <option value="O+ Positive">O+ Positive</option>
                          <option value="O- Negative">O- Negative</option>
                          <option value="AB+ Positive">AB+ Positive</option>
                          <option value="AB- Negative">AB- Negative</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department / Unit</label>
                      <div className="relative">
                        <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Emergency Contact */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Emergency Kin Contact</label>
                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Name (Relationship) - +1 (555) 000-0000"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>
                </div>

                {/* Avatar Configuration & Presets */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Avatar Image URL</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                  />

                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Or choose a preset portrait:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {avatarPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(preset.url)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                            avatar === preset.url
                              ? "bg-emerald-50 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-[10px] font-bold leading-tight">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPersonal}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingPersonal ? "Saving..." : "Save Profile Details"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security & Workstation Access */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {securitySuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{securitySuccess}</span>
              </div>
            )}

            {securityError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-800 dark:text-rose-200 text-xs font-semibold animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{securityError}</span>
              </div>
            )}

            {/* Change Password Card */}
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Update Workstation Password</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enforce complex entropy for clinical EHR and patient chart confidentiality.
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Meter */}
                {newPassword.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Entropy Score</span>
                      <span className={strengthColor}>{strengthLabel}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className={`h-full ${strengthWidth} ${strengthColor.split(" ")[0]} transition-all duration-300`} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                        <CheckCircle2 className="w-3 h-3" /> 8+ Characters
                      </span>
                      <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                        <CheckCircle2 className="w-3 h-3" /> Includes Digits
                      </span>
                      <span className={`flex items-center gap-1 ${hasUpper ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                        <CheckCircle2 className="w-3 h-3" /> Uppercase Letter
                      </span>
                      <span className={`flex items-center gap-1 ${hasSpecial ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                        <CheckCircle2 className="w-3 h-3" /> Special Symbol
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updatingPass}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{updatingPass ? "Updating Password..." : "Update Password"}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Active Clinical Sessions Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Device & Workstation Sessions</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review authenticated endpoints and terminate dangling sessions across emergency terminals.
                  </p>
                </div>
                <Laptop className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="space-y-3">
                {/* Current Active Session */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          Current Web Workstation (Active Now)
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-600 text-white">
                          THIS DEVICE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Chrome on Windows • Port 3000 • Authenticated Token via {isSupabaseConfigured ? "Supabase" : "Demo Session"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Secure Channel
                  </span>
                </div>

                {/* Secondary Tablet Session */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        OPD Room Station 402 Tablet
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Safari on iOS • Last synced 2 hours ago • Token Valid
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400">Idle</span>
                </div>
              </div>

              {/* Sign out all sessions */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    router.push("/login");
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-900/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of All Workstations</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
