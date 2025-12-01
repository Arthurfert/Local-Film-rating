import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Film Rating - Votre collection de films notés',
  description: 'Application personnelle de notation de films avec critères détaillés',
  keywords: ['films', 'notation', 'reviews', 'cinéma', 'collection'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-dark-100 text-white antialiased`}>
        <div className="min-h-screen flex flex-col">
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
