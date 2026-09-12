import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthModal } from '@/components/auth/AuthModal';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawModal } from '@/components/wallet/WithdrawModal';

export const metadata: Metadata = {
  title: 'Lass777 Casino | Big Bet, Big Win! - Slots, Crash & Live Tables',
  description:
    'Experience the gold standard in online iGaming at Lass777. Play Pragmatic, PG Soft, JILI, and Spribe Aviator with instant crypto cashouts and a $20 free registration bonus.',
  keywords: 'Lass777, online casino, slots, crash games, aviator, fish games, iGaming, white label casino',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#07090e',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#07090e] text-slate-100 min-h-screen">
        {children}

        {/* Global Modals */}
        <AuthModal />
        <DepositModal />
        <WithdrawModal />
      </body>
    </html>
  );
}
