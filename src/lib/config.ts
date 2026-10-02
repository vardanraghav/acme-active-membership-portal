import fs from 'fs';
import path from 'path';
import { MemberFormData, SubmissionRecord } from '@/types';

export interface RuntimeConfig {
  googleAppsScriptUrl: string;
  googleSheetUrl: string;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), 'runtime-config.json');
const RESPONSES_FILE_PATH = path.join(process.cwd(), 'local-responses.json');

export function getRuntimeConfig(): RuntimeConfig {
  let fileConfig: Partial<RuntimeConfig> = {};

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      fileConfig = JSON.parse(content);
    }
  } catch (err) {
    // Ignore read errors
  }

  const gasUrl =
    fileConfig.googleAppsScriptUrl ||
    process.env.GOOGLE_APPS_SCRIPT_URL ||
    process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbz9eRpJs4rA9JTbwwo87auL2Kqu8_ItTicabZniN7vgkU9sIV3gEMU0Sg23EpQEh_jgVQ/exec';

  const sheetUrl =
    fileConfig.googleSheetUrl ||
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL ||
    'https://docs.google.com/spreadsheets/d/11Y7ZV6EdoyKfUP2KBD9TJl3Liacx5JMDQYy3T7AP5bs/edit';

  return {
    googleAppsScriptUrl: gasUrl,
    googleSheetUrl: sheetUrl,
  };
}

export function saveRuntimeConfig(newConfig: Partial<RuntimeConfig>): RuntimeConfig {
  const current = getRuntimeConfig();
  const merged: RuntimeConfig = {
    googleAppsScriptUrl:
      typeof newConfig.googleAppsScriptUrl !== 'undefined'
        ? newConfig.googleAppsScriptUrl.trim()
        : current.googleAppsScriptUrl,
    googleSheetUrl:
      typeof newConfig.googleSheetUrl !== 'undefined'
        ? newConfig.googleSheetUrl.trim()
        : current.googleSheetUrl,
  };

  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
    // Also update in-memory process.env
    process.env.GOOGLE_APPS_SCRIPT_URL = merged.googleAppsScriptUrl;
    process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL = merged.googleAppsScriptUrl;
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL = merged.googleSheetUrl;
  } catch (err) {
    console.error('Failed to write runtime-config.json:', err);
  }

  return merged;
}

export function getLocalResponses(): SubmissionRecord[] {
  try {
    if (fs.existsSync(RESPONSES_FILE_PATH)) {
      const content = fs.readFileSync(RESPONSES_FILE_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    // Ignore read errors
  }
  return [];
}

export function saveLocalResponse(formData: MemberFormData): SubmissionRecord {
  const current = getLocalResponses();
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const newRecord: SubmissionRecord = {
    id: `resp_${Date.now()}`,
    timestamp,
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
    areasOfInterest: Array.isArray(formData.areasOfInterest)
      ? formData.areasOfInterest.join(', ')
      : formData.areasOfInterest || '',
    contribution: formData.contribution || '',
    suggestions: formData.suggestions || '',
  };

  const updated = [newRecord, ...current];
  try {
    fs.writeFileSync(RESPONSES_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local-responses.json:', err);
  }

  return newRecord;
}

export function deleteLocalResponse(id?: string, admissionNumber?: string, email?: string): boolean {
  try {
    const current = getLocalResponses();
    const filtered = current.filter((r) => {
      if (id && r.id === id) return false;
      if (admissionNumber && r.admissionNumber.trim().toLowerCase() === admissionNumber.trim().toLowerCase()) return false;
      if (email && r.email.trim().toLowerCase() === email.trim().toLowerCase()) return false;
      return true;
    });
    fs.writeFileSync(RESPONSES_FILE_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to delete local response:', err);
    return false;
  }
}
