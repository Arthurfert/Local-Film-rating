import { NextRequest, NextResponse } from 'next/server';
import { getWatchlist, addToWatchlist } from '@/lib/db';
import type { WatchlistItem } from '@/lib/types';

export async function GET() {
  try {
    const items = await getWatchlist();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération de la Watchlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const data = JSON.parse(bodyText);

    if (!data.tmdb_id || !data.media_type || !data.title || !data.release_date) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const newItem = await addToWatchlist({
      tmdb_id: data.tmdb_id,
      media_type: data.media_type,
      title: data.title,
      poster_path: data.poster_path || null,
      release_date: data.release_date,
      genre_ids: data.genre_ids || []
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
