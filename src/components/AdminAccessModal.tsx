import { useState, useEffect } from 'react';
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
  Type,
  Cloud,
  Download,
  Copy,
  Inbox,
  RefreshCw,
  Mail,
  ExternalLink,
  MessageSquare,
  Database,
  FolderDown,
} from 'lucide-react';
import { useAdmin, getAdminAuthHeaders } from '../context/AdminContext';
import { useSiteSettings, DEFAULT_FAVICON_SVG } from '../context/SiteSettingsContext';
import { ARTIST_PROFILE } from '../data/portfolioData';
import SectionManagerModal from './SectionManagerModal';
import FaviconModal from './FaviconModal';
import ThemeCustomizerModal from './ThemeCustomizerModal';
import Preloader from './Preloader';
import DataPackModal from './DataPackModal';

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
    openCustomizer,
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
  const [copiedData, setCopiedData] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Inquiries & Vercel Code Sync State
  const [inquiries, setInquiries] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('saify_commercial_inquiries');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showInquiriesModal, setShowInquiriesModal] = useState(false);
  const [showDataPackModal, setShowDataPackModal] = useState(false);
  const [syncingCode, setSyncingCode] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/inquiries', { headers: getAdminAuthHeaders() })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.inquiries && Array.isArray(data.inquiries)) {
            setInquiries(data.inquiries);
            localStorage.setItem('saify_commercial_inquiries', JSON.stringify(data.inquiries));
          }
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const getExportableData = () => {
    let projects = [];
    try {
      const savedP = localStorage.getItem('saify_portfolio_projects_custom');
      if (savedP) projects = JSON.parse(savedP);
    } catch {}

    let services = [];
    try {
      const savedS = localStorage.getItem('saify_services_custom');
      if (savedS) services = JSON.parse(savedS);
    } catch {}

    let testimonials = [];
    try {
      const savedT = localStorage.getItem('saify_testimonials_custom');
      if (savedT) testimonials = JSON.parse(savedT);
    } catch {}

    let heroBackgrounds = [];
    try {
      const savedH = localStorage.getItem('saify_hero_bg_images');
      if (savedH) heroBackgrounds = JSON.parse(savedH);
    } catch {}

    return {
      exportedAt: new Date().toISOString(),
      projects: projects.length > 0 ? projects : null,
      services: services.length > 0 ? services : null,
      testimonials: testimonials.length > 0 ? testimonials : null,
      heroBackgrounds: heroBackgrounds.length > 0 ? heroBackgrounds : null,
      siteSettings: settings,
    };
  };


  const handleSyncToCode = async () => {
    setSyncingCode(true);
    try {
      const data = getExportableData();
      const res = await fetch('/api/sync-to-code', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          projects: data.projects,
          services: data.services,
          testimonials: data.testimonials,
          heroBackgrounds: data.heroBackgrounds,
        }),
      });

      if (res.ok) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
      }
    } catch {
    } finally {
      setSyncingCode(false);
    }
  };

  const handleDownloadBackup = () => {
    const data = getExportableData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saify-portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleCopyData = async () => {
    const data = getExportableData();
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedData(true);
      setTimeout(() => setCopiedData(false), 2000);
    } catch {}
  };

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

          {/* Quick Text & Copy Customizer */}
          <button
            type="button"
            onClick={openCustomizer}
            className="ml-1 inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-[#FF4655] border-l border-zinc-700 pl-2 transition-colors cursor-pointer"
            title="Edit Headlines, Subtitles & Website Text"
          >
            <Type className="w-3 h-3 text-[#FF4655]" />
            <span className="hidden sm:inline">Text & Copy</span>
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
                        Browser Tab Favicon (ট্যাব আইকন)
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {settings.faviconUrl ? 'Custom Icon Active' : 'Default Red S'} (Navbar & Footer 3D Cube is preserved)
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

                {/* Website Copy & Text Editor Card */}
                <div className="p-3 rounded-xl bg-[#080B0F] border border-zinc-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#16191E] border border-zinc-700 flex items-center justify-center text-[#FF4655] shrink-0">
                      <Type className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">
                        Website Text & Copy
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Hero headline, badge, subtitle, contact copy
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closeAccessModal();
                      openCustomizer();
                    }}
                    className="px-2.5 py-1.5 text-xs font-mono font-semibold bg-[#141B24] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Type className="w-3.5 h-3.5 text-[#FF4655]" />
                    <span>Edit Text</span>
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

                {/* Inquiries Inbox Card */}
                <div className="p-3 rounded-xl bg-[#080B0F] border border-zinc-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#16191E] border border-zinc-700 flex items-center justify-center text-[#FF4655] shrink-0">
                      <Inbox className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-white block">
                          Commission Inquiries Inbox
                        </span>
                        {inquiries.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#FF4655]/20 text-[#FF4655] border border-[#FF4655]/30">
                            {inquiries.length} received
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Direct inquiries sent to saifysamit@gmail.com
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowInquiriesModal(true)}
                    className="px-2.5 py-1.5 text-xs font-mono font-semibold bg-[#141B24] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#FF4655]" />
                    <span>View Inbox ({inquiries.length})</span>
                  </button>
                </div>

                {/* Website Data Pack & Cloud Backup Hub Card (1-Click Restore System) */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#080B0F] via-[#0E141C] to-[#141B24] border border-[#FF4655]/40 space-y-3 shadow-lg shadow-[#FF4655]/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FF4655]/15 border border-[#FF4655]/30 flex items-center justify-center text-[#FF4655] shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white block">
                            Website Data Pack & Cloud Backup Hub
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#FF4655]/20 text-[#FF4655] border border-[#FF4655]/30">
                            1-CLICK RESTORE
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Selected Work, Core Services, Testimonials এর ক্লাউড ব্যাকআপ ও রিস্টোর
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-300 font-mono leading-relaxed bg-[#080B0F] p-2.5 rounded-lg border border-zinc-800">
                    💡 <strong>ওয়ান-ক্লিক রিস্টোর:</strong> ওয়েবসাইটে যেকোনো নতুন আপডেট আসলে অথবা আগের ডেটা ফিরে পেতে চাইলে ক্লাউড স্ন্যাপশট থেকে মাত্র ১-ক্লিকে সমস্ত প্রজেক্ট, সার্ভিস ও রিভিউ লাইভ ওয়েবসাইটে রিস্টোর করা যাবে।
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      closeAccessModal();
                      setShowDataPackModal(true);
                    }}
                    className="w-full py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider bg-[#FF4655] hover:bg-[#ff5a68] text-white rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF4655]/25"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Open Data Pack Hub (১-ক্লিক ব্যাকআপ ও রিস্টোর হাব)</span>
                  </button>
                </div>

                {/* Vercel Live Deployment & Data Sync Center */}
                <div className="p-3.5 rounded-xl bg-[#080B0F] border border-zinc-800 space-y-3">

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-[#16191E] border border-zinc-700 flex items-center justify-center text-[#FF4655] shrink-0">
                        <Cloud className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-white block">
                            Vercel Live Code Sync & Backup
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                            VERCEL READY
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          ImageKit media supported · Direct code synchronization
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-300 font-mono leading-relaxed bg-[#0E141B] p-2.5 rounded-lg border border-[#1F2833]">
                    💡 <strong>Vercel এ লাইভ দেখানোর নিয়ম:</strong> Vercel স্ট্যাটিক সাইট হওয়ায় নিচের <span className="text-[#FF4655] font-semibold">"Sync to Codebase"</span> বাটনে ক্লিক করলে আপনার সব কার্ড, ইমেজ ও ব্যাকগ্রাউন্ড সরাসরি সোর্স কোডে (<code className="text-zinc-200">portfolioData.ts</code>) সেভ হয়ে যাবে। এরপর গিটহাবে পুশ করলেই Vercel-এ তাৎক্ষণিক শো করবে!
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleSyncToCode}
                      disabled={syncingCode}
                      className="w-full py-2 px-3 text-xs font-mono font-bold uppercase tracking-wider bg-[#FF4655] hover:bg-[#ff5a68] disabled:opacity-50 text-white rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF4655]/20"
                    >
                      {syncingCode ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Syncing to TypeScript Codebase...</span>
                        </>
                      ) : syncSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>✓ Synced to Codebase! Ready for GitHub/Vercel</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Sync to Codebase (Auto-Write portfolioData.ts)</span>
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadBackup}
                        className="px-2.5 py-1.5 text-xs font-mono font-semibold bg-[#141B24] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#FF4655]" />
                        <span>{downloadSuccess ? 'Downloaded!' : 'Export db.json'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyData}
                        className="px-2.5 py-1.5 text-xs font-mono font-semibold bg-[#141B24] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#FF4655]" />
                        <span>{copiedData ? 'Copied!' : 'Copy JSON Data'}</span>
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

      {/* Client Inquiries Inbox Modal */}
      {showInquiriesModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0E141B] border border-[#1F2833] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#1F2833] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF4655]/10 border border-[#FF4655]/30 flex items-center justify-center text-[#FF4655]">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Client Inquiries Inbox</h3>
                  <span className="text-[11px] font-mono text-zinc-400">All submissions dispatched to {ARTIST_PROFILE.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInquiriesModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {inquiries.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 font-mono text-xs">
                  No inquiries received yet. When clients fill out the Commission section, they will appear here and in your email!
                </div>
              ) : (
                inquiries.map((inq: any, i: number) => (
                  <div key={inq.id || i} className="p-4 rounded-xl bg-[#080B0F] border border-zinc-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{inq.name}</h4>
                        <span className="text-xs font-mono text-[#FF4655]">{inq.email}</span>
                        {inq.company && inq.company !== 'N/A' && (
                          <span className="text-xs text-zinc-400 block font-mono">Company: {inq.company}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                          {inq.projectType || 'Commercial'}
                        </span>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1">
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-zinc-400">
                      Budget: <span className="text-white font-semibold">{inq.budget}</span>
                    </div>
                    <p className="text-xs text-zinc-300 bg-[#0E141B] p-2.5 rounded-lg border border-[#1F2833] whitespace-pre-wrap font-sans leading-relaxed">
                      {inq.details || inq.message}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(inq.email)}&su=${encodeURIComponent(`Re: [Commission Inquiry] ${inq.projectType || 'Project'}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EA4335]/20 hover:bg-[#EA4335]/30 text-[#EA4335] border border-[#EA4335]/40 text-xs font-semibold transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Reply in Gmail</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(inq.email);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#141B24] hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition-colors border border-zinc-700 cursor-pointer"
                      >
                        <Copy className="w-3 h-3 text-[#FF4655]" />
                        <span>Copy Email</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section Visibility & Maintenance Manager Modal */}
      <SectionManagerModal />

      {/* Favicon & Browser Tab Branding Customizer Modal */}
      <FaviconModal />

      {/* Theme & Text/Copy Customizer Modal */}
      <ThemeCustomizerModal />

      {/* Website Complete Data Pack & Cloud Snapshot Modal */}
      <DataPackModal isOpen={showDataPackModal} onClose={() => setShowDataPackModal(false)} />

      {/* Interactive Preloader Animation Preview Triggered by Admin */}
      {showPreloaderPreview && (
        <div className="z-[150] fixed inset-0">
          <Preloader onComplete={() => setShowPreloaderPreview(false)} />
        </div>
      )}
    </>

  );
}
