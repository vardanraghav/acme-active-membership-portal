'use client';

import React from 'react';
import { CheckCircle2, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { MemberFormData } from '@/types';
import { SOCIETY_INFO } from '@/lib/constants';

interface SuccessViewProps {
  formData: MemberFormData;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  formData,
  onReset,
}) => {
  return (
    <div className="text-center py-8 px-4 max-w-xl mx-auto">
      {/* Success Badge */}
      <div className="relative w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/15 ring-4 ring-gold-400/30">
        <CheckCircle2 className="w-11 h-11 stroke-[2.5]" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
        Application Submitted!
      </h2>

      {/* Verbatim Required Message */}
      <div className="mt-4 text-sm sm:text-base text-emerald-950 font-semibold leading-relaxed bg-emerald-50/90 border border-emerald-300 p-4 sm:p-5 rounded-2xl shadow-xs">
        Thank you for submitting the ACME Active Membership Form. Your response has been recorded successfully.
      </div>

      {/* Submission Receipt Card */}
      <div className="mt-6 p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white text-left space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-navy-950">
            Submission Receipt
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Google Sheets Synchronized
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block">Applicant Name</span>
            <span className="font-semibold text-slate-800">{formData.fullName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Admission Number</span>
            <span className="font-semibold text-slate-800">{formData.admissionNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Year & Section</span>
            <span className="font-semibold text-slate-800">
              {formData.year}, {formData.section}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Active Status</span>
            <span className="font-semibold text-slate-800">
              {formData.continueActiveMember}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
          Department: {SOCIETY_INFO.department}
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Submit Another Response</span>
        </button>
      </div>
    </div>
  );
};
