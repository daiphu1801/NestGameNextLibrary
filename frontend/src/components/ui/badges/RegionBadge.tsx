import { cn } from '@/lib/utils';

interface RegionBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  region?: string;
}

export function RegionBadge({ region, className, ...props }: RegionBadgeProps) {
  if (!region) return null;

  const displayRegion = (() => {
    const raw = region.toLowerCase();
    if (raw === 'japan' || raw === 'j') return '🇯🇵 JP';
    if (raw === 'usa' || raw === 'u') return '🇺🇸 US';
    if (raw === 'europe' || raw === 'e') return '🇪🇺 EU';
    return region;
  })();

  return (
    <div 
      className={cn(
        "px-2 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/20",
        className
      )}
      {...props}
    >
      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-tech">
        {displayRegion}
      </span>
    </div>
  );
}
