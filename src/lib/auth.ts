import { cookies } from 'next/headers';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'adminvardan@acme.in';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TEAMINDIA';

export function verifyAdminCredentials(email: string, pass: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() &&
    pass === ADMIN_PASSWORD
  );
}

export function getAdminPassword(): string {
  return ADMIN_PASSWORD;
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('acme_admin_session');
  if (!token || !token.value) return false;
  return token.value === Buffer.from(ADMIN_PASSWORD).toString('base64');
}

export function generateAdminSessionToken(): string {
  return Buffer.from(ADMIN_PASSWORD).toString('base64');
}
