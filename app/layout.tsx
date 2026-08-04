import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Legacy Cuisine - F&B Management',
  description: 'Enterprise food delivery aggregator reconciliation ledger',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Legacy Cuisine - F&B Management Portal',
    description: 'Enterprise food delivery aggregator reconciliation ledger',
    siteName: 'Legacy Cuisine',
    images: [
      {
        url: '/logo.png',
        width: 1254,
        height: 1254,
        alt: 'Legacy Cuisine Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legacy Cuisine - F&B Management Portal',
    description: 'Enterprise food delivery aggregator reconciliation ledger',
    images: ['/logo.png'],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="bg-slate-50 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
