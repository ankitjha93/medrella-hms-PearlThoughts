"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "./RoleContext";
import { useTheme } from "./ThemeContext";
import {
  Stethoscope,
  Calendar,
  ShieldCheck,
  ChevronDown,
  Check,
  Sun,
  Moon,
  Menu,
  X,
  HeartPulse,
  Activity,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, switchUser, allUsers } = useRole();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/doctors", label: "Find Doctors", icon: Stethoscope },
    { href: "/patient", label: "My Appointments", icon: Calendar },
    { href: "/doctor", label: "Doctor Dashboard", icon: ShieldCheck, badge: "Provider" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/90 text-slate-100 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Enhanced Brand Logo (Schedula badge removed) */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Custom Medical-Tech Brand Monogram */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 shadow-md shadow-emerald-500/20 group-hover:scale-105 group-hover:shadow-emerald-500/40 transition-all duration-200">
              <div className="w-9 h-9 rounded-[14px] bg-slate-950/20 backdrop-blur-xs flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-extrabold text-xl text-white tracking-tight leading-none group-hover:text-emerald-300 transition-colors">
                  Medrella
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
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
                      ? "bg-slate-800 text-emerald-400 shadow-inner"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Theme Toggle & Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Color Theme"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-sm flex items-center justify-center group"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs font-medium transition-all shadow-sm"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-slate-200 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400 font-semibold capitalize">
                  {currentUser.role.toLowerCase()}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-2 border-b border-slate-800 mb-1.5">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                    Switch Demo Persona
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Test patient vs doctor real-time synchronization
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
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                          isSelected
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "hover:bg-slate-800/80 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-200">{u.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {u.role === "DOCTOR" ? "Physician Dashboard Queue" : "Patient Self-Service"}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Open Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2 animate-in fade-in duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold ${
                  isActive
                    ? "bg-slate-800 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
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

export default Navbar;
