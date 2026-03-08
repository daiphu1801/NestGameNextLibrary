export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (process.env.NODE_ENV !== 'production') return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[PWA] Service worker registered:', registration.scope);
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
  }
}
