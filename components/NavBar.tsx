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
    <div className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-auto">
      <nav className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-8 py-4 flex items-center shadow-2xl gap-10">
        <div className="flex gap-8 items-center">
          <Link href="/" className="text-base lg:text-lg font-medium text-gray-300 hover:text-white transition-colors">
            Mes Notes
          </Link>
          <div className="h-5 w-px bg-white/20"></div>
          <Link href="/watchlist" className="text-base lg:text-lg font-medium text-gray-300 hover:text-white transition-colors">
            Watchlist
          </Link>
        </div>
      </nav>
    </div>
  );
}