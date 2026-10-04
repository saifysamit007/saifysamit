import React from 'react';
import {
  ArrowLeft,
  Home,
  Mail,
  Compass,
  Layers,
  Sparkles,
  HelpCircle,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome: (targetAnchor?: string) => void;
}

export default function NotFoundPage({ onNavigateHome }: NotFoundPageProps) {
  const quickLinks = [
    {
      title: 'Selected Work',
      desc: 'Browse commercial design & esports projects',
      anchor: '#work',
      icon: Layers,
    },
    {
      title: 'Services & Deliverables',
      desc: 'Esports branding, visual identity & stream kits',
      anchor: '#services',
      icon: Sparkles,
    },
    {
      title: 'About Philosophy',
      desc: '6+ years commercial creative background',
      anchor: '#about',
      icon: Compass,
    },
    {
      title: 'Direct Contact',
      desc: 'Book a commercial inquiry or request pricing',
      anchor: '#contact',
      icon: Mail,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080B0F] text-zinc-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#FF4655]/30 selection:text-white">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,70,85,0.15),transparent_60%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Navbar */}
      <header className="relative z-10 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-zinc-800/60">
        <button
          type="button"
          onClick={() => onNavigateHome()}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FF4655]/15 border border-[#FF4655]/50 flex items-center justify-center text-[#FF4655] font-black font-display text-sm group-hover:scale-105 transition-transform shadow-lg shadow-[#FF4655]/20">
            S
          </div>
          <div>
            <span className="font-display font-black tracking-wider text-white text-base group-hover:text-[#FF4655] transition-colors">
              SAIFY SAMIT
            </span>
            <span className="block text-[10px] font-mono text-zinc-400">
              Commercial Graphic Designer
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigateHome()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 transition-all cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 text-[#FF4655]" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main 404 Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Cyberpunk Glitch 404 Big Numbers */}
          <div className="relative inline-block select-none">
            <h1
              className="text-8xl sm:text-9xl md:text-[11rem] font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 leading-none drop-shadow-[0_10px_35px_rgba(255,70,85,0.4)]"
            >
              404
            </h1>
            <div className="absolute -top-3 -right-4 px-2.5 py-0.5 rounded-md bg-[#FF4655] text-white text-[10px] font-mono font-black tracking-widest uppercase shadow-lg shadow-[#FF4655]/50">
              NOT FOUND
            </div>
          </div>

          {/* Copy and Explanation */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs font-mono font-bold tracking-widest uppercase">
              Route Error // Coordinates Missing
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              Signal Lost: Page Not Found
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              The project case study, visual sector, or custom link you are trying to access does not exist or has been relocated by Saify Samit.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateHome()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#FF4655] hover:bg-[#ff5a68] text-white shadow-xl shadow-[#FF4655]/30 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Portfolio</span>
            </button>

            <a
              href="mailto:saifysamit@gmail.com?subject=Broken%20Link%20Report"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 active:scale-95 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#FF4655]" />
              <span>Contact Saify</span>
            </a>
          </div>

          {/* Quick Route Discovery Cards */}
          <div className="pt-6">
            <span className="block text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">
              Explore Active Portfolio Sectors
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => onNavigateHome(item.anchor)}
                    className="p-3.5 rounded-xl bg-[#0E141B] hover:bg-[#141B24] border border-zinc-800 hover:border-[#FF4655]/50 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#FF4655]" />
                        <span className="text-xs font-bold text-white font-display group-hover:text-[#FF4655] transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#FF4655] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 max-w-7xl mx-auto w-full flex items-center justify-between border-t border-zinc-800/60 text-xs font-mono text-zinc-500">
        <div>
          © {new Date().getFullYear()} Saify Samit • Commercial Graphics & Key Visuals
        </div>
        <div className="text-[11px] text-zinc-600">
          NODE: 404_OFF_GRID
        </div>
      </footer>
    </div>
  );
}
