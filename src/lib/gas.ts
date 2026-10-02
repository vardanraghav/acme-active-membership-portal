import { FormQuestion, MemberFormData, SubmissionRecord } from '@/types';
import { DEFAULT_QUESTIONS_PAGE_2 } from './constants';
import { getRuntimeConfig, saveLocalResponse, getLocalResponses } from './config';

export function getGasUrl(): string {
  return getRuntimeConfig().googleAppsScriptUrl;
}

export function getSheetUrl(): string {
  return getRuntimeConfig().googleSheetUrl;
}

/**
 * Fetch Questions from Google Apps Script
 */
export async function fetchQuestions(adminAuth?: string): Promise<FormQuestion[]> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return DEFAULT_QUESTIONS_PAGE_2;
  }

  try {
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'getQuestions');
    if (adminAuth) {
      url.searchParams.set('auth', adminAuth);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 }, // Cache for 30s in Next.js
    });

    if (!response.ok) {
      throw new Error(`GAS returned status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.success && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }

    return DEFAULT_QUESTIONS_PAGE_2;
  } catch (err) {
    console.error('[ACME GAS] Error fetching questions from Google Sheets:', err);
    return DEFAULT_QUESTIONS_PAGE_2;
  }
}

/**
 * Submit Membership Application to Google Apps Script (or local demo storage if GAS not yet configured)
 */
export async function submitApplication(formData: MemberFormData): Promise<{ success: boolean; message: string }> {
  const gasUrl = getGasUrl();

  // If Google Apps Script is not yet configured, save locally for seamless testing
  if (!gasUrl) {
    saveLocalResponse(formData);
    return {
      success: true,
      message: 'Thank you for submitting the ACME Active Membership Form. Your response has been recorded successfully.',
    };
  }

  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'submit',
        ...formData,
      }),
    });

    if (!response.ok) {
      throw new Error(`GAS returned status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error('[ACME GAS] Error submitting application to GAS:', err);
    return {
      success: false,
      message: 'Unable to submit your response. Please check your connection and try again.',
    };
  }
}

/**
 * Fetch Member Responses (Admin Only)
 */
export async function fetchMemberResponses(authPassword: string): Promise<SubmissionRecord[]> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    // Return local responses for testing
    return getLocalResponses();
  }

  try {
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'getResponses');
    url.searchParams.set('auth', authPassword);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GAS returned ${response.status}`);
    }

    const data = await response.json();
    if (data && data.success && Array.isArray(data.responses)) {
      return data.responses;
    }
    return [];
  } catch (err) {
    console.error('[ACME GAS] Error fetching member responses:', err);
    return getLocalResponses();
  }
}

/**
 * Perform Question CRUD Actions (Admin Only)
 */
export async function performQuestionAction(
  action: 'addQuestion' | 'editQuestion' | 'deleteQuestion' | 'toggleQuestion' | 'reorderQuestions',
  payload: Record<string, any>,
  authPassword: string
): Promise<{ success: boolean; message?: string; error?: string; question?: any }> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return {
      success: false,
      error: 'Google Apps Script URL is not configured in environment variables.',
    };
  }

  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        auth: authPassword,
        ...payload,
      }),
    });

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error(`[ACME GAS] Question action ${action} failed:`, err);
    return {
      success: false,
      error: err.message || 'Failed to update Google Sheet.',
    };
  }
}
