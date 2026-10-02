import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MemberForm } from '@/components/member/MemberForm';
import { SOCIETY_INFO } from '@/lib/constants';
import { Sparkles, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Institutional Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Department & Society Banner */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-950 via-navy-900 to-acme-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-navy-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/20">
              <Award className="w-3.5 h-3.5 text-gold-400" />
              <span>Official Departmental Society • AY 2026-27</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {SOCIETY_INFO.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-medium max-w-xl">
              {SOCIETY_INFO.department}
            </p>
            <p className="text-xs text-gold-400/90 mt-0.5 font-medium">
              {SOCIETY_INFO.university}
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-end text-right border-l border-slate-700/60 pl-6">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Membership Registration
            </span>
            <span className="text-sm font-bold text-white mt-1">
              Active Member Intake
            </span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Google Sheets Sync</span>
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
