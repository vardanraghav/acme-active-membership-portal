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
    dynamicQuestions.forEach((q) => {
      // Check if it's a dynamic question not part of the standard 8
      if (q.required && !q.id.startsWith('q_')) {
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

  // Custom dynamic questions that are NOT part of the standard 8
  const extraQuestions = dynamicQuestions.filter((q) => !q.id.startsWith('q_') && q.enabled);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          Your Participation in ACME
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Please answer the questions below genuinely to help the society coordinate team responsibilities.
        </p>
      </div>

      {/* Error notification if submit failed */}
      {submitError && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-rose-800 font-medium">
            {submitError}
          </div>
        </div>
      )}

      {/* 8. Continue as active member */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          8. Do you want to continue as an active member of ACME? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Yes', 'Maybe', 'No'] as const).map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                formData.continueActiveMember === opt
                  ? 'border-acme-600 bg-acme-50/50 text-acme-900 ring-1 ring-acme-600 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="continueActiveMember"
                value={opt}
                checked={formData.continueActiveMember === opt}
                onChange={() => updateFormData({ continueActiveMember: opt })}
                className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {errors.continueActiveMember && touched.continueActiveMember && (
          <p className="text-xs text-rose-600 font-medium">{errors.continueActiveMember}</p>
        )}
      </div>

      {/* 9. Active Participation */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          9. How actively can you participate in ACME activities? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Regularly', 'Whenever my schedule allows', 'Occasionally'] as const).map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                formData.activityParticipation === opt
                  ? 'border-acme-600 bg-acme-50/50 text-acme-900 ring-1 ring-acme-600 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="activityParticipation"
                value={opt}
                checked={formData.activityParticipation === opt}
                onChange={() => updateFormData({ activityParticipation: opt })}
                className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {errors.activityParticipation && touched.activityParticipation && (
          <p className="text-xs text-rose-600 font-medium">{errors.activityParticipation}</p>
        )}
      </div>

      {/* 10. Meeting Attendance */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          10. Are you able to attend ACME meetings when required? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Yes, regularly', 'Whenever possible', 'Not regularly'] as const).map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                formData.meetingAttendance === opt
                  ? 'border-acme-600 bg-acme-50/50 text-acme-900 ring-1 ring-acme-600 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="meetingAttendance"
                value={opt}
                checked={formData.meetingAttendance === opt}
                onChange={() => updateFormData({ meetingAttendance: opt })}
                className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {errors.meetingAttendance && touched.meetingAttendance && (
          <p className="text-xs text-rose-600 font-medium">{errors.meetingAttendance}</p>
        )}
      </div>

      {/* 11. Group Communication */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          11. Are you comfortable staying updated and responding to important messages in ACME groups? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Yes', 'Usually', 'Not always'] as const).map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                formData.groupCommunication === opt
                  ? 'border-acme-600 bg-acme-50/50 text-acme-900 ring-1 ring-acme-600 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="groupCommunication"
                value={opt}
                checked={formData.groupCommunication === opt}
                onChange={() => updateFormData({ groupCommunication: opt })}
                className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {errors.groupCommunication && touched.groupCommunication && (
          <p className="text-xs text-rose-600 font-medium">{errors.groupCommunication}</p>
        )}
      </div>

      {/* 12. Event Participation */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
          12. Are you willing to participate in ACME events and activities when required? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['Yes', 'Whenever possible', 'Occasionally'] as const).map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                formData.eventParticipation === opt
                  ? 'border-acme-600 bg-acme-50/50 text-acme-900 ring-1 ring-acme-600 font-semibold'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="eventParticipation"
                value={opt}
                checked={formData.eventParticipation === opt}
                onChange={() => updateFormData({ eventParticipation: opt })}
                className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
        {errors.eventParticipation && touched.eventParticipation && (
          <p className="text-xs text-rose-600 font-medium">{errors.eventParticipation}</p>
        )}
      </div>

      {/* 13. Areas of Interest (Checkboxes, Multi-select) */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-800">
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
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'border-acme-600 bg-acme-50/60 text-acme-900 ring-1 ring-acme-600 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-acme-700 flex-shrink-0" />
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
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-800">
          14. Is there anything you would like to contribute or take part in through ACME?{' '}
          <span className="text-xs font-normal text-slate-500">(Optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Share any specific skills, ideas, project initiatives, or roles you wish to undertake..."
          value={formData.contribution}
          onChange={(e) => updateFormData({ contribution: e.target.value })}
          className="w-full p-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 transition-all bg-white"
        />
      </div>

      {/* 15. Suggestions for ACME */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-800">
          15. What would you like to see more of in ACME?{' '}
          <span className="text-xs font-normal text-slate-500">(Optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Workshops, industrial visits, hackathons, robotics labs, guest lectures, etc..."
          value={formData.suggestions}
          onChange={(e) => updateFormData({ suggestions: e.target.value })}
          className="w-full p-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 transition-all bg-white"
        />
      </div>

      {/* Dynamic Extra Questions Managed by Admin */}
      {extraQuestions.length > 0 && (
        <div className="pt-6 border-t border-slate-200 space-y-6">
          <h3 className="text-base font-bold text-slate-800">Additional Questions</h3>
          {extraQuestions.map((q, idx) => (
            <div key={q.id} className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800">
                {15 + idx + 1}. {q.questionText} {q.required && <span className="text-rose-500">*</span>}
              </label>

              {q.questionType === 'Short Answer' && (
                <input
                  type="text"
                  value={formData.dynamicAnswers?.[q.id] || ''}
                  onChange={(e) => handleDynamicAnswer(q.id, e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 bg-white"
                />
              )}

              {q.questionType === 'Paragraph' && (
                <textarea
                  rows={3}
                  value={formData.dynamicAnswers?.[q.id] || ''}
                  onChange={(e) => handleDynamicAnswer(q.id, e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 bg-white"
                />
              )}

              {q.questionType === 'Multiple Choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm cursor-pointer ${
                        formData.dynamicAnswers?.[q.id] === opt
                          ? 'border-acme-600 bg-acme-50 text-acme-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={formData.dynamicAnswers?.[q.id] === opt}
                        onChange={() => handleDynamicAnswer(q.id, opt)}
                        className="w-4 h-4 text-acme-600 border-slate-300"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.questionType === 'Checkboxes' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm cursor-pointer select-none ${
                          isChecked
                            ? 'border-acme-600 bg-acme-50 text-acme-900 font-semibold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-acme-700" />
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
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 bg-white"
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
      <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
            “I understand that ACME membership requires active participation in meetings, group communication, events, and assigned activities. I acknowledge that if I do not actively participate or remain consistently inactive, ACME may discontinue my membership.”
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-amber-200/80">
          <input
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => updateFormData({ agreedToTerms: e.target.checked })}
            className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-amber-400 rounded"
          />
          <span className="text-sm font-bold text-slate-900 select-none">
            I agree <span className="text-rose-600">*</span>
          </span>
        </label>
        {errors.agreedToTerms && touched.agreedToTerms && (
          <p className="text-xs text-rose-600 font-medium">{errors.agreedToTerms}</p>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200 gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 focus:ring-2 focus:ring-slate-300 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 1</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-lg text-sm font-semibold text-white bg-acme-700 hover:bg-acme-800 focus:ring-4 focus:ring-acme-200 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Application</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
