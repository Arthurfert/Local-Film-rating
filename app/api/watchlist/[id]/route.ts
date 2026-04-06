import { NextRequest, NextResponse } from 'next/server';
import { getWatchlist, removeFromWatchlist, removeFromWatchlistByTmdbId, isInWatchlist } from '@/lib/db';
import type { MediaType } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tmdbId = parseInt(params.id, 10);
    const mediaType = request.nextUrl.searchParams.get('mediaType') as MediaType;
    
    if (!mediaType || isNaN(tmdbId)) {
       return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    const inWatchlist = await isInWatchlist(tmdbId, mediaType);
    return NextResponse.json({ inWatchlist });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mediaType = request.nextUrl.searchParams.get('mediaType') as MediaType;
    // Si mediaType est fourni et que id ressemble à un nombre, on supprime par id TMDB + mediaType
    if (mediaType && !isNaN(parseInt(params.id, 10))) {
        await removeFromWatchlistByTmdbId(parseInt(params.id, 10), mediaType);
    } else {
        // Sinon, c'est l'UUID
        await removeFromWatchlist(params.id);
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
