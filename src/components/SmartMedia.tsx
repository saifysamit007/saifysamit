import React, { useState } from 'react';
import { Film, Image as ImageIcon } from 'lucide-react';

export interface SmartMediaProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  aspectClass?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  priority?: boolean;
  onClick?: () => void;
  fallbackTitle?: string;
}

/**
 * Checks if a given media URL represents a video stream or file.
 * Handles ImageKit video transformations, direct mp4/webm/mov/ogg/m4v URLs,
 * and data URLs.
 */
export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.split('?')[0].toLowerCase();
  
  // Direct video extensions
  if (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.m3u8')
  ) {
    return true;
  }

  // ImageKit video paths or query flags
  const lowerFull = url.toLowerCase();
  if (
    lowerFull.includes('ik-video') ||
    lowerFull.includes('/video/') ||
    lowerFull.includes('format=mp4') ||
    lowerFull.includes('format=webm') ||
    lowerFull.includes('tr=f-mp4') ||
    lowerFull.includes('f-mp4')
  ) {
    return true;
  }

  return false;
}

/**
 * Normalizes media URLs for robust production loading.
 * Fixes missing protocols, handles ImageKit spaces and encoding.
 */
export function normalizeMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  let trimmed = url.trim();

  // If path was an unbundled /src/assets/images/ reference, route to /images/
  if (trimmed.startsWith('/src/assets/images/')) {
    trimmed = trimmed.replace('/src/assets/images/', '/images/');
  }

  // If user pasted url starting with ik.imagekit.io without https://
  if (trimmed.startsWith('ik.imagekit.io/')) {
    trimmed = `https://${trimmed}`;
  }

  // Handle unencoded spaces in ImageKit and CDN URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Replace raw spaces with %20
    trimmed = trimmed.replace(/ /g, '%20');
  }

  return trimmed;
}

export const SmartMedia: React.FC<SmartMediaProps> = ({
  src,
  alt = 'Media asset',
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full h-full overflow-hidden bg-black',
  aspectClass = '',
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  playsInline = true,
  priority = false,
  onClick,
  fallbackTitle,
}) => {
  const [hasError, setHasError] = useState(false);
  const [retryUrl, setRetryUrl] = useState<string | null>(null);

  const initialNormalized = normalizeMediaUrl(src);
  const currentSrc = retryUrl !== null ? retryUrl : initialNormalized;
  const isVideo = isVideoUrl(currentSrc);

  const handleError = () => {
    // If URL has query params (like ?updatedAt=...), retry once without query params
    if (!retryUrl && currentSrc && currentSrc.includes('?')) {
      const cleanUrl = currentSrc.split('?')[0];
      setRetryUrl(cleanUrl);
      return;
    }
    setHasError(true);
  };

  if (!currentSrc || hasError) {
    return (
      <div
        className={`${containerClassName} ${aspectClass} flex flex-col items-center justify-center p-4 bg-[#0A0E14] text-zinc-500 border border-[#1F2833]/50 select-none`}
        onClick={onClick}
      >
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
          {isVideo ? (
            <Film className="w-5 h-5 text-[#FF4655]" />
          ) : (
            <ImageIcon className="w-5 h-5 text-[#FF4655]" />
          )}
        </div>
        <span className="text-[11px] font-mono font-medium text-zinc-400 text-center line-clamp-1">
          {fallbackTitle || alt || 'Visual Showcase'}
        </span>
        <span className="text-[9px] font-mono text-zinc-600 mt-0.5">
          {hasError ? 'Link Unreachable · High-res fallback active' : 'TSAM Creative Media'}
        </span>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className={`${containerClassName} ${aspectClass}`} onClick={onClick}>
        <video
          src={currentSrc}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          playsInline={playsInline}
          preload={priority ? 'auto' : 'metadata'}
          className={className}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className={`${containerClassName} ${aspectClass}`} onClick={onClick}>
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        className={className}
        onError={handleError}
      />
    </div>
  );
};

export default SmartMedia;
