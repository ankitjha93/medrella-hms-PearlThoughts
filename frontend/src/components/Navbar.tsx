'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from './RoleContext';
import { Stethoscope, Calendar, User, Video, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, switchUser, allUsers } = useRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/doctors', label: 'Find Doctors', icon: Stethoscope },
    { href: '/patient', label: 'My Appointments', icon: Calendar },
    { href: '/doctor', label: 'Doctor Dashboard', icon: ShieldCheck, badge: 'Provider' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-violet-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">Medrella</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Schedula
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Appointment Booking System</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-sky-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Demo Switcher & Loom Video */}
        <div className="flex items-center gap-3">
          
          {/* Loom Video Pill */}
          <a
            href="https://www.loom.com/share/9fd476977c814355898fb42bc4f835ad"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 text-xs font-semibold transition-all"
            title="Watch Loom Video Walkthrough"
          >
            <Video className="w-3.5 h-3.5 text-violet-400" />
            <span>Loom Demo</span>
          </a>

          {/* Role Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-sky-500/50 text-xs font-medium transition-all"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-sky-400 capitalize">{currentUser.role.toLowerCase()}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Switch Demo Perspective</div>
                  <div className="text-[10px] text-slate-500">Test cross-dashboard synchronization</div>
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
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          isSelected ? 'bg-sky-500/15 text-sky-400' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{u.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {u.role === 'DOCTOR' ? 'Doctor View (Manage Queue)' : 'Patient View (Bookings)'}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
