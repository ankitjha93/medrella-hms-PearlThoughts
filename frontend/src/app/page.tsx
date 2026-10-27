import Link from "next/link";

export default function Home() {
  const modules = [
    { id: 1, name: "User Module", table: "users", color: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-500/40", text: "text-indigo-400" },
    { id: 2, name: "Patient Module", table: "patients", color: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/40", text: "text-emerald-400" },
    { id: 3, name: "Doctor Module", table: "doctors", color: "from-amber-500/20 to-amber-500/5", border: "border-amber-500/40", text: "text-amber-400" },
    { id: 4, name: "Availability Module", table: "doctor_availability", color: "from-pink-500/20 to-pink-500/5", border: "border-pink-500/40", text: "text-pink-400" },
    { id: 5, name: "Appointment Module", table: "appointments", color: "from-sky-500/20 to-sky-500/5", border: "border-sky-500/40", text: "text-sky-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
            S
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white">Schedula HMS</h1>
            <p className="text-xs text-slate-400">PearlThoughts Internship Project</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://www.loom.com/share/9fd476977c814355898fb42bc4f835ad"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition-all"
          >
            <span>▶</span> Watch Loom Video
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
          Next.js 15 App Router &bull; TypeScript &bull; Tailwind CSS
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
          Hello, <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">World!</span>
        </h2>

        <p className="max-w-2xl text-slate-400 text-base sm:text-lg mb-10 leading-relaxed">
          Welcome to the <strong>Schedula</strong> Healthcare Management System frontend application. 
          This project implements the foundational appointment scheduling architecture for the PearlThoughts internship program.
        </p>

        {/* Video & Documentation Action Cards */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16 w-full max-w-xl">
          <a
            href="https://www.loom.com/share/9fd476977c814355898fb42bc4f835ad"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[240px] px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/60 hover:bg-slate-850 text-white font-medium text-sm flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">▶</span>
              <div className="text-left">
                <div className="font-semibold text-xs text-violet-400 uppercase tracking-wider">Video Walkthrough</div>
                <div className="text-sm">Watch Loom Demo</div>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-white transition-colors">&rarr;</span>
          </a>

          <a
            href="https://github.com/ankitjha93/schedula-hms-PearlThoughts"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[240px] px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-850 text-white font-medium text-sm flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">⌥</span>
              <div className="text-left">
                <div className="font-semibold text-xs text-sky-400 uppercase tracking-wider">GitHub Repo</div>
                <div className="text-sm">View Source Code</div>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-white transition-colors">&rarr;</span>
          </a>
        </div>

        {/* Modules Grid */}
        <div className="w-full text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-center">
            Schedule Project Module &bull; 5 Core Entities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {modules.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-xl border ${m.border} bg-gradient-to-b ${m.color} backdrop-blur-sm`}
              >
                <div className={`text-xs font-bold ${m.text} mb-1`}>Module 0{m.id}</div>
                <div className="text-sm font-semibold text-white mb-2">{m.name}</div>
                <div className="text-xs font-mono text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800 inline-block">
                  {m.table}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-500 bg-slate-900/30">
        Schedula HMS &bull; PearlThoughts Internship &bull; Branch: <code className="text-sky-400">feature/schedule-er-diagram</code>
      </footer>
    </div>
  );
}
