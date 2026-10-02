import { FormQuestion, QuestionType, MemberFormData, SubmissionRecord } from '@/types';
import { DEFAULT_QUESTIONS_PAGE_2 } from './constants';
import { getRuntimeConfig, saveLocalResponse, getLocalResponses, deleteLocalResponse } from './config';

export function getGasUrl(): string {
  return getRuntimeConfig().googleAppsScriptUrl;
}

export function getSheetUrl(): string {
  return getRuntimeConfig().googleSheetUrl;
}

/**
 * Normalizes question objects from Google Sheets / Apps Script into valid FormQuestion objects.
 * Guarantees a valid string `id`, boolean flags, and proper typed attributes.
 */
export function normalizeQuestion(raw: any, index: number): FormQuestion {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `dynamic_${index + 1}`,
      questionText: `Question ${index + 1}`,
      page: 2,
      questionType: 'Short Answer',
      options: [],
      required: false,
      enabled: true,
      order: index + 1,
    };
  }

  // 1. Resolve ID: preserve existing ID if available, otherwise check questionId / Question ID / fallback
  const rawId = raw.id ?? raw.questionId ?? raw['Question ID'];
  const resolvedId =
    rawId !== undefined && rawId !== null && String(rawId).trim() !== ''
      ? String(rawId).trim()
      : `dynamic_${index + 1}`;

  // 2. Resolve Question Text
  const questionText = String(raw.questionText ?? raw['Question Text'] ?? '').trim();

  // 3. Resolve Page: 1 = Member Details, 2 = Active Participation
  const rawPage = String(raw.page ?? raw['Page/Section'] ?? '').toLowerCase();
  const page =
    rawPage === '1' || rawPage.includes('01') || rawPage.includes('member details')
      ? 1
      : 2;

  // 4. Resolve Question Type
  const rawType = String(raw.questionType ?? raw.type ?? raw['Question Type'] ?? 'Short Answer');
  let questionType: QuestionType = 'Short Answer';
  if (/paragraph/i.test(rawType)) questionType = 'Paragraph';
  else if (/multiple/i.test(rawType)) questionType = 'Multiple Choice';
  else if (/check/i.test(rawType)) questionType = 'Checkboxes';
  else if (/drop/i.test(rawType)) questionType = 'Dropdown';

  // 5. Resolve Options
  let options: string[] = [];
  if (Array.isArray(raw.options)) {
    options = raw.options.map((o: any) => String(o).trim()).filter(Boolean);
  } else if (typeof raw.options === 'string' && raw.options.trim()) {
    try {
      const parsed = JSON.parse(raw.options);
      if (Array.isArray(parsed)) {
        options = parsed.map((o: any) => String(o).trim()).filter(Boolean);
      } else {
        options = raw.options.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    } catch {
      options = raw.options.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  } else if (typeof raw['Options'] === 'string' && raw['Options'].trim()) {
    options = raw['Options'].split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  // 6. Resolve Required
  const rawRequired = raw.required ?? raw['Required'];
  const required =
    rawRequired === true ||
    String(rawRequired).toLowerCase() === 'yes' ||
    String(rawRequired).toLowerCase() === 'true';

  // 7. Resolve Enabled
  const rawEnabled = raw.enabled ?? raw['Enabled'];
  const enabled =
    rawEnabled !== false &&
    String(rawEnabled).toLowerCase() !== 'no' &&
    String(rawEnabled).toLowerCase() !== 'false';

  // 8. Resolve Order
  const order = Number(raw.order ?? raw['Order']) || index + 1;

  return {
    id: resolvedId,
    questionText,
    page,
    questionType,
    options,
    required,
    enabled,
    order,
  };
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
    url.searchParams.set('action', 'questions');
    if (adminAuth) {
      url.searchParams.set('auth', adminAuth);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      redirect: 'follow',
      next: { revalidate: 30 }, // Cache for 30s in Next.js
    });

    if (!response.ok) {
      throw new Error(`GAS returned status ${response.status}`);
    }

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return DEFAULT_QUESTIONS_PAGE_2;
    }

    if (data && data.success && Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions.filter(Boolean).map((q: any, i: number) => normalizeQuestion(q, i));
    }

    return DEFAULT_QUESTIONS_PAGE_2;
  } catch (err) {
    console.error('[ACME GAS] Error fetching questions from Google Sheets:', err);
    return DEFAULT_QUESTIONS_PAGE_2;
  }
}

/**
 * Submit Membership Application to Google Apps Script
 */
export async function submitApplication(
  formData: MemberFormData
): Promise<{ success: boolean; message: string; rawError?: string }> {
  const gasUrl = getGasUrl();

  // If Google Apps Script is not yet configured, save locally for development
  if (!gasUrl) {
    console.warn('[ACME GAS] GOOGLE_APPS_SCRIPT_URL is not set. Saving locally.');
    saveLocalResponse(formData);
    return {
      success: true,
      message: 'Thank you for submitting the ACME Active Membership Form. Your response has been recorded successfully.',
    };
  }

  try {
    const payload = {
      action: 'submitResponse',
      fullName: formData.fullName,
      admissionNumber: formData.admissionNumber,
      email: formData.email,
      phone: formData.phone,
      year: formData.year,
      branch: formData.branch,
      section: formData.section,
      continueActiveMember: formData.continueActiveMember,
      activityParticipation: formData.activityParticipation,
      meetingAttendance: formData.meetingAttendance,
      groupCommunication: formData.groupCommunication,
      eventParticipation: formData.eventParticipation,
      areasOfInterest: formData.areasOfInterest,
      contribution: formData.contribution,
      suggestions: formData.suggestions,
      agreedToTerms: formData.agreedToTerms,
      dynamicAnswers: formData.dynamicAnswers,
    };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error(
        '[ACME GAS] Non-JSON response received from Google Apps Script. HTTP Status:',
        response.status,
        'Response text preview:',
        text.slice(0, 300)
      );

      if (
        text.includes('accounts.google.com') ||
        text.includes('request-access') ||
        response.status === 403 ||
        response.status === 401
      ) {
        console.error(
          '[ACME GAS] PERMISSION RESTRICTION DETECTED: The Google Apps Script Web App is deployed with restricted access. It must be deployed with "Execute as: Me" and "Who has access: Anyone".'
        );
      }

      return {
        success: false,
        message: 'Unable to submit your response. Please check your connection and try again.',
        rawError: `GAS HTTP ${response.status} (non-JSON response). Check Web App permissions.`,
      };
    }

    if (!response.ok || !data.success) {
      console.error('[ACME GAS] Google Apps Script rejected submission:', data);
      return {
        success: false,
        message: data?.message || data?.error || 'Unable to submit your response. Please check your connection and try again.',
        rawError: data?.error || data?.message,
      };
    }

    return {
      success: true,
      message: 'Thank you for submitting the ACME Active Membership Form. Your response has been recorded successfully.',
    };
  } catch (err: any) {
    console.error('[ACME GAS] Error submitting application to GAS:', err);
    return {
      success: false,
      message: 'Unable to submit your response. Please check your connection and try again.',
      rawError: err.message,
    };
  }
}

/**
 * Fetch Member Responses (Admin Only)
 */
export async function fetchMemberResponses(authPassword: string): Promise<SubmissionRecord[]> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return getLocalResponses();
  }

  try {
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'responses');
    url.searchParams.set('auth', authPassword);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`GAS returned ${response.status}`);
    }

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return getLocalResponses();
    }

    if (data && data.success && Array.isArray(data.responses)) {
      return data.responses;
    }
    return getLocalResponses();
  } catch (err) {
    console.error('[ACME GAS] Error fetching member responses:', err);
    return getLocalResponses();
  }
}

/**
 * Perform Question CRUD Actions (Admin Only)
 */
export async function performQuestionAction(
  action: 'addQuestion' | 'updateQuestion' | 'deleteQuestion' | 'toggleQuestion' | 'reorderQuestions',
  payload: Record<string, any>,
  authPassword: string
): Promise<{ success: boolean; message?: string; error?: string; question?: any }> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return {
      success: false,
      error: 'Google Apps Script URL is not configured.',
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
      redirect: 'follow',
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        success: false,
        error: 'Invalid response from Google Sheets bridge.',
      };
    }

    return data;
  } catch (err: any) {
    console.error(`[ACME GAS] Question action ${action} failed:`, err);
    return {
      success: false,
      error: err.message || 'Failed to update Google Sheet.',
    };
  }
}

/**
 * Delete a Member Response (Admin Only)
 */
export async function deleteMemberResponse(
  responseId?: string,
  admissionNumber?: string,
  email?: string,
  authPassword?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const gasUrl = getGasUrl();

  // If local mode
  if (!gasUrl) {
    const success = deleteLocalResponse(responseId, admissionNumber, email);
    if (success) {
      return { success: true, message: 'Response deleted successfully' };
    }
    return { success: false, error: 'Response not found' };
  }

  // If Google Apps Script is configured
  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deleteResponse',
        auth: authPassword,
        responseId,
        admissionNumber,
        email,
      }),
      redirect: 'follow',
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(
        '[ACME GAS] Non-JSON response on deleteResponse. Status:',
        response.status,
        'Snippet:',
        text.slice(0, 200)
      );
      return {
        success: false,
        error: 'Unable to delete response from Google Sheet. Check Google Apps Script deployment permissions.',
      };
    }

    if (data && data.success) {
      deleteLocalResponse(responseId, admissionNumber, email);
      return {
        success: true,
        message: data.message || 'Response deleted successfully',
      };
    }

    return {
      success: false,
      error: data?.error || 'Response not found',
    };
  } catch (err: any) {
    console.error('[ACME GAS] Error deleting response from Google Sheets:', err);
    return {
      success: false,
      error: err.message || 'Network error deleting response from Google Sheets',
    };
  }
}

/**
 * Check Google Apps Script backend health
 */
export async function checkGasHealth(): Promise<{ configured: boolean; healthy: boolean; message?: string }> {
  const gasUrl = getGasUrl();
  if (!gasUrl) {
    return { configured: false, healthy: false, message: 'Google Apps Script URL is not configured.' };
  }

  try {
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'health');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      redirect: 'follow',
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      return { configured: true, healthy: false, message: `HTTP status ${res.status}` };
    }

    const text = await res.text();
    const data = JSON.parse(text);
    return {
      configured: true,
      healthy: Boolean(data && data.success),
      message: data?.message || 'Healthy',
    };
  } catch (err: any) {
    return { configured: true, healthy: false, message: err.message };
  }
}

