import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin, getAdminPassword } from '@/lib/auth';
import { fetchMemberResponses } from '@/lib/gas';

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
