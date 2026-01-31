import SearchBar from '@/components/SearchBar';
import DashboardContent from '@/components/DashboardContent';
import { getAllReviews } from '@/lib/db';

// Forcer le rendu dynamique (pas de cache)
export const dynamic = 'force-dynamic';

// Page principale - Server Component
export default async function DashboardPage() {
  // Charger les données côté serveur
  const reviews = await getAllReviews();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              My Film Rating
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Gardez une trace de tous les films et séries que vous avez vus.
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* Grille des films avec filtres */}
      <DashboardContent initialReviews={reviews} />
    </div>
  );
}
