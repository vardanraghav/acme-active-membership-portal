'use client';

import React, { useState } from 'react';
import { FormQuestion } from '@/types';
import { QuestionModal } from './QuestionModal';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface ManageQuestionsProps {
  questions: FormQuestion[];
  onRefresh: () => void;
}

export const ManageQuestions: React.FC<ManageQuestionsProps> = ({
  questions,
  onRefresh,
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<FormQuestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showBanner = (text: string, type: 'success' | 'error') => {
    setBannerMessage({ text, type });
    setTimeout(() => setBannerMessage(null), 5000);
  };

  const handleOpenAdd = () => {
    setSelectedQuestion(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (q: FormQuestion) => {
    setSelectedQuestion(q);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (qData: Partial<FormQuestion>) => {
    const isEdit = !!qData.id;
    const action = isEdit ? 'editQuestion' : 'addQuestion';

    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        question: qData,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save question');
    }

    showBanner(
      isEdit ? 'Question updated in Google Sheets!' : 'Question added to Google Sheets!',
      'success'
    );
    onRefresh();
  };

  const handleToggleEnable = async (q: FormQuestion) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleQuestion',
          questionId: q.id,
          enabled: !q.enabled,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showBanner(`Question ${!q.enabled ? 'enabled' : 'disabled'} successfully`, 'success');
        onRefresh();
      } else {
        showBanner(data.error || 'Failed to update question status', 'error');
      }
    } catch (err: any) {
      showBanner(err.message || 'Error updating question', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteQuestion',
          questionId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showBanner('Question deleted permanently from Google Sheets', 'success');
        setDeleteConfirmId(null);
        onRefresh();
      } else {
        showBanner(data.error || 'Failed to delete question', 'error');
      }
    } catch (err: any) {
      showBanner(err.message || 'Error deleting question', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const reordered = [...questions];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const orderedIds = reordered.map((item) => item.id);

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reorderQuestions',
          orderedIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showBanner('Questions order updated in Google Sheets', 'success');
        onRefresh();
      } else {
        showBanner(data.error || 'Failed to reorder questions', 'error');
      }
    } catch (err: any) {
      showBanner(err.message || 'Error reordering questions', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Manage Form Questions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure dynamic membership questions stored in the Google Sheets Questions tab.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-acme-700 hover:bg-acme-800 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {bannerMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Questions List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="py-3 px-3 w-16 text-center">Order</th>
                <th className="py-3 px-4">Question Text</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Section</th>
                <th className="py-3 px-3 text-center">Required</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {questions.map((q, idx) => (
                <tr
                  key={q.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    !q.enabled ? 'bg-slate-50/40 text-slate-400' : ''
                  }`}
                >
                  {/* Order & Move Buttons */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-bold text-slate-700 w-4">{idx + 1}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={idx === 0 || actionLoading}
                          onClick={() => handleMoveOrder(idx, 'up')}
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === questions.length - 1 || actionLoading}
                          onClick={() => handleMoveOrder(idx, 'down')}
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Question Text */}
                  <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs md:max-w-md">
                    <div>
                      <p className="line-clamp-2">{q.questionText}</p>
                      {q.options && q.options.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          Options: {q.options.join(', ')}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Question Type */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {q.questionType}
                    </span>
                  </td>

                  {/* Page/Section */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-500">
                      {q.page === 1 ? '01 Details' : '02 Participation'}
                    </span>
                  </td>

                  {/* Required */}
                  <td className="py-3 px-3 text-center">
                    {q.required ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Required
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400">
                        Optional
                      </span>
                    )}
                  </td>

                  {/* Status & Enable/Disable Toggle */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleToggleEnable(q)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        q.enabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                      title={q.enabled ? 'Click to disable' : 'Click to enable'}
                    >
                      {q.enabled ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 text-slate-600 hover:text-acme-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(q.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">Delete Question?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently remove this question from Google Sheets?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleDelete(deleteConfirmId)}
                className="w-1/2 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal (Add / Edit) */}
      <QuestionModal
        isOpen={isModalOpen}
        question={selectedQuestion}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
      />
    </div>
  );
};
