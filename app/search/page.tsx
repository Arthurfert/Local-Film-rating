import SearchBar from '@/components/SearchBar';
import { Search, Film, ArrowRight } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-4">
          <Search className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Rechercher un film
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Trouvez n'importe quel film et ajoutez-le à votre collection avec
          votre notation personnalisée.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-16">
        <SearchBar />
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-6 text-center">Comment ça marche ?</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">1. Recherchez</h3>
            <p className="text-sm text-gray-400">
              Tapez le nom du film que vous avez vu dans la barre de recherche.
            </p>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Film className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="font-semibold mb-2">2. Sélectionnez</h3>
            <p className="text-sm text-gray-400">
              Choisissez le bon film parmi les résultats de recherche.
            </p>
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ArrowRight className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">3. Notez</h3>
            <p className="text-sm text-gray-400">
              Évaluez le scénario, le visuel, la musique et l'acting du film.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
