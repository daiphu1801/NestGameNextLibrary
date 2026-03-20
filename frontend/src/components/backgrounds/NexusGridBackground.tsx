'use client';

import { usePerformance } from '@/components/providers/PerformanceProvider';

export function NexusGridBackground() {
  const { isLowPerformanceMode } = usePerformance();

  if (isLowPerformanceMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div
        className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.1) 30%, transparent 70%)',
          filter: 'blur(40px)',
          animationDuration: '4s',
        }}
      />
      <div
        className="absolute top-[20%] -left-[200px] w-[500px] h-[500px] animate-float"
        style={{
          background: 'radial-gradient(circle, rgba(0, 245, 212, 0.15) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255, 0, 255, 0.18) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
          filter: 'blur(80px)',
          animationDuration: '5s',
          animationDelay: '1s',
        }}
      />
      <div
        className="absolute -bottom-[200px] left-1/3 w-[800px] h-[400px] animate-pulse"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.12) 0%, transparent 60%)',
          filter: 'blur(100px)',
          animationDuration: '6s',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundSize: '60px 60px',
          backgroundImage: `
            linear-gradient(to right, rgba(0, 212, 255, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 212, 255, 0.06) 1px, transparent 1px)
          `,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 10, 20, 0.4) 100%)',
        }}
      />
    </div>
  );
}
