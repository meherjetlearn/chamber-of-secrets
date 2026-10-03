import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  pulse: number;
  pulseSpeed: number;
}

export const SparkleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(212, 175, 55, ',  // Gilded gold
      'rgba(255, 223, 100, ', // Bright gold
      'rgba(46, 204, 113, ',  // Emerald green
      'rgba(180, 40, 70, ',   // Deep maroon
      'rgba(160, 220, 180, ', // Faint spectral mint
    ];

    const particleCount = Math.min(55, Math.floor((width * height) / 22000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -Math.random() * 0.45 - 0.15, // gently floating upwards
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // Wand sparks on mouse move
    const wandSparks: { x: number; y: number; life: number; color: string; vx: number; vy: number }[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.4) {
        wandSparks.push({
          x: e.clientX,
          y: e.clientY,
          life: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background ambient particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.pulse) * 0.25);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.shadowColor = p.color.includes('212, 175') ? '#d4af37' : '#2ecc71';
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      // Draw wand cursor sparks
      for (let i = wandSparks.length - 1; i >= 0; i--) {
        const spark = wandSparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life -= 0.035;

        if (spark.life <= 0) {
          wandSparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.life * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `${spark.color}${spark.life})`;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
