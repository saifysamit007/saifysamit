import React from 'react';
import {
  X,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Power,
  RotateCcw,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
  Compass,
  MessageSquare,
  Mail,
  Flame,
  Globe,
  Zap,
} from 'lucide-react';
import {
  useSiteSettings,
  SectionKey,
  SECTION_METADATA,
  DEFAULT_FAVICON_SVG,
} from '../context/SiteSettingsContext';
import { useAdmin } from '../context/AdminContext';

export default function SectionManagerModal() {
  const { isAdmin } = useAdmin();
  const {
    settings,
    isSectionManagerOpen,
    closeSectionManager,
    toggleSectionVisibility,
    toggleMaintenanceMode,
    resetAllSectionsToVisible,
    openFaviconModal,
    togglePreloader,
  } = useSiteSettings();

  if (!isAdmin || !isSectionManagerOpen) {
    return null;
  }

  const sectionKeys: SectionKey[] = [
    'hero',
    'work',
    'services',
    'about',
    'process',
    'testimonials',
    'contact',
  ];

  const getSectionIcon = (key: SectionKey) => {
    switch (key) {
      case 'hero':
        return Flame;
      case 'work':
        return Layers;
      case 'services':
        return Sparkles;
      case 'about':
        return Compass;
      case 'process':
        return SlidersHorizontal;
      case 'testimonials':
        return MessageSquare;
      case 'contact':
        return Mail;
    }
  };

  const hiddenCount = sectionKeys.filter(
    (k) => settings.sectionVisibility[k] === false
  ).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-manager-title"
      className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#0E141B] border border-zinc-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF4655]/15 border border-[#FF4655]/40 flex items-center justify-center text-[#FF4655]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 id="section-manager-title" className="text-base font-bold text-white font-display">
                Section & Maintenance Manager
              </h2>
              <span className="text-[11px] font-mono text-zinc-400">
                Control what normal visitors can see on your live portfolio
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSectionManager}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-5 pr-1 flex-1">
          {/* Global Maintenance Mode Box */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              settings.maintenanceMode
                ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/40'
                : 'bg-zinc-900/60 border-zinc-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Global Site Maintenance Mode
                  </span>
                  {settings.maintenanceMode ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500 text-white animate-pulse">
                      ACTIVE (SITE OFFLINE)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30">
                      Normal (Live)
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  When enabled, normal visitors visiting your URL will only see the "Maintenance Underway" screen. You can still view and edit everything as Admin.
                </p>
              </div>

              {/* 1-Click Toggle Button */}
              <button
                type="button"
                onClick={() => toggleMaintenanceMode()}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  settings.maintenanceMode
                    ? 'bg-white hover:bg-zinc-200 text-red-950 shadow-md'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{settings.maintenanceMode ? 'Turn OFF' : 'Turn ON (1-Click)'}</span>
              </button>
            </div>
          </div>

          {/* Favicon Quick Action Bar */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0E141C] border border-zinc-700 flex items-center justify-center p-1 shrink-0">
                <img
                  src={settings.faviconUrl || DEFAULT_FAVICON_SVG}
                  alt="Favicon"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-white block">
                  Website Favicon & Browser Tab Branding
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Custom icon with live Dark/Light theme previews & pixel guidelines
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                closeSectionManager();
                openFaviconModal();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#141B24] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF4655]" />
              <span>Favicon Tool</span>
            </button>
          </div>

          {/* Preloader Animation Control Bar */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0E141C] border border-zinc-700 flex items-center justify-center text-[#FF4655] shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white block">
                    Intro Preloader Animation
                  </span>
                  {settings.preloaderEnabled !== false ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                      ENABLED (ON)
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700">
                      DISABLED (OFF)
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {settings.preloaderEnabled !== false
                    ? 'First-time visitors see signature red cinematic intro before reveal'
                    : 'Visitors instantly enter portfolio homepage without loading delay'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => togglePreloader()}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.preloaderEnabled !== false ? 'bg-[#FF4655]' : 'bg-zinc-800'
              }`}
              aria-label="Toggle Preloader"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.preloaderEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section Visibility List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 uppercase tracking-wider">
                Individual Section Visibility ({7 - hiddenCount}/7 Visible)
              </span>
              {hiddenCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllSectionsToVisible}
                  className="inline-flex items-center gap-1 text-[11px] text-[#FF4655] hover:text-[#ff6a77] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Show All Sections</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {sectionKeys.map((key) => {
                const meta = SECTION_METADATA[key];
                const isVis = settings.sectionVisibility[key] !== false;
                const Icon = getSectionIcon(key);

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isVis
                        ? 'bg-[#141B24]/70 border-zinc-800 hover:border-zinc-700'
                        : 'bg-amber-950/20 border-amber-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isVis
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {meta.label}
                          </span>
                          {!isVis && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {meta.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isVis
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-md'
                      }`}
                    >
                      {isVis ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hidden (Unhide)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between shrink-0 text-xs font-mono text-zinc-400">
          <span>Changes are saved automatically & synced to live server.</span>
          <button
            type="button"
            onClick={closeSectionManager}
            className="px-4 py-2 rounded-lg bg-[#1F2833] hover:bg-zinc-800 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
