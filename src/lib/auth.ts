import { cookies } from 'next/headers';
import crypto from 'crypto';

interface AdminAccount {
  email: string;
  password: string;
  role: string;
}

const ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    email: (process.env.ADMIN_EMAIL || 'adminvardan@acme.in').trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || 'TEAMINDIA',
    role: 'Admin',
  },
  {
    email: (process.env.PRESIDENT_ADMIN_EMAIL || 'presidentprakhar@acme.in').trim().toLowerCase(),
    password: process.env.PRESIDENT_ADMIN_PASSWORD || 'PRESIDENTPRAKHAR',
    role: 'President Admin',
  },
];

// Secret key used to sign session cookies
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  'acme-active-membership-portal-auth-secret-key-2025';

function generateHmacToken(identifier: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(identifier).digest('hex');
}

/**
 * Verifies credentials against all configured admin accounts.
 * Case-insensitive for email, strict match for password.
 */
export function verifyAdminCredentials(email: string, pass: string): boolean {
  if (!email || !pass) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return ADMIN_ACCOUNTS.some(
    (account) => account.email === normalizedEmail && account.password === pass
  );
}

/**
 * Returns the backend admin password used as authorization secret for Google Apps Script.
 * Google Apps Script validates requests against the master admin password.
 */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'TEAMINDIA';
}

/**
 * Generates a cryptographically secure session token for an authenticated admin.
 */
export function generateAdminSessionToken(email?: string): string {
  const identifier = email ? email.trim().toLowerCase() : ADMIN_ACCOUNTS[0].email;
  return generateHmacToken(`admin_session:${identifier}`);
}

/**
 * Returns all valid session tokens, including HMAC tokens and legacy tokens
 * for seamless backward compatibility.
 */
function getValidSessionTokens(): string[] {
  const tokens: string[] = [];
  for (const account of ADMIN_ACCOUNTS) {
    // Current secure HMAC tokens
    tokens.push(generateHmacToken(`admin_session:${account.email}`));
    // Legacy base64 tokens for backward compatibility
    tokens.push(Buffer.from(account.password).toString('base64'));
  }
  return tokens;
}

/**
 * Checks whether the current request holds a valid admin session cookie.
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('acme_admin_session');
  if (!token || !token.value) return false;

  const validTokens = getValidSessionTokens();
  return validTokens.includes(token.value);
}
