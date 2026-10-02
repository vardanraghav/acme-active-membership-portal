'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { SheetConfigModal } from '@/components/admin/SheetConfigModal';
import { SubmissionRecord, FormQuestion } from '@/types';
import { DEFAULT_QUESTIONS_PAGE_2 } from '@/lib/constants';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [responses, setResponses] = useState<SubmissionRecord[]>([]);
  const [questions, setQuestions] = useState<FormQuestion[]>(DEFAULT_QUESTIONS_PAGE_2);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string>('');
  const [isHeaderSheetModalOpen, setIsHeaderSheetModalOpen] = useState(false);

  // Load sheet URL from localStorage or environment
  useEffect(() => {
    const saved = localStorage.getItem('acme_google_sheet_url');
    if (saved) {
      setGoogleSheetUrl(saved);
    } else if (process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL) {
      setGoogleSheetUrl(process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL);
    }
  }, []);

  const handleUpdateSheetUrl = (newUrl: string) => {
    setGoogleSheetUrl(newUrl);
    localStorage.setItem('acme_google_sheet_url', newUrl);
  };

  // Check existing session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      setIsAuthenticated(Boolean(data.authenticated));
    } catch (err) {
      setIsAuthenticated(false);
    }
  }, []);

  // Fetch responses and questions
  const loadDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch responses
      const resResponses = await fetch('/api/admin/responses');
      if (resResponses.ok) {
        const data = await resResponses.json();
        if (data.success && Array.isArray(data.responses)) {
          setResponses(data.responses);
        }
      }

      // 2. Fetch questions
      const resQuestions = await fetch('/api/admin/questions');
      if (resQuestions.ok) {
        const qData = await resQuestions.json();
        if (qData.success && Array.isArray(qData.questions) && qData.questions.length > 0) {
          setQuestions(qData.questions);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      setResponses([]);
    }
  };

  // Loading session check
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-acme-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <Header
        isAdmin={isAuthenticated}
        onLogout={handleLogout}
        googleSheetUrl={googleSheetUrl}
        onConfigureSheet={() => setIsHeaderSheetModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isAuthenticated ? (
          /* Authentication Screen */
          <AdminLogin
            onSuccess={() => {
              setIsAuthenticated(true);
            }}
          />
        ) : (
          /* Protected Admin Dashboard */
          <AdminDashboard
            responses={responses}
            questions={questions}
            googleSheetUrl={googleSheetUrl}
            onRefresh={loadDashboardData}
            isLoading={isLoadingData}
            onUpdateSheetUrl={handleUpdateSheetUrl}
          />
        )}
      </main>

      {/* Sheet Configuration Modal for Header Action */}
      <SheetConfigModal
        isOpen={isHeaderSheetModalOpen}
        currentUrl={googleSheetUrl}
        onClose={() => setIsHeaderSheetModalOpen(false)}
        onSave={handleUpdateSheetUrl}
      />

      <Footer />
    </div>
  );
}
