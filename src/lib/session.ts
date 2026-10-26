import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

/**
 * Get the current session from a server component or API route.
 * Returns null if no session is present.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Get the current session or throw a 401-style error.
 * Use in API routes that require authentication.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    const error = new Error('Unauthorized');
    // attach a status code for callers to read
    (error as { status?: number }).status = 401;
    throw error;
  }
  return session;
}
