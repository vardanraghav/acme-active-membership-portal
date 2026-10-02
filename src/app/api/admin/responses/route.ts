import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin, getAdminPassword } from '@/lib/auth';
import { fetchMemberResponses, deleteMemberResponse } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminPassword = getAdminPassword();
    const responses = await fetchMemberResponses(adminPassword);
    return NextResponse.json({
      success: true,
      responses,
    });
  } catch (error) {
    console.error('Error fetching admin responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch responses from Google Sheet' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { responseId, admissionNumber, email } = await request.json();
    if (!responseId && !admissionNumber && !email) {
      return NextResponse.json(
        { success: false, error: 'Response ID or admission number is required' },
        { status: 400 }
      );
    }

    const adminPassword = getAdminPassword();
    const result = await deleteMemberResponse(responseId, admissionNumber, email, adminPassword);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/responses:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete response' },
      { status: 500 }
    );
  }
}

