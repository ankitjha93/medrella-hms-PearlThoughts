"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "./RoleContext";
import { useTheme } from "./ThemeContext";
import { NotificationItem } from "@/lib/types";
import {
  Stethoscope,
  Calendar,
  ShieldCheck,
  Building2,
  ChevronDown,
  Check,
  Sun,
  Moon,
  Menu,
  X,
  HeartPulse,
  Bell,
  Clock,
  FileText,
  Activity,
  CheckCheck,
  LogIn,
  LogOut,
  UserPlus,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, switchUser, allUsers, signOut, isAuthenticated, isSupabaseConfigured } = useRole();
  const { theme, toggleTheme, mounted } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Fetch real-time notifications
  const fetchNotifications = async () => {
    try {
      const uId = currentUser.patientId || currentUser.doctorId || currentUser.id;
      const res = await fetch(`/api/notifications?userId=${uId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    try {
      const uId = currentUser.patientId || currentUser.doctorId || currentUser.id;
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId: uId }),
      });
    } catch {
      // ignore
    }
  };

  const navLinks = [
    { href: "/doctors", label: "Find Doctors", icon: Stethoscope },
    { href: "/patient", label: "Patient EHR", icon: Calendar },
    { href: "/doctor", label: "Doctor OPD", icon: ShieldCheck, badge: "Provider" },
    { href: "/admin", label: "Hospital Admin", icon: Building2, badge: "Ops" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 text-slate-900 border-b border-slate-200/90 dark:bg-slate-950/95 dark:text-slate-100 dark:border-slate-800/90 backdrop-blur-xl shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 shadow-md shadow-emerald-500/20 group-hover:scale-105 group-hover:shadow-emerald-500/40 transition-all duration-200">
              <div className="w-9 h-9 rounded-[14px] bg-slate-950/15 backdrop-blur-xs flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight leading-none group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Medrella
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">
                Clinical Healthcare Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400 shadow-xs"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Notifications, Theme Toggle & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Notification Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              type="button"
              aria-label="Clinical Notifications"
              className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition shadow-xs"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 px-1">
                  <div className="flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Clinical Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border transition ${
                        n.read
                          ? "bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500"
                          : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{n.timestamp}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dual-State Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Toggle Color Theme"
            title={theme === "dark" ? "Currently in Dark mode - Click for Light mode" : "Currently in Light mode - Click for Dark mode"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shadow-xs font-semibold text-xs cursor-pointer select-none bg-slate-100 hover:bg-slate-200 border-slate-300/80 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-200"
          >
            {mounted && theme === "dark" ? (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300" />
                <span className="text-[11px] font-bold text-cyan-400">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 transition-transform duration-300" />
                <span className="text-[11px] font-bold text-amber-600">Light</span>
              </>
            )}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 hover:border-emerald-500/50 text-xs font-medium transition-all shadow-xs"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-slate-900 dark:text-slate-200 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold capitalize">
                  {currentUser.role.toLowerCase()}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* Current User Header */}
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1.5 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                      {currentUser.email}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {currentUser.role}
                  </span>
                </div>

                {/* Account Actions */}
                <div className="space-y-0.5 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1.5">
                  <Link
                    href={currentUser.role === 'ADMIN' ? '/admin' : currentUser.role === 'DOCTOR' ? '/doctor' : '/patient'}
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>My Clinical Portal</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>My Profile & Security</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sign In to Another Account</span>
                  </Link>

                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Demo Switcher Sub-section */}
                <div className="px-2 py-1 mb-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Switch Demo Persona
                  </div>
                </div>

                <div className="space-y-1">
                  {allUsers.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                            : "hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800/80 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-xs leading-none">{u.name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 capitalize font-medium">{u.role.toLowerCase()}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-2 animate-in slide-in-from-top duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 dark:bg-slate-800 dark:text-emerald-400"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
