import { NextResponse } from 'next/server';
import { checkSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authenticated = await checkSession();
  return NextResponse.json({ authenticated });
}
