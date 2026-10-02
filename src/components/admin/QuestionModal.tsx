'use client';

import React, { useState, useEffect } from 'react';
import { FormQuestion, QuestionType } from '@/types';
import { X, Plus, Trash2 } from 'lucide-react';

interface QuestionModalProps {
  isOpen: boolean;
  question: FormQuestion | null; // null if adding new
  onClose: () => void;
  onSave: (q: Partial<FormQuestion>) => Promise<void>;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  question,
  onClose,
  onSave,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('Multiple Choice');
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [required, setRequired] = useState(true);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setQuestionText(question.questionText);
      setQuestionType(question.questionType);
      setOptions(question.options && question.options.length > 0 ? question.options : ['Option 1', 'Option 2']);
      setRequired(question.required);
      setPage(question.page || 2);
    } else {
      setQuestionText('');
      setQuestionType('Multiple Choice');
      setOptions(['Option 1', 'Option 2']);
      setRequired(true);
      setPage(2);
    }
    setError(null);
  }, [question, isOpen]);

  if (!isOpen) return null;

  const isChoiceType = ['Multiple Choice', 'Checkboxes', 'Dropdown'].includes(questionType);

  const handleAddOption = () => {
    if (!newOptionInput.trim()) return;
    setOptions([...options, newOptionInput.trim()]);
    setNewOptionInput('');
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (isChoiceType && options.length === 0) {
      setError('Please add at least one option for choice-based questions');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        id: question?.id,
        questionText: questionText.trim(),
        questionType,
        options: isChoiceType ? options : [],
        required,
        page,
        enabled: question ? question.enabled : true,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-base font-bold">
            {question ? 'Edit Question' : 'Add New Question'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Question Text <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Which technical tools are you proficient in?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 bg-white"
              >
                <option value="Short Answer">Short Answer</option>
                <option value="Paragraph">Paragraph</option>
                <option value="Multiple Choice">Multiple Choice</option>
                <option value="Checkboxes">Checkboxes</option>
                <option value="Dropdown">Dropdown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Form Page
              </label>
              <select
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-acme-100 focus:border-acme-600 bg-white"
              >
                <option value={1}>01 Member Details</option>
                <option value={2}>02 Active Participation</option>
              </select>
            </div>
          </div>

          {/* Options for Choice types */}
          {isChoiceType && (
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-700">
                Options
              </label>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...options];
                        updated[idx] = e.target.value;
                        setOptions(updated);
                      }}
                      className="flex-1 p-2 rounded-md border border-slate-300 text-xs text-slate-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="New option name..."
                  value={newOptionInput}
                  onChange={(e) => setNewOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                  className="flex-1 p-2 rounded-md border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          )}

          {/* Required Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="w-4 h-4 text-acme-600 focus:ring-acme-500 border-slate-300 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">
                Mark question as Required
              </span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-acme-700 hover:bg-acme-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
