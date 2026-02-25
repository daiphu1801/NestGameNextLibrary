export default function PlayLoading() {
  return (
    <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Animated Gaming Icon */}
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-rose-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 bg-[#0F0F23] border-4 border-purple-500/30 rounded-2xl flex items-center justify-center">
              <span className="text-5xl animate-bounce">🎮</span>
            </div>
          </div>

          {/* Loading Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-300 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Loading Game...</h2>
        <p className="text-muted-foreground">Preparing your gaming experience</p>
      </div>
    </div>
  );
}
