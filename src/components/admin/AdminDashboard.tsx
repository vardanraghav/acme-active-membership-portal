'use client';

import React, { useState, useMemo } from 'react';
import { SubmissionRecord, FormQuestion, DashboardMetrics } from '@/types';
import { ResponseDetailModal } from './ResponseDetailModal';
import { ManageQuestions } from './ManageQuestions';
import { SheetConfigModal } from './SheetConfigModal';
import {
  Users,
  CheckCircle,
  HelpCircle,
  XCircle,
  GraduationCap,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  Download,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Settings,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface AdminDashboardProps {
  responses: SubmissionRecord[];
  questions: FormQuestion[];
  googleSheetUrl: string;
  onRefresh: () => void;
  isLoading: boolean;
  onUpdateSheetUrl?: (url: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  responses,
  questions,
  googleSheetUrl,
  onRefresh,
  isLoading,
  onUpdateSheetUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'manage_form'>('submissions');
  const [selectedResponse, setSelectedResponse] = useState<SubmissionRecord | null>(null);
  const [deleteConfirmResponse, setDeleteConfirmResponse] = useState<SubmissionRecord | null>(null);
  const [isDeletingResponse, setIsDeletingResponse] = useState(false);
  const [deleteSuccessNotice, setDeleteSuccessNotice] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isGasConfigured, setIsGasConfigured] = useState(true);

  React.useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsGasConfigured(Boolean(data.isGasConfigured));
        }
      })
      .catch(() => {});
  }, [isConfigModalOpen]);

  const handleConfirmDelete = async () => {
    if (!deleteConfirmResponse) return;
    setIsDeletingResponse(true);
    try {
      const res = await fetch('/api/admin/responses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseId: deleteConfirmResponse.id,
          admissionNumber: deleteConfirmResponse.admissionNumber,
          email: deleteConfirmResponse.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDeleteSuccessNotice(`Response from "${deleteConfirmResponse.fullName}" has been deleted.`);
        setDeleteConfirmResponse(null);
        setSelectedResponse(null);
        onRefresh();
        setTimeout(() => setDeleteSuccessNotice(null), 4000);
      } else {
        alert(data.error || 'Failed to delete response');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting response');
    } finally {
      setIsDeletingResponse(false);
    }
  };

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [meetingFilter, setMeetingFilter] = useState('ALL');
  const [eventFilter, setEventFilter] = useState('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Calculate metrics
  const metrics: DashboardMetrics = useMemo(() => {
    let total = responses.length;
    let active = 0;
    let maybe = 0;
    let notContinuing = 0;
    let firstYear = 0;
    let secondYear = 0;

    responses.forEach((r) => {
      const status = (r.continueActiveMember || '').trim().toLowerCase();
      if (status === 'yes') active++;
      else if (status === 'maybe') maybe++;
      else if (status === 'no') notContinuing++;

      const yr = (r.year || '').toLowerCase();
      if (yr.includes('1st')) firstYear++;
      else if (yr.includes('2nd')) secondYear++;
    });

    return { total, active, maybe, notContinuing, firstYear, secondYear };
  }, [responses]);

  // Filtered responses
  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      // Search
      const searchMatch =
        !searchTerm.trim() ||
        r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.branch?.toLowerCase().includes(searchTerm.toLowerCase());

      // Year
      const yearMatch = yearFilter === 'ALL' || r.year === yearFilter;

      // Section
      const sectionMatch = sectionFilter === 'ALL' || r.section === sectionFilter;

      // Status (Active / Maybe / No)
      const statusMatch = statusFilter === 'ALL' || r.continueActiveMember === statusFilter;

      // Meeting
      const meetingMatch = meetingFilter === 'ALL' || r.meetingAttendance === meetingFilter;

      // Event
      const eventMatch = eventFilter === 'ALL' || r.eventParticipation === eventFilter;

      return searchMatch && yearMatch && sectionMatch && statusMatch && meetingMatch && eventMatch;
    });
  }, [responses, searchTerm, yearFilter, sectionFilter, statusFilter, meetingFilter, eventFilter]);

  // Paginated list
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage) || 1;
  const paginatedResponses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResponses.slice(start, start + itemsPerPage);
  }, [filteredResponses, currentPage, itemsPerPage]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredResponses.length === 0) return;

    const headers = [
      'Timestamp',
      'Full Name',
      'Admission Number',
      'Email ID',
      'Phone Number',
      'Year',
      'Branch',
      'Section',
      'Continue as Active Member',
      'Activity Participation',
      'Meeting Attendance',
      'Group Communication',
      'Event Participation',
      'Areas of Interest',
      'Contribution',
      'Suggestions for ACME',
    ];

    const rows = filteredResponses.map((r) => [
      `"${r.timestamp || ''}"`,
      `"${r.fullName || ''}"`,
      `"${r.admissionNumber || ''}"`,
      `"${r.email || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.year || ''}"`,
      `"${r.branch || ''}"`,
      `"${r.section || ''}"`,
      `"${r.continueActiveMember || ''}"`,
      `"${r.activityParticipation || ''}"`,
      `"${r.meetingAttendance || ''}"`,
      `"${r.groupCommunication || ''}"`,
      `"${r.eventParticipation || ''}"`,
      `"${r.areasOfInterest || ''}"`,
      `"${(r.contribution || '').replace(/"/g, '""')}"`,
      `"${(r.suggestions || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ACME_Membership_Responses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Society Administration
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Real-time management for ACME Active Membership applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab buttons */}
          <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'submissions'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Responses ({responses.length})
            </button>
            <button
              onClick={() => setActiveTab('manage_form')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'manage_form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manage Form
            </button>
          </div>

          {/* Open Google Sheet Button */}
          {(() => {
            const isValidSheetUrl = Boolean(
              googleSheetUrl &&
                googleSheetUrl.startsWith('https://docs.google.com/spreadsheets') &&
                !googleSheetUrl.includes('YOUR_GOOGLE_SHEET_ID') &&
                !googleSheetUrl.includes('YOUR_SPREADSHEET_ID')
            );

            if (isValidSheetUrl) {
              return (
                <div className="flex items-center">
                  <a
                    href={googleSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-l-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
                    title="Open Google Sheet in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Google Sheet</span>
                  </a>
                  <button
                    onClick={() => setIsConfigModalOpen(true)}
                    className="px-2 py-2 border border-l-0 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 rounded-r-lg text-emerald-800 transition-colors"
                    title="Change Google Sheet URL"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors shadow-xs animate-pulse"
                title="Connect your Google Sheet"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                <span>Connect Google Sheet</span>
              </button>
            );
          })()}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Refresh Data from Google Sheet"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Setup Warning if Google Apps Script URL is not yet connected */}
      {!isGasConfigured && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Google Apps Script Web App Bridge Not Connected
              </p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Student submissions cannot be recorded to your Google Sheet until your Web App URL is connected.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-white bg-amber-800 hover:bg-amber-900 transition-colors flex-shrink-0 shadow-xs"
          >
            <span>Connect Web App URL</span>
          </button>
        </div>
      )}

      {/* Delete Success Banner */}
      {deleteSuccessNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 text-emerald-900 text-xs font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{deleteSuccessNotice}</span>
          </div>
          <button
            onClick={() => setDeleteSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Render active tab */}
      {activeTab === 'manage_form' ? (
        <ManageQuestions questions={questions} onRefresh={onRefresh} />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Members */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{metrics.total}</p>
              <span className="text-[11px] text-slate-400 font-medium">Submissions</span>
            </div>

            {/* Active Members (Yes) */}
            <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Active</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-700">{metrics.active}</p>
              <span className="text-[11px] text-emerald-600 font-medium">
                {metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0}% Yes
              </span>
            </div>

            {/* Maybe */}
            <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between text-amber-600 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Maybe</span>
                <HelpCircle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-amber-700">{metrics.maybe}</p>
              <span className="text-[11px] text-amber-600 font-medium">Undecided</span>
            </div>

            {/* Not Continuing */}
            <div className="p-4 rounded-xl bg-white border border-rose-200 shadow-xs">
              <div className="flex items-center justify-between text-rose-600 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Not Continuing</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-extrabold text-rose-700">{metrics.notContinuing}</p>
              <span className="text-[11px] text-rose-600 font-medium">Opted No</span>
            </div>

            {/* 1st Year */}
            <div className="p-4 rounded-xl bg-white border border-blue-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">1st Year</span>
                <GraduationCap className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-blue-700">{metrics.firstYear}</p>
              <span className="text-[11px] text-blue-600 font-medium">Freshmen</span>
            </div>

            {/* 2nd Year */}
            <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs">
              <div className="flex items-center justify-between text-indigo-600 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">2nd Year</span>
                <Calendar className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-extrabold text-indigo-700">{metrics.secondYear}</p>
              <span className="text-[11px] text-indigo-600 font-medium">Sophomores</span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student name, admission number, email, or branch..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 bg-white"
                />
              </div>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCSV}
                disabled={filteredResponses.length === 0}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors disabled:opacity-50"
                title="Download currently filtered submissions as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV ({filteredResponses.length})</span>
              </button>
            </div>

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
              {/* Year Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Year
                </label>
                <select
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-acme-600"
                >
                  <option value="ALL">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                </select>
              </div>

              {/* Section Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Section
                </label>
                <select
                  value={sectionFilter}
                  onChange={(e) => {
                    setSectionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-acme-600"
                >
                  <option value="ALL">All Sections</option>
                  <option value="Section 1">Section 1</option>
                  <option value="Section 2">Section 2</option>
                  <option value="Section 3">Section 3</option>
                  <option value="Section 4">Section 4</option>
                </select>
              </div>

              {/* Active / Maybe / No Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Continue Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-acme-600"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Yes">Active (Yes)</option>
                  <option value="Maybe">Maybe</option>
                  <option value="No">Not Continuing (No)</option>
                </select>
              </div>

              {/* Meeting Attendance Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Meeting Attendance
                </label>
                <select
                  value={meetingFilter}
                  onChange={(e) => {
                    setMeetingFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-acme-600"
                >
                  <option value="ALL">All Attendance</option>
                  <option value="Yes, regularly">Yes, regularly</option>
                  <option value="Whenever possible">Whenever possible</option>
                  <option value="Not regularly">Not regularly</option>
                </select>
              </div>

              {/* Event Participation Filter */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Event Participation
                </label>
                <select
                  value={eventFilter}
                  onChange={(e) => {
                    setEventFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-acme-600"
                >
                  <option value="ALL">All Participation</option>
                  <option value="Yes">Yes</option>
                  <option value="Whenever possible">Whenever possible</option>
                  <option value="Occasionally">Occasionally</option>
                </select>
              </div>
            </div>
          </div>

          {/* Responses Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-3">Admission No</th>
                    <th className="py-3 px-3">Year & Section</th>
                    <th className="py-3 px-3">Branch</th>
                    <th className="py-3 px-3 text-center">Active Status</th>
                    <th className="py-3 px-3">Meetings</th>
                    <th className="py-3 px-3">Submitted</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedResponses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        No responses match your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedResponses.map((r) => (
                      <tr
                        key={r.id || r.admissionNumber}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{r.fullName}</div>
                          <div className="text-[11px] text-slate-400">{r.email}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700">
                          {r.admissionNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800">{r.year}</span>
                          <span className="text-slate-400 ml-1">({r.section})</span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 max-w-[140px] truncate" title={r.branch}>
                          {r.branch}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {r.continueActiveMember === 'Yes' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Active
                            </span>
                          )}
                          {r.continueActiveMember === 'Maybe' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Maybe
                            </span>
                          )}
                          {r.continueActiveMember === 'No' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              No
                            </span>
                          )}
                          {!['Yes', 'Maybe', 'No'].includes(r.continueActiveMember) && (
                            <span className="text-slate-400 text-[10px]">
                              {r.continueActiveMember || '—'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-700 text-[11px]">
                          {r.meetingAttendance || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {r.timestamp ? r.timestamp.slice(0, 10) : '—'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => setSelectedResponse(r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded text-acme-700 hover:text-acme-800 bg-acme-50 hover:bg-acme-100 transition-colors"
                              title="View response details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmResponse(r)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                              title="Delete submission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredResponses.length)} of{' '}
                  {filteredResponses.length} members
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="p-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="p-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Response Detail Modal */}
      <ResponseDetailModal
        response={selectedResponse}
        onClose={() => setSelectedResponse(null)}
        onDelete={(r) => {
          setSelectedResponse(null);
          setDeleteConfirmResponse(r);
        }}
      />

      {/* Google Sheet Configuration Modal */}
      <SheetConfigModal
        isOpen={isConfigModalOpen}
        currentUrl={googleSheetUrl}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={(newUrl) => {
          if (onUpdateSheetUrl) {
            onUpdateSheetUrl(newUrl);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
                Delete Member Submission?
              </h3>
              <p className="text-xs text-slate-600 text-center mb-4 leading-relaxed">
                Are you sure you want to permanently delete the response for{' '}
                <strong className="text-slate-900 font-bold">{deleteConfirmResponse.fullName}</strong>{' '}
                ({deleteConfirmResponse.admissionNumber || deleteConfirmResponse.email})?
              </p>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 leading-relaxed mb-5">
                ⚠️ This will permanently remove the response from your local database and the connected Google Sheet.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isDeletingResponse}
                  onClick={() => setDeleteConfirmResponse(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingResponse}
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isDeletingResponse ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
