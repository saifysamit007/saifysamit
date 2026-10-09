import { useState } from 'react';
import { ArrowUp, Check, Copy, ShieldCheck } from 'lucide-react';
import { ARTIST_PROFILE } from '../data/portfolioData';
import { useAdmin } from '../context/AdminContext';

export default function Footer() {
  const { isAdmin, openAccessModal } = useAdmin();
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  const scrollToTop = () => {
    // Ultra smooth scroll to top
    const start = window.pageYOffset || document.documentElement.scrollTop;
    if (start === 0) return;

    const duration = 1400; // Slow, graceful cinematic upward glide
    let startTimestamp: number | null = null;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, start * (1 - easedProgress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  const handleCopyDiscord = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(ARTIST_PROFILE.socials.discord);
    setCopiedDiscord(true);
    setTimeout(() => setCopiedDiscord(false), 2000);
  };

  return (
    <footer className="bg-[#080B0F] border-t border-[#1F2833] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-12 border-b border-[#1F2833]">
          <div>
            <span className="text-xl sm:text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FF4655] rounded-xs" />
              <span>SAIFY SAMIT</span>
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF4655] mt-1 block font-semibold">
              GRAPHICS ARTIST / VISUAL DESIGNER
            </span>
          </div>

          {/* Ultra smooth Back to top button */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#FF4655] transition-colors group px-3.5 py-2 rounded-lg border border-zinc-800 hover:border-[#1F2833] bg-[#0E141B] cursor-pointer"
            aria-label="Back to top"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-1 transition-transform text-[#FF4655]" />
          </button>
        </div>

        {/* Bottom Social Links in requested order: discord, behance, instagram, linkedin */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* 1. Discord */}
            <button
              onClick={handleCopyDiscord}
              className="text-zinc-300 hover:text-[#5865F2] transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
              title="Click to copy Discord handle"
            >
              <span className="w-2 h-2 rounded-full bg-[#5865F2]" />
              <span>Discord: <strong className="text-white font-mono">{ARTIST_PROFILE.socials.discord}</strong></span>
              {copiedDiscord ? (
                <span className="text-emerald-400 text-[10px] ml-1 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Copied!
                </span>
              ) : (
                <Copy className="w-3 h-3 text-zinc-500 hover:text-white" />
              )}
            </button>

            <span className="text-zinc-700" aria-hidden="true">/</span>

            {/* 2. Behance */}
            <a
              href={ARTIST_PROFILE.socials.behance}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-[#FF4655] transition-colors font-medium flex items-center gap-1.5"
            >
              <span>Behance</span>
            </a>

            <span className="text-zinc-700" aria-hidden="true">/</span>

            {/* 3. Instagram */}
            <a
              href={ARTIST_PROFILE.socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-[#FF4655] transition-colors font-medium flex items-center gap-1.5"
            >
              <span>Instagram</span>
            </a>

            <span className="text-zinc-700" aria-hidden="true">/</span>

            {/* 4. LinkedIn */}
            <a
              href={ARTIST_PROFILE.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-[#FF4655] transition-colors font-medium flex items-center gap-1.5"
            >
              <span>LinkedIn</span>
            </a>
          </div>

          <div className="flex items-center gap-2 text-zinc-500">
            <span>
              © 2026{' '}
              <a
                href="https://www.instagram.com/saify_samit/"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 hover:text-[#FF4655] underline-offset-4 hover:underline transition-colors font-medium"
              >
                Saify Samit
              </a>
              . All rights reserved.
            </span>
            {isAdmin && (
              <button
                onClick={openAccessModal}
                className="text-emerald-400 p-1 rounded transition-colors inline-flex items-center gap-1 text-[11px] font-mono bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full cursor-pointer"
                title="Owner Mode Active (Click to manage)"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Owner</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
