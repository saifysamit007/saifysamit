import { useState, useRef } from 'react';
import { ArrowUpRight, Eye, Pencil, Trash2, Images, ZoomIn } from 'lucide-react';
import { ProjectItem } from '../data/portfolioData';

interface ProjectCardProps {
  project: ProjectItem;
  onSelect: (project: ProjectItem) => void;
  onEdit?: (project: ProjectItem) => void;
  onDelete?: (project: ProjectItem) => void;
}

export default function ProjectCard({ project, onSelect, onEdit, onDelete }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const aspectClass =
    project.aspectRatio === '16:9'
      ? 'aspect-[16/9]'
      : project.aspectRatio === '1:1'
      ? 'aspect-square'
      : project.aspectRatio === '3:4'
      ? 'aspect-[3/4]'
      : 'aspect-[4/3]';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply 3D tilt on devices that support hover (prevents jank on mobile/tablet touchscreens)
    if (!cardRef.current || !window.matchMedia('(hover: hover)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const normX = x / (rect.width / 2);
    const normY = y / (rect.height / 2);

    setTilt({
      x: -normY * 8,
      y: normX * 8,
    });
  };

  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: hover)').matches) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const galleryCount = project.gallery ? project.gallery.length : 1;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(project);
        }
      }}
      tabIndex={0}
      role="button"
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
      }}
      aria-label={`View case study for ${project.title}`}
      className="group relative flex flex-col rounded-2xl bg-[#0B1017] border border-[#1F2833] hover:border-[#FF4655] transition-colors duration-300 overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF4655] shadow-lg hover:shadow-2xl hover:shadow-[#FF4655]/15"
    >
      {/* Interactive Glare Layer */}
      {isHovered && (
        <div
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${(tilt.y / 8 + 1) * 50}% ${( -tilt.x / 8 + 1) * 50}%, rgba(255, 70, 85, 0.15), transparent 70%)`,
          }}
          className="absolute inset-0 pointer-events-none z-20"
        />
      )}

      {/* Main Image Container */}
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-black`}>
        <img
          src={project.thumbnail}
          alt={project.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Ambient Dark Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-50 transition-opacity" />

        {/* Top Floating Badge Bar with Category, Thumbnail Niche (Tech/Gaming/Others), Year & Edit Button */}
        <div className="absolute top-3 left-3 right-3 sm:top-3.5 sm:left-3.5 sm:right-3.5 flex items-center justify-between z-30 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 bg-black/80 backdrop-blur-md text-[#FF4655] border border-[#FF4655]/40 rounded font-semibold">
              {project.category}
            </span>

            {/* Prominent Thumbnail Niche Indicator (Gaming / Tech / Others) */}
            {project.category === 'THUMBNAILS' && project.thumbnailType && (
              <span className="text-[9px] sm:text-[10px] font-mono tracking-wider uppercase px-1.5 sm:px-2 py-0.5 bg-[#FF4655]/25 backdrop-blur-md text-white border border-[#FF4655]/70 rounded font-bold shadow-sm">
                {project.thumbnailType === 'GAMING' ? '🎮 Gaming' : project.thumbnailType === 'TECH' ? '⚡ Tech' : '🎬 Others'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Multi-Image Badge */}
            {galleryCount > 1 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-300 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-zinc-700">
                <Images className="w-3 h-3 text-[#FF4655]" />
                <span>{galleryCount}</span>
              </span>
            )}

            {/* Manually Settable Year Badge */}
            <span className="text-[11px] font-mono text-zinc-300 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded border border-zinc-700">
              {project.year || '2026'}
            </span>

            {/* Quick Zoom Artwork Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(project);
              }}
              className="p-1 rounded bg-black/80 hover:bg-[#FF4655] text-zinc-400 hover:text-white border border-zinc-700 hover:border-[#FF4655] transition-colors cursor-pointer"
              title="Zoom into artwork"
              aria-label={`Zoom into ${project.title} artwork`}
            >
              <ZoomIn className="w-3 h-3" />
            </button>

            {/* Direct Edit Button */}
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                className="p-1 rounded bg-black/80 hover:bg-[#FF4655] text-zinc-400 hover:text-white border border-zinc-700 hover:border-[#FF4655] transition-colors"
                title="Edit this project's images, year, and description"
                aria-label={`Edit ${project.title}`}
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}

            {/* Direct Delete Button (Admin Only) */}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(project);
                }}
                className="p-1 rounded bg-black/80 hover:bg-red-600 text-zinc-400 hover:text-white border border-zinc-700 hover:border-red-500 transition-colors"
                title="Delete this project"
                aria-label={`Delete ${project.title}`}
              >
                <Trash2 className="w-3 h-3 text-red-400 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Hover Inspect Indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] rounded shadow-xl shadow-[#FF4655]/30 transform group-hover:scale-105 transition-transform">
            <ZoomIn className="w-3.5 h-3.5" />
            Inspect & Zoom Artwork
          </span>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2 font-mono">
            <span>{project.clientType}</span>
            <span aria-hidden="true">·</span>
            <span>{project.role}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white font-display group-hover:text-[#FF4655] transition-colors line-clamp-1 mb-2">
            {project.title}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-4">
            {project.shortDescription}
          </p>
        </div>

        {/* Bottom Tools & Action Indicator */}
        <div className="pt-4 border-t border-[#1F2833] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span>{project.tools?.[0] || 'Adobe CC'}</span>
            {project.tools && project.tools.length > 1 && (
              <>
                <span aria-hidden="true">·</span>
                <span>+{project.tools.length - 1} more</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-300 group-hover:text-[#FF4655] transition-colors">
            <span>Case Study</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
