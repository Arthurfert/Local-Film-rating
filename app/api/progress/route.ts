import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { upsertProgress } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.tmdb_id || data.season_number == null || data.episode_number == null) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const entry = await upsertProgress(data.tmdb_id, data.season_number, data.episode_number);
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
