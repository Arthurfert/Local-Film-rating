import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { rateLimit } from './rate-limit';
import { readConfig, writeConfig } from './config';

const ENV_SECRET = process.env.APP_SECRET || '';

const SESSION_COOKIE = 'session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function getEffectiveSecret(): Promise<string> {
  if (ENV_SECRET) return ENV_SECRET;
  const config = await readConfig();
  if (config.appSecret) return config.appSecret;
  const generated = randomBytes(32).toString('hex');
  await writeConfig({ ...config, appSecret: generated });
  return generated;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function createSessionToken(secret: string): string {
  const expiry = Date.now() + SESSION_DURATION_MS;
  const payload = `${randomBytes(16).toString('hex')}.${expiry}`;
  const sig = sign(payload, secret);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string, secret: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = `${parts[0]}.${parts[1]}`;
    const sig = parts[2];
    const expected = sign(payload, secret);
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    const expiry = parseInt(parts[1], 10);
    return expiry > Date.now();
  } catch {
    return false;
  }
}

export async function requireAuth(request?: Request): Promise<NextResponse | null> {
  const secret = await getEffectiveSecret();

  if (request) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    if (origin || referer) {
      try {
        const sourceUrl = origin || referer || '';
        const parsed = new URL(sourceUrl);
        if (parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
          return NextResponse.json({ error: 'Requête cross-origin refusée' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Origine invalide' }, { status: 400 });
      }
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !verifySessionToken(token, secret)) {
    return NextResponse.json({ error: 'Non authentifié. Reconnectez-vous.' }, { status: 401 });
  }

  const ip = request?.headers.get('x-forwarded-for') || 'local';
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  return null;
}

export async function checkSession(): Promise<boolean> {
  const secret = await getEffectiveSecret();
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token, secret);
}

export function createSessionCookie(token: string): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: SESSION_DURATION_MS / 1000,
    },
  };
}

export function clearSessionCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: SESSION_COOKIE,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    },
  };
}
