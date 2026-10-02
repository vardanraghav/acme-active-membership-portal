import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getRuntimeConfig, saveRuntimeConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const config = getRuntimeConfig();
  return NextResponse.json({
    success: true,
    ...config,
    isGasConfigured: Boolean(config.googleAppsScriptUrl && config.googleAppsScriptUrl.startsWith('https://script.google.com')),
  });
}

export async function POST(request: Request) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = saveRuntimeConfig({
      googleAppsScriptUrl: body.googleAppsScriptUrl,
      googleSheetUrl: body.googleSheetUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Connection configuration saved successfully',
      ...updated,
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json({ success: false, error: 'Failed to save configuration' }, { status: 500 });
  }
}
