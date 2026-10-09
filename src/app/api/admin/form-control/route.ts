import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin, getAdminPassword } from '@/lib/auth';
import {
  getFormControlSettings,
  updateFormControlSettings,
  evaluateFormStatus,
  parseIstDateTime,
} from '@/lib/formControl';
import { FormControlSettings } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getFormControlSettings();
    const evaluation = evaluateFormStatus(settings);

    return NextResponse.json({
      success: true,
      settings,
      status: evaluation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch form control settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action; // 'saveSchedule' | 'openNow' | 'closeNow' | 'useSchedule'
    const adminPassword = getAdminPassword();

    let updatePayload: Partial<FormControlSettings> = {};

    if (action === 'openNow') {
      updatePayload = {
        formMode: 'manual',
        manualStatus: 'open',
      };
    } else if (action === 'closeNow') {
      updatePayload = {
        formMode: 'manual',
        manualStatus: 'closed',
      };
    } else if (action === 'useSchedule') {
      updatePayload = {
        formMode: 'scheduled',
      };
    } else if (action === 'saveSchedule' || action === 'updateSettings') {
      const { startDate, startTime, stopDate, stopTime } = body;

      // Validation
      if (!startDate || !startTime || !stopDate || !stopTime) {
        return NextResponse.json(
          {
            success: false,
            error: 'All schedule fields (Start Date, Start Time, Stop Date, Stop Time) are required.',
          },
          { status: 400 }
        );
      }

      const startEpoch = parseIstDateTime(startDate, startTime);
      const stopEpoch = parseIstDateTime(stopDate, stopTime);

      if (isNaN(startEpoch)) {
        return NextResponse.json(
          { success: false, error: 'Invalid Start Date or Time format.' },
          { status: 400 }
        );
      }

      if (isNaN(stopEpoch)) {
        return NextResponse.json(
          { success: false, error: 'Invalid Stop Date or Time format.' },
          { status: 400 }
        );
      }

      if (stopEpoch <= startEpoch) {
        return NextResponse.json(
          {
            success: false,
            error: 'Stop Date & Time must be strictly later than Start Date & Time.',
          },
          { status: 400 }
        );
      }

      updatePayload = {
        startDate,
        startTime,
        stopDate,
        stopTime,
        formMode: 'scheduled', // saving schedule activates scheduled mode
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action provided.' },
        { status: 400 }
      );
    }

    const result = await updateFormControlSettings(updatePayload, adminPassword);
    const evaluation = evaluateFormStatus(result.settings);

    return NextResponse.json({
      success: true,
      message: result.message || 'Form settings updated successfully.',
      settings: result.settings,
      status: evaluation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update form control settings' },
      { status: 500 }
    );
  }
}
