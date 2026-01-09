export const siteConfig = {
  name: 'NestGame Library',
  description: 'Modern NES Game Library - Play classic Nintendo games in your browser',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/daiphu1801/NestGameLibrary',
  },
  creator: {
    name: 'Dai Phu',
    github: 'daiphu1801',
  },
} as const;

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'NES',
    'Nintendo',
    'Retro Games',
    'Emulator',
    'Classic Games',
    'Game Library',
  ],
  authors: [
    {
      name: siteConfig.creator.name,
      url: `https://github.com/${siteConfig.creator.github}`,
    },
  ],
  creator: siteConfig.creator.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: siteConfig.creator.name,
  },
};
