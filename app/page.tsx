import { Film, Star, TrendingUp, Heart } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import StatsCard from '@/components/StatsCard';
import DashboardContent from '@/components/DashboardContent';
import { getAllReviews, getStats, getMonthlyReviews } from '@/lib/db';

// Page principale - Server Component
export default async function DashboardPage() {
  // Charger les données côté serveur
  const [reviews, stats, monthlyReviews] = await Promise.all([
    getAllReviews(),
    getStats(),
    getMonthlyReviews(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Ma Collection de Films
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Recherchez, notez et gardez une trace de tous les films que vous avez vus
            avec un système de notation détaillé.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* Statistiques */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Films notés"
            value={stats.total_reviews}
            icon={<Film className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Note moyenne"
            value={stats.avg_rating > 0 ? stats.avg_rating.toFixed(1) : '--'}
            icon={<Star className="w-6 h-6" />}
            color="yellow"
          />
          <StatsCard
            title="Ce mois"
            value={monthlyReviews.length}
            icon={<TrendingUp className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Favoris"
            value={stats.favorites_count}
            icon={<Heart className="w-6 h-6" />}
            color="red"
          />
        </div>
      </section>

      {/* Grille des films avec filtres */}
      <DashboardContent initialReviews={reviews} />
    </div>
  );
}
