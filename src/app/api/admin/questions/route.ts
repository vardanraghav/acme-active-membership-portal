import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin, getAdminPassword } from '@/lib/auth';
import { performQuestionAction, fetchQuestions } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const adminPassword = getAdminPassword();
    const questions = await fetchQuestions(adminPassword);
    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error('Error in admin GET questions:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, ...payload } = body;

    if (!['addQuestion', 'editQuestion', 'deleteQuestion', 'toggleQuestion', 'reorderQuestions'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    const adminPassword = getAdminPassword();
    const result = await performQuestionAction(action, payload, adminPassword);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in admin POST questions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
