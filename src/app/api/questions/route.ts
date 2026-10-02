import { NextResponse } from 'next/server';
import { fetchQuestions } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const questions = await fetchQuestions();
    return NextResponse.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
