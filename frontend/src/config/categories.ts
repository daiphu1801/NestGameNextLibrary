import { GameCategory, GameCategoryKey } from '@/types';

export const GAME_CATEGORIES: Record<GameCategoryKey, GameCategory> = {
  all: {
    name: 'all',
    icon: 'Gamepad2',
    label: 'All Games',
    color: '#8b5cf6',
  },
  platformer: {
    name: 'platformer',
    icon: 'PersonStanding',
    label: 'Platform',
    color: '#3b82f6',
  },
  rpg: {
    name: 'rpg',
    icon: 'Sword',
    label: 'RPG',
    color: '#ef4444',
  },
  sports: {
    name: 'sports',
    icon: 'Trophy',
    label: 'Sports',
    color: '#f59e0b',
  },
  fighting: {
    name: 'fighting',
    icon: 'Swords',
    label: 'Fighting',
    color: '#dc2626',
  },
  puzzle: {
    name: 'puzzle',
    icon: 'Puzzle',
    label: 'Puzzle',
    color: '#8b5cf6',
  },
  racing: {
    name: 'racing',
    icon: 'Car',
    label: 'Racing',
    color: '#06b6d4',
  },
  shooter: {
    name: 'shooter',
    icon: 'Crosshair',
    label: 'Shooter',
    color: '#f97316',
  },
  strategy: {
    name: 'strategy',
    icon: 'Brain',
    label: 'Strategy',
    color: '#10b981',
  },
  adventure: {
    name: 'adventure',
    icon: 'Map',
    label: 'Adventure',
    color: '#14b8a6',
  },
  action: {
    name: 'action',
    icon: 'Zap',
    label: 'Action',
    color: '#eab308',
  },
  arcade: {
    name: 'arcade',
    icon: 'Joystick',
    label: 'Arcade',
    color: '#d946ef',
  },
  simulation: {
    name: 'simulation',
    icon: 'Hammer',
    label: 'Simulation',
    color: '#64748b',
  },
  other: {
    name: 'other',
    icon: 'Star',
    label: 'Other',
    color: '#6366f1',
  },
} as const;

export const CATEGORY_ORDER: GameCategoryKey[] = [
  'all',
  'action',
  'adventure',
  'arcade',
  'fighting',
  'platformer',
  'puzzle',
  'racing',
  'rpg',
  'shooter',
  'simulation',
  'sports',
  'strategy',
  'other',
];

// Performance constants
export const PERFORMANCE_CONFIG = {
  EAGER_LOAD_COUNT: 18,
  LAZY_LOAD_ROOT_MARGIN: '400px',
  INITIAL_VISIBLE_GAMES: 24,
  GAMES_PER_PAGE: 25,
  MAX_FALLBACK_ATTEMPTS: 2,
  IMAGE_PRIORITY_COUNT: 6,
} as const;

// Image CDN endpoints
export const IMAGE_CDNS = {
  LIBRETRO: [
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Snaps',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Titles',
    'https://thumbnails.libretro.com/Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Boxarts',
  ],
  THEGAMESDB: 'https://cdn.thegamesdb.net/images/thumb/boxart/front',
  SCREENSCRAPER: 'https://www.screenscraper.fr/image.php?gameid=',
} as const;

// Sort options
export const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'rating-desc', label: 'Highest Rating' },
  { value: 'year-desc', label: 'Newest First' },
  { value: 'year-asc', label: 'Oldest First' },
] as const;
