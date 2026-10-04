import { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete?: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 400);
    }, 700);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-label="Loading portfolio"
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#080B0F] transition-opacity duration-300 ease-out pointer-events-none ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center px-4">
        <span className="text-xs uppercase tracking-[0.3em] text-[#FF4655] font-mono mb-3">
          PORTFOLIO ARCHIVE · VALORANT RED EDITION
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
          SAIFY SAMIT
        </h1>
        <div className="w-12 h-0.5 bg-[#FF4655] my-4 shadow-sm shadow-[#FF4655]/50" />
        <p className="text-xs sm:text-sm font-medium tracking-[0.2em] text-zinc-400 uppercase">
          GRAPHICS ARTIST / VISUAL DESIGNER
        </p>
      </div>
    </div>
  );
}
