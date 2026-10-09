import fs from 'fs';
import path from 'path';
import { FormControlSettings, FormStatusResult, FormState } from '@/types';
import { getGasUrl } from './gas';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'form-control-settings.json');

export const DEFAULT_FORM_CONTROL_SETTINGS: FormControlSettings = {
  formMode: 'scheduled',
  manualStatus: 'open',
  startDate: '2026-10-01',
  startTime: '00:00',
  stopDate: '2026-10-31',
  stopTime: '23:59',
  timezone: 'Asia/Kolkata',
  updatedAt: new Date().toISOString(),
};

/**
 * Get current time string in Asia/Kolkata (IST)
 * Returns object with parts and full ISO-like IST string
 */
export function getCurrentIstTime(): {
  dateStr: string;   // YYYY-MM-DD
  timeStr: string;   // HH:mm
  isoIst: string;    // YYYY-MM-DDTHH:mm:ss
  timestamp: number; // millisecond timestamp
} {
  const now = new Date();
  
  // Format into Asia/Kolkata parts
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = partMap.year || '2026';
  const month = partMap.month || '01';
  const day = partMap.day || '01';
  let hour = partMap.hour || '00';
  if (hour === '24') hour = '00';
  const minute = partMap.minute || '00';
  const second = partMap.second || '00';

  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${hour}:${minute}`;
  const isoIst = `${dateStr}T${timeStr}:${second}`;

  return {
    dateStr,
    timeStr,
    isoIst,
    timestamp: now.getTime(),
  };
}

/**
 * Parse an IST date + time string into a Date object / epoch timestamp
 */
export function parseIstDateTime(dateStr: string, timeStr: string): number {
  if (!dateStr || !timeStr) return NaN;
  // Create an ISO 8601 string with +05:30 offset
  const normalizedTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  const isoWithOffset = `${dateStr.trim()}T${normalizedTime.trim()}+05:30`;
  const parsed = new Date(isoWithOffset);
  return parsed.getTime();
}

/**
 * Format timestamp / date in Asia/Kolkata for human-friendly display
 * e.g. "08 October 2026, 08:00 AM IST"
 */
export function formatIstDateTimeHuman(dateStr: string, timeStr: string): string {
  try {
    const epoch = parseIstDateTime(dateStr, timeStr);
    if (isNaN(epoch)) return `${dateStr} ${timeStr} (IST)`;
    
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(epoch)) + ' IST';
  } catch {
    return `${dateStr} ${timeStr} (IST)`;
  }
}

/**
 * Evaluates the current state (OPEN, CLOSED, NOT_YET_OPEN)
 * based on the settings and IST time.
 */
export function evaluateFormStatus(settings: FormControlSettings): FormStatusResult {
  const istNow = getCurrentIstTime();
  const currentEpoch = istNow.timestamp;

  // 1. Manual mode takes absolute precedence
  if (settings.formMode === 'manual') {
    if (settings.manualStatus === 'open') {
      return {
        state: 'OPEN',
        isOpen: true,
        message: 'Form is currently accepting new submissions.',
        settings,
        currentTimeIst: istNow.isoIst,
      };
    } else {
      return {
        state: 'CLOSED',
        isOpen: false,
        message: 'Form is currently closed. New submissions are not being accepted.',
        settings,
        currentTimeIst: istNow.isoIst,
      };
    }
  }

  // 2. Scheduled mode
  const startEpoch = parseIstDateTime(settings.startDate, settings.startTime);
  const stopEpoch = parseIstDateTime(settings.stopDate, settings.stopTime);

  // Fallback if dates are invalid
  if (isNaN(startEpoch) || isNaN(stopEpoch) || stopEpoch <= startEpoch) {
    return {
      state: 'CLOSED',
      isOpen: false,
      message: 'Form schedule is not properly configured. Submissions are temporarily paused.',
      settings,
      currentTimeIst: istNow.isoIst,
    };
  }

  if (currentEpoch < startEpoch) {
    const formattedStart = formatIstDateTimeHuman(settings.startDate, settings.startTime);
    return {
      state: 'NOT_YET_OPEN',
      isOpen: false,
      message: `Form is scheduled to open at ${formattedStart}.`,
      settings,
      currentTimeIst: istNow.isoIst,
    };
  }

  if (currentEpoch >= startEpoch && currentEpoch <= stopEpoch) {
    return {
      state: 'OPEN',
      isOpen: true,
      message: 'Form is currently accepting new submissions.',
      settings,
      currentTimeIst: istNow.isoIst,
    };
  }

  // Past the stop time
  return {
    state: 'CLOSED',
    isOpen: false,
    message: 'Form is currently closed. New submissions are not being accepted.',
    settings,
    currentTimeIst: istNow.isoIst,
  };
}

/**
 * Load local fallback/stored settings from form-control-settings.json
 */
export function getLocalFormControlSettings(): FormControlSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_FORM_CONTROL_SETTINGS,
        ...parsed,
      };
    }
  } catch (err) {
    // ignore read error
  }
  return { ...DEFAULT_FORM_CONTROL_SETTINGS };
}

/**
 * Save settings to local persistent file form-control-settings.json
 */
export function saveLocalFormControlSettings(settings: Partial<FormControlSettings>): FormControlSettings {
  const current = getLocalFormControlSettings();
  const merged: FormControlSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write form-control-settings.json:', err);
  }

  return merged;
}

/**
 * Retrieve form control settings from Google Apps Script if available,
 * falling back to local file storage.
 * Reads either from native getFormSettings action or from the persistent __FORM_CONTROL__ record.
 */
export async function getFormControlSettings(): Promise<FormControlSettings> {
  const gasUrl = getGasUrl();
  if (gasUrl) {
    try {
      // 1. Try native getFormSettings if supported by deployed GAS
      const url = new URL(gasUrl);
      url.searchParams.set('action', 'getFormSettings');

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        redirect: 'follow',
        cache: 'no-store',
      });

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && data.success && data.settings) {
            saveLocalFormControlSettings(data.settings);
            return {
              ...DEFAULT_FORM_CONTROL_SETTINGS,
              ...data.settings,
            };
          }
        } catch {}
      }

      // 2. Read from persistent __FORM_CONTROL__ row in Questions sheet (works with current deployed GAS)
      const qUrl = new URL(gasUrl);
      qUrl.searchParams.set('action', 'questions');

      const qRes = await fetch(qUrl.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        redirect: 'follow',
        cache: 'no-store',
      });

      if (qRes.ok) {
        const qText = await qRes.text();
        try {
          const qData = JSON.parse(qText);
          if (qData && qData.success && Array.isArray(qData.questions)) {
            const row = qData.questions.find((x: any) => {
              const id = String(x.id ?? x.questionId ?? x['Question ID'] ?? '').trim();
              return id === '__FORM_CONTROL__';
            });

            if (row) {
              const rawPayload = row.questionText ?? row['Question Text'];
              if (rawPayload && typeof rawPayload === 'string') {
                const parsedSettings = JSON.parse(rawPayload);
                if (parsedSettings && typeof parsedSettings === 'object') {
                  saveLocalFormControlSettings(parsedSettings);
                  return {
                    ...DEFAULT_FORM_CONTROL_SETTINGS,
                    ...parsedSettings,
                  };
                }
              }
            }
          }
        } catch {}
      }
    } catch (err) {
      // Network/GAS error, fallback to local file
    }
  }

  return getLocalFormControlSettings();
}

/**
 * Persist form control settings to Google Apps Script and local storage.
 * Works with both updated Code.gs and current production deployment via updateQuestion.
 */
export async function updateFormControlSettings(
  newSettings: Partial<FormControlSettings>,
  authPassword?: string
): Promise<{ success: boolean; settings: FormControlSettings; message?: string; error?: string }> {
  // 1. Save locally first
  const updated = saveLocalFormControlSettings(newSettings);

  // 2. If GAS is configured, sync to Google Sheet
  const gasUrl = getGasUrl();
  if (gasUrl && authPassword) {
    try {
      // Try native updateFormSettings
      const res = await fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateFormSettings',
          auth: authPassword,
          settings: updated,
        }),
        redirect: 'follow',
      });

      let handled = false;
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && data.success) {
            handled = true;
          }
        } catch {}
      }

      // If native action was not recognized by production GAS deployment,
      // sync to the __FORM_CONTROL__ record in the Questions sheet
      if (!handled) {
        const payloadJson = JSON.stringify(updated);
        // Try updateQuestion first
        const updateRes = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'updateQuestion',
            auth: authPassword,
            question: {
              questionId: '__FORM_CONTROL__',
              questionText: payloadJson,
              page: 2,
              questionType: 'Text',
              options: [],
              required: false,
              enabled: false,
              order: 999,
            },
          }),
          redirect: 'follow',
        });

        const updateText = await updateRes.text();
        let updateOk = false;
        try {
          const uData = JSON.parse(updateText);
          if (uData && uData.success) updateOk = true;
        } catch {}

        // If row doesn't exist yet, insert via addQuestion
        if (!updateOk) {
          await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'addQuestion',
              auth: authPassword,
              question: {
                questionId: '__FORM_CONTROL__',
                questionText: payloadJson,
                page: 2,
                questionType: 'Text',
                options: [],
                required: false,
                enabled: false,
                order: 999,
              },
            }),
            redirect: 'follow',
          });
        }
      }
    } catch (err) {
      // Network error, local save still holds
    }
  }

  return {
    success: true,
    settings: updated,
    message: 'Form settings updated successfully.',
  };
}

/**
 * Quick helper to get current evaluated status
 */
export async function getFormStatus(): Promise<FormStatusResult> {
  const settings = await getFormControlSettings();
  return evaluateFormStatus(settings);
}
