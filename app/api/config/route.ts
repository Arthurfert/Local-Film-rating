import { NextRequest, NextResponse } from 'next/server';
import { readConfig, writeConfig } from '@/lib/config';
import { requireAuth } from '@/lib/auth';

const MASK = '••••••••';

function maskValue(value: string): string {
  if (!value) return '';
  if (value.length < 8) return MASK;
  return MASK + value.slice(-4);
}

export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;
  const config = await readConfig();
  return NextResponse.json({
    tmdbApiKey: maskValue(config.tmdbApiKey),
    tmdbApiReadAccessToken: maskValue(config.tmdbApiReadAccessToken),
    streamProvider: config.streamProvider,
    streamMovieUrlPattern: config.streamMovieUrlPattern,
    streamTvUrlPattern: config.streamTvUrlPattern,
    streamProviders: config.streamProviders,
    appPassword: maskValue(config.appPassword),
    appSecret: maskValue(config.appSecret),
  });
}

export async function PUT(request: Request) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  const body = await request.json();
  const current = await readConfig();

  const resolve = (newVal: string | undefined, currentVal: string): string => {
    if (!newVal) return currentVal;
    return newVal.startsWith(MASK) ? currentVal : newVal;
  };

  const updated = {
    tmdbApiKey: resolve(body.tmdbApiKey, current.tmdbApiKey),
    tmdbApiReadAccessToken: resolve(body.tmdbApiReadAccessToken, current.tmdbApiReadAccessToken),
    streamProvider: body.streamProvider ?? current.streamProvider,
    streamMovieUrlPattern: body.streamMovieUrlPattern ?? current.streamMovieUrlPattern,
    streamTvUrlPattern: body.streamTvUrlPattern ?? current.streamTvUrlPattern,
    streamProviders: body.streamProviders ?? current.streamProviders,
    appPassword: resolve(body.appPassword, current.appPassword),
    appSecret: resolve(body.appSecret, current.appSecret),
  };

  if (!updated.tmdbApiKey && !updated.tmdbApiReadAccessToken) {
    return NextResponse.json(
      { error: 'Au moins une clé TMDB est requise (API Key ou Access Token)' },
      { status: 400 }
    );
  }

  await writeConfig(updated);
  return NextResponse.json({ success: true });
}
