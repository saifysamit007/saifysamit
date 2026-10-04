import React from 'react';
import {
  Wrench,
  Clock,
  Mail,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  KeyRound,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function MaintenancePage() {
  const { openAccessModal } = useAdmin();
  const { settings } = useSiteSettings();

  const handleEmailClick = () => {
    window.location.href =
      'mailto:saifysamit@gmail.com?subject=' +
      encodeURIComponent('Project Inquiry during Portfolio Maintenance') +
      '&body=' +
      encodeURIComponent(
        'Hi Saify,\n\nI was trying to reach you on your portfolio while maintenance is underway. I would like to discuss a project:\n\nProject Scope:\nTimeline:\nBudget:'
      );
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/8801934994272?text=Hi%20Saify,%20I%20saw%20your%20portfolio%20maintenance%20page%20and%20want%20to%20hire%20you%20for%20a%20project!', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#080B0F] text-zinc-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-[#FF4655]/30 selection:text-white">
      {/* Background Decorative Grids & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,70,85,0.18),rgba(255,255,255,0))]" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top Brand Bar */}
      <header className="relative z-10 px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF4655]/15 border border-[#FF4655]/50 flex items-center justify-center text-[#FF4655] font-black font-display text-sm shadow-lg shadow-[#FF4655]/20">
            S
          </div>
          <div>
            <span className="font-display font-black tracking-wider text-white text-base">
              SAIFY SAMIT
            </span>
            <span className="block text-[10px] font-mono text-zinc-400">
              Commercial Graphic Designer & Key Visualist
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>System Maintenance</span>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Animated Central Emblem */}
          <div className="relative inline-block mx-auto">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#1a2332] to-[#0E141B] border border-[#FF4655]/50 flex items-center justify-center text-[#FF4655] shadow-2xl shadow-[#FF4655]/20 mx-auto relative group">
              <div className="absolute inset-0 rounded-3xl bg-[#FF4655]/10 animate-pulse pointer-events-none" />
              <Wrench className="w-12 h-12 sm:w-14 sm:h-14 text-[#FF4655] animate-bounce duration-1000" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>LIVE UPGRADE</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FF4655]/10 border border-[#FF4655]/30 text-[#FF4655] text-xs font-mono font-bold tracking-widest uppercase">
              Notice: Scheduled Maintenance
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-tight">
              Maintenance Underway
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              {settings.maintenanceMessage ||
                "Saify Samit's portfolio is currently undergoing scheduled visual upgrades and new commercial project deployments. We will be back online shortly."}
            </p>
          </div>

          {/* Status Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E141B]/90 border border-zinc-800 backdrop-blur-md text-left space-y-3 max-w-lg mx-auto shadow-2xl">
            <div className="flex items-center justify-between text-xs font-mono border-b border-zinc-800 pb-2.5">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF4655]" />
                CURRENT STATUS
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Deployment
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              New esports key visuals, tournament packaging, and commercial visual identity assets are being deployed to the live system.
            </p>

            <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60">
                Esports Identity
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60">
                Creator Thumbnails
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60">
                Stream Packages
              </span>
            </div>
          </div>

          {/* Direct Urgent Contact */}
          <div className="space-y-3 pt-2">
            <span className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
              Need immediate design work or tournament assets?
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleEmailClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#FF4655] hover:bg-[#ff5a68] text-white shadow-lg shadow-[#FF4655]/30 active:scale-95 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Email Saify Directly</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#1F2833] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 active:scale-95 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Message</span>
              </button>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="pt-4 flex items-center justify-center gap-4 text-xs font-mono text-zinc-400">
            <a
              href="https://www.behance.net/saifysamit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Behance</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </a>
            <span className="text-zinc-700">•</span>
            <a
              href="https://www.linkedin.com/in/saifysamit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500" />
            </a>
            <span className="text-zinc-700">•</span>
            <a
              href="mailto:saifysamit@gmail.com"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>saifysamit@gmail.com</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer with subtle Owner Login Link */}
      <footer className="relative z-10 px-6 py-4 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800/60 text-xs font-mono text-zinc-500">
        <div>
          © {new Date().getFullYear()} Saify Samit. All rights reserved.
        </div>

        {/* Subtle Admin Unlock Trigger */}
        <button
          type="button"
          onClick={openAccessModal}
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer text-[11px]"
          title="Owner Passcode Unlock"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Owner Access</span>
        </button>
      </footer>
    </div>
  );
}
