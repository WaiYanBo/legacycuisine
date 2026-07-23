import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Storefront Reconciliation Dashboard',
  description: 'Enterprise food delivery aggregator reconciliation ledger',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
