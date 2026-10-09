import { NextResponse } from 'next/server';
import { getRuntimeConfig } from '@/lib/config';
import { getFormStatus } from '@/lib/formControl';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 0. Enforce Form Control status at the exact moment of submission
    const formStatus = await getFormStatus();
    if (!formStatus.isOpen) {
      const closedMessage =
        formStatus.state === 'NOT_YET_OPEN'
          ? 'The ACME Active Membership Form is not yet open for submissions.'
          : 'The ACME Active Membership Form is currently closed.';

      return NextResponse.json(
        {
          success: false,
          closed: true,
          error: closedMessage,
          details: formStatus.message,
        },
        { status: 403 }
      );
    }

    let body: any = null;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON payload received in request.',
          details: 'Failed to parse JSON body from client request',
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Form submission data is missing or empty.',
          details: 'Empty body received by submission route',
        },
        { status: 400 }
      );
    }

    // Server-side validation of essential fields
    if (
      !body.fullName?.trim() ||
      !body.admissionNumber?.trim() ||
      !body.email?.trim() ||
      !body.phone?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please fill in all required fields (Full Name, Admission Number, Email, Phone Number).',
          details: 'Validation failed: Missing required fields on Step 1',
        },
        { status: 400 }
      );
    }

    if (!body.agreedToTerms) {
      return NextResponse.json(
        {
          success: false,
          error: 'Confirmation agreement is required before submitting.',
          details: 'agreedToTerms is false or missing',
        },
        { status: 400 }
      );
    }

    // Determine Google Apps Script URL
    const gasUrl =
      getRuntimeConfig().googleAppsScriptUrl ||
      process.env.GOOGLE_APPS_SCRIPT_URL ||
      process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL ||
      'https://script.google.com/macros/s/AKfycbz9eRpJs4rA9JTbwwo87auL2Kqu8_ItTicabZniN7vgkU9sIV3gEMU0Sg23EpQEh_jgVQ/exec';

    if (!gasUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Apps Script URL is not configured.',
          details: 'GOOGLE_APPS_SCRIPT_URL is missing in server environment',
        },
        { status: 500 }
      );
    }

    // Forward exact payload to Google Apps Script production /exec URL with action: "submitResponse"
    const payload = {
      ...body,
      action: 'submitResponse',
    };

    const gasResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
      cache: 'no-store',
    });

    // 8. Read the Apps Script response using response.text() FIRST
    const rawText = await gasResponse.text();

    // 9. Safely parse JSON if possible
    let data: any = null;
    let isJson = false;
    try {
      data = JSON.parse(rawText);
      isJson = true;
    } catch {
      isJson = false;
    }

    // 10. Return clean JSON response to frontend
    if (gasResponse.ok && isJson && data?.success) {
      return NextResponse.json({
        success: true,
        message: data.message || 'Response submitted successfully',
      });
    }

    // Handle Apps Script application-level error or deployment HTTP error
    let errorMessage = 'Unable to submit your response. Please check your connection and try again.';
    let errorDetails = rawText;

    if (isJson && data) {
      errorMessage = data.error || data.message || errorMessage;
      errorDetails = data.details || data.error || data.message || rawText;
    } else if (
      gasResponse.status === 403 ||
      rawText.includes('Access denied') ||
      rawText.includes('accounts.google.com')
    ) {
      errorMessage =
        'Google Apps Script deployment access denied. Web App must be deployed with "Execute as: Me" and "Who has access: Anyone".';
      errorDetails = `GAS HTTP ${gasResponse.status}: Google Drive Access Denied HTML page returned.`;
    } else if (!gasResponse.ok) {
      errorMessage = `Backend server returned HTTP status ${gasResponse.status}.`;
      errorDetails = `HTTP ${gasResponse.status} ${gasResponse.statusText}: ${rawText.slice(0, 300)}`;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails || 'Unknown error occurred while contacting Google Apps Script',
      },
      { status: gasResponse.ok ? 400 : 502 }
    );
  } catch (error: any) {
    console.warn('[ACME Submit Route Error]:', error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to submit your response. Please check your connection and try again.',
        details: error?.message || String(error) || 'Internal server error occurred',
      },
      { status: 500 }
    );
  }
}
