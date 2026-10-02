'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { Shield, ExternalLink, LogOut, FileText, Settings } from 'lucide-react';

interface HeaderProps {
  isAdmin?: boolean;
  onLogout?: () => void;
  googleSheetUrl?: string;
  onConfigureSheet?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin = false,
  onLogout,
  googleSheetUrl,
  onConfigureSheet,
}) => {
  const pathname = usePathname();
  const isFormPage = pathname === '/';

  const isValidSheetUrl = Boolean(
    googleSheetUrl &&
      googleSheetUrl.startsWith('https://docs.google.com/spreadsheets') &&
      !googleSheetUrl.includes('YOUR_GOOGLE_SHEET_ID') &&
      !googleSheetUrl.includes('YOUR_SPREADSHEET_ID')
  );

  const handleOpenSheet = (e: React.MouseEvent) => {
    if (!isValidSheetUrl) {
      e.preventDefault();
      if (onConfigureSheet) {
        onConfigureSheet();
      }
    }
  };

  return (
    <header className="bg-white border-t-2 border-t-gold-500 border-b border-slate-200 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Department Branding */}
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <Logo size="md" showText={true} />
          </Link>

          {/* Right Navigation / Controls */}
          <div className="flex items-center gap-3">
            {/* If on Admin Dashboard and Authenticated */}
            {isAdmin ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {isValidSheetUrl ? (
                  <div className="flex items-center">
                    <a
                      href={googleSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-xs md:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
                      title="Open Google Sheet in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Google Sheet</span>
                    </a>
                    {onConfigureSheet && (
                      <button
                        onClick={onConfigureSheet}
                        className="px-2 py-1.5 border border-l-0 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-r-lg text-emerald-800 transition-colors"
                        title="Edit Google Sheet URL"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onConfigureSheet}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors shadow-xs animate-pulse"
                    title="Connect your Google Sheet"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Connect Google Sheet</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              /* Public Header: Discreet Admin Login & Member Navigation */
              <div className="flex items-center gap-2 sm:gap-4">
                {isFormPage ? (
                  <div className="hidden md:flex items-center text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2 animate-pulse"></span>
                    Portal Active • AY 2026-27
                  </div>
                ) : (
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-slate-700 hover:text-acme-700 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Member Form</span>
                  </Link>
                )}

                {/* Discreet Admin Login */}
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                  title="Admin Login"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                  <span className="font-medium">Admin</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
