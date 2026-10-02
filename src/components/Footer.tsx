import React from 'react';
import { SOCIETY_INFO } from '@/lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-white text-base font-bold tracking-tight">
              {SOCIETY_INFO.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {SOCIETY_INFO.department}, {SOCIETY_INFO.university}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Plot No. 2, Sector 17-A, Yamuna Expressway, Greater Noida, Uttar Pradesh 203201
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400">
            <span>Official Society Portal</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>Internal Membership Administration</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} ACME Society, Galgotias University. All rights reserved.</p>
          <p className="text-[11px]">Powered by Next.js & Google Sheets</p>
        </div>
      </div>
    </footer>
  );
};
