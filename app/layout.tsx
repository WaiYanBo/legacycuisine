import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/corporate/ThemeProvider';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lcgroup.com.my';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Legacy Cuisine - Authorised Foodpanda Intermediary',
  description: 'Official Foodpanda merchant onboarding, menu digitization, device deployment, and weekly payout reconciliation agency in Malaysia.',
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
    title: 'Legacy Cuisine - Authorised Foodpanda Intermediary',
    description: 'Official Foodpanda merchant onboarding, menu digitization, device deployment, and weekly payout reconciliation agency in Malaysia.',
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
    locale: 'en_MY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legacy Cuisine - Authorised Foodpanda Intermediary',
    description: 'Official Foodpanda merchant onboarding, menu digitization, device deployment, and weekly payout reconciliation agency in Malaysia.',
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
    <html lang="en" suppressHydrationWarning>
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

        {/* Client theme anti-flash script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('lc_theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (!theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  // Keep default light unless user explicitly chose dark
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
