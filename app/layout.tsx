import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'QIE Reputation Passport | Verify & Showcase Ecosystem Contributions',
  description: 'The contribution-first reputation passport for QIE Blockchain builders. Verify wallet activity, track deployments, and showcase achievements with verified credentials.',
  keywords: ['QIE Blockchain', 'QIE Pass', 'Web3 Reputation', 'Leaderboard', 'Ecosystem Passport', 'Developer Profile'],
  authors: [{ name: 'QIE Ecosystem' }],
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-white font-sans selection:bg-qie-pink selection:text-black">
        <div className="relative min-h-screen flex flex-col bg-dots">
          {/* Subtle Glow Overlay */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-qie-pink-glow rounded-full blur-[160px] opacity-20 pointer-events-none animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-qie-pink-glow rounded-full blur-[180px] opacity-10 pointer-events-none animate-pulse-glow" />
          
          <main className="flex-grow flex flex-col z-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
