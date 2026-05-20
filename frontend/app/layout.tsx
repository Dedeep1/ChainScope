import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChainScope — On-Chain Fraud Detection',
  description: 'Real-time wallet risk scoring, suspicious token flagging, and DeFi exposure analysis on Ethereum and Base.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
