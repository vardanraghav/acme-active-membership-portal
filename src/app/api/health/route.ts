import { NextResponse } from 'next/server';
import { checkGasHealth } from '@/lib/gas';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await checkGasHealth();
  return NextResponse.json(status);
}
