import { NextResponse } from 'next/server';
import { submitApplication } from '@/lib/gas';
import { MemberFormData } from '@/types';
import { INDIAN_PHONE_REGEX, EMAIL_REGEX } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body: MemberFormData = await request.json();

    // Server-side validation
    if (!body.fullName?.trim()) {
      return NextResponse.json({ success: false, error: 'Full Name is required' }, { status: 400 });
    }
    if (!body.admissionNumber?.trim()) {
      return NextResponse.json({ success: false, error: 'Admission Number is required' }, { status: 400 });
    }
    if (!body.email?.trim() || !EMAIL_REGEX.test(body.email.trim())) {
      return NextResponse.json({ success: false, error: 'A valid Email ID is required' }, { status: 400 });
    }
    const cleanPhone = (body.phone || '').replace(/[\s-+]/g, '');
    if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json({ success: false, error: 'Valid 10-digit Indian phone number is required' }, { status: 400 });
    }
    if (!body.year) {
      return NextResponse.json({ success: false, error: 'Year of study is required' }, { status: 400 });
    }
    if (!body.branch?.trim()) {
      return NextResponse.json({ success: false, error: 'Branch is required' }, { status: 400 });
    }
    if (!body.section) {
      return NextResponse.json({ success: false, error: 'Section is required' }, { status: 400 });
    }
    if (!body.agreedToTerms) {
      return NextResponse.json({ success: false, error: 'You must agree to the confirmation statement' }, { status: 400 });
    }

    const gasResult = await submitApplication(body);

    if (!gasResult.success) {
      return NextResponse.json({
        success: false,
        error: gasResult.message || 'Unable to submit your response. Please check your connection and try again.',
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for submitting the ACME Active Membership Form. Your response has been recorded successfully.',
    });
  } catch (error: any) {
    console.error('Error in /api/submit:', error);
    return NextResponse.json({
      success: false,
      error: 'Unable to submit your response. Please check your connection and try again.',
    }, { status: 500 });
  }
}
