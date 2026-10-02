'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Sheet, CheckCircle2, AlertCircle, Link2, Sparkles } from 'lucide-react';

interface SheetConfigModalProps {
  isOpen: boolean;
  currentUrl: string;
  onClose: () => void;
  onSave: (newUrl: string) => void;
}

export const SheetConfigModal: React.FC<SheetConfigModalProps> = ({
  isOpen,
  currentUrl,
  onClose,
  onSave,
}) => {
  const [sheetUrl, setSheetUrl] = useState(
    currentUrl && !currentUrl.includes('YOUR_GOOGLE_SHEET_ID')
      ? currentUrl
      : 'https://docs.google.com/spreadsheets/d/1qh2cn7YRFojrQTm7p_GPhHHqz0Qp13KsUm72_b73JM4/edit'
  );
  const [gasUrl, setGasUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing config on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      fetch('/api/admin/config')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.googleSheetUrl) setSheetUrl(data.googleSheetUrl);
            if (data.googleAppsScriptUrl) setGasUrl(data.googleAppsScriptUrl);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSheet = sheetUrl.trim();
    const trimmedGas = gasUrl.trim();

    if (!trimmedSheet) {
      setError('Please enter a Google Sheet URL.');
      return;
    }

    if (trimmedGas && !trimmedGas.startsWith('https://script.google.com')) {
      setError('The Apps Script URL must start with "https://script.google.com/macros/s/.../exec"');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleAppsScriptUrl: trimmedGas,
          googleSheetUrl: trimmedSheet,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Configuration saved successfully! Form submissions and sync are active.');
        onSave(trimmedSheet);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(data.error || 'Failed to save configuration');
      }
    } catch (err: any) {
      setError(err.message || 'Network error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-gold-400" />
            <h3 className="text-base font-bold">Google Sheets & Apps Script Connection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Google Apps Script Web App URL */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              1. Google Apps Script Web App URL <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              This connects the member submission form directly to your Google Sheet:
            </p>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={gasUrl}
              onChange={(e) => {
                setGasUrl(e.target.value);
                setError(null);
              }}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 bg-white"
            />
            <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
              <span className="font-semibold block text-slate-700">How to get this URL in 30 seconds:</span>
              <p>1. In your Google Sheet, click <strong>Extensions → Apps Script</strong>.</p>
              <p>2. Paste the provided <code>Code.gs</code> and click <strong>Deploy → New deployment</strong>.</p>
              <p>3. Choose <strong>Web app</strong>, set <em>Who has access: Anyone</em>, and copy the Web App URL here.</p>
            </div>
          </div>

          {/* 2. Google Sheet URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              2. Google Spreadsheet URL
            </label>
            <input
              type="url"
              required
              placeholder="https://docs.google.com/spreadsheets/d/1qh2cn7YRFojrQTm7p_GPhHHqz0Qp13KsUm72_b73JM4/edit"
              value={sheetUrl}
              onChange={(e) => {
                setSheetUrl(e.target.value);
                setError(null);
              }}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 bg-white"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />
              <span>{loading ? 'Saving...' : 'Save & Connect'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
