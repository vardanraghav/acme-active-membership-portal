'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Layers } from 'lucide-react';

export const SyncStatusBadge: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setIsHealthy(Boolean(data && data.healthy));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsHealthy(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isHealthy) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-300 mt-2.5 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/40 shadow-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="font-medium">Verified Google Sheets Sync</span>
      </div>
    );
  }

  // Neutral state when unverified or offline
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2.5 bg-slate-800/70 px-2.5 py-1 rounded-full border border-slate-700/60 shadow-xs">
      <Layers className="w-3.5 h-3.5 text-acme-400" />
      <span className="font-medium">Google Sheets Sync</span>
    </div>
  );
};
