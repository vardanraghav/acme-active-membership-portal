import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 1 or 2
  onStepClick?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
}) => {
  const steps = [
    { number: 1, label: '01 Member Details', desc: 'Personal & Academic info' },
    { number: 2, label: '02 Active Participation', desc: 'Involvement & Interests' },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between max-w-xl mx-auto relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-12 right-12 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-acme-600 transition-all duration-300"
            style={{ width: currentStep === 2 ? '100%' : '0%' }}
          />
        </div>

        {steps.map((step) => {
          const isDone = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div
              key={step.number}
              onClick={() => {
                // Allow clicking back to step 1 from step 2
                if (step.number < currentStep && onStepClick) {
                  onStepClick(step.number);
                }
              }}
              className={`flex flex-col items-center relative z-10 ${
                step.number < currentStep ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 border-2 ${
                  isDone
                    ? 'bg-acme-700 text-white border-acme-700 shadow-sm'
                    : isCurrent
                    ? 'bg-white text-acme-700 border-acme-700 shadow-md ring-4 ring-acme-100'
                    : 'bg-white text-slate-400 border-slate-300'
                }`}
              >
                {isDone ? <Check className="w-5 h-5 stroke-[2.5]" /> : step.number}
              </div>

              <div className="mt-2 text-center">
                <p
                  className={`text-xs md:text-sm font-semibold tracking-tight ${
                    isCurrent ? 'text-acme-900 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
