import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, SlidersHorizontal, EyeOff, ChevronRight, Mail } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useSiteSettings, SectionKey } from '../context/SiteSettingsContext';

interface NavbarProps {
  onContactClick: () => void;
}

export default function Navbar({ onContactClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const { isAdmin, openAccessModal } = useAdmin();
  const { settings, openSectionManager } = useSiteSettings();


  // Order matches the actual vertical flow in the page:
  // Hero -> Work (#work) -> Services (#services) -> About (#about) -> Process (#process) -> Testimonials -> Contact (#contact)
  const allNavLinks: { name: string; href: string; sectionKey: SectionKey; num: string }[] = [
    { name: 'Work', href: '#work', sectionKey: 'work', num: '01' },
    { name: 'Services', href: '#services', sectionKey: 'services', num: '02' },
    { name: 'About', href: '#about', sectionKey: 'about', num: '03' },
    { name: 'Process', href: '#process', sectionKey: 'process', num: '04' },
    { name: 'Contact', href: '#contact', sectionKey: 'contact', num: '05' },
  ];

  // For visitors: only show links of visible sections. For admin: show all (with hidden indicator).
  const visibleNavLinks = allNavLinks.filter((link) => {
    if (isAdmin) return true;
    return settings.sectionVisibility[link.sectionKey] !== false;
  });

  // Track active section on scroll with robust viewport position calculation
  useEffect(() => {
    const sectionIds = ['work', 'services', 'about', 'process', 'contact'];
    
    const handleScroll = () => {
      // If at very top (in Hero section), no specific sub-segment link is selected
      if (window.scrollY < 180) {
        setActiveSection('');
        return;
      }

      // Check if user has scrolled to the bottom of the page (then Contact is active)
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (window.scrollY + windowHeight >= docHeight - 80) {
        setActiveSection('contact');
        return;
      }

      // Viewport trigger threshold: slightly above middle of screen (35% from top)
      const triggerY = 200;
      let currentActive = '';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If the top of the element has reached or passed trigger line, and its bottom is still below trigger line
          if (rect.top <= triggerY && rect.bottom > 80) {
            currentActive = id;
          }
        }
      }

      if (currentActive) {
        setActiveSection(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger initially and on slight delay to account for images/hydration
    handleScroll();
    const timeout = setTimeout(handleScroll, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on window resize past md breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const navOffset = 68; // height of fixed header + safety margin
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[90] glass-navbar py-2.5 sm:py-3 transition-all duration-300">
      {/* Embedded 3D keyframes & Frosted Glassmorphism Styles */}
      <style>{`
        .glass-navbar {
          background: rgba(8, 11, 15, 0.88) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          will-change: transform;
        }
        .glass-drawer {
          background: rgba(8, 11, 15, 0.96) !important;
          backdrop-filter: blur(28px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
          border-bottom: 1px solid rgba(255, 70, 85, 0.25) !important;
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
          flex-shrink: 0;
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
          gap: 9px;
          text-decoration: none;
        }
        .animated-3d-text {
          display: inline-block;
          transform-style: preserve-3d;
          animation: text-3d-float 5s infinite ease-in-out;
          will-change: transform;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 sm:h-12">
          {/* Zone 1: Distinct 3D Animated Logo Emblem + 3D Extruded Floating Text */}
          <a
            href="#"
            className="animated-3d-brand font-black tracking-wider text-white hover:text-[#FF4655] transition-colors font-display whitespace-nowrap py-1 group shrink-0 min-w-0"
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

            {/* 3D Dimensional Extruded & Tilting Text with responsive font-size */}
            <span className="animated-3d-text text-sm min-[380px]:text-base sm:text-lg md:text-xl text-white font-extrabold tracking-wider">
              SAIFY SAMIT
            </span>
          </a>

          {/* Zone 2: Desktop clean single-line text links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-5 lg:gap-8 text-sm font-medium text-zinc-300"
          >
            {visibleNavLinks.map((link) => {
              const isHidden = settings.sectionVisibility[link.sectionKey] === false;
              const isActive = activeSection === link.sectionKey;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative py-1 transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#FF4655] font-semibold'
                      : isHidden
                      ? 'text-amber-400/90 hover:text-amber-300'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={isHidden ? `${link.name} (Hidden from public visitors)` : undefined}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF4655] rounded-full shadow-[0_0_8px_#FF4655]" />
                  )}
                  {isAdmin && isHidden && (
                    <EyeOff className="w-3 h-3 text-amber-400 shrink-0" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary action CTA & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Quick Buttons (desktop / tablet) */}
            {isAdmin && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={openAccessModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[#FF4655]/15 hover:bg-[#FF4655]/25 text-[#FF4655] border border-[#FF4655]/40 shadow-sm transition-all cursor-pointer"
                  title="Open Admin Control & Data Pack Hub"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4655] animate-pulse" />
                  <span>Admin Hub</span>
                </button>
                <button
                  type="button"
                  onClick={openSectionManager}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[#0E141B] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 shadow-sm transition-all cursor-pointer"
                  title="Manage Section Visibilities & Maintenance Mode"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4655]" />
                  <span className="hidden xl:inline">Sections</span>
                </button>
              </div>
            )}


            {/* Tablet / Desktop CTA */}
            <button
              onClick={onContactClick}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shadow-md shadow-[#FF4655]/25 cursor-pointer"
            >
              Let's Work Together
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {/* Mobile menu button (Standard 44x44px touch target) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 hover:border-[#FF4655]/40 rounded-xl transition-all active:scale-95 cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#FF4655] transition-transform duration-200 rotate-90 animate-in spin-in-90" />
              ) : (
                <Menu className="w-5 h-5 transition-transform duration-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[52px] sm:top-[56px] bg-black/75 backdrop-blur-md z-[-1] md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer with Frosted Glass, Touch Accessibility & Safe-Area Inset */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="md:hidden glass-drawer border-t border-white/10 px-4 sm:px-6 pt-3 shadow-2xl transition-all duration-300 max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain animate-in fade-in slide-in-from-top-2"
          style={{
            paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom, 1.75rem))',
          }}
        >
          <nav className="flex flex-col space-y-1">
            {/* Nav Links */}
            {visibleNavLinks.map((link) => {
              const isHidden = settings.sectionVisibility[link.sectionKey] === false;
              const isActive = activeSection === link.sectionKey;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`min-h-[48px] px-3.5 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${
                    isActive
                      ? 'bg-[#FF4655]/10 text-white border border-[#FF4655]/30 shadow-sm shadow-[#FF4655]/10 font-semibold'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono font-bold tracking-wider ${
                        isActive ? 'text-[#FF4655]' : 'text-zinc-500 group-hover:text-[#FF4655]/80'
                      }`}
                    >
                      {link.num}
                    </span>
                    <span className="text-base tracking-wide">{link.name}</span>
                    {isAdmin && isHidden && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <EyeOff className="w-2.5 h-2.5" /> Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF4655] shadow-[0_0_8px_#FF4655] mr-1.5" />
                    )}
                    <ChevronRight
                      className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? 'text-[#FF4655]' : 'text-zinc-600 group-hover:text-zinc-400'
                      }`}
                    />
                  </div>
                </a>
              );
            })}

            {/* Admin Controls Section for Mobile */}
            {isAdmin && (
              <div className="pt-2 pb-1">
                <div className="p-3 rounded-xl bg-[#0E141B] border border-zinc-700/80 shadow-inner">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                    <span className="text-[11px] font-mono font-semibold text-amber-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      ADMIN MODE ACTIVE
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openSectionManager();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-mono font-semibold text-zinc-200 bg-zinc-800/90 hover:bg-zinc-700 active:scale-[0.98] border border-zinc-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4655]" />
                    <span>Manage Sections & Maintenance</span>
                  </button>
                </div>
              </div>
            )}

            {/* Status Pill & Quick Contact */}
            <div className="pt-3 pb-1 border-t border-white/5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-zinc-300 font-mono text-[11px] tracking-wide">
                    AVAILABLE FOR PROJECTS
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">Q4 2026 / 2027</span>
              </div>

              <a
                href="mailto:saifysamit@gmail.com"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] active:bg-white/[0.09] border border-white/5 text-xs text-zinc-300 hover:text-white transition-colors group"
              >
                <span className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#FF4655] shrink-0" />
                  <span className="truncate font-mono">saifysamit@gmail.com</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500 group-hover:text-[#FF4655] transition-colors shrink-0">
                  Direct Email ↗
                </span>
              </a>
            </div>

            {/* Primary Mobile CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onContactClick();
                }}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold uppercase tracking-widest text-white bg-gradient-to-r from-[#FF4655] to-[#ff2b3d] rounded-xl hover:from-[#ff5a68] hover:to-[#FF4655] active:scale-[0.98] transition-all shadow-lg shadow-[#FF4655]/30 cursor-pointer"
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
