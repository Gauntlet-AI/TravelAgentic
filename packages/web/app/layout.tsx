import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { ItineraryProvider } from '@/contexts/ItineraryContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TravelAgentic - AI-Powered Travel Planning',
  description: 'Discover, plan, and book your perfect trip with AI assistance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ItineraryProvider>
            {children}
          </ItineraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
