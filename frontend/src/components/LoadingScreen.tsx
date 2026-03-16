'use client';

import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { useLoading } from './providers/LoadingProvider';

export function LoadingScreen() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-6">

        {/* Spinning ring */}
        <div className="relative w-28 h-28">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-pink-500 blur-2xl opacity-40 animate-pulse" />

          {/* Spinning gradient ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #a855f7, #22d3ee, #ec4899, #a855f7)',
              animation: 'spin-ring 1.2s linear infinite',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 5px), #000 calc(100% - 4px))',
            }}
          />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 mb-1 tracking-wide">
            LOADING
          </h2>
          <p className="text-white/30 text-xs tracking-widest">
            Please wait...
          </p>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes spin-ring {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
