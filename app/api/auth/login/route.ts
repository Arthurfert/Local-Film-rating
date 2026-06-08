import { NextRequest, NextResponse } from 'next/server';
import { isAuthEnabled, login, createSessionCookie } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await isAuthEnabled())) {
    return NextResponse.json({ error: 'L\'authentification n\'est pas configurée' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for') || 'login';
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Trop de tentatives' }, { status: 429 });
  }

  try {
    const { password } = await request.json();
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    }

    const result = await login(password);
    if (!result.success || !result.token) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    const cookie = createSessionCookie(result.token);
    response.cookies.set(cookie.name, cookie.value, cookie.options);
    return response;
  } catch {
    return NextResponse.json({ error: 'Erreur lors de l\'authentification' }, { status: 400 });
  }
}
