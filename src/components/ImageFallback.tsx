import React, { useState } from 'react';
import { Film, ImageOff } from 'lucide-react';

interface ImageFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  category?: string;
  title?: string;
}

export const ImageFallback: React.FC<ImageFallbackProps> = ({
  src,
  alt,
  className = '',
  category,
  title,
}) => {
  const [hasError, setHasError] = useState(false);

  // If no source provided or failed to load, display high-fidelity styled CSS fallback
  if (!src || hasError) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-black text-neutral-300 p-6 ${className}`}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F2A900_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-[#F2A900]">
            {src ? <ImageOff className="w-6 h-6" /> : <Film className="w-6 h-6" />}
          </div>
          <span className="text-sm font-semibold text-white tracking-wide truncate max-w-[200px]">
            {title || alt}
          </span>
          <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
            {category || 'Sem imagem'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
};
