// ============================================
// API Route: Épisodes d'une saison (détails TMDB)
// ============================================

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getSeasonDetails } from '@/lib/tmdb.server';
import { requireAuth } from '@/lib/auth';
import type { SeasonEpisodeItem } from '@/lib/types';

export async function GET(request: NextRequest, context: any) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  const params = await context.params;
  try {
    const tvId = parseInt(params.id, 10);
    const seasonNumber = parseInt(params.season, 10);
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language') || 'fr-FR';

    if (isNaN(tvId) || isNaN(seasonNumber)) {
      return NextResponse.json(
        { error: 'ID de série ou numéro de saison invalide' },
        { status: 400 }
      );
    }

    const season = await getSeasonDetails(tvId, seasonNumber, language);

    const episodes: SeasonEpisodeItem[] = season.episodes
      .filter((e) => e.episode_number >= 1)
      .sort((a, b) => a.episode_number - b.episode_number)
      .map((e) => ({
        episode_number: e.episode_number,
        name: e.name,
        overview: e.overview,
        still_path: e.still_path,
        air_date: e.air_date,
        runtime: e.runtime,
        vote_average: e.vote_average,
      }));

    return NextResponse.json({
      season_number: season.season_number,
      season_name: season.name,
      episodes,
    });
  } catch (error) {
    console.error('Error fetching season episodes:', error);

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des épisodes' },
      { status: 500 }
    );
  }
}
