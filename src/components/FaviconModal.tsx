import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Globe,
  Sun,
  Moon,
  Laptop,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useSiteSettings, DEFAULT_FAVICON_SVG } from '../context/SiteSettingsContext';

interface FaviconPreset {
  id: string;
  name: string;
  desc: string;
  dataUrl: string;
  badge?: string;
}

const PRESETS: FaviconPreset[] = [
  {
    id: 'default-red-tile',
    name: 'Default Red S Monogram',
    desc: 'Signature Saify Samit monogram on dark tile',
    badge: 'Current Default',
    dataUrl: DEFAULT_FAVICON_SVG,
  },
  {
    id: 'transparent-red-s',
    name: 'Transparent Valorant Red S',
    desc: 'Pure transparent PNG/SVG S glyph, no background tile',
    badge: 'Transparent',
    dataUrl:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><path d='M10 23V9h4.5a4.5 4.5 0 0 1 3.2 1.3A4.5 4.5 0 0 1 19 13.5c0 1.2-.4 2.2-1.2 3A4.5 4.5 0 0 1 21 20.5c0 1.3-.5 2.4-1.4 3.3-.9.9-2 1.2-3.3 1.2H10zm3-8.5h1.8c.6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.4 0-.6-.2-1.1-.6-1.5-.4-.4-.9-.5-1.5-.5H13v4zm0 6h2.2c.7 0 1.3-.2 1.7-.7.4-.4.7-1 .7-1.6 0-.6-.2-1.2-.7-1.6-.4-.4-1-.7-1.7-.7H13v4.6z' fill='%23FF4655'/></svg>",
  },
  {
    id: 'cyberpunk-crosshair',
    name: 'Esports Crosshair Blade',
    desc: 'Aggressive esports targeting reticle in radiant crimson',
    badge: 'Esports',
    dataUrl:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23080B0F'/><circle cx='16' cy='16' r='9' fill='none' stroke='%23FF4655' stroke-width='2'/><path d='M16 3v6M16 23v6M3 16h6M23 16h6' stroke='%23FF4655' stroke-width='2' stroke-linecap='round'/><circle cx='16' cy='16' r='2.5' fill='%23FF4655'/></svg>",
  },
  {
    id: 'commercial-gold',
    name: 'Executive Studio Emblem',
    desc: 'High-end champagne gold geometric monogram',
    badge: 'Commercial',
    dataUrl:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230d1117'/><polygon points='16,4 28,16 16,28 4,16' fill='none' stroke='%23F59E0B' stroke-width='2'/><circle cx='16' cy='16' r='4' fill='%23F59E0B'/></svg>",
  },
  {
    id: 'neon-cyan-crest',
    name: 'Cyberpunk Cyan Crest',
    desc: 'High contrast electric cyan shield for maximum dark/light visibility',
    badge: 'High Contrast',
    dataUrl:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%2305080E'/><polygon points='16,5 26,10 26,19 16,27 6,19 6,10' fill='none' stroke='%2300E5FF' stroke-width='2'/><text x='16' y='20' font-family='sans-serif' font-weight='900' font-size='12' fill='%2300E5FF' text-anchor='middle'>S</text></svg>",
  },
];

export default function FaviconModal() {
  const { isAdmin } = useAdmin();
  const {
    settings,
    updateFavicon,
    resetFavicon,
    isFaviconModalOpen,
    closeFaviconModal,
  } = useSiteSettings();

  const [previewUrl, setPreviewUrl] = useState<string>(
    settings.faviconUrl || DEFAULT_FAVICON_SVG
  );
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'guidelines'>('upload');
  const [themePreviewMode, setThemePreviewMode] = useState<'both' | 'dark' | 'light'>('both');
  const [isApplying, setIsApplying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [imageMeta, setImageMeta] = useState<{
    width?: number;
    height?: number;
    sizeKb?: number;
    format?: string;
    isSquare?: boolean;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin || !isFaviconModalOpen) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 1.5MB
    const sizeKb = Math.round(file.size / 1024);
    if (file.size > 1.5 * 1024 * 1024) {
      setFeedbackMsg({
        type: 'error',
        text: 'File is too large (max 1.5MB). Favicons should ideally be under 50KB.',
      });
      return;
    }

    const format = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        const isSquare = img.naturalWidth === img.naturalHeight;
        setImageMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKb,
          format,
          isSquare,
        });

        if (!isSquare) {
          setFeedbackMsg({
            type: 'error',
            text: `Image is ${img.naturalWidth}×${img.naturalHeight}px (not 1:1 square). Browser tabs render square icons. We can auto-crop it to square for you.`,
          });
        } else {
          setFeedbackMsg({
            type: 'success',
            text: `Perfect! ${img.naturalWidth}×${img.naturalHeight}px (${format}) square image loaded.`,
          });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAutoSquare = () => {
    if (!previewUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const size = Math.max(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw centered
      const offsetX = (size - img.naturalWidth) / 2;
      const offsetY = (size - img.naturalHeight) / 2;
      ctx.drawImage(img, offsetX, offsetY);

      const squaredDataUrl = canvas.toDataURL('image/png');
      setPreviewUrl(squaredDataUrl);
      setImageMeta({
        width: size,
        height: size,
        format: 'PNG',
        isSquare: true,
      });
      setFeedbackMsg({
        type: 'success',
        text: `Image auto-centered to ${size}×${size}px square PNG with transparent margins!`,
      });
    };
    img.src = previewUrl;
  };

  const handleApply = async () => {
    setIsApplying(true);
    setFeedbackMsg(null);
    try {
      const ok = await updateFavicon(previewUrl);
      if (ok) {
        setFeedbackMsg({
          type: 'success',
          text: 'Favicon updated live! Check your browser tab at the top of your screen.',
        });
        setTimeout(() => {
          closeFaviconModal();
        }, 1200);
      } else {
        setFeedbackMsg({
          type: 'error',
          text: 'Failed to save favicon to server. Check network connection.',
        });
      }
    } catch {
      setFeedbackMsg({
        type: 'error',
        text: 'An error occurred while saving favicon.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const handleReset = async () => {
    setIsApplying(true);
    try {
      await resetFavicon();
      setPreviewUrl(DEFAULT_FAVICON_SVG);
      setImageMeta({});
      setFeedbackMsg({
        type: 'success',
        text: 'Favicon successfully reset to default Saify Samit Red S monogram.',
      });
    } catch {
      setFeedbackMsg({
        type: 'error',
        text: 'Failed to reset favicon.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="favicon-modal-title"
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-[#0B0F15] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-[#0E141C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4655]/15 border border-[#FF4655]/40 flex items-center justify-center text-[#FF4655]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="favicon-modal-title" className="text-base sm:text-lg font-bold text-white font-display">
                  Website Favicon & Browser Tab Branding
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF4655]/20 text-[#FF4655] border border-[#FF4655]/40 font-bold uppercase">
                  Admin Tool
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload or customize the browser tab icon with live Dark & Light theme rendering previews
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeFaviconModal}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Center Content */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* SECTION 1: DUAL THEME BROWSER TAB PREVIEW (Dark & Light Theme) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-[#FF4655]" />
                  Live Browser Tab Rendering Preview
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  (How visitors see your icon)
                </span>
              </div>

              {/* Theme View Toggles */}
              <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setThemePreviewMode('both')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    themePreviewMode === 'both'
                      ? 'bg-[#FF4655] text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Both Themes
                </button>
                <button
                  type="button"
                  onClick={() => setThemePreviewMode('dark')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                    themePreviewMode === 'dark'
                      ? 'bg-zinc-700 text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3 h-3 text-cyan-400" />
                  Dark Only
                </button>
                <button
                  type="button"
                  onClick={() => setThemePreviewMode('light')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                    themePreviewMode === 'light'
                      ? 'bg-zinc-200 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-500" />
                  Light Only
                </button>
              </div>
            </div>

            {/* Browser Mockup Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. DARK THEME BROWSER TAB MOCKUP */}
              {(themePreviewMode === 'both' || themePreviewMode === 'dark') && (
                <div className="rounded-xl overflow-hidden border border-zinc-700/80 bg-[#16191E] shadow-xl">
                  {/* Browser Chrome Header (Dark) */}
                  <div className="bg-[#1C2026] px-3 pt-2.5 pb-2 flex items-center gap-2 border-b border-zinc-700/50">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                    </div>

                    {/* Active Browser Tab (Dark) */}
                    <div className="flex-1 max-w-[280px] bg-[#16191E] text-zinc-100 rounded-t-lg px-2.5 py-1.5 flex items-center gap-2 border-t border-x border-zinc-700/80 shadow-inner">
                      {/* Favicon in tab */}
                      <img
                        src={previewUrl}
                        alt="Tab Favicon Preview"
                        className="w-4 h-4 rounded-xs shrink-0 object-contain"
                      />
                      <span className="text-[11px] font-medium text-zinc-200 truncate flex-1">
                        Saify Samit — Graphics Artist
                      </span>
                      <span className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer font-bold leading-none">
                        ×
                      </span>
                    </div>

                    <div className="text-zinc-500 text-xs px-1 font-mono">+</div>
                  </div>

                  {/* Browser URL Bar (Dark) */}
                  <div className="px-3 py-2 bg-[#16191E] flex items-center gap-2 border-b border-zinc-800">
                    <div className="flex-1 bg-[#232730] rounded-md px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-zinc-300">
                      <span className="text-emerald-400 font-bold">🔒</span>
                      <span className="text-zinc-400">https://</span>
                      <span className="text-white font-medium">saifysamit.com</span>
                    </div>
                  </div>

                  {/* Tab Preview Explanation */}
                  <div className="p-3 bg-[#111419] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                      <Moon className="w-3.5 h-3.5 text-cyan-400" />
                      Dark Theme Tab Preview
                    </span>
                    <span className="text-emerald-400 font-medium">
                      Tab Background: #16191E
                    </span>
                  </div>
                </div>
              )}

              {/* 2. LIGHT THEME BROWSER TAB MOCKUP */}
              {(themePreviewMode === 'both' || themePreviewMode === 'light') && (
                <div className="rounded-xl overflow-hidden border border-zinc-400/80 bg-[#FFFFFF] shadow-xl">
                  {/* Browser Chrome Header (Light) */}
                  <div className="bg-[#DEE1E6] px-3 pt-2.5 pb-2 flex items-center gap-2 border-b border-zinc-300">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                    </div>

                    {/* Active Browser Tab (Light) */}
                    <div className="flex-1 max-w-[280px] bg-[#FFFFFF] text-zinc-900 rounded-t-lg px-2.5 py-1.5 flex items-center gap-2 border-t border-x border-zinc-300 shadow-sm">
                      {/* Favicon in tab */}
                      <img
                        src={previewUrl}
                        alt="Tab Favicon Preview"
                        className="w-4 h-4 rounded-xs shrink-0 object-contain"
                      />
                      <span className="text-[11px] font-medium text-zinc-800 truncate flex-1">
                        Saify Samit — Graphics Artist
                      </span>
                      <span className="text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer font-bold leading-none">
                        ×
                      </span>
                    </div>

                    <div className="text-zinc-600 text-xs px-1 font-mono">+</div>
                  </div>

                  {/* Browser URL Bar (Light) */}
                  <div className="px-3 py-2 bg-[#FFFFFF] flex items-center gap-2 border-b border-zinc-200">
                    <div className="flex-1 bg-[#F1F3F4] rounded-md px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-zinc-700">
                      <span className="text-emerald-600 font-bold">🔒</span>
                      <span className="text-zinc-500">https://</span>
                      <span className="text-zinc-900 font-medium">saifysamit.com</span>
                    </div>
                  </div>

                  {/* Tab Preview Explanation */}
                  <div className="p-3 bg-[#F8FAFC] flex items-center justify-between text-[11px] font-mono text-zinc-600 border-t border-zinc-200">
                    <span className="flex items-center gap-1.5 text-zinc-800 font-semibold">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Light Theme Tab Preview
                    </span>
                    <span className="text-zinc-600 font-medium">
                      Tab Background: #FFFFFF
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Magnified Side-by-Side Contrast Checker */}
            <div className="p-3.5 rounded-xl bg-[#0E131A] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-xs font-mono font-bold uppercase text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#FF4655]" />
                  4x Magnified Contrast Checker (Dark vs Light Background)
                </span>
                <p className="text-[11px] text-zinc-400">
                  Ensure your logo contrast is crisp and readable against both black and white themes.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {/* Dark checkerboard box */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-lg bg-[#080B0F] border border-zinc-700 flex items-center justify-center shadow-inner p-1.5">
                    <img
                      src={previewUrl}
                      alt="Dark contrast"
                      className="w-10 h-10 object-contain drop-shadow"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">On Dark</span>
                </div>

                <span className="text-zinc-600 font-mono">VS</span>

                {/* Light checkerboard box */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-lg bg-[#F8FAFC] border border-zinc-300 flex items-center justify-center shadow-inner p-1.5">
                    <img
                      src={previewUrl}
                      alt="Light contrast"
                      className="w-10 h-10 object-contain drop-shadow"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">On Light</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: TABS (Upload / Presets / Detailed Guidelines) */}
          <div className="space-y-4">
            {/* Tab Buttons */}
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'upload'
                    ? 'bg-[#FF4655] text-white shadow-md shadow-[#FF4655]/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Favicon</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'presets'
                    ? 'bg-[#FF4655] text-white shadow-md shadow-[#FF4655]/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Professional Presets ({PRESETS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guidelines')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'guidelines'
                    ? 'bg-[#FF4655] text-white shadow-md shadow-[#FF4655]/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Format & Pixel Guidelines</span>
              </button>
            </div>

            {/* TAB CONTENT 1: UPLOAD */}
            {activeTab === 'upload' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Drag and Drop Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-[#FF4655] bg-[#0E141B]/80 hover:bg-[#121924] transition-all text-center cursor-pointer group space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/x-icon,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-[#FF4655]/20 group-hover:text-[#FF4655] text-zinc-400 flex items-center justify-center mx-auto transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-sm font-bold text-white block">
                      Click to Browse or Drag & Drop your Favicon image
                    </span>
                    <span className="text-xs text-zinc-400 mt-1 block">
                      Supports <strong className="text-emerald-400 font-semibold">.PNG (Transparent)</strong>, .SVG, .ICO, .JPG (Max 1.5MB)
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-[11px] font-mono text-zinc-400 border border-zinc-800">
                    <span>Recommended: 64 × 64 px or 128 × 128 px (Square 1:1)</span>
                  </div>
                </div>

                {/* Direct Image URL or Data URL input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                    Or Enter Direct Favicon Image URL / SVG Code:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={previewUrl.startsWith('data:') ? 'Custom Data URL / Uploaded File' : previewUrl}
                      onChange={(e) => {
                        if (!e.target.value.startsWith('Custom Data')) {
                          setPreviewUrl(e.target.value);
                        }
                      }}
                      placeholder="https://example.com/favicon.png"
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF4655]"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-semibold text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Browse
                    </button>
                  </div>
                </div>

                {/* Non-square helper alert */}
                {imageMeta.isSquare === false && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/60 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>
                        Your image is <strong>{imageMeta.width}×{imageMeta.height}px</strong> (not square). Browser tabs squeeze non-square images.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoSquare}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold rounded-lg text-xs shrink-0 cursor-pointer shadow"
                    >
                      Auto-Square Image
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: PRESETS */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                {PRESETS.map((preset) => {
                  const isSelected = previewUrl === preset.dataUrl;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setPreviewUrl(preset.dataUrl);
                        setImageMeta({ format: 'SVG', isSquare: true });
                        setFeedbackMsg({
                          type: 'success',
                          text: `Selected "${preset.name}" preset. Click "Apply Favicon" below to save.`,
                        });
                      }}
                      className={`p-3.5 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#FF4655]/10 border-[#FF4655] shadow-lg shadow-[#FF4655]/20 ring-1 ring-[#FF4655]'
                          : 'bg-[#0E141C] border-zinc-800 hover:border-zinc-700 hover:bg-[#121924]'
                      }`}
                    >
                      {/* Preset Icon */}
                      <div className="w-12 h-12 rounded-xl bg-black/60 border border-zinc-700 flex items-center justify-center shrink-0 p-2">
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="w-8 h-8 object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate font-display">
                            {preset.name}
                          </span>
                          {preset.badge && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                              {preset.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {preset.desc}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#FF4655] text-white flex items-center justify-center shrink-0 shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT 3: COMPREHENSIVE GUIDELINES (Addressing User Prompt Directly) */}
            {activeTab === 'guidelines' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Guideline 1: Pixel Dimensions */}
                  <div className="p-4 rounded-xl bg-[#0E141B] border border-zinc-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
                      <span className="w-6 h-6 rounded-md bg-[#FF4655]/20 text-[#FF4655] flex items-center justify-center text-xs font-mono font-black">
                        1
                      </span>
                      <span>Pixel Dimensions (কতো পিক্সেল লাগবে?)</span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      ব্রাউজার ট্যাবগুলো আইকন প্রদর্শনের জন্য <strong>Square (1:1 Ratio)</strong> অনুপাত ব্যবহার করে।
                    </p>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="p-2 rounded bg-black/40 border border-zinc-800 flex items-center justify-between">
                        <span className="text-zinc-300">Standard Tab Render:</span>
                        <strong className="text-emerald-400">32 × 32 px</strong>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-zinc-800 flex items-center justify-between">
                        <span className="text-zinc-300">Retina / High DPI Master:</span>
                        <strong className="text-emerald-400">64 × 64 px</strong>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-zinc-800 flex items-center justify-between">
                        <span className="text-zinc-300">Apple Touch & Bookmark:</span>
                        <strong className="text-emerald-400">180 × 180 px</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
                      💡 <strong>Golden Rule:</strong> যেকোনো <strong>64×64</strong> থেকে <strong>256×256 px</strong> সাইজের স্কয়ার ছবি আপলোড করলে ব্রাউজার স্বয়ংক্রিয়ভাবে ক্রিস্প ও শার্পভাবে প্রদর্শন করবে।
                    </p>
                  </div>

                  {/* Guideline 2: PNG vs JPG */}
                  <div className="p-4 rounded-xl bg-[#0E141B] border border-zinc-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-white font-display font-bold text-sm">
                      <span className="w-6 h-6 rounded-md bg-[#FF4655]/20 text-[#FF4655] flex items-center justify-center text-xs font-mono font-black">
                        2
                      </span>
                      <span>File Format: PNG নাকি JPG লাগবে?</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/40 space-y-1">
                        <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          PNG (.png) — HIGHLY RECOMMENDED
                        </span>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          <strong>PNG</strong> ফরম্যাট ট্রান্সপারেন্ট ব্যাকগ্রাউন্ড সাপোর্ট করে। ফলে ডার্ক থিম এবং লাইট থিম উভয় ব্রাউজারেই লোগোটির চারপাশের কোনো সাদা বা কালো ফ্রেম ছাড়া প্রফেশনাল দেখায়।
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/40 space-y-1">
                        <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          JPG / JPEG (.jpg) — NOT RECOMMENDED
                        </span>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          <strong>JPG</strong> ফরম্যাটে ট্রান্সপারেন্সি থাকে না। ফলে ব্রাউজার ট্যাবে লোগোর পেছনে একটি অপছন্দনীয় সাদা বা কালো চতুর্ভুজ ব্যাকগ্রাউন্ড বক্স দেখা যেতে পারে।
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                        <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          SVG (.svg) — Modern Vector Alternative
                        </span>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          ভেক্টর ফরম্যাট হওয়ায় যেকোনো স্ক্রিন রেজোলিউশনে সর্বোচ্চ শার্পনেস বজায় থাকে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File size note */}
                <div className="p-3 rounded-xl bg-[#141B24] border border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-300">
                  <span>File Size Recommendation: <strong>Under 50 KB</strong> (Maximum allowed: 1.5 MB)</span>
                  <span className="text-emerald-400 font-bold">Fast Zero-Lag Tab Load</span>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Alert if any */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/60 text-red-300'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-[#0E141C] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Updates browser tab icon instantly across all visitors.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleReset}
              disabled={isApplying}
              className="px-3.5 py-2 rounded-lg text-xs font-mono text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Reset to default Saify Samit Red S monogram"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              onClick={closeFaviconModal}
              disabled={isApplying}
              className="px-4 py-2 rounded-lg text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isApplying}
              className="px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-[#FF4655] hover:bg-[#ff5a68] text-white shadow-lg shadow-[#FF4655]/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isApplying ? 'Applying...' : 'Apply Favicon (Live)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
