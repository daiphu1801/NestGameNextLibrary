import { IMAGE_CDNS, PERFORMANCE_CONFIG } from '@/config/categories';

class ImageService {
  private failedUrls = new Set<string>();

  generateFallbackUrls(gameName: string, originalUrl?: string): string[] {
    const urls: Set<string> = new Set();

    // 1. Original valid URL
    if (originalUrl && !originalUrl.startsWith('blob:') && !originalUrl.includes('placeholder')) {
      urls.add(originalUrl);
    }

    // Common game name variations
    const cleanName = this.cleanGameName(gameName);
    const encodedName = encodeURIComponent(gameName);

    // 2. Try exact matches on CDNs
    IMAGE_CDNS.LIBRETRO.forEach(baseUrl => {
      // Prioritize Named_Snaps (screenshots) over Boxart/Titles
      // Try with common region suffixes
      const suffixes = ['(USA)', '(World)', '(Europe)', '(Japan)', ''];

      suffixes.forEach(suffix => {
        const nameWithRegion = suffix ? `${gameName} ${suffix}` : gameName;
        const encoded = encodeURIComponent(nameWithRegion);
        urls.add(`${baseUrl}/${encoded}.png`);
      });

      // Try fuzzy clean name
      urls.add(`${baseUrl}/${cleanName}.png`);
    });

    return Array.from(urls);
  }

  private cleanGameName(name: string): string {
    return name
      .replace(/\s*\([^)]*\)/g, '') // Remove (USA), (World) etc
      .replace(/\s*\[[^\]]*\]/g, '') // Remove [!] etc
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '_'); // Replace spaces with underscores
  }

  private generateGameId(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString();
  }

  markAsFailed(url: string): void {
    this.failedUrls.add(url);
  }

  hasFailed(url: string): boolean {
    return this.failedUrls.has(url);
  }

  getNextFallbackUrl(urls: string[], currentIndex: number): string | null {
    for (let i = currentIndex + 1; i < urls.length; i++) {
      if (!this.hasFailed(urls[i])) {
        return urls[i];
      }
    }
    return null;
  }

  shouldPrioritize(index: number): boolean {
    return index < PERFORMANCE_CONFIG.IMAGE_PRIORITY_COUNT;
  }

  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }
}

export const imageService = new ImageService();
