import React from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useSiteSettings, SectionKey, SECTION_METADATA } from '../context/SiteSettingsContext';

interface SectionWrapperProps {
  sectionKey: SectionKey;
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export default function SectionWrapper({
  sectionKey,
  children,
  id,
  className = '',
}: SectionWrapperProps) {
  const { isAdmin } = useAdmin();
  const { settings, toggleSectionVisibility } = useSiteSettings();

  const isVisible = settings.sectionVisibility[sectionKey] !== false;
  const meta = SECTION_METADATA[sectionKey];

  // If visitor is regular user and section is hidden, do NOT render anything
  if (!isVisible && !isAdmin) {
    return null;
  }

  // If section is visible for everyone
  if (isVisible) {
    return (
      <div id={id} className={`relative group/secwrap ${className}`}>
        {/* Admin Section Visibility Button (Only shown to authenticated admin) */}
        {isAdmin && (
          <div className="absolute top-3 right-4 z-40 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSectionVisibility(sectionKey);
              }}
              title={`Click to make "${meta.label}" invisible to normal visitors`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#0E141B]/95 hover:bg-amber-950/90 text-zinc-300 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-500/80 shadow-xl backdrop-blur-md transition-all cursor-pointer group"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-amber-400 transition-colors" />
              <Eye className="w-3.5 h-3.5 text-emerald-400 group-hover:hidden" />
              <EyeOff className="w-3.5 h-3.5 text-amber-400 hidden group-hover:inline" />
              <span>{meta.label}: Visible</span>
              <span className="text-[10px] text-zinc-500 group-hover:text-amber-300 transition-colors">
                (Click to Hide)
              </span>
            </button>
          </div>
        )}

        {children}
      </div>
    );
  }

  // Section is HIDDEN from normal visitors, but shown to ADMIN with maintenance indicator
  return (
    <div
      id={id}
      className={`relative my-6 rounded-2xl border-2 border-dashed border-amber-500/50 bg-amber-950/10 overflow-hidden transition-all ${className}`}
    >
      {/* Prominent Admin Maintenance Banner for this hidden section */}
      <div className="sticky top-14 z-40 mx-3 my-3 p-3 sm:px-5 sm:py-2.5 bg-gradient-to-r from-amber-950/95 via-[#1a1207]/95 to-amber-950/95 border border-amber-500/80 rounded-xl backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-300">
                Section Invisible to Public Visitors
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                Maintenance
              </span>
            </div>
            <p className="text-[11px] text-zinc-300">
              <strong className="text-white font-medium">{meta.label}</strong> is currently hidden from normal visitors. You are seeing it in Admin Mode.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleSectionVisibility(sectionKey)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Make Visible to Visitors</span>
        </button>
      </div>

      <div className="opacity-95">
        {children}
      </div>
    </div>
  );
}
