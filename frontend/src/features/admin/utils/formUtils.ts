export const emptyGameForm = {
  name: '', fileName: '', path: '', categoryId: '' as any,
  description: '', rating: '', year: '', region: '',
  isFeatured: false, system: 'nes',
  imageBaseUrl: '',
  imageUrl: '', imageSnap: '', imageTitle: '',
};

export function deriveImageUrls(base: string): { imageUrl: string; imageSnap: string; imageTitle: string } {
  if (!base) return { imageUrl: '', imageSnap: '', imageTitle: '' };
  const noExt = base.replace(/\.[a-zA-Z0-9]+$/, '');
  return {
      imageUrl: `${noExt}.jpg`,
      imageSnap: `${noExt}s.jpg`,
      imageTitle: `${noExt}t.jpg`,
  };
}

export function stripRomExt(fileName: string): string {
  return fileName.replace(/\.(nes|zip|NES|ZIP)$/, '').trim();
}
