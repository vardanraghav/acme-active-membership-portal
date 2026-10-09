'use client';

import React, { useState, useEffect } from 'react';
import { MemberFormData, FormQuestion, FormStatusResult } from '@/types';
import { DEFAULT_QUESTIONS_PAGE_2 } from '@/lib/constants';
import { StepIndicator } from './StepIndicator';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { SuccessView } from './SuccessView';
import { Clock, AlertCircle, Calendar, RefreshCw } from 'lucide-react';

const INITIAL_FORM_STATE: MemberFormData = {
  fullName: '',
  admissionNumber: '',
  email: '',
  phone: '',
  year: '',
  branch: '',
  section: '',
  continueActiveMember: '',
  activityParticipation: '',
  meetingAttendance: '',
  groupCommunication: '',
  eventParticipation: '',
  areasOfInterest: [],
  contribution: '',
  suggestions: '',
  dynamicAnswers: {},
  agreedToTerms: false,
};

export const MemberForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<MemberFormData>(INITIAL_FORM_STATE);
  const [dynamicQuestions, setDynamicQuestions] = useState<FormQuestion[]>(DEFAULT_QUESTIONS_PAGE_2);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Form Control status
  const [formStatus, setFormStatus] = useState<FormStatusResult | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  // Fetch form control status
  const checkStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/form-status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setFormStatus(data);
        }
      }
    } catch (err) {
      console.warn('Could not check form status:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // Fetch dynamic questions from backend (Google Apps Script via /api/questions)
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('/api/questions');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
            const normalized: FormQuestion[] = data.questions
              .filter(Boolean)
              .map((q: any, index: number) => ({
                id: String(q.id ?? q.questionId ?? q['Question ID'] ?? `dynamic_${index + 1}`),
                questionText: String(q.questionText ?? q['Question Text'] ?? '').trim(),
                page: String(q.page ?? q['Page/Section'] ?? '').includes('1') ? 1 : 2,
                questionType: q.questionType ?? q.type ?? 'Short Answer',
                options: Array.isArray(q.options) ? q.options : [],
                required: q.required === true || String(q.required).toLowerCase() === 'yes',
                enabled: q.enabled !== false && String(q.enabled).toLowerCase() !== 'no',
                order: Number(q.order ?? q['Order']) || index + 1,
              }));
            setDynamicQuestions(normalized);
          }
        }
      } catch (err) {
        console.warn('Could not load dynamic questions, using defaults', err);
      }
    }
    loadQuestions();
  }, []);

  const updateFormData = (fields: Partial<MemberFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent duplicate clicks
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/member/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const rawText = await response.text();
      let result: any = null;
      try {
        result = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn('Unable to parse JSON from /api/member/submit response:', rawText);
      }

      if (response.ok && result?.success) {
        setIsSubmitted(true);
      } else {
        if (result?.closed) {
          // If the form has been closed by admin in the meantime, refresh status
          checkStatus();
        }

        const errorMsg =
          result?.error ||
          (result?.details ? `Error: ${result.details}` : null) ||
          'Unable to submit your response. Please check your connection and try again.';

        console.warn('[ACME Submission]: Submission did not succeed:', {
          status: response.status,
          error: result?.error,
          details: result?.details,
        });

        setSubmitError(errorMsg);
      }
    } catch (err: any) {
      console.warn('[ACME Submission]: Network error occurred:', err?.message || err);
      setSubmitError('Unable to submit your response. Please check your network connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setCurrentStep(1);
    setIsSubmitted(false);
    setSubmitError(null);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-10">
        <SuccessView formData={formData} onReset={handleReset} />
      </div>
    );
  }

  // Loading status spinner
  if (isLoadingStatus) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-12 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-acme-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Checking form availability...</p>
        </div>
      </div>
    );
  }

  // NOT YET OPEN State
  if (formStatus && formStatus.state === 'NOT_YET_OPEN') {
    return (
      <div className="relative bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-amber-200/80 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
        <div className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            <Clock className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3">
            <span>🟡 NOT YET OPEN</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ACME Active Membership Form — Not Yet Open
          </h2>

          <p className="text-base font-semibold text-slate-700 mt-3 max-w-xl mx-auto">
            Submissions will open at the scheduled time.
          </p>

          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
            {formStatus.message}
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={checkStatus}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Check Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CLOSED State
  if (formStatus && !formStatus.isOpen) {
    return (
      <div className="relative bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-rose-200/80 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700" />
        <div className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold mb-3">
            <span>🔴 CLOSED</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ACME Active Membership Form — Submissions Closed
          </h2>

          <p className="text-base font-semibold text-slate-700 mt-3 max-w-xl mx-auto">
            New responses are currently not being accepted.
          </p>

          <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
            {formStatus.message}
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={checkStatus}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 overflow-hidden">
      {/* Decorative top accent gradient */}
      <div className="h-1.5 w-full bg-gradient-to-r from-navy-900 via-acme-600 to-gold-500" />
      <div className="p-5 md:p-8 lg:p-10">
        {/* Progress Indicator */}
        <StepIndicator
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />

      {/* 2-Step Form with preserved state */}
      {currentStep === 1 && (
        <StepOne
          formData={formData}
          updateFormData={updateFormData}
          onNext={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentStep(2);
          }}
        />
      )}

        {currentStep === 2 && (
          <StepTwo
            formData={formData}
            updateFormData={updateFormData}
            dynamicQuestions={dynamicQuestions}
            onBack={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setCurrentStep(1);
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  );
};
