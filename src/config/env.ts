export const env = {
  r2Url: process.env.NEXT_PUBLIC_R2_URL || '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'NestGame Library',
} as const;

export function validateEnv() {
  if (!env.r2Url) {
    console.warn('⚠️ NEXT_PUBLIC_R2_URL is not set. Game ROMs will not load properly.');
    return false;
  }
  return true;
}
