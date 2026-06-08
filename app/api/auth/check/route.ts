import { NextResponse } from 'next/server';
import { isAuthEnabled, checkSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [authEnabled, authenticated] = await Promise.all([
    isAuthEnabled(),
    checkSession(),
  ]);
  return NextResponse.json({ authenticated, authEnabled });
}
