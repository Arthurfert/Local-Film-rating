import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Personal Film Rating',
  description: 'Application personnelle de notation de films avec critères détaillés',
  keywords: ['films', 'notation', 'reviews', 'cinéma', 'collection'],
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-dark-100 text-white antialiased relative`}>
        <div className="min-h-screen flex flex-col">
          {/* Navigation Bar */}
          <div className="w-full flex justify-center pt-8 pb-4">
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
          
          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-white/10 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
              <p>
                Film Rating © {new Date().getFullYear()} - Données fournies par{' '}
                <a
                  href="https://www.themoviedb.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  TMDB
                </a>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
