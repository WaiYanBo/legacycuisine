import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/storage/'],
      },
      {
        // Block aggressive AI scrapers and bot crawlers
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'CCBot',
          'Bytespider',
          'anthropic-ai',
          'Claude-Web',
          'ClaudeBot',
          'PerplexityBot',
          'Diffbot',
          'ImagesiftBot',
          'OMGlibot',
        ],
        disallow: ['/'],
      },
    ],
  };
}
