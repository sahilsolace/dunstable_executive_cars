import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { RouteGuard } from '@/components/route-guard';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'DEC Fleet & Workforce',
  description: 'Fleet and workforce management for Dunstable Executive Cars',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <RouteGuard>{children}</RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
