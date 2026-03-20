import { cn } from '@/lib/utils';

interface HotBadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export function HotBadge({ className, ...props }: HotBadgeProps) {
  return (
    <div 
      className={cn(
        "px-2 py-1 rounded bg-gradient-to-r from-rose-500 to-orange-500 animate-pulse shadow-lg shadow-rose-500/30",
        className
      )}
      {...props}
    >
      <span className="text-[10px] font-bold text-white uppercase tracking-wider font-tech">
        🔥 HOT
      </span>
    </div>
  );
}
