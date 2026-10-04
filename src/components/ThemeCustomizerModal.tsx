import React, { useState } from 'react';
import {
  X,
  Palette,
  Type,
  Snowflake,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Eye,
  CloudFog,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import {
  useSiteSettings,
  THEME_PRESETS,
  ThemePreset,
  DEFAULT_THEME_CONFIG,
  DEFAULT_SITE_COPY,
  SiteCopyConfig,
} from '../context/SiteSettingsContext';
import { useAdmin } from '../context/AdminContext';

export default function ThemeCustomizerModal() {
  const { isAdmin } = useAdmin();
  const {
    settings,
    isCustomizerOpen,
    closeCustomizer,
    setThemePreset,
    updateTheme,
    updateCustomCopy,
    resetThemeToDefault,
    resetCopyToDefault,
  } = useSiteSettings();

  const [activeTab, setActiveTab] = useState<'theme' | 'text'>('theme');
  const [customHex, setCustomHex] = useState(settings.theme?.primaryColor || '#38bdf8');
  const [saveToast, setSaveToast] = useState(false);

  // Local text form state
  const [copyForm, setCopyForm] = useState<SiteCopyConfig>(() => ({
    heroBadge: settings.customCopy?.heroBadge ?? DEFAULT_SITE_COPY.heroBadge,
    heroHeadline: settings.customCopy?.heroHeadline ?? DEFAULT_SITE_COPY.heroHeadline,
    heroHighlightText: settings.customCopy?.heroHighlightText ?? DEFAULT_SITE_COPY.heroHighlightText,
    heroDescription: settings.customCopy?.heroDescription ?? DEFAULT_SITE_COPY.heroDescription,
    heroCtaWork: settings.customCopy?.heroCtaWork ?? DEFAULT_SITE_COPY.heroCtaWork,
    heroCtaContact: settings.customCopy?.heroCtaContact ?? DEFAULT_SITE_COPY.heroCtaContact,
    artistTitle: settings.customCopy?.artistTitle ?? DEFAULT_SITE_COPY.artistTitle,
    contactHeadline: settings.customCopy?.contactHeadline ?? DEFAULT_SITE_COPY.contactHeadline,
    contactSubtitle: settings.customCopy?.contactSubtitle ?? DEFAULT_SITE_COPY.contactSubtitle,
  }));

  if (!isAdmin || !isCustomizerOpen) {
    return null;
  }

  const currentTheme = settings.theme || DEFAULT_THEME_CONFIG;
  const isWinter = currentTheme.preset === 'winter';

  const handleSelectPreset = async (presetId: ThemePreset) => {
    await setThemePreset(presetId);
    showSavedNotification();
  };

  const handleCustomColorChange = async (color: string) => {
    setCustomHex(color);
    await setThemePreset('custom', color);
  };

  const handleTextChange = (field: keyof SiteCopyConfig, val: string) => {
    const updated = { ...copyForm, [field]: val };
    setCopyForm(updated);
    // Instant live preview
    updateCustomCopy(updated);
  };

  const showSavedNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCustomCopy(copyForm);
    showSavedNotification();
  };

  const handleResetCopy = async () => {
    setCopyForm(DEFAULT_SITE_COPY);
    await resetCopyToDefault();
    showSavedNotification();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-customizer-title"
      className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-[#0E141B] border border-zinc-700/80 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-800 bg-[#080B0F]/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="theme-customizer-title"
                  className="text-base font-bold text-white font-display"
                >
                  Theme & Customization Studio
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  Live Sync
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Switch themes (including Winter Frost) or customize website copy live
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCustomizer}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-zinc-800 bg-[#080B0F]/40 px-4 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'border-[#38bdf8] text-white bg-sky-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Theme & Colors (Winter Frost & Presets)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'border-[#38bdf8] text-white bg-sky-500/10 rounded-t-lg'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Website Text & Copy Customizer</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 text-xs font-mono">
          {/* ============================================================== */}
          {/* TAB 1: THEME & COLOR PRESETS */}
          {/* ============================================================== */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              {/* Featured Winter Theme Banner */}
              <div
                className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
                  isWinter
                    ? 'bg-gradient-to-r from-sky-950/70 via-[#07192c]/80 to-sky-950/70 border-sky-400 shadow-xl shadow-sky-950/50 ring-2 ring-sky-400/40'
                    : 'bg-gradient-to-r from-sky-950/30 to-[#07192c]/40 border-sky-500/40 hover:border-sky-400/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                      <span className="font-bold text-sm text-white font-display flex items-center gap-1.5">
                        <Snowflake className="w-4 h-4 text-sky-400" />
                        Winter Frost & Icy Atmosphere Theme
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500 text-black">
                        FEATURED
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-200/80 leading-relaxed max-w-lg">
                      Professional winter cold theme with frosty icy blue accents (#38bdf8), chilled mist fog vignette, glazed crystalline borders, and gentle floating ice crystal particles.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset('winter')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg ${
                      isWinter
                        ? 'bg-sky-400 text-black shadow-sky-400/30'
                        : 'bg-sky-500/20 hover:bg-sky-400 text-sky-300 hover:text-black border border-sky-400/60'
                    }`}
                  >
                    {isWinter ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Active Theme</span>
                      </>
                    ) : (
                      <>
                        <Snowflake className="w-4 h-4" />
                        <span>Apply Winter Theme</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Winter Special Controls (Shown when Winter Theme is Active) */}
                {isWinter && (
                  <div className="mt-4 pt-3.5 border-t border-sky-400/30 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/30 p-3 rounded-lg">
                    {/* Snow Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-zinc-200">Falling Ice Crystals & Snow</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateTheme({ winterSnowEnabled: !currentTheme.winterSnowEnabled })
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                          currentTheme.winterSnowEnabled !== false
                            ? 'bg-sky-500 text-black'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {currentTheme.winterSnowEnabled !== false ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Fog Vignette Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CloudFog className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-zinc-200">Chilled Fog Mist Vignette</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateTheme({ winterFrostVignette: !currentTheme.winterFrostVignette })
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                          currentTheme.winterFrostVignette !== false
                            ? 'bg-sky-500 text-black'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {currentTheme.winterFrostVignette !== false ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Snow Intensity */}
                    <div className="sm:col-span-2 flex items-center justify-between pt-1 border-t border-sky-500/20">
                      <span className="text-zinc-400">Snow & Crystal Density:</span>
                      <div className="flex items-center gap-1.5">
                        {(['subtle', 'moderate', 'blizzard'] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => updateTheme({ winterSnowIntensity: lvl })}
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-all cursor-pointer ${
                              currentTheme.winterSnowIntensity === lvl
                                ? 'bg-sky-400 text-black shadow-sm'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* All Preset Grid */}
              <div className="space-y-3">
                <span className="text-zinc-400 uppercase tracking-widest block text-[11px]">
                  Available Theme Presets (1-Click Switch)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['crimson', 'winter', 'emerald', 'gold', 'violet'] as ThemePreset[]).map(
                    (presetKey) => {
                      const p = THEME_PRESETS[presetKey];
                      const isSelected = currentTheme.preset === presetKey;

                      return (
                        <div
                          key={presetKey}
                          onClick={() => handleSelectPreset(presetKey)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-left ${
                            isSelected
                              ? 'bg-[#141B24] border-white/80 ring-2 ring-white/20 shadow-xl'
                              : 'bg-[#0E141B] border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-5 h-5 rounded-full border border-white/20 shadow-md shrink-0"
                                style={{ backgroundColor: p.primaryColor }}
                              />
                              <div>
                                <span className="text-xs font-bold text-white font-display block">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-zinc-400">{p.tagline}</span>
                              </div>
                            </div>

                            {isSelected ? (
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </span>
                            ) : (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded border font-mono"
                                style={{
                                  color: p.primaryColor,
                                  borderColor: `${p.primaryColor}55`,
                                  backgroundColor: `${p.primaryColor}15`,
                                }}
                              >
                                {p.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                            <span>Primary: {p.primaryColor}</span>
                            <span className="underline hover:text-white">Apply Preset →</span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Custom Hex Color Option */}
              <div className="p-4 rounded-xl bg-[#0E141B] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Custom Primary Theme Color
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Choose any bespoke brand color for all buttons, badges, and glows
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customHex}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      title="Choose custom color"
                    />
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      className="w-20 px-2 py-1 text-xs bg-[#080B0F] border border-zinc-700 rounded text-white font-mono uppercase"
                      placeholder="#FF4655"
                    />
                  </div>
                </div>
              </div>

              {/* Reset Theme Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetThemeToDefault}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Theme to Default (Cyberpunk Crimson)</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: WEBSITE TEXT & COPY CUSTOMIZER */}
          {/* ============================================================== */}
          {activeTab === 'text' && (
            <form onSubmit={handleSaveText} className="space-y-5">
              <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-500/30 text-sky-300 text-[11px] leading-relaxed">
                Changes made here immediately update on your live portfolio. You can customize headings, slogans, descriptions, and call-to-actions.
              </div>

              {/* 1. Hero Eyebrow Status Badge */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">
                  1. Hero Availability & Status Badge
                </label>
                <input
                  type="text"
                  value={copyForm.heroBadge || ''}
                  onChange={(e) => handleTextChange('heroBadge', e.target.value)}
                  className="w-full px-3 py-2 bg-[#080B0F] border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                  placeholder="AVAILABLE FOR COMMERCIAL CONTRACTS & ESPORTS TEAMS"
                />
              </div>

              {/* 2. Headline & Slogan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">
                    2. Hero Main Headline Prefix
                  </label>
                  <input
                    type="text"
                    value={copyForm.heroHeadline || ''}
                    onChange={(e) => handleTextChange('heroHeadline', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080B0F] border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                    placeholder="Visuals built to make brands"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">
                    Glitch Accent Highlight
                  </label>
                  <input
                    type="text"
                    value={copyForm.heroHighlightText || ''}
                    onChange={(e) => handleTextChange('heroHighlightText', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080B0F] border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                    placeholder="impossible to ignore."
                  />
                </div>
              </div>

              {/* 3. Hero Description / Bio Summary */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-bold block">
                  3. Hero Supporting Bio Description
                </label>
                <textarea
                  rows={3}
                  value={copyForm.heroDescription || ''}
                  onChange={(e) => handleTextChange('heroDescription', e.target.value)}
                  className="w-full px-3 py-2 bg-[#080B0F] border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400 leading-relaxed"
                  placeholder="Commercial graphics artist specializing in high-retention creator thumbnails, elite esports tournament key visuals, and comprehensive visual systems."
                />
              </div>

              {/* 4. CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">
                    4. Primary CTA Button
                  </label>
                  <input
                    type="text"
                    value={copyForm.heroCtaWork || ''}
                    onChange={(e) => handleTextChange('heroCtaWork', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080B0F] border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                    placeholder="View Selected Work"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-bold block">
                    Secondary CTA Button
                  </label>
                  <input
                    type="text"
                    value={copyForm.heroCtaContact || ''}
                    onChange={(e) => handleTextChange('heroCtaContact', e.target.value)}
                    className="w-full px-3 py-2 bg-[#080B0F] border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                    placeholder="Let's Work Together"
                  />
                </div>
              </div>

              {/* 5. Contact Section Copy */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <span className="text-xs font-bold text-zinc-300 block uppercase tracking-wider">
                  Contact Section Copy
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-zinc-400 block text-[11px]">
                      Contact Headline
                    </label>
                    <input
                      type="text"
                      value={copyForm.contactHeadline || ''}
                      onChange={(e) => handleTextChange('contactHeadline', e.target.value)}
                      className="w-full px-3 py-2 bg-[#080B0F] border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                      placeholder="Initiate Project Commission"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-zinc-400 block text-[11px]">
                      Contact Subtitle
                    </label>
                    <input
                      type="text"
                      value={copyForm.contactSubtitle || ''}
                      onChange={(e) => handleTextChange('contactSubtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-[#080B0F] border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-sky-400"
                      placeholder="Direct pipeline for commercial identity..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleResetCopy}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Text to Defaults</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-white hover:bg-zinc-200 text-black shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Text Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#080B0F]/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            {saveToast && (
              <span className="text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved & deployed live!</span>
              </span>
            )}
            {!saveToast && <span>All changes are automatically synced to the server database.</span>}
          </div>

          <button
            type="button"
            onClick={closeCustomizer}
            className="px-5 py-2 rounded-lg bg-[#1F2833] hover:bg-zinc-800 text-white font-mono font-semibold transition-colors cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
