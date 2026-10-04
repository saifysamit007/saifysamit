import { useState } from 'react';
import {
  Lock,
  Unlock,
  X,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  LogOut,
  Check,
  Settings2,
  Clock,
  Loader2,
  Power,
  SlidersHorizontal,
  Globe,
  Zap,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useSiteSettings, DEFAULT_FAVICON_SVG } from '../context/SiteSettingsContext';
import SectionManagerModal from './SectionManagerModal';
import FaviconModal from './FaviconModal';
import Preloader from './Preloader';

export default function AdminAccessModal() {
  const {
    isAdmin,
    loginAsAdmin,
    logoutAdmin,
    changePasscode,
    isAccessModalOpen,
    closeAccessModal,
    lockoutRemaining,
  } = useAdmin();

  const {
    settings,
    toggleMaintenanceMode,
    openSectionManager,
    openFaviconModal,
    togglePreloader,
  } = useSiteSettings();

  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPreloaderPreview, setShowPreloaderPreview] = useState(false);

  // Change Passcode State
  const [showChangePass, setShowChangePass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [changeStatus, setChangeStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await loginAsAdmin(passcode);
      if (!result.success) {
        setErrorMessage(result.error || 'Incorrect passcode. Access denied.');
      } else {
        setPasscode('');
        setErrorMessage(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeStatus(null);
    setIsSubmitting(true);
    try {
      const res = await changePasscode(currentPass, newPass);
      if (res.success) {
        setChangeStatus({ success: true, msg: 'Passcode successfully updated and secured!' });
        setCurrentPass('');
        setNewPass('');
        setTimeout(() => {
          setShowChangePass(false);
          setChangeStatus(null);
        }, 1500);
      } else {
        setChangeStatus({ success: false, msg: res.error || 'Could not update passcode.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Owner Mode Active Indicator for Saify */}
      {isAdmin && (
        <div className="fixed bottom-4 left-4 z-[85] flex items-center gap-1.5 sm:gap-2 bg-[#0E141B]/95 backdrop-blur-md border border-[#FF4655]/60 text-white px-3 py-1.5 rounded-full shadow-2xl text-xs font-mono animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-zinc-200">Owner Mode</span>

          {/* Quick Favicon Customizer */}
          <button
            type="button"
            onClick={openFaviconModal}
            className="ml-1 inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-[#FF4655] border-l border-zinc-700 pl-2 transition-colors cursor-pointer"
            title="Customize Website Favicon & Browser Tab Branding"
          >
            <Globe className="w-3 h-3 text-[#FF4655]" />
            <span className="hidden sm:inline">Favicon</span>
          </button>

          {/* Quick Section & Maintenance Manager */}
          <button
            type="button"
            onClick={openSectionManager}
            className="ml-1 inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-[#FF4655] border-l border-zinc-700 pl-2 transition-colors cursor-pointer"
            title="Manage Section Visibilities & Maintenance Mode"
          >
            <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Sections</span>
          </button>

          <button
            type="button"
            onClick={logoutAdmin}
            className="ml-1 inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-400 border-l border-zinc-700 pl-2 transition-colors cursor-pointer"
            title="Lock & Exit Owner Mode"
          >
            <LogOut className="w-3 h-3" />
            <span>Lock</span>
          </button>
        </div>
      )}

      {/* Secret Trigger button in footer if not logged in (rendered in Footer, but also shortcut available) */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#0E141B] border border-[#1F2833] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1F2833]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF4655]/15 border border-[#FF4655]/40 flex items-center justify-center text-[#FF4655]">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    Owner Access
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Secure Portfolio Portal
                  </span>
                </div>
              </div>

              <button
                onClick={closeAccessModal}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isAdmin ? (
              <div className="space-y-4 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-bold text-white font-display mb-1">
                    Owner Mode Currently Unlocked
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    You have full permission to add, edit, or delete projects, hero backgrounds, services, and client testimonials.
                  </p>
                </div>

                {/* 1-Click Maintenance Mode & Section Visibility Controls */}
                <div className="p-3 rounded-xl bg-[#080B0F] border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">
                        Site Maintenance Mode
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {settings.maintenanceMode ? 'Active (public sees maintenance)' : 'Off (live portfolio visible)'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMaintenanceMode()}
                      className={`px-2.5 py-1 text-xs font-mono font-bold uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        settings.maintenanceMode
                          ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{settings.maintenanceMode ? 'ACTIVE (OFF)' : '1-Click ON'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closeAccessModal();
                      openSectionManager();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-mono text-zinc-300 hover:text-white bg-[#141B24] hover:bg-[#1a2330] border border-zinc-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4655]" />
                    <span>Manage Section Visibilities</span>
                  </button>
                </div>

                {/* Favicon & Tab Branding Card */}
                <div className="p-3 rounded-xl bg-[#080B0F] border border-zinc-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#16191E] border border-zinc-700 flex items-center justify-center p-1 shrink-0">
                      <img
                        src={settings.faviconUrl || DEFAULT_FAVICON_SVG}
                        alt="Current Favicon"
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">
                        Browser Tab Favicon
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {settings.faviconUrl ? 'Custom Icon Active' : 'Default Red S Monogram'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closeAccessModal();
                      openFaviconModal();
                    }}
                    className="px-2.5 py-1.5 text-xs font-mono font-semibold bg-[#141B24] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#FF4655]" />
                    <span>Change Favicon</span>
                  </button>
                </div>

                {/* Preloader Animation Control Card */}
                <div className="p-3 rounded-xl bg-[#080B0F] border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-[#16191E] border border-zinc-700 flex items-center justify-center text-[#FF4655] shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-white block">
                            Intro Preloader
                          </span>
                          {settings.preloaderEnabled !== false ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                              ON
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700">
                              OFF
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {settings.preloaderEnabled !== false
                            ? 'Smooth brand intro shown on site load'
                            : 'Disabled (Instant reveal without intro)'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowPreloaderPreview(true)}
                        className="px-2 py-1 text-[11px] font-mono text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-700 rounded transition-colors cursor-pointer"
                        title="Preview preloader intro animation"
                      >
                        Preview
                      </button>

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
                  </div>
                </div>

                {/* Change Passcode Accordion */}
                <div className="pt-2 border-t border-[#1F2833]">
                  {!showChangePass ? (
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowChangePass(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-[#FF4655] transition-colors cursor-pointer"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>Change Secret Passcode</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleChangePasscodeSubmit} className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-white">Update Passcode</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowChangePass(false);
                            setChangeStatus(null);
                          }}
                          className="text-[10px] font-mono text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      <input
                        type="password"
                        required
                        placeholder="Current passcode"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                      />

                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="New passcode (min 6 chars)"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                      />

                      {changeStatus && (
                        <div
                          className={`p-2 rounded text-xs font-mono ${
                            changeStatus.success
                              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                              : 'bg-red-950/60 border border-red-800 text-red-300'
                          }`}
                        >
                          {changeStatus.msg}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-1.5 text-xs font-mono font-semibold text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded-lg transition-colors cursor-pointer"
                      >
                        Save New Passcode
                      </button>
                    </form>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={closeAccessModal}
                    className="px-4 py-2 text-xs font-mono text-zinc-300 hover:text-white bg-[#1F2833] hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Continue Editing
                  </button>
                  <button
                    onClick={logoutAdmin}
                    className="px-4 py-2 text-xs font-mono text-red-300 hover:text-white bg-red-950/60 hover:bg-red-900 border border-red-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Lock Portfolio
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter your private passcode to unlock editing controls and portfolio management.
                </p>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                    Owner Passcode
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      required
                      disabled={lockoutRemaining > 0}
                      placeholder={lockoutRemaining > 0 ? `Locked for ${lockoutRemaining}s` : "Enter owner passcode..."}
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655] font-mono disabled:opacity-50"
                    />
                    <KeyRound className="w-4 h-4 text-zinc-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                {lockoutRemaining > 0 ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/60 border border-amber-800 text-xs text-amber-200">
                    <Clock className="w-4 h-4 shrink-0 text-amber-400 animate-spin" />
                    <span>Security lockout active: wait {lockoutRemaining} seconds.</span>
                  </div>
                ) : errorMessage ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#FF4655]" />
                    <span>{errorMessage}</span>
                  </div>
                ) : null}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAccessModal}
                    className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={lockoutRemaining > 0 || isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded-lg transition-all shadow-md shadow-[#FF4655]/30 disabled:opacity-40 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock Controls</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Section Visibility & Maintenance Manager Modal */}
      <SectionManagerModal />

      {/* Favicon & Browser Tab Branding Customizer Modal */}
      <FaviconModal />

      {/* Interactive Preloader Animation Preview Triggered by Admin */}
      {showPreloaderPreview && (
        <div className="z-[150] fixed inset-0">
          <Preloader onComplete={() => setShowPreloaderPreview(false)} />
        </div>
      )}
    </>
  );
}
