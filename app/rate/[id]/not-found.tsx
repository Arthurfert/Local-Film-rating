import Link from 'next/link';
import { Film, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <Film className="w-12 h-12 text-gray-500" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Film non trouvé</h1>
      <p className="text-gray-400 mb-8 max-w-md">
        Désolé, nous n'avons pas pu trouver le film que vous recherchez.
        Il est possible qu'il ait été supprimé ou que le lien soit incorrect.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/25 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au Dashboard
      </Link>
    </div>
  );
}
