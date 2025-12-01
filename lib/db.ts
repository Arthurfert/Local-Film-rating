// ============================================
// Base de données locale JSON
// Stockage des reviews dans un fichier JSON côté serveur
// ============================================

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Review, ReviewFormData, UserStats } from './types';

// Chemin vers le fichier de données
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'reviews.json');

// Structure de la base de données
interface Database {
  reviews: Review[];
}

// ============================================
// Fonctions utilitaires pour le fichier JSON
// ============================================

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readDatabase(): Promise<Database> {
  await ensureDataDir();
  
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Si le fichier n'existe pas, retourner une base vide
    return { reviews: [] };
  }
}

async function writeDatabase(db: Database): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// ============================================
// Fonctions CRUD pour les reviews
// ============================================

export async function getAllReviews(): Promise<Review[]> {
  const db = await readDatabase();
  return db.reviews.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getReviewById(reviewId: string): Promise<Review | null> {
  const db = await readDatabase();
  return db.reviews.find((r) => r.id === reviewId) || null;
}

export async function getReviewByTmdbId(tmdbId: number): Promise<Review | null> {
  const db = await readDatabase();
  return db.reviews.find((r) => r.tmdb_id === tmdbId) || null;
}

export async function createReview(reviewData: ReviewFormData): Promise<Review> {
  const db = await readDatabase();
  
  // Vérifier si le film n'est pas déjà noté
  const existing = db.reviews.find((r) => r.tmdb_id === reviewData.tmdb_id);
  if (existing) {
    throw new Error('Ce film a déjà été noté');
  }

  // Calculer la note globale
  const rating_global = Number(
    (
      (reviewData.rating_scenario +
        reviewData.rating_visual +
        reviewData.rating_music +
        reviewData.rating_acting) /
      4
    ).toFixed(1)
  );

  const now = new Date().toISOString();
  const newReview: Review = {
    id: uuidv4(),
    user_id: 'local-user', // Utilisateur local unique
    tmdb_id: reviewData.tmdb_id,
    title: reviewData.title,
    original_title: reviewData.original_title || null,
    poster_path: reviewData.poster_path || null,
    backdrop_path: reviewData.backdrop_path || null,
    release_date: reviewData.release_date || null,
    overview: reviewData.overview || null,
    genres: reviewData.genres || [],
    runtime: reviewData.runtime || null,
    rating_scenario: reviewData.rating_scenario,
    rating_visual: reviewData.rating_visual,
    rating_music: reviewData.rating_music,
    rating_acting: reviewData.rating_acting,
    rating_global,
    review_text: reviewData.review_text || null,
    watched_date: reviewData.watched_date || now.split('T')[0],
    is_favorite: reviewData.is_favorite || false,
    created_at: now,
    updated_at: now,
  };

  db.reviews.push(newReview);
  await writeDatabase(db);

  return newReview;
}

export async function updateReview(
  reviewId: string,
  reviewData: Partial<ReviewFormData>
): Promise<Review> {
  const db = await readDatabase();
  const index = db.reviews.findIndex((r) => r.id === reviewId);

  if (index === -1) {
    throw new Error('Review non trouvée');
  }

  const existingReview = db.reviews[index];

  // Recalculer la note globale si les ratings ont changé
  const rating_scenario = reviewData.rating_scenario ?? existingReview.rating_scenario;
  const rating_visual = reviewData.rating_visual ?? existingReview.rating_visual;
  const rating_music = reviewData.rating_music ?? existingReview.rating_music;
  const rating_acting = reviewData.rating_acting ?? existingReview.rating_acting;

  const rating_global = Number(
    ((rating_scenario + rating_visual + rating_music + rating_acting) / 4).toFixed(1)
  );

  const updatedReview: Review = {
    ...existingReview,
    ...reviewData,
    rating_scenario,
    rating_visual,
    rating_music,
    rating_acting,
    rating_global,
    updated_at: new Date().toISOString(),
  };

  db.reviews[index] = updatedReview;
  await writeDatabase(db);

  return updatedReview;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const db = await readDatabase();
  const index = db.reviews.findIndex((r) => r.id === reviewId);

  if (index === -1) {
    throw new Error('Review non trouvée');
  }

  db.reviews.splice(index, 1);
  await writeDatabase(db);
}

export async function toggleFavorite(
  reviewId: string,
  isFavorite: boolean
): Promise<Review> {
  return updateReview(reviewId, { is_favorite: isFavorite });
}

export async function getStats(): Promise<UserStats> {
  const db = await readDatabase();
  const reviews = db.reviews;

  if (reviews.length === 0) {
    return {
      user_id: 'local-user',
      total_reviews: 0,
      avg_rating: 0,
      favorites_count: 0,
      last_review_date: null,
    };
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating_global, 0) / reviews.length;

  const sortedByDate = [...reviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    user_id: 'local-user',
    total_reviews: reviews.length,
    avg_rating: Number(avgRating.toFixed(2)),
    favorites_count: reviews.filter((r) => r.is_favorite).length,
    last_review_date: sortedByDate[0]?.created_at || null,
  };
}

export async function getFavoriteReviews(): Promise<Review[]> {
  const db = await readDatabase();
  return db.reviews
    .filter((r) => r.is_favorite)
    .sort((a, b) => b.rating_global - a.rating_global);
}

export async function getTopRatedReviews(limit: number = 10): Promise<Review[]> {
  const db = await readDatabase();
  return db.reviews
    .sort((a, b) => b.rating_global - a.rating_global)
    .slice(0, limit);
}

export async function getRecentReviews(limit: number = 10): Promise<Review[]> {
  const db = await readDatabase();
  return db.reviews
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// Fonction pour obtenir les reviews du mois en cours
export async function getMonthlyReviews(): Promise<Review[]> {
  const db = await readDatabase();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return db.reviews.filter(
    (r) => new Date(r.created_at) >= startOfMonth
  );
}
