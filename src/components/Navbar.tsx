import { useState } from 'react';
import { Menu, X, ArrowUpRight, SlidersHorizontal, EyeOff, Palette } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useSiteSettings, SectionKey } from '../context/SiteSettingsContext';

interface NavbarProps {
  onContactClick: () => void;
}

export default function Navbar({ onContactClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAdmin } = useAdmin();
  const { settings, openSectionManager, openCustomizer } = useSiteSettings();

  const allNavLinks: { name: string; href: string; sectionKey: SectionKey }[] = [
    { name: 'Work', href: '#work', sectionKey: 'work' },
    { name: 'About', href: '#about', sectionKey: 'about' },
    { name: 'Services', href: '#services', sectionKey: 'services' },
    { name: 'Process', href: '#process', sectionKey: 'process' },
    { name: 'Contact', href: '#contact', sectionKey: 'contact' },
  ];

  // For visitors: only show links of visible sections. For admin: show all (with hidden indicator).
  const visibleNavLinks = allNavLinks.filter((link) => {
    if (isAdmin) return true;
    return settings.sectionVisibility[link.sectionKey] !== false;
  });

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[90] glass-navbar py-3 sm:py-3.5 transition-all duration-300">
      {/* Embedded 3D keyframes & Frosted Glassmorphism Styles */}
      <style>{`
        .glass-navbar {
          background: rgba(8, 11, 15, 0.85) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .glass-drawer {
          background: rgba(8, 11, 15, 0.94) !important;
          backdrop-filter: blur(24px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        @keyframes rotate-cube-3d {
          0% {
            transform: rotateX(20deg) rotateY(0deg) rotateZ(0deg);
          }
          50% {
            transform: rotateX(35deg) rotateY(180deg) rotateZ(15deg);
          }
          100% {
            transform: rotateX(20deg) rotateY(360deg) rotateZ(0deg);
          }
        }
        @keyframes text-3d-float {
          0% {
            transform: perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px);
            text-shadow: 1px 1px 0px #FF4655, 2px 2px 0px #ab222f, 3px 3px 6px rgba(0,0,0,0.8);
          }
          25% {
            transform: perspective(600px) rotateY(14deg) rotateX(-6deg) translateZ(6px);
            text-shadow: -1px 2px 0px #FF4655, -2px 3px 0px #ab222f, -3px 4px 10px rgba(255,70,85,0.4);
          }
          50% {
            transform: perspective(600px) rotateY(0deg) rotateX(8deg) translateZ(10px);
            text-shadow: 0px 2px 0px #FF4655, 0px 4px 0px #ab222f, 0px 6px 14px rgba(255,70,85,0.6);
          }
          75% {
            transform: perspective(600px) rotateY(-14deg) rotateX(-4deg) translateZ(6px);
            text-shadow: 1px 2px 0px #FF4655, 2px 3px 0px #ab222f, 3px 4px 10px rgba(255,70,85,0.4);
          }
          100% {
            transform: perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0px);
            text-shadow: 1px 1px 0px #FF4655, 2px 2px 0px #ab222f, 3px 3px 6px rgba(0,0,0,0.8);
          }
        }
        .cube-container-3d {
          width: 18px;
          height: 18px;
          perspective: 600px;
          display: inline-block;
        }
        .cube-3d {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate-cube-3d 6s infinite linear;
        }
        .cube-face {
          position: absolute;
          width: 18px;
          height: 18px;
          border: 1px solid rgba(255, 70, 85, 0.8);
          box-shadow: inset 0 0 4px rgba(255, 70, 85, 0.4);
        }
        .cube-face-front  { background: rgba(255, 70, 85, 0.85); transform: rotateY(0deg) translateZ(9px); }
        .cube-face-back   { background: rgba(14, 20, 27, 0.9);   transform: rotateY(180deg) translateZ(9px); }
        .cube-face-right  { background: rgba(255, 90, 104, 0.8); transform: rotateY(90deg) translateZ(9px); }
        .cube-face-left   { background: rgba(180, 20, 35, 0.9);  transform: rotateY(-90deg) translateZ(9px); }
        .cube-face-top    { background: rgba(255, 120, 130, 0.9);transform: rotateX(90deg) translateZ(9px); }
        .cube-face-bottom { background: rgba(8, 11, 15, 0.95);   transform: rotateX(-90deg) translateZ(9px); }
        
        .animated-3d-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .animated-3d-text {
          display: inline-block;
          transform-style: preserve-3d;
          animation: text-3d-float 5s infinite ease-in-out;
          will-change: transform;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 sm:h-12">
          {/* Zone 1: Distinct 3D Animated Logo Emblem + 3D Extruded Floating Text */}
          <a
            href="#"
            className="animated-3d-brand text-base sm:text-lg md:text-xl font-black tracking-wider text-white hover:text-[#FF4655] transition-colors font-display whitespace-nowrap py-1 group shrink-0"
            aria-label="Saify Samit home"
          >
            {/* Live 3D Rotating Isometric Cube */}
            <div className="cube-container-3d">
              <div className="cube-3d">
                <div className="cube-face cube-face-front" />
                <div className="cube-face cube-face-back" />
                <div className="cube-face cube-face-right" />
                <div className="cube-face cube-face-left" />
                <div className="cube-face cube-face-top" />
                <div className="cube-face cube-face-bottom" />
              </div>
            </div>

            {/* 3D Dimensional Extruded & Tilting Text */}
            <span className="animated-3d-text text-white">
              SAIFY SAMIT
            </span>
          </a>

          {/* Zone 2: Clean single-line text links matching footer */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-zinc-300"
          >
            {visibleNavLinks.map((link) => {
              const isHidden = settings.sectionVisibility[link.sectionKey] === false;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative py-1 transition-colors flex items-center gap-1.5 ${
                    isHidden
                      ? 'text-amber-400/90 hover:text-amber-300'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={isHidden ? `${link.name} (Hidden from public visitors)` : undefined}
                >
                  <span>{link.name}</span>
                  {isAdmin && isHidden && (
                    <EyeOff className="w-3 h-3 text-amber-400 shrink-0" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary action CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Quick Buttons: Sections & Theme Studio */}
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={openCustomizer}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 hover:text-white border border-sky-500/50 shadow-sm transition-all cursor-pointer"
                  title="Theme Studio (Winter Theme & Text Customization)"
                >
                  <Palette className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span className="hidden xl:inline">Theme</span>
                </button>

                <button
                  type="button"
                  onClick={openSectionManager}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[#0E141B] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 shadow-sm transition-all cursor-pointer"
                  title="Manage Section Visibilities & Maintenance Mode"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4655]" />
                  <span className="hidden xl:inline">Sections</span>
                </button>
              </>
            )}

            <button
              onClick={onContactClick}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] active:scale-[0.98] rounded transition-all whitespace-nowrap shadow-md shadow-[#FF4655]/25"
            >
              Let's Work Together
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#FF4655]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with frosted glass effect */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-drawer px-5 pt-3 pb-6 transition-all shadow-2xl animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1">
            {visibleNavLinks.map((link) => {
              const isHidden = settings.sectionVisibility[link.sectionKey] === false;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="py-3 px-2 text-sm font-medium text-zinc-200 hover:text-[#FF4655] hover:bg-white/5 rounded-lg transition-colors border-b border-[#1F2833]/50 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span>{link.name}</span>
                    {isAdmin && isHidden && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <EyeOff className="w-2.5 h-2.5" /> Hidden
                      </span>
                    )}
                  </span>
                  <span className="text-zinc-600 text-xs font-mono">→</span>
                </a>
              );
            })}

            {isAdmin && (
              <div className="pt-2 pb-1 space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openCustomizer();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-mono font-semibold text-sky-300 bg-sky-950/40 border border-sky-500/50 rounded-lg hover:bg-sky-900/60 transition-colors"
                >
                  <Palette className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Theme Studio (Winter Theme & Copy)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openSectionManager();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-mono font-semibold text-zinc-200 bg-[#141B24] border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4655]" />
                  <span>Manage Sections & Maintenance</span>
                </button>
              </div>
            )}

            <div className="pt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onContactClick();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] rounded-lg hover:bg-[#ff5a68] transition-colors shadow-lg shadow-[#FF4655]/30 active:scale-[0.98]"
              >
                <span>Let's Work Together</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
