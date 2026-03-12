'use client';

import React from 'react';
import { useLoading } from './providers/LoadingProvider';

export function LoadingScreen() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Main container */}
      <div className="relative flex flex-col items-center gap-8">

        {/* Arcade cabinet frame */}
        <div className="relative">
          {/* Outer glow - neon effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg blur-2xl opacity-50" />

          {/* Screen container */}
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-4 border-cyan-400 rounded-lg p-8 shadow-2xl w-80">

            {/* Screen flicker effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-pulse" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">

              {/* Pixel grid animation */}
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-sm"
                    style={{
                      animation: `fadeIn 1.5s ease-in-out infinite`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>

              {/* Loading text */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2 font-mono">
                  LOADING
                </h2>
                <p className="text-cyan-300/70 text-sm font-mono tracking-widest">
                  {['/', '─', '\\', '|'][Math.floor(Date.now() / 100) % 4]}
                </p>
              </div>

              {/* Progress bar - neon style */}
              <div className="w-full bg-slate-800 border border-cyan-500/30 rounded h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded"
                  style={{
                    animation: 'shimmer 2s infinite',
                    backgroundSize: '200% 100%',
                  }}
                />
              </div>

              {/* Game info text */}
              <p className="text-cyan-300/50 text-xs font-mono text-center max-w-xs">
                Loading your next adventure...
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decorative text */}
        <div className="text-center">
          <p className="text-purple-400 text-sm font-mono opacity-70 tracking-wider">
            ▮ ▮ ARCADE MODE ▮ ▮
          </p>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.6);
          }
          50% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8);
          }
        }
      `}</style>
    </div>
  );
}
