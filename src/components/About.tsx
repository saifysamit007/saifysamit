import { useState, useEffect, useRef } from 'react';
import {
  Mail,
  MapPin,
  Clock,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Camera,
  X,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  RefreshCw,
} from 'lucide-react';
import { ARTIST_PROFILE, CORE_TOOLS } from '../data/portfolioData';
import { useAdmin, getAdminAuthHeaders } from '../context/AdminContext';

interface PortraitFraming {
  x: number; // percentage or pixel offset
  y: number;
  scale: number;
}

const DEFAULT_FRAMING: PortraitFraming = {
  x: 0,
  y: 0,
  scale: 1.12,
};

export default function About() {
  const { isAdmin } = useAdmin();

  // Load custom portrait image or default
  const [portraitUrl, setPortraitUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('saify_portrait_image_url');
      if (saved && saved.trim().length > 0) return saved.trim();
    } catch {}
    return ARTIST_PROFILE.portraitImage;
  });

  // Modal State for Changing Photo
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState(false);
  const [newPhotoInput, setNewPhotoInput] = useState('');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved framing from localStorage
  const [framing, setFraming] = useState<PortraitFraming>(() => {
    try {
      const saved = localStorage.getItem('saify_portrait_framing');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number' && typeof parsed.scale === 'number') {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_FRAMING;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ clientX: 0, clientY: 0, startX: 0, startY: 0 });
  const [showControls, setShowControls] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync framing and portrait image with zero-token database on mount
  useEffect(() => {
    fetch('/api/portrait-framing')
      .then((res) => res.json())
      .then((data) => {
        if (data?.framing && typeof data.framing.x === 'number') {
          setFraming(data.framing);
          try {
            localStorage.setItem('saify_portrait_framing', JSON.stringify(data.framing));
          } catch {}
        }
      })
      .catch(() => {});

    fetch('/api/portrait-image')
      .then((res) => res.json())
      .then((data) => {
        if (data?.image && typeof data.image === 'string' && data.image.trim().length > 0) {
          setPortraitUrl(data.image.trim());
          try {
            localStorage.setItem('saify_portrait_image_url', data.image.trim());
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenChangePhoto = () => {
    setNewPhotoInput(portraitUrl);
    setPhotoError(null);
    setIsChangePhotoOpen(true);
  };

  // Handle local file upload (converts to base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG, WEBP, or SVG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setPhotoError('Image size exceeds 8MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewPhotoInput(result);
        setPhotoError(null);
      }
    };
    reader.onerror = () => {
      setPhotoError('Could not read image from device. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoInput.trim()) {
      setPhotoError('Please provide a valid image URL or upload a photo.');
      return;
    }

    const trimmed = newPhotoInput.trim();
    setPortraitUrl(trimmed);
    try {
      localStorage.setItem('saify_portrait_image_url', trimmed);
    } catch {}

    fetch('/api/portrait-image', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ image: trimmed }),
    }).catch(() => {});

    setIsChangePhotoOpen(false);
  };

  const handleResetPhoto = () => {
    setPortraitUrl(ARTIST_PROFILE.portraitImage);
    try {
      localStorage.removeItem('saify_portrait_image_url');
    } catch {}

    fetch('/api/portrait-image/reset', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    }).catch(() => {});
    setIsChangePhotoOpen(false);
  };

  // Save framing whenever it changes
  const saveFraming = (newFraming: PortraitFraming) => {
    setFraming(newFraming);
    try {
      localStorage.setItem('saify_portrait_framing', JSON.stringify(newFraming));
    } catch {}

    fetch('/api/portrait-framing', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ framing: newFraming }),
    }).catch(() => {});

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1500);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      startX: framing.x,
      startY: framing.y,
    });
  };

  // Touch drag handlers for mobile & tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        clientX: touch.clientX,
        clientY: touch.clientY,
        startX: framing.x,
        startY: framing.y,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = (e.clientX - dragStart.clientX) * 0.45;
      const deltaY = (e.clientY - dragStart.clientY) * 0.45;

      const maxOffset = 65 * framing.scale;
      const clampedX = Math.max(-maxOffset, Math.min(maxOffset, dragStart.startX + deltaX));
      const clampedY = Math.max(-maxOffset, Math.min(maxOffset, dragStart.startY + deltaY));

      setFraming((prev) => ({
        ...prev,
        x: Math.round(clampedX),
        y: Math.round(clampedY),
      }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const deltaX = (touch.clientX - dragStart.clientX) * 0.45;
      const deltaY = (touch.clientY - dragStart.clientY) * 0.45;

      const maxOffset = 65 * framing.scale;
      const clampedX = Math.max(-maxOffset, Math.min(maxOffset, dragStart.startX + deltaX));
      const clampedY = Math.max(-maxOffset, Math.min(maxOffset, dragStart.startY + deltaY));

      setFraming((prev) => ({
        ...prev,
        x: Math.round(clampedX),
        y: Math.round(clampedY),
      }));
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        try {
          localStorage.setItem('saify_portrait_framing', JSON.stringify(framing));
        } catch {}
        fetch('/api/portrait-framing', {
          method: 'POST',
          headers: getAdminAuthHeaders(),
          body: JSON.stringify({ framing }),
        }).catch(() => {});
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1200);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        try {
          localStorage.setItem('saify_portrait_framing', JSON.stringify(framing));
        } catch {}
        fetch('/api/portrait-framing', {
          method: 'POST',
          headers: getAdminAuthHeaders(),
          body: JSON.stringify({ framing }),
        }).catch(() => {});
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1200);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, framing]);

  // Zoom controls
  const handleZoomIn = () => {
    const nextScale = Math.min(2.5, +(framing.scale + 0.1).toFixed(2));
    saveFraming({ ...framing, scale: nextScale });
  };

  const handleZoomOut = () => {
    const nextScale = Math.max(1.0, +(framing.scale - 0.1).toFixed(2));
    saveFraming({ ...framing, scale: nextScale });
  };

  const handleResetFraming = () => {
    saveFraming(DEFAULT_FRAMING);
  };

  return (
    <section id="about" className="py-16 sm:py-24 bg-[#0A0E14] border-t border-[#1F2833]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left Column: Interactive Draggable Portrait */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              {/* Photo Framing & Change Control Bar (Admin Only) */}
              {isAdmin && (
                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  <span className="text-[11px] font-mono text-[#FF4655] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5" />
                    <span>Portrait Controls</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenChangePhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors border bg-[#FF4655] text-white border-[#FF4655] hover:bg-[#ff5a68] cursor-pointer shadow-md shadow-[#FF4655]/25"
                      title="Change Samit's portrait picture (Upload or URL)"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Picture</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowControls(!showControls)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                        showControls
                          ? 'bg-[#1F2833] text-white border-[#FF4655]'
                          : 'bg-[#0E141B] text-zinc-300 border-[#1F2833] hover:border-zinc-500'
                      }`}
                      title="Toggle framing crop and zoom tools"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{showControls ? 'Hide Crop' : 'Adjust Crop'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Toolbar when active (Admin Only) */}
              {isAdmin && showControls && (
                <div className="mb-3 p-2.5 rounded-xl bg-[#0E141B] border border-[#FF4655]/40 shadow-xl flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1 text-xs font-mono">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      className="p-1.5 rounded bg-[#080B0F] hover:bg-[#1F2833] text-zinc-300 hover:text-white border border-[#1F2833] transition-colors"
                      title="Zoom out"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1 text-[11px] text-zinc-300 min-w-[42px] text-center font-bold">
                      {Math.round(framing.scale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      className="p-1.5 rounded bg-[#080B0F] hover:bg-[#1F2833] text-zinc-300 hover:text-white border border-[#1F2833] transition-colors"
                      title="Zoom in"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleResetFraming}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#080B0F] hover:bg-[#1F2833] text-zinc-400 hover:text-white border border-[#1F2833] text-[11px] transition-colors"
                      title="Reset framing to default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>

                    {saveSuccess && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 animate-in fade-in">
                        <Check className="w-3 h-3" /> Saved!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Main Portrait Frame with Interactive Drag (Drag enabled for Admin only) */}
              <div
                ref={containerRef}
                onMouseDown={isAdmin ? handleMouseDown : undefined}
                onTouchStart={isAdmin ? handleTouchStart : undefined}
                className={`relative aspect-[4/5] rounded-2xl overflow-hidden bg-black border-2 transition-colors select-none shadow-2xl group ${
                  isAdmin
                    ? isDragging
                      ? 'border-[#FF4655] cursor-grabbing shadow-[#FF4655]/25'
                      : 'border-[#1F2833] hover:border-[#FF4655]/60 cursor-grab'
                    : 'border-[#1F2833]'
                }`}
                title={isAdmin ? "Click and drag to reposition image crop" : undefined}
              >
                {/* Repositionable Image Element with CSS Transform */}
                <div
                  className="w-full h-full will-change-transform pointer-events-none"
                  style={{
                    transform: `translate3d(${framing.x}px, ${framing.y}px, 0) scale(${framing.scale})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  }}
                >
                  <img
                    src={portraitUrl}
                    alt="Saify Samit portrait"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center filter contrast-105"
                  />
                </div>

                {/* Dark Vignette Overlay for typography legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent pointer-events-none" />

                {/* Admin Quick Action Button to Change Photo */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChangePhoto();
                    }}
                    className="absolute top-3 left-3 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-white bg-[#FF4655] hover:bg-[#ff5a68] border border-red-400 rounded-full backdrop-blur-md transition-all shadow-xl cursor-pointer"
                    title="Change portrait photo (Upload or URL)"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Picture</span>
                  </button>
                )}

                {/* Live Draggable Helper Tag (Admin Only) */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 pointer-events-none z-20">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-full backdrop-blur-md border transition-all ${
                      isDragging
                        ? 'bg-[#FF4655] text-white border-[#FF4655] shadow-lg shadow-[#FF4655]/40 scale-105'
                        : 'bg-black/75 text-zinc-300 border-zinc-700/80'
                    }`}>
                      <Move className="w-3 h-3 text-[#FF4655]" />
                      <span>{isDragging ? 'Repositioning...' : 'Drag to crop'}</span>
                    </span>
                  </div>
                )}

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5 pointer-events-none z-20">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#FF4655] mb-1 font-bold">
                    STUDIO PORTRAIT · 2026
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                    {ARTIST_PROFILE.name}
                  </h3>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {ARTIST_PROFILE.title} · Age 22
                  </div>
                </div>
              </div>

              {/* Fast Facts Badge */}
              <div className="mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-xl bg-[#0E141B] border border-[#1F2833] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Clock className="w-4 h-4 text-[#FF4655] shrink-0" />
                  <span>6+ Years Active Experience</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Remote / Worldwide</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Bio */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF4655] font-bold mb-3 block">
              BACKGROUND & PHILOSOPHY
            </span>

            <blockquote className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-snug mb-6">
              "Design is not decoration. It is communication with commercial intent."
            </blockquote>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6 font-normal">
              {ARTIST_PROFILE.editorialPhilosophy}
            </p>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
              Based in Chittagong, Bangladesh, operating internationally for organizations, competitive esports franchises, high-growth commercial enterprises, and high-visibility digital content brands. Every deliverable is backed by structured layered files, high turnaround velocity, and strict production compliance.
            </p>

            {/* Core Software Mastered Strip */}
            <div className="pt-6 border-t border-[#1F2833]">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-4">
                Primary Software & Specialized Roles:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {CORE_TOOLS.map((tool) => (
                  <div
                    key={tool.name}
                    className="p-3 rounded-xl bg-[#0E141B] border border-[#1F2833] hover:border-[#FF4655]/40 transition-colors"
                  >
                    <div className="text-xs font-bold text-white font-display">
                      {tool.name}
                    </div>
                    <div className="text-[10px] text-[#FF4655] font-mono mt-0.5">
                      {tool.tag}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Portrait Picture Modal (Admin Only) */}
      {isChangePhotoOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0E141B] border border-[#FF4655]/40 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#1F2833]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF4655]/15 border border-[#FF4655]/40 flex items-center justify-center text-[#FF4655]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">
                    Change Samit's Portrait Picture
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Upload from device or enter image URL
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChangePhotoOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="space-y-4">
              {/* Option 1: Upload from Device */}
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-200 mb-1.5 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#FF4655]" />
                  <span>Option A: Upload Image from Device</span>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 border border-dashed border-[#FF4655]/50 hover:border-[#FF4655] rounded-xl bg-[#080B0F] hover:bg-[#FF4655]/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#FF4655]" />
                  <span>Choose Photo from Device / Phone</span>
                </button>
              </div>

              {/* Option 2: Direct Image URL */}
              <div>
                <label className="block text-xs font-mono font-semibold text-zinc-200 mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#FF4655]" />
                  <span>Option B: Direct Image URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or Discord / Imgur direct image link"
                  value={newPhotoInput}
                  onChange={(e) => {
                    setNewPhotoInput(e.target.value);
                    setPhotoError(null);
                  }}
                  className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                />
              </div>

              {/* Live Preview Box */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 mb-1.5">Live Preview:</span>
                <div className="w-28 h-36 rounded-xl overflow-hidden border-2 border-[#FF4655]/50 bg-black mx-auto relative shadow-xl">
                  <img
                    src={newPhotoInput || portraitUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={() => setPhotoError('Could not load image from this URL. Please verify direct image link or upload a file.')}
                  />
                </div>
              </div>

              {photoError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#FF4655]" />
                  <span>{photoError}</span>
                </div>
              )}

              {/* Quick Presets */}
              <div className="pt-2 border-t border-[#1F2833]">
                <span className="block text-[10px] font-mono text-zinc-400 mb-2">Quick Presets:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPhotoInput(ARTIST_PROFILE.portraitImage);
                      setPhotoError(null);
                    }}
                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#080B0F] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#1F2833] transition-colors cursor-pointer"
                  >
                    Original Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPhotoInput('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80');
                      setPhotoError(null);
                    }}
                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#080B0F] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#1F2833] transition-colors cursor-pointer"
                  >
                    Studio Creator
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPhotoInput('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80');
                      setPhotoError(null);
                    }}
                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#080B0F] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#1F2833] transition-colors cursor-pointer"
                  >
                    Cinematic Shot
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1F2833]">
                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                  title="Reset back to original portrait"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangePhotoOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-[#080B0F] border border-[#1F2833] rounded transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded transition-all shadow-md shadow-[#FF4655]/25 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply Picture</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
