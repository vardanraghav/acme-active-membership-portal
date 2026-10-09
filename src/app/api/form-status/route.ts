import { NextResponse } from 'next/server';
import { getFormStatus } from '@/lib/formControl';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getFormStatus();
    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        state: 'CLOSED',
        isOpen: false,
        message: 'Unable to check form status. Please try again.',
        error: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
