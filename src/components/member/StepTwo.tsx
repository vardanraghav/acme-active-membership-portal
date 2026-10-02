'use client';

import React, { useState } from 'react';
import { MemberFormData, FormQuestion } from '@/types';
import { ArrowLeft, Send, AlertCircle, CheckSquare, Square, Info } from 'lucide-react';

interface StepTwoProps {
  formData: MemberFormData;
  updateFormData: (fields: Partial<MemberFormData>) => void;
  dynamicQuestions: FormQuestion[];
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

const STANDARD_QUESTION_IDS = new Set([
  'q_continue',
  'q_activity',
  'q_meeting',
  'q_communication',
  'q_event',
  'q_areas',
  'q_contribution',
  'q_suggestions',
  'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7',
  'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15',
]);

function isStandardQuestion(q: FormQuestion | any): boolean {
  if (!q) return true;
  const id = String(q.id ?? q.questionId ?? '').trim().toLowerCase();
  if (id.startsWith('q_')) return true;
  if (STANDARD_QUESTION_IDS.has(id)) return true;

  // Text-based fallback to guarantee standard questions are never duplicated
  const text = String(q.questionText || '').trim().toLowerCase();
  if (
    text.includes('continue as an active member') ||
    text.includes('participate in acme activities') ||
    text.includes('attend acme meetings') ||
    text.includes('messages in acme groups') ||
    text.includes('participate in acme events') ||
    text.includes('areas of acme are you interested') ||
    text.includes('contribute or take part in') ||
    text.includes('see more of in acme') ||
    text.includes('full name') ||
    text.includes('admission number') ||
    text.includes('email id') ||
    text.includes('phone number') ||
    text === 'year' ||
    text === 'branch' ||
    text === 'section'
  ) {
    return true;
  }

  // Page 1 questions belong on Step 1, not Step 2
  const pageStr = String(q.page || '').toLowerCase();
  if (pageStr === '1' || pageStr.includes('01') || pageStr.includes('member details')) {
    return true;
  }

  return false;
}

export const StepTwo: React.FC<StepTwoProps> = ({
  formData,
  updateFormData,
  dynamicQuestions,
  onBack,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const areasOptions = [
    'Technical Activities',
    'Event Management',
    'Workshops',
    'Design & Content',
    'Social Media',
    'Documentation',
    'Coordination',
    'Other',
  ];

  const handleAreaToggle = (area: string) => {
    const current = formData.areasOfInterest || [];
    const exists = current.includes(area);
    const updated = exists ? current.filter((a) => a !== area) : [...current, area];
    updateFormData({ areasOfInterest: updated });
    setTouched({ ...touched, areasOfInterest: true });
  };

  const handleDynamicAnswer = (qId: string, val: string | string[]) => {
    const currentDynamic = formData.dynamicAnswers || {};
    updateFormData({
      dynamicAnswers: {
        ...currentDynamic,
        [qId]: val,
      },
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.continueActiveMember) {
      newErrors.continueActiveMember = 'Please select whether you wish to continue as an active member.';
    }

    if (!formData.activityParticipation) {
      newErrors.activityParticipation = 'Please select how actively you can participate.';
    }

    if (!formData.meetingAttendance) {
      newErrors.meetingAttendance = 'Please select your meeting attendance availability.';
    }

    if (!formData.groupCommunication) {
      newErrors.groupCommunication = 'Please select your communication preference.';
    }

    if (!formData.eventParticipation) {
      newErrors.eventParticipation = 'Please select your event participation availability.';
    }

    if (!formData.areasOfInterest || formData.areasOfInterest.length === 0) {
      newErrors.areasOfInterest = 'Please select at least one area of interest.';
    }

    // Validate any custom dynamic questions marked required
    extraQuestions.forEach((q) => {
      if (q.required && q.enabled) {
        const ans = formData.dynamicAnswers?.[q.id];
        if (!ans || (Array.isArray(ans) && ans.length === 0) || (typeof ans === 'string' && !ans.trim())) {
          newErrors[q.id] = `This field is required.`;
        }
      }
    });

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must acknowledge and agree before submitting.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Normalize incoming questions safely so malformed records cannot crash the page
  const normalizedQuestions: FormQuestion[] = (dynamicQuestions || [])
    .filter(Boolean)
    .map((q, index) => ({
      ...q,
      id: String(q.id ?? (q as any).questionId ?? (q as any)['Question ID'] ?? `dynamic_${index + 1}`),
      questionText: String(q.questionText ?? (q as any)['Question Text'] ?? '').trim(),
      page: Number(q.page) || 2,
      questionType: q.questionType ?? (q as any).type ?? 'Short Answer',
      options: Array.isArray(q.options) ? q.options : [],
      required: q.required === true || String(q.required).toLowerCase() === 'yes',
      enabled: q.enabled !== false && String(q.enabled).toLowerCase() !== 'no',
      order: Number(q.order) || index + 1,
    }));

  // Custom dynamic questions that are NOT part of the standard questions
  const extraQuestions = normalizedQuestions.filter(
    (q) => q.id && !isStandardQuestion(q) && q.enabled
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit();
    } else {
      setTouched({
        continueActiveMember: true,
        activityParticipation: true,
        meetingAttendance: true,
        groupCommunication: true,
        eventParticipation: true,
        areasOfInterest: true,
        agreedToTerms: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl md:text-2xl font-extrabold text-navy-950 tracking-tight">
          Your Participation in ACME
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
          Please answer the questions below genuinely to help the society coordinate team responsibilities.
        </p>
      </div>

      {/* Error notification if submit failed */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-rose-900 font-semibold leading-relaxed">
            {submitError}
          </div>
        </div>
      )}

      {/* 8. Continue as active member */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3">
        <label className="block text-xs sm:text-sm font-bold text-slate-900">
          8. Do you want to continue as an active member of ACME? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Yes', 'Maybe', 'No'] as const).map((opt) => {
            const isSelected = formData.continueActiveMember === opt;
            return (
              <label
                key={opt}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-150 shadow-2xs ${
                  isSelected
                    ? opt === 'Yes'
                      ? 'border-emerald-600 bg-emerald-950 text-white ring-2 ring-emerald-400/40 shadow-sm'
                      : opt === 'Maybe'
                      ? 'border-amber-600 bg-amber-950 text-white ring-2 ring-amber-400/40 shadow-sm'
                      : 'border-rose-600 bg-rose-950 text-white ring-2 ring-rose-400/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="continueActiveMember"
                  value={opt}
                  checked={isSelected}
                  onChange={() => updateFormData({ continueActiveMember: opt })}
                  className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        {errors.continueActiveMember && touched.continueActiveMember && (
          <p className="text-xs text-rose-600 font-medium">{errors.continueActiveMember}</p>
        )}
      </div>

      {/* 9. Active Participation */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3">
        <label className="block text-xs sm:text-sm font-bold text-slate-900">
          9. How actively can you participate in ACME activities? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Regularly', 'Whenever my schedule allows', 'Occasionally'] as const).map((opt) => {
            const isSelected = formData.activityParticipation === opt;
            return (
              <label
                key={opt}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-150 shadow-2xs ${
                  isSelected
                    ? 'border-navy-900 bg-navy-950 text-white ring-2 ring-gold-400/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="activityParticipation"
                  value={opt}
                  checked={isSelected}
                  onChange={() => updateFormData({ activityParticipation: opt })}
                  className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        {errors.activityParticipation && touched.activityParticipation && (
          <p className="text-xs text-rose-600 font-medium">{errors.activityParticipation}</p>
        )}
      </div>

      {/* 10. Meeting Attendance */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3">
        <label className="block text-xs sm:text-sm font-bold text-slate-900">
          10. Are you able to attend ACME meetings when required? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Yes, regularly', 'Whenever possible', 'Not regularly'] as const).map((opt) => {
            const isSelected = formData.meetingAttendance === opt;
            return (
              <label
                key={opt}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-150 shadow-2xs ${
                  isSelected
                    ? 'border-navy-900 bg-navy-950 text-white ring-2 ring-gold-400/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="meetingAttendance"
                  value={opt}
                  checked={isSelected}
                  onChange={() => updateFormData({ meetingAttendance: opt })}
                  className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        {errors.meetingAttendance && touched.meetingAttendance && (
          <p className="text-xs text-rose-600 font-medium">{errors.meetingAttendance}</p>
        )}
      </div>

      {/* 11. Group Communication */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3">
        <label className="block text-xs sm:text-sm font-bold text-slate-900">
          11. Are you comfortable staying updated and responding to important messages in ACME groups? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Yes', 'Usually', 'Not always'] as const).map((opt) => {
            const isSelected = formData.groupCommunication === opt;
            return (
              <label
                key={opt}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-150 shadow-2xs ${
                  isSelected
                    ? 'border-navy-900 bg-navy-950 text-white ring-2 ring-gold-400/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="groupCommunication"
                  value={opt}
                  checked={isSelected}
                  onChange={() => updateFormData({ groupCommunication: opt })}
                  className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        {errors.groupCommunication && touched.groupCommunication && (
          <p className="text-xs text-rose-600 font-medium">{errors.groupCommunication}</p>
        )}
      </div>

      {/* 12. Event Participation */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3">
        <label className="block text-xs sm:text-sm font-bold text-slate-900">
          12. Are you willing to participate in ACME events and activities when required? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Yes', 'Whenever possible', 'Occasionally'] as const).map((opt) => {
            const isSelected = formData.eventParticipation === opt;
            return (
              <label
                key={opt}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-150 shadow-2xs ${
                  isSelected
                    ? 'border-navy-900 bg-navy-950 text-white ring-2 ring-gold-400/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="eventParticipation"
                  value={opt}
                  checked={isSelected}
                  onChange={() => updateFormData({ eventParticipation: opt })}
                  className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
        {errors.eventParticipation && touched.eventParticipation && (
          <p className="text-xs text-rose-600 font-medium">{errors.eventParticipation}</p>
        )}
      </div>

      {/* 13. Areas of Interest (Checkboxes, Multi-select) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3">
        <label className="block text-xs sm:text-sm font-bold text-slate-900">
          13. Which areas of ACME are you interested in? <span className="text-rose-500">*</span>
          <span className="text-xs font-normal text-slate-500 ml-2">(Select all that apply)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {areasOptions.map((area) => {
            const isSelected = (formData.areasOfInterest || []).includes(area);
            return (
              <label
                key={area}
                onClick={() => handleAreaToggle(area)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-150 select-none shadow-2xs ${
                  isSelected
                    ? 'border-navy-900 bg-navy-950 text-white ring-2 ring-gold-400/40 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-gold-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                <span>{area}</span>
              </label>
            );
          })}
        </div>
        {errors.areasOfInterest && touched.areasOfInterest && (
          <p className="text-xs text-rose-600 font-medium">{errors.areasOfInterest}</p>
        )}
      </div>

      {/* 14. Contribution */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-2">
        <label className="block text-xs sm:text-sm font-bold text-slate-900">
          14. Is there anything you would like to contribute or take part in through ACME?{' '}
          <span className="text-xs font-normal text-slate-500">(Optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Share any specific skills, ideas, project initiatives, or roles you wish to undertake..."
          value={formData.contribution}
          onChange={(e) => updateFormData({ contribution: e.target.value })}
          className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-acme-500/15 focus:border-acme-600 transition-all bg-white shadow-2xs"
        />
      </div>

      {/* 15. Suggestions for ACME */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-2">
        <label className="block text-xs sm:text-sm font-bold text-slate-900">
          15. What would you like to see more of in ACME?{' '}
          <span className="text-xs font-normal text-slate-500">(Optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Workshops, industrial visits, hackathons, robotics labs, guest lectures, etc..."
          value={formData.suggestions}
          onChange={(e) => updateFormData({ suggestions: e.target.value })}
          className="w-full p-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-acme-500/15 focus:border-acme-600 transition-all bg-white shadow-2xs"
        />
      </div>

      {/* Dynamic Extra Questions Managed by Admin */}
      {extraQuestions.length > 0 && (
        <div className="pt-6 border-t border-slate-200 space-y-6">
          <h3 className="text-base font-bold text-navy-950">Additional Questions</h3>
          {extraQuestions.map((q, idx) => (
            <div key={q.id} className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white space-y-3 shadow-2xs">
              <label className="block text-xs sm:text-sm font-bold text-slate-900">
                {15 + idx + 1}. {q.questionText} {q.required && <span className="text-rose-500">*</span>}
              </label>

              {q.questionType === 'Short Answer' && (
                <input
                  type="text"
                  value={formData.dynamicAnswers?.[q.id] || ''}
                  onChange={(e) => handleDynamicAnswer(q.id, e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-acme-500/15 focus:border-acme-600 bg-white"
                />
              )}

              {q.questionType === 'Paragraph' && (
                <textarea
                  rows={3}
                  value={formData.dynamicAnswers?.[q.id] || ''}
                  onChange={(e) => handleDynamicAnswer(q.id, e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-acme-500/15 focus:border-acme-600 bg-white"
                />
              )}

              {q.questionType === 'Multiple Choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {q.options.map((opt) => {
                    const isSelected = formData.dynamicAnswers?.[q.id] === opt;
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'border-navy-900 bg-navy-950 text-white ring-2 ring-gold-400/40'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={isSelected}
                          onChange={() => handleDynamicAnswer(q.id, opt)}
                          className="w-4 h-4 text-acme-600 border-slate-300"
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.questionType === 'Checkboxes' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt) => {
                    const currentArr = Array.isArray(formData.dynamicAnswers?.[q.id])
                      ? (formData.dynamicAnswers?.[q.id] as string[])
                      : [];
                    const isChecked = currentArr.includes(opt);

                    return (
                      <label
                        key={opt}
                        onClick={() => {
                          const updated = isChecked
                            ? currentArr.filter((i) => i !== opt)
                            : [...currentArr, opt];
                          handleDynamicAnswer(q.id, updated);
                        }}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-semibold cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'border-navy-900 bg-navy-950 text-white ring-2 ring-gold-400/40'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-gold-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {q.questionType === 'Dropdown' && (
                <select
                  value={formData.dynamicAnswers?.[q.id] || ''}
                  onChange={(e) => handleDynamicAnswer(q.id, e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-acme-500/15 focus:border-acme-600 bg-white"
                >
                  <option value="">Select an option</option>
                  {q.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {errors[q.id] && <p className="text-xs text-rose-600 font-medium">{errors[q.id]}</p>}
            </div>
          ))}
        </div>
      )}

      {/* 5. FINAL CONFIRMATION */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 border-l-4 border-l-gold-500 shadow-2xs space-y-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
            “I understand that ACME membership requires active participation in meetings, group communication, events, and assigned activities. I acknowledge that if I do not actively participate or remain consistently inactive, ACME may discontinue my membership.”
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-3 border-t border-amber-200/80">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => updateFormData({ agreedToTerms: e.target.checked })}
            className="w-4 h-4 text-acme-700 focus:ring-gold-500 border-amber-400 rounded cursor-pointer"
          />
          <span className="text-xs sm:text-sm font-bold text-slate-900 select-none">
            I agree <span className="text-rose-600">*</span>
          </span>
        </label>
        {errors.agreedToTerms && touched.agreedToTerms && (
          <p className="text-xs text-rose-600 font-medium">{errors.agreedToTerms}</p>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="pt-6 flex items-center justify-between border-t border-slate-200/80 gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 focus:ring-4 focus:ring-slate-200 transition-all disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 1</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-navy-950 via-navy-900 to-acme-700 hover:from-navy-900 hover:to-acme-800 focus:ring-4 focus:ring-acme-500/20 transition-all duration-200 shadow-md shadow-navy-950/20 hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Application</span>
              <Send className="w-4 h-4 text-gold-400" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
