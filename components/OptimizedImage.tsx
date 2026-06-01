'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src as string);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src as string);
    setHasError(false);
  }, [src]);

  const resolvedFallback =
    fallbackSrc ||
    (typeof src === 'string' && src.includes('backdrop')
      ? '/placeholder-backdrop.svg'
      : '/placeholder-poster.svg');

  return (
    <Image
      {...props}
      src={hasError ? resolvedFallback : imgSrc}
      alt={alt}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
    />
  );
}
