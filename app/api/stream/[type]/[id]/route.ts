import { NextRequest, NextResponse } from 'next/server';
import { buildStreamResponse } from '@/lib/stream';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, context: any) {
  const params = await context.params;
  try {
    const type = params.type as string;
    const id = parseInt(params.id, 10);

    if (type !== 'movie' && type !== 'tv') {
      return NextResponse.json(
        { error: 'Type invalide. Utilisez "movie" ou "tv"' },
        { status: 400 }
      );
    }

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get('season')
      ? parseInt(searchParams.get('season')!, 10)
      : undefined;
    const ep = searchParams.get('ep')
      ? parseInt(searchParams.get('ep')!, 10)
      : undefined;

    const stream = buildStreamResponse(type, id, season, ep);

    if (!stream || !stream.url) {
      return NextResponse.json(
        { error: 'Aucune source de streaming configurée. Définissez STREAM_MOVIE_URL_PATTERN ou STREAM_TV_URL_PATTERN dans .env.local' },
        { status: 404 }
      );
    }

    return NextResponse.json(stream);
  } catch (error) {
    console.error('Error generating stream URL:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du lien de streaming' },
      { status: 500 }
    );
  }
}
