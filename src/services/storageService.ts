class StorageService {
  private readonly RECENT_GAMES_KEY = 'nestgame_recent_games';
  private readonly THEME_KEY = 'nestgame_theme';
  private readonly LANGUAGE_KEY = 'nestgame_language';
  private readonly MAX_RECENT_GAMES = 10;

  // Recent Games
  getRecentGames(): string[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.RECENT_GAMES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get recent games:', error);
      return [];
    }
  }

  addRecentGame(gameId: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      let recent = this.getRecentGames();
      
      // Remove if already exists
      recent = recent.filter(id => id !== gameId);
      
      // Add to beginning
      recent.unshift(gameId);
      
      // Limit size
      recent = recent.slice(0, this.MAX_RECENT_GAMES);
      
      localStorage.setItem(this.RECENT_GAMES_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to add recent game:', error);
    }
  }

  clearRecentGames(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.RECENT_GAMES_KEY);
  }

  // Theme
  getTheme(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.THEME_KEY);
  }

  setTheme(theme: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.THEME_KEY, theme);
  }

  // Language
  getLanguage(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.LANGUAGE_KEY);
  }

  setLanguage(language: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.LANGUAGE_KEY, language);
  }

  // Generic storage
  setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to set ${key}:`, error);
    }
  }

  getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to get ${key}:`, error);
      return defaultValue;
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}

export const storageService = new StorageService();
