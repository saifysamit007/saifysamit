import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      setIsDisabled(true);
      return;
    }

    let mouseX = -100;
    let mouseY = -100;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          if (cursorRef.current) {
            cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
          }
          rafId.current = null;
        });
      }

      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest('a') ||
            target.closest('button') ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('select') ||
            target.getAttribute('role') === 'button'
        );
        setIsPointer((prev) => (prev !== isClickable ? isClickable : prev));
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (isDisabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-50 transition-opacity duration-150"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: 'translate3d(-100px, -100px, 0)',
        willChange: 'transform',
      }}
    >
      {/* Outer subtle ring with Valorant Red */}
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF4655]/60 transition-all duration-150 ease-out ${
          isPointer
            ? 'w-10 h-10 bg-[#FF4655]/15 scale-110 border-[#FF4655]'
            : 'w-6 h-6 scale-100'
        }`}
      />
      {/* Center dot with Valorant Red */}
      <div
        className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FF4655] transition-opacity ${
          isPointer ? 'opacity-90 scale-75' : 'opacity-100'
        }`}
      />
    </div>
  );
}
