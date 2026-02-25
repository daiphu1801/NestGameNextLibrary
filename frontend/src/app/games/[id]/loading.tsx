import { ArrowLeft, Gamepad2 } from 'lucide-react';

export default function GameDetailLoading() {
  return (
    <div className="min-h-screen bg-[#0F0F23] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/30 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Header Navigation Skeleton */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0F0F23]/80 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400/50">
              <ArrowLeft className="w-5 h-5" />
              <div className="w-20 h-5 bg-purple-500/20 rounded animate-pulse" />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
              <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section Skeleton */}
            <div className="relative">
              <div className="relative aspect-video rounded-2xl overflow-hidden border-4 border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-rose-900/30 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gamepad2 className="w-32 h-32 text-purple-400/30 animate-pulse" />
                </div>
              </div>

              {/* Pixel Corner Decorations */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500/50 border-2 border-[#0F0F23]" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500/50 border-2 border-[#0F0F23]" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-rose-500/50 border-2 border-[#0F0F23]" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-500/50 border-2 border-[#0F0F23]" />
            </div>

            {/* Title & Category Skeleton */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="w-96 h-12 bg-purple-500/20 rounded animate-pulse" />
                  <div className="w-32 h-8 bg-purple-500/20 rounded-lg animate-pulse" />
                </div>
                <div className="w-40 h-14 bg-gradient-to-r from-purple-600/30 to-rose-600/30 rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="relative p-6 rounded-2xl bg-white/5 border border-purple-500/20">
              <div className="absolute -top-px -left-px w-16 h-px bg-gradient-to-r from-purple-500 to-transparent" />
              <div className="absolute -top-px -left-px w-px h-16 bg-gradient-to-b from-purple-500 to-transparent" />
              
              <div className="w-32 h-6 bg-purple-500/20 rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-white/10 rounded animate-pulse" />
                <div className="w-full h-4 bg-white/10 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-white/10 rounded animate-pulse" />
              </div>
            </div>

            {/* Comments Skeleton */}
            <div className="relative p-6 rounded-2xl bg-white/5 border border-purple-500/20">
              <div className="absolute -top-px -right-px w-16 h-px bg-gradient-to-l from-rose-500 to-transparent" />
              <div className="absolute -top-px -right-px w-px h-16 bg-gradient-to-b from-rose-500 to-transparent" />
              
              <div className="w-40 h-6 bg-rose-500/20 rounded mb-4 animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="w-32 h-4 bg-white/10 rounded animate-pulse" />
                      <div className="w-full h-4 bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Rating Card Skeleton */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-rose-900/30 border border-purple-500/30">
                <div className="absolute -top-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                
                <div className="w-24 h-4 bg-purple-500/20 rounded mb-4 animate-pulse" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/10">
                    <div className="space-y-2">
                      <div className="w-16 h-8 bg-white/10 rounded animate-pulse" />
                      <div className="w-20 h-3 bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-5 h-5 bg-white/10 rounded-full animate-pulse" />
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black/30 border border-white/10">
                    <div className="w-32 h-4 bg-white/10 rounded mb-2 animate-pulse" />
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="w-6 h-6 bg-white/10 rounded-full animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Info Card Skeleton */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 to-rose-900/30 border border-purple-500/30">
                <div className="absolute -bottom-px -left-px -right-px h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
                
                <div className="w-32 h-4 bg-purple-500/20 rounded mb-4 animate-pulse" />
                
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/20 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="w-20 h-3 bg-white/10 rounded animate-pulse" />
                        <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badge Skeleton */}
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-2 border-amber-500/30 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 mb-3 animate-pulse" />
                <div className="w-32 h-6 bg-amber-500/20 rounded mx-auto mb-2 animate-pulse" />
                <div className="w-48 h-4 bg-amber-500/20 rounded mx-auto animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
