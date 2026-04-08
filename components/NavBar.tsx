'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();

  // Cacher la barre de navigation sur les pages de notation et de vue de note
  const isHidden = pathname.startsWith('/rate') || pathname.startsWith('/review');

  if (isHidden) {
    return null;
  }

  return (
    <div className="w-full flex justify-center pt-8 pb-4 relative z-50">
      <nav className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center shadow-2xl gap-8">
        <div className="flex gap-6 items-center">
          <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Mes Notes
          </Link>
          <div className="h-4 w-px bg-white/20"></div>
          <Link href="/watchlist" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Watchlist
          </Link>
        </div>
      </nav>
    </div>
  );
}