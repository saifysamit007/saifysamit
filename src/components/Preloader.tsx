import { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show the intro preloader animation, then smoothly fade out into the portfolio
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 450);
    }, 1100);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-label="Loading portfolio"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#080B0F] transition-opacity duration-450 ease-out pointer-events-none select-none ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Embedded 3D Keyframes matching Navbar effect */}
      <style>{`
        @keyframes preloader-text-3d-float {
          0% {
            transform: perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px);
            text-shadow: 2px 2px 0px #FF4655, 3px 3px 0px #ab222f, 4px 4px 10px rgba(0,0,0,0.85);
          }
          25% {
            transform: perspective(600px) rotateY(14deg) rotateX(-6deg) translateZ(8px);
            text-shadow: -2px 3px 0px #FF4655, -3px 4px 0px #ab222f, -4px 5px 14px rgba(255,70,85,0.5);
          }
          50% {
            transform: perspective(600px) rotateY(0deg) rotateX(8deg) translateZ(12px);
            text-shadow: 0px 3px 0px #FF4655, 0px 5px 0px #ab222f, 0px 8px 18px rgba(255,70,85,0.7);
          }
          75% {
            transform: perspective(600px) rotateY(-14deg) rotateX(-4deg) translateZ(8px);
            text-shadow: 2px 3px 0px #FF4655, 3px 4px 0px #ab222f, 4px 5px 14px rgba(255,70,85,0.5);
          }
          100% {
            transform: perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px);
            text-shadow: 2px 2px 0px #FF4655, 3px 3px 0px #ab222f, 4px 4px 10px rgba(0,0,0,0.85);
          }
        }
        .preloader-3d-text {
          display: inline-block;
          transform-style: preserve-3d;
          animation: preloader-text-3d-float 4s infinite ease-in-out;
          will-change: transform;
        }
      `}</style>

      <div className="flex flex-col items-center text-center px-4">
        {/* Navbar-style 3D dimensional extruded & floating SAIFY SAMIT text */}
        <h1 className="preloader-3d-text text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-wider text-white font-display uppercase">
          SAIFY SAMIT
        </h1>

        {/* Subtitle directly below */}
        <p className="mt-4 text-xs sm:text-sm font-mono font-medium tracking-[0.25em] text-zinc-400 uppercase">
          GRAPHICS ARTIST / VISUAL DESIGNER
        </p>
      </div>
    </div>
  );
}

