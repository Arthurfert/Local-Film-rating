import type { SeriesProgressEntry } from './types';

export interface SeriesProgress {
  seasonNumber: number;
  episodeNumber: number;
}

export async function fetchProgress(tmdbId: number): Promise<SeriesProgress | null> {
  try {
    const res = await fetch(`/api/progress/${tmdbId}`);
    if (!res.ok) return null;
    const data: SeriesProgressEntry | null = await res.json();
    if (!data) return null;
    return { seasonNumber: data.season_number, episodeNumber: data.episode_number };
  } catch {
    return null;
  }
}

export async function saveProgress(tmdbId: number, seasonNumber: number, episodeNumber: number) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tmdb_id: tmdbId, season_number: seasonNumber, episode_number: episodeNumber }),
    });
  } catch (e) {
    console.error('Failed to save series progress', e);
  }
}

export function computeNextEpisode(
  progress: SeriesProgress,
  seasons: { season_number: number; episode_count: number }[]
): SeriesProgress {
  const sorted = seasons
    .filter((s) => s.season_number >= 1 && s.episode_count > 0)
    .sort((a, b) => a.season_number - b.season_number);

  const currentSeason = sorted.find((s) => s.season_number === progress.seasonNumber);

  if (currentSeason && progress.episodeNumber < currentSeason.episode_count) {
    return { seasonNumber: progress.seasonNumber, episodeNumber: progress.episodeNumber + 1 };
  }

  const currentIdx = sorted.findIndex((s) => s.season_number === progress.seasonNumber);
  const nextSeason = sorted[currentIdx + 1];
  if (nextSeason) {
    return { seasonNumber: nextSeason.season_number, episodeNumber: 1 };
  }

  return progress;
}
