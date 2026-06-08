import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { rateLimit } from './rate-limit';
import { readConfig } from './config';

const ENV_SECRET = process.env.APP_SECRET || '';
const ENV_PASSWORD = process.env.APP_PASSWORD || '';

const SESSION_COOKIE = 'session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const FALLBACK_SECRET = 'change-me-local-film-rating-secret';

function getEffectiveSecret(configSecret: string): string {
  return ENV_SECRET || configSecret || FALLBACK_SECRET;
}

function getEffectivePassword(configPassword: string): string {
  return ENV_PASSWORD || configPassword || '';
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

export function validatePassword(input: string, expected: string): boolean {
  if (!expected) return false;
  return timingSafeEqual(
    Buffer.from(input),
    Buffer.from(expected)
  );
}

export async function requireAuth(request?: Request): Promise<NextResponse | null> {
  const config = await readConfig();
  const password = getEffectivePassword(config.appPassword);
  const secret = getEffectiveSecret(config.appSecret);
  const authEnabled = password.length > 0;

  if (!authEnabled) return null;

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
    return NextResponse.json({ error: 'Non authentifié. Connectez-vous via /login' }, { status: 401 });
  }

  const ip = request?.headers.get('x-forwarded-for') || 'local';
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  return null;
}

export async function isAuthEnabled(): Promise<boolean> {
  const config = await readConfig();
  const password = getEffectivePassword(config.appPassword);
  return password.length > 0;
}

export async function checkSession(request?: Request): Promise<boolean> {
  const config = await readConfig();
  const secret = getEffectiveSecret(config.appSecret);
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token, secret);
}

export async function login(password: string): Promise<{ success: boolean; token?: string }> {
  const config = await readConfig();
  const expected = getEffectivePassword(config.appPassword);
  if (!expected || !validatePassword(password, expected)) {
    return { success: false };
  }
  const secret = getEffectiveSecret(config.appSecret);
  const token = createSessionToken(secret);
  return { success: true, token };
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
