/**
 * Root layout for Quantum Ledger
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MarketDataProvider } from '@/lib/MarketDataContext';
import { ScenarioSelector } from '@/components/ui/ScenarioSelector';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Quantum Ledger - Personal Finance Dashboard',
  description: 'Professional FinTech platform for managing personal finances and investments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MarketDataProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <Link href="/" className="flex items-center">
                      <div className="text-2xl font-bold text-primary-600">
                        Quantum Ledger
                      </div>
                    </Link>
                  </div>

                  <div className="flex items-center gap-6">
                    <nav className="flex space-x-8">
                    <Link
                      href="/"
                      className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      data-testid="nav-dashboard"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/transfer"
                      className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      data-testid="nav-transfer"
                    >
                      Transfer
                    </Link>
                    <Link
                      href="/investments"
                      className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      data-testid="nav-investments"
                    >
                      Investments
                    </Link>
                    <Link
                      href="/tools/loan-calculator"
                      className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      data-testid="nav-loan-calculator"
                    >
                      Loan Calculator
                    </Link>
                    <Link
                      href="/reports"
                      className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      data-testid="nav-reports"
                    >
                      Reports
                    </Link>
                  </nav>
                  <ScenarioSelector />
                  </div>
                </div>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            <footer className="bg-white border-t border-gray-200 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <p className="text-center text-gray-500 text-sm">
                  Quantum Ledger - FinTech QA Testing Platform © 2025
                </p>
              </div>
            </footer>
          </div>
        </MarketDataProvider>
      </body>
    </html>
  );
}
