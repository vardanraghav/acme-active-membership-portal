'use client';

import React, { useState } from 'react';
import { MemberFormData } from '@/types';
import { INDIAN_PHONE_REGEX, EMAIL_REGEX } from '@/lib/constants';
import { ArrowRight, User, Hash, Mail, Phone, Calendar, BookOpen, Layers } from 'lucide-react';

interface StepOneProps {
  formData: MemberFormData;
  updateFormData: (fields: Partial<MemberFormData>) => void;
  onNext: () => void;
}

export const StepOne: React.FC<StepOneProps> = ({
  formData,
  updateFormData,
  onNext,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.admissionNumber.trim()) {
      newErrors.admissionNumber = 'Admission Number is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email ID is required.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const cleanPhone = formData.phone.replace(/[\s-+]/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number (starting with 6-9).';
    }

    if (!formData.year) {
      newErrors.year = 'Please select your Year.';
    }

    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch is required.';
    }

    if (!formData.section) {
      newErrors.section = 'Please select your Section.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    } else {
      // Mark all as touched to display errors
      setTouched({
        fullName: true,
        admissionNumber: true,
        email: true,
        phone: true,
        year: true,
        branch: true,
        section: true,
      });
    }
  };

  return (
    <form onSubmit={handleNext} className="space-y-6">
      {/* Page Title & Intro */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
          ACME Active Membership Form
        </h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed bg-blue-50/60 border border-blue-100 p-3.5 rounded-lg text-slate-700">
          “This form is intended to understand your current involvement, interests, and availability in ACME. Please provide genuine responses so that we can plan future activities and responsibilities effectively.”
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Full Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            1. Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              onBlur={() => setTouched({ ...touched, fullName: true })}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errors.fullName && touched.fullName
                  ? 'border-rose-300 ring-rose-100 bg-rose-50/30'
                  : 'border-slate-300 focus:border-acme-600 focus:ring-acme-100 bg-white'
              }`}
            />
          </div>
          {errors.fullName && touched.fullName && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.fullName}</p>
          )}
        </div>

        {/* 2. Admission Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            2. Admission Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Hash className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. 23SCSE1010001"
              value={formData.admissionNumber}
              onChange={(e) => updateFormData({ admissionNumber: e.target.value })}
              onBlur={() => setTouched({ ...touched, admissionNumber: true })}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errors.admissionNumber && touched.admissionNumber
                  ? 'border-rose-300 ring-rose-100 bg-rose-50/30'
                  : 'border-slate-300 focus:border-acme-600 focus:ring-acme-100 bg-white'
              }`}
            />
          </div>
          {errors.admissionNumber && touched.admissionNumber && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.admissionNumber}</p>
          )}
        </div>

        {/* 3. Email ID */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            3. Email ID <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="e.g. student@galgotiasuniversity.edu.in"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              onBlur={() => setTouched({ ...touched, email: true })}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errors.email && touched.email
                  ? 'border-rose-300 ring-rose-100 bg-rose-50/30'
                  : 'border-slate-300 focus:border-acme-600 focus:ring-acme-100 bg-white'
              }`}
            />
          </div>
          {errors.email && touched.email && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
          )}
        </div>

        {/* 4. Phone Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            4. Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              maxLength={10}
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={(e) => {
                const numericOnly = e.target.value.replace(/\D/g, '');
                updateFormData({ phone: numericOnly });
              }}
              onBlur={() => setTouched({ ...touched, phone: true })}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errors.phone && touched.phone
                  ? 'border-rose-300 ring-rose-100 bg-rose-50/30'
                  : 'border-slate-300 focus:border-acme-600 focus:ring-acme-100 bg-white'
              }`}
            />
          </div>
          {errors.phone && touched.phone && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
          )}
        </div>

        {/* 5. Year */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            5. Year <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['1st Year', '2nd Year'] as const).map((yr) => (
              <label
                key={yr}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                  formData.year === yr
                    ? 'border-acme-600 bg-acme-50/50 text-acme-900 ring-1 ring-acme-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="year"
                  value={yr}
                  checked={formData.year === yr}
                  onChange={() => updateFormData({ year: yr })}
                  className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300"
                />
                <span>{yr}</span>
              </label>
            ))}
          </div>
          {errors.year && touched.year && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.year}</p>
          )}
        </div>

        {/* 6. Branch (Manual Short Answer) */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            6. Branch <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Electrical & Electronics Engineering, CSE, etc."
              value={formData.branch}
              onChange={(e) => updateFormData({ branch: e.target.value })}
              onBlur={() => setTouched({ ...touched, branch: true })}
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 ${
                errors.branch && touched.branch
                  ? 'border-rose-300 ring-rose-100 bg-rose-50/30'
                  : 'border-slate-300 focus:border-acme-600 focus:ring-acme-100 bg-white'
              }`}
            />
          </div>
          {errors.branch && touched.branch && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.branch}</p>
          )}
        </div>

        {/* 7. Section */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1.5">
            7. Section <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Section 1', 'Section 2', 'Section 3', 'Section 4'] as const).map((sec) => (
              <label
                key={sec}
                className={`flex items-center justify-center p-2.5 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                  formData.section === sec
                    ? 'border-acme-600 bg-acme-50/50 text-acme-900 ring-1 ring-acme-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="section"
                  value={sec}
                  checked={formData.section === sec}
                  onChange={() => updateFormData({ section: sec })}
                  className="sr-only"
                />
                <span>{sec}</span>
              </label>
            ))}
          </div>
          {errors.section && touched.section && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.section}</p>
          )}
        </div>
      </div>

      {/* Action Button: Next */}
      <div className="pt-4 flex justify-end border-t border-slate-200">
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-acme-700 hover:bg-acme-800 focus:ring-4 focus:ring-acme-200 transition-all shadow-sm"
        >
          <span>Next: Active Participation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
