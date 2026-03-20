'use client';

import { useEffect, useRef } from 'react';
import { usePerformance } from '@/components/providers/PerformanceProvider';

interface RetroStarsBackgroundProps {
  starCount?: number;
  speed?: number;
}

export function RetroStarsBackground({ starCount = 100, speed = 0.5 }: RetroStarsBackgroundProps) {
  const { isLowPerformanceMode } = usePerformance();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isLowPerformanceMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    // Initial stars
    const stars = Array.from({ length: starCount }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
      size: Math.random() * 1.5 + 0.5,
    }));

    // Animation loop
    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // trailing effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        // move stars
        star.z -= speed;
        // reset if passed screen
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
          star.z = canvas.width;
        }

        // map 3D coordination
        const k = 120 / star.z;
        const px = (star.x - canvas.width / 2) * k + canvas.width / 2;
        const py = (star.y - canvas.height / 2) * k + canvas.height / 2;
        const pSize = star.size * k;

        // Draw star if within screen
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, 1 - star.z / canvas.width)})`;
          ctx.rect(px, py, pSize, pSize);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLowPerformanceMode, starCount, speed]);

  if (isLowPerformanceMode) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none -z-10" 
      style={{ background: '#050a14' }}
    />
  );
}
