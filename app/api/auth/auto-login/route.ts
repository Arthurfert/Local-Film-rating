import { NextResponse } from 'next/server';
import { getEffectiveSecret, createSessionToken, createSessionCookie, checkSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (await checkSession()) {
    return NextResponse.json({ success: true });
  }

  const secret = await getEffectiveSecret();
  const token = createSessionToken(secret);
  const response = NextResponse.json({ success: true });
  const cookie = createSessionCookie(token);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
