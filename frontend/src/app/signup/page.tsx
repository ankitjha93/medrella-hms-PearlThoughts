"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/RoleContext";
import { Role } from "@/lib/types";
import {
  HeartPulse,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Stethoscope,
  Building,
  Award,
  Check,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, signInWithOAuth } = useAuth();

  const [role, setRole] = useState<Role>("PATIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  
  // Doctor specific fields
  const [specialty, setSpecialty] = useState("Cardiology");
  const [hospital, setHospital] = useState("Medrella Central Hospital");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password strength calculations
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const strengthScore = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabel = 
    strengthScore === 4 ? "Strong" : strengthScore >= 2 ? "Moderate" : "Weak";
  const strengthColor = 
    strengthScore === 4 
      ? "bg-emerald-500" 
      : strengthScore >= 2 
      ? "bg-amber-500" 
      : "bg-rose-500";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Medical Data Confidentiality Terms.");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await signUp({
        email,
        password,
        name,
        phone,
        role,
        specialty: role === "DOCTOR" ? specialty : undefined,
        hospital: role === "DOCTOR" ? hospital : undefined,
        licenseNumber: role === "DOCTOR" ? licenseNumber : undefined,
      });

      if (signUpError) {
        setError(signUpError);
      } else {
        setSuccess(
          `Account created successfully as ${role === 'DOCTOR' ? 'Doctor Specialist' : 'Patient'}! Redirecting to your dashboard...`
        );
        setTimeout(() => {
          router.push(role === "DOCTOR" ? "/doctor" : "/patient");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError(null);
    setOauthLoading(provider);
    try {
      const { error: oauthError } = await signInWithOAuth(provider);
      if (oauthError) {
        setError(oauthError);
      }
    } catch (err: any) {
      setError(err.message || `Failed to initiate ${provider} sign up.`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 mb-1">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Register for Medrella HMS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create your clinical profile for online appointments, prescriptions & EMR access
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole("PATIENT")}
            className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              role === "PATIENT"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient Account</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("DOCTOR")}
            className={`py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              role === "DOCTOR"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor Specialist</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name {role === "DOCTOR" && "(with Title, e.g. Dr. Arthur Pendelton)"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder={role === "DOCTOR" ? "Dr. Arthur Pendelton, MD" : "e.g. Eleanor Vance"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Doctor Specific Credential Fields */}
          {role === "DOCTOR" && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Specialist Credential Details</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Department
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Medical License ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MD-LIC-94821"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password Input & Strength Meter */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Progress */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Password Strength: {strengthLabel}</span>
                  <span>{strengthScore}/4 criteria</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${(strengthScore / 4) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                  <span className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-600 font-bold" : ""}`}>
                    <Check className="w-3 h-3" /> 8+ characters
                  </span>
                  <span className={`flex items-center gap-1 ${hasUppercase ? "text-emerald-600 font-bold" : ""}`}>
                    <Check className="w-3 h-3" /> Uppercase letter
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber ? "text-emerald-600 font-bold" : ""}`}>
                    <Check className="w-3 h-3" /> Number included
                  </span>
                  <span className={`flex items-center gap-1 ${hasSpecial ? "text-emerald-600 font-bold" : ""}`}>
                    <Check className="w-3 h-3" /> Special character
                  </span>
                </div>
              </div>
            )}
          </div>

          <label className="flex items-start gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              I agree to the Medrella Terms of Service and consent to confidential electronic healthcare record management.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Registering Profile..." : `Create ${role === 'DOCTOR' ? 'Doctor Specialist' : 'Patient'} Account`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Social Registration */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative text-center">
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase tracking-wider font-bold text-slate-400 relative z-10">
              Or Sign Up With
            </span>
            <div className="absolute top-2 left-0 right-0 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={oauthLoading !== null}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              disabled={oauthLoading !== null}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          Already registered on Medrella?{" "}
          <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
