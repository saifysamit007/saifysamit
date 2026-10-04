import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, Image as ImageIcon, X, Plus, Trash2, RotateCcw, Check } from 'lucide-react';
import { ARTIST_PROFILE } from '../data/portfolioData';
import { useAdmin, getAdminAuthHeaders } from '../context/AdminContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface HeroProps {
  onExploreWork: () => void;
  onContactClick: () => void;
}

export interface HeroBgImage {
  id: string;
  url: string;
  title: string;
}

const DEFAULT_HERO_BACKGROUND_IMAGES: HeroBgImage[] = [
  {
    id: 'bg-1',
    url: '/src/assets/images/hero_esports_branding_1790776149956.jpg',
    title: 'Valorant Championship Key Visual',
  },
  {
    id: 'bg-2',
    url: '/src/assets/images/esports_stage_keyart_1790780707981.jpg',
    title: 'Grand Finals Stadium Stage Identity',
  },
  {
    id: 'bg-3',
    url: '/src/assets/images/work_esports_tournament_1790776181826.jpg',
    title: 'Vanguard Matchday Campaign Poster',
  },
  {
    id: 'bg-4',
    url: '/src/assets/images/work_branding_identity_1790776168205.jpg',
    title: 'Aura Minimalist Brand Architecture',
  },
  {
    id: 'bg-5',
    url: '/src/assets/images/work_thumbnail_design_1790776195553.jpg',
    title: 'High-Retention Editorial Creator Graphics',
  },
];

export default function Hero({ onExploreWork, onContactClick }: HeroProps) {
  const { isAdmin } = useAdmin();
  const { settings } = useSiteSettings();
  const copy = settings.customCopy || {};
  const [bgImages, setBgImages] = useState<HeroBgImage[]>(() => {
    try {
      const saved = localStorage.getItem('saify_hero_bg_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_HERO_BACKGROUND_IMAGES;
  });

  // Sync with server database
  useEffect(() => {
    fetch('/api/hero-backgrounds')
      .then((res) => res.json())
      .then((data) => {
        if (data?.backgrounds && Array.isArray(data.backgrounds) && data.backgrounds.length > 0) {
          setBgImages(data.backgrounds);
          try {
            localStorage.setItem('saify_hero_bg_images', JSON.stringify(data.backgrounds));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<HeroBgImage[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync index if list length changes
  useEffect(() => {
    if (currentBgIndex >= bgImages.length) {
      setCurrentBgIndex(0);
    }
  }, [bgImages.length, currentBgIndex]);

  // Smooth automatic background scrolling
  useEffect(() => {
    if (!isAutoScrolling || bgImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoScrolling, bgImages.length]);

  const handleNext = () => {
    setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
  };

  const handlePrev = () => {
    setCurrentBgIndex((prev) => (prev - 1 + bgImages.length) % bgImages.length);
  };

  const openEditModal = () => {
    setEditingList(JSON.parse(JSON.stringify(bgImages)));
    setIsEditModalOpen(true);
  };

  const handleUpdateImage = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...editingList];
    updated[index][field] = value;
    setEditingList(updated);
  };

  const handleAddNewImage = () => {
    const newItem: HeroBgImage = {
      id: `bg-${Date.now()}`,
      title: `Hero Background #${editingList.length + 1}`,
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
    };
    setEditingList([...editingList, newItem]);
  };

  const handleDeleteImage = (index: number) => {
    if (editingList.length <= 1) return; // Keep at least one image
    const updated = editingList.filter((_, i) => i !== index);
    setEditingList(updated);
  };

  const handleResetDefaults = () => {
    setEditingList(JSON.parse(JSON.stringify(DEFAULT_HERO_BACKGROUND_IMAGES)));
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const validList = editingList.filter((item) => item.url.trim().length > 0);
    if (validList.length === 0) return;

    setBgImages(validList);
    try {
      localStorage.setItem('saify_hero_bg_images', JSON.stringify(validList));
    } catch {}

    // Sync with zero-token server database
    fetch('/api/hero-backgrounds', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ backgrounds: validList }),
    }).catch(() => {});

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditModalOpen(false);
    }, 800);
  };

  return (
    <section className="relative min-h-[90vh] sm:min-h-[92vh] flex items-center pt-24 sm:pt-28 pb-24 sm:pb-20 overflow-hidden bg-[#080B0F]">
      {/* Dynamic Background Showcase */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
        {bgImages.map((img, idx) => {
          const isActive = idx === currentBgIndex;
          return (
            <div
              key={img.id || `${img.url}-${idx}`}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive
                  ? 'opacity-40 scale-100 filter contrast-110 saturate-110'
                  : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img
                src={img.url}
                alt={img.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback if image URL is invalid
                  (e.target as HTMLImageElement).src = DEFAULT_HERO_BACKGROUND_IMAGES[0].url;
                }}
                className="w-full h-full object-cover object-center"
              />
            </div>
          );
        })}

        {/* Cinematic Tactical Overlays for Content Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080B0F] via-[#080B0F]/90 to-[#080B0F]/70 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B0F] via-transparent to-[#080B0F]/80 z-10" />
        <div className="absolute inset-0 valorant-grid opacity-60 z-10" />

        {/* Ambient Valorant Red Glow */}
        <div
          aria-hidden="true"
          className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[300px] sm:h-[450px] bg-gradient-to-tr from-[#FF4655]/25 via-[#FF4655]/10 to-transparent blur-[100px] sm:blur-[130px] rounded-full z-10"
        />
      </div>

      {/* Main Foreground Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20">
        <div className="max-w-3xl">
          {/* Eyebrow and Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="text-[11px] sm:text-xs font-mono tracking-widest text-[#FF4655] uppercase font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#FF4655] inline-block" />
              {copy.artistTitle || 'GRAPHICS ARTIST / VISUAL DESIGNER'}
            </span>
            <span className="text-zinc-600 hidden sm:inline" aria-hidden="true">·</span>

            {/* Availability status badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-[#FF4655] bg-[#FF4655]/10 border border-[#FF4655]/30 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4655] animate-ping" />
              <span>{copy.heroBadge || ARTIST_PROFILE.availabilityStatus}</span>
            </div>
          </div>

          {/* Esports-inspired Glitch Headline */}
          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.12] sm:leading-[1.08] mb-4 sm:mb-6 text-balance break-words">
            {copy.heroHeadline || 'Visuals built to make brands'}{' '}
            <span
              className="glitch-text text-transparent bg-clip-text bg-gradient-to-r from-red-100 via-[#FF4655] to-[#ff2a3c] font-black cursor-pointer inline-block"
              data-text={copy.heroHighlightText || 'impossible to ignore.'}
            >
              {copy.heroHighlightText || 'impossible to ignore.'}
            </span>
          </h1>

          {/* Supporting Bio Summary */}
          <p className="text-xs sm:text-base md:text-lg text-zinc-300 max-w-2xl leading-relaxed mb-6 sm:mb-10 font-normal">
            {copy.heroDescription || ARTIST_PROFILE.bioSummary}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 mb-8 sm:mb-12">
            <button
              onClick={onExploreWork}
              className="inline-flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] active:scale-[0.98] rounded transition-all shadow-lg shadow-[#FF4655]/30 text-center"
            >
              {copy.heroCtaWork || 'View Selected Work'}
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={onContactClick}
              className="inline-flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-zinc-200 bg-[#0E141B] border border-[#1F2833] hover:border-[#FF4655] hover:text-white active:scale-[0.98] rounded transition-all text-center"
            >
              {copy.heroCtaContact || "Let's Work Together"}
              <ArrowUpRight className="w-4 h-4 text-[#FF4655]" />
            </button>
          </div>

          {/* Credibility Markers */}
          <div className="pt-4 sm:pt-8 border-t border-[#1F2833]/80 grid grid-cols-3 gap-2 sm:gap-6 max-w-lg">
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white font-display tabular-nums">
                6+ Years
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 font-mono">Commercial Design</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white font-display">
                Adobe CC
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 font-mono">Ps · Ai · Ae · Pr</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#FF4655] font-display">
                Tier-1
              </div>
              <div className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1 font-mono">Esports & Brands</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Background Gallery Controller Bar & Change BG Option */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-10 z-20 flex flex-wrap items-center gap-1.5 sm:gap-3 bg-[#080B0F]/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#1F2833] shadow-xl max-w-[calc(100%-1.5rem)]">
        <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400 hidden sm:block max-w-[180px] truncate">
          <span className="text-[#FF4655] font-semibold">BG:</span> {bgImages[currentBgIndex]?.title || 'Hero Background'}
        </div>

        {/* Change Background Images Modal Trigger (Admin / Owner Only) */}
        {isAdmin && (
          <button
            onClick={openEditModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white bg-[#0E141B] hover:bg-[#1a232f] border border-[#1F2833] hover:border-[#FF4655] rounded transition-colors"
            title="Change background images with custom links (Owner only)"
          >
            <ImageIcon className="w-3 h-3 text-[#FF4655]" />
            <span>Change BG</span>
          </button>
        )}

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {bgImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBgIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentBgIndex ? 'w-4 bg-[#FF4655]' : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
              }`}
              aria-label={`Show background image ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation arrows and Pause/Play */}
        <div className="flex items-center gap-1 border-l border-[#1F2833] pl-2 ml-1">
          <button
            onClick={handlePrev}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
            aria-label="Previous background"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
            aria-label={isAutoScrolling ? 'Pause scrolling' : 'Play scrolling'}
          >
            {isAutoScrolling ? <Pause className="w-3 h-3 text-[#FF4655]" /> : <Play className="w-3 h-3" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
            aria-label="Next background"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Change Background Images Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0E141B] border border-[#1F2833] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1F2833] bg-[#080B0F]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-[#FF4655] rounded-xs" />
                <h3 className="text-base font-bold text-white font-display">
                  Customize Hero Background Images
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-5 space-y-4">
              <p className="text-xs text-zinc-400">
                Paste any image URL (Discord attachment, Behance, Imgur, Unsplash, or direct image link). Images rotate smoothly across the hero section.
              </p>

              <div className="space-y-3">
                {editingList.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3.5 rounded-xl bg-[#080B0F] border border-[#1F2833] flex flex-col sm:flex-row items-start sm:items-center gap-3.5"
                  >
                    {/* Thumbnail preview */}
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-black border border-[#1F2833] shrink-0">
                      <img
                        src={item.url}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            DEFAULT_HERO_BACKGROUND_IMAGES[0].url;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Image Title / Label"
                        value={item.title}
                        onChange={(e) =>
                          handleUpdateImage(index, 'title', e.target.value)
                        }
                        className="sm:col-span-5 px-2.5 py-1.5 text-xs bg-[#0E141B] border border-[#1F2833] rounded text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                      />
                      <input
                        type="url"
                        required
                        placeholder="https://... image link"
                        value={item.url}
                        onChange={(e) =>
                          handleUpdateImage(index, 'url', e.target.value)
                        }
                        className="sm:col-span-7 px-2.5 py-1.5 text-xs bg-[#0E141B] border border-[#1F2833] rounded text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={editingList.length <= 1}
                      onClick={() => handleDeleteImage(index)}
                      className="text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors p-1"
                      title="Remove this image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add and Reset Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddNewImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white bg-[#080B0F] border border-[#1F2833] hover:border-[#FF4655] rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FF4655]" />
                  <span>Add Another Image</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to 5 Original Key Arts</span>
                </button>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#1F2833] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded transition-all shadow-md shadow-[#FF4655]/30"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <span>Save Backgrounds</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
