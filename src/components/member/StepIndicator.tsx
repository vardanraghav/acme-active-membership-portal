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
    { number: 1, label: '01 Member Details', desc: 'Academic & Contact Info' },
    { number: 2, label: '02 Active Participation', desc: 'Involvement & Interests' },
  ];

  return (
    <div className="w-full mb-8 pb-6 border-b border-slate-200/80">
      <div className="flex items-center justify-between max-w-xl mx-auto relative px-2">
        {/* Connecting progress track line */}
        <div className="absolute top-5 left-10 right-10 h-1 bg-slate-200 rounded-full -z-0 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-navy-900 via-acme-600 to-gold-500 transition-all duration-500 ease-out rounded-full"
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
                if (step.number < currentStep && onStepClick) {
                  onStepClick(step.number);
                }
              }}
              className={`flex flex-col items-center relative z-10 select-none ${
                step.number < currentStep ? 'cursor-pointer group' : 'cursor-default'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  isDone
                    ? 'bg-emerald-600 text-white border-2 border-emerald-600 shadow-emerald-500/20 group-hover:bg-emerald-700'
                    : isCurrent
                    ? 'bg-navy-950 text-white border-2 border-gold-400 ring-4 ring-gold-400/25 shadow-lg shadow-navy-950/20 scale-105'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isDone ? (
                  <Check className="w-5 h-5 stroke-[2.8]" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              <div className="mt-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />}
                  <p
                    className={`text-xs sm:text-sm tracking-tight transition-colors ${
                      isCurrent
                        ? 'text-navy-950 font-extrabold'
                        : isDone
                        ? 'text-slate-800 font-semibold group-hover:text-acme-700'
                        : 'text-slate-400 font-medium'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5 font-medium">
                  {isDone ? 'Completed • Click to edit' : step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
