import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lcgroup.com.my';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    title: 'Legacy Cuisine - F&B Management',
    description: 'Enterprise food delivery aggregator reconciliation ledger',
    url: siteUrl,
    siteName: 'Legacy Cuisine',
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 1254,
        height: 1254,
        type: 'image/png',
        alt: 'Legacy Cuisine Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legacy Cuisine - F&B Management',
    description: 'Enterprise food delivery aggregator reconciliation ledger',
    images: [`${siteUrl}/logo.png`],
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
        {/* Explicit WhatsApp & Social Open Graph Tags */}
        <meta property="og:title" content="Legacy Cuisine - F&B Management" />
        <meta property="og:description" content="Enterprise food delivery aggregator reconciliation ledger" />
        <meta property="og:image" content="https://lcgroup.com.my/logo.png" />
        <meta property="og:image:secure_url" content="https://lcgroup.com.my/logo.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1254" />
        <meta property="og:image:height" content="1254" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lcgroup.com.my" />
      </head>
      <body className="bg-slate-50 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
