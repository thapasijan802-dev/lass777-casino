import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthModal } from '@/components/auth/AuthModal';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawModal } from '@/components/wallet/WithdrawModal';

export const metadata: Metadata = {
  title: '9casino | The Next-Gen Crypto Casino - Slots, Originals & Live Tables',
  description:
    'Experience premier crypto iGaming at 9casino. Play 9Casino Originals (Plinko, Mines, Crash), Pragmatic Play, Hacksaw Gaming, and Live Tables with instant crypto payouts, daily rakeback, and $20 on the house.',
  keywords: '9casino, crypto casino, stake originals, plinko, crash, mines, sweet bonanza, gates of olympus, live casino, provably fair',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080b12',
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
