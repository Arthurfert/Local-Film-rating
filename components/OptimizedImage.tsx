'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-poster.svg',
  ...props
}: OptimizedImageProps) {
  // Mémorise la src qui a échoué plutôt qu'un booléen : quand la src
  // change, on retente automatiquement (pas d'état bloqué sur le
  // placeholder, pas de useEffect -> pas de double rendu/requête).
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <Image
      {...props}
      src={failedSrc !== null && failedSrc === src ? fallbackSrc : src}
      alt={alt}
      onError={() => {
        if (typeof src === 'string') setFailedSrc(src);
      }}
    />
  );
}
