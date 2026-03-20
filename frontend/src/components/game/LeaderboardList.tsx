import { Game } from '@/types/game';
import { Medal, Gamepad2, TrendingUp, Star } from 'lucide-react';

interface LeaderboardListProps {
  games: Game[];
  isLoading: boolean;
  onGameClick: (game: Game) => void;
}

export function LeaderboardList({ games, isLoading, onGameClick }: LeaderboardListProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Medal className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />;
      case 1:
        return <Medal className="w-7 h-7 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_6px_rgba(217,119,6,0.5)]" />;
      default:
        return <span className="text-xl font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto grid gap-4">
      {games.map((game, index) => (
        <div
          key={game.id}
          onClick={() => onGameClick(game)}
          className="group relative flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 overflow-hidden cursor-pointer"
        >
          {/* Rank */}
          <div className="flex-shrink-0 w-12 flex justify-center">
            {getRankIcon(index)}
          </div>

          {/* Game Image */}
          <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-black/50">
            <img
              src={game.imageUrl || game.image || `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.imageSnap || ''}.jpg`}
              alt={game.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-game.png';
              }}
            />
          </div>

          {/* Game Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {game.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                <Gamepad2 className="w-3.5 h-3.5" />
                {game.categoryName}
              </span>
              <span>•</span>
              <span>{game.year}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                {game.playCount || 0} plays
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <Star className="w-4 h-4 fill-yellow-400" />
              <span className="font-bold text-lg">{game.rating ? game.rating.toFixed(1) : 'N/A'}</span>
            </div>
            <span className="text-xs text-muted-foreground mr-1">Rating</span>
          </div>

          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
