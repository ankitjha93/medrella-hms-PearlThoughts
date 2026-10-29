"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/RoleContext";
import {
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) {
        setError(updateError);
      } else {
        setSuccess("Your password has been successfully updated! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set a new secure password for your Medrella HMS clinical portal
          </p>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Password
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

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Strength: {strengthLabel}</span>
                  <span>{strengthScore}/4 requirements met</span>
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

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Updating Password..." : "Save New Password"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel and Return to Sign In
            </Link>
          </div>

        </form>

      </div>
    </div>
  );
}

