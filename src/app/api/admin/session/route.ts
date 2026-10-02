import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  return NextResponse.json({
    authenticated: isAuth,
  });
}
