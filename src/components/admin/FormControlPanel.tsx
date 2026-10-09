'use client';

import React, { useState, useEffect } from 'react';
import { FormControlSettings, FormStatusResult, FormState } from '@/types';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Square,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Save,
  Info,
} from 'lucide-react';

interface FormControlPanelProps {
  onStatusChange?: () => void;
}

export const FormControlPanel: React.FC<FormControlPanelProps> = ({ onStatusChange }) => {
  const [settings, setSettings] = useState<FormControlSettings | null>(null);
  const [formStatus, setFormStatus] = useState<FormStatusResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form input state
  const [startDate, setStartDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [stopDate, setStopDate] = useState<string>('');
  const [stopTime, setStopTime] = useState<string>('');

  const fetchSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/form-control');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
          setFormStatus(data.status);
          setStartDate(data.settings.startDate || '');
          setStartTime(data.settings.startTime || '');
          setStopDate(data.settings.stopDate || '');
          setStopTime(data.settings.stopTime || '');
        }
      } else {
        setErrorMessage('Failed to load Form Control settings.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAction = async (action: 'saveSchedule' | 'openNow' | 'closeNow' | 'useSchedule') => {
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    // Client-side validation for schedule saving
    if (action === 'saveSchedule') {
      if (!startDate || !startTime || !stopDate || !stopTime) {
        setErrorMessage('All schedule fields (Start Date, Start Time, Stop Date, Stop Time) are required.');
        setIsSaving(false);
        return;
      }

      // Check chronological order
      const startIso = `${startDate}T${startTime}:00+05:30`;
      const stopIso = `${stopDate}T${stopTime}:00+05:30`;
      const startEpoch = new Date(startIso).getTime();
      const stopEpoch = new Date(stopIso).getTime();

      if (isNaN(startEpoch) || isNaN(stopEpoch)) {
        setErrorMessage('Invalid date or time format.');
        setIsSaving(false);
        return;
      }

      if (stopEpoch <= startEpoch) {
        setErrorMessage('Stop Date & Time must be strictly later than Start Date & Time.');
        setIsSaving(false);
        return;
      }
    }

    try {
      const payload: any = { action };
      if (action === 'saveSchedule') {
        payload.startDate = startDate;
        payload.startTime = startTime;
        payload.stopDate = stopDate;
        payload.stopTime = stopTime;
      }

      const res = await fetch('/api/admin/form-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        setFormStatus(data.status);
        if (action === 'openNow') {
          setSuccessMessage('Form is now OPEN manually. Submissions are active.');
        } else if (action === 'closeNow') {
          setSuccessMessage('Form is now CLOSED manually. Submissions are blocked.');
        } else if (action === 'useSchedule') {
          setSuccessMessage('Automatic schedule mode activated.');
        } else {
          setSuccessMessage('Schedule saved successfully. Form is now running on schedule.');
        }
        if (onStatusChange) onStatusChange();
      } else {
        setErrorMessage(data.error || 'Failed to update Form Control settings.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to server.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(null), 6000);
    }
  };

  const renderStatusBadge = (state?: FormState) => {
    if (state === 'OPEN') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          🟢 OPEN
        </span>
      );
    }
    if (state === 'NOT_YET_OPEN') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          🟡 NOT YET OPEN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        🔴 CLOSED
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-acme-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading Form Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 md:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center shadow-xs">
            <Sliders className="w-5 h-5 text-acme-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">FORM CONTROL</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                IST (Asia/Kolkata)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control submission acceptance, configure start/stop schedules, or override manually.
            </p>
          </div>
        </div>

        {/* Current Live Status Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
              Current Status
            </span>
            <div className="mt-0.5">{renderStatusBadge(formStatus?.state)}</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mx-6 mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-2 text-emerald-900 text-xs font-semibold shadow-xs animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mx-6 mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-300 flex items-center gap-2 text-rose-900 text-xs font-semibold shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="p-5 md:p-6 space-y-6">
        {/* Status Message Display */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-acme-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-800">
                {formStatus?.message || 'Form status message unavailable.'}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mode:{' '}
                <strong className="text-slate-700 capitalize">
                  {settings?.formMode === 'manual' ? `Manual Override (${settings.manualStatus.toUpperCase()})` : 'Automatic Schedule'}
                </strong>
                {formStatus?.currentTimeIst && (
                  <span> • Server IST Time: {formStatus.currentTimeIst.replace('T', ' ')}</span>
                )}
              </p>
            </div>
          </div>

          {/* If manual override is active, offer "Use Schedule" button */}
          {settings?.formMode === 'manual' && (
            <button
              onClick={() => handleAction('useSchedule')}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs flex-shrink-0"
              title="Return to automatic schedule"
            >
              <RotateCcw className="w-3.5 h-3.5 text-acme-600" />
              <span>Use Schedule</span>
            </button>
          )}
        </div>

        {/* Schedule Inputs */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Schedule Configuration
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date & Time */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Start Schedule (IST)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-acme-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-acme-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Stop Date & Time */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                Stop Schedule (IST)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">
                    Stop Date
                  </label>
                  <input
                    type="date"
                    value={stopDate}
                    onChange={(e) => setStopDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-acme-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">
                    Stop Time
                  </label>
                  <input
                    type="time"
                    value={stopTime}
                    onChange={(e) => setStopTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-acme-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Save Schedule Button */}
          <button
            onClick={() => handleAction('saveSchedule')}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>SAVE SCHEDULE</span>
          </button>

          {/* Quick Manual Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleAction('openNow')}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-xs disabled:opacity-50"
              title="Force open form immediately, overriding schedule"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700" />
              <span>OPEN FORM NOW</span>
            </button>

            <button
              onClick={() => handleAction('closeNow')}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition-colors shadow-xs disabled:opacity-50"
              title="Force close form immediately, blocking submissions"
            >
              <Square className="w-3.5 h-3.5 fill-rose-700 text-rose-700" />
              <span>CLOSE FORM NOW</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
