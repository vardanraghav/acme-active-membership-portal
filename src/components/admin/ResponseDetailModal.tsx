'use client';

import React from 'react';
import { SubmissionRecord } from '@/types';
import { X, User, Mail, Phone, Calendar, BookOpen, Layers, CheckCircle2, Clock, MessageSquare, Lightbulb } from 'lucide-react';

interface ResponseDetailModalProps {
  response: SubmissionRecord | null;
  onClose: () => void;
}

export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  response,
  onClose,
}) => {
  if (!response) return null;

  const getStatusBadge = (status: string) => {
    if (status === 'Yes') {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">Active Member</span>;
    }
    if (status === 'Maybe') {
      return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">Maybe</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-800 border border-rose-200">Not Continuing</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{response.fullName}</h3>
              {getStatusBadge(response.continueActiveMember)}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Admission No: {response.admissionNumber} • Submitted: {response.timestamp}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Section 1: Member Academic & Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-1.5">
              1. Member Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Email Address</span>
                  <a href={`mailto:${response.email}`} className="font-semibold text-acme-700 hover:underline">
                    {response.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Phone Number</span>
                  <a href={`tel:${response.phone}`} className="font-semibold text-slate-900 hover:underline">
                    +91 {response.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Year of Study</span>
                  <span className="font-semibold text-slate-900">{response.year}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Section</span>
                  <span className="font-semibold text-slate-900">{response.section}</span>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Branch</span>
                  <span className="font-semibold text-slate-900">{response.branch}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Active Participation Answers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 border-b border-slate-100 pb-1.5">
              2. Active Participation & Commitment
            </h4>
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">
                  8. Continue as active member of ACME?
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {response.continueActiveMember || 'Not specified'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">
                  9. How actively can you participate?
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {response.activityParticipation || 'Not specified'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">
                  10. Meeting attendance availability
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {response.meetingAttendance || 'Not specified'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">
                  11. Group communication comfort
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {response.groupCommunication || 'Not specified'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">
                  12. Willing to participate in ACME events and activities?
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {response.eventParticipation || 'Not specified'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">
                  13. Areas of Interest
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {response.areasOfInterest
                    ? response.areasOfInterest.split(',').map((area, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800"
                        >
                          {area.trim()}
                        </span>
                      ))
                    : <span className="text-slate-400">None specified</span>}
                </div>
              </div>

              {response.contribution && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    14. Member Contribution & Initiatives
                  </span>
                  <p className="mt-1 text-slate-800 whitespace-pre-line leading-relaxed">
                    {response.contribution}
                  </p>
                </div>
              )}

              {response.suggestions && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    15. Suggestions for ACME
                  </span>
                  <p className="mt-1 text-slate-800 whitespace-pre-line leading-relaxed">
                    {response.suggestions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
