import React from 'react';
import { AlertTriangle, Power, SlidersHorizontal } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function MaintenanceAlertBanner() {
  const { isAdmin } = useAdmin();
  const { settings, toggleMaintenanceMode, openSectionManager } = useSiteSettings();

  if (!isAdmin || !settings.maintenanceMode) {
    return null;
  }

  return (
    <aside
      aria-label="Maintenance mode active banner"
      className="sticky top-0 z-[100] w-full bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-b border-red-500/70 text-white shadow-2xl px-4 py-2.5 sm:py-2 transition-all animate-in slide-in-from-top duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-red-500/30 border border-red-400 flex items-center justify-center shrink-0 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-300" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold font-mono tracking-wider text-red-200 uppercase">
                Global Maintenance Mode Active
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-mono font-bold animate-pulse">
                PUBLIC OFFLINE
              </span>
            </div>
            <p className="text-[11px] text-zinc-300">
              Visitors entering the website see only the maintenance screen. You have admin bypass access.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openSectionManager}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-200 bg-black/40 hover:bg-black/60 border border-red-500/40 hover:border-red-400 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-red-300" />
            <span>Section Controls</span>
          </button>

          <button
            type="button"
            onClick={() => toggleMaintenanceMode(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-white hover:bg-zinc-100 text-red-950 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Power className="w-3.5 h-3.5 text-red-600" />
            <span>Turn Off Maintenance (1-Click)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
