import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MemberForm } from '@/components/member/MemberForm';
import { SyncStatusBadge } from '@/components/SyncStatusBadge';
import { SOCIETY_INFO } from '@/lib/constants';
import { Award, Zap, Cpu } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/95 bg-tech-grid text-slate-900 selection:bg-acme-100 selection:text-acme-900">
      {/* Institutional Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Department & Society Hero Banner */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-dark-circuit text-white border border-navy-800 shadow-xl shadow-slate-900/10">
          {/* Subtle Top Gold Highlight Bar */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold-500/80 to-acme-500" />

          {/* Circuit Decorative Background Overlay (Subtle pure SVG lines) */}
          <div className="absolute inset-0 pointer-events-none opacity-20 select-none overflow-hidden" aria-hidden="true">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="circuit-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
                  <path d="M 10 10 L 50 10 L 70 30 L 110 30 M 70 30 L 70 80 L 90 100 L 110 100 M 30 70 L 30 110" fill="none" stroke="#36aaf5" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="10" cy="10" r="2.5" fill="#f59e0b" />
                  <circle cx="110" cy="30" r="2" fill="#36aaf5" />
                  <circle cx="90" cy="100" r="2.5" fill="#f59e0b" />
                  <circle cx="30" cy="70" r="2" fill="#36aaf5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* ACME Official Logo Emblem Treatment */}
              <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/95 p-2 shadow-lg border border-white/20 flex items-center justify-center backdrop-blur-xs ring-2 ring-gold-500/30">
                <Image
                  src="/images/acme-logo.png"
                  alt="ACME Society Official Logo"
                  width={72}
                  height={72}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-acme-500/15 text-acme-300 text-xs font-semibold mb-2.5 border border-acme-400/30 backdrop-blur-xs">
                  <Award className="w-3.5 h-3.5 text-gold-400" />
                  <span>Official Departmental Society • AY 2026-27</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>{SOCIETY_INFO.name}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium max-w-xl">
                  {SOCIETY_INFO.department}
                </p>
                <p className="text-xs text-gold-400/90 mt-0.5 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                  {SOCIETY_INFO.university}
                </p>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-end text-right border-l border-slate-700/60 pl-6 flex-shrink-0">
              <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-acme-400" />
                Active Membership Intake
              </span>
              <span className="text-sm font-bold text-white mt-1">
                Active Member Registration
              </span>
              <SyncStatusBadge />
            </div>
          </div>
        </div>

        {/* 2-Step Membership Form Container */}
        <section aria-label="Active Membership Registration Form">
          <MemberForm />
        </section>
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
