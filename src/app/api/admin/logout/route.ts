import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  const isHttps = request.url.startsWith('https://');

  response.cookies.set({
    name: 'acme_admin_session',
    value: '',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
