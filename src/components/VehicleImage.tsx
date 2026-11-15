import { useState } from 'react';
import { Car as CarIcon } from 'lucide-react';

interface VehicleImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function VehicleImage({ src, alt, className = '' }: VehicleImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <CarIcon className="w-10 h-10 mb-2 text-neutral-400" strokeWidth={1.5} />
        <span className="text-xs font-medium text-neutral-500 px-3 text-center">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
