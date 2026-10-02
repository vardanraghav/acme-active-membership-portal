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
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm ring-8 ring-emerald-50">
        <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
        Application Submitted!
      </h2>

      {/* Verbatim Required Message */}
      <p className="mt-3 text-base text-slate-700 font-medium leading-relaxed bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-xl text-emerald-950">
        Thank you for submitting the ACME Active Membership Form. Your response has been recorded successfully.
      </p>

      {/* Submission Receipt Card */}
      <div className="mt-6 p-5 rounded-xl border border-slate-200 bg-slate-50/80 text-left space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Submission Summary
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5" />
            Saved to Google Sheets
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
