'use client';

import { usePerformance } from '@/components/providers/PerformanceProvider';

export function PulseAuroraBackground() {
  const { isLowPerformanceMode } = usePerformance();

  if (isLowPerformanceMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-screen mix-blend-mode filter blur-[100px] opacity-30 animate-pulse"
        style={{
          background: 'linear-gradient(90deg, #4f46e5, #0ea5e9)',
          animationDuration: '8s',
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full mix-blend-screen mix-blend-mode filter blur-[120px] opacity-20 animate-pulse"
        style={{
          background: 'linear-gradient(90deg, #db2777, #9333ea)',
          animationDuration: '12s',
          animationDirection: 'reverse',
        }}
      />
      <div
        className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full mix-blend-screen mix-blend-mode filter blur-[80px] opacity-20 animate-float"
        style={{
          background: 'radial-gradient(circle, #f59e0b, transparent)',
          animationDuration: '10s',
        }}
      />
    </div>
  );
}
