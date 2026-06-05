import SearchBar from '@/components/SearchBar';
import DashboardContent from '@/components/DashboardContent';
import { getAllReviews, getStats } from '@/lib/db';
import { Film, Star, Heart } from 'lucide-react';

// Forcer le rendu dynamique (pas de cache)
export const dynamic = 'force-dynamic';

// Page principale - Server Component
export default async function DashboardPage() {
  // Charger les données côté serveur
  const reviews = await getAllReviews();
  const stats = await getStats();

  return (
    <div className="w-full px-4 pt-32 pb-8 relative">
      {/* Effets de lueur d'ambiance en arrière-plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[700px] pointer-events-none -z-10 select-none">
        <div className="absolute top-[0%] left-[15%] w-[45%] h-[50%] rounded-full bg-red-500/30 blur-[120px] opacity-100" />
        <div className="absolute top-[5%] left-[45%] w-[35%] h-[50%] rounded-full bg-amber-500/30 blur-[120px] opacity-100" />
        <div className="absolute top-[-5%] right-[10%] w-[30%] h-[45%] rounded-full bg-purple-600/30 blur-[100px] opacity-80" />
      </div>

      {/* Hero Section */}
      <section className="mb-16 relative">
        <div className="text-center mb-10 max-w-6xl mx-auto pt-6">

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-snug mb-6 lg:mb-8">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 pb-2">
              Évaluez & Organisez
            </span>
            <span className="block mt-2 font-handwriting italic text-orange-500 drop-shadow-[0_2px_8px_rgba(239,68,68,0.25)] py-1">
              Votre Univers Cinéma
            </span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg lg:text-xl xl:text-2xl max-w-3xl mx-auto leading-relaxed">
            Gardez une trace de tous les films et séries que vous avez vus.
          </p>
        </div>

        {/* Barre de recherche avec enveloppe en verre et lueur */}
        <div className="relative mb-8 group z-50 max-w-3xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl blur-lg opacity-50 group-hover:opacity-85 transition-opacity duration-500 -z-10" />
          <div className="relative bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-3 lg:p-4 shadow-2xl transition-all duration-300 hover:border-white/15">
            <SearchBar />
          </div>
        </div>

        {/* Petit résumé des statistiques en ligne */}
        <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap text-sm md:text-base text-gray-400 relative z-0">
          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10">
            <Film className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
            <span>
              <strong className="text-white font-semibold">{stats.total_reviews}</strong> critiques
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-400 fill-amber-400/20" />
            <span>
              Note moy. <strong className="text-white font-semibold">{stats.total_reviews > 0 ? stats.avg_rating.toFixed(1) : '-'}</strong>/10
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all hover:bg-white/[0.04] hover:border-white/10">
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-purple-400 fill-purple-400/20" />
            <span>
              <strong className="text-white font-semibold">{stats.favorites_count}</strong> favoris
            </span>
          </div>
        </div>
      </section>

      {/* Grille des films avec filtres */}
      <DashboardContent initialReviews={reviews} />
    </div>
  );
}
