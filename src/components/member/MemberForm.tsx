'use client';

import React, { useState, useEffect } from 'react';
import { MemberFormData, FormQuestion } from '@/types';
import { DEFAULT_QUESTIONS_PAGE_2 } from '@/lib/constants';
import { StepIndicator } from './StepIndicator';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { SuccessView } from './SuccessView';

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

  // Fetch dynamic questions from backend (Google Apps Script via /api/questions)
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('/api/questions');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
            setDynamicQuestions(data.questions);
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
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(
          result.error || 'Unable to submit your response. Please check your connection and try again.'
        );
      }
    } catch (err) {
      console.error('Submission network error:', err);
      setSubmitError('Unable to submit your response. Please check your connection and try again.');
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 md:p-8 lg:p-10">
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
  );
};
