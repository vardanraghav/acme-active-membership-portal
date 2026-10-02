'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11 md:h-12 md:w-12',
    lg: 'h-16 w-16 md:h-20 md:w-20',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex-shrink-0 ${sizeClasses[size]} rounded-lg overflow-hidden flex items-center justify-center`}>
        {!imageError ? (
          <img
            src="/images/acme-logo.png"
            alt="ACME Society Logo"
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          /* Institutional Departmental Fallback Emblem */
          <div className="w-full h-full bg-gradient-to-br from-navy-900 via-navy-800 to-acme-800 border border-gold-500/40 rounded-lg flex flex-col items-center justify-center p-1 shadow-sm">
            <span className="text-[11px] font-extrabold tracking-wider text-white">ACME</span>
            <span className="text-[7px] font-semibold text-gold-400 tracking-tighter">EEE • GU</span>
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 tracking-tight text-base md:text-lg">
              ACME Society
            </span>
          </div>
          <span className="text-xs text-slate-600 font-medium line-clamp-1">
            DEECE Department of Electrical, Electronics and Communication Engineering
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:block">
            Galgotias University
          </span>
        </div>
      )}
    </div>
  );
};
