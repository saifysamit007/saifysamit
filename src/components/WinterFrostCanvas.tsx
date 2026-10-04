import React, { useEffect, useRef } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface Flake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  swayAmplitude: number;
  swaySpeed: number;
  swayOffset: number;
  opacity: number;
  isCrystal: boolean;
  crystalRotation: number;
  rotationSpeed: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export default function WinterFrostCanvas() {
  const { settings } = useSiteSettings();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isWinter = settings.theme?.preset === 'winter';
  const snowEnabled = isWinter && settings.theme?.winterSnowEnabled !== false;
  const frostVignette = isWinter && settings.theme?.winterFrostVignette !== false;
  const intensity = settings.theme?.winterSnowIntensity || 'moderate';

  useEffect(() => {
    if (!snowEnabled) return;

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

    // Number of flakes based on intensity
    let flakeCount = 55;
    if (intensity === 'subtle') flakeCount = 30;
    if (intensity === 'blizzard') flakeCount = 110;

    const flakes: Flake[] = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.7 + 0.35,
        speedX: (Math.random() - 0.5) * 0.3,
        swayAmplitude: Math.random() * 1.5 + 0.5,
        swaySpeed: Math.random() * 0.02 + 0.008,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.6 + 0.25,
        isCrystal: Math.random() > 0.65, // 35% are sparkling ice crystals
        crystalRotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        twinkleSpeed: Math.random() * 0.04 + 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];

        // Update positions
        f.y += f.speedY;
        f.x += Math.sin(time * f.swaySpeed + f.swayOffset) * f.swayAmplitude + f.speedX;
        f.crystalRotation += f.rotationSpeed;

        // Wrap around viewport
        if (f.y > height + 10) {
          f.y = -10;
          f.x = Math.random() * width;
        }
        if (f.x > width + 10) f.x = -10;
        if (f.x < -10) f.x = width + 10;

        // Calculate twinkling opacity
        const currentOpacity = Math.max(
          0.15,
          Math.min(0.9, f.opacity + Math.sin(time * f.twinkleSpeed + f.twinklePhase) * 0.2)
        );

        if (f.isCrystal) {
          // Draw sparkling ice crystal (4-point crystalline cross)
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.crystalRotation);
          ctx.strokeStyle = `rgba(186, 230, 253, ${currentOpacity})`;
          ctx.fillStyle = `rgba(224, 242, 254, ${currentOpacity * 1.1})`;
          ctx.lineWidth = 1;

          const size = f.radius * 2.2;
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(0, size);
          ctx.moveTo(-size, 0);
          ctx.lineTo(size, 0);
          ctx.stroke();

          // Center crystal dot
          ctx.beginPath();
          ctx.arc(0, 0, f.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // Draw soft floating snowflake
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(
            f.x,
            f.y,
            0,
            f.x,
            f.y,
            f.radius * 1.5
          );
          gradient.addColorStop(0, `rgba(224, 242, 254, ${currentOpacity})`);
          gradient.addColorStop(0.5, `rgba(125, 211, 252, ${currentOpacity * 0.7})`);
          gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');

          ctx.fillStyle = gradient;
          ctx.arc(f.x, f.y, f.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [snowEnabled, intensity]);

  if (!isWinter) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[65] overflow-hidden select-none"
    >
      {/* Cold Foggy Frost Ambient Vignette (Top & Corners) */}
      {frostVignette && (
        <>
          {/* Top Fog Shroud */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#38bdf8]/12 via-[#38bdf8]/04 to-transparent blur-2xl" />

          {/* Bottom Cold Atmosphere Shroud */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0284c7]/12 via-[#38bdf8]/04 to-transparent blur-2xl" />

          {/* Top Left Frost Aurora */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#38bdf8]/15 blur-[120px]" />

          {/* Bottom Right Glacial Glow */}
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#7dd3fc]/15 blur-[120px]" />

          {/* Subtle Crystalline Frost Edge Border */}
          <div className="absolute inset-0 border border-sky-400/10 shadow-[inset_0_0_60px_rgba(56,189,248,0.06)]" />
        </>
      )}

      {/* Falling Ice Crystals & Snowflake Canvas */}
      {snowEnabled && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
}
