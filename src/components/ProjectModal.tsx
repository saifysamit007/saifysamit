import { useState, useEffect, useRef } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Layers,
  Wrench,
  CheckCircle2,
  Pencil,
  Trash2,
  Images,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Move,
  Eye,
  Sliders,
} from 'lucide-react';
import { ProjectItem } from '../data/portfolioData';
import { useAdmin } from '../context/AdminContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onNavigate?: (direction: 'next' | 'prev') => void;
  onEdit?: (project: ProjectItem) => void;
  onDelete?: (project: ProjectItem) => void;
}

export default function ProjectModal({
  project,
  onClose,
  onNavigate,
  onEdit,
  onDelete,
}: ProjectModalProps) {
  const { isAdmin } = useAdmin();
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Image Zoom & Pan State
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 0,
    startY: 0,
  });

  // Dedicated Fullscreen Lightbox Inspector State
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxScale, setLightboxScale] = useState<number>(1);
  const [lightboxPan, setLightboxPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLightboxDragging, setIsLightboxDragging] = useState<boolean>(false);
  const [lightboxDragStart, setLightboxDragStart] = useState<{
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
  }>({ clientX: 0, clientY: 0, startX: 0, startY: 0 });

  // Delete Confirmation Modal State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Reset zoom whenever project changes
  useEffect(() => {
    if (project) {
      setSelectedImage(project.thumbnail);
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
      setLightboxScale(1);
      setLightboxPan({ x: 0, y: 0 });
      setIsLightboxOpen(false);
    }
  }, [project]);

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
          setLightboxScale(1);
          setLightboxPan({ x: 0, y: 0 });
        } else if (isDeleteConfirmOpen) {
          setIsDeleteConfirmOpen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && onNavigate && !isLightboxOpen) {
        onNavigate('next');
      } else if (e.key === 'ArrowLeft' && onNavigate && !isLightboxOpen) {
        onNavigate('prev');
      } else if (e.key === '+' || e.key === '=') {
        if (isLightboxOpen) {
          setLightboxScale((prev) => Math.min(4, +(prev + 0.35).toFixed(2)));
        } else {
          setZoomScale((prev) => Math.min(4, +(prev + 0.35).toFixed(2)));
        }
      } else if (e.key === '-' || e.key === '_') {
        if (isLightboxOpen) {
          setLightboxScale((prev) => {
            const next = Math.max(1, +(prev - 0.35).toFixed(2));
            if (next <= 1) setLightboxPan({ x: 0, y: 0 });
            return next;
          });
        } else {
          setZoomScale((prev) => {
            const next = Math.max(1, +(prev - 0.35).toFixed(2));
            if (next <= 1) setPanOffset({ x: 0, y: 0 });
            return next;
          });
        }
      } else if (e.key === '0') {
        if (isLightboxOpen) {
          setLightboxScale(1);
          setLightboxPan({ x: 0, y: 0 });
        } else {
          setZoomScale(1);
          setPanOffset({ x: 0, y: 0 });
        }
      }
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose, onNavigate, isLightboxOpen, isDeleteConfirmOpen]);

  // Main Card Zoom manipulation handlers
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(4, +(prev + 0.35).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(1, +(prev - 0.35).toFixed(2));
      if (next <= 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      handleResetZoom();
    } else {
      setZoomScale(2);
    }
  };

  // Wheel zoom handler
  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoomScale((prev) => {
      const next = Math.min(4, Math.max(1, +(prev + delta).toFixed(2)));
      if (next <= 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse pan listeners for in-card zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      startX: panOffset.x,
      startY: panOffset.y,
    });
  };

  // Touch pan listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomScale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      clientX: touch.clientX,
      clientY: touch.clientY,
      startX: panOffset.x,
      startY: panOffset.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.clientX;
      const dy = e.clientY - dragStart.clientY;
      const maxOffset = 300 * zoomScale;
      setPanOffset({
        x: Math.max(-maxOffset, Math.min(maxOffset, dragStart.startX + dx)),
        y: Math.max(-maxOffset, Math.min(maxOffset, dragStart.startY + dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.clientX;
      const dy = touch.clientY - dragStart.clientY;
      const maxOffset = 300 * zoomScale;
      setPanOffset({
        x: Math.max(-maxOffset, Math.min(maxOffset, dragStart.startX + dx)),
        y: Math.max(-maxOffset, Math.min(maxOffset, dragStart.startY + dy)),
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, zoomScale]);

  // Lightbox Pan Events
  useEffect(() => {
    if (!isLightboxDragging) return;

    const handleLightboxMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lightboxDragStart.clientX;
      const dy = e.clientY - lightboxDragStart.clientY;
      const maxOffset = 500 * lightboxScale;
      setLightboxPan({
        x: Math.max(-maxOffset, Math.min(maxOffset, lightboxDragStart.startX + dx)),
        y: Math.max(-maxOffset, Math.min(maxOffset, lightboxDragStart.startY + dy)),
      });
    };

    const handleLightboxMouseUp = () => {
      setIsLightboxDragging(false);
    };

    window.addEventListener('mousemove', handleLightboxMouseMove);
    window.addEventListener('mouseup', handleLightboxMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleLightboxMouseMove);
      window.removeEventListener('mouseup', handleLightboxMouseUp);
    };
  }, [isLightboxDragging, lightboxDragStart, lightboxScale]);

  if (!project) return null;

  // Deduplicate and combine thumbnail + gallery images
  const allImages = Array.from(new Set([project.thumbnail, ...(project.gallery || [])]));
  const currentImage = selectedImage || project.thumbnail;
  const currentImageIndex = allImages.indexOf(currentImage);

  const handleSelectGalleryImage = (img: string) => {
    setSelectedImage(img);
    handleResetZoom();
    setLightboxScale(1);
    setLightboxPan({ x: 0, y: 0 });
  };

  const handleNextImage = () => {
    const nextIdx = (currentImageIndex + 1) % allImages.length;
    handleSelectGalleryImage(allImages[nextIdx]);
  };

  const handlePrevImage = () => {
    const prevIdx = (currentImageIndex - 1 + allImages.length) % allImages.length;
    handleSelectGalleryImage(allImages[prevIdx]);
  };

  const handleConfirmDelete = () => {
    if (onDelete && project) {
      onDelete(project);
      setIsDeleteConfirmOpen(false);
      onClose();
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-project-title"
        className="fixed inset-0 z-50 overflow-y-auto bg-black/92 backdrop-blur-xl flex items-start justify-center p-0 sm:p-4 md:p-6"
      >
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

        {/* Modal Container */}
        <div className="relative w-full max-w-5xl bg-[#080B0F] border border-[#1F2833] sm:rounded-2xl shadow-2xl overflow-hidden my-auto z-10">
          {/* Top Control Bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#080B0F]/95 backdrop-blur-md border-b border-[#1F2833]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono tracking-wider uppercase text-[#FF4655] font-bold">
                {project.category}
              </span>
              {project.category === 'THUMBNAILS' && project.thumbnailType && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF4655]/20 text-white border border-[#FF4655]/60 font-semibold">
                  {project.thumbnailType === 'GAMING' ? '🎮 Gaming' : project.thumbnailType === 'TECH' ? '⚡ Tech' : '🎬 Others'}
                </span>
              )}
              <span className="text-zinc-600 hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-xs font-mono text-zinc-400">
                YEAR {project.year || '2026'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Fullscreen Zoom Inspector Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(true);
                  setLightboxScale(1.5);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0E141B] hover:bg-[#FF4655] text-zinc-300 hover:text-white text-xs font-mono transition-colors border border-[#1F2833] hover:border-[#FF4655] cursor-pointer"
                title="Open Fullscreen Zoom Lightbox (Inspect all details)"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#FF4655] group-hover:text-white" />
                <span className="hidden sm:inline">Zoom Artwork</span>
              </button>

              {/* Edit Project Button (Admin / Owner Only) */}
              {isAdmin && onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(project);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0E141B] hover:bg-[#FF4655] text-zinc-300 hover:text-white text-xs font-mono transition-colors border border-[#1F2833] hover:border-[#FF4655] cursor-pointer"
                  title="Edit this project's details, year, or photos"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}

              {/* Delete Project Button (Admin / Owner Only) */}
              {isAdmin && onDelete && (
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white text-xs font-mono transition-colors border border-red-800/60 hover:border-red-500 cursor-pointer"
                  title="Delete this project permanently"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              {onNavigate && (
                <div className="flex items-center gap-1 border-r border-[#1F2833] pr-1.5 sm:pr-2 mr-1 sm:mr-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('prev')}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    aria-label="Previous project"
                    title="Previous project (←)"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('next')}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    aria-label="Next project"
                    title="Next project (→)"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0E141B] hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-medium transition-colors border border-[#1F2833] cursor-pointer"
                aria-label="Close modal"
              >
                <span className="hidden sm:inline">ESC</span>
                <X className="w-3.5 h-3.5 text-[#FF4655]" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
            <div>
              <div className="text-xs font-mono text-zinc-400 mb-2">
                {project.clientType} · {project.role}
              </div>
              <h2
                id="modal-project-title"
                className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight mb-4"
              >
                {project.title}
              </h2>
              <p className="text-base text-zinc-300 leading-relaxed max-w-3xl">
                {project.shortDescription || project.overview}
              </p>
            </div>

            {/* Primary Main Visual Showcase with Interactive Zoom Suite */}
            <div className="space-y-3">
              {/* Zoom & Inspection Control Bar */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0E141B] border border-[#1F2833] text-xs font-mono flex-wrap">
                {/* Left: Zoom Controls */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
                    <ZoomIn className="w-3.5 h-3.5 text-[#FF4655]" />
                    <span>Zoom:</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomScale <= 1}
                    className="p-1.5 rounded bg-[#080B0F] hover:bg-[#1F2833] disabled:opacity-40 text-zinc-300 hover:text-white border border-[#1F2833] transition-colors cursor-pointer"
                    title="Zoom Out (-)"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>

                  <span className="px-2 py-0.5 rounded bg-[#080B0F] text-[11px] font-bold text-white min-w-[50px] text-center border border-[#1F2833]">
                    {Math.round(zoomScale * 100)}%
                  </span>

                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomScale >= 4}
                    className="p-1.5 rounded bg-[#080B0F] hover:bg-[#1F2833] disabled:opacity-40 text-zinc-300 hover:text-white border border-[#1F2833] transition-colors cursor-pointer"
                    title="Zoom In (+)"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  {zoomScale > 1 && (
                    <button
                      type="button"
                      onClick={handleResetZoom}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#080B0F] hover:bg-[#1F2833] text-zinc-400 hover:text-white border border-[#1F2833] text-[11px] transition-colors cursor-pointer ml-1"
                      title="Reset Zoom to 100%"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Right: Fullscreen Lightbox & Hint */}
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-[11px] text-zinc-400">
                    {zoomScale > 1 ? 'Drag to pan · Double-click to reset' : 'Scroll wheel or double-click to zoom'}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLightboxOpen(true);
                      setLightboxScale(1.5);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF4655] hover:bg-[#ff5a68] text-white text-[11px] font-semibold uppercase tracking-wider transition-colors shadow-sm shadow-[#FF4655]/30 cursor-pointer"
                    title="Inspect artwork in full-screen view"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Fullscreen Zoom</span>
                  </button>
                </div>
              </div>

              {/* Main Visual Image Viewport with Drag and Pan */}
              <div
                onWheel={handleWheelZoom}
                onDoubleClick={handleDoubleClick}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className={`relative rounded-xl overflow-hidden border border-[#1F2833] bg-black shadow-2xl flex items-center justify-center min-h-[350px] max-h-[640px] select-none ${
                  zoomScale > 1
                    ? isDragging
                      ? 'cursor-grabbing'
                      : 'cursor-grab'
                    : 'cursor-zoom-in'
                }`}
                title={zoomScale > 1 ? 'Click and drag to pan image' : 'Click to zoom in or scroll mouse wheel'}
              >
                {/* Zoomable Image Element */}
                <div
                  className="w-full h-full flex items-center justify-center will-change-transform"
                  style={{
                    transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomScale})`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  }}
                >
                  <img
                    src={currentImage}
                    alt={project.title}
                    draggable={false}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[640px] object-contain mx-auto bg-black pointer-events-none"
                  />
                </div>

                {/* Floating Tag over Image */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
                  {currentImage === project.thumbnail && (
                    <div className="bg-black/85 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-[#FF4655] border border-[#FF4655]/40 font-semibold shadow-md">
                      Main Cover
                    </div>
                  )}

                  {zoomScale > 1 && (
                    <div className="bg-black/85 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 border border-emerald-500/40 font-semibold shadow-md flex items-center gap-1">
                      <Move className="w-3 h-3" />
                      <span>{Math.round(zoomScale * 100)}% Pan Active</span>
                    </div>
                  )}
                </div>

                {/* Quick Expand Button on bottom-right of image */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                    setLightboxScale(1.5);
                  }}
                  className="absolute bottom-4 right-4 z-20 p-2 rounded-lg bg-black/80 hover:bg-[#FF4655] text-zinc-300 hover:text-white border border-zinc-700 hover:border-[#FF4655] backdrop-blur-md transition-all shadow-xl cursor-pointer"
                  title="Expand to Fullscreen Lightbox"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Multiple Images Selector Strip */}
              {allImages.length > 1 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Images className="w-3.5 h-3.5 text-[#FF4655]" />
                      <span>Project Gallery ({allImages.length} Views) · Click thumbnail to inspect & zoom</span>
                    </span>
                    <span>
                      Viewing {currentImageIndex + 1} of {allImages.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto py-2 no-scrollbar">
                    {allImages.map((img, i) => {
                      const isSelected = img === currentImage;
                      const isMain = img === project.thumbnail;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectGalleryImage(img)}
                          className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#FF4655] shadow-lg shadow-[#FF4655]/20 scale-105'
                              : 'border-[#1F2833] hover:border-zinc-500 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`View ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isMain && (
                            <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-black/90 text-[#FF4655] px-1 rounded">
                              MAIN
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Challenge, Approach & Solution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#1F2833]">
              <div className="p-5 rounded-xl bg-[#0E141B] border border-[#1F2833]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#FF4655] font-bold mb-2">
                  01 · The Challenge
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {project.challenge || 'High-visibility visual impact and commercial differentiation.'}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0E141B] border border-[#1F2833]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#FF4655] font-bold mb-2">
                  02 · Strategic Approach
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {project.approach || 'Precision composition, lighting depth, and high-retention typography hierarchy.'}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0E141B] border border-[#1F2833]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#FF4655] font-bold mb-2">
                  03 · Commercial Solution
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {project.solution || 'Multi-channel production assets exported for digital and live tournament broadcasts.'}
                </p>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="p-6 rounded-xl bg-[#0E141B] border border-[#1F2833] grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Software & Stack
                </div>
                <ul className="text-xs font-medium text-zinc-200 space-y-1">
                  {(project.tools || ['Adobe Photoshop', 'Adobe Illustrator']).map((t) => (
                    <li key={t} className="flex items-center gap-1.5">
                      <Wrench className="w-3 h-3 text-[#FF4655]" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Deliverable Scope
                </div>
                <ul className="text-xs text-zinc-300 space-y-1">
                  {(project.deliverables || ['Key Art', 'Social Banners', 'PSD Source']).map((d) => (
                    <li key={d} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Client Entity & Year
                </div>
                <div className="text-xs font-mono text-red-200 bg-[#080B0F] p-2.5 rounded border border-dashed border-[#1F2833]">
                  {project.client} ({project.year || '2026'})
                </div>
                <div className="text-[11px] text-zinc-400 mt-2">
                  Role: {project.role}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Bottom CTA */}
          <div className="p-6 bg-[#0E141B] border-t border-[#1F2833] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-mono text-zinc-400">
              Interested in a similar commercial deliverable for your organization?
            </p>

            <a
              href="#contact"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded transition-all shadow-md shadow-[#FF4655]/25"
            >
              <span>Commission Visuals</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* DEDICATED FULLSCREEN LIGHTBOX ZOOM MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[130] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 select-none animate-in fade-in duration-200">
          {/* Top Lightbox Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-black/70 backdrop-blur-md rounded-xl border border-zinc-800 z-30">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {project.title}
              </span>
              <span className="text-xs font-mono text-[#FF4655] bg-[#FF4655]/15 px-2 py-0.5 rounded border border-[#FF4655]/30">
                {currentImageIndex + 1} / {allImages.length}
              </span>
            </div>

            {/* Lightbox Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setLightboxScale((prev) => {
                    const next = Math.max(1, +(prev - 0.5).toFixed(2));
                    if (next <= 1) setLightboxPan({ x: 0, y: 0 });
                    return next;
                  })
                }
                disabled={lightboxScale <= 1}
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 border border-zinc-700 transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-bold text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-700 min-w-[50px] text-center">
                {Math.round(lightboxScale * 100)}%
              </span>

              <button
                type="button"
                onClick={() =>
                  setLightboxScale((prev) => Math.min(4, +(prev + 0.5).toFixed(2)))
                }
                disabled={lightboxScale >= 4}
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-200 border border-zinc-700 transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setLightboxScale(1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded transition-colors"
                title="Reset Zoom to 100%"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxScale(1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="p-1.5 rounded-lg bg-[#FF4655] hover:bg-[#ff5a68] text-white transition-colors ml-2"
                title="Close Lightbox (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Image Area with Click & Drag Pan */}
          <div
            onWheel={(e) => {
              e.preventDefault();
              const delta = e.deltaY < 0 ? 0.35 : -0.35;
              setLightboxScale((prev) => {
                const next = Math.min(4, Math.max(1, +(prev + delta).toFixed(2)));
                if (next <= 1) setLightboxPan({ x: 0, y: 0 });
                return next;
              });
            }}
            onMouseDown={(e) => {
              if (lightboxScale <= 1) return;
              e.preventDefault();
              setIsLightboxDragging(true);
              setLightboxDragStart({
                clientX: e.clientX,
                clientY: e.clientY,
                startX: lightboxPan.x,
                startY: lightboxPan.y,
              });
            }}
            className={`flex-1 flex items-center justify-center overflow-hidden relative ${
              lightboxScale > 1
                ? isLightboxDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-zoom-in'
            }`}
            onClick={() => {
              if (lightboxScale === 1) {
                setLightboxScale(2);
              }
            }}
          >
            <div
              className="will-change-transform flex items-center justify-center"
              style={{
                transform: `translate3d(${lightboxPan.x}px, ${lightboxPan.y}px, 0) scale(${lightboxScale})`,
                transition: isLightboxDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              <img
                src={currentImage}
                alt={project.title}
                draggable={false}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-[90vw] object-contain shadow-2xl rounded-lg pointer-events-none"
              />
            </div>

            {/* Left and Right Nav Buttons in Lightbox */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#FF4655] text-white border border-zinc-700 hover:border-[#FF4655] transition-all cursor-pointer shadow-2xl z-20"
                  title="Previous image"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-[#FF4655] text-white border border-zinc-700 hover:border-[#FF4655] transition-all cursor-pointer shadow-2xl z-20"
                  title="Next image"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Lightbox Strip & Instructions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-black/70 backdrop-blur-md rounded-xl border border-zinc-800 z-30">
            <span className="text-xs font-mono text-zinc-400">
              * Click & drag to pan zoomed artwork · Use scroll wheel or + / - keys · ESC to exit
            </span>

            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectGalleryImage(img)}
                    className={`w-14 h-10 rounded overflow-hidden border transition-all ${
                      img === currentImage
                        ? 'border-[#FF4655] scale-110 shadow-lg shadow-[#FF4655]/40'
                        : 'border-zinc-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* In-app Confirmation Modal for Project Deletion */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Commercial Project"
        itemName={project.title}
        message={`Are you sure you want to permanently delete "${project.title}" from your commercial portfolio? This action cannot be undone.`}
        confirmText="Yes, Delete Project"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </>
  );
}
